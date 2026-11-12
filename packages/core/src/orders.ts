/**
 * orders.ts — durable order store for the paid flow.
 *
 * Workers are stateless and can be evicted between checkout and webhook, so pending
 * orders cannot live in a module-level Map. The first launch uses R2 as a small JSON
 * store (one object per order) until the Postgres schema is wired. If R2 is not
 * configured (local dev), it falls back to an in-memory Map so the UI still works.
 *
 * Order lifecycle:
 *   pending → paid → refunded
 * A job/order API route must find a paid order and consume its allowance before it
 * starts any AI work. This is the paid-only gate the sites promise.
 */
import { isR2Configured, presignGet, presignPut } from "./r2";
import { getProcessEnv, type EnvSource } from "./env";
import { HEADSHOT_PLANS, VOICE_PLANS } from "./pricing";

export type OrderSite = "voice" | "headshot";
export type OrderStatus = "pending" | "paid" | "refunded" | "failed";

export interface OrderRecord {
  id: string;
  site: OrderSite;
  status: OrderStatus;
  planId: string;
  productId?: string;
  amountCents: number;
  currency: "USD";
  email?: string;
  /** voice: minutes; headshot: images */
  unitsGranted: number;
  unitsUsed: number;
  provider: "waffo";
  providerSessionId?: string;
  providerOrderId?: string;
  checkoutUrl?: string;
  successUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  paidAt?: string;
  refundedAt?: string;
}

const memGlobal = globalThis as unknown as { __paidOrders?: Map<string, OrderRecord> };
const mem = memGlobal.__paidOrders ?? (memGlobal.__paidOrders = new Map());

function orderKey(site: OrderSite, id: string): string {
  return `orders/${site}/${id}.json`;
}

function newOrderId(): string {
  return `ord_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function planFor(site: OrderSite, planId: string): { amountCents: number; units: number; billing: "one-time" | "monthly" | "annual"; productEnv: string } | null {
  if (site === "voice") {
    const plan = VOICE_PLANS.find((p) => p.id === planId);
    if (!plan) return null;
    const envKey: Record<string, string> = {
      "voice-trial": "WAFFO_PRODUCT_ID_VOICE_TRIAL",
      "voice-starter": "WAFFO_PRODUCT_ID_VOICE_STARTER",
      "voice-pro": "WAFFO_PRODUCT_ID_VOICE_PRO",
      "voice-annual": "WAFFO_PRODUCT_ID_VOICE_ANNUAL",
    };
    return {
      amountCents: Math.round(plan.price * 100),
      units: plan.minutes,
      billing: plan.billing === "one-time" ? "one-time" : plan.billing === "annual" ? "annual" : "monthly",
      productEnv: envKey[planId],
    };
  }
  const plan = HEADSHOT_PLANS.find((p) => p.id === planId);
  if (!plan) return null;
  const envKey: Record<string, string> = {
    "headshot-trial": "WAFFO_PRODUCT_ID_HEADSHOT_TRIAL",
    "headshot-40": "WAFFO_PRODUCT_ID_HEADSHOT_40",
    "headshot-60": "WAFFO_PRODUCT_ID_HEADSHOT_60",
    "headshot-100": "WAFFO_PRODUCT_ID_HEADSHOT_100",
  };
  return { amountCents: Math.round(plan.price * 100), units: plan.images, billing: "one-time", productEnv: envKey[planId] };
}

export function productIdForPlan(site: OrderSite, planId: string, source: EnvSource = getProcessEnv()): string | undefined {
  const plan = planFor(site, planId);
  if (!plan) return undefined;
  return source[plan.productEnv] || undefined;
}

export function planInfo(site: OrderSite, planId: string): { amountCents: number; units: number; billing: "one-time" | "monthly" | "annual" } | null {
  const plan = planFor(site, planId);
  return plan ? { amountCents: plan.amountCents, units: plan.units, billing: plan.billing } : null;
}

async function readR2Json(key: string): Promise<OrderRecord | null> {
  if (!isR2Configured()) return null;
  try {
    const signed = await presignGet(key, { expiresIn: 120, strict: true });
    const res = await fetch(signed.url, { cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return (await res.json()) as OrderRecord;
  } catch {
    return null;
  }
}

async function writeR2Json(key: string, value: unknown): Promise<boolean> {
  if (!isR2Configured()) return false;
  try {
    const body = JSON.stringify(value);
    const signed = await presignPut(key, { expiresIn: 120, contentType: "application/json", strict: true });
    const res = await fetch(signed.url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body,
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function createOrder(input: {
  site: OrderSite;
  planId: string;
  email?: string;
  productId?: string;
  providerSessionId?: string;
  checkoutUrl?: string;
  successUrl?: string;
  metadata?: Record<string, unknown>;
}): Promise<OrderRecord> {
  const info = planInfo(input.site, input.planId);
  if (!info) throw new Error(`unknown plan ${input.site}/${input.planId}`);
  const order: OrderRecord = {
    id: newOrderId(),
    site: input.site,
    status: "pending",
    planId: input.planId,
    productId: input.productId,
    amountCents: info.amountCents,
    currency: "USD",
    email: input.email?.trim().toLowerCase(),
    unitsGranted: info.units,
    unitsUsed: 0,
    provider: "waffo",
    providerSessionId: input.providerSessionId,
    checkoutUrl: input.checkoutUrl,
    successUrl: input.successUrl,
    metadata: input.metadata,
    createdAt: new Date().toISOString(),
  };
  mem.set(order.id, order);
  await writeR2Json(orderKey(order.site, order.id), order);
  return order;
}

export async function getOrder(site: OrderSite, id: string): Promise<OrderRecord | null> {
  const local = mem.get(id);
  if (local) return local;
  const stored = await readR2Json(orderKey(site, id));
  if (stored) mem.set(id, stored);
  return stored;
}

export async function updateOrder(
  site: OrderSite,
  id: string,
  patch: Partial<OrderRecord>,
): Promise<OrderRecord | null> {
  const current = await getOrder(site, id);
  if (!current) return null;
  const next: OrderRecord = { ...current, ...patch, id: current.id, site: current.site };
  mem.set(id, next);
  await writeR2Json(orderKey(site, id), next);
  return next;
}

export async function markOrderPaid(
  site: OrderSite,
  id: string,
  patch: { providerOrderId?: string; email?: string; metadata?: Record<string, unknown> } = {},
): Promise<OrderRecord | null> {
  const current = await getOrder(site, id);
  if (!current) return null;
  if (current.status === "paid") return current;
  return updateOrder(site, id, {
    status: "paid",
    paidAt: new Date().toISOString(),
    providerOrderId: patch.providerOrderId ?? current.providerOrderId,
    email: patch.email ?? current.email,
    metadata: { ...current.metadata, ...patch.metadata },
  });
}

export async function markOrderRefunded(site: OrderSite, id: string): Promise<OrderRecord | null> {
  return updateOrder(site, id, { status: "refunded", refundedAt: new Date().toISOString() });
}

/** Check that an order is paid and has enough remaining allowance. */
export async function checkOrderAllowance(
  site: OrderSite,
  id: string,
  requestedUnits: number,
): Promise<{ ok: true; order: OrderRecord } | { ok: false; reason: "not_found" | "unpaid" | "insufficient"; order?: OrderRecord }> {
  const order = await getOrder(site, id);
  if (!order) return { ok: false, reason: "not_found" };
  if (order.status !== "paid") return { ok: false, reason: "unpaid", order };
  const remaining = Math.max(0, order.unitsGranted - order.unitsUsed);
  if (remaining < requestedUnits) return { ok: false, reason: "insufficient", order };
  return { ok: true, order };
}

/** Consume allowance once a job is accepted. This is intentionally best-effort in R2; a duplicate webhook cannot double-grant. */
export async function consumeOrderAllowance(site: OrderSite, id: string, units: number): Promise<OrderRecord | null> {
  const current = await getOrder(site, id);
  if (!current || current.status !== "paid") return null;
  const used = Math.min(current.unitsGranted, current.unitsUsed + Math.max(1, Math.ceil(units)));
  return updateOrder(site, id, { unitsUsed: used });
}
