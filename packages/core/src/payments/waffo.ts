/**
 * payments/waffo.ts — Waffo（Pancake MoR）支付骨架
 *
 * 现有商户：MER_…/STO_…（见 site-eng-accounts）。官网公开费率 3.9% + $0.50/笔
 * （https://waffo.ai/pricing，2026-11-11 抓取；实际合同费率以商户后台为准）。
 *
 * 本文件已实现：
 *   - createCheckout()：配齐 WAFFO_* → real；没配 → mock（返回 mock:// URL，不阻塞本地开发）
 *   - verifyWebhookSignature()：RSA-SHA256（WAFFO_WEBHOOK_PUBLIC_KEY）验签；未配置 → mock 不验签并告警
 *   - handleWebhook()：幂等（同一事件只处理一次）+ 结构化结果 + onVerifiedEvent 回调
 *   - WebhookStore 接口（默认内存实现；生产换 Prisma WebhookEvent 表，见 packages/core/prisma/schema.prisma）
 *
 * TODO(周五 Mastercard 到、拿到真实商户密钥后)：
 *   1. 核对 Waffo Pancake API：创建 checkout 的 endpoint / 字段 / 签名方式（当前按 REST 惯例猜，
 *      集中在 WAFFO_CHECKOUT_PATH 常量里，不符只需改这一处）；
 *   2. 核对 webhook 签名原文（是否带 timestamp 前缀）、header 名（默认 x-waffo-signature）；
 *   3. 用测试商户跑一遍「建单 → 支付 → webhook → 幂等重放」，再开 live。
 */
import { getProcessEnv, hasWaffoConfig, type EnvSource } from "../env";

/** real 分支的唯一「契约猜测点」：Waffo 文档确认后只改这里。 */
const WAFFO_CHECKOUT_PATH = "/v1/checkout/sessions";
const DEFAULT_API_BASE = "https://api.waffo.ai";
const DEFAULT_SIGNATURE_HEADER = "x-waffo-signature";
const MAX_WEBHOOK_SKEW_SECONDS = 5 * 60;

export interface WaffoConfig {
  mode: "live" | "test";
  apiBase: string;
  merchantId: string;
  storeId: string;
  privateKey: string;
  webhookPublicKey: string;
  signatureHeader: string;
}

export function getWaffoConfig(source: EnvSource = getProcessEnv()): WaffoConfig | null {
  if (!hasWaffoConfig(source)) return null;
  return {
    mode: source.WAFFO_MODE === "live" ? "live" : "test",
    apiBase: (source.WAFFO_API_BASE || DEFAULT_API_BASE).replace(/\/+$/, ""),
    merchantId: source.WAFFO_MERCHANT_ID!,
    storeId: source.WAFFO_STORE_ID!,
    privateKey: source.WAFFO_PRIVATE_KEY!,
    webhookPublicKey: source.WAFFO_WEBHOOK_PUBLIC_KEY!,
    signatureHeader: (source.WAFFO_SIGNATURE_HEADER || DEFAULT_SIGNATURE_HEADER).toLowerCase(),
  };
}

export function isWaffoConfigured(source: EnvSource = getProcessEnv()): boolean {
  return getWaffoConfig(source) !== null;
}

export class WaffoError extends Error {
  readonly status?: number;
  readonly body?: string;
  constructor(message: string, status?: number, body?: string) {
    super(message);
    this.name = "WaffoError";
    this.status = status;
    this.body = body;
  }
}

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------

export interface CheckoutInput {
  site: "voice" | "headshot";
  /** 站内套餐 id（见 core/pricing.ts，如 voice-starter / headshot-60） */
  planId: string;
  /** 金额（美分），必须与服务端定价表一致，不信任前端 */
  amountCents: number;
  currency?: string;
  email?: string;
  /** Waffo 商户后台建的产品 ID（可选；有则用 product 创建 checkout） */
  productId?: string;
  successUrl?: string;
  cancelUrl?: string;
  /** 透传字段（落库到 Order.metadata，webhook 回来后按 orderId 找回） */
  metadata?: Record<string, string>;
}

export interface CheckoutSession {
  id: string;
  url: string;
  mode: "live" | "test" | "mock";
  mock: boolean;
  expiresAt?: string;
  warning?: string;
}

export async function createCheckout(input: CheckoutInput, source: EnvSource = getProcessEnv()): Promise<CheckoutSession> {
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new WaffoError(`[waffo] amountCents 非法: ${input.amountCents}`);
  }
  if (!input.planId || !input.site) throw new WaffoError("[waffo] site/planId 必填");

  const config = getWaffoConfig(source);
  if (!config) {
    const id = `mock_cs_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    return {
      id,
      url: `mock://waffo/checkout?session=${id}&site=${input.site}&plan=${encodeURIComponent(input.planId)}&amount=${input.amountCents}`,
      mode: "mock",
      mock: true,
      warning: "Waffo 未配置，返回 mock checkout（不会真实扣款）",
    };
  }

  // TODO(付款后)：确认 WAFFO_CHECKOUT_PATH 与字段名。当前按 Pancake REST 惯例实现。
  const res = await fetch(`${config.apiBase}${WAFFO_CHECKOUT_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Merchant-Id": config.merchantId,
      ...(config.mode === "test" ? { "X-Waffo-Mode": "test" } : {}),
    },
    body: JSON.stringify({
      merchant_id: config.merchantId,
      store_id: config.storeId,
      ...(input.productId ? { product_id: input.productId } : {}),
      amount: input.amountCents,
      currency: input.currency ?? "USD",
      ...(input.email ? { customer_email: input.email } : {}),
      ...(input.successUrl ? { success_url: input.successUrl } : {}),
      ...(input.cancelUrl ? { cancel_url: input.cancelUrl } : {}),
      metadata: { site: input.site, planId: input.planId, ...input.metadata },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new WaffoError(`[waffo] createCheckout ${res.status}`, res.status, body);
  }

  const data = (await res.json().catch(() => ({}))) as { id?: string; url?: string; checkout_url?: string; expires_at?: string };
  const url = data.url || data.checkout_url;
  if (!url) throw new WaffoError("[waffo] createCheckout 响应里没有 checkout url（核对 API 字段）");
  return { id: data.id ?? `cs_${Date.now().toString(36)}`, url, mode: config.mode, mock: false, ...(data.expires_at ? { expiresAt: data.expires_at } : {}) };
}

// ---------------------------------------------------------------------------
// Webhook 验签
// ---------------------------------------------------------------------------

export interface WebhookVerificationInput {
  rawBody: string;
  /** 直接传签名值（优先），或从 headers 里取 */
  signature?: string | null;
  timestamp?: string | null;
  headers?: Headers | Record<string, string | undefined>;
}

export interface WebhookVerification {
  ok: boolean;
  mode: "rsa" | "mock";
  reason?: string;
  warning?: string;
}

export async function verifyWebhookSignature(
  input: WebhookVerificationInput,
  source: EnvSource = getProcessEnv(),
): Promise<WebhookVerification> {
  const config = getWaffoConfig(source);
  const headerName = config?.signatureHeader ?? DEFAULT_SIGNATURE_HEADER;
  const signature = input.signature ?? headerValue(input.headers, headerName) ?? headerValue(input.headers, "x-signature");
  const timestamp = input.timestamp ?? headerValue(input.headers, "x-waffo-timestamp") ?? headerValue(input.headers, "x-timestamp");

  if (!config) {
    return {
      ok: false,
      mode: "mock",
      reason: "Waffo 未配置，跳过验签（本地 mock 可继续走幂等流程）",
      warning: "生产必须配置 WAFFO_WEBHOOK_PUBLIC_KEY，否则 webhook 不可信",
    };
  }
  if (!signature) return { ok: false, mode: "rsa", reason: `缺少签名 header（${headerName}）` };

  if (timestamp) {
    const age = Math.abs(Date.now() / 1000 - Number(timestamp));
    if (!Number.isFinite(age) || age > MAX_WEBHOOK_SKEW_SECONDS) {
      return { ok: false, mode: "rsa", reason: "webhook 时间戳过期（重放保护）" };
    }
  }

  try {
    const publicKey = await importRsaPublicKey(config.webhookPublicKey);
    const message = timestamp ? `${timestamp}.${input.rawBody}` : input.rawBody;
    const signatureBytes = decodeSignature(signature);
    const valid = await crypto.subtle.verify(
      { name: "RSASSA-PKCS1-v1_5" },
      publicKey,
      toArrayBuffer(signatureBytes),
      new TextEncoder().encode(message),
    );
    return valid ? { ok: true, mode: "rsa" } : { ok: false, mode: "rsa", reason: "签名不匹配" };
  } catch (error) {
    return { ok: false, mode: "rsa", reason: `验签异常: ${(error as Error).message}` };
  }
}

// ---------------------------------------------------------------------------
// Webhook 幂等 + 分发
// ---------------------------------------------------------------------------

export interface WebhookEventRecord {
  id: string;
  site: "voice" | "headshot";
  provider: "waffo";
  eventType?: string;
  externalId?: string;
  /** provider event id 或 rawBody sha256，唯一键 → 幂等 */
  idempotencyKey: string;
  payload: unknown;
  verified: boolean;
  receivedAt: string;
  processedAt?: string;
  error?: string;
}

export interface WebhookStore {
  has(idempotencyKey: string): boolean | Promise<boolean>;
  save(record: WebhookEventRecord): void | Promise<void>;
  markProcessed?(idempotencyKey: string, patch?: { error?: string }): void | Promise<void>;
}

interface MemoryWebhookState {
  store: Map<string, WebhookEventRecord>;
}

const globalState = globalThis as unknown as { __paidWebhookState?: MemoryWebhookState };
const memoryState: MemoryWebhookState = globalState.__paidWebhookState ?? (globalState.__paidWebhookState = { store: new Map() });

/** 默认内存实现（Workers 单 isolate 内有效；生产换 Prisma：见 schema.prisma 的 WebhookEvent）。 */
export function createMemoryWebhookStore(): WebhookStore {
  return {
    has: (key) => memoryState.store.has(key),
    save: (record) => {
      memoryState.store.set(record.idempotencyKey, record);
    },
    markProcessed: (key, patch) => {
      const current = memoryState.store.get(key);
      if (!current) return;
      memoryState.store.set(key, { ...current, processedAt: new Date().toISOString(), ...patch });
    },
  };
}

let activeStore: WebhookStore = createMemoryWebhookStore();

/** 生产启动时替换成 Prisma 实现（Lead/站点任务在 app 初始化时调用）。 */
export function setWebhookStore(store: WebhookStore): void {
  activeStore = store;
}

export function getWebhookStore(): WebhookStore {
  return activeStore;
}

export interface HandleWebhookInput {
  site: "voice" | "headshot";
  rawBody: string;
  headers?: Headers | Record<string, string | undefined>;
  /** 验签通过且非重复时调用：写 Order / 发额度 / 发邮件。由站点任务实现。 */
  onVerifiedEvent?: (event: WebhookEventRecord) => void | Promise<void>;
}

export type WebhookAction = "processed" | "duplicate" | "invalid-signature" | "invalid-payload" | "not-configured";

export interface HandleWebhookResult {
  ok: boolean;
  action: WebhookAction;
  duplicate: boolean;
  verified: boolean;
  verificationMode: "rsa" | "mock";
  eventId?: string;
  eventType?: string;
  warnings: string[];
  error?: string;
}

/**
 * 幂等 webhook 入口。永不抛错（返回结构化结果），方便 route 直接 `NextResponse.json(result)`。
 * 顺序：解析 → 幂等查重 → 验签 → 落库 → 分发回调。重复事件不重复分发。
 */
export async function handleWebhook(input: HandleWebhookInput, source: EnvSource = getProcessEnv()): Promise<HandleWebhookResult> {
  const warnings: string[] = [];
  let payload: Record<string, unknown>;
  try {
    const parsed = JSON.parse(input.rawBody) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("payload 不是对象");
    payload = parsed as Record<string, unknown>;
  } catch (error) {
    return {
      ok: false,
      action: "invalid-payload",
      duplicate: false,
      verified: false,
      verificationMode: "mock",
      warnings,
      error: `webhook payload 解析失败: ${(error as Error).message}`,
    };
  }

  const eventType = pickString(payload, ["type", "event", "event_type"]) ?? "unknown";
  const externalId = pickString(payload, ["id", "event_id", "data.id", "data.object.id"]);
  const idempotencyKey = externalId ? `waffo:${externalId}` : `waffo:sha256:${await sha256Hex(input.rawBody)}`;

  if (await activeStore.has(idempotencyKey)) {
    return {
      ok: true,
      action: "duplicate",
      duplicate: true,
      verified: true,
      verificationMode: getWaffoConfig(source) ? "rsa" : "mock",
      eventId: externalId,
      eventType,
      warnings: [...warnings, "重复事件，已忽略（幂等）"],
    };
  }

  const verification = await verifyWebhookSignature({ rawBody: input.rawBody, headers: input.headers }, source);
  if (!verification.ok && verification.mode === "rsa") {
    return {
      ok: false,
      action: "invalid-signature",
      duplicate: false,
      verified: false,
      verificationMode: verification.mode,
      eventId: externalId,
      eventType,
      warnings: [...warnings, verification.reason ?? "签名校验失败"],
    };
  }
  if (verification.warning) warnings.push(verification.warning);

  const record: WebhookEventRecord = {
    id: `whe_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    site: input.site,
    provider: "waffo",
    eventType,
    externalId,
    idempotencyKey,
    payload,
    verified: verification.ok,
    receivedAt: new Date().toISOString(),
  };

  await activeStore.save(record);

  if (verification.ok && input.onVerifiedEvent) {
    try {
      await input.onVerifiedEvent(record);
      await activeStore.markProcessed?.(idempotencyKey);
      return { ok: true, action: "processed", duplicate: false, verified: true, verificationMode: verification.mode, eventId: externalId, eventType, warnings };
    } catch (error) {
      const message = (error as Error).message;
      await activeStore.markProcessed?.(idempotencyKey, { error: message });
      return { ok: false, action: "processed", duplicate: false, verified: true, verificationMode: verification.mode, eventId: externalId, eventType, warnings, error: message };
    }
  }

  return {
    ok: true,
    action: verification.mode === "mock" ? "not-configured" : "processed",
    duplicate: false,
    verified: verification.ok,
    verificationMode: verification.mode,
    eventId: externalId,
    eventType,
    warnings,
  };
}

// ---------------------------------------------------------------------------
// 工具
// ---------------------------------------------------------------------------

function headerValue(headers: Headers | Record<string, string | undefined> | undefined, name: string): string | null {
  if (!headers) return null;
  if (typeof (headers as Headers).get === "function") return (headers as Headers).get(name);
  const record = headers as Record<string, string | undefined>;
  const lower = name.toLowerCase();
  for (const [key, value] of Object.entries(record)) {
    if (key.toLowerCase() === lower && value) return value;
  }
  return null;
}

function pickString(payload: Record<string, unknown>, paths: string[]): string | undefined {
  for (const path of paths) {
    const value = path.split(".").reduce<unknown>((acc, part) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[part] : undefined), payload);
    if (typeof value === "string" && value.length > 0) return value;
  }
  return undefined;
}

function decodeSignature(signature: string): Uint8Array {
  const trimmed = signature.trim().replace(/^sha256=/i, "");
  if (/^[0-9a-f]+$/i.test(trimmed) && trimmed.length % 2 === 0) {
    const bytes = new Uint8Array(trimmed.length / 2);
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Number.parseInt(trimmed.slice(i * 2, i * 2 + 2), 16);
    return bytes;
  }
  const binary = atob(trimmed);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function importRsaPublicKey(pem: string): Promise<CryptoKey> {
  const body = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  if (!body) throw new Error("公钥为空");
  const binary = atob(body);
  const der = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) der[i] = binary.charCodeAt(i);
  return crypto.subtle.importKey("spki", toArrayBuffer(der), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
}

async function sha256Hex(data: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}
