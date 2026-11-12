import type { Metadata } from "next";
import "./globals.css";
import { ScrollReveal } from "./components/ScrollReveal";
import { SiteFooter, SiteHeader } from "./components/site-chrome";
import { SITE_NAME, SITE_URL } from "./lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Professional Headshots — AI Headshot Generator from Selfies",
    template: `%s — ${SITE_NAME}`,
  },
  description:
    "Professional headshots generated from five selfies in minutes. Paid packages start with a $9 five-image Sample Pack, then 40 for $35. One-time pricing, commercial licence, one free redo.",
  keywords: [
    "professional headshots",
    "professional headshot",
    "ai headshot generator",
    "ai headshots",
    "linkedin headshot",
    "team headshots",
  ],
  alternates: {
    canonical: SITE_URL,
    languages: { "en-US": SITE_URL, "x-default": SITE_URL },
  },
  openGraph: {
    title: "Professional Headshots — AI Headshot Generator from Selfies",
    description:
      "Professional headshots from five selfies. Start with a $9 five-image Sample Pack, then 40 for $35, 60 for $45 or 100 for $75. One-time payment, one free redo.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional Headshots — AI Headshot Generator from Selfies",
    description:
      "Professional headshots from five selfies in minutes. Paid from a $9 Sample Pack; 40 for $35, 60 for $45, 100 for $75.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <ScrollReveal />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
