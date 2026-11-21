import type { OrderSite } from "@paid/core";

export type SiteKind = "landscape" | "haircolor";

export type BrandStyle = {
  id: string;
  label: string;
  description: string;
  image: string;
};

export type BrandConfig = {
  kind: SiteKind;
  site: OrderSite;
  name: string;
  shortName: string;
  title: string;
  headline: string;
  intro: string;
  uploadLabel: string;
  choiceLabel: string;
  planId: string;
  price: string;
  unitLabel: string;
  features: string[];
  styles: BrandStyle[];
  accent: string;
  accentSoft: string;
  paper: string;
  ink: string;
  legalName: string;
  supportEmail: string;
  /** Public GSC URL-prefix verification token (not a secret). */
  gscVerification: string;
};

const LANDSCAPE: BrandConfig = {
  kind: "landscape",
  site: "landscape",
  name: "YardCanvas",
  shortName: "YardCanvas",
  title: "YardCanvas — AI Landscape Design from a Photo",
  headline: "See your yard redesigned before you dig.",
  intro:
    "Upload one photo of your yard or front garden, pick a style, and get four landscape concepts in minutes. Keep the house, change the planting — not the other way around.",
  uploadLabel: "Upload a yard or garden photo",
  choiceLabel: "Pick a landscape style",
  planId: "landscape-pack",
  price: "$9",
  unitLabel: "4 landscape concepts",
  features: ["4 concepts from one photo", "House and hardscape preserved", "PNG downloads", "One-time payment"],
  styles: [
    { id: "modern", label: "Modern / clean", description: "Straight lines, gravel, architectural planting", image: "/samples/landscape/modern-1.jpg" },
    { id: "japanese", label: "Japanese garden", description: "Maples, moss, stone, quiet structure", image: "/samples/landscape/japanese.jpg" },
    { id: "cottage", label: "Cottage garden", description: "Layered perennials, soft edges, warm colour", image: "/samples/landscape/cottage.jpg" },
    { id: "lowwater", label: "Low-water / native", description: "Dry-climate grasses, gravel, low irrigation", image: "/samples/landscape/lowwater.jpg" },
  ],
  accent: "#2f6f4e",
  accentSoft: "#e8f0e8",
  paper: "#f4f1e8",
  ink: "#1c241d",
  legalName: "YardCanvas",
  supportEmail: "wanghaotiannika@gmail.com",
  gscVerification: "XPzFurBEt-JHxT-OLRkg2B8lq45g3Rrz005yy3zmw9I",
};

const HAIR: BrandConfig = {
  kind: "haircolor",
  site: "haircolor",
  name: "HueMirror",
  shortName: "HueMirror",
  title: "HueMirror — AI Hair Color Try-On",
  headline: "Try the colour before the salon.",
  intro:
    "Upload a clear selfie, choose a shade, and see four face-preserving hair-colour looks. Use them as a reference for your stylist instead of guessing from a swatch.",
  uploadLabel: "Upload a front-facing selfie",
  choiceLabel: "Pick a hair colour",
  planId: "hair-pack",
  price: "$4.90",
  unitLabel: "4 hair-colour looks",
  features: ["4 looks from one selfie", "Face-preserving edit", "Natural + fashion shades", "One-time payment"],
  styles: [
    { id: "blonde", label: "Warm blonde", description: "Honey, sand and soft golden tones", image: "/samples/hair/blonde-1.jpg" },
    { id: "copper", label: "Copper / auburn", description: "Warm red, copper and burnt orange", image: "/samples/hair/copper.jpg" },
    { id: "black", label: "Blue-black", description: "Cool, deep black with a soft shine", image: "/samples/hair/black.jpg" },
    { id: "pastel", label: "Pastel / fashion", description: "Rose, lilac or mint — clearly editorial", image: "/samples/hair/pastel.jpg" },
  ],
  accent: "#9d3f5c",
  accentSoft: "#f7e8ee",
  paper: "#f8f2f3",
  ink: "#2a1b20",
  legalName: "HueMirror",
  supportEmail: "wanghaotiannika@gmail.com",
  gscVerification: "mxUs6IFcDaRwnt78w7OK1e5Tcv_7RooPq3-2EbmTL0k",
};

/** Build-time brand selection. Deploy the same app twice with a different env. */
export const SITE_KIND: SiteKind =
  process.env.NEXT_PUBLIC_SITE_KIND === "haircolor" ? "haircolor" : "landscape";

export const BRAND: BrandConfig = SITE_KIND === "haircolor" ? HAIR : LANDSCAPE;

export function brandForKind(kind: SiteKind): BrandConfig {
  return kind === "haircolor" ? HAIR : LANDSCAPE;
}

export function siteKindFromEnv(): SiteKind {
  const raw = String(process.env.SITE ?? process.env.NEXT_PUBLIC_SITE_KIND ?? "landscape").toLowerCase();
  return raw === "haircolor" ? "haircolor" : "landscape";
}
