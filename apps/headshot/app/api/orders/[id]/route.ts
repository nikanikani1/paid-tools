import { NextResponse } from "next/server";
import {
  advanceMockJob,
  buildObjectKey,
  createFaceSwapPrediction,
  getJob,
  getPersistedJob,
  getPrediction,
  persistJob,
  r2DownloadUrl,
  r2PutObject,
  updateJob,
} from "@paid/core";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const job = getJob(id) ?? (await getPersistedJob(id));
  if (!job) return NextResponse.json({ error: "not found" }, { status: 404 });
  const jobId = job.id;

  async function finish(patch: Parameters<typeof updateJob>[1]) {
    const next = updateJob(jobId, patch);
    if (next) await persistJob(next.id);
    return NextResponse.json(next);
  }

  const predictionId = typeof job.input.predictionId === "string" ? job.input.predictionId : null;
  if (!predictionId || job.input.real !== true) {
    const next = advanceMockJob(job);
    await persistJob(next.id);
    return NextResponse.json(next);
  }

  try {
    // Stage 2: face-swap back to the original selfie
    const faceSwapId = typeof job.input.faceSwapId === "string" ? job.input.faceSwapId : null;
    if (faceSwapId) {
      const swap = await getPrediction(faceSwapId);
      if (swap.status === "failed" || swap.status === "canceled") {
        return finish({ status: "failed", progress: 100, error: swap.error ?? "Face swap failed." });
      }
      if (swap.status !== "succeeded") {
        return finish({ status: "running", progress: 85 });
      }
      const url = Array.isArray(swap.output) ? swap.output[0] : swap.output;
      let finalUrl = String(url);
      const key = buildObjectKey("headshot", "out", job.id, "headshot-01.jpg");
      try {
        const upstream = await fetch(finalUrl, { signal: AbortSignal.timeout(45_000) });
        if (upstream.ok) {
          const bytes = await upstream.arrayBuffer();
          const stored = await r2PutObject(key, bytes, "image/jpeg");
          if (stored) finalUrl = (await r2DownloadUrl(key)) ?? finalUrl;
        }
      } catch {
        /* fall back to the provider URL below */
      }
      return finish({
        status: "done",
        progress: 100,
        files: [{ name: "headshot-01.jpg", url: finalUrl }],
        meta: { ...job.meta, testMode: true, faceSwapPredictTime: swap.metrics?.predict_time, r2Key: key },
      });
    }

    // Stage 1: Kontext headshot
    const pred = await getPrediction(predictionId);
    if (pred.status === "failed" || pred.status === "canceled") {
      return finish({ status: "failed", progress: 100, error: pred.error ?? "Headshot generation failed." });
    }
    if (pred.status !== "succeeded") {
      return finish({ status: "running", progress: 50 });
    }
    const headshotUrl = Array.isArray(pred.output) ? pred.output[0] : pred.output;
    const selfieUrl = String(job.input.selfieUrl ?? "");
    if (!headshotUrl || !selfieUrl) {
      return finish({ status: "failed", progress: 100, error: "Missing provider URLs." });
    }
    const swap = await createFaceSwapPrediction(String(headshotUrl), selfieUrl);
    return finish({
      status: "running",
      progress: 70,
      input: { ...job.input, faceSwapId: swap.id, headshotUrl },
      meta: { ...job.meta, testMode: true, kontextPredictTime: pred.metrics?.predict_time },
    });
  } catch (err) {
    return finish({
      status: "failed",
      progress: 100,
      error: err instanceof Error ? err.message : "Provider lookup failed.",
    });
  }
}
