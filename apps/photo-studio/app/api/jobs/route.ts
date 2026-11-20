import { NextResponse } from "next/server";
import {
  appendOrderJob,
  getOrder,
  orderUsage,
  planInfo,
  refundOrderAllowance,
  reserveOrderAllowance,
  newId,
} from "@paid/core";
import { brandForKind, siteKindFromEnv } from "@/lib/brands";
import { isValidStyle, buildPrompts } from "@/lib/prompts";
import {
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_MB,
  PACK_UNITS,
  createConceptPredictions,
  createStudioJob,
  patchStudioJob,
  replicateConfigured,
  uploadSourcePhoto,
} from "@/lib/job-service";

/**
 * POST /api/jobs — start a 4-image concept pack.
 *
 * multipart/form-data:
 *   photo   File   the source photo (image/*, ≤ 15 MB)
 *   style   string one of the brand's style ids
 *   orderId string a paid order for BRAND.planId
 *
 * Flow: validate → paid order + allowance → reserve 4 units → upload the photo
 * to Replicate Files → create 4 flux-kontext-pro predictions → create the job
 * (with reservationId + predictionIds) → appendOrderJob → return the job.
 * If any provider step throws, the reservation is refunded and the API returns
 * 502 so the customer is never charged for a pack that did not start.
 */
export async function POST(req: Request) {
  const kind = siteKindFromEnv();
  const brand = brandForKind(kind);
  const site = brand.site;

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "multipart_required" }, { status: 415 });
  }
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "invalid_form" }, { status: 400 });

  const photo = form.get("photo");
  const style = String(form.get("style") ?? "").trim();
  const orderId = String(form.get("orderId") ?? "").trim();

  if (!(photo instanceof File) || photo.size === 0) {
    return NextResponse.json({ error: "photo_required", message: `Choose an image (max ${MAX_UPLOAD_MB} MB).` }, { status: 400 });
  }
  if (photo.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "photo_too_large", message: `Image is larger than ${MAX_UPLOAD_MB} MB.` },
      { status: 400 },
    );
  }
  const mime = photo.type || "";
  const looksImage = mime.startsWith("image/") || /\.(jpe?g|png|webp|heic|heif)$/i.test(photo.name || "");
  if (!looksImage) {
    return NextResponse.json(
      { error: "unsupported_type", message: "Use a JPG, PNG, WebP or HEIC image." },
      { status: 400 },
    );
  }
  if (!isValidStyle(kind, style)) {
    return NextResponse.json(
      { error: "invalid_style", message: "Pick one of the styles shown.", styles: brand.styles.map((item) => item.id) },
      { status: 400 },
    );
  }
  if (!orderId) {
    return NextResponse.json(
      { error: "payment_required", message: `Buy the ${brand.price} pack before generating.` },
      { status: 402 },
    );
  }

  const order = await getOrder(site, orderId);
  if (!order || order.status !== "paid") {
    return NextResponse.json(
      { error: "payment_required", reason: order ? "unpaid" : "not_found", message: `Buy the ${brand.price} pack before generating.` },
      { status: 402 },
    );
  }
  if (order.planId !== brand.planId) {
    return NextResponse.json(
      { error: "plan_mismatch", message: "This order was for a different pack." },
      { status: 402 },
    );
  }
  const info = planInfo(site, brand.planId);
  const units = info?.units ?? PACK_UNITS;
  const usage = orderUsage(order);
  if (usage.remaining < units) {
    return NextResponse.json(
      {
        error: "payment_required",
        reason: "insufficient",
        message: `This order does not have enough images left. Buy another ${brand.price} pack to continue.`,
        usage,
      },
      { status: 402 },
    );
  }

  const reservationId = newId("resv");
  const reserved = await reserveOrderAllowance(site, orderId, units, reservationId, `${kind}:${style}`);
  if (!reserved.ok) {
    const status = reserved.reason === "already_confirmed" ? 409 : 402;
    return NextResponse.json(
      {
        error: reserved.reason === "already_confirmed" ? "order_already_used" : "payment_required",
        reason: reserved.reason,
        message:
          reserved.reason === "already_confirmed"
            ? "This order already produced a pack."
            : `Buy the ${brand.price} pack before generating.`,
      },
      { status },
    );
  }

  if (!replicateConfigured()) {
    await refundOrderAllowance(site, orderId, reservationId, "provider not configured");
    return NextResponse.json({ error: "replicate_not_configured" }, { status: 503 });
  }

  try {
    const token = process.env.REPLICATE_API_TOKEN!;
    const imageUrl = await uploadSourcePhoto(photo, token);
    const prompts = buildPrompts(kind, style);
    const predictionIds = await createConceptPredictions(prompts, imageUrl, kind === "landscape" ? "3:2" : "1:1");
    const job = await createStudioJob(kind, {
      orderId,
      reservationId,
      style,
      imageUrl,
      predictionIds,
      units,
      real: true,
    });
    const started = await patchStudioJob(kind, job.id, {
      status: "running",
      progress: 5,
      meta: {
        real: true,
        orderId,
        reservationId,
        style,
        requestedImages: predictionIds.length,
        startedAt: new Date().toISOString(),
      },
    });
    try {
      await appendOrderJob(site, orderId, job.id);
    } catch (error) {
      console.warn(`[studio/jobs] appendOrderJob failed for ${orderId}:`, error);
    }
    return NextResponse.json(started ?? job, { status: 201 });
  } catch (error) {
    await refundOrderAllowance(site, orderId, reservationId, "provider failure before generation started");
    return NextResponse.json(
      {
        error: "provider_error",
        message: "The image provider could not start this pack. You were not charged — please try again.",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    );
  }
}
