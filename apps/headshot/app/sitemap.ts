import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/site";

type Route = {
  path: string;
  priority: number;
  changeFrequency: "weekly" | "monthly" | "yearly";
};

const ROUTES: Route[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/free-ai-headshot-generator", priority: 0.9, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.9, changeFrequency: "weekly" },
  { path: "/ai-professional-headshot", priority: 0.8, changeFrequency: "monthly" },
  { path: "/linkedin-headshot", priority: 0.8, changeFrequency: "monthly" },
  { path: "/team-headshots", priority: 0.8, changeFrequency: "monthly" },
  { path: "/real-estate-agent-headshots", priority: 0.7, changeFrequency: "monthly" },
  { path: "/doctor-headshots", priority: 0.7, changeFrequency: "monthly" },
  { path: "/how-it-works", priority: 0.6, changeFrequency: "monthly" },
  { path: "/refund", priority: 0.4, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-11-11T00:00:00.000Z");
  return ROUTES.map((route) => ({
    url: route.path === "/" ? SITE_URL : `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: {
      languages: {
        en: route.path === "/" ? SITE_URL : `${SITE_URL}${route.path}`,
      },
    },
  }));
}
