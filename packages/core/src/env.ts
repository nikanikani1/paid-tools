/**
 * env.ts — 环境变量读取与校验（Cloudflare Workers / Node 双端安全）
 *
 * 设计原则（对齐 site-eng-accounts / site-eng-stack）：
 *  1. 读取永远不抛错：`readEnv()` 返回结构化报告，缺 key 只记录不崩；
 *  2. 调用方按需降级：缺 AI key → mock provider；缺 R2 → mock URL；缺 Waffo → mock checkout；
 *  3. 只有显式调用 `requireEnv()` 才抛错（给部署脚本/一次性检查用）；
 *  4. 不依赖 Node API；`process.env` 缺失时返回空对象（Workers 里 nodejs_compat 会注入）。
 *
 * 使用：
 *   const report = readEnv();
 *   report.ok                    // 生产必需项是否齐全
 *   report.missingRequired       // ["DATABASE_URL", ...]
 *   report.mode.ai               // "real" | "mock"
 *   report.env.REPLICATE_API_TOKEN
 */

export type EnvSource = Record<string, string | undefined>;

export type EnvGroup = "core" | "database" | "ai" | "storage" | "payment" | "email" | "security";

export interface EnvVarSpec {
  key: string;
  group: EnvGroup;
  /** 生产（真实收款）必需 */
  required: boolean;
  /** 值不能外泄：日志/报告里只输出是否配置 */
  secret?: boolean;
  description: string;
}

/** 生产必需 + 可选 env 全清单。新增变量必须同时更新本表和 docs/CLOUDFLARE-DEPLOY.md。 */
export const ENV_SPEC: readonly EnvVarSpec[] = [
  // core
  { key: "NODE_ENV", group: "core", required: false, description: "production / development" },
  { key: "SITE", group: "core", required: false, description: "voice | headshot（日志/成本归因用）" },
  { key: "NEXT_PUBLIC_SITE_URL", group: "core", required: true, description: "站点正式域名，如 https://vocalremover.example.com" },
  { key: "SESSION_SECRET", group: "core", required: true, secret: true, description: "会话/access token 签名密钥（64 hex）" },
  { key: "STATS_KEY", group: "core", required: false, secret: true, description: "只读统计接口保护 key；未设置时由 SESSION_SECRET 派生" },
  { key: "INTERNAL_ORIGIN", group: "core", required: false, description: "可选：内部调用 origin（EGRESS 代理/自调用）" },
  // database
  { key: "DATABASE_URL", group: "database", required: true, secret: true, description: "Neon Postgres **pooler** 连接串（sslmode=require&pgbouncer=true&connection_limit=1）" },
  // ai
  { key: "REPLICATE_API_TOKEN", group: "ai", required: true, secret: true, description: "Replicate：demucs 分离 + Kontext/face-swap 头像（两站共用）" },
  { key: "FAL_KEY", group: "ai", required: false, secret: true, description: "可选：fal.ai flux-pulid 备选；默认走 Replicate-only" },
  // storage
  { key: "R2_ACCOUNT_ID", group: "storage", required: true, description: "Cloudflare account id（R2 S3 endpoint 用）" },
  { key: "R2_ACCESS_KEY_ID", group: "storage", required: true, secret: true, description: "R2 S3 API token 的 Access Key ID" },
  { key: "R2_SECRET_ACCESS_KEY", group: "storage", required: true, secret: true, description: "R2 S3 API token 的 Secret Access Key" },
  { key: "R2_BUCKET", group: "storage", required: true, description: "R2 bucket 名（两站共用，按 voice/ headshot/ 前缀隔离）" },
  { key: "R2_PUBLIC_BASE_URL", group: "storage", required: false, description: "可选：R2 自定义域/CDN 域名（有则可拼公开 URL）" },
  // payment
  { key: "WAFFO_MODE", group: "payment", required: false, description: "live | test（默认 test）" },
  { key: "WAFFO_API_BASE", group: "payment", required: false, description: "默认 https://api.waffo.ai" },
  { key: "WAFFO_MERCHANT_ID", group: "payment", required: true, description: "Waffo 商户号 MER_xxx" },
  { key: "WAFFO_STORE_ID", group: "payment", required: true, description: "Waffo 商店号 STO_xxx" },
  { key: "WAFFO_PRIVATE_KEY", group: "payment", required: true, secret: true, description: "Waffo 商户私钥（创建 checkout 签名）" },
  { key: "WAFFO_WEBHOOK_PUBLIC_KEY", group: "payment", required: true, secret: true, description: "Waffo webhook 公钥（验证回调签名）" },
  { key: "WAFFO_SIGNATURE_HEADER", group: "payment", required: false, description: "默认 x-waffo-signature" },
  // email
  { key: "RESEND_API_KEY", group: "email", required: true, secret: true, description: "Resend API key（HTTP API，不用 SMTP）" },
  { key: "NOTIFY_EMAIL_FROM", group: "email", required: true, description: "发件人，如 Paid Tools <reports@example.com>（域名需验 SPF/DKIM）" },
  // security
  { key: "TURNSTILE_SECRET_KEY", group: "security", required: false, secret: true, description: "Turnstile 服务端校验 key（免费）" },
  { key: "TURNSTILE_SITE_KEY", group: "security", required: false, description: "Turnstile 前端 site key（public）" },
];

const GROUP_ORDER: EnvGroup[] = ["core", "database", "ai", "storage", "payment", "email", "security"];

export interface EnvMode {
  /** AI provider 是否真实可用（REPLICATE_API_TOKEN 即可；fal 可选） */
  ai: "real" | "mock";
  /** R2 是否真实可用（4 个 R2_* 都配了） */
  storage: "real" | "mock";
  /** Waffo 是否真实可用（merchant/store/private/public key 都配了） */
  payment: "real" | "mock";
  email: "real" | "mock";
  database: "configured" | "unconfigured";
  turnstile: "configured" | "unconfigured";
}

export interface EnvReport {
  env: EnvSource;
  ok: boolean;
  mode: EnvMode;
  missingRequired: string[];
  missingOptional: string[];
  warnings: string[];
  /** 每个 group 配置情况（不输出任何 secret 值） */
  groups: Record<EnvGroup, { configured: number; expected: number; missingRequired: string[] }>;
}

export class EnvError extends Error {
  readonly missing: string[];
  constructor(missing: string[], context = "requireEnv") {
    super(`[${context}] 缺少必需环境变量: ${missing.join(", ")}（检查平台后台 Environment / .env.local，见 docs/CLOUDFLARE-DEPLOY.md）`);
    this.name = "EnvError";
    this.missing = missing;
  }
}

/** 取进程环境；Workers 有 nodejs_compat 时也有 process.env；两者都没有时返回 {}。 */
export function getProcessEnv(): EnvSource {
  const proc = (globalThis as { process?: { env?: EnvSource } }).process;
  return proc?.env ?? {};
}

function isFilled(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** 读取并校验 env。永不抛错。 */
export function readEnv(source: EnvSource = getProcessEnv()): EnvReport {
  const env: EnvSource = source ?? {};
  const missingRequired: string[] = [];
  const missingOptional: string[] = [];
  const warnings: string[] = [];

  for (const spec of ENV_SPEC) {
    const filled = isFilled(env[spec.key]);
    if (filled) continue;
    if (spec.required) missingRequired.push(spec.key);
    else missingOptional.push(spec.key);
  }

  const mode: EnvMode = {
    ai: isFilled(env.REPLICATE_API_TOKEN) ? "real" : "mock",
    storage: isFilled(env.R2_ACCOUNT_ID) && isFilled(env.R2_ACCESS_KEY_ID) && isFilled(env.R2_SECRET_ACCESS_KEY) && isFilled(env.R2_BUCKET) ? "real" : "mock",
    payment:
      isFilled(env.WAFFO_MERCHANT_ID) && isFilled(env.WAFFO_STORE_ID) && isFilled(env.WAFFO_PRIVATE_KEY) && isFilled(env.WAFFO_WEBHOOK_PUBLIC_KEY)
        ? "real"
        : "mock",
    email: isFilled(env.RESEND_API_KEY) ? "real" : "mock",
    database: isFilled(env.DATABASE_URL) ? "configured" : "unconfigured",
    turnstile: isFilled(env.TURNSTILE_SECRET_KEY) ? "configured" : "unconfigured",
  };

  // 部分配置（配了一半）比全缺更危险：运行时才炸。单独告警。
  if (mode.storage === "mock" && (isFilled(env.R2_ACCOUNT_ID) || isFilled(env.R2_ACCESS_KEY_ID) || isFilled(env.R2_BUCKET))) {
    warnings.push("R2 只配置了部分变量（需要 R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET 四项齐全），已降级 mock");
  }
  if (mode.payment === "mock" && (isFilled(env.WAFFO_MERCHANT_ID) || isFilled(env.WAFFO_STORE_ID) || isFilled(env.WAFFO_PRIVATE_KEY))) {
    warnings.push("Waffo 只配置了部分变量（需要 WAFFO_MERCHANT_ID / WAFFO_STORE_ID / WAFFO_PRIVATE_KEY / WAFFO_WEBHOOK_PUBLIC_KEY），已降级 mock");
  }
  if (mode.ai === "mock" && isFilled(env.FAL_KEY)) {
    warnings.push("只配了 FAL_KEY、缺 REPLICATE_API_TOKEN：人声分离/face-swap 仍需 Replicate，已降级 mock");
  }
  const nodeEnv = env.NODE_ENV;
  if (nodeEnv === "production" && mode.payment === "mock") {
    warnings.push("生产环境 NODE_ENV=production 但支付仍是 mock：上线收款前必须补齐 Waffo 4 个变量");
  }
  if (nodeEnv === "production" && mode.storage === "mock") {
    warnings.push("生产环境但 R2 仍是 mock：上传/交付会返回 mock URL");
  }
  if (isFilled(env.DATABASE_URL) && !/pooler|pgbouncer/.test(env.DATABASE_URL!)) {
    warnings.push("DATABASE_URL 看起来不是 Neon pooler 连接串（serverless 下建议加 -pooler + pgbouncer=true&connection_limit=1）");
  }

  const groups = {} as EnvReport["groups"];
  for (const group of GROUP_ORDER) {
    const specs = ENV_SPEC.filter((s) => s.group === group);
    const expected = specs.length;
    const configured = specs.filter((s) => isFilled(env[s.key])).length;
    groups[group] = {
      configured,
      expected,
      missingRequired: specs.filter((s) => s.required && !isFilled(env[s.key])).map((s) => s.key),
    };
  }

  return {
    env,
    ok: missingRequired.length === 0,
    mode,
    missingRequired,
    missingOptional,
    warnings,
    groups,
  };
}

/** 生产部署前的一次性检查：缺 key 直接抛 EnvError（由脚本/route 决定是否调用）。 */
export function requireEnv(keys?: string[], source: EnvSource = getProcessEnv()): EnvSource {
  const report = readEnv(source);
  const missing = keys ? keys.filter((k) => !isFilled(source[k])) : report.missingRequired;
  if (missing.length > 0) throw new EnvError(missing);
  return source;
}

// ---------------------------------------------------------------------------
// 便捷判断（给 r2.ts / payments/waffo.ts / providers 用；不重复导出 provider 的同名函数）
// ---------------------------------------------------------------------------

export function hasReplicateKey(source: EnvSource = getProcessEnv()): boolean {
  return isFilled(source.REPLICATE_API_TOKEN);
}

export function hasFalKey(source: EnvSource = getProcessEnv()): boolean {
  return isFilled(source.FAL_KEY);
}

export function hasR2Config(source: EnvSource = getProcessEnv()): boolean {
  return readEnv(source).mode.storage === "real";
}

export function hasWaffoConfig(source: EnvSource = getProcessEnv()): boolean {
  return readEnv(source).mode.payment === "real";
}

/** 两站共用的一个布尔：真实链路是否就绪（付款/上传前检查用）。 */
export function isRealMode(source: EnvSource = getProcessEnv()): boolean {
  const mode = readEnv(source).mode;
  return mode.ai === "real" && mode.storage === "real" && mode.payment === "real";
}
