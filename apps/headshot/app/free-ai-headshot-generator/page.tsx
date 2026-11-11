import type { Metadata } from "next";
import Link from "next/link";
import GeneratorForm from "../components/generator-form";
import {
  Breadcrumbs,
  CtaBand,
  FaqList,
  JsonLd,
  Prose,
  RelatedLinks,
  Section,
  StepGrid,
} from "../components/ui";
import { buildMetadata, breadcrumbJsonLd, faqPageJsonLd, webApplicationJsonLd } from "../lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Free AI Headshot Generator — 1 Free Preview, No Card",
  description:
    "Try our free AI headshot generator: upload 3–8 selfies, render one preview from your own photos, then decide whether to buy a full 40–100 image set. No card required.",
  path: "/free-ai-headshot-generator",
  keywords: ["free ai headshot generator", "free headshot generator", "ai headshot free trial"],
});

const FAQ = [
  {
    q: "Is the free preview really free?",
    a: "Yes — one render per visitor, no card required. You upload your own selfies, the pipeline runs the same quality gate and identity pass as a paid order, and you get one image back. Nothing is charged and there is no automatic subscription at the end.",
  },
  {
    q: "Why only one image?",
    a: "Because a single image is enough to judge whether the identity pass works on your photos. Rendering forty or a hundred images costs real GPU time and, more importantly, most people only need to see one frame to decide whether the style matches what they want. If it does, the paid packages unlock the full set.",
  },
  {
    q: "Do you keep my free preview selfies?",
    a: "They are used to render the preview and nothing else. They are not used to train models and are deleted from storage after 30 days. If you want them removed immediately, reply to the preview email and we delete the order.",
  },
  {
    q: "Can I use the free preview image commercially?",
    a: "The free preview is for evaluation, so it is watermarked and licensed for personal, non-commercial use only. Paid packages remove the watermark and include a commercial licence for every delivered image.",
  },
  {
    q: "Why does the preview ask for an email?",
    a: "So the render link survives a page refresh and so we can delete your uploads on request. We send one delivery email and, if you opt in, occasional product updates. Unsubscribe is a single click and your data is not sold.",
  },
  {
    q: "What if the free preview does not look like me?",
    a: "That usually means the source photos were too similar, too dark or at an odd angle. Try a second upload with five photos across two lighting setups. If the paid set still misses, the free redo and refund policy apply.",
  },
];

export default function FreeAiHeadshotGeneratorPage() {
  return (
    <main>
      <JsonLd
        data={webApplicationJsonLd({
          name: "PortraitLab Free AI Headshot Generator",
          description:
            "Free AI headshot generator: upload selfies and render one professional preview before buying a full set.",
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

      <div className="mx-auto grid max-w-6xl items-start gap-10 px-6 pb-10 pt-8 md:grid-cols-2">
        <div>
          <p className="sans mb-4 inline-flex rounded-full border border-orange-300 bg-orange-50 px-3 py-1 text-xs uppercase tracking-wide text-orange-800">
            Free · 1 preview · no card
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
            Free AI Headshot Generator — Render One Preview Before You Pay
          </h1>
          <div className="sans mt-5 space-y-4 text-base leading-relaxed text-stone-700">
            <p>
              Most headshot tools ask for a card before you see a single frame. This page does the opposite: upload three
              to eight selfies, run the same identity pipeline used by paid orders, and look at one real result first.
              If the style and the likeness work, buy a package; if they do not, close the tab and you have lost nothing
              but five minutes.
            </p>
            <p>
              The preview is not a low-quality demo. It runs the same face quality gate, the same identity-conditioned
              generation and the same face-merge pass. The only differences are volume (one image instead of forty to a
              hundred) and the evaluation watermark.
            </p>
          </div>
          <ul className="sans mt-5 space-y-2 text-sm text-stone-600">
            <li>✓ Same model pipeline as a paid order</li>
            <li>✓ One render per visitor, no card</li>
            <li>✓ Photos deleted after 30 days</li>
            <li>✓ No subscription created at the end</li>
          </ul>
        </div>
        <GeneratorForm
          variant="free"
          heading="Render my free preview"
          note="Free preview mode — one image, watermarked. Paid packages unlock the full set."
        />
      </div>

      <Section
        eyebrow="How it works"
        title="Three steps to your free preview"
        intro={<p>No account, no card, no download of a desktop app. Everything happens in the browser.</p>}
      >
        <StepGrid
          steps={[
            {
              title: "Upload 3–8 selfies",
              body: "Use your phone camera in daylight, one straight-on frame and two slightly turned. Avoid sunglasses, heavy filters and group photos.",
              detail: "The quality gate runs before any generation, so bad inputs cost nothing.",
            },
            {
              title: "Pick a style",
              body: "Choose corporate, creative, actor, medical or real estate. The preset sets the backdrop, wardrobe and light direction.",
              detail: "You can change the style later on a paid order without paying twice.",
            },
            {
              title: "See one real render",
              body: "The preview appears in the same page with a progress indicator. It uses the same pipeline as a paid order.",
              detail: "One preview per visitor — this is a fair-use limit, not a sales trick.",
            },
          ]}
        />
      </Section>

      <Section
        eyebrow="Free vs paid"
        title="What is different about a paid package"
        intro={
          <p>
            The free preview tests the hardest question — does the render look like you. A paid package adds volume,
            variety and the rights you need to actually publish the result.
          </p>
        }
      >
        <div className="sans overflow-x-auto rounded-2xl border border-stone-300 bg-white/60">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-stone-100/80 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Feature
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Free preview
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Paid package
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {[
                ["Images delivered", "1", "40, 60 or 100"],
                ["Watermark", "Yes", "No"],
                ["Style presets", "1 chosen preset", "All presets, 2–4 backdrops"],
                ["Outfit / backdrop variety", "Single frame", "Included per tier"],
                ["Commercial licence", "Personal use only", "Included"],
                ["Free redo", "—", "1 within 48 hours"],
                ["Resolution", "1024px preview", "1024–2048px"],
                ["Price", "$0", "$35 / $45 / $75 one-time"],
              ].map(([feature, free, paid]) => (
                <tr key={feature}>
                  <th scope="row" className="px-5 py-3 font-medium text-stone-800">
                    {feature}
                  </th>
                  <td className="px-5 py-3 text-stone-600">{free}</td>
                  <td className="px-5 py-3 text-stone-600">{paid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="sans mt-4 text-sm text-stone-600">
          Ready to unlock the full set?{" "}
          <Link href="/pricing" className="text-orange-700 underline underline-offset-2">
            Compare the three packages
          </Link>{" "}
          or read how the{" "}
          <Link href="/ai-professional-headshot" className="text-orange-700 underline underline-offset-2">
            professional headshot
          </Link>{" "}
          flow differs for business use.
        </p>
      </Section>

      <Section eyebrow="Photo guide" title="How to get a good free preview on the first try">
        <Prose>
          <p>
            The preview is only as good as its inputs. The single most common reason a free render misses is not the
            model — it is five photos taken in the same minute, at the same angle, under the same light. When every
            input looks identical, the identity pass has almost no information to separate your face from the pose.
          </p>
          <h3>What to upload</h3>
          <ul>
            <li>One straight-on frame at eye level, neutral expression.</li>
            <li>One frame turned about fifteen degrees to each side.</li>
            <li>One frame with a relaxed smile (not a grin).</li>
            <li>One frame in different light — for example a window on the other side of your face.</li>
          </ul>
          <h3>What to avoid</h3>
          <ul>
            <li>Group photos, or anything where a second face is visible.</li>
            <li>Sunglasses, hats with brims, masks, or hair covering both eyes.</li>
            <li>Beauty filters, heavy HDR, or screenshots from social apps.</li>
            <li>Backlit photos where the face is darker than the background.</li>
          </ul>
          <p>
            If the preview looks close but not quite right, do not immediately buy a package — upload a second set. Two
            attempts with genuinely different photos usually resolve it. If it still misses, that is useful information
            too: it means the pipeline is not a fit for your source material, and you have spent nothing.
          </p>
        </Prose>
      </Section>

      <Section eyebrow="FAQ" title="Free preview questions">
        <FaqList items={FAQ} />
      </Section>

      <RelatedLinks
        links={[
          {
            href: "/ai-professional-headshot",
            label: "AI professional headshot",
            body: "What business-ready portraits include, and how to pick a preset.",
          },
          {
            href: "/linkedin-headshot",
            label: "LinkedIn headshot",
            body: "Profile sizing, backdrop choice and expression for recruiters.",
          },
          {
            href: "/pricing",
            label: "Pricing",
            body: "40 / 60 / 100 image packages, redo and refund policy.",
          },
        ]}
      />

      <CtaBand
        title="Preview looks right? Unlock the full set."
        body="40 headshots for $35, 60 for $45, 100 for $75 — one-time payment, commercial licence and one free redo included."
        href="/pricing"
        cta="See packages"
      />
    </main>
  );
}
