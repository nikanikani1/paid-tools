import { BRAND } from "@/lib/brands";
import { BeforeAfter } from "@/components/BeforeAfter";

const COPY =
  BRAND.kind === "landscape"
    ? {
        eyebrow: "Demo — not a customer result",
        title: "See your yard, four ways — before you dig.",
        intro:
          "Upload one photo and get four landscape concepts. The edit is instructed to keep the house, pool, fence and camera angle in place while changing the planting, paving and lighting.",
        beforeLabel: "Before",
        afterLabel: "After",
        beforeAlt: "Original stock photo of a house with a pool and a plain lawn",
        afterAlt: "AI landscape concept for the same house, with modern paving and planting",
        afterCaption: "One photo → four directions. Check each result; AI can still shift small details.",
        disclaimer:
          "Demo images are illustrative and AI-generated from a stock photo. They are not a customer result, a construction drawing or a guarantee of what your own photo will produce.",
      }
    : {
        eyebrow: "Demo — not a customer result",
        title: "See the colour before the salon.",
        intro:
          "Upload one selfie and preview four face-preserving looks. The edit is instructed to keep the face, expression, haircut and background fixed so you can judge the shade, not a stranger.",
        beforeLabel: "Before",
        afterLabel: "Warm blonde",
        beforeAlt: "AI-generated demo portrait with dark hair",
        afterAlt: "Same AI demo portrait with warm blonde hair",
        afterCaption: "One selfie → four looks. Check each result; AI can still shift small details.",
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
      <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
        <div className="grid items-center gap-8 lg:grid-cols-[1.02fr_1fr]">
          <div>
            <p className="sans text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--brand)" }}>
              {COPY.eyebrow}
            </p>
            <h2 className="mt-3 max-w-xl font-serif text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl" style={{ color: "var(--ink)" }}>
              {COPY.title}
            </h2>
            <p className="sans mt-4 max-w-xl text-sm leading-relaxed opacity-75 md:text-base" style={{ color: "var(--ink)" }}>
              {COPY.intro}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#studio"
                className="sans inline-flex items-center justify-center rounded-full px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ backgroundColor: "var(--brand)" }}
              >
                Try with your photo — {BRAND.price}
              </a>
              <a
                href="/pricing"
                className="sans inline-flex items-center justify-center rounded-full border border-black/15 px-5 py-3.5 text-sm font-semibold transition hover:border-black/30"
                style={{ color: "var(--ink)" }}
              >
                What&apos;s included
              </a>
            </div>

            <ul className="sans mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium opacity-75" style={{ color: "var(--ink)" }}>
              <li className="flex items-center gap-1.5">
                <span aria-hidden="true" style={{ color: "var(--brand)" }}>✓</span> One-time {BRAND.price}
              </li>
              <li className="flex items-center gap-1.5">
                <span aria-hidden="true" style={{ color: "var(--brand)" }}>✓</span> 4 results
              </li>
              <li className="flex items-center gap-1.5">
                <span aria-hidden="true" style={{ color: "var(--brand)" }}>✓</span> No subscription
              </li>
            </ul>
          </div>

          <div>
            <BeforeAfter
              before={BEFORE}
              after={AFTER}
              beforeAlt={COPY.beforeAlt}
              afterAlt={COPY.afterAlt}
              beforeLabel={COPY.beforeLabel}
              afterLabel={COPY.afterLabel}
              frameClassName={FRAME}
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="sans text-xs leading-relaxed opacity-65" style={{ color: "var(--ink)" }}>
                {COPY.afterCaption}
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <img src={AFTER_2} alt="Second AI variation of the same demo input" width={180} height={120} loading="lazy" className="h-12 w-16 rounded-lg object-cover" />
                <span className="sans text-[10px] leading-tight opacity-60" style={{ color: "var(--ink)" }}>
                  4 per run
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="sans mt-6 max-w-3xl text-[11px] leading-relaxed opacity-55" style={{ color: "var(--ink)" }}>
          {COPY.disclaimer}
        </p>
      </div>
    </section>
  );
}
