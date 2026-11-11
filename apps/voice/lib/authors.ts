import { CONTENT_UPDATED } from "@/lib/seo";

export type AuthorUpdate = { date: string; note: string };

export type Author = {
  slug: string;
  name: string;
  role: string;
  shortBio: string;
  bio: string[];
  covers: { href: string; label: string }[];
  howWeWork: string[];
  updateLog: AuthorUpdate[];
  contactEmail: string;
  lastUpdated: string;
};

/**
 * Only one author entity for now: the team that actually builds and operates the product.
 * No invented individuals, credentials, awards, review counts or customer numbers.
 */
export const AUTHORS: Author[] = [
  {
    slug: "stemsplit-audio-team",
    name: "StemSplit Audio Team",
    role: "The product and audio-engineering team behind StemSplit.ai",
    shortBio:
      "We build and operate the AI stem-separation pipeline behind StemSplit.ai, and we write the guides that explain how it works.",
    bio: [
      "StemSplit Audio Team is the small group of people who build and run this site. Our day-to-day work is the separation pipeline itself: checking uploaded audio, running the htdemucs model, storing the rendered stems and delivering the downloads. That is the experience behind the guides published here — we are the team who operates the system, not a review site that reposts press releases.",
      "We are not a recording studio, a label or a talent agency. We do not have a staff of session musicians or Grammy-winning producers, and we do not claim to. What we can speak to is how source-separation models behave, what processing does to a stereo mix, and where the real limits of both AI separation and the older center-channel trick are.",
      "Every guide on this site carries this byline and a last-updated date, and corrections go to the editorial inbox below. If a page says a built-in OS or DAW feature cannot do something, that reflects what the official documentation and the software actually do — not a guess.",
    ],
    covers: [
      { href: "/ai-vocal-remover", label: "AI vocal remover" },
      { href: "/free-vocal-eliminator", label: "Free vocal eliminator comparison" },
      { href: "/vocal-remover-online", label: "Vocal remover online" },
      { href: "/remove-vocals-from-song", label: "Removing vocals from a song" },
      { href: "/acapella-maker", label: "Acapella extraction" },
      { href: "/karaoke-maker", label: "Karaoke backing tracks" },
      { href: "/separate-stems", label: "4-stem separation" },
      { href: "/how-it-works", label: "The separation pipeline" },
      { href: "/about", label: "Editorial and quality standards" },
    ],
    howWeWork: [
      "We describe methods we can verify from official documentation or from the model we operate — not benchmark numbers we did not measure.",
      "Every guide is dated and signed by this team; when we correct something, we update the page and note the change here.",
      "We do not publish reviews, ratings, customer counts or before/after audio we cannot prove. Sample outputs are illustrative; real A/B samples will be added after launch.",
      "Where a built-in Windows, macOS, phone or DAW feature cannot do the job, we say so instead of inventing a step.",
      "No paid rankings and no sponsored placements: commercial decisions do not change our technical claims.",
    ],
    updateLog: [
      {
        date: CONTENT_UPDATED,
        note: "Added About, Contact and author pages with a published editorial standard, plus a note on what sample content is illustrative.",
      },
      {
        date: CONTENT_UPDATED,
        note: "Added 'System built-in method' sections (Windows, macOS, iPhone/iPad, Android, DAW) and last-updated/author bylines to all seven tool pages.",
      },
      {
        date: CONTENT_UPDATED,
        note: "Moved to a paid-only model: the $2.90 one-time Trial Pack replaced the previous complimentary preview; pricing, FAQ and JSON-LD were updated.",
      },
      {
        date: CONTENT_UPDATED,
        note: "Published the first seven vocal-remover workflow guides and the legal/trust pages.",
      },
    ],
    contactEmail: "editorial@stemsplit.ai",
    lastUpdated: CONTENT_UPDATED,
  },
];

export const PRIMARY_AUTHOR = AUTHORS[0];

export function getAuthor(slug: string): Author | undefined {
  return AUTHORS.find((author) => author.slug === slug);
}

export function authorPath(slug: string): string {
  return `/authors/${slug}`;
}
