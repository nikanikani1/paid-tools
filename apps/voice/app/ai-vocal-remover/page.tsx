import { ToolLandingPage, type ToolPageData } from "@/components/ToolLandingPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "AI Vocal Remover — Isolate Vocals with AI",
  description:
    "Use an AI vocal remover to isolate the acapella and instrumental from any song. 4-stem AI separation — start with the $2.90 Trial Pack: 15 minutes, one-time payment, no subscription.",
  path: "/ai-vocal-remover",
});

const data: ToolPageData = {
  slug: "/ai-vocal-remover",
  crumb: "AI vocal remover",
  title: "AI Vocal Remover — Isolate Vocals with AI",
  description:
    "Use an AI vocal remover to isolate the acapella and instrumental from any song. 4-stem AI separation — start with the $2.90 Trial Pack: 15 minutes, one-time payment, no subscription.",
  h1: "AI Vocal Remover — Isolate Vocals with AI",
  badge: "AI model · htdemucs · $2.90 trial",
  intro: [
    "An AI vocal remover does not subtract a channel — it listens to the whole mix and predicts which part of the sound belongs to the singer. That is why the result sounds like a performance instead of a hollow karaoke file.",
    "Upload an MP3, WAV, M4A or FLAC below and get vocals, instrumental, drums, bass and other stems back in minutes. Runs are paid: the one-time $2.90 Trial Pack includes 15 minutes and the full 4-stem output.",
  ],
  toolCta: "Isolate vocals with AI",
  quickFacts: ["AI stem separation", "4 stems + instrumental", "$2.90 trial · 15 min", "Browser only"],
  sections: [
    {
      h2: "Why AI separation beats the old center-channel trick",
      paragraphs: [
        "The classic vocal remover works by phase-cancelling the center of a stereo mix. It inverts one channel and sums it with the other, so anything identical in both channels disappears — usually the lead vocal, but also the kick, snare, bass and anything else the mix engineer placed in the middle. What is left sounds thin and hollow, and it falls apart completely on vocals that are wide, doubled or panned.",
        "An AI vocal remover approaches the problem from the other direction. The model has learned what vocals, drums, bass and other instruments sound like across thousands of songs, so it can estimate each source's contribution at every frequency and rebuild it as a separate signal. The backing track keeps its punch, and the vocal keeps its detail.",
      ],
      bullets: [
        "Center-cancel tools remove centered drums and bass along with the vocal.",
        "Phase tricks fail on wide, doubled or reverberant vocals.",
        "AI separation keeps the full band and returns individual stems.",
        "The same upload also produces an acapella for covers and remixes.",
      ],
      bulletsColumns: 2,
    },
    {
      h2: "Inside the model: what htdemucs actually does",
      paragraphs: [
        "StemSplit runs a Demucs-family model (htdemucs, originally developed by Meta AI and released under an MIT license). Demucs is a hybrid transformer: it looks at the raw waveform and at a time-frequency representation of the audio at the same time. The waveform view preserves transients — the attack of a snare, the plosive in a vocal — while the spectrogram view makes it easier to separate sustained tones and overlapping harmonies.",
        "The model outputs four source estimates: vocals, drums, bass and other. Those estimates are mixed back together into the original song, and during training the model is optimised to make that reconstruction as close to the real mix as possible. The practical effect is that the four stems sum back into something that sounds like the record, while each file is usable on its own.",
        "The model does not learn from your upload. Your track is processed once, the stems are rendered, and the audio is deleted from working storage afterwards. Nothing you upload becomes training data.",
      ],
    },
    {
      h2: "AI vocal remover vs. EQ and phase cancellation",
      paragraphs: [
        "If you only need a rough karaoke backing track and you already use a DAW, the phase trick can be good enough — especially on simple stereo recordings where the vocal is dead center. It takes seconds and adds no cost. But it is a blunt instrument: it cannot tell a vocal from a bass guitar if both are centered, and it removes the low end of the mix along with the singer.",
        "For acapellas, sampling, remixes or anything you plan to publish, AI separation is the only option that produces a full-spectrum result. The trade-off is processing time and cost: the $2.90 Trial Pack buys 15 minutes of full 4-stem separation, which is roughly five three-minute songs. Use phase cancellation for quick scratch work and AI separation for anything a listener will hear.",
      ],
      bullets: [
        "Phase cancellation: instant and zero-cost, but loses centered instruments and struggles with stereo vocals.",
        "EQ carving: removes a frequency band, not an instrument — vocals and other midrange content both suffer.",
        "AI separation: slower, but keeps the full arrangement and returns individual stems.",
      ],
    },
    {
      h2: "Quality depends on the source file — how to help the model",
      paragraphs: [
        "No separator can recover detail that is not present in the file. A 128kbps stream rip, a clipped phone recording or a heavily limited master gives the model less to work with, and artifacts become more likely. The single biggest improvement you can make is uploading the highest-quality copy of the track you have.",
        "Trim silence and count-ins before uploading where possible. Shorter clips process faster and use less of your paid minutes. If you are working with a live recording, expect bleed between stems — a vocal mic that captured the drums will put some drums in the vocal stem, and no model currently solves that perfectly.",
      ],
      bullets: [
        "Prefer WAV or 320kbps MP3 over low-bitrate streams.",
        "Avoid files that clip or peak above 0dBFS.",
        "Trim long intros and outros to save paid minutes.",
        "Live and mono recordings are harder than studio mixes — expect some bleed.",
      ],
      bulletsColumns: 2,
    },
    {
      h2: "Where the AI still struggles",
      paragraphs: [
        "AI vocal removal is excellent on modern studio productions and good on most older stereo recordings. It is weaker on mono masters from the 1960s, dense distorted mixes where every instrument occupies the same frequencies, orchestral recordings with many overlapping sources, and spoken-word tracks where speech and background noise are entangled.",
        "When the result is not clean enough, try the high-quality model on Pro, process a shorter section, or use the stems for editing rather than as a final master. For remix and karaoke work, small artifacts are usually masked by the new arrangement; for critical listening, always compare the result against the original.",
      ],
    },
    {
      h2: "Trial Pack, Starter or Pro: what to buy",
      paragraphs: [
        "There is no free-of-charge allowance — every run is paid, which keeps the queue short and the model quality consistent. The entry point is the one-time $2.90 Trial Pack: 15 minutes, 4 stems, MP3 320 and WAV, no subscription. Fifteen minutes covers roughly five three-minute songs and never expires.",
        "If you process more than that, Starter at $5/month includes 90 minutes with batch upload; Pro at $9/month raises it to 200 minutes and adds the 6-stem model, high-quality mode and a priority queue. The annual plan is $39 — five months of Starter for twelve months of access.",
      ],
    },
  ],
  faqs: [
    {
      q: "Can I try before paying?",
      a: "No. There is no free-of-charge processing tier and no complimentary preview — every separation costs GPU time, so every run is paid. The cheapest entry point is the one-time $2.90 Trial Pack: 15 minutes, 4 stems, WAV + MP3, no subscription.",
    },
    {
      q: "Is AI vocal removal legal?",
      a: "Separating a song you own or have licensed is generally fine, and we grant you a commercial-use license for the processing service. We cannot grant rights to the underlying recording. Uploading someone else's copyrighted song and publishing the stems may infringe their rights, so only process audio you are allowed to use.",
    },
    {
      q: "Can it isolate backing vocals separately from the lead?",
      a: "Not on the standard 4-stem model. Everything sung — lead, harmonies and backing vocals — lands in the vocals stem, which is exactly what you want for an acapella. The Pro plan's 6-stem model adds more instrument separation, but lead-versus-backing vocal splitting is not offered yet.",
    },
    {
      q: "Does the AI vocal remover work on any genre?",
      a: "It works best on studio recordings with a clear arrangement — pop, rock, hip-hop, EDM, country, R&B and karaoke tracks. Dense metal, orchestral music, live bootlegs and mono masters are harder and may show more bleed between stems.",
    },
    {
      q: "What is the difference between an AI vocal remover and stem separation?",
      a: "They are the same engine described from different angles. 'Vocal remover' focuses on the vocal-versus-instrumental result; 'stem separation' focuses on the four individual parts. Every job here returns both: an acapella, an instrumental, drums, bass and other.",
    },
    {
      q: "Can I get six stems instead of four?",
      a: "The Pro plan includes the 6-stem model in addition to the standard 4-stem output. It separates the 'other' bucket further for more detailed production work. The Trial Pack and Starter return the standard 4 stems.",
    },
  ],
  related: [
    {
      href: "/remove-vocals-from-song",
      label: "Remove vocals from a song",
      blurb: "Compare AI separation with center-channel cancellation and official instrumentals.",
    },
    {
      href: "/acapella-maker",
      label: "Acapella maker",
      blurb: "Turn the isolated vocal stem into a clean acapella for covers, remixes and sampling.",
    },
    {
      href: "/karaoke-maker",
      label: "Karaoke maker",
      blurb: "Use the instrumental stem to build a karaoke backing track from any song.",
    },
  ],
  finalCta: {
    title: "Hear what the AI does with your own track",
    body: "Buy the $2.90 Trial Pack, upload up to about five songs and compare the acapella and instrumental with the original. 15 minutes, one-time payment, no subscription.",
  },
};

export default function AiVocalRemoverPage() {
  return <ToolLandingPage data={data} />;
}
