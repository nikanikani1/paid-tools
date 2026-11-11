import { NextResponse } from "next/server";
import { createMockHeadshotJob } from "@paid/core";

/**
 * Order creation gate.
 *
 * There is no free generation anywhere in the product, so in production this
 * endpoint must never create a job without a paid order. A real checkout
 * (Waffo) is not connected yet, therefore production requests are answered
 * with HTTP 402 `payment_required` until the payment provider is wired in.
 *
 * Local development and automated tests keep the mock flow by setting
 * `ALLOW_MOCK=1`.
 */
export async function POST(req: Request) {
  const allowMock = process.env.ALLOW_MOCK === "1";
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction && !allowMock) {
    return NextResponse.json(
      {
        error: "payment_required",
        message:
          "A paid order is required. Checkout is not connected in this build — start with the $9 Sample Pack once payments are live.",
        minimum_order_usd: 9,
      },
      { status: 402 },
    );
  }

  const body = (await req.json().catch(() => null)) as { files?: number; style?: string; images?: number } | null;
  if (!body || (body.files ?? 0) < 3) {
    return NextResponse.json({ error: "At least 3 selfies are required" }, { status: 400 });
  }
  const images = body.images ?? 5;
  if (images < 1) {
    return NextResponse.json({ error: "Invalid package size" }, { status: 400 });
  }
  const job = createMockHeadshotJob({
    files: body.files,
    style: body.style ?? "LinkedIn / Corporate",
    images,
    allowMock,
  });
  return NextResponse.json(job, { status: 201 });
}
