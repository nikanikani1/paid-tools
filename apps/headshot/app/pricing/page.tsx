import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, CtaBand, FaqList, JsonLd, PlanCards, Prose, Section } from "../components/ui";
import { SAMPLE_PACK, PLANS } from "../lib/site";
import { buildMetadata, breadcrumbJsonLd, faqPageJsonLd, productJsonLd } from "../lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Pricing — $9 Sample Pack, then 40 for $35, 60 for $45, 100 for $75",
  description:
    "AI headshot pricing with no free tier: a $9 five-image Sample Pack, then $35 for 40 headshots, $45 for 60 and $75 for 100. One-time payment, commercial licence, one free redo.",
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
    q: "Do you have a free plan or a free trial?",
    a: "No. There is no free tier, no free preview and no free trial. The cheapest order is the $9 Sample Pack: five headshots, one style, no watermark, commercial licence and one free redo. We charge from the first image because every generation costs GPU time and we do not fund free runs with ads or by trading your photo data.",
  },
  {
    q: "Is this a subscription?",
    a: "No. Each package is a single one-time payment for one order. There is no recurring charge, no credit balance that expires and no auto-renewal. You can buy a second package later if you want a different style, but nothing renews on its own.",
  },
  {
    q: "What exactly is included in a package?",
    a: "The final images at the resolution listed for that tier, the style preset and backdrop options included, one free redo within 48 hours, a commercial licence for every delivered image, and 30 days of storage in your order so you can re-download. The Sample Pack is five images in one style with one backdrop.",
  },
  {
    q: "How does the per-image price break down?",
    a: "Sample Pack: $9 / 5 images = $1.80 per headshot. Starter: $35 / 40 = $0.88. Professional: $45 / 60 = $0.75. Executive: $75 / 100 = $0.75. The larger packages lower the per-image cost because the fixed part of an order — quality gate, identity pass, delivery — is shared across more images.",
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
    a: "Yes. Start with the $9 Sample Pack, then buy whichever package size you need. The pipeline and the style presets are identical, so a later order will match the sample as long as you upload the same source photos and pick the same preset.",
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
          No free tier · no free trial · paid from $9
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
          Pricing — ${SAMPLE_PACK.price} Sample Pack, then $35 / $45 / $75
        </h1>
        <p className="sans mx-auto mt-4 max-w-3xl text-base leading-relaxed text-stone-700">
          One-time payments, no subscription. The $9 Sample Pack (5 headshots) is the entry point; 40, 60 and 100-image
          packages follow at a lower cost per image. Every paid order includes a commercial licence, one free redo
          within 48 hours and 30 days of storage so you can download more than once.
        </p>
      </section>

      <Section>
        <PlanCards />
      </Section>

      <Section
        eyebrow="Compare"
        title="Package comparison"
        intro={
          <p>
            Same pipeline and the same style presets in all four tiers. The difference is volume, how many outfits and
            backdrops are included, and the resolution of the delivered files.
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
          record at checkout. There is no free tier and no free preview image.
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
            background-and-crop normalisation so the set looks like one shoot. The tier you buy changes how many final
            images you receive, how many outfits and backdrops are included, and the resolution of the delivered files.
          </p>
          <h3>Why a paid sample instead of a free trial</h3>
          <p>
            A free trial is the usual growth play, but it has two costs we are not willing to pay: the GPU time for the
            free set has to be funded somehow, and free face-photo pipelines tend to monetise the upload. Charging $9 for
            five images keeps the incentives simple — you pay once, you get five clean files with a commercial licence,
            and if the likeness misses you get a redo rather than a sales pitch. It also makes the sample a real signal:
            the images you judge are produced by the same pipeline as the 100-image set.
          </p>
          <h3>Why fixed packages instead of a credit system</h3>
          <p>
            Credit systems are good for businesses that sell unpredictable usage; they are bad for a one-off purchase.
            Someone who needs a headshot for a new job does not want 120 credits with 40 used and 80 expiring in six
            months. Four fixed packages keep the decision simple: sample it, then choose how many images you want to
            choose from.
          </p>
          <h3>Which package most people buy</h3>
          <p>
            The $9 Sample Pack is the entry point, and the 60-image package is the most common upgrade. Forty images is
            usually enough for one good profile photo and a couple of spares; sixty gives you enough expressions and
            wardrobe variety to rotate a profile photo seasonally, and it is the tier where outfit and backdrop options
            open up to four each. The 100-image package is for people who need both a formal and a warm variant for
            multiple channels — for example a founder who has a LinkedIn profile, a company About page, a conference
            speaker card and a podcast page.
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

      <CtaBand
        href="/#generator"
        title="Start with the $9 Sample Pack"
        body="Five headshots, one style, no watermark, commercial licence and one free redo. Then scale to 40, 60 or 100 images if the sample works."
        cta="Start with the Sample Pack"
      />
    </main>
  );
}
