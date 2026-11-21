import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
import { BRAND } from "@/lib/brands";
import { Analytics } from "@/components/Analytics";

const OG_IMAGE = BRAND.kind === "landscape" ? "/og/landscape.png" : "/og/hair.png";
const GSC_VERIFICATION = BRAND.gscVerification;

export const metadata: Metadata = {
  title: BRAND.title,
  description: BRAND.intro,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"),
  openGraph: {
    title: BRAND.title,
    description: BRAND.intro,
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${BRAND.name} — ${BRAND.headline}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND.title,
    description: BRAND.intro,
    images: [OG_IMAGE],
  },
  verification: GSC_VERIFICATION ? { google: GSC_VERIFICATION } : undefined,
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
    <html lang="en" className="scroll-smooth" style={vars}>
      <body className="pb-20 md:pb-0">
        <Analytics site={BRAND.site} />
        {children}
      </body>
    </html>
  );
}
