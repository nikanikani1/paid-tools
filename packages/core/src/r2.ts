/**
 * r2.ts — Cloudflare R2 预签名 URL（S3 兼容 API，AWS SigV4）
 *
 * 为什么不用 @aws-sdk/client-s3：
 *   Workers 打包体积敏感，且预签名只需要 crypto；这里用 Web Crypto（crypto.subtle）
 *   纯手工签 SigV4，Node 20+ / Workers 都能跑，零依赖。
 *
 * 约定（两站共用同一个 bucket，按前缀隔离）：
 *   voice/in/<jobId>/<filename>     用户上传的原始音频
 *   voice/out/<jobId>/<stem>.mp3    分离产物
 *   headshot/in/<jobId>/<n>.jpg     自拍
 *   headshot/out/<jobId>/<n>.jpg    生成头像
 *   生命周期：in/ 24–48h、out/ 30 天（R2 控制台或 wrangler 配，见 docs/CLOUDFLARE-DEPLOY.md）
 *
 * 未配置 R2_*（本地开发 / 付款前）时：返回 mock:// URL，不抛错；需要严格时报错用 `strict: true`。
 *
 * TODO(付款后)：建好 bucket 用真实 key 跑一次 PUT→GET smoke test（见 CLOUDFLARE-DEPLOY.md §7）。
 */
import { getProcessEnv, hasR2Config, type EnvSource } from "./env";

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  /** 可选：R2 自定义域/CDN（拼公开 URL 用，不是签名用） */
  publicBaseUrl?: string;
}

export type PresignMethod = "PUT" | "GET";

export interface PresignOptions {
  /** 默认 3600s；范围 60s–7d */
  expiresIn?: number;
  /** 只作为返回的提示 header，不参与签名 */
  contentType?: string;
  /** true = 未配置 R2 时抛错而不是返回 mock */
  strict?: boolean;
}

export interface PresignResult {
  url: string;
  method: PresignMethod;
  key: string;
  expiresAt: string;
  mock: boolean;
  warning?: string;
  headers?: Record<string, string>;
}

const DEFAULT_EXPIRES_IN = 60 * 60;
const MAX_EXPIRES_IN = 7 * 24 * 60 * 60;
const MIN_EXPIRES_IN = 60;
const MOCK_SCHEME = "mock://";

function filled(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** 读 R2 配置；四项缺一返回 null（不抛错，交给调用方降级）。 */
export function getR2Config(source: EnvSource = getProcessEnv()): R2Config | null {
  if (!hasR2Config(source)) return null;
  return {
    accountId: source.R2_ACCOUNT_ID!,
    accessKeyId: source.R2_ACCESS_KEY_ID!,
    secretAccessKey: source.R2_SECRET_ACCESS_KEY!,
    bucket: source.R2_BUCKET!,
    publicBaseUrl: filled(source.R2_PUBLIC_BASE_URL) ? source.R2_PUBLIC_BASE_URL : undefined,
  };
}

export function isR2Configured(source: EnvSource = getProcessEnv()): boolean {
  return getR2Config(source) !== null;
}

// ---------------------------------------------------------------------------
// 预签名入口
// ---------------------------------------------------------------------------

export function presignPut(key: string, options: PresignOptions = {}, source: EnvSource = getProcessEnv()): Promise<PresignResult> {
  return presign("PUT", key, options, source);
}

export function presignGet(key: string, options: PresignOptions = {}, source: EnvSource = getProcessEnv()): Promise<PresignResult> {
  return presign("GET", key, options, source);
}

export async function presign(
  method: PresignMethod,
  key: string,
  options: PresignOptions = {},
  source: EnvSource = getProcessEnv(),
): Promise<PresignResult> {
  const safeKey = validateObjectKey(key);
  const config = getR2Config(source);
  const expiresIn = clampExpires(options.expiresIn);

  if (!config) {
    if (options.strict) {
      throw new Error(
        "[r2] R2 未配置：需要 R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET（见 docs/CLOUDFLARE-DEPLOY.md §3）",
      );
    }
    return mockResult(method, safeKey, expiresIn, "R2 未配置，返回 mock URL（本地开发可用；生产必须配齐 4 个 R2_* 变量）");
  }

  const url = await buildPresignedUrl(config, method, safeKey, expiresIn);
  return {
    url,
    method,
    key: safeKey,
    expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    mock: false,
    ...(options.contentType ? { headers: { "Content-Type": options.contentType } } : {}),
  };
}

/** 公开访问 URL（仅当配了 R2_PUBLIC_BASE_URL 才有意义；私有交付请用 presignGet）。 */
export function publicUrl(key: string, source: EnvSource = getProcessEnv()): string | null {
  const base = getR2Config(source)?.publicBaseUrl;
  if (!base) return null;
  return `${base.replace(/\/+$/, "")}/${validateObjectKey(key).split("/").map(encodeURIComponent).join("/")}`;
}

// ---------------------------------------------------------------------------
// key 工具
// ---------------------------------------------------------------------------

/** 生成 bucket 内对象 key：<site>/<in|out>/<date>/<jobId>/<filename>，并做安全清洗。 */
export function buildObjectKey(
  site: "voice" | "headshot",
  area: "in" | "out",
  jobId: string,
  filename: string,
  at: Date = new Date(),
): string {
  const safeJob = jobId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || "job";
  const day = at.toISOString().slice(0, 10);
  const name = sanitizeFilename(filename);
  return `${site}/${area}/${day}/${safeJob}/${name}`;
}

export function sanitizeFilename(filename: string): string {
  const base = filename.split(/[\\/]/).pop() ?? "file";
  const cleaned = base
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-") // 只留字母数字 _ . -
    .replace(/-+/g, "-")
    .replace(/^[-.]+/, "")
    .slice(0, 96);
  return cleaned.length > 0 ? cleaned : "file";
}

/** 拒绝空 key、绝对路径、`..`、控制字符（避免越权/路径穿越）。 */
export function validateObjectKey(key: string): string {
  const value = typeof key === "string" ? key.trim() : "";
  if (!value) throw new Error("[r2] object key 不能为空");
  if (value.length > 900) throw new Error("[r2] object key 过长（>900）");
  if (value.startsWith("/")) throw new Error("[r2] object key 不能以 / 开头");
  if (value.includes("..")) throw new Error("[r2] object key 不能包含 ..");
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(value)) throw new Error("[r2] object key 不能包含控制字符");
  return value;
}

export function isMockPresignUrl(url: string): boolean {
  return url.startsWith(MOCK_SCHEME);
}

// ---------------------------------------------------------------------------
// SigV4（query string 预签名）
// ---------------------------------------------------------------------------

function clampExpires(expiresIn: number | undefined): number {
  if (!Number.isFinite(expiresIn)) return DEFAULT_EXPIRES_IN;
  return Math.min(MAX_EXPIRES_IN, Math.max(MIN_EXPIRES_IN, Math.floor(expiresIn as number)));
}

function mockResult(method: PresignMethod, key: string, expiresIn: number, warning: string): PresignResult {
  const bucket = "mock-bucket";
  return {
    url: `${MOCK_SCHEME}r2/${bucket}/${key}?method=${method}&expires=${expiresIn}`,
    method,
    key,
    expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    mock: true,
    warning,
  };
}

function amzDates(now: Date): { amzDate: string; dateStamp: string } {
  const iso = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return { amzDate: iso, dateStamp: iso.slice(0, 8) };
}

async function buildPresignedUrl(config: R2Config, method: PresignMethod, key: string, expiresIn: number): Promise<string> {
  const host = `${config.accountId}.r2.cloudflarestorage.com`;
  const region = "auto";
  const service = "s3";
  const now = new Date();
  const { amzDate, dateStamp } = amzDates(now);
  const scope = `${dateStamp}/${region}/${service}/aws4_request`;

  const canonicalUri = `/${config.bucket}/${key.split("/").map(encodeRfc3986).join("/")}`;

  const queryParams: Array<[string, string]> = [
    ["X-Amz-Algorithm", "AWS4-HMAC-SHA256"],
    ["X-Amz-Credential", `${config.accessKeyId}/${scope}`],
    ["X-Amz-Date", amzDate],
    ["X-Amz-Expires", String(expiresIn)],
    ["X-Amz-SignedHeaders", "host"],
  ];
  const canonicalQuery = canonicalQueryString(queryParams);

  // 只签 host；payload 用 UNSIGNED-PAYLOAD（预签名 PUT/GET 的标准做法）
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuery,
    `host:${host}\n`,
    "host",
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, await sha256Hex(canonicalRequest)].join("\n");
  const signingKey = await deriveSigningKey(config.secretAccessKey, dateStamp, region, service);
  const signature = toHex(await hmac(signingKey, stringToSign));

  return `https://${host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

function canonicalQueryString(params: Array<[string, string]>): string {
  return [...params]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${encodeRfc3986(k)}=${encodeRfc3986(v)}`)
    .join("&");
}

/** RFC3986：encodeURIComponent 不转义 !'()* ，SigV4 要求转义。 */
function encodeRfc3986(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

async function deriveSigningKey(secret: string, dateStamp: string, region: string, service: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const kDate = await hmac(encoder.encode(`AWS4${secret}`), dateStamp);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, service);
  return hmac(kService, "aws4_request");
}

async function hmac(key: Uint8Array, data: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey("raw", toArrayBuffer(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data));
  return new Uint8Array(signature);
}

async function sha256Hex(data: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  return toHex(new Uint8Array(digest));
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Web Crypto 在 TS DOM 类型里要求 ArrayBuffer 系，这里显式拷贝，
 * 避免 Uint8Array<SharedArrayBuffer> 之类的类型不兼容（Workers/Node 都安全）。
 */
function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}
