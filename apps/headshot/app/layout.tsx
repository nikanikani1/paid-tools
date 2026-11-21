import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "./components/Analytics";
import { ScrollReveal } from "./components/ScrollReveal";
import { SiteFooter, SiteHeader } from "./components/site-chrome";
import { MobileCta } from "./components/mobile-cta";
import { SITE_NAME, SITE_URL } from "./lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Professional Headshots — AI Headshot Generator from Selfies",
    template: `%s — ${SITE_NAME}`,
  },
  description:
    "Professional headshots generated from five selfies in minutes. The $9 five-image Sample Pack is the only package on sale today; larger packages are coming soon. One-time pricing, commercial licence, one free redo.",
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
      "Professional headshots from five selfies. The $9 five-image Sample Pack is the only package on sale today; larger packages are coming soon. One-time payment, one free redo.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og/headshot-og.png",
        width: 1200,
        height: 630,
        alt: "PortraitLab — AI professional headshots from selfies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional Headshots — AI Headshot Generator from Selfies",
    description:
      "Professional headshots from five selfies in minutes. Paid from a $9 Sample Pack; larger packages are coming soon.",
    images: ["/og/headshot-og.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="pb-20 md:pb-0">
        <ScrollReveal />
        <Analytics site="headshot" />
        <SiteHeader />
        {children}
        <SiteFooter />
        <MobileCta />
      </body>
    </html>
  );
}
