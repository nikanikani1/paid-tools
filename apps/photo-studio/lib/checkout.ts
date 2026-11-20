/**
 * checkout.ts — Waffo checkout for the photo-studio brands.
 *
 * Only the current brand's single pack is purchasable (`BRAND.planId`); the
 * client cannot ask for another plan. Missing Waffo product IDs return 503 so
 * the UI can show "not on sale yet" instead of a broken redirect.
 */
import {
  createCheckout,
  createOrder,
  planInfo,
  productIdForPlan,
  updateOrder,
  WaffoError,
} from "@paid/core";
import { BRAND } from "./brands";

export type StudioCheckoutResult =
  | { ok: true; orderId: string; url: string; mock: boolean; planId: string }
  | { ok: false; status: number; error: string; message?: string; planId?: string };

export function studioSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(/\/+$/, "");
}

export function studioPackInfo() {
  const info = planInfo(BRAND.site, BRAND.planId);
  return {
    planId: BRAND.planId,
    price: BRAND.price,
    units: info?.units ?? 4,
    amountCents: info?.amountCents ?? 0,
    currency: "USD" as const,
  };
}

export async function startStudioCheckout(input: {
  email?: string;
  requestedPlanId?: string;
}): Promise<StudioCheckoutResult> {
  const site = BRAND.site;
  const planId = BRAND.planId;

  if (input.requestedPlanId && input.requestedPlanId !== planId) {
    return {
      ok: false,
      status: 409,
      error: "plan_not_available",
      message: `Only the ${BRAND.unitLabel} pack (${BRAND.price}) is on sale right now.`,
      planId,
    };
  }

  const info = planInfo(site, planId);
  if (!info) {
    return { ok: false, status: 500, error: "plan_misconfigured", planId };
  }

  const productId = productIdForPlan(site, planId);
  if (!productId) {
    return {
      ok: false,
      status: 503,
      error: "product_not_configured",
      message: "Checkout for this pack is not live yet. Please try again later.",
      planId,
    };
  }

  try {
    const order = await createOrder({
      site,
      planId,
      email: input.email,
      productId,
      metadata: { source: `${BRAND.kind}-studio` },
    });
    const siteUrl = studioSiteUrl();
    const successUrl = `${siteUrl}/?order=${encodeURIComponent(order.id)}`;
    const checkout = await createCheckout({
      site,
      planId,
      amountCents: info.amountCents,
      billing: info.billing,
      productId,
      email: input.email,
      successUrl,
      cancelUrl: `${siteUrl}/?checkout=canceled`,
      metadata: { orderId: order.id },
    });
    await updateOrder(site, order.id, {
      providerSessionId: checkout.id,
      checkoutUrl: checkout.url,
      successUrl,
    });
    return { ok: true, orderId: order.id, url: checkout.url, mock: checkout.mock, planId };
  } catch (error) {
    const err = error as WaffoError;
    console.error("[studio-checkout] waffo failed", err?.message, err?.status);
    return {
      ok: false,
      status: 502,
      error: "checkout_unavailable",
      message: "Checkout is temporarily unavailable. Please try again.",
    };
  }
}
