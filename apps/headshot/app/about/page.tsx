import type { Metadata } from "next";
import Link from "next/link";
import { AuthorByline } from "../components/editorial";
import { Breadcrumbs, CtaBand, FaqList, JsonLd, Prose, Section } from "../components/ui";
import { PRIMARY_AUTHOR, authorPath } from "../lib/authors";
import { CONTACT, CONTENT_UPDATED, SITE_NAME, SITE_URL } from "../lib/site";
import { breadcrumbJsonLd, buildMetadata, canonicalFor, faqPageJsonLd } from "../lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About PortraitLab — Who Builds This AI Headshot Pipeline",
  description:
    "Who is behind PortraitLab, why the service is paid-only, how we evaluate quality, which model documentation we rely on, and what we deliberately do not claim.",
  path: "/about",
});

const SOURCES = [
  {
    label: "fal.ai — flux-pulid endpoint",
    href: "https://fal.ai/models/fal-ai/flux-pulid",
    note: "The identity-conditioned generation endpoint behind the main pipeline, documented as commercial use.",
  },
  {
    label: "Replicate — cdingram/face-swap",
    href: "https://replicate.com/cdingram/face-swap",
    note: "The face-merge stage; the model card states commercial use is permitted.",
  },
  {
    label: "Black Forest Labs — FLUX",
    href: "https://blackforestlabs.ai/",
    note: "The base image model family; licensing differs between the dev weights and hosted commercial use.",
  },
  {
    label: "Google MediaPipe — face detection",
    href: "https://ai.google.dev/edge/mediapipe/solutions/vision/face_detector",
    note: "The documented face-detection component used by the upload quality gate.",
  },
  {
    label: "Replicate — pricing and hardware rate card",
    href: "https://replicate.com/pricing",
    note: "The per-second GPU rates behind the unit costs quoted in our pricing explanations.",
  },
];

const FAQ = [
  {
    q: "Is PortraitLab a big company?",
    a: "No. It is built and operated by a small independent product team. We do not publish team size, funding or customer figures because there are no numbers worth turning into marketing.",
  },
  {
    q: "Do you publish customer reviews or testimonials?",
    a: "No. We do not publish invented testimonials, star ratings or review counts. If verified customer stories are added later, they will be published with the customer's permission and clearly labelled as what they are.",
  },
  {
    q: "Why is there no unpaid option?",
    a: "Every generated image costs GPU time. A complimentary set would have to be funded by advertising, an upsell or the data in the upload — none of which we are willing to do with face photos. Charging from the first image keeps the product honest: you pay once, you get clean files, and the redo policy covers a miss.",
  },
  {
    q: "How do I report an error on a page?",
    a: "Email the editorial inbox with the URL and what is wrong. Corrections are applied to the page and, where the change is substantive, noted in the update log on the editorial team page.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About PortraitLab",
          url: canonicalFor("/about"),
          inLanguage: "en-US",
          dateModified: CONTENT_UPDATED,
          mainEntity: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
            email: CONTACT.support,
            description:
              "Independent product team operating a paid AI headshot pipeline that turns selfies into professional headshots.",
            contactPoint: [
              { "@type": "ContactPoint", contactType: "customer support", email: CONTACT.support },
              { "@type": "ContactPoint", contactType: "billing", email: CONTACT.billing },
              { "@type": "ContactPoint", contactType: "privacy", email: CONTACT.privacy },
            ],
          },
        }}
      />
      <JsonLd data={faqPageJsonLd(FAQ)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]}
      />

      <section className="mx-auto max-w-6xl px-6 pb-6 pt-8">
        <p className="sans mb-4 inline-flex rounded-full border border-orange-300 bg-orange-50 px-3 py-1 text-xs uppercase tracking-wide text-orange-800">
          Editorial standards · paid-only · no invented claims
        </p>
        <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
          About PortraitLab — Who Builds This AI Headshot Pipeline
        </h1>
        <AuthorByline />
      </section>

      <Section
        eyebrow="Who we are"
        title="A small product team, not a photography studio"
        intro={
          <p>
            {SITE_NAME} is built and operated by a small independent team. We write the code that runs the pipeline, we
            answer the support email, and we write the pages you are reading. There is no agency behind the site and no
            stock-photo portfolio presented as our work.
          </p>
        }
      >
        <Prose>
          <p>
            Our day-to-day work is the pipeline itself: checking uploaded selfies against a face-quality gate, running
            identity-conditioned generation, merging the original face back into each rendered frame, and delivering the
            files. That operational experience is the basis for the guidance on this site — we describe the system we
            run, not a product we resell.
          </p>
          <p>
            We are not portrait photographers or retouchers, and we do not pretend to be. Where a studio shoot is the
            better choice — large-format print, art-directed brand campaigns, a shoot that needs wardrobe and styling
            direction on set — our pages say so. Our claim is narrower: for the places a headshot is actually displayed
            — LinkedIn, résumés, team pages, clinic directories — a generated set from good selfies is usually
            indistinguishable at display size and costs a fraction of a studio booking.
          </p>
          <p>
            If you want the editorial policy in detail — what we cover, how we work, and the correction log — it is
            published on the{" "}
            <Link href={authorPath(PRIMARY_AUTHOR.slug)}>editorial team page</Link>.
          </p>
        </Prose>
      </Section>

      <Section
        eyebrow="Why paid"
        title="Why there is no unpaid tier, and what that funds"
        intro={
          <p>
            Every generated image makes two model calls, both of which cost real GPU time before retries, storage and
            bandwidth. Someone has to pay for that, and the choice of who shapes the product.
          </p>
        }
      >
        <Prose>
          <p>
            Unpaid headshot tools are funded one of two ways: advertising and upsells, or the data in the upload. The
            first model pushes watermarks, resolution caps and paywalls into the output; the second turns face photos
            into inventory. We are not willing to do the second with portraits, and we do not want the first to decide
            what your headshot looks like.
          </p>
          <p>
            Charging from the first image keeps the incentives simple. The $9 Sample Pack (5 images) is a real paid
            order with no watermark, a commercial licence and one free redo; the 40, 60 and 100-image packages use the
            same pipeline at a lower per-image rate. The refund policy is written down and linked from every page. You
            can see the exact numbers on{" "}
            <Link href="/pricing">pricing</Link> and how the pipeline runs on{" "}
            <Link href="/how-it-works">how it works</Link>.
          </p>
        </Prose>
      </Section>

      <Section
        eyebrow="Quality"
        title="How we evaluate a generated set"
        intro={
          <p>
            We keep the evaluation criteria explicit and reproducible, and we do not publish scores we did not measure.
          </p>
        }
      >
        <Prose>
          <ul>
            <li>
              <strong>Input gate first.</strong> A photo is checked for a single clear face, usable resolution, a head
              angle within roughly 30 degrees, no sunglasses or heavy shadow, and no second person in frame. Failing
              photos are rejected before any generation.
            </li>
            <li>
              <strong>Identity over aesthetics.</strong> The set is reviewed for whether the person is recognisable
              across many frames, not just whether the first frame looks good. A beautiful image that does not resemble
              the customer is a defect, not a result.
            </li>
            <li>
              <strong>Consistency within a set.</strong> Backdrop tone, crop and light direction should match across
              images so the set can be used on one page without looking like a collage.
            </li>
            <li>
              <strong>Redo as the corrective.</strong> When a set misses, the response is a full-set regeneration with
              adjusted identity guidance rather than one patched file — and the written refund policy if the redo still
              fails.
            </li>
          </ul>
          <p>
            We do not publish “accuracy percentages”, satisfaction scores or A/B comparisons against other tools. Those
            numbers would either be invented or measured on a sample too small to mean anything.
          </p>
        </Prose>
      </Section>

      <Section eyebrow="Sources" title="Where our technical information comes from">
        <Prose>
          <p>
            Technical claims on this site come from the documentation of the components we actually run, plus the
            licensing terms of the model weights we use. If a provider changes its pricing or terms, the affected page is
            updated — the editorial date at the top of each page shows when it was last reviewed.
          </p>
          <ul>
            {SOURCES.map((source) => (
              <li key={source.href}>
                <a href={source.href} rel="noopener noreferrer nofollow" target="_blank">
                  {source.label}
                </a>{" "}
                — {source.note}
              </li>
            ))}
          </ul>
          <p>
            One deliberate exclusion: we do not use InsightFace model weights, because their license restricts the
            trained models to non-commercial research. Face detection in the upload gate uses a documented
            Apache-licensed component instead, and identity work runs on endpoints whose model cards permit commercial
            use. The reasoning is written up on{" "}
            <Link href="/how-it-works">how it works</Link>.
          </p>
        </Prose>
      </Section>

      <Section
        eyebrow="Data"
        title="What we do with your photos — and what we never do"
        intro={
          <p>
            Face photos are the most sensitive thing a headshot service touches, so the policy is short and specific.
          </p>
        }
      >
        <Prose>
          <ul>
            <li>Uploads are used only to render the order they were uploaded for.</li>
            <li>They are never used to train, fine-tune or benchmark a model.</li>
            <li>They are not published, sold or shared with advertisers.</li>
            <li>Originals and outputs are deleted from storage 30 days after delivery, earlier on request.</li>
            <li>We refuse photos of public figures and anyone under 18.</li>
          </ul>
          <p>
            The full detail — including the processors involved — is on the <Link href="/privacy">privacy page</Link>.
            Questions or deletion requests go to <a href={`mailto:${CONTACT.privacy}`}>{CONTACT.privacy}</a>.
          </p>
        </Prose>
      </Section>

      <Section
        eyebrow="Corrections"
        title="How to correct us"
        intro={
          <p>
            Every page carries a byline and a last-updated date. If something is wrong, outdated or missing, tell us and
            we will fix it.
          </p>
        }
      >
        <Prose>
          <p>
            Email <a href={`mailto:${CONTACT.editorial}`}>{CONTACT.editorial}</a> with the URL and the specific claim.
            Substantive corrections are applied to the page and noted in the update log on the{" "}
            <Link href={authorPath(PRIMARY_AUTHOR.slug)}>editorial team page</Link>. Product support, billing and
            privacy requests have their own channels listed on the <Link href="/contact">contact page</Link>.
          </p>
        </Prose>
      </Section>

      <Section eyebrow="FAQ" title="About this site">
        <FaqList items={FAQ} />
      </Section>

      <CtaBand
        title="See the pipeline on your own face"
        body="The $9 Sample Pack is a real paid order: 5 headshots, no watermark, commercial licence, one free redo."
        cta="Start with the $9 Sample Pack"
      />
    </main>
  );
}
