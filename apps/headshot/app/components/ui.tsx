import Link from "next/link";
import type { ReactNode } from "react";
import type { JsonLd as JsonLdData } from "../lib/seo";
import { PLANS, type FaqItem } from "../lib/site";

export function JsonLd({ data }: { data: JsonLdData }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="sans mx-auto max-w-6xl px-6 pt-6 text-xs text-stone-500">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={item.path} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {index === items.length - 1 ? (
              <span className="text-stone-700">{item.name}</span>
            ) : (
              <Link href={item.path} className="hover:text-orange-700">
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHero({
  eyebrow,
  h1,
  intro,
  children,
}: {
  eyebrow?: string;
  h1: string;
  intro: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-10 pt-10">
      {eyebrow && (
        <p className="sans mb-4 inline-flex rounded-full border border-orange-300 bg-orange-50 px-3 py-1 text-xs uppercase tracking-wide text-orange-800">
          {eyebrow}
        </p>
      )}
      <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">{h1}</h1>
      <div className="sans mt-5 max-w-3xl space-y-4 text-base leading-relaxed text-stone-700">{intro}</div>
      {children}
    </section>
  );
}

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  tone = "plain",
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  intro?: ReactNode;
  children: ReactNode;
  tone?: "plain" | "raised";
}) {
  return (
    <section
      id={id}
      className={`mx-auto max-w-6xl px-6 py-12 ${tone === "raised" ? "my-6 rounded-3xl border border-stone-300 bg-white/60" : ""}`}
    >
      {eyebrow && (
        <p className="sans text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">{eyebrow}</p>
      )}
      {title && <h2 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>}
      {intro && <div className="sans mt-4 max-w-3xl space-y-3 text-base leading-relaxed text-stone-700">{intro}</div>}
      <div className={title || intro ? "mt-8" : ""}>{children}</div>
    </section>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="sans max-w-3xl space-y-4 text-base leading-relaxed text-stone-700 [&_a]:text-orange-700 [&_a]:underline [&_a]:underline-offset-2 [&_h3]:mt-8 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-stone-900 [&_strong]:text-stone-900 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
      {children}
    </div>
  );
}

export function StepGrid({
  steps,
}: {
  steps: { title: string; body: string; detail?: string }[];
}) {
  return (
    <ol className="sans grid gap-4 md:grid-cols-3">
      {steps.map((step, index) => (
        <li key={step.title} className="rounded-2xl border border-stone-300 bg-white/70 p-6">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-700 text-sm font-bold text-white">
            {index + 1}
          </span>
          <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">{step.body}</p>
          {step.detail && <p className="mt-3 border-t border-stone-200 pt-3 text-xs text-stone-500">{step.detail}</p>}
        </li>
      ))}
    </ol>
  );
}

export function FeatureGrid({ items }: { items: { title: string; body: string }[] }) {
  return (
    <div className="sans grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.title} className="rounded-2xl border border-stone-300 bg-white/70 p-5">
          <h3 className="text-base font-semibold">{item.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.body}</p>
        </div>
      ))}
    </div>
  );
}

export function FaqList({ items, title }: { items: FaqItem[]; title?: string }) {
  return (
    <div className="sans divide-y divide-stone-300 rounded-2xl border border-stone-300 bg-white/60">
      {items.map((item) => (
        <details key={item.q} className="group p-5">
          <summary className="cursor-pointer list-none text-base font-semibold text-stone-900 marker:hidden">
            <span className="mr-2 text-orange-700 group-open:hidden" aria-hidden="true">
              +
            </span>
            <span className="mr-2 hidden text-orange-700 group-open:inline" aria-hidden="true">
              −
            </span>
            {title ? item.q : item.q}
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

export function PlanCards({ ctaHref = "/#generator" }: { ctaHref?: string }) {
  return (
    <div className="sans grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {PLANS.map((plan) => {
        const isEntry = plan.images <= 5;
        return (
          <div
            key={plan.id}
            className={`flex flex-col rounded-2xl border bg-white/70 p-6 ${
              plan.popular ? "border-orange-500 shadow-[0_1px_0_0_rgba(194,65,12,0.2)]" : "border-stone-300"
            }`}
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              {plan.popular ? (
                <span className="rounded-full bg-orange-700 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                  Popular
                </span>
              ) : isEntry ? (
                <span className="rounded-full border border-orange-400 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-orange-800">
                  Entry
                </span>
              ) : null}
            </div>
            <p className="mt-4 text-4xl font-extrabold">
              ${plan.price}
              <span className="ml-1 text-sm font-normal text-stone-500">one-time</span>
            </p>
            <p className="mt-1 text-sm text-stone-500">
              {plan.images} headshots · ${(plan.price / plan.images).toFixed(2)} each
            </p>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-stone-700">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span aria-hidden="true" className="text-orange-700">
                    ·
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href={ctaHref}
              className="mt-6 rounded-xl bg-orange-700 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-orange-600"
            >
              Start with {plan.name}
            </Link>
          </div>
        );
      })}
      <p className="text-xs text-stone-500 sm:col-span-2 xl:col-span-4">
        There is no free tier and no free preview image: every order is paid, and the cheapest entry point is the $9
        Sample Pack (5 headshots). All packages are one-time payments with a commercial licence and one free redo within
        48 hours.{" "}
        <Link href="/pricing" className="text-orange-700 underline underline-offset-2">
          Compare packages
        </Link>
        .
      </p>
    </div>
  );
}

export function SampleGrid({ title }: { title?: string }) {
  const samples = [
    { label: "Corporate · studio grey", tone: "from-stone-300 to-stone-200" },
    { label: "LinkedIn · soft office", tone: "from-amber-200 to-orange-100" },
    { label: "Creative · window light", tone: "from-orange-200 to-rose-100" },
    { label: "Medical · clean clinic", tone: "from-teal-100 to-stone-200" },
  ];
  return (
    <figure className="sans">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {samples.map((sample) => (
          <div key={sample.label} className="overflow-hidden rounded-2xl border border-stone-300 bg-white/60">
            <div className={`aspect-[4/5] bg-gradient-to-br ${sample.tone} p-4`}>
              <div className="flex h-full items-end">
                <span className="rounded-full bg-white/70 px-2 py-1 text-[11px] font-medium text-stone-700">
                  Illustrative preview
                </span>
              </div>
            </div>
            <figcaption className="px-4 py-3 text-xs text-stone-600">{sample.label}</figcaption>
          </div>
        ))}
      </div>
      <figcaption className="mt-3 text-xs text-stone-500">
        {title ?? "Illustrative previews of the style presets included in every package."} Licensed models only — no
        public figures, no scraped faces.
      </figcaption>
    </figure>
  );
}

export function StyleTable({ styles }: { styles: { name: string; blurb: string; bestFor: string }[] }) {
  return (
    <div className="sans overflow-x-auto rounded-2xl border border-stone-300 bg-white/60">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-stone-100/80 text-xs uppercase tracking-wide text-stone-500">
          <tr>
            <th scope="col" className="px-5 py-3 font-semibold">
              Style preset
            </th>
            <th scope="col" className="px-5 py-3 font-semibold">
              What it looks like
            </th>
            <th scope="col" className="px-5 py-3 font-semibold">
              Best for
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200">
          {styles.map((style) => (
            <tr key={style.name}>
              <th scope="row" className="px-5 py-4 align-top font-semibold text-stone-900">
                {style.name}
              </th>
              <td className="px-5 py-4 align-top text-stone-600">{style.blurb}</td>
              <td className="px-5 py-4 align-top text-stone-600">{style.bestFor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RelatedLinks({
  title = "Related pages",
  links,
}: {
  title?: string;
  links: { href: string; label: string; body?: string }[];
}) {
  return (
    <Section eyebrow="Keep exploring" title={title}>
      <div className="sans grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-2xl border border-stone-300 bg-white/60 p-5 transition hover:border-orange-500"
          >
            <span className="block text-base font-semibold text-stone-900">{link.label}</span>
            {link.body && <span className="mt-2 block text-sm leading-relaxed text-stone-600">{link.body}</span>}
            <span className="mt-3 block text-xs font-semibold uppercase tracking-wide text-orange-700">
              Read more →
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}

export function CtaBand({
  title = "Ready to stop using the photo from 2015?",
  body = "Order the $9 Sample Pack (5 headshots) to test the pipeline on your own face, then scale up to 40, 60 or 100 images. One-time payment, one free redo included.",
  href = "/#generator",
  cta = "Start with the $9 Sample Pack",
}: {
  title?: string;
  body?: string;
  href?: string;
  cta?: string;
}) {
  return (
    <section className="sans mx-auto mt-8 max-w-6xl px-6 py-12">
      <div className="rounded-3xl border border-orange-300 bg-orange-50 p-8 md:p-10">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-stone-900">{title}</h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-stone-700">{body}</p>
        <Link
          href={href}
          className="mt-6 inline-flex rounded-xl bg-orange-700 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
        >
          {cta}
        </Link>
      </div>
    </section>
  );
}

export function KeyFacts({ facts }: { facts: { label: string; value: string }[] }) {
  return (
    <dl className="sans grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {facts.map((fact) => (
        <div key={fact.label} className="rounded-2xl border border-stone-300 bg-white/60 p-5">
          <dt className="text-xs uppercase tracking-wide text-stone-500">{fact.label}</dt>
          <dd className="mt-2 text-lg font-semibold text-stone-900">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
