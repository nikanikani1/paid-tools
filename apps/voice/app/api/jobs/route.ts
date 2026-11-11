import { NextResponse } from "next/server";
import { createMockVoiceJob } from "@paid/core";

/**
 * Paid-only job creation.
 *
 * Production (NODE_ENV=production) refuses to create a job unless ALLOW_MOCK=1 is set,
 * and returns 402 payment_required instead. There is no free-of-charge processing tier: the entry
 * point is the $2.90 one-time Trial Pack (15 minutes).
 *
 * Local demos / integration tests can opt back into the mock flow with ALLOW_MOCK=1.
 */
const PAYMENT_REQUIRED_MESSAGE =
  "A paid run is required. The $2.90 Trial Pack includes 15 minutes with 4 stems (WAV + MP3) — one-time payment, no subscription.";

export async function POST(req: Request) {
  const isProduction = process.env.NODE_ENV === "production";
  const allowMock = process.env.ALLOW_MOCK === "1";

  if (isProduction && !allowMock) {
    return NextResponse.json(
      {
        error: "payment_required",
        message: PAYMENT_REQUIRED_MESSAGE,
        checkoutUrl: "/pricing#trial",
        trial: { price: 2.9, currency: "USD", minutes: 15, billing: "one-time" },
      },
      { status: 402 },
    );
  }

  const body = (await req.json().catch(() => null)) as { filename?: string; size?: number } | null;
  if (!body?.filename) {
    return NextResponse.json({ error: "filename is required" }, { status: 400 });
  }
  const job = createMockVoiceJob({ filename: body.filename, size: body.size ?? 0 });
  return NextResponse.json(job, { status: 201 });
}
