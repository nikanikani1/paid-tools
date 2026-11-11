import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, JsonLd, Prose, Section } from "../components/ui";
import { SITE_NAME, SITE_URL } from "../lib/site";
import { breadcrumbJsonLd, buildMetadata } from "../lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service — Acceptable Use and Image Licence",
  description:
    "Terms of service for the PortraitLab AI headshot generator: who may use it, the commercial licence you receive, prohibited uploads, payments and liability.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <main>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Terms", path: "/terms" },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Terms", path: "/terms" },
        ]}
      />
      <section className="mx-auto max-w-6xl px-6 pb-2 pt-8">
        <p className="sans text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">Legal</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">Terms of Service</h1>
        <p className="sans mt-3 text-sm text-stone-500">Last updated: 11 November 2026</p>
      </section>
      <Section>
        <Prose>
          <p>
            These terms govern your use of the {SITE_NAME} AI headshot generator at {SITE_URL}. By uploading photos or
            buying a package you agree to them. If you do not agree, do not use the service.
          </p>

          <h3>1. What the service does</h3>
          <p>
            You upload photographs of yourself, choose a style preset and a package, and we generate AI portraits from
            those photographs. The output is a synthetic image, not a photograph, even when it looks like one. Results
            vary with the quality and variety of the source photos, and no specific outcome is guaranteed beyond the
            redo and refund policy.
          </p>

          <h3>2. Who may use it</h3>
          <ul>
            <li>You must be at least 18 years old.</li>
            <li>You must be the person in the photos you upload, or have that person&apos;s explicit permission to use their photos for this purpose.</li>
            <li>
              You may not upload photos of public figures, politicians, celebrities, or anyone whose likeness you do not
              have the right to use. We refuse and delete such orders.
            </li>
            <li>You may not upload photos of anyone under 18.</li>
          </ul>

          <h3>3. Prohibited content and uses</h3>
          <ul>
            <li>Impersonation, fraud, catfishing or identity theft.</li>
            <li>Sexual, nude, suggestive or fetish content; any sexualisation of a real person.</li>
            <li>Harassment, threats, defamation or content intended to harm a named person.</li>
            <li>Political or electioneering material, or endorsement claims you are not authorised to make.</li>
            <li>Documents: passports, ID cards, visas, licences or anything used to misrepresent identity.</li>
            <li>Reselling the generated images as stock photography, or training a competing model on them.</li>
          </ul>
          <p>
            We may refuse, suspend or delete any order that appears to violate these rules, and we may report unlawful
            content where required by law.
          </p>

          <h3>4. Orders and payment</h3>
          <ul>
            <li>
              Packages are one-time purchases: the $9 Sample Pack (5 images), 40 images for $35, 60 for $45 and 100 for
              $75 (USD), as shown on the <Link href="/pricing">pricing page</Link>.
            </li>
            <li>There is no unpaid generation of any kind. Every generated image is part of a paid order.</li>
            <li>Payment is processed by our merchant of record, which handles taxes and issues the receipt.</li>
            <li>
              Generation begins only after payment confirmation. Before checkout is connected, order requests are
              refused with HTTP 402 <code>payment_required</code> rather than producing an unpaid set.
            </li>
            <li>Team orders of ten or more people may be invoiced under separate commercial terms.</li>
          </ul>

          <h3>5. The licence you receive</h3>
          <p>
            On delivery of a paid order we grant you a worldwide, perpetual, non-exclusive, royalty-free licence to use
            the delivered images for personal and commercial purposes: websites, social profiles, company pages,
            brochures, advertisements, articles, presentations and printed material. You may modify and crop them.
          </p>
          <p>You may not:</p>
          <ul>
            <li>resell the images as stock photography or as part of a stock library;</li>
            <li>use the images to train or fine-tune a machine learning model;</li>
            <li>claim the images depict someone other than you, or use them to imply an endorsement you do not have;</li>
            <li>use the images in a way that breaks the prohibited-use rules above.</li>
          </ul>
          <p>
            The $9 Sample Pack is a paid order under the same licence: its five delivered images carry the same
            commercial rights as the larger packages. No image is delivered free of charge, and no watermarked
            evaluation image is produced.
          </p>

          <h3>6. Your photos and intellectual property</h3>
          <p>
            You keep all rights to the photographs you upload and you are responsible for having the right to use them.
            You grant us a limited licence to process and store them only for the purpose of delivering your order, as
            described in the <Link href="/privacy">privacy policy</Link>. Files are deleted 30 days after delivery.
          </p>
          <p>
            We own the service, the pipeline and the generated output before delivery; the licence in section 5 is what
            transfers the usage rights to you.
          </p>

          <h3>7. Redo and refunds</h3>
          <p>
            Every paid order includes one free redo within 48 hours of delivery. Refund eligibility and the conditions
            are set out in the <Link href="/refund">refund and redo policy</Link>, which forms part of these terms.
          </p>

          <h3>8. Availability and changes</h3>
          <p>
            We aim to keep the service available but do not guarantee uninterrupted operation. Providers may be
            unavailable, generation may fail, and features may change. If a machine failure prevents delivery, your order
            is retried and, if the retry fails, refunded.
          </p>

          <h3>9. Disclaimers</h3>
          <p>
            AI generation is probabilistic. We do not warrant that every image will be free of artefacts or that the
            output will resemble you to any particular degree. We do not warrant that the images are suitable for a
            specific legal requirement, such as a passport or visa photo; do not use them for that purpose.
          </p>

          <h3>10. Limitation of liability</h3>
          <p>
            To the maximum extent permitted by law, our total liability arising from an order is limited to the amount
            you paid for that order. We are not liable for indirect or consequential loss, including lost opportunities or
            reputational harm. Nothing in these terms limits liability that cannot be limited by law.
          </p>

          <h3>11. Indemnity</h3>
          <p>
            You agree to indemnify us against claims arising from photos you uploaded without permission, or from uses of
            the generated images that breach these terms.
          </p>

          <h3>12. Third-party providers</h3>
          <p>
            The service depends on third-party inference, storage, payment and email providers. Their outages are outside
            our direct control, and their terms apply to the portion of the service they provide.
          </p>

          <h3>13. Governing law and disputes</h3>
          <p>
            These terms are governed by the laws of the jurisdiction in which the operating entity is registered.
            Before starting a formal dispute, contact support@portraitlab.example — most issues are resolved by a redo or
            a refund.
          </p>

          <h3>14. Changes to these terms</h3>
          <p>
            We may update these terms; material changes will update the date at the top of this page. Orders are governed
            by the terms in effect when the order was placed.
          </p>

          <h3>15. Contact</h3>
          <p>
            Questions about these terms: support@portraitlab.example. Related pages:{" "}
            <Link href="/privacy">privacy</Link>, <Link href="/refund">refund & redo</Link>,{" "}
            <Link href="/pricing">pricing</Link>.
          </p>
        </Prose>
      </Section>
    </main>
  );
}
