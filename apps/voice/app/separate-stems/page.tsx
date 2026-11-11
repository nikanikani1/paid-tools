import { ToolLandingPage, type ToolPageData } from "@/components/ToolLandingPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Stem Separation — 4 Stems (Vocals, Drums, Bass, Other)",
  description:
    "Separate any song into 4 stems — vocals, drums, bass and other — with AI. Producer-ready stem separation with WAV downloads, free 3-minute preview.",
  path: "/separate-stems",
});

const data: ToolPageData = {
  slug: "/separate-stems",
  crumb: "Stem separation",
  title: "Stem Separation — 4 Stems (Vocals, Drums, Bass, Other)",
  description:
    "Separate any song into 4 stems — vocals, drums, bass and other — with AI. Producer-ready stem separation with WAV downloads, free 3-minute preview.",
  h1: "Stem Separation — 4 Stems (Vocals, Drums, Bass, Other)",
  badge: "4-stem separation · producer-ready",
  intro: [
    "Stem separation takes a finished song and splits it into the parts it was mixed from: vocals, drums, bass and everything else. It is the difference between having a song and having the ingredients of a song.",
    "Producers use stems to remix, sample, practise and rebuild arrangements. Upload a track below and get all four stems back in minutes — free 3-minute preview, no signup.",
  ],
  toolCta: "Separate into 4 stems",
  quickFacts: ["4 stems per job", "WAV on paid plans", "Original tempo and key", "Free 3 minutes"],
  sections: [
    {
      h2: "What stem separation actually gives you",
      paragraphs: [
        "A mixed song is a stereo file — two channels of audio with every instrument and voice baked together. Stem separation estimates how much of that signal belongs to each musical source and rebuilds those sources as separate files. The four standard stems are vocals, drums, bass and other, where 'other' covers guitars, keys, strings, synths and any remaining texture.",
        "The stems are time-aligned with each other, so dropping all four into a DAW at bar one reconstructs the original song almost exactly. That is what makes them useful: you can mute the vocal, replace the drums, loop the bass or process one element without touching the rest.",
      ],
      bullets: [
        "Vocals — lead, harmonies and backing vocals as one stem.",
        "Drums — kick, snare, hats and percussion.",
        "Bass — bass guitar and sub-bass.",
        "Other — guitars, keys, strings, synths and textures.",
        "Instrumental — the original mix minus the vocal, included in the same job.",
      ],
      bulletsColumns: 2,
    },
    {
      h2: "How it works",
      paragraphs: [
        "Upload an MP3, WAV, M4A or FLAC file. The AI model analyses the mix and estimates each source across the frequency spectrum, then renders the stems. A three-minute song typically takes around a minute, and the result panel lists every file with a download link.",
        "There is nothing to configure. The model returns the same four stems for every genre, at the original tempo and key. If you need more granular separation — for example splitting the 'other' bucket further — the Pro plan adds a 6-stem model in addition to the standard output.",
      ],
    },
    {
      h2: "What producers do with stems",
      paragraphs: [
        "Remixers rebuild the arrangement around an existing vocal or drop a familiar drum groove under a new track. Sample-based producers isolate a single bar of bass or a drum break and chop it. Educators and students mute the part they are learning. Video editors remove an instrument that clashes with a voiceover without losing the rest of the music.",
        "The common thread is control. Once a song is stems, every production decision becomes reversible: you can rebalance, replace, edit or process any element without re-recording anything. That is why stem separation has become a standard first step in remix and sampling workflows.",
      ],
      bullets: [
        "Remix and mashup production.",
        "Sampling and chopping individual parts.",
        "Instrumental and acapella practice tracks.",
        "Music for video where one element conflicts with dialogue.",
        "Educational transcription and part learning.",
      ],
      bulletsColumns: 2,
    },
    {
      h2: "Stem separation vs. vocal removal",
      paragraphs: [
        "A vocal remover is a single-purpose view of the same technology: it focuses on the vocal-versus-instrumental result. Stem separation exposes all the parts. In practice one job gives you both, because the instrumental is derived from the stems and the acapella is simply the vocals stem.",
        "If you only need a backing track, use the vocal remover pages and ignore the extra files. If you are producing, mixing or sampling, go straight to stems — the individual parts are what you will actually work with.",
      ],
    },
    {
      h2: "Getting production-ready stems",
      paragraphs: [
        "Start with the highest-quality source you have. Lossless WAV or FLAC separates better than a low-bitrate stream, because compression smears sources into each other before the model ever sees the file. On paid plans, download the WAV versions rather than MP3 if you will mix or master with the stems.",
        "Expect the practical limits of the model: some vocal bleed in the instrumental, occasional cymbal artifacts in dense mixes, and imperfect separation on live or mono recordings. For critical production work, use the Pro high-quality model and A/B the stems against the original mix before committing.",
      ],
      bullets: [
        "Upload lossless or 320kbps sources.",
        "Download WAV for mixing and mastering.",
        "Check phase and timing against the original.",
        "Use the high-quality model for dense arrangements.",
        "Keep the original file as your reference master.",
      ],
      bulletsColumns: 2,
    },
    {
      h2: "Formats, limits and plans",
      paragraphs: [
        "The free tier includes one 3-minute track per day with vocals and instrumental stems in MP3 320. Starter ($5/month, or $39/year) adds the full 4-stem set, WAV downloads, batch upload and tracks up to 10 minutes. Pro ($9/month) adds the 6-stem model, high-quality mode, priority processing and a commercial-use license for the service.",
        "Every plan uses the same separation engine — you are paying for output options and volume, not for a different model on the free tier.",
      ],
    },
  ],
  faqs: [
    {
      q: "How many stems do I get?",
      a: "Four by default: vocals, drums, bass and other. The instrumental and the acapella are included in the same job. Pro adds a 6-stem model that splits the 'other' bucket further.",
    },
    {
      q: "Are the stems time-aligned?",
      a: "Yes. All stems are rendered from the same analysis and line up at the same start point, so importing them into a DAW at the same timestamp reconstructs the original song.",
    },
    {
      q: "Can I get 6 stems instead of 4?",
      a: "The Pro plan includes the 6-stem model in addition to the standard 4-stem output. It is useful when you want more detail in the guitar, piano or 'other' content.",
    },
    {
      q: "What format are the stems?",
      a: "Free and Starter plans deliver MP3 320kbps. Paid plans also offer WAV. Use WAV if you plan to mix, master or process the stems further.",
    },
    {
      q: "Can I use separated stems commercially?",
      a: "We license the separation service to you, but the rights to the source song belong to its owners. If you own or have licensed the track, you can use the stems commercially. If not, publishing or monetising them may infringe copyright.",
    },
  ],
  related: [
    {
      href: "/ai-vocal-remover",
      label: "AI vocal remover",
      blurb: "The vocal-first view of the same engine, with more on how the model works.",
    },
    {
      href: "/acapella-maker",
      label: "Acapella maker",
      blurb: "Use the vocals stem as a standalone acapella for covers and remixes.",
    },
    {
      href: "/karaoke-maker",
      label: "Karaoke maker",
      blurb: "Use the instrumental stem as a karaoke backing track.",
    },
  ],
  finalCta: {
    title: "Separate your first song into stems",
    body: "Upload a track and download all four stems in about a minute. Free 3-minute preview, WAV on paid plans.",
  },
};

export default function SeparateStemsPage() {
  return <ToolLandingPage data={data} />;
}
