/**
 * Replicate 客户端（真实实现，待 2026-11-13 付款后启用）
 * 文档：https://replicate.com/docs/topics/predictions/create-a-prediction
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
}

async function call(path: string, init: RequestInit = {}): Promise<ReplicatePrediction> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("REPLICATE_API_TOKEN missing");
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`Replicate ${res.status}: ${await res.text()}`);
  return (await res.json()) as ReplicatePrediction;
}

/** cjwbw/demucs：输入音频 URL → 4 stems */
export async function createDemucsPrediction(audioUrl: string, modelName = "htdemucs") {
  return call("/predictions", {
    method: "POST",
    body: JSON.stringify({
      model: "cjwbw/demucs",
      input: { audio: audioUrl, model_name: modelName, output_format: "mp3", mp3_bitrate: 320 },
    }),
  });
}

/** cdingram/face-swap：目标图 + 参考脸 → 融合图 */
export async function createFaceSwapPrediction(targetImage: string, swapImage: string) {
  return call("/predictions", {
    method: "POST",
    body: JSON.stringify({ model: "cdingram/face-swap", input: { input_image: targetImage, swap_image: swapImage } }),
  });
}

export async function getPrediction(id: string) {
  return call(`/predictions/${id}`);
}
