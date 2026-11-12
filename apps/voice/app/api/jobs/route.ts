import { NextResponse } from "next/server";
import {
  createDemucsPrediction,
  createJob,
  createMockVoiceJob,
  isReplicateConfigured,
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

export async function POST(req: Request) {
  const isProduction = process.env.NODE_ENV === "production";
  const allowMock = process.env.ALLOW_MOCK === "1";
  const allowReal = process.env.ALLOW_REAL === "1";

  if (isProduction && !allowMock && !allowReal) {
    return NextResponse.json(
      {
        error: "payment_required",
        message: PAYMENT_REQUIRED_MESSAGE,
        checkoutUrl: "/pricing#trial",
        trial: { price: 2.9, currency: "USD", minutes: 15, billing: "one-time" },
      },
      { status: 402 },
    );
  }

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

    if (!allowReal) {
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
    });
    return NextResponse.json(
      updateJob(job.id, { status: "running", progress: 5, meta: { real: true, provider: "replicate" } }),
      { status: 201 },
    );
  }

  const body = (await req.json().catch(() => null)) as { filename?: string; size?: number } | null;
  if (!body?.filename) {
    return NextResponse.json({ error: "filename is required" }, { status: 400 });
  }
  const job = createMockVoiceJob({ filename: body.filename, size: body.size ?? 0 });
  return NextResponse.json(job, { status: 201 });
}
