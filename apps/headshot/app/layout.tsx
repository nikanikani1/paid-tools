import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter, SiteHeader } from "./components/site-chrome";
import { SITE_NAME, SITE_URL } from "./lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AI Headshot Generator — Professional Headshots from Selfies",
    template: `%s — ${SITE_NAME}`,
  },
  description:
    "Turn 5 selfies into professional headshots for LinkedIn, résumés and team pages. Paid packages start with a $9 five-image Sample Pack; one-time pricing, one free redo, no subscription.",
  keywords: [
    "ai headshot generator",
    "professional headshots",
    "linkedin headshot",
    "team headshots",
    "ai headshots",
    "sample pack headshots",
  ],
  alternates: {
    canonical: SITE_URL,
    languages: { "en-US": SITE_URL, "x-default": SITE_URL },
  },
  openGraph: {
    title: "AI Headshot Generator — Professional Headshots from Selfies",
    description:
      "Professional headshots from five selfies. Start with a $9 five-image Sample Pack, then 40 for $35, 60 for $45 or 100 for $75. One-time payment, one free redo.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
