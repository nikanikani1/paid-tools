import { NextResponse } from "next/server";
import { getOrder } from "@paid/core";

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("order");
  if (!id) return NextResponse.json({ error: "order_required" }, { status: 400 });
  const order = await getOrder("headshot", id);
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({
    id: order.id,
    status: order.status,
    planId: order.planId,
    unitsGranted: order.unitsGranted,
    unitsUsed: order.unitsUsed,
    amountCents: order.amountCents,
  });
}
