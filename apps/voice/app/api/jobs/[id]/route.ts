import { NextResponse } from "next/server";
import { advanceMockJob, getJob, getPrediction, updateJob } from "@paid/core";

const STEM_ORDER = ["vocals", "instrumental", "drums", "bass", "other"] as const;

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const job = getJob(id);
  if (!job) return NextResponse.json({ error: "not found" }, { status: 404 });

  const predictionId = typeof job.input.predictionId === "string" ? job.input.predictionId : null;
  if (!predictionId || job.input.real !== true) {
    return NextResponse.json(advanceMockJob(job));
  }

  try {
    const prediction = await getPrediction(predictionId);
    if (prediction.status === "failed" || prediction.status === "canceled") {
      return NextResponse.json(
        updateJob(job.id, {
          status: "failed",
          progress: 100,
          error: prediction.error ?? "Separation failed. Please try another file.",
        }),
      );
    }
    if (prediction.status !== "succeeded") {
      return NextResponse.json(updateJob(job.id, { status: "running", progress: 60 }));
    }

    const output = (prediction.output ?? {}) as Record<string, string | null>;
    const files = STEM_ORDER.filter((name) => typeof output[name] === "string").map((name) => ({
      name: `${name}.mp3`,
      url: output[name] as string,
    }));
    // cjwbw/demucs returns vocals/bass/drums/other. Build an instrumental from stems is
    // done client-side later; for the real E2E we expose the available stems.
    return NextResponse.json(
      updateJob(job.id, {
        status: "done",
        progress: 100,
        files,
        meta: { real: true, provider: "replicate", predictTime: prediction.metrics?.predict_time },
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
