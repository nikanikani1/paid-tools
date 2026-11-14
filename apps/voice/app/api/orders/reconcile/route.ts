import { NextResponse } from "next/server";
import { getOrder, lookupCheckoutOrder, markOrderPaid, markOrderRefunded } from "@paid/core";

const SITE = "voice" as const;

/**
 * Reconcile a pending order against Waffo. Needed because live webhooks can be
 * withheld while a store is under review; a completed payment must still unlock
 * the tool when the buyer returns from the cashier.
 */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("order");
  if (!id) return NextResponse.json({ error: "order_required" }, { status: 400 });
  let order = await getOrder(SITE, id);
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (order.status === "paid") return NextResponse.json({ id: order.id, status: order.status, reconciled: false });

  const remote = await lookupCheckoutOrder(order.id);
  if (!remote) return NextResponse.json({ id: order.id, status: order.status, reconciled: false, remote: "unavailable" });
  if (remote.paid) {
    order = await markOrderPaid(SITE, order.id, {
      providerOrderId: remote.providerOrderId,
      email: remote.email,
      metadata: { lastEventType: "reconcile", remoteStatus: remote.rawStatus },
    });
  } else if (remote.rawStatus === "refunded" || remote.rawStatus === "canceled") {
    order = await markOrderRefunded(SITE, order.id);
  }
  return NextResponse.json({
    id: order?.id,
    status: order?.status ?? "pending",
    reconciled: Boolean(remote.paid),
    remoteStatus: remote.rawStatus,
  });
}
