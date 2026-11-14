/**
 * Replicate 客户端（真实实现）
 * 文档：https://replicate.com/docs/topics/predictions/create-a-prediction
 *
 * 注意：社区模型必须用 `version`（hash）创建 prediction；
 * 直接用 model slug 的 /models/{owner}/{name}/predictions 对社区模型会 404。
 * 这里先 GET /models/{owner}/{name} 拿 latest_version.id，再 POST /predictions。
 *
 * 测试：`REPLICATE_API_BASE` 可覆盖 API 根地址（默认官方），用于本地假 provider 测试，
 * 生产不要设置它。
 */
const DEFAULT_API = "https://api.replicate.com/v1";

function apiBase(): string {
  const raw = process.env.REPLICATE_API_BASE;
  const base = raw && raw.trim().length > 0 ? raw.trim() : DEFAULT_API;
  return base.replace(/\/+$/, "");
}

export function isReplicateConfigured(): boolean {
  return Boolean(process.env.REPLICATE_API_TOKEN);
}

export interface ReplicatePrediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output?: unknown;
  error?: string;
  metrics?: { predict_time?: number; total_time?: number };
  urls?: { get?: string; cancel?: string; web?: string };
}

const versionCache = new Map<string, string>();

/**
 * Local-only fetch shim: Next's patched global fetch on Windows can pick IPv6
 * first and time out; undici's fetch works. Workers use global fetch.
 * `eval("require")` keeps the Node-only dependency out of the Edge bundle.
 */
export async function replicateFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (process.env.LOCAL_UNDICI === "1") {
    try {
      const req = eval("require") as (id: string) => { fetch: typeof fetch };
      return await req("undici").fetch(input as RequestInfo, init);
    } catch {
      // fall through to global fetch
    }
  }
  return fetch(input, init);
}

/**
 * 429（创建 prediction 的限流）不在这里重试：它有 `retry_after` 秒级窗口，
 * 由 createPrediction 的全局闸门处理（见 ReplicateThrottleError）。这里只重试
 * 5xx / 网络瞬时错误。
 */
export function isRetryableReplicateError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /Replicate 5\d\d\b/.test(message) || /timed out|ECONNRESET|ETIMEDOUT|fetch failed/i.test(message);
}

/**
 * Replicate 创建 prediction 的限流（429）。这不是失败：调用方应该等到
 * `retryAfterMs` 之后再投，而不是把该张图记为 failed。
 * 低余额账户的真实规则（2026-11-14 抓取）：余额 < $5 时 6 次/分钟、burst 1。
 */
export class ReplicateThrottleError extends Error {
  readonly retryAfterMs: number;
  constructor(retryAfterMs: number, message = "Replicate rate limit hit") {
    super(message);
    this.name = "ReplicateThrottleError";
    this.retryAfterMs = Math.max(0, Math.ceil(retryAfterMs));
  }
}

export function isReplicateThrottleError(error: unknown): error is ReplicateThrottleError {
  return error instanceof ReplicateThrottleError || (error instanceof Error && error.name === "ReplicateThrottleError");
}

/** 从 429 响应体里读 `retry_after`（秒，可能带小数），兜底 8s。 */
export function parseReplicateRetryAfterMs(message: string): number {
  const match = message.match(/retry_after["']?\s*:\s*(\d+(?:\.\d+)?)/i);
  if (match) return Math.ceil(Number.parseFloat(match[1]) * 1000) + 500;
  return 8_000;
}

/**
 * 进程级创建闸门：Replicate 的创建限流是账户级的，所以并发的 5 张 fan-out
 * 不能各自盲试。429 时记下窗口，窗口内的创建一律立刻抛 ReplicateThrottleError
 * （不发请求）；成功后按 REPLICATE_CREATE_GAP_MS（默认 0）留最小间隔。
 */
let nextCreateAt = 0;

function createGapMs(): number {
  const raw = Number.parseInt(process.env.REPLICATE_CREATE_GAP_MS ?? "", 10);
  return Number.isFinite(raw) && raw > 0 ? raw : 0;
}

/** 测试用：清空闸门。 */
export function resetReplicateCreateGate(): void {
  nextCreateAt = 0;
}

/** 距离下一次允许创建 prediction 还有多少毫秒（0 = 现在可以）。 */
export function replicateCreateWaitMs(): number {
  return Math.max(0, nextCreateAt - Date.now());
}

export interface RetryOptions {
  /** 总尝试次数（含第一次），默认 3 */
  attempts?: number;
  /** 首次退避毫秒，默认 800（指数退避） */
  baseDelayMs?: number;
  /** 单次尝试超时（毫秒），默认 30s；0 = 不超时 */
  timeoutMs?: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 对 Replicate 调用做有限次退避重试（429/5xx/网络错误）。
 * 用于 5 张 fan-out：单张图的 429 不应该让整单失败。
 */
export async function withReplicateRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const attempts = Math.max(1, options.attempts ?? 3);
  const baseDelay = Math.max(0, options.baseDelayMs ?? 800);
  const timeoutMs = options.timeoutMs ?? 30_000;
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      if (timeoutMs > 0) {
        return await Promise.race([
          fn(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Replicate request timed out after ${timeoutMs}ms`)), timeoutMs),
          ),
        ]);
      }
      return await fn();
    } catch (error) {
      lastError = error;
      const retryable = isRetryableReplicateError(error);
      if (!retryable || attempt === attempts - 1) throw error;
      await sleep(baseDelay * 2 ** attempt);
    }
  }
  throw lastError;
}

async function req<T>(path: string, init: RequestInit = {}, retry: RetryOptions = {}): Promise<T> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("REPLICATE_API_TOKEN missing");
  return withReplicateRetry(async () => {
    const res = await replicateFetch(`${apiBase()}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Replicate ${res.status}: ${text.slice(0, 300)}`);
    }
    return (await res.json()) as T;
  }, retry);
}

export async function getLatestVersion(owner: string, name: string): Promise<string> {
  const key = `${owner}/${name}`;
  const cached = versionCache.get(key);
  if (cached) return cached;
  const model = await req<{ latest_version?: { id?: string } }>(`/models/${owner}/${name}`);
  const version = model.latest_version?.id;
  if (!version) throw new Error(`No latest_version for ${key}`);
  versionCache.set(key, version);
  return version;
}

export async function createPrediction(
  version: string,
  input: Record<string, unknown>,
  webhook?: string,
  retry: RetryOptions = {},
) {
  // Account-level throttle gate: never fire a create request while the last 429
  // window is still open. This turns a rate limit into "wait a few seconds"
  // instead of "this image failed".
  const waitMs = nextCreateAt - Date.now();
  if (waitMs > 0) {
    throw new ReplicateThrottleError(waitMs, `Replicate rate limit window open for another ${waitMs}ms`);
  }
  try {
    const prediction = await req<ReplicatePrediction>(
      "/predictions",
      {
        method: "POST",
        body: JSON.stringify({ version, input, ...(webhook ? { webhook } : {}) }),
      },
      retry,
    );
    const gap = createGapMs();
    if (gap > 0) nextCreateAt = Date.now() + gap;
    return prediction;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/Replicate 429\b/.test(message)) {
      const retryAfterMs = parseReplicateRetryAfterMs(message);
      nextCreateAt = Date.now() + retryAfterMs;
      throw new ReplicateThrottleError(retryAfterMs, `Replicate rate limit: ${message.slice(0, 240)}`);
    }
    throw error;
  }
}

/** cjwbw/demucs：输入音频 URL → 4 stems（vocals/bass/drums/other） */
export async function createDemucsPrediction(
  audioUrl: string,
  modelName = "htdemucs",
  webhook?: string,
) {
  const version = await getLatestVersion("cjwbw", "demucs");
  return createPrediction(
    version,
    {
      audio: audioUrl,
      model_name: modelName,
      output_format: "mp3",
      mp3_bitrate: 320,
    },
    webhook,
  );
}

/** cdingram/face-swap：目标图 + 参考脸 → 融合图 */
export async function createFaceSwapPrediction(targetImage: string, swapImage: string, webhook?: string) {
  const version = await getLatestVersion("cdingram", "face-swap");
  return createPrediction(version, { input_image: targetImage, swap_image: swapImage }, webhook);
}

/** black-forest-labs/flux-kontext-pro：参考图 + 编辑 prompt → 图（B 站 Replicate-only 备选） */
export async function createFluxKontextPrediction(
  prompt: string,
  inputImage: string,
  aspectRatio = "1:1",
  webhook?: string,
) {
  const version = await getLatestVersion("black-forest-labs", "flux-kontext-pro");
  return createPrediction(version, { prompt, input_image: inputImage, aspect_ratio: aspectRatio }, webhook);
}

export async function getPrediction(id: string, retry: RetryOptions = { attempts: 2, baseDelayMs: 400 }) {
  return req<ReplicatePrediction>(`/predictions/${id}`, {}, retry);
}

/** 轮询直到完成；供本地测试/无 webhook 场景使用（生产用调用方轮询/GET 推进） */
export async function waitForPrediction(id: string, timeoutMs = 10 * 60 * 1000, intervalMs = 2000) {
  const start = Date.now();
  for (;;) {
    const pred = await getPrediction(id);
    if (pred.status === "succeeded" || pred.status === "failed" || pred.status === "canceled") return pred;
    if (Date.now() - start > timeoutMs) throw new Error(`Prediction ${id} timed out`);
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

/** 从 Replicate prediction 的 output 里取第一张图 URL（string 或 string[] 都兼容）。 */
export function firstImageUrl(output: unknown): string | null {
  if (typeof output === "string" && output.length > 0) return output;
  if (Array.isArray(output)) {
    const first = output.find((item) => typeof item === "string" && item.length > 0);
    return typeof first === "string" ? first : null;
  }
  if (output && typeof output === "object") {
    const record = output as Record<string, unknown>;
    for (const key of ["image", "url", "output"]) {
      const value = record[key];
      if (typeof value === "string" && value.length > 0) return value;
    }
  }
  return null;
}
