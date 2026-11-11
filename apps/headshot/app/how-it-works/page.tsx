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
  StepGrid,
} from "../components/ui";
import { STYLES } from "../lib/site";
import { breadcrumbJsonLd, buildMetadata, faqPageJsonLd, howToJsonLd, webApplicationJsonLd } from "../lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "How It Works — Our AI Headshot Pipeline, Step by Step",
  description:
    "How our AI headshot generator works: face quality gate, identity-conditioned generation, face merge pass, delivery and deletion. Timings, limits and privacy explained.",
  path: "/how-it-works",
  keywords: ["how ai headshots work", "ai headshot generator process", "ai headshot pipeline"],
});

const STEPS = [
  {
    title: "Upload and quality gate",
    body: "You upload three to eight selfies. An on-server check rejects photos with no face, more than one face, heavy blur, extreme head angles, sunglasses or too little resolution, and tells you exactly why so you can retake it.",
    detail: "Nothing is generated for a photo that fails the gate, so bad inputs never cost you a redo.",
  },
  {
    title: "Style preset selection",
    body: "The preset fixes backdrop tone, wardrobe level, lighting direction and crop. Five presets cover corporate, creative, actor, medical and real-estate use.",
    detail: "The preset can be changed on the free redo without paying again.",
  },
  {
    title: "Identity-conditioned generation",
    body: "The pipeline renders new portraits from your identity and the preset. Each image is a new frame — new pose, new light, new expression — not an edit of a single photo.",
    detail: "Typical cost is a fraction of a cent to a few cents per image depending on resolution.",
  },
  {
    title: "Face merge pass",
    body: "A second pass compares the generated face with your original photos and pulls your facial features back into the output. This is what keeps a forty-image set recognisable instead of drifting into a generic person.",
    detail: "This stage is why the set holds up at 20 images, not just the first one.",
  },
  {
    title: "Normalisation and export",
    body: "Backgrounds are flattened to the preset tone, crops aligned, and files exported as 1024px JPG — or the enhanced resolution set on the top tier.",
    detail: "Per-image cost and generation time are fixed, so package price does not change with what you upload.",
  },
  {
    title: "Delivery and deletion",
    body: "You get a download page with individual files and a ZIP. Order files stay available for 30 days, and the original uploads are deleted on the same schedule — earlier on request.",
    detail: "Redo requests are accepted for 48 hours after delivery.",
  },
];

const FAQ = [
  {
    q: "How long does generation actually take?",
    a: "Roughly two minutes for 40 images, three minutes for 60 and four minutes for 100 at normal queue depth. The page shows live percentage progress while the set renders.",
  },
  {
    q: "What happens if a photo fails the quality gate?",
    a: "You see the specific reason — no face detected, more than one face, too much motion blur, head angled too far, sunglasses, resolution too low — and can re-upload before any generation runs. There is no charge for rejected uploads.",
  },
  {
    q: "Does the pipeline train on my face?",
    a: "No. Your uploads are used to condition the generation for your order and nothing else. They are not added to a training set, are not published, and are deleted after 30 days.",
  },
  {
    q: "Which providers process the images?",
    a: "Generation and face merging run on third-party inference platforms (fal and Replicate) that are contracted for commercial use; payments are processed by our merchant of record; files are stored in object storage with a 30-day lifecycle rule. The privacy page lists the categories in detail.",
  },
  {
    q: "Why do I need three photos minimum?",
    a: "One photo gives the model a single angle and a single light, which makes it hard to separate your face from the pose. Three to five photos across slightly different angles and lighting give the identity pass enough signal to keep the set consistent.",
  },
  {
    q: "What if the model produces an image that looks nothing like me?",
    a: "That is what the free redo is for. Redo regenerates the set with adjusted guidance and, if needed, a different preset. If the redo still fails, the refund policy applies.",
  },
];

export default function HowItWorksPage() {
  return (
    <main>
      <JsonLd
        data={webApplicationJsonLd({
          name: "PortraitLab AI Headshot Generator",
          description:
            "How the PortraitLab AI headshot pipeline works: quality gate, identity-conditioned generation, face merge, delivery.",
          path: "/how-it-works",
        })}
      />
      <JsonLd
        data={howToJsonLd({
          name: "How to generate professional AI headshots from selfies",
          description:
            "Upload five selfies, choose a style preset and download 40 to 100 professional headshots.",
          steps: STEPS.map((step) => ({ name: step.title, text: step.body })),
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQ)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "How it works", path: "/how-it-works" },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "How it works", path: "/how-it-works" },
        ]}
      />

      <section className="mx-auto max-w-6xl px-6 pb-8 pt-8">
        <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
          How Our AI Headshot Generator Works
        </h1>
        <div className="sans mt-5 grid gap-6 text-base leading-relaxed text-stone-700 md:grid-cols-[1.3fr_1fr]">
          <div className="space-y-4">
            <p>
              Most “AI headshot” products are a single diffusion call with a prompt like “professional headshot, studio
              lighting”. That works for a demo and falls apart for a forty-image set, because a single call has no way to
              stay faithful to a specific face across forty different poses. Our pipeline is deliberately more than one
              call.
            </p>
            <p>
              The order is: quality gate, preset selection, identity-conditioned generation, face merge pass,
              normalisation, delivery and deletion. Six stages, two model calls per image, and a fixed price that does
              not change based on what you upload.
            </p>
          </div>
          <div>
            <KeyFacts
              facts={[
                { label: "Input required", value: "3–8 selfies" },
                { label: "Model calls", value: "2 per image" },
                { label: "Delivery", value: "1024–2048px JPG" },
                { label: "Retention", value: "30 days" },
              ]}
            />
          </div>
        </div>
      </section>

      <Section
        eyebrow="Pipeline"
        title="The six stages, in order"
        intro={<p>Each stage exists because of a specific failure mode observed in single-call tools.</p>}
      >
        <StepGrid steps={STEPS.slice(0, 3)} />
        <div className="sans mt-4">
          <StepGrid steps={STEPS.slice(3)} />
        </div>
      </Section>

      <Section
        eyebrow="Deep dive"
        title="Why two model calls instead of one"
        intro={
          <p>
            Identity preservation and photographic quality are different problems, and one model is rarely best at
            both.
          </p>
        }
      >
        <Prose>
          <h3>Call one: identity-conditioned generation</h3>
          <p>
            The first call takes your source photos, builds an identity embedding and generates a new portrait for the
            chosen preset. It is good at producing a plausible photograph — correct light, correct pose, correct
            background — but it has a known weakness: the further you get from the source photos, the more the face
            drifts. By image thirty, the person in the frame may be a cousin rather than you.
          </p>
          <h3>Call two: face merge</h3>
          <p>
            The second call detects the generated face, compares it with your original photos and merges the identity
            region back into the generated frame. This is a targeted correction, not a wholesale replacement — it
            preserves the generated pose, expression and lighting while restoring the specific features that make the
            face yours: eye spacing, nose shape, jawline, skin tone.
          </p>
          <h3>What still goes wrong</h3>
          <p>
            The merge pass can be too strong (the face looks pasted on) or too weak (the drift remains). Both are
            tunable, and both show up as a set-wide problem rather than a single bad image, which is why the redo
            regenerates the entire set with adjusted guidance instead of replacing one file. It is also why the free
            redo exists: no automated identity check is perfect, and a second attempt with better source photos fixes
            most misses.
          </p>
          <h3>Why delivery is a set, not a single image</h3>
          <p>
            A set lets you pick. Forty images will contain a few frames that flatter you more than the others — different
            expressions, slightly different light, a better angle. Those are the ones you publish. Single-image tools
            give you one chance to get it right, which is why their customers so often ask for a refund.
          </p>
        </Prose>
      </Section>

      <Section
        eyebrow="Privacy"
        title="What happens to your photos"
        intro={<p>Three commitments, written into the privacy policy rather than left to interpretation.</p>}
      >
        <div className="sans grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Used only for your order",
              body: "Uploads condition the generation for the order they belong to. They are not used for model training, not published, and not added to any product demo.",
            },
            {
              title: "Deleted after 30 days",
              body: "Originals and generated files are removed from storage after 30 days. Earlier deletion on request, from your order email, at any time.",
            },
            {
              title: "No public figures, no minors",
              body: "You must be the person in the photos, or have that person's permission. Photos of public figures and of anyone under 18 are prohibited and will be refused.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-stone-300 bg-white/70 p-6">
              <h3 className="font-serif text-lg font-bold text-stone-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.body}</p>
            </div>
          ))}
        </div>
        <p className="sans mt-4 text-sm text-stone-600">
          Full detail — including processors, retention and your rights — is on the{" "}
          <Link href="/privacy" className="text-orange-700 underline underline-offset-2">
            privacy page
          </Link>
          .
        </p>
      </Section>

      <Section
        eyebrow="Presets"
        title="The five style presets"
        intro={<p>Every preset is available in every package; the preset sets backdrop, wardrobe level, light direction and crop.</p>}
      >
        <div className="sans grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {STYLES.map((style) => (
            <div key={style} className="rounded-2xl border border-stone-300 bg-white/60 p-4 text-sm text-stone-700">
              {style}
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="FAQ" title="Process questions">
        <FaqList items={FAQ} />
      </Section>

      <RelatedLinks
        links={[
          { href: "/", label: "AI headshot generator", body: "Start a paid order with the $9 Sample Pack." },
          { href: "/free-ai-headshot-generator", label: "Free vs paid headshot tools", body: "What free generators give you, and why we charge from $9." },
          { href: "/pricing", label: "Pricing", body: "$9 sample, then $35 / $45 / $75 one-time packages." },
          { href: "/privacy", label: "Privacy policy", body: "Processors, retention and deletion." },
          { href: "/terms", label: "Terms of service", body: "Acceptable use and licence terms." },
          { href: "/refund", label: "Redo & refund", body: "48-hour redo and refund conditions." },
        ]}
      />

      <CtaBand
        title="See it work on your own photos"
        body="There is no free preview: the pipeline runs on paid orders only, starting with the $9 Sample Pack (5 headshots)."
        cta="Start with the $9 Sample Pack"
        href="/pricing"
      />
    </main>
  );
}
