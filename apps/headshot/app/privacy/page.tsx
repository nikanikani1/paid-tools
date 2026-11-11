import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, JsonLd, Prose, Section } from "../components/ui";
import { SITE_NAME, SITE_URL } from "../lib/site";
import { breadcrumbJsonLd, buildMetadata } from "../lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy — Face Photos, Retention and Deletion",
  description:
    "How PortraitLab handles the selfies you upload: what we collect, which processors see the images, the 30-day deletion window, and how to request earlier deletion.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <main>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Privacy", path: "/privacy" },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Privacy", path: "/privacy" },
        ]}
      />
      <section className="mx-auto max-w-6xl px-6 pb-2 pt-8">
        <p className="sans text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">Legal</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">Privacy Policy</h1>
        <p className="sans mt-3 text-sm text-stone-500">Last updated: 11 November 2026</p>
      </section>
      <Section>
        <Prose>
          <p>
            {SITE_NAME} generates AI headshots from photographs you upload. Because those photographs contain faces,
            this policy is written to be specific about what happens to them rather than to hide behind generic
            language. If anything here is unclear, email us and we will answer in plain language.
          </p>

          <h3>1. Who we are</h3>
          <p>
            {SITE_NAME} operates the AI headshot generator at {SITE_URL}. We are the data controller for the personal
            data described in this policy. Contact: support@portraitlab.example.
          </p>

          <h3>2. What we collect</h3>
          <ul>
            <li>
              <strong>Photos you upload.</strong> Three to eight selfies per order, plus any files you re-upload after a
              quality-gate rejection.
            </li>
            <li>
              <strong>Order details.</strong> Package purchased, style preset, order identifier, timestamps and status.
            </li>
            <li>
              <strong>Email address.</strong> Used to send the delivery link, order receipts and, if you opt in, product
              updates. Unsubscribe is one click.
            </li>
            <li>
              <strong>Payment data.</strong> Handled entirely by our merchant of record. We receive a confirmation and
              the last four digits; we never see or store full card numbers.
            </li>
            <li>
              <strong>Technical data.</strong> IP address, browser and device information, and server logs used for
              fraud prevention and debugging.
            </li>
            <li>
              <strong>Cookies.</strong> A small number of essential cookies for session and fraud prevention. Analytics,
              if enabled, is aggregate and does not include your photos.
            </li>
          </ul>

          <h3>3. How we use your data</h3>
          <ul>
            <li>To render your order: the photos are passed to the generation pipeline and the results returned to you.</li>
            <li>To deliver files: storing the outputs so you can download them and re-download them for 30 days.</li>
            <li>To process payment and issue receipts, via the merchant of record.</li>
            <li>To handle redo and refund requests.</li>
            <li>To prevent abuse, including attempts to generate images of other people or public figures.</li>
          </ul>
          <p>
            <strong>We do not use your photos to train models.</strong> We do not sell them, publish them, or use them in
            marketing material. We do not create a face template that persists after your order is deleted.
          </p>

          <h3>4. Legal bases (EEA/UK visitors)</h3>
          <p>
            We rely on contract necessity to process your photos and order data in order to deliver what you purchased;
            on legitimate interests for fraud prevention and service security; on consent for optional marketing emails;
            and on legal obligation for tax and accounting records.
          </p>

          <h3>5. Photo and face data — the short version</h3>
          <ul>
            <li>Photos are used only for the order they were uploaded for.</li>
            <li>They are not used for model training, fine-tuning or benchmark datasets.</li>
            <li>Originals and generated outputs are deleted from storage 30 days after delivery.</li>
            <li>Earlier deletion is available on request at any time from your order email.</li>
            <li>
              We refuse orders for photos of public figures, photos of minors, and photos uploaded by someone who is not
              the person in them (or does not have that person&apos;s permission).
            </li>
          </ul>

          <h3>6. Processors we share data with</h3>
          <p>We use a small number of vendors, each for a specific job:</p>
          <ul>
            <li>
              <strong>Inference providers</strong> (fal and Replicate) receive the uploaded photos and prompts in order
              to generate and merge the images. Both are contracted for commercial use of the models we call.
            </li>
            <li>
              <strong>Object storage</strong> (Cloudflare R2) holds uploaded photos and generated files for the 30-day
              window.
            </li>
            <li>
              <strong>Merchant of record</strong> (Waffo) processes payment and stores billing data under its own privacy
              policy.
            </li>
            <li>
              <strong>Email delivery</strong> (Resend) sends order and delivery emails.
            </li>
            <li>
              <strong>Anti-abuse</strong> (Cloudflare Turnstile) distinguishes humans from bots at upload time.
            </li>
          </ul>
          <p>
            We do not share photos with advertising networks or data brokers, and we do not permit any processor to use
            your photos for its own model training.
          </p>

          <h3>7. International transfers</h3>
          <p>
            Our providers operate in the United States and the European Union. Where data leaves your region we rely on
            standard contractual clauses or an equivalent transfer mechanism offered by the processor.
          </p>

          <h3>8. Retention</h3>
          <ul>
            <li>Photos and generated files: deleted 30 days after delivery, or earlier on request.</li>
            <li>Order records (order ID, email, amount, package): retained for accounting and tax purposes.</li>
            <li>Server logs: retained for a short operational window for security and debugging.</li>
            <li>Marketing email subscription: until you unsubscribe.</li>
          </ul>

          <h3>9. Your rights</h3>
          <p>
            Depending on where you live you may have the right to access, correct, export or delete your data, to object
            to certain processing, and to withdraw consent for marketing. To exercise any of them, email
            support@portraitlab.example with the order identifier. We respond within 30 days and do not charge for the
            first request. If you are in the EEA or UK you also have the right to complain to your local data protection
            authority.
          </p>

          <h3>10. Security</h3>
          <p>
            Uploads travel over TLS, files are stored in private buckets with time-limited access links, and access to
            production systems is restricted to the small number of people who operate the service. No online service can
            promise perfect security; we can promise that photo data is not used for anything other than delivering your
            order.
          </p>

          <h3>11. Children</h3>
          <p>
            The service is for adults. We do not knowingly process photos of anyone under 18 and will refuse and delete
            any order that appears to involve a minor.
          </p>

          <h3>12. Changes</h3>
          <p>
            If this policy changes materially — for example a new processor or a different retention period — we will
            update this page and the date at the top. Continued use after a change means you accept the updated policy.
          </p>
          <p>
            Related: <Link href="/terms">Terms of service</Link>, <Link href="/refund">refund and redo policy</Link>,{" "}
            <Link href="/how-it-works">how the pipeline works</Link>.
          </p>
        </Prose>
      </Section>
    </main>
  );
}
