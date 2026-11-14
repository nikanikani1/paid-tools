import { NextResponse } from "next/server";
import {
  createCheckout,
  createOrder,
  planInfo,
  productIdForPlan,
  updateOrder,
  WaffoError,
} from "@paid/core";

const SITE = "voice" as const;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://stemextractor.com";

/**
 * Creates a durable pending order first, then a Waffo Pancake checkout session.
 * The order id is passed in Waffo metadata and on the success URL; the webhook
 * marks that exact order paid. No client-supplied amount is trusted.
 */
export async function POST(req: Request) {
  let body: { planId?: string; email?: string } | null = null;
  try {
    body = (await req.json()) as { planId?: string; email?: string };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const planId = String(body?.planId ?? "voice-trial");
  // Subscription plans are visible as "coming soon" but must not be purchasable
  // until renewal/credit lifecycle is implemented.
  if (planId !== "voice-trial") {
    return NextResponse.json(
      { error: "plan_not_available", message: "Only the $2.90 Trial Pack is on sale right now. Subscriptions are coming soon." },
      { status: 409 },
    );
  }
  const info = planInfo(SITE, planId);
  if (!info) return NextResponse.json({ error: "unknown_plan" }, { status: 400 });

  const productId = productIdForPlan(SITE, planId);
  if (!productId) return NextResponse.json({ error: "product_not_configured", planId }, { status: 503 });

  try {
    const order = await createOrder({
      site: SITE,
      planId,
      email: body?.email,
      productId,
      metadata: { source: "pricing" },
    });
    const successUrl = `${SITE_URL}/success?order=${encodeURIComponent(order.id)}`;
    const checkout = await createCheckout({
      site: SITE,
      planId,
      amountCents: info.amountCents,
      billing: info.billing,
      productId,
      email: body?.email,
      successUrl,
      cancelUrl: `${SITE_URL}/pricing?checkout=canceled`,
      metadata: { orderId: order.id },
    });
    await updateOrder(SITE, order.id, {
      providerSessionId: checkout.id,
      checkoutUrl: checkout.url,
      successUrl,
    });
    return NextResponse.json({ ok: true, orderId: order.id, url: checkout.url, mock: checkout.mock });
  } catch (error) {
    const err = error as WaffoError;
    console.error("[checkout] waffo failed", err.message, err.status, err.body);
    return NextResponse.json(
      { error: "checkout_unavailable", message: "Checkout is temporarily unavailable. Please try again." },
      { status: 502 },
    );
  }
}
