import Link from "next/link";
import { VOICE_PLANS } from "@paid/core";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BuyButton } from "@/components/BuyButton";
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
  title: "Pricing — $2.90 Trial Pack (15 minutes, 4 MP3 stems)",
  description:
    "Start with the one-time $2.90 Trial Pack: 15 minutes of separation and four MP3 stems. Starter $5/mo, Pro $9/mo and the $39/year annual plan are not open yet and cannot be bought today.",
  path: "/pricing",
});

/**
 * Truth guard: only the one-time Trial Pack can be delivered end to end today.
 * Subscription checkout stays closed until the recurring plans are actually live.
 */
const PURCHASABLE_PLAN_IDS = new Set(["voice-trial"]);

/**
 * UI-level truth overrides. The core plan list is still used for ids/prices, but
 * its raw feature strings describe capabilities the shipped pipeline does not
 * produce yet, so the page renders this list instead.
 */
const DISPLAY_FEATURES: Record<string, string[]> = {
  "voice-trial": ["15 minutes, one-time", "4 stems (vocals, drums, bass, other)", "MP3 320 downloads", "No subscription"],
  "voice-starter": ["90 minutes / month when subscriptions open", "4 stems", "MP3 320 downloads"],
  "voice-pro": ["200 minutes / month when subscriptions open", "4 stems", "MP3 320 downloads"],
  "voice-annual": ["90 minutes / month when subscriptions open", "Billed $39/year when subscriptions open", "4 stems"],
};

function isPurchasable(planId: string): boolean {
  return PURCHASABLE_PLAN_IDS.has(planId);
}

function displayFeatures(planId: string, fallback: string[]): string[] {
  return DISPLAY_FEATURES[planId] ?? fallback;
}

const PRICING_FAQS: FaqItem[] = [
  {
    q: "Can I try before paying?",
    a: "No. There is no free-of-charge allowance and no complimentary preview: every separation costs GPU time, so every run is paid. The entry point is the one-time $2.90 Trial Pack, which includes 15 minutes and the four stems as MP3 320 downloads. That is roughly five three-minute songs for less than most single-song karaoke purchases.",
  },
  {
    q: "What is the Trial Pack and how long does it last?",
    a: "The Trial Pack is a one-time $2.90 purchase that adds 15 minutes to your account. It is not a subscription and nothing renews automatically. Fifteen minutes is roughly five three-minute songs, and it never expires — use the minutes whenever you like.",
  },
  {
    q: "Are the monthly subscriptions available yet?",
    a: "No. Starter ($5/month, 90 minutes) and Pro ($9/month, 200 minutes) are listed for reference but are not on sale: their checkout is closed until the recurring plans are ready to deliver. The Trial Pack is the only plan you can buy today.",
  },
  {
    q: "Is the annual plan available?",
    a: "Not yet. Annual billing is not open either: the Starter Annual plan is planned at $39/year, and the final terms will be published before the first sale. Nothing is charged for it today because it cannot be ordered.",
  },
  {
    q: "Can I cancel at any time?",
    a: "There is nothing to cancel today: the Trial Pack is a one-time payment and does not renew, and no subscription can be started while the subscription plans are closed. When plans open, renewal and cancellation terms will be shown before purchase.",
  },
  {
    q: "What happens when I use all my minutes?",
    a: "Processing pauses until you add more. For now the only way to top up is another $2.90 Trial Pack; monthly subscriptions are not open yet. Failed jobs do not consume minutes, so you never lose allowance to a technical error.",
  },
  {
    q: "Is there a refund policy?",
    a: "Yes. Your first purchase — the Trial Pack included — is covered by a 14-day money-back guarantee as long as most of the minutes are unused. Duplicate charges and failed jobs are refunded or restored automatically. The full policy is on the refund page.",
  },
];

const COMPARE_ROWS: { feature: string; trial: string; starter: string; pro: string }[] = [
  { feature: "Price", trial: "$2.90 one-time", starter: "$5/month", pro: "$9/month" },
  { feature: "Minutes", trial: "15 total", starter: "90 / month", pro: "200 / month" },
  { feature: "Stems per job", trial: "4", starter: "4", pro: "4" },
  { feature: "Download format", trial: "MP3 320", starter: "MP3 320", pro: "MP3 320" },
  { feature: "Max track length", trial: "10 minutes", starter: "10 minutes", pro: "10 minutes" },
  { feature: "Availability", trial: "Available now", starter: "Coming soon", pro: "Coming soon" },
  { feature: "Renewal", trial: "None", starter: "Not open yet", pro: "Not open yet" },
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
        "AI vocal remover pricing: the one-time $2.90 Trial Pack includes 15 minutes and four MP3 stems. Starter, Pro and Annual subscriptions are not open yet and cannot be purchased today.",
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
          <div className="badge">Paid trial · subscriptions not open yet</div>
          <h1 className="display mx-auto mt-5 max-w-3xl text-4xl md:text-5xl">
            Pricing — the $2.90 Trial Pack is live; subscriptions are coming soon
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Start with a one-time $2.90 Trial Pack: 15 minutes, four stems, MP3 320 downloads. No free-of-charge
            allowance — every run is paid, which keeps the queue short and the quality predictable. Starter, Pro and the
            annual plan are not on sale yet; they open after launch sign-off.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          {VOICE_PLANS.map((plan) => {
            const purchasable = isPurchasable(plan.id);
            return (
              <div
                key={plan.id}
                id={plan.id === "voice-trial" ? "trial" : undefined}
                className={`card flex flex-col p-6 ${purchasable ? "border-violet-400/70 shadow-[0_0_50px_-30px_rgba(139,92,246,1)]" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-semibold text-slate-100">{plan.name}</h2>
                  <span
                    className={
                      purchasable
                        ? "rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-200"
                        : "rounded-full border border-slate-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400"
                    }
                  >
                    {purchasable ? "Available now" : "Coming soon"}
                  </span>
                </div>
                <p className="mt-4 text-4xl font-extrabold">
                  ${priceLabel(plan.price)}
                  <span className="text-sm font-normal text-slate-400">{priceSuffix(plan.billing)}</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {plan.billing === "annual"
                    ? "≈ $3.25/month · billed yearly when subscriptions open"
                    : plan.billing === "one-time"
                      ? "One-time · ≈ 5 songs · never expires"
                      : `${plan.minutes} minutes included when subscriptions open`}
                </p>
                <ul className="mt-5 flex-1 space-y-2 text-sm text-slate-300">
                  {displayFeatures(plan.id, plan.features).map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span aria-hidden="true" className="text-cyan-300">
                        ✓
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {purchasable ? (
                  <BuyButton planId={plan.id} className="btn mt-6 w-full btn-primary">
                    Buy the $2.90 trial
                  </BuyButton>
                ) : (
                  <div className="btn mt-6 w-full cursor-not-allowed border border-slate-700 bg-slate-800/40 text-center text-sm text-slate-400">
                    Coming soon — subscriptions not open yet
                  </div>
                )}
                <p className="mt-2 text-center text-[11px] text-slate-600">
                  {purchasable ? "No subscription · no renewal" : "Not on sale yet · no checkout available"}
                </p>
              </div>
            );
          })}
        </section>

        <p className="mt-4 text-center text-xs text-slate-500">
          Prices in USD. The Trial Pack is a one-time payment and does not renew. Subscriptions are not open yet, so no
          recurring charge can be started today. First purchase covered by the{" "}
          <Link href="/refund" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
            14-day money-back guarantee
          </Link>
          .
        </p>

        <section className="hairline mt-14 pt-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="display text-3xl md:text-4xl">Trial Pack now, subscriptions later</h2>
            <p className="mt-4 leading-relaxed text-slate-300">
              Start with the Trial Pack if you have a project or two: $2.90 once, 15 minutes, no renewal. Monthly
              subscriptions are not open yet. When they open, Starter will add 90 minutes per month at $5/month and Pro
              200 minutes at $9/month — neither can be purchased today, and the subscription cards on this page are
              shown for comparison only.
            </p>
            <p className="mt-4 leading-relaxed text-slate-300">
              Because no subscription can start today, there is nothing to cancel and no auto-renewal to manage: the
              only charge available is the one-time Trial Pack. When the monthly plans open, renewal and cancellation
              terms will be shown before the first payment.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="card p-5">
                <h3 className="font-semibold text-slate-100">Trial Pack — $2.90 once</h3>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-400">
                  <li>· 15 minutes, never expires</li>
                  <li>· 4 stems delivered as MP3 320</li>
                  <li>· No subscription, no renewal</li>
                  <li>· Best for one or two songs</li>
                </ul>
              </div>
              <div className="card border-slate-700 p-5">
                <h3 className="font-semibold text-slate-100">Starter — $5/mo</h3>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-400">
                  <li>· 90 minutes per month when it opens</li>
                  <li>· 4 stems, MP3 320</li>
                  <li>· Not on sale yet</li>
                  <li>· No checkout available today</li>
                </ul>
              </div>
              <div className="card p-5">
                <h3 className="font-semibold text-slate-100">Annual — $39/yr</h3>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-400">
                  <li>· 90 minutes per month when it opens</li>
                  <li>· Billed yearly when subscriptions open</li>
                  <li>· 4 stems, MP3 320</li>
                  <li>· Not on sale yet</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="hairline mt-14 pt-12">
          <div className="mx-auto max-w-4xl">
            <h2 className="display text-3xl md:text-4xl">Compare the live trial with the planned subscriptions</h2>
            <p className="mt-4 text-slate-300">
              The Trial Pack is a real 15-minute allowance with the full 4-stem output in MP3. Starter, Pro and Annual
              are listed for comparison only — they are not on sale yet.
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
              the full 4-stem output as MP3, and the minutes never expire. If the separation quality is not right for
              your material, the refund policy covers your first purchase for 14 days.
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
              There is no subscription to cancel today: the Trial Pack is one-time and does not renew, and the monthly
              plans cannot be ordered while their checkout is closed. When subscriptions open, renewal and cancellation
              terms will be published before the first payment. Read the full{" "}
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
          intro="Everything people ask before their first paid run — trial minutes, when subscriptions open, and refunds."
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
                One-time trial, 15 minutes, 4 MP3 stems, no subscription. It is the only plan on sale today. If the
                quality is not there, the 14-day guarantee covers your first purchase.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link href="/pricing#trial" className="btn btn-primary">
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
