/**
 * Replicate 客户端（真实实现）
 * 文档：https://replicate.com/docs/topics/predictions/create-a-prediction
 *
 * 注意：社区模型必须用 `version`（hash）创建 prediction；
 * 直接用 model slug 的 /models/{owner}/{name}/predictions 对社区模型会 404。
 * 这里先 GET /models/{owner}/{name} 拿 latest_version.id，再 POST /predictions。
 */
const API = "https://api.replicate.com/v1";

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

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("REPLICATE_API_TOKEN missing");
  const res = await replicateFetch(`${API}${path}`, {
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

export async function createPrediction(version: string, input: Record<string, unknown>, webhook?: string) {
  return req<ReplicatePrediction>("/predictions", {
    method: "POST",
    body: JSON.stringify({ version, input, ...(webhook ? { webhook } : {}) }),
  });
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

export async function getPrediction(id: string) {
  return req<ReplicatePrediction>(`/predictions/${id}`);
}

/** 轮询直到完成；供本地测试/无 webhook 场景使用（生产用 webhook） */
export async function waitForPrediction(id: string, timeoutMs = 10 * 60 * 1000, intervalMs = 2000) {
  const start = Date.now();
  for (;;) {
    const pred = await getPrediction(id);
    if (pred.status === "succeeded" || pred.status === "failed" || pred.status === "canceled") return pred;
    if (Date.now() - start > timeoutMs) throw new Error(`Prediction ${id} timed out`);
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}
