import Link from "next/link";
import type { Metadata } from "next";
import { BRAND } from "@/lib/brands";
import { SiteChrome } from "@/components/SiteChrome";
import { Studio } from "@/components/Studio";
import { DemoGallery } from "@/components/DemoGallery";
import { StickyCta } from "@/components/StickyCta";
import { stylePageHref } from "@/lib/style-pages";
import {
  breadcrumbJsonLd,
  buildMetadata,
  faqPageJsonLd,
  graphSchema,
  webApplicationJsonLd,
  type FaqItem,
} from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title:
    BRAND.kind === "landscape"
      ? "AI Landscape Design from a Photo — YardCanvas"
      : "AI Hair Color Changer — Try a Shade on Your Selfie | HueMirror",
  description:
    BRAND.kind === "landscape"
      ? "Upload one photo of your yard and get four AI landscape design concepts, with the house preserved. One-time $9, no subscription, no free trial."
      : "Upload one selfie and preview four AI hair-colour looks, with your face preserved. One-time $4.90, no subscription, no free trial.",
  path: "/",
});

const STEPS =
  BRAND.kind === "landscape"
    ? [
        {
          title: "Photograph the yard",
          body: "Take one clear, wide photo in daylight. Include the house, fence and the planting area you want to change; avoid heavy shadows and cars in the foreground.",
        },
        {
          title: "Choose a landscape style",
          body: `Pick one of the four directions — ${BRAND.styles.map((style) => style.label).join(", ")} — and start the run. The model keeps the architecture fixed and redesigns the planting and hardscape.`,
        },
        {
          title: "Download four concepts",
          body: "The run returns four concept images for that style. Use them as a mood board for a landscaper or contractor — they are design references, not construction documents.",
        },
      ]
    : [
        {
          title: "Take a front-facing selfie",
          body: "Use a recent, evenly lit photo with your whole head in frame and your hair visible. No hats, no heavy filters and no other people in the frame.",
        },
        {
          title: "Pick a hair colour",
          body: `Choose one of the four shade families — ${BRAND.styles.map((style) => style.label).join(", ")} — and start the run. The edit is instructed to preserve your face, expression and background.`,
        },
        {
          title: "Download four looks",
          body: "You get four versions in that shade with different lighting, so you can compare a natural result with a more editorial one before talking to your stylist.",
        },
      ];

const FAQS: FaqItem[] =
  BRAND.kind === "landscape"
    ? [
        {
          q: "Will the AI keep my actual house?",
          a: "Yes — that is the point of the edit. The prompt is built to keep the architecture, roof, windows, doors, driveway, fences, property boundaries and camera angle unchanged, and to redesign only the planting, lawn, hardscape, lighting and outdoor furniture. AI editing is not perfect; if a result moves the building or invents a structure, request a re-run or a refund under the delivery policy.",
        },
        {
          q: "What exactly do I get for $9?",
          a: "One run that returns four landscape concept images in the style you selected, downloadable as PNGs from the result panel. The $9 is a one-time payment for one photo and one style run — there is no subscription, no auto-renewal and no hidden credit system.",
        },
        {
          q: "Can I use these images for a real renovation?",
          a: "Use them as a design reference and a conversation starter with a landscape professional. They are not construction drawings: they do not include measurements, plant schedules, drainage calculations, permit information or cost estimates. For structural work, hire a qualified local contractor.",
        },
        {
          q: "What photo works best?",
          a: "A sharp, wide JPG or PNG taken in daylight from a position where the whole yard is visible. Avoid night shots, strong backlight, screenshots of listings, photos with people in the foreground, and photos where the house is mostly hidden. A clean photo gives the model less to guess.",
        },
        {
          q: "Is there a free trial?",
          a: "No. Every generation costs AI image credits, so there is no free trial and no free concept image. The entry point is the one-time $9 pack, and refunds are available if the delivery fails or the outputs are unusable — see the refund policy.",
        },
        {
          q: "What happens to my photo?",
          a: "The photo is sent to our AI image provider only to produce your four concepts. It is not used to train models, it is not published, and working files are deleted from storage on a short lifecycle. Read the privacy policy for the full data flow and deletion details.",
        },
      ]
    : [
        {
          q: "Will the result look like me?",
          a: "The edit is explicitly instructed to keep your face shape, eyes, nose, mouth, skin tone, expression, pose, clothing, background and lighting unchanged, and to change only the hair colour. Modern image models are good at this but not perfect; small artifacts can happen. Use the image as a reference, not as a guarantee of an exact salon result.",
        },
        {
          q: "What exactly do I get for $4.90?",
          a: "One run that returns four hair-colour looks in the shade family you selected, with different lighting and dimension, downloadable as PNGs from the result panel. It is a one-time $4.90 payment for one selfie and one shade run — no subscription and no auto-renewal.",
        },
        {
          q: "Can I show the result to my hairstylist?",
          a: "Yes — that is the intended use. A visual reference is often clearer than a swatch, especially for warm blondes, copper and pastel fashion colours. Keep in mind that a photo edit cannot account for your hair's history, porosity or how a specific dye will process on it; your stylist makes the final call.",
        },
        {
          q: "What selfie should I upload?",
          a: "A recent front-facing photo with even light, your whole head visible and no hat, sunglasses or heavy filters. Avoid group photos, photos where part of your hair is cropped out, and low-light shots. If your face is turned away, the edit has less to work with.",
        },
        {
          q: "Is there a free trial?",
          a: "No. Image generation costs AI credits, so there is no free trial or free sample look. The entry point is the one-time $4.90 pack. If the run fails or delivers unusable images, the refund policy covers a refund or re-run.",
        },
        {
          q: "Whose photo can I upload?",
          a: "Only your own photo, or a photo of someone who has clearly consented to this use. Do not upload photos of minors, public figures or anyone else without permission. The photo is not used to train models and is deleted after processing; see the privacy policy and the acceptable-use rules in the terms.",
        },
      ];

const KIND_LABEL = BRAND.kind === "landscape" ? "landscape concept" : "hair-colour look";

export default function HomePage() {
  const schema = graphSchema(
    webApplicationJsonLd({
      name: BRAND.name,
      description: BRAND.intro,
      path: "/",
    }),
    faqPageJsonLd(FAQS),
    breadcrumbJsonLd([{ name: "Home", path: "/" }]),
  );

  return (
    <SiteChrome brand={BRAND}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <main>
        <DemoGallery />
        {/* Studio renders the single page H1 (brand headline) plus the upload/generate flow. */}
        <div id="studio" className="scroll-mt-24">
          <Studio brand={BRAND} />
        </div>

        <section className="mx-auto max-w-6xl px-5 py-14">
          <div className="grid gap-8 md:grid-cols-[1fr_1.1fr] md:items-start">
            <div>
              <p className="sans text-xs font-semibold uppercase tracking-[0.2em] opacity-60" style={{ color: "var(--ink)" }}>
                What you get
              </p>
              <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl" style={{ color: "var(--ink)" }}>
                Four {KIND_LABEL}s, one purchase
              </h2>
              <p className="sans mt-4 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
                {BRAND.kind === "landscape"
                  ? "A single run returns four concept images in the landscape style you picked, so you can compare planting density, materials and mood before you commit to a contractor's quote."
                  : "A single run returns four versions of the shade you picked, so you can compare how it reads in soft window light, warmer side light and more editorial lighting before you book a salon appointment."}
              </p>
              <ul className="sans mt-5 space-y-2 text-sm leading-relaxed" style={{ color: "var(--ink)" }}>
                {BRAND.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5">
                    <span aria-hidden="true" style={{ color: "var(--brand)" }}>
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <p className="sans mt-5 text-xs leading-relaxed opacity-60" style={{ color: "var(--ink)" }}>
                Delivered as PNG downloads in the result panel. One pack covers one photo and one style run; there is
                no subscription and no auto-renewal.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {BRAND.styles.map((style) => (
                <div key={style.id} className="rounded-2xl border border-black/10 p-5" style={{ backgroundColor: "var(--brand-soft)" }}>
                  <h3 className="font-serif text-lg font-bold" style={{ color: "var(--ink)" }}>
                    {style.label}
                  </h3>
                  <p className="sans mt-2 text-sm leading-relaxed opacity-70" style={{ color: "var(--ink)" }}>
                    {style.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="scroll-mt-24 border-y border-black/10 py-14">
          <div className="mx-auto max-w-6xl px-5">
            <p className="sans text-xs font-semibold uppercase tracking-[0.2em] opacity-60" style={{ color: "var(--ink)" }}>
              How it works
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl" style={{ color: "var(--ink)" }}>
              Three steps, about a minute of work
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <div key={step.title} className="rounded-2xl border border-black/10 bg-white/60 p-6">
                  <span
                    className="sans grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: "var(--brand)" }}
                  >
                    {index + 1}
                  </span>
                  <h3 className="mt-4 font-serif text-xl font-bold" style={{ color: "var(--ink)" }}>
                    {step.title}
                  </h3>
                  <p className="sans mt-2 text-sm leading-relaxed opacity-70" style={{ color: "var(--ink)" }}>
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="styles" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-14">
          <p className="sans text-xs font-semibold uppercase tracking-[0.2em] opacity-60" style={{ color: "var(--ink)" }}>
            {BRAND.kind === "landscape" ? "Landscape styles" : "Shade families"}
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl" style={{ color: "var(--ink)" }}>
            {BRAND.kind === "landscape" ? "Four landscape directions to compare" : "Four shade families to compare"}
          </h2>
          <p className="sans mt-4 max-w-3xl leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            {BRAND.kind === "landscape"
              ? "Each style uses the same demo photo and camera angle; the direction changes planting, paving and garden structures. That makes the comparison useful instead of confusing."
              : "Each shade family is rendered in four lighting situations; the edit is instructed to keep your face and haircut fixed. That makes it easier to judge whether a colour is too warm, too cool or too loud for what you actually want."}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BRAND.styles.map((style) => (
              <div key={style.id} className="flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white/60">
                <img
                  src={style.image}
                  alt={`AI-generated ${style.label} style preview on the demo photo`}
                  width={900}
                  height={600}
                  loading="lazy"
                  className={`w-full object-cover ${BRAND.kind === "landscape" ? "aspect-[3/2]" : "aspect-square"}`}
                />
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-serif text-lg font-bold" style={{ color: "var(--ink)" }}>
                      {style.label}
                    </h3>
                    <span className="sans text-[9px] uppercase tracking-wide opacity-45" style={{ color: "var(--ink)" }}>
                      AI preview
                    </span>
                  </div>
                  <p className="sans mt-2 flex-1 text-sm leading-relaxed opacity-70" style={{ color: "var(--ink)" }}>
                    {style.description}
                  </p>
                  <Link
                    href={stylePageHref(style.id)}
                    className="sans mt-4 text-sm font-semibold underline underline-offset-4"
                    style={{ color: "var(--brand)" }}
                  >
                    Try this style
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <p className="sans mt-4 text-[11px] leading-relaxed opacity-50" style={{ color: "var(--ink)" }}>
            Style previews use the same demo input and are AI-generated; they are not customer work.
          </p>
        </section>

        <section className="border-y border-black/10 py-14" style={{ backgroundColor: "var(--brand-soft)" }}>
          <div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <p className="sans text-xs font-semibold uppercase tracking-[0.2em] opacity-60" style={{ color: "var(--ink)" }}>
                Pricing & delivery
              </p>
              <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl" style={{ color: "var(--ink)" }}>
                {BRAND.price} once. No subscription, no free trial.
              </h2>
              <p className="sans mt-4 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
                {BRAND.unitLabel} for one photo and one style run, delivered as PNG downloads. There is no free trial
                and no hidden credit system: you pay once, the pack is added to your order, and you use it for the
                run.
              </p>
              <ul className="sans mt-4 space-y-2 text-sm" style={{ color: "var(--ink)" }}>
                {BRAND.features.map((feature) => (
                  <li key={feature}>· {feature}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white/75 p-6 text-center">
              <p className="sans text-xs uppercase tracking-[0.16em] opacity-60" style={{ color: "var(--ink)" }}>
                One-time pack
              </p>
              <p className="mt-2 font-serif text-5xl font-bold" style={{ color: "var(--ink)" }}>
                {BRAND.price}
              </p>
              <p className="sans mt-1 text-sm opacity-70" style={{ color: "var(--ink)" }}>
                {BRAND.unitLabel}
              </p>
              <Link
                href="/pricing"
                className="sans mt-5 inline-block rounded-full px-6 py-3 text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--brand)" }}
              >
                See what is included
              </Link>
              <p className="sans mt-3 text-[11px] leading-relaxed opacity-60" style={{ color: "var(--ink)" }}>
                Payments handled by Waffo. See the <Link href="/refund" className="underline underline-offset-2">refund policy</Link> for
                failed deliveries.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 py-14">
          <h2 className="font-serif text-3xl font-bold" style={{ color: "var(--ink)" }}>
            What this is — and what it is not
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/10 bg-white/60 p-5">
              <h3 className="sans text-sm font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--brand)" }}>
                It is
              </h3>
              <p className="sans mt-2 text-sm leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
                {BRAND.kind === "landscape"
                  ? "A fast way to visualise planting, paving and lighting directions from your own photo, so you can brief a landscaper with pictures instead of adjectives."
                  : "A fast way to compare hair colours on your own face, so you can walk into a salon with a reference image instead of a colour swatch."}
              </p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white/60 p-5">
              <h3 className="sans text-sm font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--brand)" }}>
                It is not
              </h3>
              <p className="sans mt-2 text-sm leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
                {BRAND.kind === "landscape"
                  ? "A construction drawing, planting plan, permit document, drainage design or cost estimate. Those require a qualified local professional who has seen the site."
                  : "A guarantee of how a specific dye will process on your hair, or medical or dermatological advice. Your stylist decides what is achievable and safe for your hair."}
              </p>
            </div>
          </div>
          <p className="sans mt-6 text-sm leading-relaxed opacity-70" style={{ color: "var(--ink)" }}>
            AI image editing can invent details or make small mistakes. If a delivery is unusable, read the{" "}
            <Link href="/refund" className="underline underline-offset-2">
              refund and re-run policy
            </Link>{" "}
            and contact{" "}
            <a href={`mailto:${BRAND.supportEmail}`} className="underline underline-offset-2">
              {BRAND.supportEmail}
            </a>{" "}
            with your order ID.
          </p>
        </section>

        <section className="border-t border-black/10 py-14">
          <div className="mx-auto max-w-4xl px-5">
            <h2 className="font-serif text-3xl font-bold" style={{ color: "var(--ink)" }}>
              Frequently asked questions
            </h2>
            <div className="mt-6 divide-y divide-black/10 rounded-2xl border border-black/10 bg-white/60">
              {FAQS.map((faq) => (
                <details key={faq.q} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                    <span className="sans text-sm font-semibold sm:text-base" style={{ color: "var(--ink)" }}>
                      {faq.q}
                    </span>
                    <span
                      aria-hidden="true"
                      className="sans mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full border border-black/15 text-sm transition-transform group-open:rotate-45"
                      style={{ color: "var(--ink)" }}
                    >
                      +
                    </span>
                  </summary>
                  <p className="sans mt-3 text-sm leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 pb-20 pt-6">
          <div className="rounded-3xl border border-black/10 p-8 text-center sm:p-12" style={{ backgroundColor: "var(--brand-soft)" }}>
            <h2 className="font-serif text-3xl font-bold" style={{ color: "var(--ink)" }}>
              {BRAND.kind === "landscape" ? "See your yard before you dig." : "See the colour before the salon."}
            </h2>
            <p className="sans mx-auto mt-3 max-w-xl text-sm leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
              {BRAND.unitLabel} for {BRAND.price}, one-time. Upload a photo, pick a style and download the concepts.
              No subscription, no free trial.
            </p>
            <div className="sans mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="#studio"
                className="rounded-full px-6 py-3 text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--brand)" }}
              >
                Start with a photo
              </Link>
              <Link href="/pricing" className="rounded-full border border-black/15 px-6 py-3 text-sm font-semibold" style={{ color: "var(--ink)" }}>
                Pricing & delivery
              </Link>
            </div>
            <p className="sans mt-4 text-xs leading-relaxed opacity-60" style={{ color: "var(--ink)" }}>
              By uploading you confirm you have the right to use the photo.{" "}
              <Link href="/terms" className="underline underline-offset-2">
                Terms
              </Link>{" "}
              ·{" "}
              <Link href="/privacy" className="underline underline-offset-2">
                Privacy
              </Link>
            </p>
          </div>
        </section>
      </main>
      <StickyCta />
    </SiteChrome>
  );
}
