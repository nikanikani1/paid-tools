import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

type SitemapEntry = {
  path: string;
  priority: number;
  changeFrequency: "weekly" | "monthly" | "yearly";
};

/**
 * One language (en) for now. When /zh and /es routes land, add their paths here;
 * the per-page alternates.languages map in lib/seo.ts stays the same.
 */
const ENTRIES: SitemapEntry[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/ai-vocal-remover", priority: 0.9, changeFrequency: "monthly" },
  { path: "/free-vocal-eliminator", priority: 0.9, changeFrequency: "monthly" },
  { path: "/vocal-remover-online", priority: 0.9, changeFrequency: "monthly" },
  { path: "/remove-vocals-from-song", priority: 0.8, changeFrequency: "monthly" },
  { path: "/acapella-maker", priority: 0.8, changeFrequency: "monthly" },
  { path: "/karaoke-maker", priority: 0.8, changeFrequency: "monthly" },
  { path: "/separate-stems", priority: 0.8, changeFrequency: "monthly" },
  { path: "/pricing", priority: 0.8, changeFrequency: "monthly" },
  { path: "/how-it-works", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/authors/stemsplit-audio-team", priority: 0.4, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/refund", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-11-11T00:00:00.000Z");
  return ENTRIES.map((entry) => ({
    url: `${SITE_URL}${entry.path === "/" ? "" : entry.path}`,
    lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
