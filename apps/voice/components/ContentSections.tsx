export type Section = {
  id?: string;
  h2: string;
  paragraphs?: string[];
  bullets?: string[];
  bulletsColumns?: 1 | 2;
};

export function ContentSections({ sections }: { sections: Section[] }) {
  return (
    <>
      {sections.map((section) => (
        <section key={section.h2} id={section.id} className="hairline py-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="display text-2xl md:text-3xl">{section.h2}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="mt-4 leading-relaxed text-slate-300">
                {paragraph}
              </p>
            ))}
            {section.bullets && section.bullets.length > 0 && (
              <ul
                className={`mt-5 grid gap-2.5 ${section.bulletsColumns === 2 ? "sm:grid-cols-2" : ""}`}
              >
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2.5 text-sm leading-relaxed text-slate-300">
                    <span aria-hidden="true" className="mt-0.5 text-cyan-300">
                      ✓
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}
    </>
  );
}
