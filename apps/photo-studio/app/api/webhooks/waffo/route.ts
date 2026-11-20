import { NextResponse } from "next/server";
import { getOrder, markOrderPaid, markOrderRefunded, verifyWebhookSignature } from "@paid/core";
import { brandForKind, siteKindFromEnv } from "@/lib/brands";

/**
 * POST /api/webhooks/waffo — Waffo payment webhook for the photo-studio brands.
 *
 * Signature is verified first (401 on bad signature). The order is resolved from
 * `data.metadata.orderId` / `orderMerchantExternalId` and looked up under this
 * deployment's site (landscape or haircolor), so a webhook cannot mark another
 * product's order paid.
 */
const ACTIVE = new Set([
  "order.completed",
  "subscription.activated",
  "subscription.payment_succeeded",
  "subscription.renewed",
]);

type WaffoEvent = {
  eventType?: string;
  eventId?: string;
  mode?: string;
  orderMerchantExternalId?: string;
  data?: {
    orderId?: string;
    orderMerchantExternalId?: string;
    orderStatus?: string;
    buyerEmail?: string;
    subscriptionId?: string;
    subscriptionStatus?: string;
    metadata?: Record<string, unknown>;
  };
};

export async function POST(req: Request) {
  const site = brandForKind(siteKindFromEnv()).site;
  const raw = await req.text();
  const verification = await verifyWebhookSignature({ rawBody: raw, headers: req.headers });
  // Bad RSA signature is always rejected. When Waffo is not configured the core
  // verification reports mode "mock" (ok=false); local/dev may continue so the
  // flow is testable, but production must never accept unsigned webhooks.
  if (!verification.ok && verification.mode === "rsa") {
    return NextResponse.json({ ok: false, error: "bad_signature", reason: verification.reason }, { status: 401 });
  }
  if (!verification.ok && verification.mode !== "rsa") {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ ok: false, error: "webhook_not_configured" }, { status: 503 });
    }
    console.warn("[studio/webhook] Waffo not configured — accepting unsigned webhook in non-production mode");
  }

  let event: WaffoEvent;
  try {
    event = JSON.parse(raw) as WaffoEvent;
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const orderId =
    (typeof event.data?.metadata?.orderId === "string" ? event.data.metadata.orderId : null) ??
    event.orderMerchantExternalId ??
    event.data?.orderMerchantExternalId ??
    null;
  if (!orderId) return NextResponse.json({ ok: true, skipped: "no_order_metadata" });

  const order = await getOrder(site, orderId);
  if (!order) return NextResponse.json({ ok: true, skipped: "order_not_found", orderId });

  const type = String(event.eventType ?? "");
  const status = String(event.data?.orderStatus ?? event.data?.subscriptionStatus ?? "").toLowerCase();

  if (type === "refund.succeeded" || type === "order.refunded") {
    await markOrderRefunded(site, orderId);
    return NextResponse.json({ ok: true, orderId, status: "refunded" });
  }

  const paid = ACTIVE.has(type) || ["paid", "completed", "succeeded"].includes(status);
  if (!paid) return NextResponse.json({ ok: true, skipped: type || status || "unknown_event" });

  const updated = await markOrderPaid(site, orderId, {
    providerOrderId: typeof event.data?.orderId === "string" ? event.data.orderId : undefined,
    email: event.data?.buyerEmail,
    metadata: { lastEventType: type, lastEventId: event.eventId, mode: event.mode },
  });
  return NextResponse.json({ ok: true, orderId, status: updated?.status ?? "paid" });
}
