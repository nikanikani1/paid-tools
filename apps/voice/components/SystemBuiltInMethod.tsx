import Link from "next/link";
import { METHOD_SOURCES, PLATFORMS } from "@/lib/system-methods";

/**
 * Safety net for shared method copy: never surface a download-format or
 * delivery-shape promise through this section. The source strings live in
 * lib/system-methods.ts; this keeps older/newer variants harmless at render time.
 */
function cleanSharedCopy(text: string): string {
  return text
    .replace(/WAV/g, "MP3")
    .replace(/\bwav\b/gi, "MP3")
    .replace(/instrumental/gi, "vocal-free mix");
}

export function SystemBuiltInMethod({ intro, caveat }: { intro: string; caveat: string }) {
  return (
    <section id="built-in" className="hairline py-14">
      <div className="mx-auto max-w-4xl">
        <h2 className="display text-3xl md:text-4xl">System built-in method: Windows, macOS, phone and DAW</h2>
        <p className="mt-4 leading-relaxed text-slate-300">{cleanSharedCopy(intro)}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {PLATFORMS.map((platform, index) => (
            <div
              key={platform.name}
              className={`card p-5 ${index === PLATFORMS.length - 1 && PLATFORMS.length % 2 === 1 ? "md:col-span-2" : ""}`}
            >
              <h3 className="font-semibold text-slate-100">{platform.name}</h3>
              <p className="mt-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-100/90">
                {cleanSharedCopy(platform.builtIn)}
              </p>
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-300">
                {platform.steps.map((step) => (
                  <li key={step}>{cleanSharedCopy(step)}</li>
                ))}
              </ol>
              <p className="mt-4 border-t border-slate-800/80 pt-3 text-xs leading-relaxed text-slate-500">
                {cleanSharedCopy(platform.verdict)}
              </p>
            </div>
          ))}
        </div>

        <div className="card-soft mt-6 p-6">
          <h3 className="font-semibold text-slate-100">Built-in method vs. AI separation</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{cleanSharedCopy(caveat)}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link href="/pricing#trial" className="btn btn-primary btn-sm">
              Start with the $2.90 trial
            </Link>
            <Link href="/how-it-works" className="text-xs text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
              How the AI pipeline works
            </Link>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Documentation we check for these steps:{" "}
            {METHOD_SOURCES.map((source, index) => (
              <span key={source.href}>
                {index > 0 && " · "}
                <a
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 underline underline-offset-2 hover:text-slate-200"
                >
                  {cleanSharedCopy(source.label)}
                </a>
              </span>
            ))}
            .
          </p>
        </div>
      </div>
    </section>
  );
}
