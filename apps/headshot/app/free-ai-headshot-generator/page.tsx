import type { Metadata } from "next";
import Link from "next/link";
import {
  Breadcrumbs,
  CtaBand,
  FaqList,
  JsonLd,
  KeyFacts,
  Prose,
  RelatedLinks,
  Section,
} from "../components/ui";
import { EditorialByline, StudioComparisonSection } from "../components/editorial";
import { SAMPLE_PACK } from "../lib/site";
import { breadcrumbJsonLd, buildMetadata, faqPageJsonLd, productJsonLd } from "../lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Free AI Headshot Generator — What Free Tools Really Give You",
  description:
    "Searching for a free AI headshot generator? Here is an honest comparison of what free tools deliver (watermarks, low resolution, data trade-offs) and why our cheapest option is a one-time $9 Sample Pack with 5 real headshots.",
  path: "/free-ai-headshot-generator",
  keywords: [
    "free ai headshot generator",
    "free headshot generator",
    "ai headshot pricing",
    "free headshot maker",
  ],
});

const FAQ = [
  {
    q: "Do you offer a free AI headshot generator?",
    a: "No. PortraitLab is paid-only: every set is generated after payment, with no complimentary tier and no sample render before checkout. Our cheapest option is the one-time $9 Sample Pack, which delivers five real headshots with no watermark, a commercial licence and one free redo. We charge from the first image because generation costs real GPU time and because we are not willing to fund it with ads or by trading your photos.",
  },
  {
    q: "Why not just use one of the free tools in this comparison?",
    a: "Sometimes that is the right call — for a throwaway avatar or a joke photo, a watermarked free render is fine. The trade-offs show up when you need the image for work: free tiers usually watermark the output, cap resolution, give you one image with no retry, offer no commercial licence, and may reserve rights over what you upload. Read the terms before you upload your face.",
  },
  {
    q: "Is $9 really worth it compared with free?",
    a: "The $9 Sample Pack gets you five headshots in one style, at 1024px, with no watermark, a commercial licence and a free redo if the likeness misses. Compare that with a photographer, a studio booking or a full package — the sample exists so you can judge the quality on your own face at the smallest possible spend, not so that we can give away a set.",
  },
  {
    q: "What exactly does the $9 Sample Pack include?",
    a: "Five headshots, one style preset, one backdrop, 1024px JPG, no watermark, commercial licence for every delivered image, and one free redo within 48 hours of delivery. It runs the same quality gate, identity pass and face-merge stage as the 40/60/100 packages.",
  },
  {
    q: "What happens to the selfies I upload for a paid order?",
    a: "They are used only to render that order, never for model training, and deleted from storage after 30 days. You can request earlier deletion from your order email. This is the same whether you buy the $9 sample or the 100-image package.",
  },
  {
    q: "Can I get a refund if the $9 sample does not look like me?",
    a: "Yes — the sample is a paid order and carries the same redo and refund policy as the larger packages: one free redo within 48 hours, and the published refund window if the redo still fails. See the refund page for the exact conditions.",
  },
];

const COMPARISON = [
  {
    feature: "Price",
    free: "Free (with conditions)",
    ours: "$9 one-time",
  },
  {
    feature: "Images delivered",
    free: "Typically 1 low-resolution render",
    ours: "5 headshots at 1024px",
  },
  {
    feature: "Watermark",
    free: "Usually watermarked; removal is a paid upsell",
    ours: "Never watermarked",
  },
  {
    feature: "Commercial licence",
    free: "Rarely included",
    ours: "Included for every delivered image",
  },
  {
    feature: "Retry if the likeness misses",
    free: "Usually one attempt, then a paywall",
    ours: "One free redo within 48 hours",
  },
  {
    feature: "What happens to your photos",
    free: "Often used to improve the service or train models",
    ours: "Used only for your order, deleted after 30 days",
  },
  {
    feature: "Queue / priority",
    free: "Best-effort queue, sometimes minutes of waiting",
    ours: "Paid queue: under a minute for the sample",
  },
];

export default function FreeAiHeadshotGeneratorPage() {
  return (
    <main>
      <JsonLd
        data={productJsonLd({
          name: "PortraitLab $9 Sample Pack",
          description:
            "Five real AI headshots for $9, one-time payment: no watermark, commercial licence and one free redo. Every order is paid before generation runs.",
          path: "/free-ai-headshot-generator",
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQ)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Free AI headshot generator", path: "/free-ai-headshot-generator" },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Free AI headshot generator", path: "/free-ai-headshot-generator" },
        ]}
      />

      <section className="mx-auto max-w-6xl px-6 pb-8 pt-8">
        <p className="sans mb-4 inline-flex rounded-full border border-orange-300 bg-orange-50 px-3 py-1 text-xs uppercase tracking-wide text-orange-800">
          Comparison page · no free tier here
        </p>
        <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
          Free AI Headshot Generator — What Free Tools Really Give You
        </h1>
        <div className="sans mt-5 grid gap-6 text-base leading-relaxed text-stone-700 md:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <p>
              This page ranks for the phrase <strong>free AI headshot generator</strong>, so let us be direct about
              what you will and will not find here: we do not offer an unpaid generator, an unpaid sample render or a
              complimentary tier. PortraitLab is a paid product. The cheapest way to put your own face through the
              pipeline is the one-time {SAMPLE_PACK.price} dollar Sample Pack, which returns {SAMPLE_PACK.images}{" "}
              headshots.
            </p>
            <p>
              If that sounds like a worse deal than free, this page is for you. Below is an honest comparison: what the
              free tools actually deliver in 2026, why “free” usually has a price attached somewhere else, and the
              smallest paid purchase that gets you an image you can actually publish.
            </p>
          </div>
          <div>
            <KeyFacts
              facts={[
                { label: "Free tier", value: "None" },
                { label: "Preview image", value: "Not offered" },
                { label: "Cheapest option", value: `$${SAMPLE_PACK.price} Sample Pack` },
                { label: "What you get", value: `${SAMPLE_PACK.images} headshots, no watermark` },
              ]}
            />
            <Link
              href="/pricing"
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-orange-700 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-600"
            >
              See the $9 Sample Pack
            </Link>
          </div>
        </div>
      </section>

      <Section
        eyebrow="The free tier"
        title="What a free AI headshot generator usually gives you"
        intro={
          <p>
            Free tiers are not scams — they are acquisition funnels. Knowing what the funnel optimises for tells you
            what the output will look like before you upload anything.
          </p>
        }
      >
        <Prose>
          <h3>One image, low resolution, watermarked</h3>
          <p>
            Almost every free headshot tool returns a single render, often at 512 or 768 pixels, with a watermark across
            a corner or the whole frame. Removing the watermark is the paid upsell. For a profile avatar on a small
            circle that might be acceptable; for a résumé, a company page or a conference card it is not, because the
            watermark is exactly where the recruiter or client is looking.
          </p>
          <h3>No retry when the likeness misses</h3>
          <p>
            Free tiers generally give you one attempt. If the face drifts — the jaw is narrower, the eyes are slightly
            wrong, the skin tone has shifted — you either accept it or pay. Paid pipelines can afford a redo because the
            order already covered the compute; free tiers cannot, so the retry is the paywall.
          </p>
          <h3>A licence you probably do not have</h3>
          <p>
            Free outputs rarely come with a commercial licence, and some free tools claim broad rights over what you
            upload in their terms. If you plan to use the image on a company site, in an ad or in a proposal, that is a
            real risk — and the one place where “free” is most expensive.
          </p>
          <h3>Best-effort queues</h3>
          <p>
            Free requests sit behind paid ones. A render that takes forty seconds on a paid queue can take several
            minutes, or fail and need a page refresh, on a free one. That is not a defect — it is how the compute is
            paid for.
          </p>
        </Prose>
      </Section>

      <Section
        eyebrow="Honest comparison"
        title="Free AI headshot tools vs the $9 Sample Pack"
        intro={
          <p>
            Same job, different trade-offs. This is the comparison we would want to read before uploading a photo of our
            own face somewhere.
          </p>
        }
      >
        <div className="sans overflow-x-auto rounded-2xl border border-stone-300 bg-white/60">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-stone-100/80 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Feature
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Typical free generator
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  PortraitLab Sample Pack
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {COMPARISON.map((row) => (
                <tr key={row.feature}>
                  <th scope="row" className="px-5 py-3 font-medium text-stone-800">
                    {row.feature}
                  </th>
                  <td className="px-5 py-3 text-stone-600">{row.free}</td>
                  <td className="px-5 py-3 font-medium text-stone-900">{row.ours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="sans mt-3 text-xs text-stone-500">
          “Typical free generator” describes the common pattern across free tiers, not one specific competitor. Check
          each tool&apos;s own terms before uploading a portrait.
        </p>
      </Section>

      <Section
        eyebrow="Why we charge"
        title="Why every order is paid first, in plain numbers"
        intro={<p>Headshots are not free to produce. Someone pays for the GPU time — the only question is how.</p>}
      >
        <Prose>
          <h3>Every generated image costs compute</h3>
          <p>
            The pipeline we run makes two model calls per image: one identity-conditioned generation and one face-merge
            pass. At a conservative estimate that is a few cents of GPU time per delivered image, before retries,
            storage and bandwidth. A “free” set of five images therefore costs the operator real money — which is why
            free tiers either watermark, downscale, or monetise the upload itself.
          </p>
          <h3>The two funding models for free</h3>
          <p>
            Free generations are funded either by advertising and upsells, or by the data you upload. We are not
            comfortable with the second model for face photos, and we do not want the first model to shape the product —
            a watermark and a resolution cap exist to make you upgrade, not to make your headshot good. Charging from
            the first image keeps the incentives aligned: you pay once, you get a clean, publishable file.
          </p>
          <h3>What that buys you here</h3>
          <p>
            The {SAMPLE_PACK.price} dollar Sample Pack is a real order: five images, one style, no watermark, commercial
            licence, and one free redo if the likeness misses. If it works, the 40, 60 and 100-image packages use the
            same pipeline at a lower cost per image. If it does not work, the redo and refund policy applies — the same
            policy that covers the larger packages.
          </p>
        </Prose>
      </Section>

      <Section
        eyebrow="Decision guide"
        title="Should you use a free tool or pay $9?"
        intro={<p>Two honest use cases where free wins, and two where it does not.</p>}
      >
        <div className="sans grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-stone-300 bg-white/70 p-6">
            <h3 className="font-serif text-lg font-bold text-stone-900">A free tool is probably fine if…</h3>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-stone-700">
              <li>· the image is for a throwaway account or a private group, not for work;</li>
              <li>· a watermark on a 512px avatar does not bother you;</li>
              <li>· you do not need a commercial licence;</li>
              <li>· you are comfortable with the tool&apos;s terms for uploaded photos.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-stone-300 bg-white/70 p-6">
            <h3 className="font-serif text-lg font-bold text-stone-900">Pay the $9 if…</h3>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-stone-700">
              <li>· the photo goes on LinkedIn, a résumé, a company page or a proposal;</li>
              <li>· you need the file at 1024px without a watermark;</li>
              <li>· you need a written commercial licence;</li>
              <li>· you want a redo rather than a second purchase when the likeness misses;</li>
              <li>· you want your uploads deleted after 30 days and never used for training.</li>
            </ul>
          </div>
        </div>
        <p className="sans mt-4 text-sm text-stone-600">
          Ready to stop comparing?{" "}
          <Link href="/pricing" className="text-orange-700 underline underline-offset-2">
            The $9 Sample Pack is on the pricing page
          </Link>
          , and the{" "}
          <Link href="/how-it-works" className="text-orange-700 underline underline-offset-2">
            pipeline is documented here
          </Link>{" "}
          so you can see exactly what runs after payment.
        </p>
      </Section>

      <Section eyebrow="FAQ" title="Free vs paid questions">
        <FaqList items={FAQ} />
      </Section>

      <RelatedLinks
        links={[
          {
            href: "/pricing",
            label: "Pricing & Sample Pack",
            body: "$9 for 5 images, $35 for 40, $45 for 60, $75 for 100 — one-time.",
          },
          {
            href: "/ai-headshot-generator",
            label: "AI headshot generator",
            body: "What the generator actually does, where the free-tool comparison lands, and the $9 entry point.",
          },
          {
            href: "/how-it-works",
            label: "How the pipeline works",
            body: "Quality gate, identity pass and face-merge stage, step by step.",
          },
          {
            href: "/refund",
            label: "Redo & refund policy",
            body: "Free redo within 48 hours and the written refund window.",
          },
          {
            href: "/ai-professional-headshot",
            label: "AI professional headshot",
            body: "Business-ready portraits for résumés, press pages and directories.",
          },
          {
            href: "/linkedin-headshot",
            label: "LinkedIn headshot",
            body: "Sizing, backdrop and expression for recruiter-facing profiles.",
          },
          {
            href: "/privacy",
            label: "Privacy",
            body: "What happens to uploaded photos and how deletion works.",
          },
        ]}
      />

      <CtaBand
        title="Pay $9, see a real sample first"
        body={`Five real headshots for $${SAMPLE_PACK.price}, one style, no watermark, commercial licence and one free redo. It is the cheapest way to see the pipeline on your own face.`}
        href="/pricing"
        cta="Get the $9 Sample Pack"
      />
      <StudioComparisonSection />
      <EditorialByline />
    </main>
  );
}
