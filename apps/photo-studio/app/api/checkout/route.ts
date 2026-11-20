import { NextResponse } from "next/server";
import { startStudioCheckout, studioPackInfo } from "@/lib/checkout";

/**
 * POST /api/checkout — create a Waffo checkout session for this brand's pack.
 *
 * Body (all optional): { email?: string, planId?: string }
 * Only `BRAND.planId` is purchasable; any other planId is rejected with 409.
 * When Waffo is not configured the core returns a mock checkout URL (no charge).
 */
export async function POST(req: Request) {
  let body: { email?: unknown; planId?: unknown } | null = null;
  try {
    body = (await req.json()) as { email?: unknown; planId?: unknown };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : undefined;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "invalid_email", message: "Check the email address." }, { status: 400 });
  }
  const requestedPlanId = typeof body.planId === "string" ? body.planId.trim() : undefined;

  const result = await startStudioCheckout({ email, requestedPlanId });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, message: result.message, planId: result.planId, pack: studioPackInfo() },
      { status: result.status },
    );
  }
  return NextResponse.json({
    ok: true,
    orderId: result.orderId,
    url: result.url,
    mock: result.mock,
    planId: result.planId,
    pack: studioPackInfo(),
  });
}

/** GET /api/checkout — the single pack this deployment sells (for the Studio UI). */
export async function GET() {
  return NextResponse.json({ ok: true, pack: studioPackInfo() });
}
