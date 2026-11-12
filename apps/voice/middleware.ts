import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Canonical host: www -> apex 301.
 * Cloudflare Redirect Rules require zone permissions we may not have on the deploy token,
 * so the redirect lives in the Worker middleware instead.
 */
export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  if (host.startsWith("www.")) {
    const url = new URL(req.url);
    url.host = host.slice(4);
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
