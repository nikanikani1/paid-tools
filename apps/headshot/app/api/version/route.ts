import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const proc = (globalThis as unknown as { process?: { version?: string } }).process;
  return NextResponse.json({
    service: "headshot",
    status: "ok",
    commit: process.env.GIT_COMMIT ?? process.env.CF_PAGES_COMMIT_SHA ?? "dev",
    runtime: proc?.version ?? "edge",
    time: new Date().toISOString(),
  });
}
