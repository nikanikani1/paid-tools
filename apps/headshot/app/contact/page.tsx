import type { Metadata } from "next";
import Link from "next/link";
import { AuthorByline } from "../components/editorial";
import { Breadcrumbs, JsonLd, Prose, Section } from "../components/ui";
import { PRIMARY_AUTHOR, authorPath } from "../lib/authors";
import { CONTACT, CONTENT_UPDATED, SITE_NAME, SITE_URL } from "../lib/site";
import { breadcrumbJsonLd, buildMetadata, canonicalFor } from "../lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact PortraitLab — Support, Billing, Privacy and DMCA",
  description:
    "How to reach PortraitLab: support, billing, privacy and deletion requests, DMCA and legal notices, editorial corrections and press. Email only — no phone line or live chat.",
  path: "/contact",
});

const CHANNELS = [
  {
    channel: "Order support & redos",
    email: CONTACT.support,
    response: "Within 1 business day",
    use: "Missing downloads, failed generation, redo requests, licence questions. Include the order ID from your receipt.",
  },
  {
    channel: "Billing & invoices",
    email: CONTACT.billing,
    response: "Within 2 business days",
    use: "Receipts, refunds, team invoices with a purchase order, tax ID or billing-address changes.",
  },
  {
    channel: "Privacy & data deletion",
    email: CONTACT.privacy,
    response: "Within 30 days, usually much sooner",
    use: "Access, deletion or export of your order data, earlier deletion of uploaded photos, or a GDPR/UK-GDPR request.",
  },
  {
    channel: "Copyright / DMCA",
    email: CONTACT.dmca,
    response: "Within 2 business days",
    use: "Takedown notices and counter-notices. Include the URL, the work at issue and your contact details.",
  },
  {
    channel: "Legal & abuse",
    email: CONTACT.legal,
    response: "Within 2 business days",
    use: "Impersonation, non-consensual imagery, prohibited uploads, law-enforcement requests and terms questions.",
  },
  {
    channel: "Editorial corrections",
    email: CONTACT.editorial,
    response: "Within 5 business days",
    use: "Factual corrections, outdated pricing or model information, broken links. Include the page URL.",
  },
  {
    channel: "Press & partnerships",
    email: CONTACT.press,
    response: "Within 3 business days",
    use: "Press enquiries, integrations and team/volume partnerships.",
  },
];

export default function ContactPage() {
  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact PortraitLab",
          url: canonicalFor("/contact"),
          inLanguage: "en-US",
          dateModified: CONTENT_UPDATED,
          mainEntity: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
            email: CONTACT.support,
            contactPoint: CHANNELS.map((channel) => ({
              "@type": "ContactPoint",
              contactType: channel.channel,
              email: channel.email,
              availableLanguage: "en",
            })),
          },
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]}
      />

      <section className="mx-auto max-w-6xl px-6 pb-6 pt-8">
        <p className="sans mb-4 inline-flex rounded-full border border-orange-300 bg-orange-50 px-3 py-1 text-xs uppercase tracking-wide text-orange-800">
          Email only · no phone line · no live chat
        </p>
        <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
          Contact {SITE_NAME} — Support, Billing, Privacy and DMCA
        </h1>
        <AuthorByline />
        <div className="sans mt-5 max-w-3xl space-y-4 text-base leading-relaxed text-stone-700">
          <p>
            {SITE_NAME} is an online-only service run by a small team, so the only contact channels are email. There is
            no phone line, no live chat and no walk-in address — please do not send physical mail. Each channel below
            goes to an inbox the team actually reads.
          </p>
          <p>
            For anything about a specific order, include the order ID from your receipt: it is the difference between a
            one-email fix and a round of back-and-forth.
          </p>
        </div>
      </section>

      <Section eyebrow="Channels" title="Who to email, and how fast">
        <div className="sans overflow-x-auto rounded-2xl border border-stone-300 bg-white/60">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-stone-100/80 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">
                  What it is for
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Email
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Typical response
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Include
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {CHANNELS.map((channel) => (
                <tr key={channel.email}>
                  <th scope="row" className="px-5 py-3 font-medium text-stone-800">
                    {channel.channel}
                  </th>
                  <td className="px-5 py-3">
                    <a className="text-orange-700 underline underline-offset-2" href={`mailto:${channel.email}`}>
                      {channel.email}
                    </a>
                  </td>
                  <td className="px-5 py-3 text-stone-600">{channel.response}</td>
                  <td className="px-5 py-3 text-stone-600">{channel.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="sans mt-3 text-xs text-stone-500">
          Response times are business-day estimates for the small team that runs this service, not a contractual SLA.
          Example.com addresses are placeholders in this build and will be replaced with the production domain before
          launch.
        </p>
      </Section>

      <Section
        eyebrow="Requests"
        title="How to ask for a redo, a refund or a deletion"
        intro={<p>Three requests cover almost every support email. Each has a fixed process.</p>}
      >
        <Prose>
          <h3>Redo</h3>
          <p>
            Reply to your delivery email within 48 hours and describe what missed — likeness, styling, backdrop or crop
            — and include the order ID. We regenerate the full set with adjusted identity guidance. One redo per paid
            order, no charge. The terms are on the <Link href="/refund">refund and redo page</Link>.
          </p>
          <h3>Refund</h3>
          <p>
            If the redo still does not produce a usable set, the refund window and conditions apply; email the support
            inbox with the order ID and a one-line reason. Approved refunds are issued by the merchant of record, which
            confirms by email. Billing-specific questions go to the billing inbox.
          </p>
          <h3>Deletion and data requests</h3>
          <p>
            Email the privacy inbox from the address you ordered with. Uploaded photos and generated files are normally
            deleted 30 days after delivery; earlier deletion is processed on request. If you are in the EEA or UK and
            want to exercise access, portability or objection rights, say so in the email and we will follow the
            statutory process. What we collect and which processors see it is documented on the{" "}
            <Link href="/privacy">privacy page</Link>.
          </p>
        </Prose>
      </Section>

      <Section
        eyebrow="Abuse"
        title="Reporting impersonation or prohibited content"
        intro={
          <p>
            Using someone else&apos;s photos, or generating images of a public figure or a minor, is prohibited by our
            terms. If you believe that has happened, tell us and we will act.
          </p>
        }
      >
        <Prose>
          <p>
            Email the legal inbox with the URLs involved, a short description of the problem and how we can verify it.
            Reports of non-consensual or impersonating imagery are prioritised over other queues. We may suspend an
            order, delete generated files and refuse future service while an investigation is open — and we will report
            unlawful content where the law requires it.
          </p>
          <p>
            For copyright complaints, use the DMCA inbox and include the elements a notice needs: identification of the
            work, the URL of the material, your contact details and a good-faith statement. Related reading:{" "}
            <Link href="/terms">terms of service</Link>,{" "}
            <Link href="/refund">refund policy</Link>.
          </p>
        </Prose>
      </Section>

      <Section
        eyebrow="Teams"
        title="Team and volume orders"
        intro={<p>Team orders of ten or more people are quoted and invoiced separately.</p>}
      >
        <Prose>
          <p>
            If you need one style guide across a whole team, a single invoice with net-30 terms and a purchase order
            reference, email the billing inbox with the headcount and the style you want. The{" "}
            <Link href="/team-headshots">team headshots page</Link> covers what a rollout looks like. We do not publish a
            self-serve team checkout, so an email is the fastest path.
          </p>
          <p>
            Are you looking for the editor behind a page rather than support? The{" "}
            <Link href={authorPath(PRIMARY_AUTHOR.slug)}>editorial team page</Link> has the byline, coverage list and
            correction log, and the <Link href="/about">about page</Link> explains how we work.
          </p>
        </Prose>
      </Section>
    </main>
  );
}
