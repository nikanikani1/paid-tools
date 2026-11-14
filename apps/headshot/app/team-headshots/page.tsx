import type { Metadata } from "next";
import Link from "next/link";
import {
  Breadcrumbs,
  CtaBand,
  FaqList,
  JsonLd,
  KeyFacts,
  Prose,
  RelatedLinks,
  Section,
  StepGrid,
} from "../components/ui";
import { EditorialByline, StudioComparisonSection } from "../components/editorial";
import { breadcrumbJsonLd, buildMetadata, faqPageJsonLd, productJsonLd } from "../lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "AI Team Headshots — Consistent Brand Portraits for 10+ People",
  description:
    "Consistent AI team headshots for 10 or more people: one style guide, one invoice, one turnaround. From $29 per person with net-30 invoicing.",
  path: "/team-headshots",
  keywords: ["team headshots", "corporate team headshots", "company headshots", "employee headshots", "b2b headshots"],
});

const FAQ = [
  {
    q: "What is the minimum team size?",
    a: "Ten people. Below ten, individual packages are cheaper and simpler — each person can order their own Sample Pack. At ten or more we run one shared style guide, collect all selfies in a single intake, and invoice the company once.",
  },
  {
    q: "How does the process work for a team?",
    a: "You pick the style guide, we send a collection link, each person uploads three to eight selfies, and you approve a single test render before the full run. The whole thing usually closes in three to five working days, because there is no studio scheduling to coordinate.",
  },
  {
    q: "How is pricing calculated for a team?",
    a: "Per person, with volume tiers: $29 per person for 10–24 people, $27 per person for 25–49, and $25 per person for 50 or more. Each person receives 20 headshots and the whole team shares one backdrop, crop and lighting profile.",
  },
  {
    q: "Can you invoice us instead of charging a card?",
    a: "Yes. Team orders of ten or more are invoiced to the company with net-30 terms, and we can include a purchase order number, VAT or tax ID, and a billing address. Card payment is available too if your finance team prefers it.",
  },
  {
    q: "Will everyone really look consistent?",
    a: "Yes, that is the point of the shared style guide. Backdrop, crop, lighting direction and colour treatment are fixed for the whole team, so directory tiles sit next to each other without looking like a stock-photo collage. Individual variation stays where it should: face, hair, wardrobe colour and expression.",
  },
  {
    q: "What if someone does not like their headshots?",
    a: "Each person gets one free redo within 48 hours of delivery. If a redo still misses for an individual, that seat is re-run with a different preset at no extra cost — the refund policy applies per seat, not to the whole order.",
  },
  {
    q: "Do you handle remote or international teams?",
    a: "Yes. Everything is browser-based, so a distributed team uploads from wherever they are. Invoices can be issued in USD, and we can split delivery links per office or per department.",
  },
];

export default function TeamHeadshotsPage() {
  return (
    <main>
      <JsonLd
        data={productJsonLd({
          name: "AI Team Headshots",
          description:
            "Consistent AI team headshots for ten or more people: one style guide, one invoice, from $29 per person with net-30 terms.",
          path: "/team-headshots",
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQ)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Team headshots", path: "/team-headshots" },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Team headshots", path: "/team-headshots" },
        ]}
      />

      <section className="mx-auto max-w-6xl px-6 pb-8 pt-8">
        <p className="sans mb-4 inline-flex rounded-full border border-orange-300 bg-orange-50 px-3 py-1 text-xs uppercase tracking-wide text-orange-800">
          B2B · 10 people minimum · invoicing available
        </p>
        <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
          AI Team Headshots — Consistent Brand Portraits Without a Studio Day
        </h1>
        <div className="sans mt-5 grid gap-6 text-base leading-relaxed text-stone-700 md:grid-cols-[1.3fr_1fr]">
          <div className="space-y-4">
            <p>
              A company page with eight different backgrounds, eight lighting styles and three eras of camera looks
              reads as disorganised — even if every individual photo is fine. A studio day fixes consistency but costs a
              full team calendar day, travel and a retoucher, and someone always has to reschedule.
            </p>
            <p>
              Our team flow replaces that with a shared style guide and a five-minute task per person. Everyone uploads
              selfies from wherever they work; the pipeline renders each person against the same backdrop, crop and
              light; you approve one test render before the full run; and the company gets a single invoice.
            </p>
            <p>
              It is built for teams of ten or more: HR and marketing teams rolling out a rebrand, sales orgs refreshing
              their directory before a trade show, clinic groups standardising practitioner photos across locations.
            </p>
          </div>
          <div className="rounded-2xl border border-stone-300 bg-white/70 p-6">
            <h2 className="font-serif text-xl font-bold text-stone-900">B2B terms at a glance</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-500">Minimum order</dt>
                <dd className="font-semibold text-stone-900">10 people</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-500">Per person</dt>
                <dd className="font-semibold text-stone-900">$29 · $27 · $25 by volume</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-500">Included per seat</dt>
                <dd className="font-semibold text-stone-900">20 headshots, 1 free redo</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-500">Payment</dt>
                <dd className="font-semibold text-stone-900">Invoice, net-30, PO & tax ID</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-500">Typical turnaround</dt>
                <dd className="font-semibold text-stone-900">3–5 working days</dd>
              </div>
            </dl>
            <a
              href="mailto:support@headshotsnap.com?subject=Team%20headshots%20enquiry"
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-orange-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Request a team quote
            </a>
          </div>
        </div>
      </section>

      <Section
        eyebrow="Process"
        title="How a team order runs"
        intro={<p>Four steps, one shared style guide, and a single test render before the full run.</p>}
      >
        <StepGrid
          steps={[
            {
              title: "Agree the style guide",
              body: "Backdrop tone, crop, lighting profile and wardrobe level. We send back a one-page style sheet with two sample renders so you can sign off before anyone uploads.",
              detail: "Typical options: studio grey, warm sand, soft office blur.",
            },
            {
              title: "Collect selfies",
              body: "You share one link. Each person uploads 3–8 selfies, or a manager uploads on their behalf. The quality gate rejects unusable photos immediately so nobody has to chase.",
              detail: "Five photos per person is the target; poor uploads get an automatic re-upload prompt.",
            },
            {
              title: "Approve one test render",
              body: "We render the first person and send the frame for approval. Once you sign off, the rest of the team runs against the same guide.",
              detail: "No surprise style drift between seats — the guide is fixed after approval.",
            },
            {
              title: "Deliver and invoice",
              body: "Each person gets their own download link with 20 headshots; HR gets one invoice with PO and tax fields. Redo requests are handled per seat for 48 hours.",
              detail: "Files are stored for 30 days, then deleted.",
            },
          ]}
        />
      </Section>

      <Section
        eyebrow="Pricing"
        title="Volume pricing per person"
        intro={<p>Per-seat pricing with three volume tiers. Volume discounts apply automatically once the seat count crosses a threshold.</p>}
      >
        <div className="sans overflow-x-auto rounded-2xl border border-stone-300 bg-white/60">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-stone-100/80 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Team size
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Price per person
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Included per seat
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Example total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {[
                ["10–24 people", "$29", "20 headshots + 1 free redo", "10 seats = $290"],
                ["25–49 people", "$27", "20 headshots + 1 free redo", "25 seats = $675"],
                ["50+ people", "$25", "20 headshots + 1 free redo", "50 seats = $1,250"],
              ].map(([size, price, included, example]) => (
                <tr key={size}>
                  <th scope="row" className="px-5 py-3 font-medium text-stone-800">
                    {size}
                  </th>
                  <td className="px-5 py-3 font-semibold text-stone-900">{price}</td>
                  <td className="px-5 py-3 text-stone-600">{included}</td>
                  <td className="px-5 py-3 text-stone-600">{example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="sans mt-3 text-xs text-stone-500">
          Need more than 20 images per person, additional style guides (for example a formal and a creative set), or
          multiple office sub-brands? Ask for a custom quote — custom seat packages are priced per seat.
        </p>
      </Section>

      <Section
        eyebrow="Why it works"
        title="Consistency is a policy, not a filter"
        intro={<p>Three things keep a team set from looking like a collage of stock photos.</p>}
      >
        <Prose>
          <h3>One style guide for every seat</h3>
          <p>
            The backdrop, crop, light direction and colour treatment are locked after approval. Individual variation
            stays where it should — face, hair, wardrobe colour, expression — instead of leaking into the background or
            the lighting. This is the difference between a team page and a grid of unrelated portraits.
          </p>
          <h3>One quality gate for every upload</h3>
          <p>
            Each person&apos;s uploads go through the same automated check: single face, reasonable head angle, minimum
            resolution, no sunglasses or heavy shadow. Photos that fail are rejected with a plain-language reason, which
            is what stops a directory rollout from stalling on two people who never send a usable photo.
          </p>
          <h3>One invoice for finance</h3>
          <p>
            Ten individual card payments is an expense-report problem. A team order is a single invoice with a PO
            reference, tax ID and net-30 terms, which is usually the difference between a marketing lead being allowed
            to buy it and not. Need to split by department or office? We can issue sub-invoices against the same order.
          </p>
        </Prose>
      </Section>

      <Section eyebrow="Fit" title="Where team headshots matter most">
        <div className="sans grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Website team pages",
              body: "Tiles sit side by side; inconsistent backdrops are most visible here. This is the highest-impact page to standardise first.",
            },
            {
              title: "Sales and proposal decks",
              body: "Proposal covers and pitch decks usually show the account team. Consistent portraits read as a real org chart.",
            },
            {
              title: "Conference and trade-show material",
              body: "Speaker cards, booth banners and badges are printed large, so expression and crop matter as much as resolution.",
            },
            {
              title: "Recruiting pages",
              body: "Candidate-facing pages benefit from a warm, human set — usually the creative preset rather than the formal one.",
            },
            {
              title: "Clinic and practice directories",
              body: "Practitioner listings often sit next to credentials and locations, where a clean clinical preset reads best.",
            },
            {
              title: "Press and investor pages",
              body: "Founder and executive portraits appear in articles and filings; one formal frame per executive is usually enough.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-stone-300 bg-white/70 p-5">
              <h3 className="text-base font-semibold text-stone-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="FAQ" title="Team order questions">
        <FaqList items={FAQ} />
      </Section>

      <RelatedLinks
        links={[
          { href: "/doctor-headshots", label: "Doctor & clinic headshots", body: "Practitioner portraits for medical directories." },
          { href: "/ai-professional-headshot", label: "AI professional headshot", body: "Individual business presets and use cases." },
          { href: "/pricing", label: "Individual pricing", body: "$9 Sample Pack on sale; larger packages coming soon." },
          { href: "/how-it-works", label: "How it works", body: "Quality gate, identity pass and delivery." },
          { href: "/privacy", label: "Privacy", body: "How team photo data is handled and deleted." },
          { href: "/refund", label: "Redo & refund", body: "Per-seat redo and refund terms." },
        ]}
      />

      <CtaBand
        title="Get a team quote in one email"
        body="Tell us the headcount and the style you want. We reply with a per-seat quote, the style sheet and the collection link."
        href="mailto:support@headshotsnap.com?subject=Team%20headshots%20quote"
        cta="Request a quote"
      />
      <StudioComparisonSection />
      <EditorialByline />
    </main>
  );
}
