import { NextResponse } from "next/server";
import { getOrder, markOrderPaid, markOrderRefunded, verifyWebhookSignature } from "@paid/core";

const SITE = "headshot" as const;
const ACTIVE = new Set(["order.completed", "subscription.activated", "subscription.payment_succeeded", "subscription.renewed"]);

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
  const raw = await req.text();
  const verification = await verifyWebhookSignature({ rawBody: raw, headers: req.headers });
  if (!verification.ok) {
    return NextResponse.json({ ok: false, error: "bad_signature", reason: verification.reason }, { status: 401 });
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
  const order = await getOrder(SITE, orderId);
  if (!order) return NextResponse.json({ ok: true, skipped: "order_not_found", orderId });

  const type = String(event.eventType ?? "");
  const status = String(event.data?.orderStatus ?? event.data?.subscriptionStatus ?? "").toLowerCase();

  if (type === "refund.succeeded" || type === "order.refunded") {
    await markOrderRefunded(SITE, orderId);
    return NextResponse.json({ ok: true, orderId, status: "refunded" });
  }

  const paid = ACTIVE.has(type) || ["paid", "completed", "succeeded"].includes(status);
  if (!paid) return NextResponse.json({ ok: true, skipped: type || status || "unknown_event" });

  const updated = await markOrderPaid(SITE, orderId, {
    providerOrderId: typeof event.data?.orderId === "string" ? event.data.orderId : undefined,
    email: event.data?.buyerEmail,
    metadata: { lastEventType: type, lastEventId: event.eventId, mode: event.mode },
  });
  return NextResponse.json({ ok: true, orderId, status: updated?.status ?? "paid" });
}
