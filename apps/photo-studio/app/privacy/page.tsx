import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brands";
import { SiteChrome } from "@/components/SiteChrome";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `Privacy Policy — ${BRAND.name}`,
  description:
    BRAND.kind === "landscape"
      ? "How YardCanvas handles the yard photo you upload: what is stored, which processors generate the concepts, how long files are kept, and how to request deletion."
      : "How HueMirror handles the selfie you upload: what is stored, which processors generate the looks, how long files are kept, and how to request deletion.",
  path: "/privacy",
});

const UPDATED = "November 20, 2026";

export default function PrivacyPage() {
  const photo = BRAND.kind === "landscape" ? "yard photo" : "selfie";
  return (
    <SiteChrome brand={BRAND}>
      <main className="mx-auto max-w-3xl px-5 py-14 md:py-20">
        <p className="sans text-xs font-semibold uppercase tracking-[0.2em] opacity-60" style={{ color: "var(--ink)" }}>
          Legal
        </p>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: "var(--ink)" }}>
          Privacy Policy — {BRAND.name}
        </h1>
        <p className="sans mt-3 text-xs uppercase tracking-[0.16em] opacity-50" style={{ color: "var(--ink)" }}>
          Last updated: {UPDATED}
        </p>
        <p className="sans mt-6 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
          This page explains, in plain language, what {BRAND.name} does with a {photo} and with the order data created
          when you buy a pack. It describes our current product practices. It is product copy, not legal advice, and it
          has not been through a formal legal review yet — if you need a data-processing agreement for a business use,
          contact us first.
        </p>

        <section className="mt-10">
          <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--ink)" }}>
            1. Who we are
          </h2>
          <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            {BRAND.legalName} is a small independent product team operating the AI {BRAND.kind === "landscape" ? "landscape concept" : "hair-colour try-on"} tool on this
            site. We do not run a photo-sharing network and we do not sell images. Payments are processed by Waffo as
            merchant of record.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--ink)" }}>
            2. What we collect
          </h2>
          <ul className="sans mt-3 space-y-2 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            <li>
              · The {photo} you upload, plus basic file metadata such as filename, size and upload time.
            </li>
            <li>· Job data: a job ID, progress, timestamps and output file references.</li>
            <li>
              · Order data: order ID, plan ID, amount, payment status and, if your payment provider passes it, the
              email used at checkout.
            </li>
            <li>· Technical logs needed to run and protect the service, such as request timestamps and error traces.</li>
            <li>
              · A small localStorage value in your browser (your paid order ID) so the tool can unlock the pack you
              bought.
            </li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--ink)" }}>
            3. How your photo is used
          </h2>
          <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            Your {photo} is used for one purpose: producing the {BRAND.unitLabel} you paid for. To do that it is sent to
            our AI image provider, which runs an image-editing model and returns the generated images. The photo is not
            published, not shown to other users, not used to train a model, and not sold.
          </p>
          <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            We do not build a public gallery from customer uploads, and we do not use customer photos in marketing
            without a separate, explicit permission request.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--ink)" }}>
            4. How long files are kept
          </h2>
          <ul className="sans mt-3 space-y-2 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            <li>
              · <strong>Working uploads:</strong> removed from short-lived storage after processing, normally within
              24–48 hours.
            </li>
            <li>
              · <strong>Generated images:</strong> kept long enough to deliver your download links. Links are
              time-limited; re-open the tool with your paid order while the files are still retained if you need them
              again.
            </li>
            <li>
              · <strong>Order records:</strong> kept for support, fraud prevention and accounting for longer than the
              images. These records contain the order ID, plan and payment status, not the photo itself.
            </li>
            <li>
              · <strong>Email and support threads:</strong> kept while the support case is open and for a reasonable
              period afterwards.
            </li>
          </ul>
          <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            You can request earlier deletion of a specific job&apos;s files by emailing{" "}
            <a href={`mailto:${BRAND.supportEmail}`} className="underline underline-offset-2">
              {BRAND.supportEmail}
            </a>{" "}
            with the order ID.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--ink)" }}>
            5. Processors we rely on
          </h2>
          <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            Like most small online tools, we use infrastructure providers rather than running everything ourselves.
            Depending on the deployment, a photo may be handled by:
          </p>
          <ul className="sans mt-3 space-y-2 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            <li>· an AI inference provider (for example Replicate) to run the image-edit model;</li>
            <li>· a hosting and object-storage provider (for example Cloudflare) to serve the site and store files temporarily;</li>
            <li>· a database provider to keep order/job records;</li>
            <li>· Waffo, our merchant of record, to process payment and tax.</li>
          </ul>
          <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            These providers process data on our instructions. They may process it outside your country; we rely on
            their standard data-processing terms.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--ink)" }}>
            6. Cookies and local storage
          </h2>
          <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            The site uses only what it needs to function: a localStorage order reference so checkout can unlock the
            tool, and basic security/technical logs. We do not use advertising cookies or sell personal data to data
            brokers. If we add product analytics later, this page will say what it measures before it ships.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--ink)" }}>
            7. Your rights
          </h2>
          <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            Depending on where you live, you may have the right to ask what personal data we hold, request a copy,
            correct it, or ask us to delete it. Email{" "}
            <a href={`mailto:${BRAND.supportEmail}`} className="underline underline-offset-2">
              {BRAND.supportEmail}
            </a>{" "}
            with the order ID (and the email used at checkout, if you have it). We aim to respond within 30 days. Because
            generated files may be deleted automatically on a short lifecycle, send deletion requests promptly if you
            need a specific job removed.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--ink)" }}>
            8. Photos of other people, minors and public figures
          </h2>
          <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            Upload only a photo you have the right to use.{" "}
            {BRAND.kind === "haircolor"
              ? "For hair-colour edits that means your own selfie, or a photo of an adult who has clearly agreed to this use. Do not upload photos of minors or public figures."
              : "For yard edits that means a property photo you own or are authorised to edit. Do not upload photos of identifiable people who have not consented to appearing in an AI edit."}{" "}
            We may remove content and block access if we receive a credible complaint.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--ink)" }}>
            9. Changes and contact
          </h2>
          <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            If these practices change materially, we will update this page and the date at the top. Questions or
            deletion requests:{" "}
            <a href={`mailto:${BRAND.supportEmail}`} className="underline underline-offset-2">
              {BRAND.supportEmail}
            </a>
            . See also the{" "}
            <Link href="/terms" className="underline underline-offset-2">
              terms of service
            </Link>{" "}
            and{" "}
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
