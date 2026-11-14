import { NextResponse } from "next/server";
import {
  advanceMockJob,
  buildObjectKey,
  confirmOrderAllowance,
  getJob,
  getPersistedJob,
  getPrediction,
  persistJob,
  r2DownloadUrl,
  r2PutObject,
  refundOrderAllowance,
  updateJob,
} from "@paid/core";

const STEM_ORDER = ["vocals", "instrumental", "drums", "bass", "other"] as const;

const TRANSIENT_PROVIDER_ERROR = /\b(429|500|502|503|504)\b|timeout|timed out|ECONN|fetch failed|rate limit/i;

function isTransientProviderError(err: unknown): boolean {
  return TRANSIENT_PROVIDER_ERROR.test(err instanceof Error ? err.message : String(err));
}

function settlementIds(job: { input: Record<string, unknown> }): { orderId: string | null; reservationId: string | null } {
  return {
    orderId: typeof job.input.orderId === "string" ? job.input.orderId : null,
    reservationId: typeof job.input.reservationId === "string" ? job.input.reservationId : null,
  };
}

/**
 * Confirm the reservation when the job is done, refund it when the job fails.
 * Both helpers are idempotent, so a repeated poll or a retried request cannot double-charge
 * or double-refund. Failures here are logged but never turn a finished job into an error.
 */
async function settleAllowance(job: Parameters<typeof settlementIds>[0], action: "confirm" | "refund", note?: string) {
  const { orderId, reservationId } = settlementIds(job);
  if (!orderId || !reservationId) return;
  try {
    if (action === "confirm") {
      await confirmOrderAllowance("voice", orderId, reservationId);
    } else {
      await refundOrderAllowance("voice", orderId, reservationId, note ?? "job failed");
    }
  } catch (err) {
    console.error("[voice/jobs] allowance settlement failed", action, orderId, reservationId, err);
  }
}

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
    if (next.status === "done") await settleAllowance(next, "confirm");
    if (next.status === "failed") await settleAllowance(next, "refund", next.error ?? "mock job failed");
    return NextResponse.json(next);
  }

  try {
    const prediction = await getPrediction(predictionId);
    if (prediction.status === "failed" || prediction.status === "canceled") {
      await settleAllowance(job, "refund", prediction.error ?? "provider failed or canceled");
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
    const stored = await Promise.all(
      STEM_ORDER.filter((name) => typeof output[name] === "string").map(async (name) => {
        const sourceUrl = output[name] as string;
        const key = buildObjectKey("voice", "out", job.id, `${name}.mp3`);
        try {
          const upstream = await fetch(sourceUrl, { signal: AbortSignal.timeout(45_000) });
          if (upstream.ok) {
            const bytes = await upstream.arrayBuffer();
            const saved = await r2PutObject(key, bytes, "audio/mpeg");
            if (saved) {
              const download = await r2DownloadUrl(key);
              if (download) return { name: `${name}.mp3`, url: download, key };
            }
          }
        } catch {
          /* fall back to the provider URL below */
        }
        return { name: `${name}.mp3`, url: sourceUrl };
      }),
    );
    const r2Keys: Record<string, string> = {};
    for (const file of stored) if (file.key) r2Keys[file.name] = file.key;
    // Persist the R2 keys so the order-recovery endpoint can re-sign links long after the
    // original 7-day URL has expired (R2 out/ objects are retained for 30 days).
    await settleAllowance(job, "confirm");
    return finish({
      status: "done",
      progress: 100,
      files: stored.map(({ name, url }) => ({ name, url })),
      meta: {
        ...job.meta,
        real: true,
        provider: "replicate",
        predictTime: prediction.metrics?.predict_time,
        r2: stored.length > 0 && Object.keys(r2Keys).length === stored.length,
        r2Keys,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Provider lookup failed.";
    const previousErrors = Number(job.meta?.providerErrors ?? 0);
    const attempts = previousErrors + 1;
    // A transient 429/502 does not mean the prediction failed; keep polling a
    // few times before refunding and marking the job failed.
    if (isTransientProviderError(err) && attempts < 3) {
      return finish({
        status: "running",
        progress: 60,
        meta: { ...job.meta, providerErrors: attempts, lastProviderError: message.slice(0, 200) },
      });
    }
    await settleAllowance(job, "refund", "provider lookup failed");
    return finish({
      status: "failed",
      progress: 100,
      error: message,
    });
  }
}
