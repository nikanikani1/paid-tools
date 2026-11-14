import { NextResponse } from "next/server";
import { isR2Configured, presignPut } from "@paid/core";

/**
 * GET  /api/events  → 健康检查（是否配了 R2、允许哪些事件），不含密钥。
 * POST /api/events  → 接收前端/服务端埋点事件，写 R2 events/<site>/<YYYY-MM-DD>/<ts>-<rand>.json。
 *
 * 设计约束（task-23 / OPS-MONITORING.md）：
 *  - 不采集 PII：不存 IP / User-Agent / 邮箱 / 姓名 / 音频 / 人脸 / 文件内容；props 里的敏感 key 直接丢弃。
 *  - R2 未配置时降级为结构化 stdout 日志并返回 200（本地开发 / 未付款阶段仍可 curl 验收）。
 *  - 单进程内的简易限流（每 IP 60s/120 次）只是尽力而为，不是安全边界；真正的限流由 Cloudflare 规则承担。
 *  - 失败永不抛错给前端：埋点不能影响主流程。
 */
const SITE = "voice" as const;

const MAX_BODY_BYTES = 8 * 1024;
const MAX_EVENTS_PER_REQUEST = 20;
const ALLOWED_EVENTS = [
  "checkout_started",
  "paid",
  "job_started",
  "job_done",
  "download_clicked",
  "page_view",
  "ui_error",
] as const;
const ALLOWED_EVENT_SET = new Set<string>(ALLOWED_EVENTS);
const ID_RE = /^[A-Za-z0-9_-]{1,80}$/;
const PROP_KEY_RE = /^[A-Za-z0-9_]{1,40}$/;
const PII_KEY_RE =
  /(email|e_mail|phone|mobile|name|address|street|city|country|zip|postal|card|pan|cvv|ssn|passport|face|selfie|audio|voice|image|photo|picture|file|content|prompt|password|secret|token)/i;
const EMAIL_VALUE_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const TS_MAX_SKEW_MS = 15 * 60 * 1000;

interface EventRecord {
  site: typeof SITE;
  event: string;
  path: string | null;
  orderId: string | null;
  jobId: string | null;
  ts: string;
  receivedAt: string;
  props: Record<string, string | number | boolean> | null;
}

interface RateBucket {
  count: number;
  resetAt: number;
}

const globalStore = globalThis as unknown as {
  __paidEventRate?: Map<string, RateBucket>;
};
const rateStore: Map<string, RateBucket> = globalStore.__paidEventRate ?? new Map();

function clientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return req.headers.get("cf-connecting-ip") ?? forwarded ?? "unknown";
}

function rateLimited(req: Request): boolean {
  const now = Date.now();
  const key = clientKey(req);
  const bucket = rateStore.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rateStore.set(key, { count: 1, resetAt: now + 60_000 });
    if (rateStore.size > 5000) {
      for (const [k, b] of rateStore) if (b.resetAt <= now) rateStore.delete(k);
    }
    return false;
  }
  bucket.count += 1;
  return bucket.count > 120;
}

function cleanPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.split("?")[0]?.split("#")[0]?.trim() ?? "";
  if (!cleaned.startsWith("/") || cleaned.length > 300) return null;
  return cleaned;
}

function cleanId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return ID_RE.test(trimmed) ? trimmed : null;
}

function cleanTs(value: unknown): string {
  const now = Date.now();
  let ms = now;
  if (typeof value === "number" && Number.isFinite(value)) ms = value;
  else if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) ms = parsed;
  }
  if (Math.abs(ms - now) > TS_MAX_SKEW_MS) ms = now;
  return new Date(ms).toISOString();
}

function cleanProps(value: unknown): Record<string, string | number | boolean> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const out: Record<string, string | number | boolean> = {};
  let kept = 0;
  for (const [rawKey, rawValue] of Object.entries(value as Record<string, unknown>)) {
    if (kept >= 8) break;
    if (!PROP_KEY_RE.test(rawKey) || PII_KEY_RE.test(rawKey)) continue;
    if (typeof rawValue === "string") {
      const trimmed = rawValue.trim();
      if (!trimmed || trimmed.length > 120 || EMAIL_VALUE_RE.test(trimmed)) continue;
      out[rawKey] = trimmed;
    } else if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
      out[rawKey] = rawValue;
    } else if (typeof rawValue === "boolean") {
      out[rawKey] = rawValue;
    } else {
      continue;
    }
    kept += 1;
  }
  return Object.keys(out).length > 0 ? out : null;
}

function toRecords(payload: unknown): { records: EventRecord[]; dropped: number } {
  const items = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray((payload as { events?: unknown[] }).events)
      ? ((payload as { events: unknown[] }).events as unknown[])
      : [payload];
  const records: EventRecord[] = [];
  let dropped = 0;
  for (const item of items.slice(0, MAX_EVENTS_PER_REQUEST)) {
    if (!item || typeof item !== "object") {
      dropped += 1;
      continue;
    }
    const raw = item as Record<string, unknown>;
    const event = typeof raw.event === "string" ? raw.event : "";
    if (!ALLOWED_EVENT_SET.has(event)) {
      dropped += 1;
      continue;
    }
    records.push({
      site: SITE,
      event,
      path: cleanPath(raw.path),
      orderId: cleanId(raw.orderId),
      jobId: cleanId(raw.jobId),
      ts: cleanTs(raw.ts),
      receivedAt: new Date().toISOString(),
      props: cleanProps(raw.props),
    });
  }
  if (items.length > MAX_EVENTS_PER_REQUEST) dropped += items.length - MAX_EVENTS_PER_REQUEST;
  return { records, dropped };
}

async function storeRecord(record: EventRecord): Promise<"r2" | "log"> {
  const day = record.ts.slice(0, 10);
  const suffix = record.ts.replace(/[:.]/g, "-");
  const key = `events/${SITE}/${day}/${suffix}-${Math.random().toString(36).slice(2, 8)}.json`;
  if (!isR2Configured()) {
    console.log("[events]", JSON.stringify({ ...record, stored: "log" }));
    return "log";
  }
  try {
    const signed = await presignPut(key, { expiresIn: 120, contentType: "application/json", strict: true });
    const res = await fetch(signed.url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
    if (!res.ok) {
      console.warn("[events] r2_put_failed", res.status, key);
      console.log("[events]", JSON.stringify({ ...record, stored: "log", r2Status: res.status }));
      return "log";
    }
    return "r2";
  } catch (error) {
    console.warn("[events] r2_error", String(error).slice(0, 200));
    console.log("[events]", JSON.stringify({ ...record, stored: "log" }));
    return "log";
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    site: SITE,
    r2: isR2Configured(),
    store: isR2Configured() ? `events/${SITE}/<YYYY-MM-DD>/` : "stdout (R2 not configured)",
    allowedEvents: ALLOWED_EVENTS,
    pii: "not collected (no IP / UA / email / audio / face)",
  });
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json") && !contentType.includes("text/plain")) {
      return NextResponse.json({ ok: false, error: "unsupported_content_type" }, { status: 415 });
    }
    if (rateLimited(req)) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }
    const text = await req.text();
    if (text.length > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: "payload_too_large", maxBytes: MAX_BODY_BYTES }, { status: 413 });
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }
    const { records, dropped } = toRecords(parsed);
    if (records.length === 0) {
      return NextResponse.json({ ok: false, error: "no_valid_events", dropped }, { status: 400 });
    }
    const stored = await Promise.all(records.map((record) => storeRecord(record)));
    const toR2 = stored.filter((s) => s === "r2").length;
    return NextResponse.json({
      ok: true,
      site: SITE,
      accepted: records.length,
      dropped,
      stored: { r2: toR2, log: records.length - toR2 },
    });
  } catch (error) {
    console.error("[events] unhandled", String(error).slice(0, 300));
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
