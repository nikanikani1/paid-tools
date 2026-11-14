import { NextResponse } from "next/server";
import {
  checkOrderAllowance,
  consumeOrderAllowance,
  createFaceSwapPrediction,
  createFluxKontextPrediction,
  createJob,
  createMockHeadshotJob,
  isReplicateConfigured,
  lookupCheckoutOrder,
  markOrderPaid,
  persistJob,
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
  "A paid order is required. Start with the $9 Sample Pack (5 headshots) — one-time payment, no subscription.";

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
  if (!res.ok) throw new Error(`file upload failed (${res.status})`);
  const data = (await res.json()) as { urls?: { get?: string } };
  if (!data.urls?.get) throw new Error("file upload returned no URL");
  return data.urls.get;
}

export async function POST(req: Request) {
  const allowMock = process.env.ALLOW_MOCK === "1";
  const allowReal = process.env.ALLOW_REAL === "1";

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
    const paid = await requirePaidOrder(req, form, null, images);
    if (!paid.ok) return paid.response;

    if (allowMock && !allowReal) {
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
        orderId: paid.orderId || undefined,
      });
      if (paid.orderId) await consumeOrderAllowance("headshot", paid.orderId, images);
      const running = updateJob(job.id, {
        status: "running",
        progress: 5,
        meta: { real: true, provider: "replicate", testMode: true, requestedImages: images },
      });
      if (running) await persistJob(running.id);
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
  const images = body.images ?? 5;
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
