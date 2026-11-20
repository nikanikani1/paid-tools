import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brands";
import { SiteChrome } from "@/components/SiteChrome";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `Terms of Service — ${BRAND.name}`,
  description:
    BRAND.kind === "landscape"
      ? "The rules for using YardCanvas: photo rights, acceptable use, AI output limitations, payments, copyright complaints and liability."
      : "The rules for using HueMirror: selfie rights and consent, acceptable use, AI output limitations, payments, copyright complaints and liability.",
  path: "/terms",
});

const UPDATED = "November 20, 2026";

export default function TermsPage() {
  const isLandscape = BRAND.kind === "landscape";
  return (
    <SiteChrome brand={BRAND}>
      <main className="mx-auto max-w-3xl px-5 py-14 md:py-20">
        <p className="sans text-xs font-semibold uppercase tracking-[0.2em] opacity-60" style={{ color: "var(--ink)" }}>
          Legal
        </p>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: "var(--ink)" }}>
          Terms of Service — {BRAND.name}
        </h1>
        <p className="sans mt-3 text-xs uppercase tracking-[0.16em] opacity-50" style={{ color: "var(--ink)" }}>
          Last updated: {UPDATED}
        </p>
        <p className="sans mt-6 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
          These terms govern your use of {BRAND.name}. By uploading a photo or buying a pack you agree to them. They are
          written in plain language for a small paid tool; they are not legal advice and have not been through a formal
          legal review yet.
        </p>

        <section className="mt-10">
          <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--ink)" }}>
            1. The service
          </h2>
          <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            {BRAND.name} generates {BRAND.unitLabel} from one photo using an AI image-editing model. One pack is a
            one-time purchase covering one photo and one style run. The service is browser-based; no desktop software
            is installed. We do not sell subscriptions, credits or any other pack today — the single pack listed on the
            pricing page is the only plan on sale.
          </p>
          <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            {isLandscape
              ? "The generated images are concept visuals for design planning. They are not construction drawings, planting plans, permits, drainage designs, cost estimates or professional landscape advice."
              : "The generated images are visual references for a hair-colour conversation. They are not a guarantee of how a specific dye will process, and they are not medical, dermatological or professional styling advice."}
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--ink)" }}>
            2. Your photo and the rights you need
          </h2>
          <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            You keep the rights you hold in the photo you upload. You grant us a limited licence to store, process and
            transmit the photo only to generate and deliver your images; that licence ends when the files are deleted.
          </p>
          <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            You must own the photo or have permission to use and edit it.{" "}
            {isLandscape
              ? "Do not upload photos taken by someone else without permission, listings you are not authorised to edit, or photos of identifiable people who have not consented."
              : "Upload only your own selfie, or a photo of an adult who has clearly agreed to this use. Do not upload photos of minors, ex-partners or public figures without consent."}
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--ink)" }}>
            3. Acceptable use
          </h2>
          <ul className="sans mt-3 space-y-2 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            <li>· Do not use the service for illegal, deceptive, harassing or non-consensual content.</li>
            <li>· Do not create images intended to impersonate or misrepresent a real person in a harmful way.</li>
            <li>· Do not upload photos of minors or of people who have not consented.</li>
            <li>· Do not attempt to bypass payment, abuse free infrastructure, scrape the site or resell the service.</li>
            <li>· Do not use outputs to advertise a real renovation, a real salon result or a real product unless it is accurate and you have the right to do so.</li>
            <li>· Do not upload malicious files or attempt to interfere with the service.</li>
          </ul>
          <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            We may suspend or block access if we detect abuse, and we may remove content where the law requires it.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--ink)" }}>
            4. AI output is not guaranteed
          </h2>
          <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            AI image editing is probabilistic. Results vary with the photo, the model and the random seed, and a small
            number of outputs can contain artifacts.{" "}
            {isLandscape
              ? "The model is instructed to keep the house and hardscape fixed, but it can still move or invent details."
              : "The model is instructed to preserve your face, but it can still alter small facial details."}{" "}
            You are responsible for reviewing the images before relying on them, and for any decision you make based on
            them.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--ink)" }}>
            5. Payments and refunds
          </h2>
          <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            Payments are processed by Waffo as merchant of record, which handles card processing, invoices and
            applicable sales tax. The pack is a one-time charge; nothing renews automatically. Refunds and re-runs are
            governed by the{" "}
            <Link href="/refund" className="underline underline-offset-2">
              refund policy
            </Link>
            . If a payment is declined or a charge looks wrong, contact us before filing a chargeback so we can fix it
            faster.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--ink)" }}>
            6. Intellectual property and your outputs
          </h2>
          <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            The site, its design and its text belong to {BRAND.legalName}. The AI model remains under its own licence.
            You keep the rights you hold in your input photo.
          </p>
          <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            {isLandscape
              ? "The landscape pack is sold with commercial use of the generated concept images as design references, subject to your rights in the input photo. You may not resell the images as stock photos or present them as the work of another designer."
              : "Hair-colour outputs are licensed for your personal reference and non-commercial sharing with a stylist. For any commercial use, contact us first — the pack does not include a commercial licence."}{" "}
            Do not use generated images in a way that misleads people about a real service, property or person.
          </p>
        </section>

        <section id="dmca" className="mt-8 scroll-mt-24">
          <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--ink)" }}>
            7. Copyright complaints and DMCA
          </h2>
          <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            We respect copyright and expect users to do the same. If you believe content processed through the service
            infringes your rights, email{" "}
            <a href={`mailto:${BRAND.supportEmail}`} className="underline underline-offset-2">
              {BRAND.supportEmail}
            </a>{" "}
            with the subject line &ldquo;Copyright complaint&rdquo;, including: identification of the work,
            identification of the material and where it appears, your contact details, a good-faith statement, a
            statement under penalty of perjury that the information is accurate and that you are authorised to act, and
            your signature. We will review valid notices and remove or disable access where appropriate.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--ink)" }}>
            8. Disclaimers and limitation of liability
          </h2>
          <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            The service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. We do not warrant
            that generation will always succeed, that outputs will be free of artifacts, or that the images are
            suitable for a particular professional purpose. To the maximum extent permitted by law, we are not liable
            for indirect, incidental or consequential damages, or for losses resulting from decisions made using
            generated images. Our total liability for a claim is limited to the amount you paid for the pack, or $50 if
            you have not paid anything.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--ink)" }}>
            9. Changes, termination and contact
          </h2>
          <p className="sans mt-3 leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            We may update these terms as the product changes; the date at the top shows when the current version took
            effect. You can stop using the service at any time. We may suspend access for violations of these terms or
            where required by law. Questions:{" "}
            <a href={`mailto:${BRAND.supportEmail}`} className="underline underline-offset-2">
              {BRAND.supportEmail}
            </a>
            . See also the{" "}
            <Link href="/privacy" className="underline underline-offset-2">
              privacy policy
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
