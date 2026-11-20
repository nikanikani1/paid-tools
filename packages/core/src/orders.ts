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
import { HEADSHOT_PLANS, HAIR_PLANS, LANDSCAPE_PLANS, VOICE_PLANS } from "./pricing";

export type OrderSite = "voice" | "headshot" | "landscape" | "haircolor";
export type OrderStatus = "pending" | "paid" | "refunded" | "failed";
export type ReservationStatus = "reserved" | "confirmed" | "refunded";

/**
 * A single allowance hold, keyed by reservationId (we use the job id for voice jobs).
 * `reserved` = held before the AI call, `confirmed` = charged after the job succeeded,
 * `refunded` = released because the job failed/was canceled (no units charged).
 */
export interface ReservationRecord {
  units: number;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
  jobId?: string;
  note?: string;
}

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
  /** Units currently held by in-flight jobs (paid but not yet confirmed/refunded). */
  unitsReserved?: number;
  /** Append-only-ish reservation ledger keyed by reservationId, so retries stay idempotent. */
  reservations?: Record<string, ReservationRecord>;
  /** job ids created against this order (newest last). Used by the order-recovery page. */
  jobIds?: string[];
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
  if (site === "landscape") {
    const plan = LANDSCAPE_PLANS.find((p) => p.id === planId);
    if (!plan) return null;
    return { amountCents: Math.round(plan.price * 100), units: plan.images, billing: "one-time", productEnv: "WAFFO_PRODUCT_ID_LANDSCAPE_PACK" };
  }
  if (site === "haircolor") {
    const plan = HAIR_PLANS.find((p) => p.id === planId);
    if (!plan) return null;
    return { amountCents: Math.round(plan.price * 100), units: plan.images, billing: "one-time", productEnv: "WAFFO_PRODUCT_ID_HAIR_PACK" };
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
  if (orderUsage(order).remaining < requestedUnits) return { ok: false, reason: "insufficient", order };
  return { ok: true, order };
}

export interface OrderUsage {
  granted: number;
  used: number;
  reserved: number;
  remaining: number;
}

/** Read-only allowance view. `remaining` excludes units held by in-flight jobs. */
export function orderUsage(order: OrderRecord): OrderUsage {
  const granted = Math.max(0, order.unitsGranted);
  const used = Math.max(0, order.unitsUsed);
  const reserved = Math.max(0, order.unitsReserved ?? 0);
  return { granted, used, reserved, remaining: Math.max(0, granted - used - reserved) };
}

function sumReserved(reservations: Record<string, ReservationRecord>): number {
  return Object.values(reservations).reduce(
    (total, reservation) => total + (reservation.status === "reserved" ? Math.max(0, reservation.units) : 0),
    0,
  );
}

export type ReserveAllowanceResult =
  | { ok: true; order: OrderRecord; reservationId: string; alreadyReserved: boolean }
  | {
      ok: false;
      reason: "invalid" | "not_found" | "unpaid" | "insufficient" | "already_confirmed";
      order?: OrderRecord;
    };

/**
 * Reserve (hold) units before starting an AI job. Idempotent per reservationId:
 * retrying the same reservation while it is still held returns ok without double-holding;
 * retrying after a refund is allowed (the failed attempt returned the units).
 * A confirmed reservation cannot be reserved again — that would run a second free job.
 */
export async function reserveOrderAllowance(
  site: OrderSite,
  id: string,
  units: number,
  reservationId: string,
  note?: string,
): Promise<ReserveAllowanceResult> {
  const requested = Math.ceil(units);
  if (!reservationId || !Number.isFinite(requested) || requested <= 0) {
    return { ok: false, reason: "invalid" };
  }
  const current = await getOrder(site, id);
  if (!current) return { ok: false, reason: "not_found" };
  if (current.status !== "paid") return { ok: false, reason: "unpaid", order: current };

  const reservations: Record<string, ReservationRecord> = { ...(current.reservations ?? {}) };
  const existing = reservations[reservationId];
  if (existing?.status === "confirmed") return { ok: false, reason: "already_confirmed", order: current };
  if (existing?.status === "reserved") {
    if (existing.units !== requested) return { ok: false, reason: "invalid", order: current };
    return { ok: true, order: current, reservationId, alreadyReserved: true };
  }

  if (orderUsage(current).remaining < requested) return { ok: false, reason: "insufficient", order: current };

  const now = new Date().toISOString();
  reservations[reservationId] = {
    units: requested,
    status: "reserved",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    jobId: reservationId,
    ...(note ? { note } : {}),
  };
  const next = await updateOrder(site, id, {
    reservations,
    unitsReserved: sumReserved(reservations),
  });
  if (!next) return { ok: false, reason: "not_found" };
  return { ok: true, order: next, reservationId, alreadyReserved: false };
}

export type ConfirmAllowanceResult =
  | { ok: true; order: OrderRecord; alreadyConfirmed: boolean }
  | { ok: false; reason: "not_found" | "unpaid" | "no_reservation" | "refunded"; order?: OrderRecord };

/**
 * Charge a held reservation after the job reached `done`. Idempotent: calling it again
 * returns alreadyConfirmed without increasing unitsUsed.
 */
export async function confirmOrderAllowance(
  site: OrderSite,
  id: string,
  reservationId: string,
): Promise<ConfirmAllowanceResult> {
  const current = await getOrder(site, id);
  if (!current) return { ok: false, reason: "not_found" };
  if (current.status !== "paid") return { ok: false, reason: "unpaid", order: current };
  const reservations: Record<string, ReservationRecord> = { ...(current.reservations ?? {}) };
  const existing = reservations[reservationId];
  if (!existing) return { ok: false, reason: "no_reservation", order: current };
  if (existing.status === "confirmed") return { ok: true, order: current, alreadyConfirmed: true };
  if (existing.status === "refunded") return { ok: false, reason: "refunded", order: current };

  reservations[reservationId] = { ...existing, status: "confirmed", updatedAt: new Date().toISOString() };
  const unitsUsed = Math.min(current.unitsGranted, Math.max(0, current.unitsUsed) + Math.max(0, existing.units));
  const next = await updateOrder(site, id, {
    reservations,
    unitsReserved: sumReserved(reservations),
    unitsUsed,
  });
  if (!next) return { ok: false, reason: "not_found" };
  return { ok: true, order: next, alreadyConfirmed: false };
}

export type RefundAllowanceResult =
  | { ok: true; order: OrderRecord; alreadyRefunded: boolean }
  | { ok: false; reason: "not_found" | "no_reservation" | "confirmed"; order?: OrderRecord };

/**
 * Release a held reservation because the job failed/canceled. Idempotent. Units that were
 * already confirmed are never silently un-charged here (returns reason "confirmed").
 */
export async function refundOrderAllowance(
  site: OrderSite,
  id: string,
  reservationId: string,
  note?: string,
): Promise<RefundAllowanceResult> {
  const current = await getOrder(site, id);
  if (!current) return { ok: false, reason: "not_found" };
  const reservations: Record<string, ReservationRecord> = { ...(current.reservations ?? {}) };
  const existing = reservations[reservationId];
  if (!existing) return { ok: false, reason: "no_reservation", order: current };
  if (existing.status === "refunded") return { ok: true, order: current, alreadyRefunded: true };
  if (existing.status === "confirmed") return { ok: false, reason: "confirmed", order: current };

  reservations[reservationId] = {
    ...existing,
    status: "refunded",
    updatedAt: new Date().toISOString(),
    ...(note ? { note } : {}),
  };
  const next = await updateOrder(site, id, {
    reservations,
    unitsReserved: sumReserved(reservations),
  });
  if (!next) return { ok: false, reason: "not_found" };
  return { ok: true, order: next, alreadyRefunded: false };
}

/** Record that a job belongs to an order (idempotent). Used by the order-recovery page. */
export async function appendOrderJob(site: OrderSite, id: string, jobId: string): Promise<boolean> {
  const current = await getOrder(site, id);
  if (!current) return false;
  const jobIds = current.jobIds ?? [];
  if (jobIds.includes(jobId)) return true;
  const next = await updateOrder(site, id, { jobIds: [...jobIds, jobId] });
  return Boolean(next);
}

/**
 * Safety net for a worker crash between reserve and job creation: release holds older than
 * maxAgeMs that no route has confirmed/refunded. A backend crash can otherwise hold minutes
 * forever. 60 minutes is far longer than the 10-minute input limit.
 *
 * `protectedIds` must contain reservations whose job record still exists (queued/running);
 * a long queue is not a crash, so those holds are never auto-released by age.
 */
export async function releaseStaleOrderReservations(
  site: OrderSite,
  id: string,
  maxAgeMs = 60 * 60 * 1000,
  protectedIds: string[] = [],
): Promise<{ released: number; remainingReserved: number } | null> {
  const current = await getOrder(site, id);
  if (!current) return null;
  const cutoff = Date.now() - Math.max(60_000, maxAgeMs);
  const protectedSet = new Set(protectedIds);
  const reservations: Record<string, ReservationRecord> = { ...(current.reservations ?? {}) };
  let released = 0;
  for (const [reservationId, reservation] of Object.entries(reservations)) {
    if (reservation.status !== "reserved") continue;
    if (protectedSet.has(reservationId)) continue;
    const createdAt = Date.parse(reservation.createdAt);
    if (!Number.isFinite(createdAt) || createdAt > cutoff) continue;
    reservations[reservationId] = {
      ...reservation,
      status: "refunded",
      updatedAt: new Date().toISOString(),
      note: "auto-released stale reservation (worker crash safety net)",
    };
    released += 1;
  }
  if (released > 0) {
    await updateOrder(site, id, { reservations, unitsReserved: sumReserved(reservations) });
  }
  return { released, remainingReserved: sumReserved(reservations) };
}

/** Consume allowance once a job is accepted. Kept for callers that charge immediately (headshot). */
export async function consumeOrderAllowance(site: OrderSite, id: string, units: number): Promise<OrderRecord | null> {
  const current = await getOrder(site, id);
  if (!current || current.status !== "paid") return null;
  const used = Math.min(current.unitsGranted, current.unitsUsed + Math.max(1, Math.ceil(units)));
  return updateOrder(site, id, { unitsUsed: used });
}
