import { NextResponse } from "next/server";
import {
  MAX_VOICE_AUDIO_MINUTES,
  appendOrderJob,
  checkOrderAllowance,
  createDemucsPrediction,
  createJob,
  createMockVoiceJob,
  isReplicateConfigured,
  lookupCheckoutOrder,
  markOrderPaid,
  newId,
  parseAudioDuration,
  persistJob,
  refundOrderAllowance,
  replicateFetch,
  reserveOrderAllowance,
  updateJob,
} from "@paid/core";

/**
 * Paid-only job creation.
 *
 * Production refuses to create a job without a paid order unless ALLOW_MOCK/ALLOW_REAL
 * are explicitly enabled for local integration. There is no free processing tier.
 *
 * Money path (2026-11-14): the requested minutes are validated against the real audio
 * header (not the browser), then *reserved* on the order before any AI call. The GET poll
 * route confirms the reservation when the job finishes and refunds it when the job fails.
 *
 * Local real-AI mode: ALLOW_REAL=1 + REPLICATE_API_TOKEN.
 */
const PAYMENT_REQUIRED_MESSAGE =
  "A paid run is required. The $2.90 Trial Pack includes 15 minutes and four MP3 stems (vocals, drums, bass, other) — one-time payment, no subscription.";

const INSUFFICIENT_MESSAGE =
  "This order has no remaining minutes. Buy another Trial Pack or plan to continue.";

const MAX_SIZE = 100 * 1024 * 1024;
/** Enough to cover WAV/FLAC headers and an MP3 Xing frame; M4A needs faststart. */
const HEADER_BYTES = 1024 * 1024;

type OrderGate =
  | { ok: true; orderId: string | null; minutes: number }
  | { ok: false; response: NextResponse };

function orderIdFrom(req: Request, form?: FormData | null, body?: { orderId?: string } | null): string | null {
  return (
    String(form?.get("orderId") ?? "") ||
    req.headers.get("x-order-id") ||
    String(body?.orderId ?? "") ||
    null
  );
}

function rawMinutes(form?: FormData | null, body?: { minutes?: number | string } | null): string | null {
  const value = form?.get("minutes") ?? body?.minutes;
  if (value === undefined || value === null || String(value).trim() === "") return null;
  return String(value).trim();
}

/**
 * Parse and bound a client-supplied minute count. The count is never trusted for billing
 * when the server could parse the file header; it is only a fallback for unknown formats.
 */
function clientMinutes(form?: FormData | null, body?: { minutes?: number | string } | null): number | null | "invalid" {
  const value = rawMinutes(form, body);
  if (value === null) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > MAX_VOICE_AUDIO_MINUTES) return "invalid";
  return Math.ceil(parsed);
}

function paymentRequired(reason: "not_found" | "unpaid" | "insufficient" | "invalid" | string, status = 402): NextResponse {
  return NextResponse.json(
    {
      error: reason === "insufficient" ? "insufficient_allowance" : "payment_required",
      reason,
      message: reason === "insufficient" ? INSUFFICIENT_MESSAGE : PAYMENT_REQUIRED_MESSAGE,
      checkoutUrl: "/pricing#trial",
      trial: { price: 2.9, currency: "USD", minutes: 15, billing: "one-time" },
    },
    { status },
  );
}

/**
 * Resolve the order gate. When an order id is supplied we always validate its allowance,
 * even in ALLOW_MOCK/ALLOW_REAL mode — the bypass only applies to order-less local tests.
 * Paid orders that are still `pending` are reconciled against Waffo, as before.
 */
async function resolveOrder(
  req: Request,
  form: FormData | null,
  body: { orderId?: string } | null,
  minutes: number,
): Promise<OrderGate> {
  const allowLocal = process.env.ALLOW_MOCK === "1" || process.env.ALLOW_REAL === "1";
  const orderId = orderIdFrom(req, form, body);
  if (!orderId) {
    if (allowLocal) return { ok: true, orderId: null, minutes };
    return { ok: false, response: paymentRequired("missing_order") };
  }

  let allowance = await checkOrderAllowance("voice", orderId, minutes);
  if (!allowance.ok && allowance.reason === "unpaid") {
    // Live Waffo webhooks can be withheld while the store is under review.
    const remote = await lookupCheckoutOrder(orderId);
    if (remote?.paid) {
      await markOrderPaid("voice", orderId, {
        providerOrderId: remote.providerOrderId,
        email: remote.email,
        metadata: { lastEventType: "reconcile", remoteStatus: remote.rawStatus },
      });
      allowance = await checkOrderAllowance("voice", orderId, minutes);
    }
  }
  if (!allowance.ok) return { ok: false, response: paymentRequired(allowance.reason) };
  return { ok: true, orderId, minutes };
}

/** Reserve minutes for this job. Returns null on success, or the 402 response to send. */
async function reserveForJob(orderId: string | null, minutes: number, reservationId: string, note: string): Promise<NextResponse | null> {
  if (!orderId) return null;
  const reserved = await reserveOrderAllowance("voice", orderId, minutes, reservationId, note);
  if (reserved.ok) return null;
  return paymentRequired(reserved.reason);
}

export async function POST(req: Request) {
  const allowMock = process.env.ALLOW_MOCK === "1";
  const allowReal = process.env.ALLOW_REAL === "1";
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "file_too_large", maxBytes: MAX_SIZE }, { status: 413 });
    }
    const filename = file.name || "upload.mp3";

    // --- server-side duration validation (never trust the browser's minutes field) ---
    let parseResult: ReturnType<typeof parseAudioDuration> = null;
    try {
      const header = new Uint8Array(await file.slice(0, HEADER_BYTES).arrayBuffer());
      parseResult = parseAudioDuration(header, filename, file.size);
    } catch {
      parseResult = null;
    }
    if (parseResult && parseResult.minutes > MAX_VOICE_AUDIO_MINUTES + 1e-9) {
      return NextResponse.json(
        {
          error: "audio_too_long",
          maxMinutes: MAX_VOICE_AUDIO_MINUTES,
          detectedMinutes: Math.round(parseResult.minutes * 10) / 10,
          message: `Audio is longer than ${MAX_VOICE_AUDIO_MINUTES} minutes. Trim it before uploading — no minutes were charged.`,
        },
        { status: 400 },
      );
    }
    const client = clientMinutes(form, null);
    if (client === "invalid") {
      return NextResponse.json(
        { error: "invalid_minutes", maxMinutes: MAX_VOICE_AUDIO_MINUTES },
        { status: 400 },
      );
    }
    const orderIdHint = orderIdFrom(req, form, null);
    let minutes: number | null = parseResult ? Math.max(1, Math.ceil(parseResult.minutes)) : client;
    if (minutes === null && !orderIdHint && (allowMock || allowReal)) minutes = 1; // local test upload only
    if (minutes === null) {
      return NextResponse.json(
        {
          error: "minutes_required",
          message: "Could not read the audio duration from this file. Send a valid minutes value (1–10) or use WAV/MP3/FLAC/M4A.",
        },
        { status: 400 },
      );
    }
    const durationMeta = parseResult
      ? { seconds: Math.round(parseResult.seconds * 1000) / 1000, durationSource: parseResult.estimated ? "header_estimate" : "header" }
      : { durationSource: "client_validated" };

    const paid = await resolveOrder(req, form, null, minutes);
    if (!paid.ok) return paid.response;
    const reservationId = paid.orderId ? newId("resv") : null;
    if (reservationId) {
      const blocked = await reserveForJob(paid.orderId, paid.minutes, reservationId, "voice job");
      if (blocked) return blocked;
    }

    if (allowMock && !allowReal) {
      const job = createMockVoiceJob({
        filename,
        size: file.size,
        minutes: paid.minutes,
        ...(paid.orderId ? { orderId: paid.orderId } : {}),
        ...(reservationId ? { reservationId } : {}),
      });
      const withMeta = updateJob(job.id, { meta: { ...job.meta, ...durationMeta } });
      if (paid.orderId) await appendOrderJob("voice", paid.orderId, job.id);
      if (withMeta) await persistJob(withMeta.id);
      return NextResponse.json(withMeta ?? job, { status: 201 });
    }

    if (!isReplicateConfigured()) {
      if (reservationId) await refundOrderAllowance("voice", paid.orderId!, reservationId, "provider not configured");
      return NextResponse.json({ error: "replicate_not_configured" }, { status: 503 });
    }

    const token = process.env.REPLICATE_API_TOKEN!;
    const upload = new FormData();
    upload.append("content", file, filename);
    try {
      const up = await replicateFetch("https://api.replicate.com/v1/files", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: upload,
      });
      if (!up.ok) {
        if (reservationId) await refundOrderAllowance("voice", paid.orderId!, reservationId, "upload failed");
        return NextResponse.json(
          { error: "upload_failed", detail: (await up.text()).slice(0, 300) },
          { status: 502 },
        );
      }
      const uploaded = (await up.json()) as { urls?: { get?: string } };
      const audioUrl = uploaded.urls?.get;
      if (!audioUrl) {
        if (reservationId) await refundOrderAllowance("voice", paid.orderId!, reservationId, "upload url missing");
        return NextResponse.json({ error: "upload_url_missing" }, { status: 502 });
      }

      const prediction = await createDemucsPrediction(audioUrl);
      const job = createJob("voice", {
        filename,
        size: file.size,
        predictionId: prediction.id,
        real: true,
        provider: "replicate/cjwbw-demucs",
        ...(paid.orderId ? { orderId: paid.orderId } : {}),
        ...(reservationId ? { reservationId } : {}),
        minutes: paid.minutes,
        ...durationMeta,
      });
      if (paid.orderId) await appendOrderJob("voice", paid.orderId, job.id);
      const running = updateJob(job.id, {
        status: "running",
        progress: 5,
        meta: { real: true, provider: "replicate", ...durationMeta },
      });
      if (running) await persistJob(running.id);
      return NextResponse.json(running ?? job, { status: 201 });
    } catch (err) {
      if (reservationId) await refundOrderAllowance("voice", paid.orderId!, reservationId, "prediction create failed");
      return NextResponse.json(
        { error: "provider_error", detail: err instanceof Error ? err.message : "Could not start the separation." },
        { status: 502 },
      );
    }
  }

  // JSON mode is only used by local mock integrations; paid orders still go through the gate.
  const body = (await req.json().catch(() => null)) as
    | { filename?: string; size?: number; orderId?: string; minutes?: number }
    | null;
  if (!body?.filename) {
    return NextResponse.json({ error: "filename is required" }, { status: 400 });
  }
  const client = clientMinutes(null, body);
  if (client === "invalid") {
    return NextResponse.json({ error: "invalid_minutes", maxMinutes: MAX_VOICE_AUDIO_MINUTES }, { status: 400 });
  }
  if (client === null) {
    return NextResponse.json(
      { error: "minutes_required", message: `Send minutes (1–${MAX_VOICE_AUDIO_MINUTES}) for JSON job creation.` },
      { status: 400 },
    );
  }
  const paid = await resolveOrder(req, null, body, client);
  if (!paid.ok) return paid.response;
  const reservationId = paid.orderId ? newId("resv") : null;
  if (reservationId) {
    const blocked = await reserveForJob(paid.orderId, paid.minutes, reservationId, "voice mock job");
    if (blocked) return blocked;
  }
  const job = createMockVoiceJob({
    filename: body.filename,
    size: body.size ?? 0,
    minutes: paid.minutes,
    ...(paid.orderId ? { orderId: paid.orderId } : {}),
    ...(reservationId ? { reservationId } : {}),
  });
  if (paid.orderId) await appendOrderJob("voice", paid.orderId, job.id);
  await persistJob(job.id);
  return NextResponse.json(job, { status: 201 });
}
