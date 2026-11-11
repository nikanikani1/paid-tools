import Link from "next/link";
import { VOICE_PLANS } from "@paid/core";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import {
  breadcrumbSchema,
  faqSchema,
  graphSchema,
  pageMetadata,
  webApplicationSchema,
  type FaqItem,
} from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Pricing — Free 3 Minutes, Pro from $5/mo",
  description:
    "Simple vocal remover pricing: free 3 minutes, Starter $5/mo for 90 minutes, Pro $9/mo for 200 minutes and 6 stems, or $39/year. Cancel anytime.",
  path: "/pricing",
});

const PRICING_FAQS: FaqItem[] = [
  {
    q: "Is there a free plan?",
    a: "Yes. The free tier includes one track per day of up to 3 minutes, returned as vocals and instrumental in MP3 320 — no account and no card required. It is a real AI separation, not a preview clip.",
  },
  {
    q: "What is the difference between Starter and Pro?",
    a: "Starter ($5/month) gives you 90 minutes, the standard 4-stem model, WAV + MP3 downloads and batch upload. Pro ($9/month) raises the allowance to 200 minutes and adds the 6-stem model, high-quality mode, a priority queue and a commercial-use license for the processing service.",
  },
  {
    q: "Does the annual plan really save money?",
    a: "Yes. Starter is $5/month, or $60 for a year, while the annual plan is $39 — about $3.25/month, a saving of roughly 35%. You pay once for the year and get the same 90 minutes per month.",
  },
  {
    q: "Can I cancel at any time?",
    a: "Yes. Subscriptions renew automatically, but you can cancel from the billing portal before the renewal date and keep access until the end of the period you already paid for. There is no cancellation fee.",
  },
  {
    q: "What happens if I use all my minutes?",
    a: "Processing stops until the next billing period, or you can buy a 60-minute top-up for $5. Failed jobs do not consume minutes, so you never lose allowance to an error.",
  },
  {
    q: "Is there a refund policy?",
    a: "Yes. Your first paid purchase is covered by a 14-day money-back guarantee when you have used less than 20 minutes. Duplicate charges and failed jobs are refunded or restored automatically. The full policy is on the refund page.",
  },
];

const COMPARE_ROWS: { feature: string; free: string; starter: string; pro: string }[] = [
  { feature: "Monthly minutes", free: "3 min / day", starter: "90 minutes", pro: "200 minutes" },
  { feature: "Max track length", free: "3 minutes", starter: "10 minutes", pro: "10 minutes" },
  { feature: "Stems per job", free: "Vocals + instrumental", starter: "4 stems", pro: "4 + 6 stems" },
  { feature: "Download quality", free: "MP3 320", starter: "MP3 320 + WAV", pro: "MP3 320 + WAV" },
  { feature: "Batch upload", free: "—", starter: "✓", pro: "✓" },
  { feature: "High-quality model", free: "—", starter: "—", pro: "✓" },
  { feature: "Priority queue", free: "—", starter: "—", pro: "✓" },
  { feature: "Commercial-use license", free: "Personal use", starter: "Personal use", pro: "✓" },
  { feature: "Support", free: "Standard", starter: "Standard", pro: "Priority" },
];

export default function PricingPage() {
  const schema = graphSchema(
    webApplicationSchema({
      name: "StemSplit.ai Vocal Remover",
      description:
        "AI vocal remover pricing: free 3 minutes, Starter $5/mo for 90 minutes, Pro $9/mo for 200 minutes and 6 stems, annual $39/year.",
      path: "/pricing",
    }),
    faqSchema(PRICING_FAQS),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Pricing", path: "/pricing" },
    ]),
  );

  return (
    <>
      <JsonLd data={schema} />
      <div className="mx-auto max-w-6xl px-6">
        <div className="pt-6">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Pricing" }]} />
        </div>

        <header className="py-12 text-center md:py-16">
          <div className="badge">Free to try · cancel anytime</div>
          <h1 className="display mx-auto mt-5 max-w-3xl text-4xl md:text-5xl">
            Pricing — Free 3 Minutes, Pro from $5/mo
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Start with a free 3-minute separation. Upgrade when you need the full 4-stem output, WAV downloads, longer
            tracks or more minutes. Monthly or annual, no contracts.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          {VOICE_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`card flex flex-col p-6 ${plan.popular ? "border-violet-400/70 shadow-[0_0_50px_-30px_rgba(139,92,246,1)]" : ""}`}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold text-slate-100">{plan.name}</h2>
                {plan.popular && (
                  <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-200">
                    Popular
                  </span>
                )}
              </div>
              <p className="mt-4 text-4xl font-extrabold">
                ${plan.price}
                <span className="text-sm font-normal text-slate-400">
                  {plan.billing === "annual" ? "/year" : plan.price > 0 ? "/month" : ""}
                </span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {plan.billing === "annual" ? "≈ $3.25/month · save 35%" : plan.price === 0 ? "No card required" : `${plan.minutes} minutes included`}
              </p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-slate-300">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span aria-hidden="true" className="text-cyan-300">
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/#tool"
                className={`btn mt-6 w-full ${plan.popular ? "btn-primary" : "btn-ghost"}`}
              >
                {plan.price === 0 ? "Start free" : "Choose plan"}
              </Link>
              <p className="mt-2 text-center text-[11px] text-slate-600">
                {plan.price === 0 ? "No signup" : "Secure checkout via Waffo"}
              </p>
            </div>
          ))}
        </section>

        <p className="mt-4 text-center text-xs text-slate-500">
          Prices in USD. Paid plans renew automatically until cancelled. First purchase covered by the{" "}
          <Link href="/refund" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
            14-day money-back guarantee
          </Link>
          .
        </p>

        <section className="hairline mt-14 pt-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="display text-3xl md:text-4xl">Monthly or annual: which is cheaper?</h2>
            <p className="mt-4 leading-relaxed text-slate-300">
              Monthly billing is the flexible option: $5/month for Starter, cancel whenever you like, no commitment.
              Annual billing is the cheaper option: $39/year works out to about $3.25/month, or roughly 35% less than
              twelve monthly payments — and it includes the same 90 minutes per month.
            </p>
            <p className="mt-4 leading-relaxed text-slate-300">
              A simple rule: if you expect to process tracks for more than eight months, the annual plan saves money.
              If you are trying the tool for a project or two, start monthly and switch later. You can change plans
              from the billing portal, and the annual discount applies from the next billing cycle.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="card p-5">
                <h3 className="font-semibold text-slate-100">Monthly — $5/mo</h3>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-400">
                  <li>· 90 minutes per month</li>
                  <li>· 4-stem output and WAV downloads</li>
                  <li>· Cancel before renewal, keep access until period end</li>
                  <li>· Best for short projects and testing</li>
                </ul>
              </div>
              <div className="card border-violet-400/50 p-5">
                <h3 className="font-semibold text-slate-100">Annual — $39/yr</h3>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-400">
                  <li>· 90 minutes per month, paid once a year</li>
                  <li>· ≈ $3.25/month — about 35% cheaper</li>
                  <li>· 4-stem output, WAV downloads, priority support</li>
                  <li>· Best value if you process tracks regularly</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="hairline mt-14 pt-12">
          <div className="mx-auto max-w-4xl">
            <h2 className="display text-3xl md:text-4xl">Compare every plan</h2>
            <p className="mt-4 text-slate-300">
              The free tier is a full AI separation with two stems. Paid plans add stems, formats, length and volume.
            </p>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-800">
              <table className="compare-table min-w-[640px]">
                <thead>
                  <tr>
                    <th scope="col">Feature</th>
                    <th scope="col">Free</th>
                    <th scope="col">Starter $5/mo</th>
                    <th scope="col">Pro $9/mo</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row) => (
                    <tr key={row.feature}>
                      <th scope="row" className="font-medium text-slate-300">
                        {row.feature}
                      </th>
                      <td className="text-slate-400">{row.free}</td>
                      <td className="text-slate-300">{row.starter}</td>
                      <td className="text-slate-300">{row.pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="hairline mt-14 pt-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="display text-3xl md:text-4xl">What the free plan includes</h2>
            <p className="mt-4 leading-relaxed text-slate-300">
              The free plan is meant to be useful, not a teaser. You get one 3-minute track per day, separated by the
              same AI model as the paid plans, with vocals and instrumental stems in MP3 320 and no watermark. No
              signup, no card and no trial countdown.
            </p>
            <p className="mt-4 leading-relaxed text-slate-300">
              The limits are length, stems and volume: three minutes instead of ten, two stems instead of four, and one
              track per day instead of a monthly minute allowance. If that covers your needs, stay on free. If you need
              the full 4-stem set regularly, Starter pays for itself after the first few songs.
            </p>
          </div>
        </section>

        <section className="hairline mt-14 pt-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="display text-3xl md:text-4xl">Refunds and billing</h2>
            <p className="mt-4 leading-relaxed text-slate-300">
              Payments are handled by Waffo as merchant of record, which means they process the card, issue invoices
              and handle applicable sales tax. Your first paid purchase is covered by a 14-day money-back guarantee
              when you have used less than 20 minutes. Duplicate charges and failed jobs are refunded or restored.
            </p>
            <p className="mt-4 leading-relaxed text-slate-300">
              To cancel, use the billing portal link in your purchase email. Access continues until the end of the paid
              period and there is no cancellation fee. Read the full{" "}
              <Link href="/refund" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                refund policy
              </Link>
              .
            </p>
          </div>
        </section>

        <Faq
          items={PRICING_FAQS}
          title="Pricing questions"
          intro="Everything people ask before upgrading — limits, annual savings, cancellation and refunds."
        />

        <section className="pb-16">
          <div className="card relative overflow-hidden p-8 text-center md:p-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_240px_at_50%_0%,rgba(109,92,255,0.28),transparent_70%)]"
            />
            <div className="relative">
              <h2 className="display mx-auto max-w-2xl text-2xl md:text-3xl">Try it free before you decide</h2>
              <p className="mx-auto mt-3 max-w-xl text-slate-300">
                One free 3-minute separation per day. If the quality is not there, do not pay — the guarantee covers
                your first paid purchase for 14 days.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link href="/#tool" className="btn btn-primary">
                  Start free
                </Link>
                <Link href="/how-it-works" className="btn btn-ghost">
                  How it works
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
