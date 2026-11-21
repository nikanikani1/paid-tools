import type { Metadata } from "next";
import Link from "next/link";
import { AuthorByline } from "../components/editorial";
import { Breadcrumbs, FaqList, JsonLd, Prose, RelatedLinks, Section } from "../components/ui";
import { PRIMARY_AUTHOR, authorPath } from "../lib/authors";
import { CONTACT, CONTENT_UPDATED, SITE_NAME, SITE_URL } from "../lib/site";
import { breadcrumbJsonLd, buildMetadata, canonicalFor, faqPageJsonLd } from "../lib/seo";

/**
 * Product-truth page (task-33).
 *
 * The team workflow described on the original page (10-person minimum, seat
 * pricing, company invoicing, bulk delivery) is NOT implemented. The page stays
 * reachable for people who have the link, but it is noindex, states plainly that
 * team plans do not exist yet, and carries no purchase or enquiry CTA.
 */
export const metadata: Metadata = {
  ...buildMetadata({
    title: "Team Headshots — Planned Feature, Not Available Yet",
    description:
      "AI team headshots are not available yet. This page is a preview of a planned workflow only — no team pricing, invoicing or team orders exist today. Individual packs are on sale.",
    path: "/team-headshots",
    keywords: ["team headshots", "corporate team headshots", "company headshots"],
  }),
  // Unimplemented product: keep the page out of the index until the team flow ships.
  robots: { index: false, follow: false, nocache: true },
};

const FAQ = [
  {
    q: "Can I order team headshots right now?",
    a: "No. There is no team order flow, no team intake and no team checkout. The only product on sale is the individual $9 Sample Pack (5 headshots) and the individual packages listed on the pricing page.",
  },
  {
    q: "Is there a 10-person minimum, seat pricing or company invoicing?",
    a: "No. Team plans are not finalised and nothing has been published or implemented. An earlier version of this page showed seat prices, invoice terms and seat image counts — that described a planned workflow, not a product you can buy.",
  },
  {
    q: "Can I send you our team's photos to hold for later?",
    a: "Please don't. We cannot process or store a team batch, and we do not want you to upload colleagues' photos for a workflow that does not exist yet.",
  },
  {
    q: "Can each person on my team use the individual product?",
    a: "Yes, one person at a time. Each person orders their own pack from the pricing page, uploads their own selfies and downloads their own set. That is a per-person product: there is no shared style guide, shared billing or admin view across seats.",
  },
  {
    q: "How will I know when team headshots launch?",
    a: "This page will be rewritten at launch and removed from the noindex state. We are not collecting team enquiries or waitlist emails yet, so there is no form to submit today.",
  },
  {
    q: "Who maintains this page?",
    a: `The ${PRIMARY_AUTHOR.name}. Corrections and product questions can go to ${CONTACT.editorial}, but we cannot take team orders by email.`,
  },
];

export default function TeamHeadshotsPage() {
  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Team Headshots — Planned Feature, Not Available Yet",
          url: canonicalFor("/team-headshots"),
          inLanguage: "en-US",
          dateModified: CONTENT_UPDATED,
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
        }}
      />
      <JsonLd data={faqPageJsonLd(FAQ)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Team headshots", path: "/team-headshots" },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Team headshots", path: "/team-headshots" },
        ]}
      />

      <section className="mx-auto max-w-6xl px-6 pb-4 pt-8">
        <div className="sans rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-950">
          <p className="font-semibold">Team plans are not available yet — this page is a preview.</p>
          <p className="mt-1">
            There is no team checkout, no team intake and no team pricing. Please do not send us a team batch or upload
            colleagues&apos; photos. If you need one headshot set for yourself, the individual{" "}
            <Link href="/pricing" className="underline underline-offset-2">
              $9 Sample Pack
            </Link>{" "}
            is the only product on sale today.
          </p>
        </div>

        <p className="sans mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
          Preview · not sold yet
        </p>
        <h1 className="mt-2 max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
          AI Team Headshots — Planned, Not Available Yet
        </h1>
        <div className="sans mt-4 max-w-3xl space-y-4 text-base leading-relaxed text-stone-700">
          <p>
            PortraitLab currently sells individual headshot packs only. A team workflow — one style guide across
            several people, company billing and a bulk delivery flow — is something we may build, but it does not exist
            today. This page exists so that anyone who finds a link to it gets the accurate answer instead of a sales
            page for a product that cannot be delivered.
          </p>
        </div>
        <AuthorByline />
      </section>

      <Section
        eyebrow="Status"
        title="What is not available yet"
        intro={
          <p>
            Every item below appeared in an earlier draft of this page as if it were a live product. None of it is
            implemented.
          </p>
        }
      >
        <Prose>
          <ul>
            <li>
              <strong>No team order flow.</strong> There is no way to buy for several people, no seat count and no
              ten-person minimum to meet — the checkout only sells individual packs.
            </li>
            <li>
              <strong>No seat pricing.</strong> No volume tiers or seat prices have been published or implemented.
            </li>
            <li>
              <strong>No company invoicing.</strong> Invoice terms, purchase-order references and tax-ID billing for teams
              do not exist. Individual orders pay by card at checkout.
            </li>
            <li>
              <strong>No shared style guide across seats, no admin view, no bulk delivery.</strong> The individual
              product produces one person&apos;s set from that person&apos;s own selfies.
            </li>
            <li>
              <strong>No turnaround commitment for teams.</strong> The individual pipeline reports progress per order;
              there is no team queue or team SLA.
            </li>
          </ul>
          <p>
            If you were given a price list or a turnaround promise for team headshots, it did not come from a
            working product. Please do not pay anyone for a team order on our behalf.
          </p>
        </Prose>
      </Section>

      <Section
        eyebrow="Today"
        title="What you can actually do"
        intro={<p>Individual packs are live and unchanged. They are not a team product.</p>}
      >
        <Prose>
          <ul>
            <li>
              <Link href="/pricing">The $9 Sample Pack</Link> — 5 headshots for one person, one style, no watermark,
              one free redo.
            </li>
            <li>
              <Link href="/how-it-works">How the pipeline works</Link> — the quality gate, identity pass and
              face-merge stage, so you can judge whether it suits your photos.
            </li>
            <li>
              <Link href="/ai-headshot-generator">The generator deep-dive</Link> — what the model does and where it
              falls short.
            </li>
            <li>
              Each colleague who wants a headshot orders individually with their own photos. There is no shared
              billing, shared style state or admin console connecting those orders.
            </li>
          </ul>
        </Prose>
      </Section>

      <Section
        eyebrow="Planning"
        title="What a team flow would need (no commitment, no date, no price)"
        intro={
          <p>
            This describes open design questions, not a roadmap promise. Nothing below has been built, scheduled or
            priced.
          </p>
        }
      >
        <Prose>
          <ul>
            <li>Consent and intake: collecting photos from several people without holding them longer than needed.</li>
            <li>Identity quality for each seat: every person needs their own quality gate, not one shared prompt.</li>
            <li>Consistency without faking it: a shared backdrop and crop is a rendering parameter, not just a style note.</li>
            <li>Company billing: invoicing, PO references and tax handling are separate from the AI pipeline.</li>
            <li>Delivery: per-person download links, admin visibility and deletion schedules.</li>
          </ul>
          <p>
            If this ships, this page will change and the noindex tag will be removed. Until then, treat team headshots
            as unavailable.
          </p>
        </Prose>
      </Section>

      <Section eyebrow="FAQ" title="Team headshots questions">
        <FaqList items={FAQ} />
      </Section>

      <RelatedLinks
        title="Available pages"
        links={[
          { href: "/pricing", label: "Pricing", body: "$9 Sample Pack — the only product on sale right now." },
          { href: "/how-it-works", label: "How it works", body: "Quality gate, identity pass and delivery for individual packs." },
          { href: "/ai-headshot-generator", label: "AI headshot generator", body: "The pipeline behind the individual product." },
          {
            href: authorPath(PRIMARY_AUTHOR.slug),
            label: "Editorial team",
            body: "Who maintains this page and how corrections are handled.",
          },
        ]}
      />
    </main>
  );
}
