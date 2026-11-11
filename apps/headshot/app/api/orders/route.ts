import { NextResponse } from "next/server";
import { createMockHeadshotJob } from "@paid/core";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { files?: number; style?: string; images?: number } | null;
  if (!body || (body.files ?? 0) < 3) {
    return NextResponse.json({ error: "At least 3 selfies are required" }, { status: 400 });
  }
  const job = createMockHeadshotJob({
    files: body.files,
    style: body.style ?? "LinkedIn / Corporate",
    images: body.images ?? 40,
  });
  return NextResponse.json(job, { status: 201 });
}
