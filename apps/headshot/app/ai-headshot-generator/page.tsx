import type { Metadata } from "next";
import Link from "next/link";
import GeneratorForm from "../components/generator-form";
import {
  Breadcrumbs,
  CtaBand,
  FaqList,
  JsonLd,
  KeyFacts,
  PlanCards,
  Prose,
  RelatedLinks,
  Section,
  StepGrid,
  StyleTable,
} from "../components/ui";
import { EditorialByline, StudioComparisonSection } from "../components/editorial";
import { SAMPLE_PACK, STYLE_DETAILS } from "../lib/site";
import {
  breadcrumbJsonLd,
  buildMetadata,
  faqPageJsonLd,
  productJsonLd,
  webApplicationJsonLd,
} from "../lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "AI Headshot Generator — Paid Headshots from Selfies, from $9",
  description:
    "An AI headshot generator that runs a quality gate, identity pass and face-merge stage on your selfies. Paid only — the $9 Sample Pack (5 images) is the only package on sale today; larger packages are coming soon. No free tier.",
  path: "/ai-headshot-generator",
  keywords: [
    "ai headshot generator",
    "ai headshot",
    "ai headshots",
    "ai headshot maker",
    "headshot generator",
  ],
});

const DESCRIPTION =
  "An AI headshot generator for professional headshots: upload selfies, get 5 paid sample images for $9. The 40, 60 and 100-image packages are coming soon. Quality gate, identity pass and face-merge included.";

const FAQ = [
  {
    q: "What is an AI headshot generator?",
    a: "It is software that builds a new portrait of a specific person from a handful of their photos, a style preset and a generation model — rather than cropping or retouching one existing photo. The output is a synthetic image that should look like the person, in framing and lighting that matches a chosen professional style.",
  },
  {
    q: "How is this different from using a filter or a photo editor?",
    a: "A filter edits one frame: you get forty variations of the same photo. A generator produces forty different frames of the same person — new pose, new light, new expression — which is what you need when the goal is a set of professional headshots rather than one improved selfie.",
  },
  {
    q: "Do you offer a free AI headshot generator?",
    a: "No. Every order is paid before any generation runs: there is no complimentary tier and no sample render before checkout. The cheapest order is the one-time $9 Sample Pack (5 headshots). Every generation costs GPU time and we do not fund unpaid runs with ads or by trading photo data — see the free vs paid comparison page for the full reasoning.",
  },
  {
    q: "How many selfies does the generator need?",
    a: "Three minimum, five recommended: one front-facing frame, one turned slightly left, one slightly right, one with a natural smile and one in different lighting. Variety helps the identity pass separate your face from a single camera angle.",
  },
  {
    q: "How long does generation take?",
    a: "The 5-image Sample Pack finishes in well under a minute of generation time. The order page reports progress live and you can download individual files or a ZIP. Delivery times for larger packages will be published when they open.",
  },
  {
    q: "What if the AI headshots do not look like me?",
    a: "Every paid order includes one free redo within 48 hours. The redo regenerates the full set with adjusted identity guidance and, if needed, a different preset. If the redo still misses, the published refund policy applies.",
  },
  {
    q: "Can I use the output commercially?",
    a: "Yes. Every delivered image comes with a commercial licence: your website, LinkedIn, brochures, ads, articles, speaker decks and print. You may not resell the images as stock photography or train a competing model on them.",
  },
];

const COMPARISON = [
  ["Cost", "Studio day rate + retouching, often several hundred dollars", "From $9 for a 5-image Sample Pack"],
  ["Time to delivery", "Booking, shoot and retouching: one to three weeks", "Minutes after upload"],
  ["Number of frames", "A handful of selects you chose on the day", "Five final images on the Sample Pack; larger sets coming soon"],
  ["Style variety", "One look per session, more outfits cost more", "Five presets, one backdrop on the Sample Pack"],
  ["Reshoot", "New booking, new cost", "One free redo within 48 hours"],
  ["Best for", "Large print, brand campaigns, art direction", "LinkedIn, résumés, team pages, directories"],
];

export default function AiHeadshotGeneratorPage() {
  return (
    <main>
      <JsonLd
        data={webApplicationJsonLd({
          name: "PortraitLab AI Headshot Generator",
          description: DESCRIPTION,
          path: "/ai-headshot-generator",
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQ)} />
      <JsonLd data={productJsonLd({ path: "/ai-headshot-generator" })} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "AI headshot generator", path: "/ai-headshot-generator" },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "AI headshot generator", path: "/ai-headshot-generator" },
        ]}
      />

      <section className="mx-auto grid max-w-6xl items-start gap-10 px-6 pb-10 pt-8 md:grid-cols-2">
        <div>
          <p className="sans mb-4 inline-flex rounded-full border border-orange-300 bg-orange-50 px-3 py-1 text-xs uppercase tracking-wide text-orange-800">
            Generator · paid from $9 · no free tier
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
            AI Headshot Generator — Paid Headshots from Your Selfies in Minutes
          </h1>
          <div className="sans mt-5 space-y-4 text-base leading-relaxed text-stone-700">
            <p>
              This is the engine room. The{" "}
              <Link href="/" className="text-orange-700 underline underline-offset-2">
                professional headshots
              </Link>{" "}
              you see on the home page are produced by the pipeline described here: a face quality gate, an
              identity-conditioned generation model and a face-merge pass, run against the style preset you choose.
            </p>
            <p>
              It is a paid tool: every set is generated after payment. The entry point is the one-time{" "}
              {SAMPLE_PACK.price} dollar Sample Pack — {SAMPLE_PACK.images} headshots, one style, no watermark, one free
              redo — so you can judge the generator on your own face before larger packages open.
            </p>
          </div>
          <div className="sans mt-6">
            <KeyFacts
              facts={[
                { label: "Input", value: "3–8 selfies" },
                { label: "Entry price", value: `$${SAMPLE_PACK.price} / 5 images` },
                { label: "Delivery", value: "1024–2048px JPG" },
                { label: "Redo", value: "1 free, 48 hours" },
              ]}
            />
          </div>
        </div>
        <GeneratorForm heading="Generate with the $9 Sample Pack" defaultPlan={5} />
      </section>

      <Section
        eyebrow="Definition"
        title="What an AI headshot generator actually does"
        intro={
          <p>
            The term gets used for three different things. Only one of them produces a usable set of professional
            headshots, so it is worth separating them.
          </p>
        }
      >
        <Prose>
          <h3>1. Filters and beauty modes</h3>
          <p>
            A filter transforms an existing photo: smooth skin, brighten, blur the background, relight. The identity is
            preserved because the original pixels are still there, but so is the original pose, expression and framing.
            You cannot get a large professional set from a filter, because a filter has only one frame to work
            with.
          </p>
          <h3>2. Face swap</h3>
          <p>
            Face swap takes a generated or existing photo of somebody else and replaces the face with yours. It is fast
            and it preserves the target framing well, but it produces the same generic body and lighting for every
            customer, and the merge line is visible at high resolution on some models. It is a useful part of a
            pipeline — we use a face-comparison merge stage ourselves — but on its own it is not a headshot generator.
          </p>
          <h3>3. Identity-conditioned generation</h3>
          <p>
            This is what we run. The model takes a small set of your photos, builds an identity representation and
            generates entirely new frames conditioned on it — new pose, new light, new expression, new background. Then
            a second pass compares the generated face with your originals and merges your specific features back in, so
            the fifth and later images still look like the same person. That second stage is the difference between a
            demo and a deliverable.
          </p>
        </Prose>
      </Section>

      <Section
        eyebrow="Process"
        title="How this generator works, step by step"
        intro={<p>Four stages run between your upload and your download. You only see progress and the final set.</p>}
      >
        <StepGrid
          steps={[
            {
              title: "Upload and quality gate",
              body: "Three to eight selfies. The gate rejects frames with no clear face, more than one face, extreme head angles, sunglasses, heavy blur or too little resolution, and tells you which one to replace.",
              detail: "Bad inputs are rejected before generation, so they never cost you a redo.",
            },
            {
              title: "Choose a preset and package",
              body: "LinkedIn/corporate, creative, actor, medical or real-estate presets, each fixing backdrop, wardrobe level, lighting direction and crop. The $9 Sample Pack is the only package on sale today; larger packages are coming soon.",
              detail: "One-time payment; the preset can be changed on the free redo.",
            },
            {
              title: "Generate and merge",
              body: "The identity-conditioned model renders each frame, then the face-merge pass pulls your original features back into the output. This is what keeps a large set recognisable rather than drifting.",
              detail: "Two model calls per delivered image, which is why the per-image cost is not zero.",
            },
            {
              title: "Normalise and download",
              body: "Backgrounds are flattened to the preset tone, crops aligned and files exported as JPG. Download individually or as a ZIP; files stay in your order for 30 days.",
              detail: "One free redo within 48 hours if the likeness misses.",
            },
          ]}
        />
      </Section>

      <Section
        eyebrow="Comparison"
        title="AI headshot generator vs studio photoshoot"
        intro={
          <p>
            Both produce professional headshots. They optimise for different things, and for most digital channels the
            generator wins on cost per usable image.
          </p>
        }
      >
        <div className="sans overflow-x-auto rounded-2xl border border-stone-300 bg-white/60">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-stone-100/80 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Dimension
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Studio photoshoot
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  PortraitLab generator
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {COMPARISON.map(([dimension, studio, ours]) => (
                <tr key={dimension}>
                  <th scope="row" className="px-5 py-3 font-medium text-stone-800">
                    {dimension}
                  </th>
                  <td className="px-5 py-3 text-stone-600">{studio}</td>
                  <td className="px-5 py-3 font-medium text-stone-900">{ours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        eyebrow="Presets"
        title="Style presets the generator can render"
        intro={<p>Every preset is available on the Sample Pack. You pick one; the free redo can switch it.</p>}
      >
        <StyleTable styles={STYLE_DETAILS} />
      </Section>

      <Section
        eyebrow="Pricing"
        title="Paid only — the $9 Sample Pack is the entry point"
        intro={
          <p>
            Paid only, no watermark. The $9 five-image Sample Pack is the only package on sale today; the 40, 60 and 100-image packages are
            coming soon.
          </p>
        }
      >
        <PlanCards />
      </Section>

      <Section eyebrow="FAQ" title="AI headshot generator questions">
        <FaqList items={FAQ} />
      </Section>

      <RelatedLinks
        title="Related pages"
        links={[
          {
            href: "/",
            label: "Professional headshots",
            body: "The main product page: use cases, styles and the $9 Sample Pack checkout entry.",
          },
          {
            href: "/free-ai-headshot-generator",
            label: "Free vs paid headshot tools",
            body: "What free generators actually deliver, and why ours starts at $9.",
          },
          {
            href: "/ai-professional-headshot",
            label: "AI professional headshot",
            body: "Business-ready framing for résumés, press pages and directories.",
          },
          {
            href: "/how-it-works",
            label: "How it works",
            body: "The full pipeline with timings, limits and privacy notes.",
          },
          {
            href: "/pricing",
            label: "Pricing",
            body: "$9 Sample Pack, coming-soon larger packages, redo and refund policy.",
          },
          {
            href: "/refund",
            label: "Redo & refund",
            body: "The free redo window and the written refund terms.",
          },
        ]}
      />

      <CtaBand
        title="Run the generator on your own face"
        body={`Every set is generated after payment: start with the $${SAMPLE_PACK.price} Sample Pack (${SAMPLE_PACK.images} headshots) — the only package on sale today. Larger packages are coming soon.`}
        cta="Start with the $9 Sample Pack"
      />
      <StudioComparisonSection title="AI headshot generator vs a studio shoot" />
      <EditorialByline />
    </main>
  );
}
