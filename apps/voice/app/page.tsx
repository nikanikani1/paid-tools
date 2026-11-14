import Link from "next/link";
import { VOICE_PLANS } from "@paid/core";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { StemGrid } from "@/components/StemGrid";
import { StemPlayer } from "@/components/StemPlayer";
import { ToolDemo } from "@/components/ToolDemo";
import {
  breadcrumbSchema,
  faqSchema,
  graphSchema,
  pageMetadata,
  webApplicationSchema,
  type FaqItem,
} from "@/lib/seo";

/**
 * Truth guard: only the one-time Trial Pack is live today. Subscription plans stay
 * hidden from checkout until they can be delivered end to end.
 */
const PURCHASABLE_PLAN_IDS = new Set(["voice-trial"]);

/** UI-level truth overrides: the core feature lists still describe capabilities the
 * shipped pipeline does not produce yet, so the page renders this list instead. */
const DISPLAY_FEATURES: Record<string, string[]> = {
  "voice-trial": ["15 minutes, one-time", "4 stems (vocals, drums, bass, other)", "MP3 320 downloads", "No subscription"],
  "voice-starter": ["90 minutes / month when subscriptions open", "4 stems", "MP3 320 downloads"],
  "voice-pro": ["200 minutes / month when subscriptions open", "4 stems", "MP3 320 downloads"],
  "voice-annual": ["90 minutes / month when subscriptions open", "Billed $39/year when subscriptions open", "4 stems"],
};

function isPurchasable(planId: string): boolean {
  return PURCHASABLE_PLAN_IDS.has(planId);
}

function displayFeatures(planId: string, fallback: string[]): string[] {
  return DISPLAY_FEATURES[planId] ?? fallback;
}

export const metadata = pageMetadata({
  title: "Vocal Remover — Separate Vocals & Stems Online",
  description:
    "Remove vocals from any song with AI and get 4 stems — vocals, drums, bass and other — in minutes. Start with the $2.90 Trial Pack: 15 minutes, one-time payment, 4 stems.",
  path: "/",
});

const HOME_FAQS: FaqItem[] = [
  {
    q: "Can I try before paying?",
    a: "No. There is no free-of-charge processing tier and no complimentary 3-minute sample — every separation costs GPU time, so every run is paid. The cheapest entry point is the one-time $2.90 Trial Pack, which includes 15 minutes of separation with the full 4-stem output. That is roughly five 3-minute songs for less than the price of a coffee.",
  },
  {
    q: "What do I get in the $2.90 Trial Pack?",
    a: "15 minutes of processing, billed once — not a subscription. Each job returns four separated stems — vocals, drums, bass and other — as MP3 320 downloads. Fifteen minutes covers about five three-minute tracks, or one long set of edits. When the trial minutes are used up you can buy another Trial Pack; the monthly subscriptions are not open yet, and nothing renews automatically.",
  },
  {
    q: "What exactly is a stem?",
    a: "A stem is one isolated part of a mix — the vocal performance, the drum kit, the bass line, or everything else (guitars, keys, strings, synths). Producers, DJs and karaoke makers work with stems because they can mute, replace or rebalance individual parts without touching the rest of the song. A 4-stem separation gives you all four separated parts as individual files.",
  },
  {
    q: "Which audio files can I upload?",
    a: "MP3, M4A and FLAC up to 100MB or roughly 10 minutes per track. For the cleanest separation, upload the highest-quality file you have rather than a low-bitrate stream rip. Very compressed files, phone recordings and live bootlegs are harder for any model to split cleanly.",
  },
  {
    q: "How long does separation take?",
    a: "A typical 3-minute song is usually ready in 60–90 seconds after upload, depending on queue length. Longer tracks take proportionally longer. There is no unpaid queue — paid jobs are processed in the order they arrive.",
  },
  {
    q: "Do you keep my audio files?",
    a: "No. Files are processed for the job and removed from working storage automatically — normally within 24 to 48 hours — and your stems are available through time-limited download links. We do not use uploaded audio to train models. See the privacy policy for the full data-handling details.",
  },
  {
    q: "Can I use the separated stems commercially?",
    a: "We grant you a commercial-use license for the stem-separation service itself, but we cannot grant rights to the song you upload. If you own the recording or have a license from the rights holders, you can use the stems commercially. If you do not, your use may infringe copyright — only process audio you have the rights to use.",
  },
];

const TOOL_LINKS = [
  {
    href: "/ai-vocal-remover",
    label: "AI vocal remover",
    blurb: "How the AI model isolates vocals from a full mix — and why it beats phase-cancellation tricks.",
  },
  {
    href: "/free-vocal-eliminator",
    label: "Free vocal eliminator",
    blurb: "An honest comparison: free phase-cancellation methods versus what paid AI separation adds.",
  },
  {
    href: "/vocal-remover-online",
    label: "Vocal remover online",
    blurb: "Run everything in the browser: no install, no plugins, no desktop software, any device.",
  },
  {
    href: "/remove-vocals-from-song",
    label: "Remove vocals from a song",
    blurb: "Three practical methods compared — AI separation, center-channel cancellation and karaoke sources.",
  },
  {
    href: "/acapella-maker",
    label: "Acapella maker",
    blurb: "Pull a clean acapella out of any track for covers, remixes, sampling and content.",
  },
  {
    href: "/karaoke-maker",
    label: "Karaoke maker",
    blurb: "Strip the vocal, keep the music, and build a karaoke backing track from any song.",
  },
  {
    href: "/separate-stems",
    label: "Stem separation",
    blurb: "The producer view: all four stems, time-aligned, ready to remix, sample or rebuild.",
  },
];

const USE_CASES = [
  {
    title: "Karaoke nights",
    body: "Remove the lead vocal and keep the full band, then sing over the backing track.",
    href: "/karaoke-maker",
  },
  {
    title: "Acapella & covers",
    body: "Isolate the vocal for covers, mashups, remixes or vocal sampling.",
    href: "/acapella-maker",
  },
  {
    title: "Practice & transcription",
    body: "Slow down a drum or bass stem and learn the part without the rest of the mix.",
    href: "/remove-vocals-from-song",
  },
  {
    title: "First paid project",
    body: "A $2.90 one-time trial covers about five songs — no subscription to cancel.",
    href: "/pricing#trial",
  },
];

function priceLabel(price: number): string {
  return Number.isInteger(price) ? String(price) : price.toFixed(2);
}

function billingSuffix(billing: "monthly" | "annual" | "one-time"): string {
  if (billing === "annual") return "/year";
  if (billing === "monthly") return "/month";
  return " one-time";
}

export default function HomePage() {
  const schema = graphSchema(
    webApplicationSchema({
      name: "StemSplit.ai Vocal Remover",
      description:
        "AI vocal remover that separates any song into vocals, drums, bass and other stems in minutes. Paid Trial Pack: 15 minutes for $2.90, one-time payment.",
      path: "/",
    }),
    faqSchema(HOME_FAQS),
    breadcrumbSchema([{ name: "Home", path: "/" }]),
  );

  return (
    <>
      <JsonLd data={schema} />

      <section className="relative overflow-hidden px-6 pb-10 pt-14 text-center md:pt-20">
        <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0" />
        <div
          aria-hidden="true"
          className="float-slow pointer-events-none absolute inset-x-0 top-0 mx-auto h-72 max-w-3xl bg-[radial-gradient(closest-side,rgba(109,92,255,0.35),transparent)]"
        />
        <div className="relative mx-auto max-w-4xl" data-reveal>
          <div className="badge">AI stem separation · 4 stems · $2.90 Trial Pack</div>
          <h1 className="display mx-auto mt-6 max-w-4xl text-4xl md:text-[4rem]">
            Vocal Remover — <span className="gradient-text">Separate Vocals &amp; Stems</span> Online
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
            Upload a song and get clean vocals, drums, bass and other stems in minutes. One upload, four separated stems
            as MP3 downloads, no plugins and no desktop software. Start with the $2.90 Trial Pack — 15 minutes, one-time
            payment.
          </p>

          <ToolDemo />

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {[
              "$2.90 Trial Pack",
              "15 minutes included",
              "4 separated MP3 stems",
              "Files auto-deleted",
            ].map((item) => (
              <span key={item} className="chip">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="stems" className="hairline px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="display text-3xl md:text-4xl">Four stems from one upload</h2>
          <p className="mt-4 leading-relaxed text-slate-300">
            Most &ldquo;vocal removers&rdquo; only give you one thing: the song with the singing filtered out. Stem
            separation is more useful. The model listens to the full mix and splits it into its musical parts, so you
            can download the vocal stem, the drum stem, the bass stem and the &ldquo;other&rdquo; stem as separate MP3
            files. Re-sing the vocal, replace the drums, sample the bass, or rebuild the arrangement in your DAW — the
            choice is yours.
          </p>
          <p className="mt-4 leading-relaxed text-slate-300">
            A 4-stem split works on almost any genre. Pop, rock, hip-hop, EDM, country, worship and karaoke tracks are
            all handled by the same model. Live recordings, heavy vinyl rips and mono mixes are harder for any model,
            but most tracks still come back usable.
          </p>
          <div className="mt-6">
            <StemGrid />
          </div>
          <div className="mt-6">
            <StemPlayer />
          </div>
          <p className="mt-5 text-sm text-slate-400">
            Working in a DAW? Read the{" "}
            <Link href="/separate-stems" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
              stem separation guide
            </Link>{" "}
            for formats, alignment and producer workflows.
          </p>
        </div>
      </section>

      <section id="how" className="hairline px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="display text-3xl md:text-4xl">How it works in three steps</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-slate-300">
            No timeline to scrub, no plugin to install, no export settings to learn. The whole workflow is get a trial
            or plan, upload, wait and download — the AI does the hard part.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Get a trial or plan",
                body: "The $2.90 Trial Pack is a one-time purchase: 15 minutes, full 4-stem output, no subscription. Buy it once and every run after that draws from the minutes you own.",
              },
              {
                step: "2",
                title: "Upload your track",
                body: "Drop an MP3 or M4A file. We check duration and quality before processing, so a paid run is never wasted on a broken file.",
              },
              {
                step: "3",
                title: "Download your stems",
                body: "Grab the four separated stems as MP3 320. Keep what you need — the originals are deleted automatically.",
              },
            ].map((item) => (
              <div key={item.step} className="card-hover card p-6">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-violet-500/20 text-sm font-bold text-violet-200">
                  {item.step}
                </span>
                <h3 className="mt-4 font-semibold text-slate-100">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-slate-400">
            Want the technical version — model, pipeline, storage and limitations? Read{" "}
            <Link href="/how-it-works" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
              how our AI vocal remover works
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="hairline px-6 py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="display text-3xl md:text-4xl">An AI vocal remover that hears the whole mix</h2>
          <p className="mt-4 leading-relaxed text-slate-300">
            Classic vocal eliminators work by subtracting the center channel, where most lead vocals sit. That trick is
            fast and free, but it also removes the kick, snare, bass and anything else centered in the mix — and it
            fails completely on wide stereo vocals. The result is thinner, hollow and often unusable for anything
            serious.
          </p>
          <p className="mt-4 leading-relaxed text-slate-300">
            Our model was trained on thousands of songs to recognize what a vocal, a drum kit and a bass actually sound
            like. Instead of subtracting a channel, it predicts each instrument&rsquo;s contribution across the whole
            frequency range and rebuilds them as separate signals. That is why you keep a full, punchy backing track
            when the vocal disappears — and why the acapella still sounds like a performance rather than a phone call.
          </p>
          <p className="mt-4 leading-relaxed text-slate-300">
            You can read a deeper comparison of AI separation versus EQ and phase tricks in the{" "}
            <Link href="/ai-vocal-remover" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
              AI vocal remover guide
            </Link>
            , or see the step-by-step for each method in{" "}
            <Link
              href="/remove-vocals-from-song"
              className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
            >
              how to remove vocals from a song
            </Link>
            .
          </p>
        </div>
      </section>

      <section id="use-cases" className="hairline px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="display text-3xl md:text-4xl">What people do with separated stems</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-slate-300">
            Karaoke singers, producers, DJs, music teachers, podcasters and content creators use the same separation
            engine for very different jobs. Pick the workflow closest to yours.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {USE_CASES.map((useCase) => (
              <Link key={useCase.href} href={useCase.href} className="card-hover card p-6">
                <h3 className="font-semibold text-slate-100">{useCase.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{useCase.body}</p>
                <span className="mt-3 inline-block text-xs font-medium text-cyan-300">See the workflow →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="hairline px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <h2 className="display text-3xl md:text-4xl">The $2.90 trial is the only plan on sale right now</h2>
          <p className="mx-auto mt-4 max-w-3xl text-center leading-relaxed text-slate-300">
            We do not run a free-of-charge tier. Every separation uses GPU time, so instead of a giveaway preview we keep the entry
            price low: a one-time $2.90 Trial Pack with 15 minutes and the full 4-stem output as MP3. Starter, Pro and
            Annual are shown for comparison only — subscriptions are not open yet, so their checkout is closed.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {VOICE_PLANS.map((plan) => {
              const purchasable = isPurchasable(plan.id);
              return (
                <div
                  key={plan.id}
                  id={plan.id === "voice-trial" ? "trial" : undefined}
                  className={`card flex flex-col p-5 ${purchasable ? "border-violet-400/70 shadow-[0_0_40px_-24px_rgba(139,92,246,0.9)]" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-100">{plan.name}</h3>
                    <span
                      className={
                        purchasable
                          ? "rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-200"
                          : "rounded-full border border-slate-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400"
                      }
                    >
                      {purchasable ? "Available now" : "Coming soon"}
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-extrabold">
                    ${priceLabel(plan.price)}
                    <span className="text-sm font-normal text-slate-400">{billingSuffix(plan.billing)}</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {plan.billing === "annual"
                      ? "Billed yearly when subscriptions open"
                      : plan.billing === "one-time"
                        ? "One-time · ≈ 5 songs"
                        : `${plan.minutes} minutes included when subscriptions open`}
                  </p>
                  <ul className="mt-4 flex-1 space-y-1.5 text-sm text-slate-300">
                    {displayFeatures(plan.id, plan.features).map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <span aria-hidden="true" className="text-cyan-300">·</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {purchasable ? (
                    <Link href="/pricing#trial" className="btn btn-sm mt-5 w-full btn-primary">
                      Buy the $2.90 trial
                    </Link>
                  ) : (
                    <div className="btn btn-sm mt-5 w-full cursor-not-allowed border border-slate-700 bg-slate-800/40 text-center text-slate-400">
                      Coming soon — subscriptions not open yet
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-6 text-center text-sm text-slate-400">
            The Trial Pack is one-time. Subscriptions are not open yet — compare the live trial with the planned
            monthly plans on the{" "}
            <Link href="/pricing" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
              pricing page
            </Link>
            .
          </p>
        </div>
      </section>

      <section id="tools" className="hairline px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="display text-3xl md:text-4xl">Every vocal remover tool on StemSplit</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-slate-300">
            Each guide focuses on one job, one keyword and one workflow, so you do not have to decode a wall of
            marketing copy. They all use the same upload tool at the top of the page.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TOOL_LINKS.map((tool) => (
              <Link key={tool.href} href={tool.href} className="card-hover card p-5">
                <span className="font-semibold text-slate-100">{tool.label}</span>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{tool.blurb}</p>
                <span className="mt-3 inline-block text-xs font-medium text-cyan-300">Open →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Faq items={HOME_FAQS} intro="Short answers about pricing, the paid Trial Pack, formats and copyright." />

      <section className="px-6 pb-16">
        <div className="card relative mx-auto max-w-4xl overflow-hidden p-8 text-center md:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_240px_at_50%_0%,rgba(109,92,255,0.28),transparent_70%)]"
          />
          <div className="relative">
            <h2 className="display mx-auto max-w-2xl text-2xl md:text-3xl">
              Your next karaoke track is one $2.90 trial away
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-300">
              Fifteen minutes of AI separation, four MP3 stems, one-time payment. No subscription — the Trial Pack is
              the only plan on sale today.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/pricing#trial" className="btn btn-primary">
                Buy the $2.90 trial
              </Link>
              <Link href="/pricing" className="btn btn-ghost">
                Compare plans
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
