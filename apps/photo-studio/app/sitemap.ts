import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { STYLE_PAGES } from "@/lib/style-pages";

const BASE_ENTRIES: { path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.9, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/refund", priority: 0.3, changeFrequency: "yearly" },
];

/** Only this build's brand has style pages; the other brand's slugs are not generated. */
const STYLE_ENTRIES = STYLE_PAGES.map((page) => ({
  path: `/styles/${page.id}`,
  priority: 0.7,
  changeFrequency: "monthly" as const,
}));

const ENTRIES = [...BASE_ENTRIES, ...STYLE_ENTRIES];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-11-22T00:00:00.000Z");
  return ENTRIES.map((entry) => ({
    url: `${SITE_URL}${entry.path === "/" ? "" : entry.path}`,
    lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
