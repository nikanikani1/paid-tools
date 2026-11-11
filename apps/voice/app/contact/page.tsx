import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { PRIMARY_AUTHOR, authorPath } from "@/lib/authors";
import {
  absoluteUrl,
  breadcrumbSchema,
  CONTENT_UPDATED,
  faqSchema,
  graphSchema,
  pageMetadata,
  SITE_NAME,
  SITE_URL,
  SUPPORT_EMAIL,
  type FaqItem,
} from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact StemSplit.ai — Support, Billing, Privacy & DMCA",
  description:
    "Contact StemSplit.ai by email: product support, billing and refunds, privacy and data deletion, copyright/DMCA notices, legal and editorial corrections. Response times listed.",
  path: "/contact",
});

const CHANNELS = [
  {
    title: "Product support",
    email: SUPPORT_EMAIL,
    details: "Upload problems, failed jobs, download links, account access.",
    response: "1–2 business days",
  },
  {
    title: "Billing & refunds",
    email: "billing@stemsplit.ai",
    details: "Invoices, duplicate charges, cancellations and refund requests.",
    response: "1–2 business days",
  },
  {
    title: "Privacy & data deletion",
    email: "privacy@stemsplit.ai",
    details: "Access, export or deletion requests; early removal of a job's files.",
    response: "Up to 30 days for rights requests",
  },
  {
    title: "Copyright / DMCA",
    email: "dmca@stemsplit.ai",
    details: "Takedown notices and counter-notices with the details required by the DMCA.",
    response: "Reviewed within 5 business days",
  },
  {
    title: "Legal",
    email: "legal@stemsplit.ai",
    details: "Terms, contracts and legal correspondence.",
    response: "1–5 business days",
  },
  {
    title: "Editorial corrections",
    email: "editorial@stemsplit.ai",
    details: "Factual errors, outdated steps or broken links in our guides.",
    response: "1–2 business days",
  },
];

const FAQS: FaqItem[] = [
  {
    q: "How fast do you reply?",
    a: "Product support and billing messages are answered within 1–2 business days. Privacy and data-deletion requests can take up to 30 days because they may require verification. DMCA notices are reviewed within 5 business days.",
  },
  {
    q: "Do you offer phone support or live chat?",
    a: "Not yet. Email is the only support channel, and it is monitored by the people who build the product. We do not run a call center, so a phone number would be misleading.",
  },
  {
    q: "How do I request a refund?",
    a: "Email billing@stemsplit.ai with the checkout email, invoice ID and the job ID if a separation is involved. Your first purchase — including the $2.90 Trial Pack — is covered by the 14-day money-back guarantee. The refund policy explains the details.",
  },
  {
    q: "Where do I report copyright infringement?",
    a: "Email dmca@stemsplit.ai with the information required by the DMCA: identification of the work, identification of the material, your contact details, a good-faith statement, a statement under penalty of perjury and your signature. The terms of service describe the full process.",
  },
];

const INCLUDED = [
  "The email address you used at checkout, when contacting us about a payment.",
  "The order or invoice ID for billing questions.",
  "The job ID shown in the result panel for a failed or corrupted separation.",
  "The page URL for editorial corrections, plus what you believe is wrong.",
  "The file format and approximate length for upload problems.",
];

const LIMITS = [
  "We cannot grant rights to a song you do not own or license.",
  "We cannot process or refund charges made outside our checkout.",
  "We do not provide legal advice on copyright or fair use.",
  "We cannot recover files after the automatic 24–48 hour deletion window if the download links have expired.",
];

export default function ContactPage() {
  const schema = graphSchema(
    {
      "@type": "ContactPage",
      "@id": `${absoluteUrl("/contact")}#contact`,
      name: "Contact StemSplit.ai",
      url: absoluteUrl("/contact"),
      description:
        "Email contacts for support, billing, privacy, DMCA, legal and editorial corrections at StemSplit.ai.",
      inLanguage: "en",
      dateModified: CONTENT_UPDATED,
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      email: SUPPORT_EMAIL,
      contactPoint: CHANNELS.map((channel) => ({
        "@type": "ContactPoint",
        contactType: channel.title,
        email: channel.email,
        availableLanguage: "English",
      })),
    },
    faqSchema(FAQS),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Contact", path: "/contact" },
    ]),
  );

  return (
    <>
      <JsonLd data={schema} />
      <div className="mx-auto max-w-6xl px-6">
        <div className="pt-6">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
        </div>

        <header className="py-10 md:py-14">
          <div className="max-w-3xl">
            <div className="badge">Support &amp; contact</div>
            <h1 className="display mt-5 text-4xl md:text-5xl">Contact StemSplit.ai</h1>
            <p className="mt-3 text-xs uppercase tracking-widest text-slate-500">
              Last updated: {CONTENT_UPDATED}
            </p>
            <p className="mt-5 leading-relaxed text-slate-300">
              Email is the only support channel we run. There is no phone line, no live chat and no support ticket
              portal yet — a message to the right inbox reaches the small team that builds the product, and we answer
              in the timeframes listed below.
            </p>
            <p className="mt-4 leading-relaxed text-slate-300">
              Pick the channel that matches your question. Sending billing issues to the support inbox or support
              questions to the legal inbox only slows things down.
            </p>
          </div>
        </header>

        <section className="pb-6">
          <div className="grid gap-4 md:grid-cols-2">
            {CHANNELS.map((channel) => (
              <div key={channel.email} className="card p-5">
                <h2 className="font-semibold text-slate-100">{channel.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{channel.details}</p>
                <a
                  href={`mailto:${channel.email}`}
                  className="mt-3 inline-block text-sm font-medium text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
                >
                  {channel.email}
                </a>
                <p className="mt-2 text-xs text-slate-500">Typical response: {channel.response}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="hairline py-14">
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-slate-100">What to include in your message</h2>
              <ul className="mt-4 space-y-2.5">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-slate-300">
                    <span aria-hidden="true" className="text-cyan-300">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-slate-100">What we cannot help with</h2>
              <ul className="mt-4 space-y-2.5">
                {LIMITS.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-slate-300">
                    <span aria-hidden="true" className="text-amber-300">
                      –
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mx-auto mt-6 max-w-4xl">
            <div className="card-soft p-5 text-sm leading-relaxed text-slate-400">
              Need the policy details? Read the{" "}
              <Link href="/refund" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                refund policy
              </Link>
              , the{" "}
              <Link href="/privacy" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                privacy policy
              </Link>
              , the{" "}
              <Link href="/terms" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                terms of service
              </Link>{" "}
              and the{" "}
              <Link href="/terms#dmca" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                DMCA section
              </Link>
              . Editorial corrections are handled by{" "}
              <Link href={authorPath(PRIMARY_AUTHOR.slug)} className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                the StemSplit Audio Team
              </Link>
              ; who we are and how we work is on the{" "}
              <Link href="/about" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                about page
              </Link>
              .
            </div>
          </div>
        </section>

        <Faq items={FAQS} title="Contact questions" />
        <div className="pb-16" />
      </div>
    </>
  );
}
