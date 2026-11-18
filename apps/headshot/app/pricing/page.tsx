import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, CtaBand, FaqList, JsonLd, PlanCards, Prose, Section } from "../components/ui";
import { SAMPLE_PACK, PLANS } from "../lib/site";
import { buildMetadata, breadcrumbJsonLd, faqPageJsonLd, productJsonLd } from "../lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Pricing — $9 Sample Pack, 5 Headshots",
  description:
    "AI headshot pricing with no free tier: the $9 Sample Pack gives five headshots, one style, one free redo and a commercial licence. Larger packages are coming soon.",
  path: "/pricing",
  keywords: [
    "ai headshot pricing",
    "headshot cost",
    "ai headshot packages",
    "headshot generator price",
    "ai headshot sample pack",
  ],
});

const FAQ = [
  {
    q: "Can I try it without paying?",
    a: "No. Payment comes first: there is no complimentary tier and no sample render before checkout. The only package on sale today is the $9 Sample Pack: five headshots, one style, no watermark, commercial licence and one free redo. We charge from the first image because every generation costs GPU time and we do not fund unpaid runs with ads or by trading your photo data.",
  },
  {
    q: "Is this a subscription?",
    a: "No. Each package is a single one-time payment for one order. There is no recurring charge, no credit balance that expires and no auto-renewal. You can buy a second Sample Pack later if you want a different style, but nothing renews on its own.",
  },
  {
    q: "What exactly is included in a package?",
    a: "Today only the Sample Pack can be ordered: five headshots in one style with one backdrop, one free redo within 48 hours, a commercial licence for every delivered image, and 30 days of storage in your order so you can re-download. The 40, 60 and 100-image packages are listed for comparison and are not on sale yet.",
  },
  {
    q: "How does the per-image price break down?",
    a: "Sample Pack: $9 / 5 images = $1.80 per headshot, and that is the only package you can buy today. The larger tiers are listed for reference only — Starter: $35 / 40 = $0.88, Professional: $45 / 60 = $0.75, Executive: $75 / 100 = $0.75 — but they are coming soon and cannot be ordered yet.",
  },
  {
    q: "Do I pay again if I request a redo?",
    a: "No. Every paid order includes one free redo within 48 hours of delivery. A redo regenerates the set with adjusted style guidance; it does not create a new charge and does not consume your delivered files.",
  },
  {
    q: "What payment methods are accepted?",
    a: "Card payments are processed by our merchant of record, Waffo. You receive a receipt by email immediately. If the checkout provider is not connected yet in the build you are looking at, the order API answers 402 payment_required rather than creating an unpaid job — no job is ever generated for free.",
  },
  {
    q: "Can I upgrade to a bigger package later?",
    a: "Not today. Only the $9 Sample Pack is on sale; the 40, 60 and 100-image packages are coming soon and cannot be ordered yet. When they open, the pipeline and the style presets will be identical, so a later order will match the sample as long as you upload the same source photos and pick the same preset.",
  },
  {
    q: "What if the headshots do not look like me?",
    a: "Ask for the free redo first — most identity misses are fixed by a redo with a different preset and better source photos. If the redo still fails to produce a usable set, the refund policy applies within the stated window.",
  },
];

const COMPARISON = [
  { label: "Final headshots", values: ["5", "40", "60", "100"] },
  { label: "Styles included", values: ["1", "2 outfits", "4 outfits", "All presets"] },
  { label: "Backdrops", values: ["1", "2", "4", "All presets"] },
  { label: "Delivery resolution", values: ["1024px", "1024px", "Premium 1024px", "Enhanced 2048px"] },
  { label: "Free redo", values: ["1 within 48h", "1 within 48h", "1 within 48h", "1 within 48h"] },
  { label: "Commercial licence", values: ["Included", "Included", "Included", "Included"] },
  { label: "Delivery time", values: ["< 1 min", "~2 min", "~3 min", "~4 min"] },
  { label: "Price", values: ["$9", "$35", "$45", "$75"] },
  { label: "Per image", values: ["$1.80", "$0.88", "$0.75", "$0.75"] },
  { label: "Availability", values: ["Available now", "Coming soon", "Coming soon", "Coming soon"] },
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
        <p className="sans mx-auto mb-4 inline-flex rounded-full border border-orange-300 bg-orange-50 px-3 py-1 text-xs uppercase tracking-wide text-orange-800">
          Paid only · no unpaid generation · from $9
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
          Pricing — ${SAMPLE_PACK.price} Sample Pack is the only package on sale today
        </h1>
        <p className="sans mx-auto mt-4 max-w-3xl text-base leading-relaxed text-stone-700">
          One-time payments, no subscription. The ${SAMPLE_PACK.price} Sample Pack (5 headshots) is the entry point and
          the only package you can order right now; the 40, 60 and 100-image packages are coming soon and are shown
          for comparison only. Every paid order includes a commercial licence, one free redo within 48 hours and 30
          days of storage so you can download more than once.
        </p>
      </section>

      <Section>
        <PlanCards />
        <p className="sans mt-4 text-sm leading-relaxed text-stone-600">
          Only the ${SAMPLE_PACK.price} Sample Pack (${SAMPLE_PACK.images} headshots) can be ordered today — its button
          is the only live checkout on this page. The remaining package cards are marked{" "}
          <span className="font-semibold">Coming soon</span> and have no checkout; their prices are published for
          reference and will be confirmed when they open.
        </p>
      </Section>

      <Section
        eyebrow="Compare"
        title="Package comparison"
        intro={
          <p>
            The tiers share the same pipeline and style presets. Only the ${SAMPLE_PACK.price} Sample Pack is on sale
            today; the larger packages are listed for comparison and marked{" "}
            <span className="font-semibold">Coming soon</span>.
          </p>
        }
      >
        <div className="sans overflow-x-auto rounded-2xl border border-stone-300 bg-white/60">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-stone-100/80 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Feature
                </th>
                {PLANS.map((plan) => (
                  <th key={plan.id} scope="col" className="px-5 py-3 font-semibold">
                    {plan.name}
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
          record at checkout. Every image is part of a paid order — no unpaid generation.
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
              One redo per paid order, requested within 48 hours of delivery — the Sample Pack included. A redo
              regenerates the full set with adjusted style guidance and, if needed, a different preset. It is free and
              does not consume your delivered files.
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
            <h2 className="font-serif text-xl font-bold text-stone-900">No unpaid generation</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Orders are only queued after a completed payment. If the pipeline cannot produce a full set at all —
              provider outage, upload rejected, job error — the order is retried automatically and refunded if the retry
              fails.
            </p>
          </div>
        </div>
      </Section>

      <Section eyebrow="Details" title="How the packages are put together">
        <Prose>
          <p>
            Every package runs the same four-stage pipeline: a face quality gate on your uploads, identity-conditioned
            generation, a face-merge pass that pulls your original features back into the output, and a final
            background-and-crop normalisation so the set looks like one shoot. The tier changes how many final images
            you receive, how many outfits and backdrops are included, and the resolution of the delivered files — but
            only the Sample Pack is on sale today.
          </p>
          <h3>Why a paid sample instead of a giveaway</h3>
          <p>
            A giveaway is the usual growth play, but it has two costs we are not willing to pay: the GPU time for the
            free set has to be funded somehow, and free face-photo pipelines tend to monetise the upload. Charging $9 for
            five images keeps the incentives simple — you pay once, you get five clean files with a commercial licence,
            and if the likeness misses you get a redo rather than a sales pitch. It also makes the sample a real signal:
            the images you judge are produced by the same paid pipeline the larger packages will use.
          </p>
          <h3>Why fixed packages instead of a credit system</h3>
          <p>
            Credit systems are good for businesses that sell unpredictable usage; they are bad for a one-off purchase.
            Someone who needs a headshot for a new job does not want 120 credits with 40 used and 80 expiring in six
            months. Fixed packages keep the decision simple: sample it, then choose how many images you want to choose
            from when the larger tiers open.
          </p>
          <h3>What comes after the Sample Pack</h3>
          <p>
            The 40, 60 and 100-image packages are being prepared and are not open for orders yet. When they open, the
            difference will be volume and variety: more outfits and backdrops and a larger set to choose from. Forty
            images is planned for one good profile photo plus spares; sixty adds expressions and wardrobe variety;
            the 100-image package is for people who need both a formal and a warm variant across several channels — for
            example a founder with a LinkedIn profile, a company About page, a conference speaker card and a podcast
            page. None of these three can be bought today.
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
            <Link href="/team-headshots">team headshots</Link> flow, with a single style guide and one invoice. Volume
            pricing for large sets is being finalised together with the larger packages; the only self-serve package on
            sale today is the Sample Pack.
          </p>
        </Prose>
      </Section>

      <Section eyebrow="FAQ" title="Pricing questions">
        <FaqList items={FAQ} />
      </Section>

      <CtaBand
        href="/#generator"
        title="Start with the $9 Sample Pack"
        body="Five headshots, one style, no watermark, commercial licence and one free redo. It is the only package on sale today — the 40, 60 and 100-image packages are coming soon."
        cta="Start with the Sample Pack"
      />
    </main>
  );
}
