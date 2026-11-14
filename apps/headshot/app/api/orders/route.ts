import { NextResponse } from "next/server";
import {
  appendOrderJob,
  checkOrderAllowance,
  consumeOrderAllowance,
  createFaceSwapPrediction,
  createFluxKontextPrediction,
  createJob,
  createMockHeadshotJob,
  isReplicateConfigured,
  isReplicateThrottleError,
  listJobs,
  lookupCheckoutOrder,
  markOrderPaid,
  persistJob,
  replicateFetch,
  updateJob,
} from "@paid/core";

/**
 * Order creation + fan-out init.
 *
 * Paid-only gate: production must never create a job without a paid order.
 *
 * Sample Pack pipeline (5 images, two stages each):
 *   selfie → flux-kontext-pro (headshot) → cdingram/face-swap (identity)
 * Each of the 5 images gets a different prompt so the set is not 5 clones of
 * the same frame. Up to MAX_CONCURRENCY predictions run at once; the rest are
 * started by the polling GET (/api/orders/[id]) so no single request has to
 * wait for 10 predictions.
 *
 * Allowance is NOT consumed here: it is consumed by the GET once we know how
 * many images actually succeeded (`consumeOrderAllowance(orderId, succeeded)`).
 *
 * Local modes:
 *   ALLOW_MOCK=1 → mock job (no provider);  ALLOW_REAL=1 → real provider, no paid order needed.
 */
const PAYMENT_REQUIRED_MESSAGE =
  "A paid order is required. Start with the $9 Sample Pack (5 headshots) — one-time payment, no subscription.";

/** Only the Sample Pack is implemented; larger packages are hidden by the product task. */
const SAMPLE_PACK_IMAGES = 5;
const MAX_CONCURRENCY = 3;

const PROMPTS = [
  "Turn this selfie into a professional corporate headshot. Keep the exact same person and facial identity. " +
    "Neutral light-gray studio background, soft key light from the front, sharp focus, dark blazer over a light shirt, " +
    "centered head-and-shoulders composition, photorealistic, calm neutral expression.",
  "Turn this selfie into a professional headshot for a company About page. Keep the same face and identity. " +
    "Softly blurred modern office background, warm window light from the left, business-casual button-down shirt, " +
    "head-and-shoulders framing, photorealistic, relaxed subtle smile.",
  "Turn this selfie into a LinkedIn-ready professional headshot. Keep the same person and facial identity. " +
    "Plain warm sand-colored backdrop, even softbox lighting, charcoal blazer, centered head-and-shoulders crop, " +
    "photorealistic, approachable expression with a closed-mouth smile.",
  "Turn this selfie into an executive business portrait. Keep the same face and identity. " +
    "Deep neutral gray studio background, gentle rim light separating the shoulders, navy suit jacket, " +
    "slightly tighter head-and-shoulders composition, photorealistic, confident neutral expression.",
  "Turn this selfie into a professional headshot with a creative-professional look. Keep the same person and identity. " +
    "Textured warm plaster wall background, window light from the right, dark knit sweater, " +
    "head-and-shoulders framing, photorealistic, natural relaxed expression.",
];

function orderIdFrom(req: Request, form?: FormData | null, body?: { orderId?: string } | null): string | null {
  return (
    String(form?.get("orderId") ?? "") ||
    req.headers.get("x-order-id") ||
    String(body?.orderId ?? "") ||
    null
  );
}

async function requirePaidOrder(
  req: Request,
  form: FormData | null,
  body: { orderId?: string } | null,
  requestedImages: number,
): Promise<{ ok: true; orderId: string } | { ok: false; response: NextResponse }> {
  if (process.env.ALLOW_MOCK === "1" || process.env.ALLOW_REAL === "1") return { ok: true, orderId: "" };
  const orderId = orderIdFrom(req, form, body);
  if (!orderId) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "payment_required", message: PAYMENT_REQUIRED_MESSAGE, minimum_order_usd: 9 },
        { status: 402 },
      ),
    };
  }
  let allowance = await checkOrderAllowance("headshot", orderId, requestedImages);
  if (!allowance.ok && allowance.reason === "unpaid") {
    // Live Waffo webhooks can be withheld while the store is under review.
    const remote = await lookupCheckoutOrder(orderId);
    if (remote?.paid) {
      await markOrderPaid("headshot", orderId, {
        providerOrderId: remote.providerOrderId,
        email: remote.email,
        metadata: { lastEventType: "reconcile", remoteStatus: remote.rawStatus },
      });
      allowance = await checkOrderAllowance("headshot", orderId, requestedImages);
    }
  }
  if (!allowance.ok) {
    const message =
      allowance.reason === "insufficient"
        ? "This order does not have enough images left. Buy another package to continue."
        : PAYMENT_REQUIRED_MESSAGE;
    return {
      ok: false,
      response: NextResponse.json({ error: "payment_required", message, reason: allowance.reason }, { status: 402 }),
    };
  }
  return { ok: true, orderId };
}

async function uploadFile(file: File, token: string): Promise<string> {
  const form = new FormData();
  form.append("content", file, file.name || "selfie.jpg");
  const res = await replicateFetch("https://api.replicate.com/v1/files", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`file upload failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as { urls?: { get?: string } };
  if (!data.urls?.get) throw new Error("file upload returned no URL");
  return data.urls.get;
}

function retryAfterFromError(message: string): number | null {
  const match = message.match(/retry_after["']?\s*:\s*(\d+(?:\.\d+)?)/i);
  return match ? Math.ceil(Number.parseFloat(match[1]) * 1000) : null;
}

/** Selfie upload with limited retries (uploads are rate-limited too, not just predictions). */
async function uploadFileWithRetry(file: File, token: string, attempts = 3): Promise<string> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await uploadFile(file, token);
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const retryable = /file upload failed \((429|5\d\d)\)/.test(message) || /fetch failed|timed out/i.test(message);
      if (!retryable || attempt === attempts - 1) throw error;
      const wait = retryAfterFromError(message) ?? 1_000 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, wait + 250));
    }
  }
  throw lastError;
}

/** Upload up to `limit` distinct selfies; reuse URLs across slots when fewer were provided. */
async function uploadSelfies(selfies: File[], token: string, limit: number): Promise<string[]> {
  const seen = new Set<string>();
  const unique: File[] = [];
  for (const file of selfies) {
    const key = `${file.name}:${file.size}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(file);
    if (unique.length >= limit) break;
  }
  const urls: string[] = [];
  const errors: string[] = [];
  for (const file of unique) {
    try {
      urls.push(await uploadFileWithRetry(file, token));
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }
  if (urls.length === 0) {
    throw new Error(`could not upload any selfie to the provider: ${errors[0] ?? "unknown error"}`);
  }
  return urls;
}

interface FanoutSlot {
  index: number;
  prompt: string;
  selfieUrl: string;
  status: "pending" | "kontext_running" | "kontext_done" | "swap_running" | "done" | "failed";
  kontextId: string | null;
  faceSwapId: string | null;
  headshotUrl: string | null;
  url: string | null;
  r2Key: string | null;
  kontextAttempts: number;
  swapAttempts: number;
  error: string | null;
  stage?: "kontext" | "swap";
  retryAt?: number;
  kontextSeconds?: number;
  swapSeconds?: number;
}

/** Kick off stage 1 for the first slots that fit the concurrency budget. */
async function startPendingKontext(slots: FanoutSlot[]): Promise<void> {
  const active = slots.filter((s) => s.status === "kontext_running" || s.status === "swap_running").length;
  let budget = Math.max(0, MAX_CONCURRENCY - active);
  const now = Date.now();
  for (const slot of slots) {
    if (budget <= 0) break;
    if (slot.status !== "pending") continue;
    if (slot.retryAt && slot.retryAt > now) continue;
    try {
      const prediction = await createFluxKontextPrediction(slot.prompt, slot.selfieUrl);
      slot.kontextId = prediction.id;
      slot.status = "kontext_running";
      slot.error = null;
      budget -= 1;
    } catch (error) {
      if (isReplicateThrottleError(error)) {
        // Rate limit is a "wait", not a failure: don't count it as an attempt.
        slot.error = `Waiting out the image provider's rate limit (~${Math.ceil(error.retryAfterMs / 1000)}s).`;
        slot.retryAt = Date.now() + error.retryAfterMs + 250;
        continue;
      }
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
}

function buildSlots(count: number, selfieUrls: string[]): FanoutSlot[] {
  return Array.from({ length: count }, (_, i) => ({
    index: i + 1,
    prompt: PROMPTS[i % PROMPTS.length],
    selfieUrl: selfieUrls[i % selfieUrls.length],
    status: "pending" as const,
    kontextId: null,
    faceSwapId: null,
    headshotUrl: null,
    url: null,
    r2Key: null,
    kontextAttempts: 0,
    swapAttempts: 0,
    error: null,
  }));
}

export async function POST(req: Request) {
  const allowMock = process.env.ALLOW_MOCK === "1";
  const allowReal = process.env.ALLOW_REAL === "1";

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData().catch(() => null);
    const selfies = (form?.getAll("selfies") ?? []).filter((x): x is File => x instanceof File);
    const style = String(form?.get("style") ?? "LinkedIn / Corporate");
    const requestedImages = Number(form?.get("images") ?? SAMPLE_PACK_IMAGES);
    if (selfies.length < 3) {
      return NextResponse.json({ error: "At least 3 selfies are required" }, { status: 400 });
    }
    if (!Number.isFinite(requestedImages) || requestedImages < 1) {
      return NextResponse.json({ error: "Invalid package size" }, { status: 400 });
    }
    const images = Math.min(Math.floor(requestedImages), SAMPLE_PACK_IMAGES);
    const paid = await requirePaidOrder(req, form, null, images);
    if (!paid.ok) return paid.response;

    // One in-flight job per order: a double-submit would otherwise get two full
    // sets while the allowance can only be charged once (it is capped at granted).
    if (paid.orderId) {
      const inFlight = listJobs(200).find(
        (job) =>
          job.input.orderId === paid.orderId &&
          job.input.real === true &&
          (job.status === "queued" || job.status === "running"),
      );
      if (inFlight) {
        return NextResponse.json(
          { error: "order_in_progress", message: "This order already has a generation in progress.", jobId: inFlight.id },
          { status: 409 },
        );
      }
    }

    if (allowMock && !allowReal) {
      const job = createMockHeadshotJob({ files: selfies.length, style, images });
      return NextResponse.json(job, { status: 201 });
    }

    if (!isReplicateConfigured()) {
      return NextResponse.json({ error: "replicate_not_configured" }, { status: 503 });
    }

    const token = process.env.REPLICATE_API_TOKEN!;
    try {
      const selfieUrls = await uploadSelfies(selfies, token, Math.min(2, images));
      const slots = buildSlots(images, selfieUrls);
      await startPendingKontext(slots);
      const job = createJob("headshot", {
        files: selfies.length,
        style,
        images,
        selfieUrls,
        slots,
        real: true,
        fanout: true,
        orderId: paid.orderId || undefined,
      });
      const running = updateJob(job.id, {
        status: "running",
        progress: 2,
        meta: {
          real: true,
          provider: "replicate/flux-kontext-pro+face-swap",
          requestedImages: images,
          samplePack: images <= SAMPLE_PACK_IMAGES,
          startedAt: new Date().toISOString(),
        },
      });
      if (running) await persistJob(running.id);
      // Link the job to the paid order so the order-recovery page and
      // /api/orders/[id]/files can list this job. Idempotent in core.
      if (paid.orderId) {
        try {
          await appendOrderJob("headshot", paid.orderId, job.id);
        } catch (error) {
          console.warn(`[orders] appendOrderJob failed for ${paid.orderId}:`, error);
        }
      }
      return NextResponse.json(running, { status: 201 });
    } catch (err) {
      return NextResponse.json(
        { error: "provider_error", detail: err instanceof Error ? err.message : String(err) },
        { status: 502 },
      );
    }
  }

  const body = (await req.json().catch(() => null)) as
    | { files?: number; style?: string; images?: number; package?: string; orderId?: string }
    | null;
  if (!body || (body.files ?? 0) < 3) {
    return NextResponse.json({ error: "At least 3 selfies are required" }, { status: 400 });
  }
  const images = body.images ?? SAMPLE_PACK_IMAGES;
  if (images < 1) return NextResponse.json({ error: "Invalid package size" }, { status: 400 });
  const paid = await requirePaidOrder(req, null, body, images);
  if (!paid.ok) return paid.response;
  if (process.env.ALLOW_MOCK !== "1") {
    return NextResponse.json({ error: "selfies are required for paid runs" }, { status: 400 });
  }
  if (paid.orderId) await consumeOrderAllowance("headshot", paid.orderId, images);
  const job = createMockHeadshotJob({
    files: body.files,
    style: body.style ?? "LinkedIn / Corporate",
    images,
    allowMock,
  });
  return NextResponse.json(job, { status: 201 });
}
