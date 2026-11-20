import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brands";
import { SiteChrome } from "@/components/SiteChrome";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `Refund & Re-run Policy — ${BRAND.name}`,
  description:
    BRAND.kind === "landscape"
      ? "When YardCanvas refunds or re-runs a $9 landscape pack: failed runs, missing images, unusable outputs, duplicate charges, and how to request it."
      : "When HueMirror refunds or re-runs a $4.90 hair-colour pack: failed runs, missing images, distorted outputs, duplicate charges, and how to request it.",
  path: "/refund",
});

const UPDATED = "November 20, 2026";

export default function RefundPage() {
  const images = BRAND.kind === "landscape" ? "landscape concepts" : "hair-colour looks";
  return (
    <SiteChrome brand={BRAND}>
      <main className="mx-auto max-w-3xl px-5 py-14 md:py-20">
        <p className="sans text-xs font-semibold uppercase tracking-[0.2em] opacity-60" style={{ color: "var(--ink)" }}>
          Legal
        </p>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: "var(--ink)" }}>
          Refund &amp; Re-run Policy — {BRAND.name}
        </h1>
        <p className="sans mt-3 text-xs uppercase tracking-[0.16em] opacity-50" style={{ color: "var(--ink)" }}>
          Last updated: {UPDATED}
        </p>
        <p className="sans mt-6 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
          {BRAND.name} sells one thing: a one-time {BRAND.price} pack that should return {BRAND.unitLabel} from one
          photo. This page explains what happens when that delivery does not work. It is a plain-language policy for a
          new service and has not been through a formal legal review.
        </p>

        <section className="mt-10">
          <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--ink)" }}>
            1. The promise
          </h2>
          <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            A paid run should return four {images} in the style or shade you selected, available as JPG downloads in
            the result panel. If the run fails, returns fewer than four images, or returns images that are unusable as a
            reference, we will re-run the generation or refund the pack.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--ink)" }}>
            2. When we refund or re-run
          </h2>
          <ul className="sans mt-3 space-y-2 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            <li>· The AI run failed or was canceled, and no images were delivered.</li>
            <li>· The run completed but delivered fewer than the four images the pack promises.</li>
            <li>
              · The images are unusable because of a serious error — for example{" "}
              {BRAND.kind === "landscape"
                ? "the house was removed or rebuilt in every concept, the image is corrupted, or the output is blank."
                : "the face is visibly distorted in every look, the hair is missing, or the output is corrupted or blank."}
            </li>
            <li>· You were charged twice for the same pack, or charged but the pack never appeared on your order.</li>
            <li>· You were charged incorrectly and the order cannot be fixed.</li>
          </ul>
          <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            Where the problem is technical, we will usually offer a free re-run first because it is faster than a refund.
            If the re-run still fails, choose a refund.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--ink)" }}>
            3. What is not covered
          </h2>
          <ul className="sans mt-3 space-y-2 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            <li>
              · Change of mind after a successful delivery. This is a one-time digital product; once four usable images
              are delivered, the pack has been fulfilled.
            </li>
            <li>
              · Not liking a particular style or shade choice. The styles are described on the site before purchase; a
              different style requires another pack.
            </li>
            <li>
              · An unsuitable input photo (blurry, dark, cropped, no {BRAND.kind === "landscape" ? "yard" : "face"} visible,
              or a photo of the wrong subject). The upload guidance explains what works best.
            </li>
            <li>· Third-party costs such as a landscaper or salon appointment made after using the images.</li>
            <li>· Accounts or orders involved in fraud, abuse or a violation of the terms.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--ink)" }}>
            4. How to request a refund
          </h2>
          <ol className="sans mt-3 list-decimal space-y-2 pl-5 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            <li>
              Email{" "}
              <a href={`mailto:${BRAND.supportEmail}`} className="underline underline-offset-2">
                {BRAND.supportEmail}
              </a>{" "}
              within 14 days of the charge.
            </li>
            <li>Include the order ID, the email used at checkout, and a short description or screenshot of the problem.</li>
            <li>We reply within 1–2 business days and, where appropriate, offer a free re-run first.</li>
            <li>
              Approved refunds are issued by Waffo, our merchant of record, back to the original payment method. They
              usually appear within 5–10 business days, depending on your bank.
            </li>
          </ol>
          <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            Please contact us before filing a chargeback. A chargeback can freeze the order while it is investigated,
            and we can usually resolve the issue faster directly.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--ink)" }}>
            5. No subscription, no recurring billing
          </h2>
          <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            The pack is a single charge. There is no subscription, no trial and no auto-renewal, so there is nothing to
            cancel. If you see a second charge you did not intend, email us — duplicate charges are refunded.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--ink)" }}>
            6. Changes and contact
          </h2>
          <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            We may update this policy as the product changes; the date at the top shows the current version. Refund
            questions and delivery problems:{" "}
            <a href={`mailto:${BRAND.supportEmail}`} className="underline underline-offset-2">
              {BRAND.supportEmail}
            </a>
            . See also the{" "}
            <Link href="/pricing" className="underline underline-offset-2">
              pricing and delivery details
            </Link>{" "}
            and the{" "}
            <Link href="/terms" className="underline underline-offset-2">
              terms of service
            </Link>
            .
          </p>
        </section>
      </main>
    </SiteChrome>
  );
}
