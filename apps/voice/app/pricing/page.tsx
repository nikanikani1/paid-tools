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
  title: "Pricing — $2.90 Trial Pack, Plans from $5/mo",
  description:
    "No free-of-charge allowance: start with a one-time $2.90 Trial Pack (15 minutes, 4 stems). Starter $5/mo for 90 minutes, Pro $9/mo for 200 minutes, or $39/year.",
  path: "/pricing",
});

const PRICING_FAQS: FaqItem[] = [
  {
    q: "Can I try before paying?",
    a: "No. There is no free-of-charge allowance and no complimentary preview: every separation costs GPU time, so every run is paid. The entry point is the one-time $2.90 Trial Pack, which includes 15 minutes, the full 4-stem output, WAV and MP3 downloads and costs less than most single-song karaoke purchases.",
  },
  {
    q: "What is the Trial Pack and how long does it last?",
    a: "The Trial Pack is a one-time $2.90 purchase that adds 15 minutes to your account. It is not a subscription and nothing renews automatically. Fifteen minutes is roughly five three-minute songs, and it never expires — use the minutes whenever you like.",
  },
  {
    q: "What is the difference between Starter and Pro?",
    a: "Starter ($5/month) gives you 90 minutes per month, the standard 4-stem model, WAV + MP3 downloads and batch upload. Pro ($9/month) raises the allowance to 200 minutes and adds the 6-stem model, high-quality mode, a priority queue and a commercial-use license for the processing service.",
  },
  {
    q: "Does the annual plan really save money?",
    a: "Yes. Starter is $5/month, or $60 for a year, while the annual plan is $39 — exactly five months of Starter for twelve months of access. You pay once for the year and get 90 minutes every month.",
  },
  {
    q: "Can I cancel at any time?",
    a: "Yes. Starter, Pro and Annual renew automatically, but you can cancel from the billing portal before the renewal date and keep access until the end of the period you already paid for. The Trial Pack never renews, so there is nothing to cancel. There is no cancellation fee.",
  },
  {
    q: "What happens when I use all my minutes?",
    a: "Processing pauses until you add more. For a one-time top-up, buy another Trial Pack; for regular work, Starter or Pro cost less per minute. Failed jobs do not consume minutes, so you never lose allowance to a technical error.",
  },
  {
    q: "Is there a refund policy?",
    a: "Yes. Your first purchase — the Trial Pack included — is covered by a 14-day money-back guarantee as long as most of the minutes are unused. Duplicate charges and failed jobs are refunded or restored automatically. The full policy is on the refund page.",
  },
];

const COMPARE_ROWS: { feature: string; trial: string; starter: string; pro: string }[] = [
  { feature: "Price", trial: "$2.90 one-time", starter: "$5/month", pro: "$9/month" },
  { feature: "Minutes", trial: "15 total", starter: "90 / month", pro: "200 / month" },
  { feature: "Renewal", trial: "None", starter: "Monthly", pro: "Monthly" },
  { feature: "Max track length", trial: "10 minutes", starter: "10 minutes", pro: "10 minutes" },
  { feature: "Stems per job", trial: "4 stems", starter: "4 stems", pro: "4 + 6 stems" },
  { feature: "Download quality", trial: "MP3 320 + WAV", starter: "MP3 320 + WAV", pro: "MP3 320 + WAV" },
  { feature: "Batch upload", trial: "—", starter: "✓", pro: "✓" },
  { feature: "High-quality model", trial: "—", starter: "—", pro: "✓" },
  { feature: "Priority queue", trial: "—", starter: "—", pro: "✓" },
  { feature: "Commercial-use license", trial: "Personal use", starter: "Personal use", pro: "✓" },
  { feature: "Support", trial: "Standard", starter: "Standard", pro: "Priority" },
];

function priceLabel(price: number): string {
  return Number.isInteger(price) ? String(price) : price.toFixed(2);
}

function priceSuffix(billing: "monthly" | "annual" | "one-time"): string {
  if (billing === "annual") return "/year";
  if (billing === "monthly") return "/month";
  return " one-time";
}

export default function PricingPage() {
  const schema = graphSchema(
    webApplicationSchema({
      name: "StemSplit.ai Vocal Remover",
      description:
        "AI vocal remover pricing: one-time $2.90 Trial Pack with 15 minutes, Starter $5/mo for 90 minutes, Pro $9/mo for 200 minutes and 6 stems, annual $39/year.",
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
          <div className="badge">Paid trial · no subscription required</div>
          <h1 className="display mx-auto mt-5 max-w-3xl text-4xl md:text-5xl">
            Pricing — $2.90 Trial Pack, Plans from $5/mo
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Start with a one-time $2.90 Trial Pack: 15 minutes, four stems, WAV + MP3. No free-of-charge allowance — every run is
            paid, which keeps the queue short and the quality predictable. Upgrade to Starter or Pro only if you need
            more minutes per month.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          {VOICE_PLANS.map((plan) => (
            <div
              key={plan.id}
              id={plan.id === "voice-trial" ? "trial" : undefined}
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
                ${priceLabel(plan.price)}
                <span className="text-sm font-normal text-slate-400">{priceSuffix(plan.billing)}</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {plan.billing === "annual"
                  ? "≈ $3.25/month · 5 months of Starter"
                  : plan.billing === "one-time"
                    ? "One-time · ≈ 5 songs · never expires"
                    : `${plan.minutes} minutes included`}
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
              <Link href="/#tool" className={`btn mt-6 w-full ${plan.billing === "one-time" ? "btn-primary" : plan.popular ? "btn-primary" : "btn-ghost"}`}>
                {plan.billing === "one-time" ? "Buy the $2.90 trial" : "Choose plan"}
              </Link>
              <p className="mt-2 text-center text-[11px] text-slate-600">
                {plan.billing === "one-time" ? "No subscription · no renewal" : "Secure checkout via Waffo"}
              </p>
            </div>
          ))}
        </section>

        <p className="mt-4 text-center text-xs text-slate-500">
          Prices in USD. Subscriptions renew automatically until cancelled. First purchase covered by the{" "}
          <Link href="/refund" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
            14-day money-back guarantee
          </Link>
          .
        </p>

        <section className="hairline mt-14 pt-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="display text-3xl md:text-4xl">Trial Pack, monthly or annual?</h2>
            <p className="mt-4 leading-relaxed text-slate-300">
              Start with the Trial Pack if you have a project or two: $2.90 once, 15 minutes, no renewal. Move to
              Starter if you process several songs a month — $5/month for 90 minutes costs roughly $0.06 per minute
              versus about $0.19 per minute on the trial. Choose Annual if you will keep going for a year: $39 is
              exactly five months of Starter for twelve months of access.
            </p>
            <p className="mt-4 leading-relaxed text-slate-300">
              You can change or cancel any subscription from the billing portal. The Trial Pack does not renew, so
              there is nothing to cancel if you only want to test the output.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="card p-5">
                <h3 className="font-semibold text-slate-100">Trial Pack — $2.90 once</h3>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-400">
                  <li>· 15 minutes, never expires</li>
                  <li>· 4 stems, WAV + MP3</li>
                  <li>· No subscription, no renewal</li>
                  <li>· Best for one or two songs</li>
                </ul>
              </div>
              <div className="card border-violet-400/50 p-5">
                <h3 className="font-semibold text-slate-100">Starter — $5/mo</h3>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-400">
                  <li>· 90 minutes per month</li>
                  <li>· 4 stems, WAV + MP3</li>
                  <li>· Cancel before renewal</li>
                  <li>· Best for regular projects</li>
                </ul>
              </div>
              <div className="card p-5">
                <h3 className="font-semibold text-slate-100">Annual — $39/yr</h3>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-400">
                  <li>· 90 minutes per month</li>
                  <li>· Five months of Starter for a year</li>
                  <li>· 4 stems, WAV + MP3</li>
                  <li>· Best value for ongoing work</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="hairline mt-14 pt-12">
          <div className="mx-auto max-w-4xl">
            <h2 className="display text-3xl md:text-4xl">Compare every plan</h2>
            <p className="mt-4 text-slate-300">
              The Trial Pack is a real 15-minute allowance with the full 4-stem output. Subscriptions add monthly
              minutes, batch work and, on Pro, the high-quality model.
            </p>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-800">
              <table className="compare-table min-w-[680px]">
                <thead>
                  <tr>
                    <th scope="col">Feature</th>
                    <th scope="col">Trial $2.90</th>
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
                      <td className="text-slate-300">{row.trial}</td>
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
            <h2 className="display text-3xl md:text-4xl">Why every run is paid</h2>
            <p className="mt-4 leading-relaxed text-slate-300">
              Separating a song is GPU work: a three-minute track occupies a cloud GPU for roughly a minute. A free-of-charge tier would be paid for by ads, by selling data, or by slowing every queue — and in practice those models
              either track you or throttle quality. We charge from the first run so the product can stay
              privacy-friendly and fast.
            </p>
            <p className="mt-4 leading-relaxed text-slate-300">
              The $2.90 Trial Pack exists so the first paid step is small: it is a single one-time charge, it returns
              the full 4-stem output, and the minutes never expire. If the separation quality is not right for your
              material, the refund policy covers your first purchase for 14 days.
            </p>
          </div>
        </section>

        <section className="hairline mt-14 pt-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="display text-3xl md:text-4xl">Refunds and billing</h2>
            <p className="mt-4 leading-relaxed text-slate-300">
              Payments are handled by Waffo as merchant of record, which means they process the card, issue invoices
              and handle applicable sales tax. Your first paid purchase — the Trial Pack included — is covered by a
              14-day money-back guarantee while most of the minutes are unused. Duplicate charges and failed jobs are
              refunded or restored.
            </p>
            <p className="mt-4 leading-relaxed text-slate-300">
              To cancel a subscription, use the billing portal link in your purchase email. Access continues until the
              end of the paid period and there is no cancellation fee. The Trial Pack never renews. Read the full{" "}
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
          intro="Everything people ask before their first paid run — trial minutes, annual savings, cancellation and refunds."
        />

        <section className="pb-16">
          <div className="card relative overflow-hidden p-8 text-center md:p-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_240px_at_50%_0%,rgba(109,92,255,0.28),transparent_70%)]"
            />
            <div className="relative">
              <h2 className="display mx-auto max-w-2xl text-2xl md:text-3xl">Try it for $2.90, not for free</h2>
              <p className="mx-auto mt-3 max-w-xl text-slate-300">
                One-time trial, 15 minutes, 4 stems, no subscription. If the quality is not there, the 14-day guarantee
                covers your first purchase.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link href="/#tool" className="btn btn-primary">
                  Buy the $2.90 trial
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
