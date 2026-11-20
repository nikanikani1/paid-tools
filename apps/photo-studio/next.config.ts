import type { NextConfig } from "next";

/**
 * Security headers (task-24, P0) — same policy as the voice app.
 *
 * Enforced: X-Content-Type-Options, Referrer-Policy, Permissions-Policy,
 * X-Frame-Options. Report-only: CSP baseline (not enforced; see docs/COMPLIANCE.md).
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
