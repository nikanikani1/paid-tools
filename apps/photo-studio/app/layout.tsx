import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
import { BRAND } from "@/lib/brands";

export const metadata: Metadata = {
  title: BRAND.title,
  description: BRAND.intro,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"),
  openGraph: { title: BRAND.title, description: BRAND.intro, type: "website" },
  twitter: { card: "summary_large_image", title: BRAND.title, description: BRAND.intro },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const vars = {
    "--brand": BRAND.accent,
    "--brand-soft": BRAND.accentSoft,
    "--paper": BRAND.paper,
    "--ink": BRAND.ink,
  } as CSSProperties;
  return (
    <html lang="en" style={vars}>
      <body>{children}</body>
    </html>
  );
}
