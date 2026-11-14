import { NextResponse } from "next/server";
import {
  advanceMockJob,
  buildObjectKey,
  consumeOrderAllowance,
  createFaceSwapPrediction,
  createFluxKontextPrediction,
  firstImageUrl,
  getJob,
  getPersistedJob,
  getPrediction,
  isReplicateThrottleError,
  persistJob,
  r2DownloadUrl,
  r2PutObject,
  recordJobCost,
  updateJob,
  type Job,
} from "@paid/core";

/**
 * Job polling + fan-out advance.
 *
 * The browser polls this route every ~900ms. Each call advances the 5-image
 * Sample Pack pipeline a little further:
 *   pending → (start flux-kontext) → kontext_running → kontext_done
 *           → (start face-swap)   → swap_running     → download → R2 → done
 *
 * A failed stage gets exactly one retry (so a 429 or a provider blip does not
 * kill the image). Terminal slots are marked failed with a reason. When every
 * slot is terminal the job is finalised and the order allowance is consumed for
 * the number of images actually delivered — never for the requested count.
 */
const MAX_CONCURRENCY = 3;
/** Max provider calls per poll (keeps the HTTP request short). */
const CALL_BUDGET = 10;

type SlotStatus = "pending" | "kontext_running" | "kontext_done" | "swap_running" | "done" | "failed";

interface Slot {
  index: number;
  prompt: string;
  selfieUrl: string;
  status: SlotStatus;
  kontextId: string | null;
  faceSwapId: string | null;
  headshotUrl: string | null;
  url: string | null;
  r2Key: string | null;
  r2Note?: string;
  kontextAttempts: number;
  swapAttempts: number;
  error: string | null;
  stage?: "kontext" | "swap";
  retryAt?: number;
  kontextSeconds?: number;
  swapSeconds?: number;
}

function readSlots(raw: unknown): Slot[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const slots: Slot[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") return null;
    const s = item as Record<string, unknown>;
    if (typeof s.index !== "number" || typeof s.prompt !== "string" || typeof s.selfieUrl !== "string") return null;
    slots.push({
      index: s.index,
      prompt: s.prompt,
      selfieUrl: s.selfieUrl,
      status: (typeof s.status === "string" ? s.status : "pending") as SlotStatus,
      kontextId: typeof s.kontextId === "string" ? s.kontextId : null,
      faceSwapId: typeof s.faceSwapId === "string" ? s.faceSwapId : null,
      headshotUrl: typeof s.headshotUrl === "string" ? s.headshotUrl : null,
      url: typeof s.url === "string" ? s.url : null,
      r2Key: typeof s.r2Key === "string" ? s.r2Key : null,
      r2Note: typeof s.r2Note === "string" ? s.r2Note : undefined,
      kontextAttempts: typeof s.kontextAttempts === "number" ? s.kontextAttempts : 0,
      swapAttempts: typeof s.swapAttempts === "number" ? s.swapAttempts : 0,
      error: typeof s.error === "string" ? s.error : null,
      stage: s.stage === "kontext" || s.stage === "swap" ? s.stage : undefined,
      retryAt: typeof s.retryAt === "number" ? s.retryAt : undefined,
      kontextSeconds: typeof s.kontextSeconds === "number" ? s.kontextSeconds : undefined,
      swapSeconds: typeof s.swapSeconds === "number" ? s.swapSeconds : undefined,
    });
  }
  return slots;
}

function slotWeight(status: SlotStatus): number {
  switch (status) {
    case "done":
      return 1;
    case "failed":
      return 1;
    case "swap_running":
      return 0.6;
    case "kontext_done":
      return 0.4;
    case "kontext_running":
      return 0.25;
    default:
      return 0;
  }
}

function progressFor(slots: Slot[]): number {
  const total = slots.length || 1;
  const sum = slots.reduce((acc, slot) => acc + slotWeight(slot.status), 0);
  return Math.max(1, Math.min(99, Math.round((sum / total) * 100)));
}

function isTerminal(slot: Slot): boolean {
  return slot.status === "done" || slot.status === "failed";
}

/**
 * Copy a finished provider image into R2. Provider CDN downloads are the flaky
 * part in practice (observed: transient `fetch failed` on replicate.delivery),
 * so retry the download, and retry the PUT once. Always returns a usable URL:
 * the R2 key when stored, the provider URL as a fallback.
 */
async function storeOutput(
  jobId: string,
  slot: Slot,
): Promise<{ url: string; r2Key: string | null; note?: string }> {
  const source = slot.url ?? slot.headshotUrl;
  const key = buildObjectKey("headshot", "out", jobId, `headshot-${String(slot.index).padStart(2, "0")}.jpg`);
  if (!source) return { url: "", r2Key: null, note: "no provider url" };
  let lastNote = "";
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const upstream = await fetch(source, { signal: AbortSignal.timeout(60_000) });
      if (!upstream.ok) {
        lastNote = `provider download HTTP ${upstream.status}`;
        continue;
      }
      const bytes = await upstream.arrayBuffer();
      for (let putAttempt = 0; putAttempt < 2; putAttempt += 1) {
        const stored = await r2PutObject(key, bytes, "image/jpeg");
        if (stored) {
          const signed = await r2DownloadUrl(key);
          if (signed) return { url: signed, r2Key: key };
          lastNote = "R2 presign download failed";
          continue;
        }
        lastNote = "R2 put returned null";
      }
    } catch (error) {
      lastNote = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    }
    await new Promise((resolve) => setTimeout(resolve, 900 * (attempt + 1)));
  }
  return { url: source, r2Key: null, note: lastNote || "unknown store error" };
}

/** Start stage 1 for slots that fit the in-flight budget. */
async function startPendingKontext(slots: Slot[]): Promise<number> {
  let calls = 0;
  const active = slots.filter((s) => s.status === "kontext_running" || s.status === "swap_running").length;
  let budget = Math.max(0, MAX_CONCURRENCY - active);
  const now = Date.now();
  for (const slot of slots) {
    if (budget <= 0 || calls >= CALL_BUDGET) break;
    if (slot.status !== "pending") continue;
    if (slot.retryAt && slot.retryAt > now) continue;
    try {
      const prediction = await createFluxKontextPrediction(slot.prompt, slot.selfieUrl);
      calls += 1;
      slot.kontextId = prediction.id;
      slot.status = "kontext_running";
      slot.error = null;
      budget -= 1;
    } catch (error) {
      if (isReplicateThrottleError(error)) {
        // Account-level throttle: wait for the window instead of failing the image.
        slot.error = `Waiting out the image provider's rate limit (~${Math.ceil(error.retryAfterMs / 1000)}s).`;
        slot.retryAt = Date.now() + error.retryAfterMs + 250;
        continue;
      }
      calls += 1;
      slot.kontextAttempts += 1;
      const message = error instanceof Error ? error.message : String(error);
      if (slot.kontextAttempts >= 2) {
        slot.status = "failed";
        slot.stage = "kontext";
        slot.error = `Could not start the headshot model: ${message}`;
      } else {
        slot.error = `Retrying headshot stage: ${message}`;
        slot.retryAt = Date.now() + 900 * slot.kontextAttempts;
      }
    }
  }
  return calls;
}

async function advanceFanoutJob(jobId: string): Promise<Job | undefined> {
  const current = getJob(jobId) ?? (await getPersistedJob(jobId));
  if (!current) return undefined;
  const slots = readSlots(current.input.slots);
  if (!slots) return current;
  let calls = 0;

  // 1) Poll running stage-1 predictions.
  for (const slot of slots) {
    if (calls >= CALL_BUDGET) break;
    if (slot.status !== "kontext_running" || !slot.kontextId) continue;
    try {
      const prediction = await getPrediction(slot.kontextId);
      calls += 1;
      if (prediction.status === "succeeded") {
        const url = firstImageUrl(prediction.output);
        slot.headshotUrl = url;
        slot.kontextSeconds = prediction.metrics?.predict_time;
        if (!url) {
          slot.kontextAttempts += 1;
          if (slot.kontextAttempts >= 2) {
            slot.status = "failed";
            slot.stage = "kontext";
            slot.error = "Headshot model returned no image.";
          } else {
            slot.status = "pending";
            slot.kontextId = null;
            slot.error = "Headshot model returned no image, retrying.";
            slot.retryAt = Date.now() + 900;
          }
        } else {
          slot.status = "kontext_done";
          slot.error = null;
        }
      } else if (prediction.status === "failed" || prediction.status === "canceled") {
        slot.kontextAttempts += 1;
        const reason = prediction.error ?? prediction.status;
        if (slot.kontextAttempts >= 2) {
          slot.status = "failed";
          slot.stage = "kontext";
          slot.error = `Headshot stage failed: ${reason}`;
        } else {
          slot.status = "pending";
          slot.kontextId = null;
          slot.error = `Headshot stage failed (${reason}), retrying.`;
          slot.retryAt = Date.now() + 900;
        }
      }
    } catch (error) {
      if (isReplicateThrottleError(error)) {
        // Account-level throttle: wait for the window instead of failing the image.
        slot.error = `Waiting out the image provider's rate limit (~${Math.ceil(error.retryAfterMs / 1000)}s).`;
        slot.retryAt = Date.now() + error.retryAfterMs + 250;
        continue;
      }
      calls += 1;
      slot.kontextAttempts += 1;
      const message = error instanceof Error ? error.message : String(error);
      if (slot.kontextAttempts >= 2) {
        slot.status = "failed";
        slot.stage = "kontext";
        slot.error = `Could not read headshot prediction: ${message}`;
      } else {
        slot.retryAt = Date.now() + 900;
        slot.error = `Polling headshot stage failed (${message}), retrying.`;
      }
    }
  }

  // 2) Start stage 1 for pending slots.
  calls += await startPendingKontext(slots);

  // 3) Start stage-2 face-swap for slots whose headshot is ready.
  for (const slot of slots) {
    if (calls >= CALL_BUDGET) break;
    if (slot.status !== "kontext_done" || !slot.headshotUrl) continue;
    const activeSwaps = slots.filter((s) => s.status === "swap_running").length;
    if (activeSwaps >= MAX_CONCURRENCY) break;
    try {
      const swap = await createFaceSwapPrediction(slot.headshotUrl, slot.selfieUrl);
      calls += 1;
      slot.faceSwapId = swap.id;
      slot.status = "swap_running";
      slot.error = null;
    } catch (error) {
      if (isReplicateThrottleError(error)) {
        slot.error = `Waiting out the image provider's rate limit (~${Math.ceil(error.retryAfterMs / 1000)}s).`;
        slot.retryAt = Date.now() + error.retryAfterMs + 250;
        continue;
      }
      calls += 1;
      slot.swapAttempts += 1;
      const message = error instanceof Error ? error.message : String(error);
      if (slot.swapAttempts >= 2) {
        slot.status = "failed";
        slot.stage = "swap";
        slot.error = `Could not start the face-merge stage: ${message}`;
      } else {
        slot.error = `Retrying face-merge stage: ${message}`;
        slot.retryAt = Date.now() + 900 * slot.swapAttempts;
      }
    }
  }

  // 4) Poll stage-2 predictions, copy finished images to R2.
  for (const slot of slots) {
    if (calls >= CALL_BUDGET) break;
    if (slot.status !== "swap_running" || !slot.faceSwapId) continue;
    try {
      const prediction = await getPrediction(slot.faceSwapId);
      calls += 1;
      if (prediction.status !== "succeeded" && prediction.status !== "failed" && prediction.status !== "canceled") continue;
      if (prediction.status === "succeeded") {
        const url = firstImageUrl(prediction.output);
        slot.swapSeconds = prediction.metrics?.predict_time;
        if (!url) {
          slot.swapAttempts += 1;
          if (slot.swapAttempts >= 2) {
            slot.status = "failed";
            slot.stage = "swap";
            slot.error = "Face-merge model returned no image.";
          } else {
            slot.status = "kontext_done";
            slot.faceSwapId = null;
            slot.error = "Face-merge model returned no image, retrying.";
            slot.retryAt = Date.now() + 900;
          }
        } else {
          slot.url = url;
          const stored = await storeOutput(jobId, slot);
          slot.url = stored.url;
          slot.r2Key = stored.r2Key;
          slot.r2Note = stored.note;
          slot.status = "done";
          slot.error = null;
          try {
            recordJobCost({ jobId, site: "headshot", ruleId: "headshot:kontext", units: 1, note: `slot ${slot.index}` });
            recordJobCost({ jobId, site: "headshot", ruleId: "headshot:face-swap", units: 1, note: `slot ${slot.index}` });
          } catch {
            /* cost logging must never fail the delivery */
          }
        }
      } else {
        slot.swapAttempts += 1;
        const reason = prediction.error ?? prediction.status;
        if (slot.swapAttempts >= 2) {
          slot.status = "failed";
          slot.stage = "swap";
          slot.error = `Face-merge stage failed: ${reason}`;
        } else {
          slot.status = "kontext_done";
          slot.faceSwapId = null;
          slot.error = `Face-merge stage failed (${reason}), retrying.`;
          slot.retryAt = Date.now() + 900;
        }
      }
    } catch (error) {
      calls += 1;
      slot.swapAttempts += 1;
      const message = error instanceof Error ? error.message : String(error);
      if (slot.swapAttempts >= 2) {
        slot.status = "failed";
        slot.stage = "swap";
        slot.error = `Could not read face-merge prediction: ${message}`;
      } else {
        slot.error = `Polling face-merge stage failed (${message}), retrying.`;
      }
    }
  }

  const done = slots.filter((slot) => slot.status === "done" && slot.url);
  const failed = slots.filter((slot) => slot.status === "failed");
  const finished = done.length + failed.length === slots.length;

  if (!finished) {
    return updateJob(jobId, {
      status: "running",
      progress: progressFor(slots),
      input: { ...current.input, slots },
      meta: {
        ...current.meta,
        real: true,
        fanout: true,
        requestedImages: slots.length,
        succeeded: done.length,
        failed: failed.length,
        failures: failed.map((slot) => ({ index: slot.index, stage: slot.stage ?? "unknown", reason: slot.error ?? "unknown" })),
      },
    });
  }

  // Finalise: charge the order for delivered images only.
  const files = done
    .sort((a, b) => a.index - b.index)
    .map((slot) => ({ name: `headshot-${String(slot.index).padStart(2, "0")}.jpg`, url: slot.url as string }));
  const failures = failed.map((slot) => ({
    index: slot.index,
    stage: slot.stage ?? "unknown",
    reason: slot.error ?? "unknown",
  }));

  const orderId = typeof current.input.orderId === "string" ? current.input.orderId : "";
  let chargedUnits = typeof current.meta?.chargedUnits === "number" ? current.meta.chargedUnits : 0;
  let charged = current.meta?.charged === true;

  // Two browser polls can hit the finalise branch concurrently (Workers/Node are
  // async). Guard the allowance consumption so a request pair cannot charge twice.
  const locks = (globalThis as { __headshotFinalizeLocks?: Set<string> }).__headshotFinalizeLocks ?? new Set<string>();
  (globalThis as { __headshotFinalizeLocks?: Set<string> }).__headshotFinalizeLocks = locks;
  if (locks.has(jobId)) return getJob(jobId);
  locks.add(jobId);
  try {
    if (orderId && files.length > 0 && !charged) {
      await consumeOrderAllowance("headshot", orderId, files.length);
      charged = true;
      chargedUnits = files.length;
    }
  } finally {
    locks.delete(jobId);
  }

  const error =
    files.length === 0
      ? `All ${slots.length} images failed. You were not charged.`
      : failures.length > 0
        ? `${failures.length} of ${slots.length} images failed — you were charged for ${files.length}.`
        : undefined;

  return updateJob(jobId, {
    status: files.length === 0 ? "failed" : "done",
    progress: 100,
    files,
    error,
    input: { ...current.input, slots },
    meta: {
      ...current.meta,
      real: true,
      fanout: true,
      requestedImages: slots.length,
      succeeded: files.length,
      failed: failures.length,
      failures,
      charged,
      chargedUnits,
      orderId: orderId || undefined,
      r2Stored: done.filter((slot) => slot.r2Key).length,
      r2Keys: done.map((slot) => slot.r2Key).filter(Boolean),
      r2Failures: done
        .filter((slot) => !slot.r2Key)
        .map((slot) => ({ index: slot.index, note: slot.r2Note ?? "unknown" })),
      kontextPredictTime: done.reduce((acc, slot) => acc + (slot.kontextSeconds ?? 0), 0),
      faceSwapPredictTime: done.reduce((acc, slot) => acc + (slot.swapSeconds ?? 0), 0),
      finishedAt: new Date().toISOString(),
    },
  });
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

  // Terminal jobs are returned as-is; the charge already happened at finalise.
  if (job.status === "done" || job.status === "failed") return NextResponse.json(job);

  // 5-image fan-out jobs.
  const fanoutSlots = readSlots(job.input.slots);
  if (fanoutSlots && job.input.real === true) {
    const next = await advanceFanoutJob(jobId);
    if (!next) return NextResponse.json({ error: "not_found" }, { status: 404 });
    await persistJob(next.id);
    return NextResponse.json(next);
  }

  // Mock jobs advance on a timer.
  const predictionId = typeof job.input.predictionId === "string" ? job.input.predictionId : null;
  if (!predictionId || job.input.real !== true) {
    const next = advanceMockJob(job);
    await persistJob(next.id);
    return NextResponse.json(next);
  }

  // Legacy single-image jobs (created before the fan-out change).
  try {
    const faceSwapId = typeof job.input.faceSwapId === "string" ? job.input.faceSwapId : null;
    if (faceSwapId) {
      const swap = await getPrediction(faceSwapId);
      if (swap.status === "failed" || swap.status === "canceled") {
        return finish({ status: "failed", progress: 100, error: swap.error ?? "Face swap failed." });
      }
      if (swap.status !== "succeeded") {
        return finish({ status: "running", progress: 85 });
      }
      const url = firstImageUrl(swap.output);
      let finalUrl = String(url ?? "");
      const key = buildObjectKey("headshot", "out", jobId, "headshot-01.jpg");
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
        meta: { ...job.meta, faceSwapPredictTime: swap.metrics?.predict_time, r2Key: key },
      });
    }

    const pred = await getPrediction(predictionId);
    if (pred.status === "failed" || pred.status === "canceled") {
      return finish({ status: "failed", progress: 100, error: pred.error ?? "Headshot generation failed." });
    }
    if (pred.status !== "succeeded") {
      return finish({ status: "running", progress: 50 });
    }
    const headshotUrl = firstImageUrl(pred.output);
    const selfieUrl = String(job.input.selfieUrl ?? "");
    if (!headshotUrl || !selfieUrl) {
      return finish({ status: "failed", progress: 100, error: "Missing provider URLs." });
    }
    const swap = await createFaceSwapPrediction(headshotUrl, selfieUrl);
    return finish({
      status: "running",
      progress: 70,
      input: { ...job.input, faceSwapId: swap.id, headshotUrl },
      meta: { ...job.meta, kontextPredictTime: pred.metrics?.predict_time },
    });
  } catch (err) {
    return finish({
      status: "failed",
      progress: 100,
      error: err instanceof Error ? err.message : "Provider lookup failed.",
    });
  }
}
