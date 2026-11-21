import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Canonical host: www -> apex 301. See apps/voice/middleware.ts.
 */
export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  if (host.startsWith("www.")) {
    const url = new URL(req.url);
    url.host = host.slice(4);
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

  // Old workers.dev host: send browsers to the branded domain, but leave API
  // POSTs alone so in-flight webhooks/checkout callbacks are not rewritten.
  const canonical = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/^https?:\/\//, "").replace(/\/+$/, "");
  if (host.endsWith(".workers.dev") && canonical && (req.method === "GET" || req.method === "HEAD")) {
    const url = new URL(req.url);
    url.host = canonical;
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
