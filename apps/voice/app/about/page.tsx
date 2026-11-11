import Link from "next/link";
import { AuthorByline } from "@/components/AuthorByline";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentSections, type Section } from "@/components/ContentSections";
import { JsonLd } from "@/components/JsonLd";
import { PRIMARY_AUTHOR, authorPath } from "@/lib/authors";
import {
  absoluteUrl,
  breadcrumbSchema,
  CONTENT_UPDATED,
  graphSchema,
  pageMetadata,
  SITE_NAME,
  SITE_URL,
  SUPPORT_EMAIL,
  type FaqItem,
} from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About StemSplit.ai — Who Builds This Vocal Remover",
  description:
    "Who is behind StemSplit.ai, why the tool is paid-only, how we evaluate quality, where our information comes from, and what we deliberately do not claim.",
  path: "/about",
});

const SOURCES = [
  {
    label: "Demucs (Meta AI) — model paper and reference implementation",
    href: "https://github.com/facebookresearch/demucs",
    note: "The htdemucs separation model this service runs; MIT-licensed.",
  },
  {
    label: "Replicate — cjwbw/demucs",
    href: "https://replicate.com/cjwbw/demucs",
    note: "The hosted model endpoint used for inference.",
  },
  {
    label: "Audacity manual",
    href: "https://manual.audacityteam.org/",
    note: "The documented center-channel removal workflow we describe in the built-in-method sections.",
  },
  {
    label: "Apple GarageBand and Logic Pro",
    href: "https://www.apple.com/logic-pro/",
    note: "Checked for phase-invert and EQ behaviour; GarageBand has no built-in phase invert.",
  },
  {
    label: "REAPER",
    href: "https://www.reaper.fm/",
    note: "Item polarity control used for manual center cancellation.",
  },
];

const FAQS: FaqItem[] = [
  {
    q: "Is StemSplit a big company?",
    a: "No. StemSplit.ai is built and operated by a small independent product team. We do not publish team-size, funding or customer figures because there are no numbers worth turning into marketing. The team that runs the pipeline is the team that writes these guides.",
  },
  {
    q: "Do you publish reviews or customer testimonials?",
    a: "No. We do not publish reviews, star ratings, customer counts or testimonials, and we do not invent before/after audio. Sample outputs are illustrative; real A/B samples will be added after launch once we can publish audio we have the rights to share.",
  },
  {
    q: "How can I report an error in a guide?",
    a: "Email editorial@stemsplit.ai with the page URL and what is wrong. We correct verified mistakes, update the last-updated date and note material changes in the author update log.",
  },
  {
    q: "Who owns the content on this site?",
    a: "The written guides and the site itself belong to StemSplit.ai. The open-source model and the tools we reference stay under their own licenses. You keep the rights to the audio you upload.",
  },
];

const SECTIONS: Section[] = [
  {
    h2: "Who is behind StemSplit.ai",
    paragraphs: [
      "StemSplit.ai is built and operated by a small, independent product team. Our work is the separation pipeline itself: validating uploaded audio, running the htdemucs model on cloud GPUs, storing results in short-lived object storage and delivering the download links. There is no agency, no parent company and no investor crowd to announce — just the people who build and run the product.",
      "That matters for how you should read this site. We are not a review publication, a music magazine or a talent agency, and we do not pretend to be. We are the team that operates a stem-separation service, documenting how the technology works, what the built-in alternatives do, and where both approaches stop.",
      "The author profile for these pages is the StemSplit Audio Team. Every guide carries that byline and a last-updated date, and corrections go to the editorial inbox listed on the contact page.",
    ],
    bullets: [
      "We build and operate the AI separation pipeline described on this site.",
      "We write the technical guides ourselves — no ghostwritten review farm.",
      "We do not invent company history, funding, headcount or client lists.",
    ],
  },
  {
    h2: "Why the product is paid-only",
    paragraphs: [
      "Separating a song is GPU work. A three-minute track occupies a cloud GPU for roughly a minute, and that cost does not disappear because a landing page calls something 'free'. Services that do not charge for it usually pay for it with advertising, data collection, quality caps or a queue designed to push you toward a subscription.",
      "We chose a different trade-off: no advertising, no data resale, and a small paid first step instead of a giveaway. The one-time $2.90 Trial Pack includes 15 minutes and the full 4-stem output, and it does not renew. If you process more than that, monthly plans are available; if you do not, the trial is the whole purchase.",
      "This is also why the site no longer advertises a complimentary preview. We would rather be upfront about the price than lure people in with an allowance that disappears after launch.",
    ],
  },
  {
    h2: "How we evaluate quality — and what we do not claim",
    paragraphs: [
      "We run the same pre-trained htdemucs model for every customer. We did not train it from scratch, and we do not have a research lab publishing benchmark charts. Our quality claims are limited to what the model is documented to do and what we can see in the pipeline: clean separation on studio mixes, weaker results on mono masters, dense distorted mixes and live recordings.",
      "We do not claim a number of songs tested, a quality score, an accuracy percentage, a customer count or a review average. We do not show before/after audio yet. Sample outputs are illustrative; real A/B samples will be added after launch, using audio we own or that is explicitly licensed for reuse.",
      "Where a page describes a limitation — vocal bleed, cymbal artifacts, missing low end after center cancellation — that comes from the documented behaviour of the method, not from a marketing test we invented. When we are wrong, tell us and we will correct it.",
    ],
    bullets: [
      "Same pre-trained model for everyone; no per-user training.",
      "No invented benchmarks, review scores or customer numbers.",
      "Sample outputs are illustrative; real A/B samples will be added after launch.",
      "Corrections are dated in the author update log.",
    ],
  },
  {
    h2: "Where our information comes from",
    paragraphs: [
      "Our explanations of the AI model are based on the public Demucs work from Meta AI and the model page we actually call. Our descriptions of built-in Windows, macOS, phone and DAW methods are checked against the official documentation of those tools, not against forum folklore.",
      "The sources we rely on are linked below. If a source changes and one of our steps becomes outdated, the page is wrong and should be corrected — use the contact page to tell us.",
    ],
    bullets: SOURCES.map((source) => `${source.label} — ${source.note}`),
  },
  {
    h2: "Model, data and privacy stance",
    paragraphs: [
      "The separation model is htdemucs, part of the Demucs family developed by Meta AI and released under the MIT license. We do not train on your uploads, we do not share your audio with other users, and working files are deleted automatically within 24–48 hours. The privacy policy documents the full data flow, the processors involved and how to request early deletion.",
      "Payments are handled by Waffo as merchant of record, which means card details never touch our servers. We do not run advertising trackers or sell data. If that changes, the privacy policy will change first — not just the footer.",
    ],
    bullets: [
      "Pre-trained model; no training on customer audio.",
      "Uploads and outputs deleted within 24–48 hours.",
      "Card details handled by Waffo, not stored by us.",
      "No ad trackers and no data resale.",
    ],
  },
  {
    h2: "Editorial standards",
    paragraphs: [
      "Every guide on this site has a named author entity, a last-updated date and a link back to this page. Technical claims must be traceable to the model we run or to official documentation. We do not accept payment for rankings, and no commercial relationship changes what a page says about a limitation.",
      "Material changes to a guide are recorded in the author update log. Minor fixes — a typo, a dead link, a clarified sentence — are made in place and reflected in the last-updated date. If you find a factual error, email editorial@stemsplit.ai; that inbox is read by the people who write the pages.",
    ],
  },
];

export default function AboutPage() {
  const schema = graphSchema(
    {
      "@type": "AboutPage",
      "@id": `${absoluteUrl("/about")}#about`,
      name: "About StemSplit.ai",
      url: absoluteUrl("/about"),
      description:
        "Who builds StemSplit.ai, why the tool is paid-only, how quality is evaluated and what the team deliberately does not claim.",
      inLanguage: "en",
      dateModified: CONTENT_UPDATED,
      mainEntity: {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        email: SUPPORT_EMAIL,
        founder: {
          "@type": "Organization",
          name: PRIMARY_AUTHOR.name,
          url: absoluteUrl(authorPath(PRIMARY_AUTHOR.slug)),
        },
      },
    },
    {
      "@type": "Person",
      "@id": `${absoluteUrl(authorPath(PRIMARY_AUTHOR.slug))}#author`,
      name: PRIMARY_AUTHOR.name,
      jobTitle: PRIMARY_AUTHOR.role,
      description: PRIMARY_AUTHOR.shortBio,
      url: absoluteUrl(authorPath(PRIMARY_AUTHOR.slug)),
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
    ]),
  );

  return (
    <>
      <JsonLd data={schema} />
      <div className="mx-auto max-w-6xl px-6">
        <div className="pt-6">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
        </div>

        <header className="py-10 md:py-14">
          <div className="max-w-3xl">
            <div className="badge">Trust &amp; editorial standards</div>
            <h1 className="display mt-5 text-4xl md:text-5xl">About StemSplit.ai — Who Builds This Vocal Remover</h1>
            <AuthorByline align="left" />
            <p className="mt-5 leading-relaxed text-slate-300">
              StemSplit.ai is a small independent product team building an AI vocal remover and 4-stem separator. This
              page explains who writes the content, why the product is paid-only, how we evaluate quality, where our
              information comes from and what we deliberately do not claim.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/pricing#trial" className="btn btn-primary">
                Start with the $2.90 trial
              </Link>
              <Link href="/contact" className="btn btn-ghost">
                Contact the team
              </Link>
            </div>
          </div>
        </header>

        <ContentSections sections={SECTIONS} />

        <section className="hairline py-14">
          <div className="mx-auto max-w-3xl">
            <h2 className="display text-3xl md:text-4xl">Sources we cite</h2>
            <ul className="mt-5 space-y-3">
              {SOURCES.map((source) => (
                <li key={source.href} className="card p-4">
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
                  >
                    {source.label}
                  </a>
                  <p className="mt-1 text-sm text-slate-400">{source.note}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="hairline py-14">
          <div className="mx-auto max-w-3xl">
            <h2 className="display text-3xl md:text-4xl">About questions</h2>
            <div className="mt-6 grid gap-3">
              {FAQS.map((item) => (
                <details key={item.q} className="faq card px-5 py-4">
                  <summary className="flex items-center justify-between gap-4">
                    <span className="text-base font-semibold text-slate-100">{item.q}</span>
                    <span aria-hidden="true" className="faq-icon">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.a}</p>
                </details>
              ))}
            </div>
            <p className="mt-6 text-sm text-slate-400">
              Read the full{" "}
              <Link href={authorPath(PRIMARY_AUTHOR.slug)} className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                author profile
              </Link>{" "}
              and update log, or the{" "}
              <Link href="/privacy" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                privacy policy
              </Link>{" "}
              for data handling. For corrections:{" "}
              <a href="mailto:editorial@stemsplit.ai" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                editorial@stemsplit.ai
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
