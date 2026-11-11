import { NextResponse } from "next/server";
import { createMockVoiceJob } from "@paid/core";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { filename?: string; size?: number } | null;
  if (!body?.filename) {
    return NextResponse.json({ error: "filename is required" }, { status: 400 });
  }
  const job = createMockVoiceJob({ filename: body.filename, size: body.size ?? 0 });
  return NextResponse.json(job, { status: 201 });
}
