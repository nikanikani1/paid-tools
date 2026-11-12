import { NextResponse } from "next/server";
import {
  createFaceSwapPrediction,
  createFluxKontextPrediction,
  createJob,
  createMockHeadshotJob,
  isReplicateConfigured,
  replicateFetch,
  updateJob,
} from "@paid/core";

/**
 * Order creation gate. Production must never create a job without a paid order.
 *
 * Local real-AI mode: ALLOW_REAL=1 + REPLICATE_API_TOKEN.
 * Pipeline: upload selfie → flux-kontext-pro (professional headshot) → face-swap
 * back to the original selfie for identity. Test mode generates 1 image; production
 * will fan out to the package size after R2/DB are wired.
 */
const PAYMENT_REQUIRED_MESSAGE =
  "A paid order is required. Checkout is not connected in this build — start with the $9 Sample Pack once payments are live.";

async function uploadFile(file: File, token: string): Promise<string> {
  const form = new FormData();
  form.append("content", file, file.name || "selfie.jpg");
  const res = await replicateFetch("https://api.replicate.com/v1/files", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error(`file upload failed (${res.status})`);
  const data = (await res.json()) as { urls?: { get?: string } };
  if (!data.urls?.get) throw new Error("file upload returned no URL");
  return data.urls.get;
}

export async function POST(req: Request) {
  const allowMock = process.env.ALLOW_MOCK === "1";
  const allowReal = process.env.ALLOW_REAL === "1";
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction && !allowMock && !allowReal) {
    return NextResponse.json(
      { error: "payment_required", message: PAYMENT_REQUIRED_MESSAGE, minimum_order_usd: 9 },
      { status: 402 },
    );
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData().catch(() => null);
    const selfies = (form?.getAll("selfies") ?? []).filter((x): x is File => x instanceof File);
    const style = String(form?.get("style") ?? "LinkedIn / Corporate");
    const images = Number(form?.get("images") ?? 5);
    if (selfies.length < 3) {
      return NextResponse.json({ error: "At least 3 selfies are required" }, { status: 400 });
    }
    if (!Number.isFinite(images) || images < 1) {
      return NextResponse.json({ error: "Invalid package size" }, { status: 400 });
    }

    if (!allowReal) {
      const job = createMockHeadshotJob({ files: selfies.length, style, images });
      return NextResponse.json(job, { status: 201 });
    }

    if (!isReplicateConfigured()) {
      return NextResponse.json({ error: "replicate_not_configured" }, { status: 503 });
    }

    const token = process.env.REPLICATE_API_TOKEN!;
    try {
      const selfieUrl = await uploadFile(selfies[0], token);
      const prompt =
        "Turn this selfie into a professional corporate headshot. Keep the same person and facial identity, " +
        "neutral light-gray studio background, soft key light, sharp focus, business attire, photorealistic, " +
        "centered head-and-shoulders composition.";
      const prediction = await createFluxKontextPrediction(prompt, selfieUrl);
      const job = createJob("headshot", {
        files: selfies.length,
        style,
        images,
        selfieUrl,
        predictionId: prediction.id,
        real: true,
        provider: "replicate/flux-kontext-pro+face-swap",
        testMode: true,
      });
      return NextResponse.json(
        updateJob(job.id, {
          status: "running",
          progress: 5,
          meta: { real: true, provider: "replicate", testMode: true, requestedImages: images },
        }),
        { status: 201 },
      );
    } catch (err) {
      return NextResponse.json(
        { error: "provider_error", detail: err instanceof Error ? err.message : String(err) },
        { status: 502 },
      );
    }
  }

  const body = (await req.json().catch(() => null)) as
    | { files?: number; style?: string; images?: number; package?: string }
    | null;
  if (!body || (body.files ?? 0) < 3) {
    return NextResponse.json({ error: "At least 3 selfies are required" }, { status: 400 });
  }
  const images = body.images ?? 5;
  if (images < 1) return NextResponse.json({ error: "Invalid package size" }, { status: 400 });
  const job = createMockHeadshotJob({
    files: body.files,
    style: body.style ?? "LinkedIn / Corporate",
    images,
    allowMock,
  });
  return NextResponse.json(job, { status: 201 });
}
