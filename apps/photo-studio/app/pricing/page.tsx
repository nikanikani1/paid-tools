import type { Metadata } from "next";
import Link from "next/link";
import { HAIR_PLANS, LANDSCAPE_PLANS } from "@paid/core";
import { BRAND } from "@/lib/brands";
import { BuyButton } from "@/components/BuyButton";
import { SiteChrome } from "@/components/SiteChrome";
import { breadcrumbJsonLd, buildMetadata, faqPageJsonLd, graphSchema, productJsonLd, type FaqItem } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title:
    BRAND.kind === "landscape"
      ? "Pricing — $9 for Four AI Landscape Concepts"
      : "Pricing — $4.90 for Four AI Hair-Colour Looks",
  description:
    BRAND.kind === "landscape"
      ? "One pack, one price: $9 for four AI landscape design concepts from your yard photo. One-time payment, no subscription, delivery and refund terms explained."
      : "One pack, one price: $4.90 for four AI hair-colour looks from your selfie. One-time payment, no subscription, delivery and refund terms explained.",
  path: "/pricing",
});

const PLAN = BRAND.kind === "landscape" ? LANDSCAPE_PLANS[0] : HAIR_PLANS[0];

const FAQS: FaqItem[] =
  BRAND.kind === "landscape"
    ? [
        {
          q: "What is included in the $9 pack?",
          a: "One landscape-style run on one uploaded yard photo, returning four concept images as JPG downloads. The pack is a one-time purchase, not a subscription, and it is the only plan currently on sale.",
        },
        {
          q: "Can I generate more than one style from one pack?",
          a: "One pack covers one run in one selected style. If you want to compare two directions side by side, buy another pack for the second style — that keeps the pricing honest instead of advertising an unlimited plan the pipeline cannot deliver.",
        },
        {
          q: "What if the images are unusable?",
          a: "If the run fails, returns fewer than four images, or produces images with serious artifacts that make them unusable as a design reference, contact support with the order ID within 14 days. We will re-run the generation or refund the pack. See the refund policy for the exact conditions.",
        },
        {
          q: "Are these construction drawings?",
          a: "No. The images are visual concepts for planning and mood boards. They do not include measurements, plant schedules, drainage, permits or cost estimates, and they are not a substitute for a qualified landscape professional.",
        },
      ]
    : [
        {
          q: "What is included in the $4.90 pack?",
          a: "One shade-family run on one uploaded selfie, returning four hair-colour looks as JPG downloads with different lighting. The pack is a one-time purchase, not a subscription, and it is the only plan currently on sale.",
        },
        {
          q: "Can I try several colours with one pack?",
          a: "One pack covers one run in one selected shade family. If you want to compare two colours, buy another pack for the second shade — that is cheaper and clearer than inventing an unlimited plan.",
        },
        {
          q: "What if the edit looks wrong?",
          a: "If the run fails, returns fewer than four images, or the face is visibly distorted in every output, contact support with the order ID within 14 days. We will re-run the generation or refund the pack. See the refund policy for details.",
        },
        {
          q: "Is the result a guarantee of my salon colour?",
          a: "No. It is a visual reference generated from one photo. Your stylist's dye, your hair history and aftercare all affect the final result; the image helps the conversation, it does not replace professional advice.",
        },
      ];

export default function PricingPage() {
  const schema = graphSchema(
    productJsonLd({
      name: `${BRAND.name} — ${PLAN.name}`,
      description: `${BRAND.unitLabel} from one photo for ${BRAND.price}, one-time payment.`,
      path: "/pricing",
    }),
    faqPageJsonLd(FAQS),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Pricing", path: "/pricing" },
    ]),
  );

  return (
    <SiteChrome brand={BRAND}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <main>
        <section className="mx-auto max-w-3xl px-5 pb-10 pt-12 text-center md:pt-20">
          <p className="sans text-xs font-semibold uppercase tracking-[0.2em] opacity-60" style={{ color: "var(--ink)" }}>
            Pricing
          </p>
          <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: "var(--ink)" }}>
            {BRAND.kind === "landscape" ? "Pricing — $9 for Four AI Landscape Concepts" : "Pricing — $4.90 for Four AI Hair-Colour Looks"}
          </h1>
          <p className="sans mx-auto mt-4 max-w-xl leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            One pack, one price, one-time payment. No subscription, no free trial and no plans that do not exist yet.
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-5 pb-14">
          <div className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-start">
            <div className="rounded-3xl border-2 p-6 sm:p-8" style={{ borderColor: "var(--brand)", backgroundColor: "var(--brand-soft)" }}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--ink)" }}>
                  {PLAN.name}
                </h2>
                <span className="sans rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>
                  Only pack on sale
                </span>
              </div>
              <p className="mt-4 font-serif text-5xl font-bold" style={{ color: "var(--ink)" }}>
                {BRAND.price}
                <span className="sans ml-2 text-sm font-normal opacity-60">one-time</span>
              </p>
              <p className="sans mt-1 text-sm opacity-70" style={{ color: "var(--ink)" }}>
                {BRAND.unitLabel} · {PLAN.images} images per run
              </p>
              <ul className="sans mt-5 space-y-2 text-sm" style={{ color: "var(--ink)" }}>
                {PLAN.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5">
                    <span aria-hidden="true" style={{ color: "var(--brand)" }}>
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
                <li className="flex gap-2.5">
                  <span aria-hidden="true" style={{ color: "var(--brand)" }}>
                    ✓
                  </span>
                  <span>One-time payment via Waffo</span>
                </li>
              </ul>
              <div className="mt-6">
                <BuyButton planId={BRAND.planId}>Buy the pack — {BRAND.price}</BuyButton>
              </div>
              <p className="sans mt-3 text-center text-[11px] leading-relaxed opacity-60" style={{ color: "var(--ink)" }}>
                Price is charged once. No auto-renewal. Checkout opens in Waffo's hosted page.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-black/10 bg-white/65 p-5">
                <h3 className="sans text-sm font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--brand)" }}>
                  Delivery
                </h3>
                <p className="sans mt-2 text-sm leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
                  After payment, the pack is attached to your order and unlocked in this browser. Upload your photo,
                  choose a style and start the run. The four generated JPGs appear in the result panel when the run
                  finishes — typically within a few minutes, depending on queue.
                </p>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white/65 p-5">
                <h3 className="sans text-sm font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--brand)" }}>
                  Refunds
                </h3>
                <p className="sans mt-2 text-sm leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
                  If a paid run fails, delivers fewer than four images, or returns images that are unusable as a
                  reference, contact support within 14 days with the order ID. We will re-run or refund. This is a
                  one-time digital pack, so we cannot offer refunds for change of mind after a successful delivery.
                  Read the{" "}
                  <Link href="/refund" className="underline underline-offset-2">
                    refund policy
                  </Link>
                  .
                </p>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white/65 p-5">
                <h3 className="sans text-sm font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--brand)" }}>
                  Not included
                </h3>
                <ul className="sans mt-2 space-y-1.5 text-sm leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
                  <li>· No subscription, credits or monthly plan.</li>
                  <li>· No free trial or free sample image.</li>
                  <li>
                    ·{" "}
                    {BRAND.kind === "landscape"
                      ? "No construction drawings, plant schedules, permits or cost estimates."
                      : "No guarantee of a specific salon dye result, and no medical advice."}
                  </li>
                  <li>· No other packs are on sale; this is the only plan the product supports today.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-black/10 py-14" style={{ backgroundColor: "var(--brand-soft)" }}>
          <div className="mx-auto max-w-4xl px-5">
            <h2 className="font-serif text-3xl font-bold" style={{ color: "var(--ink)" }}>
              What you can do with the images
            </h2>
            <p className="sans mt-4 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
              {BRAND.kind === "landscape"
                ? "Use the concepts for your own planning, mood boards and conversations with a landscaper or contractor. The pack is sold as a design reference; it does not grant rights to any third-party photo or design you did not create. If you plan to publish the renders commercially, read the terms first."
                : "Use the looks as a personal reference, in messages to your stylist, or in private mood boards. They are not a licence to present AI edits as a real photograph of a real service result. If you plan to publish them commercially, read the terms first."}
            </p>
            <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
              AI image models are probabilistic: two runs on the same photo may differ, and a small number of outputs
              can contain artifacts. That is why the delivery policy focuses on re-runs and refunds for failed
              deliveries instead of promising a perfect first result.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-14">
          <h2 className="font-serif text-3xl font-bold" style={{ color: "var(--ink)" }}>
            Pack questions
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
          <p className="sans mt-6 text-sm leading-relaxed opacity-70" style={{ color: "var(--ink)" }}>
            Already paid and looking for the files? Open the{" "}
            <Link href="/orders" className="underline underline-offset-2">
              order lookup
            </Link>{" "}
            with your order ID, or read the{" "}
            <Link href="/refund" className="underline underline-offset-2">
              refund policy
            </Link>
            .
          </p>
        </section>
      </main>
    </SiteChrome>
  );
}
