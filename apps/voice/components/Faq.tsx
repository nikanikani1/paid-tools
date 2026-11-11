import type { FaqItem } from "@/lib/seo";

export function Faq({
  items,
  title = "Frequently asked questions",
  id = "faq",
  intro,
}: {
  items: FaqItem[];
  title?: string;
  id?: string;
  intro?: string;
}) {
  return (
    <section id={id} className="hairline py-14">
      <div className="mx-auto max-w-3xl">
        <h2 className="display text-3xl md:text-4xl">{title}</h2>
        {intro && <p className="mt-4 text-slate-400">{intro}</p>}
        <div className="mt-8 grid gap-3">
          {items.map((item) => (
            <details key={item.q} className="faq card px-5 py-4">
              <summary className="flex items-center justify-between gap-4">
                <span className="text-base font-semibold text-slate-100">{item.q}</span>
                <span aria-hidden="true" className="faq-icon">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
