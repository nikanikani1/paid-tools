import type { Metadata } from "next";
import { SITE_NAME, SITE_TAGLINE, SITE_URL, PLANS, type FaqItem } from "./site";

type MetaInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
};

/**
 * Canonical + hreflang scaffold. The English site is the default locale, so the
 * canonical points at the English URL and `en-US` / `x-default` both resolve to
 * it. When `/zh` and `/es` route trees land, only this function has to change.
 */
export function canonicalFor(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean === "/" ? SITE_URL : `${SITE_URL}${clean}`;
}

export function buildMetadata({ title, description, path, keywords }: MetaInput): Metadata {
  const url = canonicalFor(path);
  return {
    title,
    description,
    keywords,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
      languages: {
        "en-US": url,
        "x-default": url,
      },
    },
    openGraph: {
      title,
      description,
      url,
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
      title,
      description,
      images: ["/og/headshot-og.png"],
    },
    robots: { index: true, follow: true },
  };
}

export type JsonLd = Record<string, unknown>;

export function webApplicationJsonLd(input: {
  name: string;
  description: string;
  path: string;
  category?: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: input.name,
    description: input.description,
    url: canonicalFor(input.path),
    applicationCategory: input.category ?? "BusinessApplication",
    applicationSubCategory: "AI headshot generator",
    operatingSystem: "Web browser",
    browserRequirements: "Requires JavaScript",
    inLanguage: "en-US",
    isAccessibleForFree: false,
    offers: PLANS.map((plan) => ({
      "@type": "Offer",
      name: `${plan.name} — ${plan.images} headshots`,
      price: plan.price,
      priceCurrency: "USD",
      url: canonicalFor("/pricing"),
      availability: "https://schema.org/InStock",
    })),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function faqPageJsonLd(items: FaqItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function productJsonLd(input?: {
  name?: string;
  description?: string;
  path?: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input?.name ?? `${SITE_TAGLINE} packages`,
    description:
      input?.description ??
      "One-time AI headshot packages: a $9 five-image Sample Pack, then 40, 60 or 100 professional portraits generated from your selfies. No free tier; every paid order includes one free redo.",
    brand: { "@type": "Brand", name: SITE_NAME },
    category: "Professional headshots",
    url: canonicalFor(input?.path ?? "/pricing"),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: Math.min(...PLANS.map((p) => p.price)),
      highPrice: Math.max(...PLANS.map((p) => p.price)),
      offerCount: PLANS.length,
      availability: "https://schema.org/InStock",
      offers: PLANS.map((plan) => ({
        "@type": "Offer",
        name: `${plan.name} — ${plan.images} headshots`,
        description: plan.features.join(", "),
        price: plan.price,
        priceCurrency: "USD",
        url: canonicalFor("/pricing"),
        availability: "https://schema.org/InStock",
      })),
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonicalFor(item.path),
    })),
  };
}

export function howToJsonLd(input: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: input.name,
    description: input.description,
    totalTime: "PT5M",
    step: input.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}
