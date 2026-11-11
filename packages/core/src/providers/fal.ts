/**
 * fal.ai 客户端（真实实现，待付款后启用）
 * 文档：https://fal.ai/docs
 */
export function isFalConfigured(): boolean {
  return Boolean(process.env.FAL_KEY);
}

export interface FalQueueResult {
  request_id: string;
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  response_url?: string;
}

/** fal-ai/flux-pulid：1 张参考脸 + prompt → 头像图 */
export async function submitFluxPulid(referenceImage: string, prompt: string) {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("FAL_KEY missing");
  const res = await fetch("https://queue.fal.run/fal-ai/flux-pulid", {
    method: "POST",
    headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: referenceImage, prompt, image_size: "square_hd", num_images: 1 }),
  });
  if (!res.ok) throw new Error(`fal ${res.status}: ${await res.text()}`);
  return (await res.json()) as FalQueueResult;
}
