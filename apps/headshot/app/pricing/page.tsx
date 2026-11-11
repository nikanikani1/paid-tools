import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, CtaBand, FaqList, JsonLd, PlanCards, Prose, Section } from "../components/ui";
import { buildMetadata, breadcrumbJsonLd, faqPageJsonLd, productJsonLd } from "../lib/seo";
import { PLANS } from "../lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Pricing — AI Headshots from $35, One-Time Payment",
  description:
    "40 headshots for $35, 60 for $45, 100 for $75. One-time payment, no subscription. Compare packages, redo policy and refund terms for AI headshots.",
  path: "/pricing",
  keywords: ["ai headshot pricing", "headshot cost", "ai headshot packages", "headshot generator price"],
});

const FAQ = [
  {
    q: "Is this a subscription?",
    a: "No. Each package is a single one-time payment for one order of 40, 60 or 100 headshots. There is no recurring charge, no credit balance that expires and no auto-renewal. You can buy a second package later if you want a different style, but nothing renews on its own.",
  },
  {
    q: "What exactly is included in a package?",
    a: "The final images at 1024px, the outfits and backdrops listed for that tier, one free redo within 48 hours, a commercial licence for every delivered image, and 30 days of storage in your order so you can re-download. The 60 and 100 image tiers add premium and enhanced resolution processing.",
  },
  {
    q: "How is the per-image price calculated?",
    a: "Divide the package price by the number of images: $0.88 per headshot at the 40-image tier, $0.75 at 60 images and $0.75 at 100 images. The 100-image tier is the same per-image rate as 60 but adds enhanced resolution and priority delivery.",
  },
  {
    q: "Do I pay again if I request a redo?",
    a: "No. Every order includes one free redo within 48 hours of delivery. A redo regenerates the set with adjusted style guidance; it does not create a new charge and does not consume your delivered files.",
  },
  {
    q: "What payment methods are accepted?",
    a: "Card payments are processed by our merchant of record, Waffo. You receive a receipt by email immediately. For team orders of ten or more people we also support invoicing with net-30 terms — see the team headshots page.",
  },
  {
    q: "Can I upgrade to a bigger package later?",
    a: "Yes. Buy the larger package whenever you need it; the pipeline and the style presets are identical, so the second order will match the first as long as you upload the same source photos and pick the same preset.",
  },
  {
    q: "What if the headshots do not look like me?",
    a: "Ask for the free redo first — most identity misses are fixed by a redo with a different preset and better source photos. If the redo still fails to produce a usable set, the refund policy applies within the stated window.",
  },
];

const COMPARISON = [
  { label: "Final headshots", values: ["40", "60", "100"] },
  { label: "Outfits", values: ["2", "4", "All presets"] },
  { label: "Backdrops", values: ["2", "4", "All presets"] },
  { label: "Delivery resolution", values: ["1024px", "Premium 1024px", "Enhanced 2048px"] },
  { label: "Free redo", values: ["1 within 48h", "1 within 48h", "1 within 48h"] },
  { label: "Commercial licence", values: ["Included", "Included", "Included"] },
  { label: "Delivery time", values: ["~2 min", "~3 min", "~4 min"] },
  { label: "Price", values: ["$35", "$45", "$75"] },
  { label: "Per image", values: ["$0.88", "$0.75", "$0.75"] },
];

export default function PricingPage() {
  return (
    <main>
      <JsonLd data={productJsonLd({ path: "/pricing" })} />
      <JsonLd data={faqPageJsonLd(FAQ)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" },
        ]}
      />

      <section className="mx-auto max-w-6xl px-6 pb-8 pt-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Pricing — $35 for 40, $45 for 60, $75 for 100</h1>
        <p className="sans mx-auto mt-4 max-w-2xl text-base leading-relaxed text-stone-700">
          One-time payment, no subscription. Every package includes a commercial licence, one free redo within 48 hours
          and 30 days of storage so you can download more than once.
        </p>
      </section>

      <Section>
        <PlanCards />
      </Section>

      <Section
        eyebrow="Compare"
        title="Package comparison"
        intro={<p>Same pipeline and the same style presets in all three tiers. The difference is volume and resolution.</p>}
      >
        <div className="sans overflow-x-auto rounded-2xl border border-stone-300 bg-white/60">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-stone-100/80 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Feature
                </th>
                {PLANS.map((plan) => (
                  <th key={plan.id} scope="col" className="px-5 py-3 font-semibold">
                    {plan.name} {plan.popular && <span className="text-orange-700">· popular</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {COMPARISON.map((row) => (
                <tr key={row.label}>
                  <th scope="row" className="px-5 py-3 font-medium text-stone-800">
                    {row.label}
                  </th>
                  {row.values.map((value, index) => (
                    <td key={`${row.label}-${index}`} className="px-5 py-3 text-stone-600">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="sans mt-3 text-xs text-stone-500">
          Prices in US dollars. Taxes may apply depending on your billing country and are collected by the merchant of
          record at checkout.
        </p>
      </Section>

      <Section
        eyebrow="Policy"
        title="Redo, refund and what happens if it misses"
        intro={
          <p>
            Two policies cover almost every bad outcome: a free redo and a written refund window. Both are linked from
            every page so you can read them before paying.
          </p>
        }
      >
        <div className="sans grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-stone-300 bg-white/70 p-6">
            <h2 className="font-serif text-xl font-bold text-stone-900">Free redo — 48 hours</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              One redo per order, requested within 48 hours of delivery. A redo regenerates the full set with adjusted
              style guidance and, if needed, a different preset. It is free and does not consume your delivered files.
            </p>
          </div>
          <div className="rounded-2xl border border-stone-300 bg-white/70 p-6">
            <h2 className="font-serif text-xl font-bold text-stone-900">Refund — see the policy</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              If a redo still does not produce a usable set, the refund window and conditions on the{" "}
              <Link href="/refund" className="text-orange-700 underline underline-offset-2">
                refund page
              </Link>{" "}
              apply. Files delivered and accepted are not refundable simply because you ordered a second package.
            </p>
          </div>
          <div className="rounded-2xl border border-stone-300 bg-white/70 p-6">
            <h2 className="font-serif text-xl font-bold text-stone-900">Failed generation — automatic</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              If the pipeline cannot produce a full set at all — provider outage, upload rejected, job error — the order
              is retried automatically, and refunded if the retry fails. You are not charged for machine failures.
            </p>
          </div>
        </div>
      </Section>

      <Section eyebrow="Details" title="How the packages are put together">
        <Prose>
          <p>
            Every package runs the same four-stage pipeline: a face quality gate on your uploads, identity-conditioned
            generation, a face-merge pass that pulls your original features back into the output, and a final
            background-and-crop normalisation so the set looks like one shoot. The tier you buy changes how many final
            images you receive and, at the top tier, the resolution of the delivered files.
          </p>
          <h3>Why three tiers instead of a credit system</h3>
          <p>
            Credit systems are good for businesses that sell unpredictable usage; they are bad for a one-off purchase.
            Someone who needs a single headshot for a new job does not want 120 credits with 40 used and 80 expiring in
            six months. Three fixed packages keep the decision simple: how many images do you want to choose from, and
            do you want the enhanced resolution tier.
          </p>
          <h3>Which package most people buy</h3>
          <p>
            The 60-image package is the most common choice. Forty images is usually enough for one good profile photo
            and a couple of spares; sixty gives you enough expressions and wardrobe variety to rotate a profile photo
            seasonally, and it is the tier where outfit and backdrop options open up to four each. The 100-image
            package is for people who need both a formal and a warm variant for multiple channels — for example a
            founder who has a LinkedIn profile, a company About page, a conference speaker card and a podcast page.
          </p>
          <h3>What the commercial licence covers</h3>
          <p>
            Every delivered image can be used commercially: your own website, social profiles, brochures, printed ads,
            articles, speaker decks, book covers and recruitment material. The licence does not permit reselling the
            images as stock photography, training a competing model on them, or using them to imply an endorsement you
            do not have.
          </p>
          <h3>Team and volume pricing</h3>
          <p>
            Orders of ten or more people are handled through the{" "}
            <Link href="/team-headshots">team headshots</Link> flow, with a single style guide, one invoice and volume
            pricing below the per-person list price. If you need more than 100 images for one person, buy two packages
            — the pipeline is identical, so the sets will match.
          </p>
        </Prose>
      </Section>

      <Section eyebrow="FAQ" title="Pricing questions">
        <FaqList items={FAQ} />
      </Section>

      <CtaBand href="/#generator" title="Pick a package and start" cta="Generate my headshots" />
    </main>
  );
}
