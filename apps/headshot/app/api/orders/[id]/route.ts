import { NextResponse } from "next/server";
import { advanceMockJob, createFaceSwapPrediction, getJob, getPrediction, updateJob } from "@paid/core";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const job = getJob(id);
  if (!job) return NextResponse.json({ error: "not found" }, { status: 404 });

  const predictionId = typeof job.input.predictionId === "string" ? job.input.predictionId : null;
  if (!predictionId || job.input.real !== true) {
    return NextResponse.json(advanceMockJob(job));
  }

  try {
    // Stage 2: face-swap back to the original selfie
    const faceSwapId = typeof job.input.faceSwapId === "string" ? job.input.faceSwapId : null;
    if (faceSwapId) {
      const swap = await getPrediction(faceSwapId);
      if (swap.status === "failed" || swap.status === "canceled") {
        return NextResponse.json(
          updateJob(job.id, { status: "failed", progress: 100, error: swap.error ?? "Face swap failed." }),
        );
      }
      if (swap.status !== "succeeded") {
        return NextResponse.json(updateJob(job.id, { status: "running", progress: 85 }));
      }
      const url = Array.isArray(swap.output) ? swap.output[0] : swap.output;
      return NextResponse.json(
        updateJob(job.id, {
          status: "done",
          progress: 100,
          files: [{ name: "headshot-01.jpg", url: String(url) }],
          meta: { ...job.meta, testMode: true, faceSwapPredictTime: swap.metrics?.predict_time },
        }),
      );
    }

    // Stage 1: Kontext headshot
    const pred = await getPrediction(predictionId);
    if (pred.status === "failed" || pred.status === "canceled") {
      return NextResponse.json(
        updateJob(job.id, { status: "failed", progress: 100, error: pred.error ?? "Headshot generation failed." }),
      );
    }
    if (pred.status !== "succeeded") {
      return NextResponse.json(updateJob(job.id, { status: "running", progress: 50 }));
    }
    const headshotUrl = Array.isArray(pred.output) ? pred.output[0] : pred.output;
    const selfieUrl = String(job.input.selfieUrl ?? "");
    if (!headshotUrl || !selfieUrl) {
      return NextResponse.json(updateJob(job.id, { status: "failed", progress: 100, error: "Missing provider URLs." }));
    }
    const swap = await createFaceSwapPrediction(String(headshotUrl), selfieUrl);
    return NextResponse.json(
      updateJob(job.id, {
        status: "running",
        progress: 70,
        input: { ...job.input, faceSwapId: swap.id, headshotUrl },
        meta: { ...job.meta, testMode: true, kontextPredictTime: pred.metrics?.predict_time },
      }),
    );
  } catch (err) {
    return NextResponse.json(
      updateJob(job.id, {
        status: "failed",
        progress: 100,
        error: err instanceof Error ? err.message : "Provider lookup failed.",
      }),
    );
  }
}
