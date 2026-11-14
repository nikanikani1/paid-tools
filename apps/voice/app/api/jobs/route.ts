import { NextResponse } from "next/server";
import {
  checkOrderAllowance,
  consumeOrderAllowance,
  createDemucsPrediction,
  createJob,
  createMockVoiceJob,
  isReplicateConfigured,
  lookupCheckoutOrder,
  markOrderPaid,
  persistJob,
  replicateFetch,
  updateJob,
} from "@paid/core";

/**
 * Paid-only job creation.
 *
 * Production refuses to create a job without a paid order unless ALLOW_MOCK/ALLOW_REAL
 * are explicitly enabled for local integration. There is no free processing tier.
 *
 * Local real-AI mode: ALLOW_REAL=1 + REPLICATE_API_TOKEN. The uploaded file is sent to
 * Replicate Files, then a demucs prediction is created. Output URLs are temporary
 * (Replicate keeps them ~1h) — production must copy them to R2 before returning.
 */
const PAYMENT_REQUIRED_MESSAGE =
  "A paid run is required. The $2.90 Trial Pack includes 15 minutes with 4 stems (WAV + MP3) — one-time payment, no subscription.";

const MAX_SIZE = 100 * 1024 * 1024;

function orderIdFrom(req: Request, form?: FormData | null, body?: { orderId?: string } | null): string | null {
  return (
    String(form?.get("orderId") ?? "") ||
    req.headers.get("x-order-id") ||
    String(body?.orderId ?? "") ||
    null
  );
}

async function requirePaidOrder(req: Request, form: FormData | null, body: { orderId?: string; minutes?: number } | null): Promise<
  { ok: true; orderId: string; minutes: number } | { ok: false; response: NextResponse }
> {
  const allowMock = process.env.ALLOW_MOCK === "1";
  const allowReal = process.env.ALLOW_REAL === "1";
  if (allowMock || allowReal) {
    return { ok: true, orderId: "", minutes: Number(body?.minutes ?? form?.get("minutes") ?? 1) || 1 };
  }
  const orderId = orderIdFrom(req, form, body);
  if (!orderId) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "payment_required",
          message: PAYMENT_REQUIRED_MESSAGE,
          checkoutUrl: "/pricing#trial",
          trial: { price: 2.9, currency: "USD", minutes: 15, billing: "one-time" },
        },
        { status: 402 },
      ),
    };
  }
  const minutes = Math.max(1, Math.ceil(Number(form?.get("minutes") ?? body?.minutes ?? 1) || 1));
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
  if (!allowance.ok) {
    const message =
      allowance.reason === "insufficient"
        ? "This order has no remaining minutes. Buy another Trial Pack or plan to continue."
        : PAYMENT_REQUIRED_MESSAGE;
    return {
      ok: false,
      response: NextResponse.json(
        { error: "payment_required", message, checkoutUrl: "/pricing#trial", reason: allowance.reason },
        { status: 402 },
      ),
    };
  }
  return { ok: true, orderId, minutes };
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
    const paid = await requirePaidOrder(req, form, null);
    if (!paid.ok) return paid.response;
    const filename = file.name || "upload.mp3";

    if (allowMock && !allowReal) {
      const job = createMockVoiceJob({ filename, size: file.size });
      return NextResponse.json(job, { status: 201 });
    }

    if (!isReplicateConfigured()) {
      return NextResponse.json({ error: "replicate_not_configured" }, { status: 503 });
    }

    const token = process.env.REPLICATE_API_TOKEN!;
    const upload = new FormData();
    upload.append("content", file, filename);
    const up = await replicateFetch("https://api.replicate.com/v1/files", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: upload,
    });
    if (!up.ok) {
      return NextResponse.json(
        { error: "upload_failed", detail: (await up.text()).slice(0, 300) },
        { status: 502 },
      );
    }
    const uploaded = (await up.json()) as { urls?: { get?: string } };
    const audioUrl = uploaded.urls?.get;
    if (!audioUrl) return NextResponse.json({ error: "upload_url_missing" }, { status: 502 });

    const prediction = await createDemucsPrediction(audioUrl);
    const job = createJob("voice", {
      filename,
      size: file.size,
      predictionId: prediction.id,
      real: true,
      provider: "replicate/cjwbw-demucs",
      orderId: paid.orderId || undefined,
      minutes: paid.minutes,
    });
    if (paid.orderId) await consumeOrderAllowance("voice", paid.orderId, paid.minutes);
    const running = updateJob(job.id, { status: "running", progress: 5, meta: { real: true, provider: "replicate" } });
    if (running) await persistJob(running.id);
    return NextResponse.json(running, { status: 201 });
  }

  const body = (await req.json().catch(() => null)) as { filename?: string; size?: number; orderId?: string; minutes?: number } | null;
  if (!body?.filename) {
    return NextResponse.json({ error: "filename is required" }, { status: 400 });
  }
  const paid = await requirePaidOrder(req, null, body);
  if (!paid.ok) return paid.response;
  if (process.env.ALLOW_MOCK !== "1") {
    return NextResponse.json({ error: "file is required for paid runs" }, { status: 400 });
  }
  if (paid.orderId) await consumeOrderAllowance("voice", paid.orderId, paid.minutes);
  const job = createMockVoiceJob({ filename: body.filename, size: body.size ?? 0 });
  return NextResponse.json(job, { status: 201 });
}
