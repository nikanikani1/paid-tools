import { ToolLandingPage, type ToolPageData } from "@/components/ToolLandingPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Stem Separation — 4 Stems (Vocals, Drums, Bass, Other)",
  description:
    "Separate any song into 4 stems — vocals, drums, bass and other — with AI. Producer-ready stem separation with MP3 320 downloads. Start with the $2.90 Trial Pack: 15 minutes, one-time.",
  path: "/separate-stems",
});

const data: ToolPageData = {
  slug: "/separate-stems",
  crumb: "Stem separation",
  title: "Stem Separation — 4 Stems (Vocals, Drums, Bass, Other)",
  description:
    "Separate any song into 4 stems — vocals, drums, bass and other — with AI. Producer-ready stem separation with MP3 320 downloads. Start with the $2.90 Trial Pack: 15 minutes, one-time.",
  h1: "Stem Separation — 4 Stems (Vocals, Drums, Bass, Other)",
  badge: "4-stem separation · producer-ready · $2.90 trial",
  intro: [
    "Stem separation takes a finished song and splits it into the parts it was mixed from: vocals, drums, bass and everything else. It is the difference between having a song and having the ingredients of a song.",
    "Producers use stems to remix, sample, practise and rebuild arrangements. Upload a track below and get all four stems back in minutes. Runs are paid — the one-time $2.90 Trial Pack includes 15 minutes and the full 4-stem output as MP3 320 downloads.",
  ],
  toolCta: "Separate into 4 stems",
  quickFacts: ["4 stems per job", "MP3 320 downloads", "Original tempo and key", "$2.90 trial · 15 min"],
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
        "Other — guitars, keys, strings, synths and the remaining textures as one stem.",
      ],
      bulletsColumns: 2,
    },
    {
      h2: "How it works",
      paragraphs: [
        "First, get a paid run: the $2.90 Trial Pack is a one-time 15-minute allowance. Then upload an MP3, M4A or FLAC file. The AI model analyses the mix and estimates each source across the frequency spectrum, then renders the stems. A three-minute song typically takes around a minute, and the result panel lists every file with a download link.",
        "There is nothing to configure. The model returns the same four stems for every genre, at the original tempo and key, and a finer split is not available yet.",
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
        "Drum, bass and acapella practice tracks.",
        "Music for video where one element conflicts with dialogue.",
        "Educational transcription and part learning.",
      ],
      bulletsColumns: 2,
    },
    {
      h2: "Stem separation vs. vocal removal",
      paragraphs: [
        "A vocal remover is a single-purpose view of the same technology: it focuses on removing the vocal from the mix. Stem separation exposes all the parts. In practice one job gives you everything, because the acapella is simply the vocals stem and the other three stems hold the rest of the mix.",
        "If you only need a backing track, use the vocal remover pages and ignore the extra files. If you are producing, mixing or sampling, go straight to stems — the individual parts are what you will actually work with.",
      ],
    },
    {
      h2: "Getting production-ready stems",
      paragraphs: [
        "Start with the highest-quality source you have. Lossless FLAC separates better than a low-bitrate stream, because compression smears sources into each other before the model ever sees the file. Every paid run delivers MP3 320 files.",
        "Expect the practical limits of the model: some vocal bleed in the drum and bass stems, occasional cymbal artifacts in dense mixes, and imperfect separation on live or mono recordings. For critical production work, A/B the stems against the original mix before committing.",
      ],
      bullets: [
        "Upload lossless or 320kbps sources.",
        "Download the four stems for mixing and mastering.",
        "Check phase and timing against the original.",
        "Dense arrangements are the hardest cases.",
        "Keep the original file as your reference master.",
      ],
      bulletsColumns: 2,
    },
    {
      h2: "Formats, limits and plans",
      paragraphs: [
        "The one-time $2.90 Trial Pack is the entry point: 15 minutes, all four stems, MP3 320 downloads, no subscription. Fifteen minutes is about five three-minute songs, and the minutes never expire. Subscriptions are not open yet; when Starter and Pro open they will add monthly minutes, and final terms will be published before the first sale.",
        "Every paid plan uses the same separation engine — you are paying for volume and output options, not for a different model on a free-of-charge allowance. There is no complimentary tier.",
      ],
    },
  ],
  faqs: [
    {
      q: "Is there a free stem separation option?",
      a: "No. There is no free-of-charge allowance and no complimentary preview: every separation costs GPU time, so every run is paid. The cheapest entry point is the one-time $2.90 Trial Pack — 15 minutes, about five songs, with all four stems in MP3 320.",
    },
    {
      q: "How many stems do I get?",
      a: "Four: vocals, drums, bass and other. The vocals stem is your acapella and the other three stems hold the rest of the mix. A finer split is not available yet.",
    },
    {
      q: "Are the stems time-aligned?",
      a: "Yes. All stems are rendered from the same analysis and line up at the same start point, so importing them into a DAW at the same timestamp reconstructs the original song.",
    },
    {
      q: "Can I get more than four stems?",
      a: "Every job currently returns four stems: vocals, drums, bass and other. A finer split is not available yet, so plan your production around those four parts.",
    },
    {
      q: "What format are the stems?",
      a: "Every paid run delivers MP3 320 files — the Trial Pack included. MP3 320 is enough for mixing, mastering and further processing.",
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
      blurb: "Use the drum, bass and other stems as the basis for a karaoke backing mix.",
    },
  ],
  finalCta: {
    title: "Separate your first song into stems",
    body: "Buy the $2.90 Trial Pack, upload a track and download all four stems in about a minute. 15 minutes, one-time payment, MP3 320 downloads included.",
  },
};

export default function SeparateStemsPage() {
  return <ToolLandingPage data={data} />;
}
