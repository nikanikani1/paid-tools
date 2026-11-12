import { NextResponse } from "next/server";
import {
  advanceMockJob,
  buildObjectKey,
  getJob,
  getPersistedJob,
  getPrediction,
  persistJob,
  r2DownloadUrl,
  r2PutObject,
  updateJob,
} from "@paid/core";

const STEM_ORDER = ["vocals", "instrumental", "drums", "bass", "other"] as const;

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
    const prediction = await getPrediction(predictionId);
    if (prediction.status === "failed" || prediction.status === "canceled") {
      return finish({
        status: "failed",
        progress: 100,
        error: prediction.error ?? "Separation failed. Please try another file.",
      });
    }
    if (prediction.status !== "succeeded") {
      return finish({ status: "running", progress: 60 });
    }

    const output = (prediction.output ?? {}) as Record<string, string | null>;
    const files = await Promise.all(
      STEM_ORDER.filter((name) => typeof output[name] === "string").map(async (name) => {
        const sourceUrl = output[name] as string;
        const key = buildObjectKey("voice", "out", job.id, `${name}.mp3`);
        try {
          const upstream = await fetch(sourceUrl, { signal: AbortSignal.timeout(45_000) });
          if (upstream.ok) {
            const bytes = await upstream.arrayBuffer();
            const stored = await r2PutObject(key, bytes, "audio/mpeg");
            if (stored) {
              const download = await r2DownloadUrl(key);
              if (download) return { name: `${name}.mp3`, url: download };
            }
          }
        } catch {
          /* fall back to the provider URL below */
        }
        return { name: `${name}.mp3`, url: sourceUrl };
      }),
    );
    return finish({
      status: "done",
      progress: 100,
      files,
      meta: {
        real: true,
        provider: "replicate",
        predictTime: prediction.metrics?.predict_time,
        r2: files.every((f) => f.url.includes("r2.cloudflarestorage.com")),
      },
    });
  } catch (err) {
    return finish({
      status: "failed",
      progress: 100,
      error: err instanceof Error ? err.message : "Provider lookup failed.",
    });
  }
}
