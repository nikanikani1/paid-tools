import type { Metadata } from "next";

/**
 * Canonical site URL.
 * - Set NEXT_PUBLIC_SITE_URL_VOICE in production (e.g. https://stemsplit.com).
 * - Localhost values are ignored so a local build can never poison canonicals/sitemap.
 * - Until the real domain is purchased, fall back to the placeholder already used by the app.
 */
const RAW_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL_VOICE?.trim() ?? "";
export const SITE_URL =
  RAW_SITE_URL && /^https?:\/\//.test(RAW_SITE_URL) && !/localhost|127\.0\.0\.1/.test(RAW_SITE_URL)
    ? RAW_SITE_URL.replace(/\/+$/, "")
    : "https://voice.example.com";

export const SITE_NAME = "StemSplit.ai";
export const SUPPORT_EMAIL = "support@stemextractor.com";
export const LEGAL_UPDATED = "November 11, 2026";
/** ISO date shown on editorial pages ("Last updated: 2026-11-11"). */
export const CONTENT_UPDATED = "2026-11-11";
export const OPERATOR_NAME = "StemSplit Audio Team";

export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
};

/**
 * Per-page metadata: title, description, canonical, self-referential hreflang (en + x-default).
 * The `/[lang]` directory can be added later without changing these canonical URLs.
 */
export function pageMetadata({ title, description, path }: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: url,
        "x-default": url,
      },
    },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      title,
      description,
      images: [
        {
          url: "/og/voice-og.png",
          width: 1200,
          height: 630,
          alt: "StemSplit.ai — separate vocals and instrumental from any song",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og/voice-og.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}

export type FaqItem = { q: string; a: string };

type SchemaNode = Record<string, unknown>;

export function webApplicationSchema(opts: {
  name: string;
  description: string;
  path: string;
}): SchemaNode {
  return {
    "@type": "WebApplication",
    "@id": `${absoluteUrl(opts.path)}#app`,
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.path),
    applicationCategory: "MultimediaApplication",
    applicationSubCategory: "Audio stem separation",
    operatingSystem: "Any (browser-based, no install)",
    browserRequirements: "Requires JavaScript",
    inLanguage: "en",
    isAccessibleForFree: false,
    offers: [
      {
        "@type": "Offer",
        name: "Trial Pack",
        price: "2.90",
        priceCurrency: "USD",
        description: "One-time $2.90 Trial Pack: 15 minutes, 4 stems, WAV + MP3",
      },
      {
        "@type": "Offer",
        name: "Starter",
        price: "5",
        priceCurrency: "USD",
        description: "90 minutes per month, 4 stems, WAV + MP3",
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: "9",
        priceCurrency: "USD",
        description: "200 minutes per month, 4 + 6 stems, priority queue",
      },
      {
        "@type": "Offer",
        name: "Starter Annual",
        price: "39",
        priceCurrency: "USD",
        description: "90 minutes per month, billed $39/year",
      },
    ],
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function faqSchema(items: FaqItem[]): SchemaNode {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): SchemaNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function graphSchema(...nodes: SchemaNode[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}
