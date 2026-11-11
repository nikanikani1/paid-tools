export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  const safe = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const body = [
    `Mock stem file: ${safe}`,
    "",
    "This placeholder is served by the demo build because no AI provider keys are connected yet.",
    "Once REPLICATE_API_TOKEN / R2 credentials are configured, this URL will return the real separated audio.",
    "",
    "Nothing here is a real audio file, so nothing is copyrighted either. Go make something.",
    "",
  ].join("\n");

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safe}.txt"`,
      "Cache-Control": "no-store",
    },
  });
}
