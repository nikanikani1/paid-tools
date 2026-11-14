import { NextResponse } from "next/server";
import { getOrder, orderUsage } from "@paid/core";

const ORDER_ID_RE = /^[A-Za-z0-9_-]{6,80}$/;

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("order");
  if (!id) return NextResponse.json({ error: "order_required" }, { status: 400 });
  if (!ORDER_ID_RE.test(id)) return NextResponse.json({ error: "invalid_order_id" }, { status: 400 });
  const order = await getOrder("voice", id);
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
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
    jobIds: order.jobIds ?? [],
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    refundedAt: order.refundedAt,
  });
}
