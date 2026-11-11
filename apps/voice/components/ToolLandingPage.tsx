import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentSections, type Section } from "@/components/ContentSections";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { StemGrid } from "@/components/StemGrid";
import { ToolDemo } from "@/components/ToolDemo";
import {
  breadcrumbSchema,
  faqSchema,
  graphSchema,
  webApplicationSchema,
  type FaqItem,
} from "@/lib/seo";

export type ToolPageData = {
  /** Route, e.g. "/ai-vocal-remover" */
  slug: string;
  /** Short label used in breadcrumbs and schema */
  crumb: string;
  title: string;
  description: string;
  h1: string;
  badge: string;
  intro: string[];
  toolCta: string;
  quickFacts: string[];
  showStems?: boolean;
  sections: Section[];
  faqs: FaqItem[];
  related: { href: string; label: string; blurb: string }[];
  finalCta: { title: string; body: string };
};

export function ToolLandingPage({ data }: { data: ToolPageData }) {
  const schema = graphSchema(
    webApplicationSchema({ name: data.h1, description: data.description, path: data.slug }),
    faqSchema(data.faqs),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: data.crumb, path: data.slug },
    ]),
  );

  return (
    <>
      <JsonLd data={schema} />
      <div className="mx-auto max-w-6xl px-6">
        <div className="pt-6">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: data.crumb }]} />
        </div>

        <section className="relative py-12 text-center md:py-16">
          <div className="badge">{data.badge}</div>
          <h1 className="display mx-auto mt-5 max-w-4xl text-4xl md:text-[3.4rem]">{data.h1}</h1>
          <div className="mx-auto mt-5 max-w-2xl space-y-3 text-left text-slate-300 sm:text-center">
            {data.intro.map((paragraph) => (
              <p key={paragraph} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {data.quickFacts.map((fact) => (
              <span key={fact} className="chip">
                {fact}
              </span>
            ))}
          </div>

          <ToolDemo cta={data.toolCta} />
          <p className="mt-4 text-xs text-slate-500">
            Free 3-minute preview · no signup · files deleted automatically after processing
          </p>
        </section>

        {data.showStems !== false && (
          <section id="stems" className="hairline py-12">
            <div className="mx-auto max-w-4xl">
              <h2 className="display text-2xl md:text-3xl">Four stems, one upload</h2>
              <p className="mt-4 leading-relaxed text-slate-300">
                Every job returns the full set of separations, not just a karaoke-style instrumental. That means one
                upload gives you an acapella, a backing track, a drum loop and a bass line you can drop straight into
                your DAW.
              </p>
              <div className="mt-6">
                <StemGrid heading="What comes back in your download" />
              </div>
            </div>
          </section>
        )}

        <ContentSections sections={data.sections} />

        <Faq items={data.faqs} />

        <section id="related" className="hairline py-14">
          <div className="mx-auto max-w-4xl">
            <h2 className="display text-2xl md:text-3xl">Related vocal remover tools</h2>
            <p className="mt-3 text-slate-400">
              Not sure which page fits your job? These focused tools walk through the exact workflow for each use
              case — all of them run on the same stem-separation engine.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {data.related.map((item) => (
                <Link key={item.href} href={item.href} className="card-hover card p-5">
                  <span className="font-semibold text-slate-100">{item.label}</span>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.blurb}</p>
                  <span className="mt-3 inline-block text-xs font-medium text-cyan-300">Open tool →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14">
          <div className="card relative overflow-hidden p-8 text-center md:p-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_240px_at_50%_0%,rgba(109,92,255,0.25),transparent_70%)]"
            />
            <div className="relative">
              <h2 className="display mx-auto max-w-2xl text-2xl md:text-3xl">{data.finalCta.title}</h2>
              <p className="mx-auto mt-3 max-w-xl text-slate-300">{data.finalCta.body}</p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link href="/#tool" className="btn btn-primary">
                  Separate a track free
                </Link>
                <Link href="/pricing" className="btn btn-ghost">
                  See pricing
                </Link>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Read <Link href="/how-it-works" className="text-slate-400 underline underline-offset-2 hover:text-slate-200">how the stem separation works</Link> or{" "}
                <Link href="/privacy" className="text-slate-400 underline underline-offset-2 hover:text-slate-200">how your audio is handled</Link>.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
