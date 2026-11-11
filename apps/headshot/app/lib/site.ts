import { HEADSHOT_PLANS } from "@paid/core";

export const SITE_URL = "https://headshot.example.com";
export const SITE_NAME = "PortraitLab";
export const SITE_TAGLINE = "AI headshot generator";

export const PLANS = HEADSHOT_PLANS;

export const STYLES = [
  "LinkedIn / Corporate",
  "Creative",
  "Actor / Casting",
  "Medical / Clinic",
  "Real Estate",
] as const;

export const STYLE_DETAILS: { name: string; blurb: string; bestFor: string }[] = [
  {
    name: "LinkedIn / Corporate",
    blurb:
      "Studio-grey or soft-office backdrops, dark blazer or button-down, shoulders square to camera and a relaxed closed-mouth smile.",
    bestFor: "LinkedIn profiles, company directories, conference bios, résumés.",
  },
  {
    name: "Creative",
    blurb:
      "Warmer rim light, textured wall or window light, knitwear and softer expression — professional but unmistakably human.",
    bestFor: "Designers, marketers, founders, freelance profiles and speaker pages.",
  },
  {
    name: "Actor / Casting",
    blurb:
      "Neutral seamless background, natural skin texture, minimal styling and three framing options: commercial, theatrical and head-and-shoulders.",
    bestFor: "Casting submissions, agency rosters, IMDb and Spotlight-adjacent profiles.",
  },
  {
    name: "Medical / Clinic",
    blurb:
      "White coat or clean clinical attire, bright low-shadow light, calm neutral background — reads as competent and approachable.",
    bestFor: "Hospital team pages, clinic sites, Healthgrades-style listings, insurance directories.",
  },
  {
    name: "Real Estate",
    blurb:
      "Confident posture, business casual or blazer, softly blurred interior or skyline behind you — built for small avatars and yard signs.",
    bestFor: "Realtor bios, Zillow and brokerage pages, business cards, bus-bench ads.",
  },
];

export const NAV_LINKS: { href: string; label: string }[] = [
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/ai-professional-headshot", label: "Professional" },
  { href: "/team-headshots", label: "For teams" },
];

export const USE_CASES: { href: string; title: string; body: string }[] = [
  {
    href: "/linkedin-headshot",
    title: "LinkedIn headshot",
    body: "Recruiters spend seconds on a profile photo. A clean, well-lit portrait is the cheapest credibility upgrade you can make.",
  },
  {
    href: "/ai-professional-headshot",
    title: "Professional headshot",
    body: "Résumés, speaker decks, press pages and company About sections, all covered by one consistent set of business-ready portraits.",
  },
  {
    href: "/team-headshots",
    title: "Team headshots",
    body: "Ten or more people, one style guide. Consistent backgrounds and crops so your website finally looks like one company.",
  },
  {
    href: "/real-estate-agent-headshots",
    title: "Real estate agents",
    body: "Portraits that hold up at 96 pixels on a listing card and at poster size on a yard sign.",
  },
  {
    href: "/doctor-headshots",
    title: "Doctors & clinics",
    body: "Clinical, approachable portraits for hospital directories, clinic sites and insurance listings.",
  },
  {
    href: "/free-ai-headshot-generator",
    title: "Free preview",
    body: "See one AI portrait rendered from your own photos before you decide whether to buy a full set.",
  },
];

export const FOOTER_LINKS: { href: string; label: string }[] = [
  { href: "/free-ai-headshot-generator", label: "Free AI headshot generator" },
  { href: "/ai-professional-headshot", label: "AI professional headshot" },
  { href: "/linkedin-headshot", label: "LinkedIn headshot" },
  { href: "/team-headshots", label: "Team headshots" },
  { href: "/real-estate-agent-headshots", label: "Real estate agent headshots" },
  { href: "/doctor-headshots", label: "Doctor headshots" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refund", label: "Refund & redo" },
];

export const TRUST_POINTS: { title: string; body: string }[] = [
  {
    title: "One free redo, no argument",
    body: "If the first set misses, request a redo within 48 hours and we regenerate with adjusted guidance — free, once per order.",
  },
  {
    title: "Faces are never used for training",
    body: "Uploads are used only to render your order. Originals are deleted after 30 days, and we never sell, publish or model-train on your photos.",
  },
  {
    title: "One-time payment",
    body: "No subscription, no credits that expire, no surprise renewal. Pay once, download everything you bought.",
  },
  {
    title: "Written refund policy",
    body: "If we cannot produce a usable set and the redo does not fix it, you get your money back under the published refund terms.",
  },
];

export const HOME_FAQ = [
  {
    q: "How many selfies do I need to upload?",
    a: "Three is the minimum, five is what we recommend: one front-facing frame, one turned slightly left, one slightly right, one with a natural smile, and one shot in different lighting. More variety helps the model separate your identity from a single camera angle.",
  },
  {
    q: "How long does it take to get my headshots?",
    a: "Most 40-photo orders finish in about two minutes of generation time; 100-photo orders take closer to four minutes. The page updates live while your set is rendering, and you can download individual images or a single ZIP when it is done.",
  },
  {
    q: "Do the headshots actually look like me?",
    a: "The pipeline preserves identity in two stages: an identity-conditioned generation model produces the portrait, then a face-comparison model merges your original facial features back into the output. That second stage is why our sets stay recognisable instead of drifting into a generic stock person.",
  },
  {
    q: "Can I use the headshots commercially?",
    a: "Yes. Every paid package includes a commercial licence for the images you receive: LinkedIn, your company website, brochures, ads, articles, speaker decks and printed material. The only restriction is that you may not resell the images as stock photography.",
  },
  {
    q: "What happens to my uploaded photos?",
    a: "They are used only to render your order, never for model training, and deleted from storage after 30 days. You can request earlier deletion at any time from the order email.",
  },
  {
    q: "What if I do not like the results?",
    a: "Request a redo within 48 hours of delivery and we regenerate with adjusted style guidance. If the redo still does not resemble you, the refund policy applies — see the refund page for the exact conditions.",
  },
];

export type FaqItem = { q: string; a: string };
