import { NextResponse } from "next/server";
import { getOrder, lookupCheckoutOrder, markOrderPaid, orderUsage } from "@paid/core";
import { brandForKind, siteKindFromEnv } from "@/lib/brands";

/**
 * GET /api/orders/status?order=<id>
 * Read-only order view for the Studio UI: payment status + remaining allowance.
 * If Waffo's webhook is delayed, reconcile a pending order directly against
 * Waffo so the success page and tool unlock without depending on delivery.
 */
export async function GET(req: Request) {
  const site = brandForKind(siteKindFromEnv()).site;
  const id = new URL(req.url).searchParams.get("order");
  if (!id) return NextResponse.json({ error: "order_required" }, { status: 400 });

  let order = await getOrder(site, id);
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (order.status === "pending") {
    const remote = await lookupCheckoutOrder(order.id);
    if (remote?.paid) {
      const updated = await markOrderPaid(site, order.id, {
        providerOrderId: remote.providerOrderId,
        email: remote.email,
      });
      if (updated) order = updated;
    }
  }

  const usage = orderUsage(order);
  return NextResponse.json({
    id: order.id,
    status: order.status,
    planId: order.planId,
    unitsGranted: order.unitsGranted,
    unitsUsed: order.unitsUsed,
    unitsReserved: usage.reserved,
    remaining: usage.remaining,
    amountCents: order.amountCents,
    currency: order.currency,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
  });
}
