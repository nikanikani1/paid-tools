import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentSections, type Section } from "@/components/ContentSections";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import {
  breadcrumbSchema,
  faqSchema,
  graphSchema,
  pageMetadata,
  type FaqItem,
} from "@/lib/seo";

export type LegalPageData = {
  slug: string;
  crumb: string;
  title: string;
  description: string;
  h1: string;
  updated: string;
  intro: string[];
  sections: Section[];
  faqs?: FaqItem[];
  contactNote?: string;
};

export function legalMetadata(data: LegalPageData) {
  return pageMetadata({ title: data.title, description: data.description, path: data.slug });
}

export function LegalPage({ data }: { data: LegalPageData }) {
  const nodes = [
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: data.crumb, path: data.slug },
    ]),
  ];
  if (data.faqs && data.faqs.length > 0) nodes.push(faqSchema(data.faqs));

  return (
    <>
      <JsonLd data={graphSchema(...nodes)} />
      <div className="mx-auto max-w-6xl px-6">
        <div className="pt-6">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: data.crumb }]} />
        </div>

        <header className="py-10 md:py-14">
          <div className="max-w-3xl">
            <div className="badge">Legal &amp; policy</div>
            <h1 className="display mt-5 text-4xl md:text-5xl">{data.h1}</h1>
            <p className="mt-3 text-xs uppercase tracking-widest text-slate-500">Last updated: {data.updated}</p>
            {data.intro.map((paragraph) => (
              <p key={paragraph} className="mt-4 leading-relaxed text-slate-300">
                {paragraph}
              </p>
            ))}
          </div>
        </header>

        <ContentSections sections={data.sections} />

        {data.contactNote && (
          <section className="hairline py-10">
            <div className="card max-w-3xl p-6">
              <p className="text-sm leading-relaxed text-slate-300">{data.contactNote}</p>
            </div>
          </section>
        )}

        {data.faqs && data.faqs.length > 0 && <Faq items={data.faqs} title="Policy questions" />}

        <div className="pb-16" />
      </div>
    </>
  );
}
