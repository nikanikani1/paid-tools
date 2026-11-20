import type { SiteKind } from "./brands";

const BASE_LANDSCAPE =
  "Photorealistic landscape-design concept for the yard in this photo. Keep the house architecture, roof, windows, doors, driveway, fences, property boundaries and camera angle exactly unchanged. Only redesign the planting, lawn, hardscape, lighting and outdoor furniture. No people, no text, no watermark. Natural daylight, realistic materials, wide-angle real-estate composition.";

const LANDSCAPE_STYLES: Record<string, string> = {
  modern:
    "Modern clean landscape: straight concrete or gravel paths, architectural grasses, sculptural shrubs, minimal lawn, warm low-voltage path lights, charcoal planters.",
  japanese:
    "Japanese garden: Japanese maple, moss, clipped pine, raked gravel, natural stone, stone lantern, quiet layered planting, restrained palette.",
  cottage:
    "Cottage garden: layered perennials, roses, lavender, soft curved beds, warm gravel path, weathered wood, welcoming but not overgrown.",
  lowwater:
    "Low-water native landscape: drought-tolerant grasses, succulents, gravel mulch, boulders, drip irrigation, no lawn, desert-modern palette.",
};

const HAIR_STYLES: Record<string, string> = {
  blonde:
    "clearly warm honey-blonde hair, noticeably lighter than the source, with visible blonde tone in the roots and lengths, natural dimension and soft salon-grade shine; keep the same haircut and styling",
  copper:
    "rich copper-auburn hair, clearly warmer and redder than the source, with natural dimension and soft salon-grade shine; keep the same haircut and styling",
  black:
    "deep blue-black hair, clearly darker and cooler than the source, with soft shine and subtle dimension; keep the same haircut and styling",
  pastel:
    "editorial pastel hair in a clearly visible soft rose-lilac tone, noticeably different from the source, with visible dimension; keep the same haircut and styling, clearly a fashion colour",
};

const HAIR_BASE =
  "Edit only the hair colour in this portrait. Preserve the exact same person: face shape, eyes, nose, mouth, skin tone, expression, pose, clothing, background and lighting must stay unchanged. Do not beautify or reshape the face. Photorealistic salon result, natural hair texture, no text, no watermark.";

export function buildPrompts(kind: SiteKind, styleId: string): string[] {
  if (kind === "haircolor") {
    const style = HAIR_STYLES[styleId] ?? HAIR_STYLES.blonde;
    return [
      `${HAIR_BASE} ${style}. Soft window light from the front.`,
      `${HAIR_BASE} ${style}. Slightly warmer side light, natural indoor portrait.`,
      `${HAIR_BASE} ${style}. Soft overcast daylight, editorial but realistic.`,
      `${HAIR_BASE} ${style}. Gentle salon lighting, visible hair detail and shine.`,
    ];
  }
  const style = LANDSCAPE_STYLES[styleId] ?? LANDSCAPE_STYLES.modern;
  return [
    `${BASE_LANDSCAPE} ${style} Wide establishing shot.`,
    `${BASE_LANDSCAPE} ${style} Three-quarter view of the yard, slightly closer.`,
    `${BASE_LANDSCAPE} ${style} Golden-hour warm light, realistic long shadows.`,
    `${BASE_LANDSCAPE} ${style} Overcast soft light, true-to-material colours.`,
  ];
}

export function isValidStyle(kind: SiteKind, styleId: string): boolean {
  return kind === "haircolor" ? Boolean(HAIR_STYLES[styleId]) : Boolean(LANDSCAPE_STYLES[styleId]);
}
