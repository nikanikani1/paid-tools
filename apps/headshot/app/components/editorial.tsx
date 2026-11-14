import Link from "next/link";
import { PRIMARY_AUTHOR, authorPath } from "../lib/authors";
import { CONTENT_UPDATED } from "../lib/site";
import { Section } from "./ui";

/** Visible E-E-A-T signal: who maintains the page and when it was last updated. */
export function AuthorByline({ align = "left" }: { align?: "left" | "center" }) {
  return (
    <p
      className={`sans mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500 ${
        align === "center" ? "justify-center" : "justify-start"
      }`}
    >
      <span>
        By{" "}
        <Link
          href={authorPath(PRIMARY_AUTHOR.slug)}
          className="font-medium text-stone-700 underline underline-offset-2 hover:text-orange-700"
        >
          {PRIMARY_AUTHOR.name}
        </Link>
      </span>
      <span aria-hidden="true">·</span>
      <span>
        Last updated: <time dateTime={CONTENT_UPDATED}>{CONTENT_UPDATED}</time>
      </span>
      <span aria-hidden="true">·</span>
      <Link href="/about" className="underline underline-offset-2 hover:text-orange-700">
        Editorial standards
      </Link>
    </p>
  );
}

/**
 * Honest, qualitative comparison: studio shoot vs phone selfie vs this pipeline.
 * No measured timings, prices or satisfaction numbers are claimed.
 */
export function StudioComparison({ defaultTitle = "Studio shoot vs phone selfie vs an AI pipeline" }: { defaultTitle?: string }) {
  const rows = [
    {
      dimension: "Cost",
      studio: "A studio day rate plus retouching; more outfits usually cost more",
      selfie: "Free, but the result is only as good as the light and the crop",
      ours: "One-time $9 Sample Pack (5 images); larger packages coming soon",
    },
    {
      dimension: "Time",
      studio: "Booking, shoot and retouch — typically one to three weeks end to end",
      selfie: "Five minutes, but no consistent set",
      ours: "Minutes of generation after upload; download immediately",
    },
    {
      dimension: "Consistency",
      studio: "Good within one session; a reshoot later rarely matches",
      selfie: "Poor across photos and devices",
      ours: "One preset fixes backdrop, light and crop across the set",
    },
    {
      dimension: "Frames delivered",
      studio: "A handful of selects chosen on the day",
      selfie: "One or two usable frames at best",
      ours: "5 final images in the $9 Sample Pack; larger sets coming soon",
    },
    {
      dimension: "Fails when",
      studio: "You need the photo this week, or the budget is not there",
      selfie: "The light is poor or the background is busy",
      ours: "You need large-format print or art-directed brand work",
    },
  ];

  return (
    <div className="sans">
      <div className="overflow-x-auto rounded-2xl border border-stone-300 bg-white/60">
        <table className="w-full min-w-[720px] text-left text-sm">
          <caption className="sr-only">{defaultTitle}</caption>
          <thead className="bg-stone-100/80 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">
                Dimension
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Traditional studio shoot
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Phone selfie (DIY)
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                This AI pipeline
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {rows.map((row) => (
              <tr key={row.dimension}>
                <th scope="row" className="px-5 py-3 font-medium text-stone-800">
                  {row.dimension}
                </th>
                <td className="px-5 py-3 text-stone-600">{row.studio}</td>
                <td className="px-5 py-3 text-stone-600">{row.selfie}</td>
                <td className="px-5 py-3 text-stone-600">{row.ours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-stone-500">
        This is a qualitative comparison, not a benchmark: no studio prices, satisfaction scores or customer counts are
        claimed, and no test shoots were run to produce this table. A studio is still the right call for large-format
        print and art-directed brand work.
      </p>
    </div>
  );
}

/** Full comparison section, ready to drop into a page body. */
export function StudioComparisonSection({ title = "Traditional studio, phone selfie, or this pipeline?" }: { title?: string }) {
  return (
    <Section eyebrow="Comparison" title={title} intro={<p>An honest split of what each option is good at — no invented benchmark numbers.</p>}>
      <StudioComparison />
    </Section>
  );
}

/** Bottom-of-page editorial signature used on the home page and tool pages. */
export function EditorialByline() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-6">
      <AuthorByline />
    </div>
  );
}
