import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BeforeAfter } from "@/components/BeforeAfter";
import { SiteChrome } from "@/components/SiteChrome";
import { BRAND } from "@/lib/brands";
import { STYLE_PAGES, getStylePage } from "@/lib/style-pages";
import {
  breadcrumbJsonLd,
  buildMetadata,
  faqPageJsonLd,
  graphSchema,
  webApplicationJsonLd,
} from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return STYLE_PAGES.map((page) => ({ slug: page.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getStylePage(slug);
  if (!page) return {};
  return buildMetadata({
    title: page.title,
    description: page.description,
    path: `/styles/${page.id}`,
  });
}

export default async function StyleLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getStylePage(slug);
  if (!page) notFound();

  const related = STYLE_PAGES.filter((entry) => entry.id !== page.id);
  const schema = graphSchema(
    webApplicationJsonLd({
      name: page.h1,
      description: page.description,
      path: `/styles/${page.id}`,
    }),
    faqPageJsonLd(page.faqs),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: page.style.label, path: `/styles/${page.id}` },
    ]),
  );

  return (
    <SiteChrome brand={BRAND}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <main>
        <div className="mx-auto max-w-6xl px-5 pt-8">
          <nav aria-label="Breadcrumb" className="sans text-xs opacity-60" style={{ color: "var(--ink)" }}>
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="underline-offset-2 hover:underline">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">{page.style.label}</li>
            </ol>
          </nav>
        </div>

        <section className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-[1.05fr_1fr] md:items-center md:py-14">
          <div>
            <p className="sans text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--brand)" }}>
              {page.eyebrow}
            </p>
            <h1 className="mt-3 font-serif text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl" style={{ color: "var(--ink)" }}>
              {page.h1}
            </h1>
            <div className="sans mt-4 space-y-3 text-sm leading-relaxed opacity-75 md:text-base" style={{ color: "var(--ink)" }}>
              {page.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="sans mt-5 flex flex-wrap gap-2 text-xs">
              {[BRAND.unitLabel, `${BRAND.price} one-time`, "No subscription", "No free trial"].map((fact) => (
                <span
                  key={fact}
                  className="rounded-full border border-black/10 px-3 py-1 opacity-80"
                  style={{ color: "var(--ink)", backgroundColor: "var(--brand-soft)" }}
                >
                  {fact}
                </span>
              ))}
            </div>
            <div className="sans mt-6 flex flex-wrap gap-3">
              <Link
                href="/#studio"
                className="rounded-full px-6 py-3 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ backgroundColor: "var(--brand)", outlineColor: "var(--brand)" }}
              >
                Try this style — {BRAND.price}
              </Link>
              <Link
                href="/pricing"
                className="rounded-full border border-black/15 px-6 py-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ color: "var(--ink)", outlineColor: "var(--brand)" }}
              >
                What is included
              </Link>
            </div>
          </div>

          <div>
            <BeforeAfter
              before={page.beforeImage}
              after={page.style.image}
              beforeAlt={
                BRAND.kind === "landscape"
                  ? "Original demo photo of a house and yard"
                  : "AI-generated demo portrait before the colour change"
              }
              afterAlt={`AI-generated ${page.style.label} demo preview, not a customer result`}
              beforeLabel={page.beforeLabel}
              afterLabel={page.afterLabel}
              frameClassName={BRAND.kind === "landscape" ? "aspect-[3/2]" : "aspect-square"}
            />
            <p className="sans mt-3 text-[11px] leading-relaxed opacity-60" style={{ color: "var(--ink)" }}>
              AI-generated demo using a stock photo — not a customer result. Your output depends on your own photo.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-5">
          {page.sections.map((section) => (
            <section key={section.heading} className="border-t border-black/10 py-10">
              <h2 className="font-serif text-2xl font-bold sm:text-3xl" style={{ color: "var(--ink)" }}>
                {section.heading}
              </h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="sans mt-3 text-sm leading-relaxed opacity-75 md:text-base" style={{ color: "var(--ink)" }}>
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul className="sans mt-4 space-y-2 text-sm leading-relaxed" style={{ color: "var(--ink)" }}>
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2.5">
                      <span aria-hidden="true" style={{ color: "var(--brand)" }}>
                        ·
                      </span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section className="border-t border-black/10 py-10">
            <h2 className="font-serif text-2xl font-bold sm:text-3xl" style={{ color: "var(--ink)" }}>
              Other {BRAND.kind === "landscape" ? "landscape directions" : "shade families"}
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {related.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/styles/${entry.id}`}
                  className="group overflow-hidden rounded-2xl border border-black/10 bg-white/60 transition hover:border-black/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ outlineColor: "var(--brand)" }}
                >
                  <img
                    src={entry.style.image}
                    alt={`AI-generated ${entry.style.label} demo preview`}
                    width={900}
                    height={600}
                    loading="lazy"
                    className={`w-full object-cover ${BRAND.kind === "landscape" ? "aspect-[3/2]" : "aspect-square"}`}
                  />
                  <span className="sans flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <span className="font-semibold" style={{ color: "var(--ink)" }}>
                      {entry.style.label}
                    </span>
                    <span style={{ color: "var(--brand)" }}>Read the guide →</span>
                  </span>
                </Link>
              ))}
            </div>
            <p className="sans mt-4 text-sm leading-relaxed opacity-70" style={{ color: "var(--ink)" }}>
              <Link href="/" className="underline underline-offset-2">
                Back to the {BRAND.kind === "landscape" ? "landscape" : "hair-colour"} home page
              </Link>{" "}
              ·{" "}
              <Link href="/pricing" className="underline underline-offset-2">
                See the {BRAND.price} pack
              </Link>
            </p>
          </section>

          <section className="border-t border-black/10 py-10">
            <h2 className="font-serif text-2xl font-bold sm:text-3xl" style={{ color: "var(--ink)" }}>
              {page.style.label} questions
            </h2>
            <div className="mt-5 divide-y divide-black/10 rounded-2xl border border-black/10 bg-white/60">
              {page.faqs.map((faq) => (
                <details key={faq.q} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                    <span className="sans text-sm font-semibold sm:text-base" style={{ color: "var(--ink)" }}>
                      {faq.q}
                    </span>
                    <span
                      aria-hidden="true"
                      className="sans mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full border border-black/15 text-sm transition-transform group-open:rotate-45"
                      style={{ color: "var(--ink)" }}
                    >
                      +
                    </span>
                  </summary>
                  <p className="sans mt-3 text-sm leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <section className="pb-20 pt-4">
            <div className="rounded-3xl border border-black/10 p-8 text-center sm:p-10" style={{ backgroundColor: "var(--brand-soft)" }}>
              <h2 className="font-serif text-3xl font-bold" style={{ color: "var(--ink)" }}>
                Try {page.style.label.toLowerCase()} on your own photo
              </h2>
              <p className="sans mx-auto mt-3 max-w-xl text-sm leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
                {BRAND.unitLabel} for {BRAND.price}, one-time. Upload one photo, pick this style and download the
                concepts. No subscription, no free trial.
              </p>
              <Link
                href="/#studio"
                className="sans mt-6 inline-block rounded-full px-6 py-3 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ backgroundColor: "var(--brand)", outlineColor: "var(--brand)" }}
              >
                Upload a photo — {BRAND.price}
              </Link>
              <p className="sans mt-4 text-xs leading-relaxed opacity-60" style={{ color: "var(--ink)" }}>
                Read the{" "}
                <Link href="/refund" className="underline underline-offset-2">
                  refund policy
                </Link>{" "}
                or the{" "}
                <Link href="/terms" className="underline underline-offset-2">
                  terms
                </Link>
                .
              </p>
            </div>
          </section>
        </div>
      </main>
    </SiteChrome>
  );
}
