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
    "Turn 5 selfies into 40–100 professional headshots for LinkedIn, résumés and team pages. One-time pricing from $35, free preview, free redo.",
  keywords: [
    "ai headshot generator",
    "professional headshots",
    "linkedin headshot",
    "team headshots",
    "ai headshots",
  ],
  alternates: {
    canonical: SITE_URL,
    languages: { "en-US": SITE_URL, "x-default": SITE_URL },
  },
  openGraph: {
    title: "AI Headshot Generator — Professional Headshots from Selfies",
    description:
      "40–100 professional headshots from five selfies. One-time pricing from $35, free preview, free redo.",
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
