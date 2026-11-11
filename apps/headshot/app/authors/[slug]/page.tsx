import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthorByline } from "../../components/editorial";
import { Breadcrumbs, JsonLd, Prose, RelatedLinks } from "../../components/ui";
import { AUTHORS, authorPath, getAuthor } from "../../lib/authors";
import { CONTACT, CONTENT_UPDATED, SITE_NAME, SITE_URL } from "../../lib/site";
import { breadcrumbJsonLd, buildMetadata, canonicalFor } from "../../lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return AUTHORS.map((author) => ({ slug: author.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) return {};
  return buildMetadata({
    title: `${author.name} — Author Profile & Editorial Standards`,
    description: `${author.name}: ${author.shortBio} What we cover, how we work, the update log and how to send corrections.`,
    path: authorPath(author.slug),
  });
}

export default async function AuthorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) notFound();

  const profilePath = authorPath(author.slug);

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          name: `${author.name} — author profile`,
          url: canonicalFor(profilePath),
          inLanguage: "en-US",
          dateModified: author.lastUpdated,
          mainEntity: {
            "@type": "Person",
            name: author.name,
            jobTitle: author.role,
            description: author.shortBio,
            email: author.contactEmail,
            url: canonicalFor(profilePath),
            worksFor: {
              "@type": "Organization",
              name: SITE_NAME,
              url: SITE_URL,
            },
            knowsAbout: [
              "AI headshot generation",
              "identity-preserving image generation",
              "professional headshot standards",
              "face data privacy",
            ],
          },
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
          { name: author.name, path: profilePath },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
          { name: author.name, path: profilePath },
        ]}
      />

      <section className="mx-auto max-w-6xl px-6 pb-6 pt-8">
        <p className="sans mb-4 inline-flex rounded-full border border-orange-300 bg-orange-50 px-3 py-1 text-xs uppercase tracking-wide text-orange-800">
          Author profile · editorial standards
        </p>
        <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
          {author.name} — Author Profile &amp; Editorial Standards
        </h1>
        <p className="sans mt-4 max-w-3xl text-base leading-relaxed text-stone-700">
          {author.role} · <Link href="/about">About PortraitLab</Link> ·{" "}
          <a href={`mailto:${author.contactEmail}`} className="text-orange-700 underline underline-offset-2">
            {author.contactEmail}
          </a>
        </p>
        <AuthorByline />
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="sans grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <Prose>
            <h2 className="font-serif text-2xl font-bold text-stone-900">Bio</h2>
            {author.bio.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
            <h3>What this team covers</h3>
            <ul>
              {author.covers.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </Prose>
          <aside className="space-y-4">
            <div className="rounded-2xl border border-stone-300 bg-white/70 p-5">
              <h2 className="font-serif text-lg font-bold text-stone-900">How we work</h2>
              <ul className="sans mt-3 space-y-2 text-sm leading-relaxed text-stone-700">
                {author.howWeWork.map((rule) => (
                  <li key={rule.slice(0, 40)}>· {rule}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-stone-300 bg-white/70 p-5">
              <h2 className="font-serif text-lg font-bold text-stone-900">Contact</h2>
              <p className="sans mt-2 text-sm leading-relaxed text-stone-700">
                Corrections:{" "}
                <a href={`mailto:${author.contactEmail}`} className="text-orange-700 underline underline-offset-2">
                  {author.contactEmail}
                </a>
              </p>
              <p className="sans mt-2 text-sm leading-relaxed text-stone-700">
                Support, billing, privacy and DMCA channels are listed on the{" "}
                <Link href="/contact" className="text-orange-700 underline underline-offset-2">
                  contact page
                </Link>
                .
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Update log</h2>
        <p className="sans mt-2 max-w-3xl text-sm leading-relaxed text-stone-600">
          Substantive changes to pages this team maintains. Dates are publication dates, not build dates; the site is
          rebuilt from the same content.
        </p>
        <div className="sans mt-6 overflow-x-auto rounded-2xl border border-stone-300 bg-white/60">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-stone-100/80 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Date
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Change
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {author.updateLog.map((entry) => (
                <tr key={`${entry.date}-${entry.note.slice(0, 30)}`}>
                  <td className="whitespace-nowrap px-5 py-3 text-stone-600">
                    <time dateTime={entry.date}>{entry.date}</time>
                  </td>
                  <td className="px-5 py-3 text-stone-700">{entry.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="sans mt-3 text-xs text-stone-500">
          Last updated: <time dateTime={CONTENT_UPDATED}>{CONTENT_UPDATED}</time>. Editorial inbox:{" "}
          <a href={`mailto:${CONTACT.editorial}`} className="text-orange-700 underline underline-offset-2">
            {CONTACT.editorial}
          </a>
          .
        </p>
      </section>

      <RelatedLinks
        title="Pages this team maintains"
        links={[
          { href: "/", label: "Professional headshots", body: "The main product page and the $9 Sample Pack entry point." },
          { href: "/ai-headshot-generator", label: "AI headshot generator", body: "The pipeline deep-dive: definition, process, comparison." },
          { href: "/about", label: "About PortraitLab", body: "Who we are, why the service is paid-only, and what we do not claim." },
          { href: "/contact", label: "Contact", body: "Support, billing, privacy, DMCA and editorial channels." },
          { href: "/pricing", label: "Pricing", body: "Packages, redo and refund policy." },
          { href: "/how-it-works", label: "How it works", body: "Quality gate, identity pass, face merge and delivery." },
        ]}
      />
    </main>
  );
}
