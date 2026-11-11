import Link from "next/link";
import { VOICE_PLANS } from "@paid/core";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { StemGrid } from "@/components/StemGrid";
import { ToolDemo } from "@/components/ToolDemo";
import {
  breadcrumbSchema,
  faqSchema,
  graphSchema,
  pageMetadata,
  webApplicationSchema,
  type FaqItem,
} from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Vocal Remover — Separate Vocals & Instrumental Online",
  description:
    "Remove vocals from any song with AI and get 4 stems — vocals, drums, bass and other — in minutes. Free 3 minutes, no signup, works in your browser.",
  path: "/",
});

const HOME_FAQS: FaqItem[] = [
  {
    q: "Is the vocal remover really free?",
    a: "Yes. Every account-free visitor gets one 3-minute track per day with vocals and instrumental stems as MP3 320kbps — no credit card, no signup. The free tier returns 2 stems; the full 4-stem set (vocals, drums, bass, other), WAV downloads, batch upload and tracks longer than 3 minutes are part of the paid plans starting at $5/month.",
  },
  {
    q: "What exactly is a stem?",
    a: "A stem is one isolated part of a mix — the vocal performance, the drum kit, the bass line, or everything else (guitars, keys, strings, synths). Producers, DJs and karaoke makers work with stems because they can mute, replace or rebalance individual parts without touching the rest of the song. A 4-stem separation gives you all four parts plus the instrumental (the original mix with the vocal removed).",
  },
  {
    q: "Which audio files can I upload?",
    a: "MP3, WAV, M4A and FLAC up to 100MB or roughly 10 minutes per track. For the cleanest separation, upload the highest-quality file you have — a lossless WAV or a 320kbps MP3 rather than a low-bitrate stream rip. Very compressed files, phone recordings and live bootlegs are harder for any model to split cleanly.",
  },
  {
    q: "How long does separation take?",
    a: "A typical 3-minute song is usually ready in 60–90 seconds after upload, depending on queue length. Longer tracks and the high-quality model take proportionally longer. Paid plans include a priority queue so your jobs jump ahead of free previews.",
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
    blurb: "What you get on the free tier, exactly, plus tips for getting a clean instrumental at no cost.",
  },
  {
    href: "/vocal-remover-online",
    label: "Vocal remover online",
    blurb: "Run everything in the browser: no install, no plugins, no signup, works on any device.",
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
    title: "No-budget sessions",
    body: "See exactly what the free tier covers before you pay for anything.",
    href: "/free-vocal-eliminator",
  },
];

export default function HomePage() {
  const schema = graphSchema(
    webApplicationSchema({
      name: "StemSplit.ai Vocal Remover",
      description:
        "AI vocal remover that separates any song into vocals, drums, bass and other stems in minutes. Free 3 minutes, no signup.",
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
          className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-72 max-w-3xl bg-[radial-gradient(closest-side,rgba(109,92,255,0.35),transparent)]"
        />
        <div className="relative mx-auto max-w-4xl">
          <div className="badge">AI stem separation · 4 stems · no signup</div>
          <h1 className="display mx-auto mt-6 max-w-4xl text-4xl md:text-[4rem]">
            Vocal Remover — <span className="gradient-text">Separate Vocals &amp; Instrumental</span> Online
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
            Upload a song and get clean vocals, instrumental, drums, bass and other stems in minutes. One upload, four
            stems, no plugins and no account. Free 3 minutes — Pro from $5/month.
          </p>

          <ToolDemo />

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {[
              "Free 3-minute preview",
              "No signup or install",
              "4 stems + instrumental",
              "MP3 and WAV downloads",
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
            can download the acapella, the instrumental, the drum loop and the bass line as separate files. Re-sing
            the vocal, replace the drums, sample the bass, or rebuild the arrangement in your DAW — the choice is
            yours.
          </p>
          <p className="mt-4 leading-relaxed text-slate-300">
            A 4-stem split works on almost any genre. Pop, rock, hip-hop, EDM, country, worship and karaoke tracks are
            all handled by the same model. Live recordings, heavy vinyl rips and mono mixes are harder, but you can
            still get usable vocals and a solid backing track in most cases.
          </p>
          <div className="mt-6">
            <StemGrid />
          </div>
          <p className="mt-5 text-sm text-slate-400">
            Working in a DAW? Read the{" "}
            <Link href="/separate-stems" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
              stem separation guide
            </Link>{" "}
            for formats, alignment, producer workflows and the 6-stem option.
          </p>
        </div>
      </section>

      <section id="how" className="hairline px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="display text-3xl md:text-4xl">How it works in three steps</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-slate-300">
            No timeline to scrub, no plugin to install, no export settings to learn. The whole workflow is upload,
            wait, download — and the AI does the hard part.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Upload your track",
                body: "Drop an MP3, WAV, M4A or FLAC. We check the duration and quality before anything is processed, so you do not waste a free run on a broken file.",
              },
              {
                step: "2",
                title: "AI splits the mix",
                body: "A Demucs-based model separates the waveform into vocals, drums, bass and other. You can watch progress live while the stems render.",
              },
              {
                step: "3",
                title: "Download your stems",
                body: "Grab the vocals, instrumental and individual stems as MP3 320 or WAV. Keep what you need — the originals are deleted automatically.",
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

      <section id="free-vs-pro" className="hairline px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <h2 className="display text-3xl md:text-4xl">Free vs Pro: what changes when you upgrade</h2>
          <p className="mx-auto mt-4 max-w-3xl text-center leading-relaxed text-slate-300">
            The free tier is a real separation, not a preview clip — but it is limited to 3 minutes, 2 stems and a
            single track per day. Paid plans unlock the full 4-stem output, WAV quality, batch uploads, the
            high-quality model and longer tracks.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {VOICE_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`card p-5 ${plan.popular ? "border-violet-400/70 shadow-[0_0_40px_-24px_rgba(139,92,246,0.9)]" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-slate-100">{plan.name}</h3>
                  {plan.popular && <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-300">Popular</span>}
                </div>
                <p className="mt-3 text-3xl font-extrabold">
                  ${plan.price}
                  <span className="text-sm font-normal text-slate-400">
                    {plan.billing === "annual" ? "/year" : plan.price > 0 ? "/month" : ""}
                  </span>
                </p>
                <p className="mt-1 text-xs text-slate-500">{plan.minutes} minutes included</p>
                <ul className="mt-4 space-y-1.5 text-sm text-slate-300">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span aria-hidden="true" className="text-cyan-300">·</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/pricing" className="btn btn-ghost btn-sm mt-5 w-full">
                  {plan.price === 0 ? "Start free" : "Choose plan"}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-slate-400">
            Monthly and annual billing, cancel anytime. Compare everything on the{" "}
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

      <Faq items={HOME_FAQS} intro="Short answers to the questions people ask before their first separation." />

      <section className="px-6 pb-16">
        <div className="card relative mx-auto max-w-4xl overflow-hidden p-8 text-center md:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_240px_at_50%_0%,rgba(109,92,255,0.28),transparent_70%)]"
          />
          <div className="relative">
            <h2 className="display mx-auto max-w-2xl text-2xl md:text-3xl">
              Your next karaoke track is one upload away
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-300">
              Try a 3-minute track for free — no account, no card. Upgrade only if you need the full 4-stem set.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/#tool" className="btn btn-primary">
                Upload a song
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
