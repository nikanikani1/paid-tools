import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, CtaBand, FaqList, JsonLd, KeyFacts, Prose, RelatedLinks, Section } from "../components/ui";
import { breadcrumbJsonLd, buildMetadata, faqPageJsonLd } from "../lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Refund & Redo Policy — 48-Hour Redo, Written Refund Terms",
  description:
    "Our AI headshot refund and redo policy: one free redo within 48 hours, the conditions for a refund, how to request it and how long processing takes.",
  path: "/refund",
  keywords: ["ai headshot refund", "headshot redo policy", "ai headshot guarantee"],
});

const FAQ = [
  {
    q: "Does the $9 Sample Pack include the redo and refund policy?",
    a: "Yes. The Sample Pack is a paid order, so it carries the same one free redo within 48 hours and the same 14-day refund conditions as the 40, 60 and 100-image packages. The only difference is scale: a redo of a five-image set is fast and is processed the same way as a larger redo.",
  },
  {
    q: "How do I request a redo?",
    a: "Reply to your delivery email within 48 hours and say what missed — likeness, styling, backdrop or crop. Include the order ID. We regenerate the whole set with adjusted guidance and send a new download link, usually the same day.",
  },
  {
    q: "How many redos do I get?",
    a: "One free redo per paid order. The redo regenerates the entire set, not a single image, because a set-wide problem usually needs a set-wide fix. If the redo still misses, the refund policy applies instead of a second redo.",
  },
  {
    q: "When is a refund available?",
    a: "A refund is available when the free redo has been used and the regenerated set still does not reasonably resemble the person in the source photos, and the request is made within 14 days of the original delivery. Refunds are not available simply because you prefer a different style after the set was delivered.",
  },
  {
    q: "What if the generation fails entirely?",
    a: "Provider outages, job errors and upload failures are not your problem. Failed orders are retried automatically; if the retry also fails, you are refunded in full without needing to ask.",
  },
  {
    q: "How long does a refund take?",
    a: "The merchant of record issues the refund within one business day of approval. Card settlement usually shows up within 5–10 business days depending on your bank. The receipt email confirms when the refund was issued.",
  },
  {
    q: "Can I get a refund after using the images?",
    a: "If you have downloaded and published the set, a refund is not normally available — the product has been delivered and used. Raise the issue before publishing if something looks wrong; a redo is faster and free.",
  },
];

export default function RefundPage() {
  return (
    <main>
      <JsonLd data={faqPageJsonLd(FAQ)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Refund & redo", path: "/refund" },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Refund & redo", path: "/refund" },
        ]}
      />

      <section className="mx-auto max-w-6xl px-6 pb-8 pt-8">
        <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
          Refund &amp; Redo Policy
        </h1>
        <div className="sans mt-5 grid gap-6 text-base leading-relaxed text-stone-700 md:grid-cols-[1.3fr_1fr]">
          <div className="space-y-4">
            <p>
              AI headshots fail in one of two ways: the images do not look like you, or the generation does not complete.
              Both are covered, and both are covered by a short, written policy rather than a support conversation.
            </p>
            <p>
              The short version: one free redo within 48 hours, and a refund inside 14 days if the redo still misses.
              Failed generations are refunded automatically. This applies to every paid order — including the $9 Sample
              Pack — because every generation is paid: there is no unpaid generation anywhere in the product.
            </p>
          </div>
          <div>
            <KeyFacts
              facts={[
                { label: "Free redo", value: "1 per order" },
                { label: "Redo window", value: "48 hours" },
                { label: "Refund window", value: "14 days" },
                { label: "Failed jobs", value: "auto refund" },
              ]}
            />
          </div>
        </div>
      </section>

      <Section
        eyebrow="At a glance"
        title="What is covered, and when"
        intro={<p>Four scenarios cover almost every support request we receive.</p>}
      >
        <div className="sans overflow-x-auto rounded-2xl border border-stone-300 bg-white/60">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-stone-100/80 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Scenario
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  What you get
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Window
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  How to claim
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {[
                ["Does not look like you", "Free full-set redo", "48 hours after delivery", "Reply to delivery email"],
                ["Redo still misses", "Full refund", "14 days after original delivery", "Reply to delivery email"],
                ["Generation failed / provider outage", "Automatic retry, then refund", "Immediate", "No action needed"],
                ["Wrong style after delivery", "One free redo (style change)", "48 hours after delivery", "Reply to delivery email"],
              ].map(([scenario, outcome, window, how]) => (
                <tr key={scenario}>
                  <th scope="row" className="px-5 py-3 font-medium text-stone-800">
                    {scenario}
                  </th>
                  <td className="px-5 py-3 text-stone-600">{outcome}</td>
                  <td className="px-5 py-3 text-stone-600">{window}</td>
                  <td className="px-5 py-3 text-stone-600">{how}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        eyebrow="Redo"
        title="How the free redo works"
        intro={<p>The redo exists because no automated identity check is perfect, and because most misses are fixable.</p>}
      >
        <Prose>
          <h3>What a redo changes</h3>
          <p>
            A redo is not a rerun of the same inputs. We regenerate the full set with adjusted identity guidance, and if
            the problem is styling rather than likeness, with a different preset. If your source photos were the likely
            cause — three frames from the same angle, or one dark photo — we may ask you to re-upload before the redo
            runs, because a better input set fixes more misses than any parameter change.
          </p>
          <h3>Why the whole set, not one image</h3>
          <p>
            Identity and style problems appear across the set rather than in a single frame. Replacing one file would
            leave the other thirty-nine with the same issue. Regenerating the entire set also means your final download
            is internally consistent, which matters if you are publishing several images on the same page.
          </p>
          <h3>What a redo does not change</h3>
          <p>
            A redo does not change the package size, and it does not extend the 30-day file retention window — the new
            set replaces the old one in your order. If you need the original set kept while you evaluate the redo, say so
            in your request and we will keep both until the window closes.
          </p>
          <h3>Timing</h3>
          <p>
            Most redos are processed the same business day. The generation itself takes the same two to four minutes as
            the original order; the delay comes from the queue of manual review, not from the model.
          </p>
        </Prose>
      </Section>

      <Section
        eyebrow="Refund"
        title="When a refund is available"
        intro={<p>Refunds are deliberately narrow, and deliberately honoured without argument when the conditions are met.</p>}
      >
        <Prose>
          <h3>Eligible</h3>
          <ul>
            <li>
              You used your free redo, and the regenerated set still does not reasonably resemble the person in the
              uploaded photos.
            </li>
            <li>The request is made within 14 days of the original delivery.</li>
            <li>The order failed to generate after retries, or a provider outage prevented delivery.</li>
            <li>You were charged twice for the same order.</li>
          </ul>
          <h3>Not eligible</h3>
          <ul>
            <li>You changed your mind about the style after the set was delivered and used.</li>
            <li>The images were already downloaded and published before you raised the issue.</li>
            <li>The source photos did not meet the upload guidance and you declined to re-upload.</li>
            <li>The upload was of someone else, a public figure, or a minor — prohibited orders are refused, not refunded.</li>
            <li>More than 14 days have passed since the original delivery.</li>
          </ul>
          <h3>How to request</h3>
          <p>
            Reply to your delivery email with the order ID and one sentence on what missed. No forms, no phone calls. If
            the request is eligible we approve it by email and the merchant of record issues the refund within one
            business day. Card settlement usually appears within 5–10 business days, depending on your bank.
          </p>
          <h3>Chargebacks</h3>
          <p>
            Please contact us before filing a chargeback. A chargeback takes longer than a refund and usually arrives
            after the issue could have been fixed with a redo. Orders subject to a chargeback may have generated files
            revoked pending resolution.
          </p>
          <h3>Team orders</h3>
          <p>
            Team orders are refunded per seat: if one person&apos;s set cannot be made usable after a redo, that seat is
            refunded against the invoice. The rest of the team order is unaffected. See the{" "}
            <Link href="/team-headshots" className="text-orange-700 underline underline-offset-2">
              team headshots
            </Link>{" "}
            page for B2B terms.
          </p>
        </Prose>
      </Section>

      <Section eyebrow="FAQ" title="Refund and redo questions">
        <FaqList items={FAQ} />
      </Section>

      <RelatedLinks
        links={[
          { href: "/pricing", label: "Pricing", body: "Packages, what is included and how to compare tiers." },
          { href: "/how-it-works", label: "How it works", body: "Why redos fix most misses." },
          { href: "/terms", label: "Terms of service", body: "Licence, acceptable use and liability." },
          { href: "/privacy", label: "Privacy", body: "Retention, deletion and processors." },
          { href: "/", label: "Professional headshots", body: "Start a paid order with the $9 Sample Pack." },
          { href: "/ai-headshot-generator", label: "AI headshot generator", body: "The generator and pipeline behind every order." },
          { href: "/free-ai-headshot-generator", label: "Free vs paid headshot tools", body: "What free generators give you, and why we charge from $9." },
        ]}
      />

      <CtaBand
        title="Start with the $9 Sample Pack"
        body="There is no free render: five paid headshots for $9, covered by this redo and refund policy. If the sample misses, the redo and refund rules apply exactly as they do for larger orders."
        href="/pricing"
        cta="Get the $9 Sample Pack"
      />
    </main>
  );
}
