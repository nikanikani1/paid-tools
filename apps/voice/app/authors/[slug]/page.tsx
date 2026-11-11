import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { AUTHORS, authorPath, getAuthor } from "@/lib/authors";
import {
  absoluteUrl,
  breadcrumbSchema,
  graphSchema,
  pageMetadata,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return AUTHORS.map((author) => ({ slug: author.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) return {};
  return pageMetadata({
    title: `${author.name} — Author Profile & Editorial Standards`,
    description: `${author.name}: ${author.shortBio} What we cover, how we work, our update log and how to send corrections.`,
    path: authorPath(author.slug),
  });
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) notFound();

  const profilePath = authorPath(author.slug);
  const schema = graphSchema(
    {
      "@type": "ProfilePage",
      "@id": `${absoluteUrl(profilePath)}#profile`,
      url: absoluteUrl(profilePath),
      name: `${author.name} — author profile`,
      inLanguage: "en",
      dateModified: author.lastUpdated,
      mainEntity: {
        "@type": "Person",
        "@id": `${absoluteUrl(profilePath)}#author`,
        name: author.name,
        jobTitle: author.role,
        description: author.shortBio,
        email: author.contactEmail,
        worksFor: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
        },
      },
    },
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: author.name, path: profilePath },
    ]),
  );

  return (
    <>
      <JsonLd data={schema} />
      <div className="mx-auto max-w-6xl px-6">
        <div className="pt-6">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: author.name }]} />
        </div>

        <header className="py-10 md:py-14">
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-wrap items-center gap-4">
              <span
                aria-hidden="true"
                className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-lg font-black tracking-tight text-white"
              >
                SS
              </span>
              <div>
                <h1 className="display text-4xl md:text-5xl">{author.name}</h1>
                <p className="mt-2 text-sm text-slate-400">{author.role}</p>
              </div>
            </div>
            <p className="mt-4 text-xs uppercase tracking-widest text-slate-500">
              Author profile · Last updated: {author.lastUpdated}
            </p>
            <p className="mt-5 leading-relaxed text-slate-300">{author.shortBio}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/about" className="btn btn-ghost btn-sm">
                About the team
              </Link>
              <a href={`mailto:${author.contactEmail}`} className="btn btn-ghost btn-sm">
                Email the editors
              </a>
            </div>
          </div>
        </header>

        <section className="hairline py-14">
          <div className="mx-auto max-w-3xl">
            <h2 className="display text-3xl md:text-4xl">Who we are</h2>
            {author.bio.map((paragraph) => (
              <p key={paragraph} className="mt-4 leading-relaxed text-slate-300">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section className="hairline py-14">
          <div className="mx-auto max-w-4xl">
            <h2 className="display text-3xl md:text-4xl">What we cover</h2>
            <p className="mt-4 leading-relaxed text-slate-300">
              Every guide below is written and maintained by this author entity, carries a last-updated date and is
              linked from the relevant tool page.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {author.covers.map((item) => (
                <Link key={item.href} href={item.href} className="card-hover card p-4">
                  <span className="font-semibold text-slate-100">{item.label}</span>
                  <span className="mt-2 block text-xs text-cyan-300">Open page →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="hairline py-14">
          <div className="mx-auto max-w-3xl">
            <h2 className="display text-3xl md:text-4xl">How we work</h2>
            <ul className="mt-5 space-y-3">
              {author.howWeWork.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-slate-300">
                  <span aria-hidden="true" className="mt-0.5 text-cyan-300">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="hairline py-14">
          <div className="mx-auto max-w-3xl">
            <h2 className="display text-3xl md:text-4xl">Update log</h2>
            <p className="mt-4 text-slate-400">
              Material changes to our guides are recorded here. Minor fixes are made in place and reflected in each
              page's last-updated date.
            </p>
            <ol className="mt-6 space-y-3">
              {author.updateLog.map((entry) => (
                <li key={entry.note} className="card p-4">
                  <p className="font-mono text-xs text-cyan-300">
                    <time dateTime={entry.date}>{entry.date}</time>
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{entry.note}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="hairline py-14">
          <div className="card mx-auto max-w-3xl p-6 md:p-8">
            <h2 className="text-xl font-semibold">Corrections and contact</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Found a factual error, an outdated step or a broken link? Email{" "}
              <a href={`mailto:${author.contactEmail}`} className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                {author.contactEmail}
              </a>{" "}
              with the page URL. Read the{" "}
              <Link href="/contact" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                contact page
              </Link>{" "}
              for every support channel, or the{" "}
              <Link href="/about" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                about page
              </Link>{" "}
              for our editorial standards.
            </p>
          </div>
        </section>

        <div className="pb-16" />
      </div>
    </>
  );
}
