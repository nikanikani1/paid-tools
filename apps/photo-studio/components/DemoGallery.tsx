import { BRAND } from "@/lib/brands";

const COPY =
  BRAND.kind === "landscape"
    ? {
        eyebrow: "Demo — not a customer result",
        title: "See what one yard photo becomes",
        intro:
          "This is a stock yard photo, not a customer's. The edit is instructed to keep the house, pool, fence and camera angle in place while changing the planting, paving and lighting — so you can judge a direction before calling a contractor.",
        beforeLabel: "Before — stock yard photo",
        afterLabel: "After — Modern / clean",
        beforeAlt: "Original stock photo of a house with a pool and a plain lawn",
        afterAlt: "AI landscape concept for the same house, with modern paving and planting",
        afterCaption: "The edit is instructed to keep the house and pool; check each result before relying on it.",
        disclaimer:
          "Demo images are illustrative and AI-generated from a stock photo. They are not a customer result, a construction drawing or a guarantee of what your own photo will produce.",
      }
    : {
        eyebrow: "Demo — not a customer result",
        title: "See one selfie, four shades",
        intro:
          "This is an AI-generated demo face, not a customer. The same selfie is edited into four looks; the edit is instructed to keep the face, expression, haircut and background fixed so you can judge the colour instead of a new person.",
        beforeLabel: "Before — AI demo selfie",
        afterLabel: "After — Warm blonde",
        beforeAlt: "AI-generated demo portrait with dark hair",
        afterAlt: "Same AI demo portrait with warm blonde hair",
        afterCaption: "Only the hair colour is meant to change; AI edits can still shift small details.",
        disclaimer:
          "Demo images are illustrative and AI-generated. They are not a customer result and do not guarantee how a shade will look on your hair, under your lighting or with your stylist's formula.",
      };

const BEFORE = BRAND.kind === "landscape" ? "/samples/landscape/yard-before.jpg" : "/samples/hair/selfie-before.jpg";
const AFTER = BRAND.kind === "landscape" ? "/samples/landscape/modern-1.jpg" : "/samples/hair/blonde-1.jpg";
const AFTER_2 = BRAND.kind === "landscape" ? "/samples/landscape/modern-2.jpg" : "/samples/hair/blonde-2.jpg";
const FRAME = BRAND.kind === "landscape" ? "aspect-[3/2]" : "aspect-square";

export function DemoGallery() {
  return (
    <section id="examples" className="scroll-mt-24 border-b border-black/10" style={{ backgroundColor: "var(--brand-soft)" }}>
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <div className="grid gap-6 md:grid-cols-[1fr_1.1fr] md:items-end">
          <div>
            <p className="sans text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--brand)" }}>
              {COPY.eyebrow}
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "var(--ink)" }}>
              {COPY.title}
            </h2>
          </div>
          <p className="sans text-sm leading-relaxed opacity-75 md:pb-1" style={{ color: "var(--ink)" }}>
            {COPY.intro}
          </p>
        </div>

        <div className="mt-8 grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
          <figure className="overflow-hidden rounded-2xl border border-black/10 bg-white">
            <div className={`${FRAME} overflow-hidden`}>
              <img
                src={BEFORE}
                alt={COPY.beforeAlt}
                width={900}
                height={600}
                loading="eager"
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className="sans flex items-center justify-between gap-3 px-4 py-3 text-xs font-semibold" style={{ color: "var(--ink)" }}>
              <span>{COPY.beforeLabel}</span>
              <span className="rounded-full border border-black/10 px-2 py-0.5 text-[10px] uppercase tracking-wide opacity-60">Input</span>
            </figcaption>
          </figure>

          <div aria-hidden="true" className="mx-auto grid h-10 w-10 place-items-center rounded-full text-lg font-bold text-white md:h-11 md:w-11" style={{ backgroundColor: "var(--brand)" }}>
            →
          </div>

          <figure className="overflow-hidden rounded-2xl border border-black/10 bg-white">
            <div className={`${FRAME} overflow-hidden`}>
              <img
                src={AFTER}
                alt={COPY.afterAlt}
                width={900}
                height={600}
                loading="eager"
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className="sans flex items-center justify-between gap-3 px-4 py-3 text-xs font-semibold" style={{ color: "var(--ink)" }}>
              <span>{COPY.afterLabel}</span>
              <span className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide text-white" style={{ backgroundColor: "var(--brand)" }}>AI result</span>
            </figcaption>
          </figure>
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="sans text-xs leading-relaxed opacity-65" style={{ color: "var(--ink)" }}>
            {COPY.afterCaption}
          </p>
          <div className="flex items-center gap-2">
            <img src={AFTER_2} alt="Second AI variation of the same demo input" width={180} height={120} loading="lazy" className="h-14 w-20 rounded-lg object-cover" />
            <span className="sans text-[11px] leading-tight opacity-60" style={{ color: "var(--ink)" }}>
              One run
              <br />
              → 4 results
            </span>
          </div>
        </div>

        <p className="sans mt-5 max-w-3xl text-[11px] leading-relaxed opacity-55" style={{ color: "var(--ink)" }}>
          {COPY.disclaimer}
        </p>
      </div>
    </section>
  );
}
