import type { NextConfig } from "next";

/**
 * Security headers (task-24, P0).
 *
 * Enforced (safe for the current pages — no inline-only features are blocked):
 *  - X-Content-Type-Options: keep browsers from MIME-sniffing uploads/downloads.
 *  - Referrer-Policy: don't leak full URLs (job ids / signed URLs) to third parties.
 *  - Permissions-Policy: the product uses no camera/mic/geolocation/USB; disable them.
 *  - X-Frame-Options: deny framing (clickjacking) — the app is never embedded.
 *
 * Report-only (NOT enforced): a CSP baseline that already matches the app
 * (self + inline styles/scripts from Next, R2 signed media, Waffo checkout
 * redirect). It is report-only on purpose — enforcing CSP needs nonces for
 * Next's inline bootstrap, which is a separate change. No report endpoint is
 * configured yet, so violations appear only in the browser console (see
 * docs/COMPLIANCE.md §5).
 */
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https: wss:",
  "frame-src 'self' https://pancake.waffo.ai",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://pancake.waffo.ai",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
];

const nextConfig: NextConfig = {
  transpilePackages: ["@paid/core"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
