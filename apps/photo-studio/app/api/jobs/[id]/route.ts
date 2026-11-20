import { NextResponse } from "next/server";
import {
  confirmOrderAllowance,
  firstImageUrl,
  getPrediction,
  refundOrderAllowance,
} from "@paid/core";
import { brandForKind, siteKindFromEnv } from "@/lib/brands";
import {
  kindForJob,
  loadStudioJob,
  outputNameFor,
  patchStudioJob,
  readJobInput,
  storeGeneratedImage,
} from "@/lib/job-service";

/**
 * GET /api/jobs/[id] — poll the four predictions and finish the pack.
 *
 *  - any prediction failed/canceled  → refund the held reservation, status failed
 *  - all four succeeded              → copy each image to R2, confirm 4 units, status done
 *  - otherwise                       → status running with a progress percentage
 *
 * Confirm/refund are idempotent in core, so a duplicate poll cannot double-charge
 * or double-refund.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const envKind = siteKindFromEnv();
  const job = await loadStudioJob(envKind, id);
  if (!job) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const kind = kindForJob(job);
  if (!kind || kind !== envKind) {
    // Jobs are visible only on the brand deployment that created them.
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (job.status === "done" || job.status === "failed") {
    return NextResponse.json(job);
  }

  const brand = brandForKind(kind);
  const site = brand.site;
  const parsed = readJobInput(job);
  if (!parsed) {
    const failed = await patchStudioJob(kind, job.id, {
      status: "failed",
      progress: 100,
      error: "This job is missing its generation state. If you were charged, contact support.",
    });
    return NextResponse.json(failed ?? job);
  }
  const { orderId, reservationId, predictionIds } = parsed;

  const outputs: (string | null)[] = [];
  let failure: { index: number; reason: string } | null = null;

  for (let index = 0; index < predictionIds.length; index += 1) {
    const predictionId = predictionIds[index];
    try {
      const prediction = await getPrediction(predictionId);
      if (prediction.status === "failed" || prediction.status === "canceled") {
        failure = { index, reason: prediction.error ?? prediction.status };
        break;
      }
      outputs[index] = prediction.status === "succeeded" ? firstImageUrl(prediction.output) : null;
    } catch (error) {
      // Transient read error: keep the job running and let the next poll retry.
      console.warn(`[studio/jobs] prediction ${predictionId} read failed:`, error);
      const current = await patchStudioJob(kind, job.id, {
        status: "running",
        progress: Math.max(5, job.progress),
      });
      return NextResponse.json(current ?? job);
    }
  }

  if (failure) {
    const refunded = await refundOrderAllowance(
      site,
      orderId,
      reservationId,
      `prediction ${failure.index + 1} failed: ${failure.reason}`,
    );
    const failedJob = await patchStudioJob(kind, job.id, {
      status: "failed",
      progress: 100,
      files: [],
      error: `Image ${failure.index + 1} of ${predictionIds.length} failed. You were not charged for this pack.`,
      meta: {
        ...job.meta,
        refunded: refunded.ok ? true : false,
        refundReason: refunded.ok ? undefined : refunded.reason,
        failedIndex: failure.index + 1,
        failureReason: failure.reason,
      },
    });
    return NextResponse.json(failedJob ?? job);
  }

  const finished = outputs.filter((url): url is string => typeof url === "string" && url.length > 0).length;

  if (finished < predictionIds.length) {
    const progress = Math.min(95, Math.max(10, Math.round((finished / predictionIds.length) * 85) + 5));
    const running = await patchStudioJob(kind, job.id, {
      status: "running",
      progress,
      meta: { ...job.meta, completedPredictions: finished, requestedImages: predictionIds.length },
    });
    return NextResponse.json(running ?? job);
  }

  // All four predictions succeeded: store to R2, then charge the reservation.
  const files = [];
  for (let index = 0; index < outputs.length; index += 1) {
    const sourceUrl = outputs[index] as string;
    const stored = await storeGeneratedImage(kind, job.id, outputNameFor(kind, index), sourceUrl);
    files.push(stored);
  }
  const confirmed = await confirmOrderAllowance(site, orderId, reservationId);
  if (!confirmed.ok) {
    console.error(`[studio/jobs] confirm allowance failed for order ${orderId}:`, confirmed.reason);
  }

  const done = await patchStudioJob(kind, job.id, {
    status: "done",
    progress: 100,
    files,
    error: undefined,
    meta: {
      ...job.meta,
      requestedImages: predictionIds.length,
      deliveredImages: files.length,
      r2Stored: files.filter((file) => Boolean(file.r2Key)).length,
      confirmed: confirmed.ok,
      confirmReason: confirmed.ok ? undefined : confirmed.reason,
      orderId,
      reservationId,
      finishedAt: new Date().toISOString(),
    },
  });
  return NextResponse.json(done ?? job);
}
