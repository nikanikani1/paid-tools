import { NextResponse } from "next/server";

const KEY = "b484acedb3587c1727f9d59ca2bcda33";

export async function GET(_req: Request, ctx: { params: Promise<{ key: string }> }) {
  const { key } = await ctx.params;
  if (key !== KEY && key !== `${KEY}.txt`) return NextResponse.json({ error: "not found" }, { status: 404 });
  return new Response(KEY, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" } });
}
