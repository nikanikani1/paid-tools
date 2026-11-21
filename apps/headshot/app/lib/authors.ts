import { CONTACT, CONTENT_UPDATED, SITE_NAME } from "./site";

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
 * One author entity: the small product team that actually builds and operates
 * the headshot pipeline. We deliberately do not invent a named individual, a
 * job history, credentials, awards, review counts or customer numbers.
 */
export const AUTHORS: Author[] = [
  {
    slug: "portraitlab-editorial",
    name: "PortraitLab Editorial Team",
    role: `The product team that builds and operates ${SITE_NAME}`,
    shortBio:
      "We build and run the AI headshot pipeline behind PortraitLab, and we write the pages that explain how it works, what it costs and where it fails.",
    bio: [
      "PortraitLab Editorial Team is the small group of people who build and operate this site. Our day-to-day work is the pipeline itself: running the face quality gate on uploaded selfies, calling the identity-conditioned generation model, merging the face back into each rendered frame, and delivering the files. That operational experience is the basis for everything published here — we are writing about the system we run, not summarising press releases.",
      "We are not a photography studio, an agency or a review site. We do not have a staff of portrait photographers or retouchers, and we do not claim to. What we can speak to is how identity-conditioned generation behaves, where it drifts, what a face-merge pass does to a set, and what a paid order actually costs to produce.",
      "Every content page carries this byline and a last-updated date, and corrections go to the editorial inbox. We do not publish invented testimonials, review scores, customer counts or benchmark numbers we have not measured; the illustrative images on the site are labelled as illustrative, and the cost figures in our pricing explanations are unit economics, not claims about volume.",
    ],
    covers: [
      { href: "/", label: "Professional headshots (main product page)" },
      { href: "/ai-headshot-generator", label: "AI headshot generator deep-dive" },
      { href: "/free-ai-headshot-generator", label: "Free vs paid headshot tools comparison" },
      { href: "/ai-professional-headshot", label: "AI professional headshot" },
      { href: "/linkedin-headshot", label: "LinkedIn headshot guidance" },
      { href: "/team-headshots", label: "Team headshots (preview — not available yet)" },
      { href: "/real-estate-agent-headshots", label: "Real estate agent headshots" },
      { href: "/doctor-headshots", label: "Doctor and clinic headshots" },
      { href: "/how-it-works", label: "How the pipeline works" },
      { href: "/pricing", label: "Pricing, redo and refund policy" },
    ],
    howWeWork: [
      "We describe the pipeline we operate and the model documentation we rely on (FLUX/PuLID and face-swap model cards, MediaPipe face detection), not benchmark numbers we did not measure.",
      "Every guide is dated and signed by this team; when we correct something, the page is updated and the change is noted in the log below.",
      "We do not publish reviews, ratings, customer counts or before/after examples we cannot prove. Illustration images are labelled illustrative; real sample sets are added only when we can show them.",
      "Where an alternative — a local studio, a phone selfie, another tool — is the better choice for a specific job, the page says so instead of pretending AI wins everywhere.",
      "No paid rankings and no sponsored placements: commercial relationships do not change the technical claims on a page.",
    ],
    updateLog: [
      {
        date: CONTENT_UPDATED,
        note: "Published About, Contact and this author page with a written editorial standard; added author bylines and last-updated dates across the site, plus studio/selfie vs AI comparison sections.",
      },
      {
        date: CONTENT_UPDATED,
        note: "Repositioned the homepage around the primary topic 'professional headshots' and added a dedicated /ai-headshot-generator page for the pipeline deep-dive.",
      },
      {
        date: CONTENT_UPDATED,
        note: "Moved to a paid-only model: the $9 Sample Pack replaced any complimentary preview; pricing, FAQ, JSON-LD and the Free vs paid comparison page were rewritten.",
      },
      {
        date: CONTENT_UPDATED,
        note: "Launched the first version of the site: product pages, pricing, how it works, privacy, terms and refund policy.",
      },
    ],
    contactEmail: CONTACT.editorial,
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
