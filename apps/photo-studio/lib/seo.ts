import type { Metadata } from "next";
import { BRAND } from "@/lib/brands";

/**
 * Canonical base URL.
 * - Production sets NEXT_PUBLIC_SITE_URL per deployment (landscape and haircolor are two builds).
 * - Localhost values are ignored so a local build cannot poison canonicals/sitemap.
 * - Fallbacks stay on the placeholder brand domains until the real domains are configured.
 */
const RAW_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
const FALLBACK_SITE_URL = BRAND.kind === "haircolor" ? "https://huemirror.example" : "https://yardcanvas.example";

export const SITE_URL =
  RAW_SITE_URL && /^https?:\/\//.test(RAW_SITE_URL) && !/localhost|127\.0\.0\.1/.test(RAW_SITE_URL)
    ? RAW_SITE_URL.replace(/\/+$/, "")
    : FALLBACK_SITE_URL;

export const SITE_NAME = BRAND.name;
export const SITE_DESCRIPTION = BRAND.intro;

export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
};

/** Per-page metadata: unique title/description, canonical, OG/Twitter and optional noindex. */
export function buildMetadata({ title, description, path, noindex = false }: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { en: url, "x-default": url },
    },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export type FaqItem = { q: string; a: string };

type SchemaNode = Record<string, unknown>;

export function faqPageJsonLd(items: FaqItem[]): SchemaNode {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function webApplicationJsonLd(opts: { name: string; description: string; path?: string }): SchemaNode {
  const path = opts.path ?? "/";
  const price = BRAND.price.replace(/[^0-9.]/g, "");
  return {
    "@type": "WebApplication",
    "@id": `${absoluteUrl(path)}#app`,
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(path),
    applicationCategory: "MultimediaApplication",
    applicationSubCategory: "AI photo editing",
    operatingSystem: "Any (browser-based)",
    inLanguage: "en",
    isAccessibleForFree: false,
    offers: [
      {
        "@type": "Offer",
        name: `${BRAND.name} ${BRAND.unitLabel}`,
        price,
        priceCurrency: "USD",
        description: `${BRAND.unitLabel} for ${BRAND.price}, one-time payment`,
      },
    ],
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

export function productJsonLd(opts: { name: string; description: string; path?: string }): SchemaNode {
  const path = opts.path ?? "/pricing";
  const price = BRAND.price.replace(/[^0-9.]/g, "");
  return {
    "@type": "Product",
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(path),
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(path),
      price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): SchemaNode {
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
  return { "@context": "https://schema.org", "@graph": nodes };
}
