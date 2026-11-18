import { ToolLandingPage, type ToolPageData } from "@/components/ToolLandingPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Acapella Extractor — Make an Acapella from Any Song",
  description:
    "Make a clean acapella from any song with AI. Extract the vocal for covers, remixes, sampling or practice. $2.90 Trial Pack: 15 minutes, 4 MP3 stems.",
  path: "/acapella-maker",
});

const data: ToolPageData = {
  slug: "/acapella-maker",
  crumb: "Acapella maker",
  title: "Acapella Extractor — Make an Acapella from Any Song",
  description:
    "Make a clean acapella from any song with AI. Extract the vocal for covers, remixes, sampling or practice. $2.90 Trial Pack: 15 minutes, 4 MP3 stems.",
  h1: "Acapella Extractor — Make an Acapella from Any Song",
  badge: "Acapella extractor · vocals stem · $2.90 trial",
  intro: [
    "An acapella extractor (also called an acapella maker) isolates the singing from a finished song so you can use it as a standalone vocal track — for covers, remixes, sampling, vocal practice or content. The output is the vocal stem on its own, with the instruments removed.",
    "Upload a track below and the AI does the extraction in about a minute. Runs are paid: the one-time $2.90 Trial Pack includes 15 minutes and the full 4-stem output, acapella included.",
  ],
  toolCta: "Extract the acapella",
  quickFacts: ["Isolates the vocal stem", "Lead + harmonies", "MP3 320", "$2.90 trial · 15 min"],
  sections: [
    {
      h2: "What an acapella extractor actually does",
      paragraphs: [
        "A finished song is a mix of many sources — vocals, drums, bass, guitars, keys and effects — flattened into two channels. An acapella maker has to reverse that process for the vocal alone. Unlike a vocal remover, which keeps the backing track, an acapella maker keeps the singing and discards the instruments.",
        "Modern AI models do this by learning what voices sound like and predicting the vocal's contribution to the mix at every moment. The extracted acapella includes the lead vocal together with backing vocals and harmonies, because they are all part of the same vocal performance. Reverb and delay tails may also come along for the ride — they are baked into the original recording.",
      ],
    },
    {
      h2: "Who needs an acapella extractor",
      paragraphs: [
        "Cover artists use acapellas as a reference to learn phrasing, tuning and timing. Remixers and producers need them to build a new arrangement around a familiar vocal. Content creators use short acapella snippets in videos and livestreams. Singers use them for practice and for layering harmonies on top of an existing performance.",
        "The common thread is that building or rehearsing a vocal from scratch is not always practical. An extracted acapella gives you the real performance immediately, and because the same job also produces the drum, bass and other stems, you can work with the vocal and the backing parts separately.",
      ],
      bullets: [
        "Covers and tribute performances — learn or reproduce the original vocal.",
        "Remixes and mashups — put the vocal over a new backing track.",
        "Sampling and production — chop real vocal phrases into a new track.",
        "Practice and transcription — slow the vocal down and study it.",
      ],
      bulletsColumns: 2,
    },
    {
      h2: "How to extract an acapella in three steps",
      paragraphs: [
        "First, get a paid run: the $2.90 Trial Pack adds 15 minutes of separation to your account and never renews. Then upload the song — the format does not matter much as long as it is not heavily compressed; MP3, M4A and FLAC all work. The model separates the mix in about a minute, and you download the vocals stem.",
        "If you only need the acapella, you can ignore the other stems even though they are included. If you later decide to make a karaoke version or a remix, the drum, bass and other stems are already waiting in the same download.",
      ],
    },
    {
      h2: "How to get a cleaner acapella",
      paragraphs: [
        "Source quality is the biggest factor. A lossless file or a 320kbps MP3 gives the model far more to work with than a 128kbps stream rip, which smears the vocal into the instruments. If the song is available in higher quality, use that version.",
        "Some recordings are simply hard: heavily distorted vocals, whispered passages, dense wall-of-sound productions or live recordings where the vocal mic also picked up the drums. In those cases the acapella may contain bleed or artifacts. A cleaner source file helps, but no separator can undo a difficult source completely.",
      ],
      bullets: [
        "Use FLAC or a high-bitrate MP3, not low-bitrate rips.",
        "Avoid clipping and heavily limited masters when you have a choice.",
        "For long songs, separate the section you actually need.",
        "Check the acapella with headphones — bleed is easiest to hear there.",
      ],
      bulletsColumns: 2,
    },
    {
      h2: "Acapella vs. stems vs. karaoke: what's the difference",
      paragraphs: [
        "An acapella is the vocal alone. A karaoke track is the song with the vocal removed. Stems are the individual parts — vocals, drums, bass and other — which is what a separator actually returns. The acapella is simply the vocals stem; the remaining three stems hold the rest of the mix.",
        "In practice one separation gives you everything: the acapella for covers and remixes, plus the drum, bass and other stems for karaoke or production. That is why producers use stem separation instead of separate vocal-removal and acapella-extraction tools.",
      ],
    },
    {
      h2: "Using extracted acapellas legally",
      paragraphs: [
        "Extracting an acapella does not give you ownership of the recording. We license you to use the separation service, but the rights to the song and the performance belong to their owners. For personal practice, private study or a licensed cover, that is usually fine. For publishing, monetising or releasing a remix, you generally need permission from the rights holders.",
        "If you are building a portfolio or releasing music, the safe path is to work with tracks you wrote or licensed, or to use acapellas that are explicitly cleared for reuse. When in doubt, ask first — takedowns and Content ID claims are much cheaper to avoid than to resolve.",
      ],
    },
  ],
  faqs: [
    {
      q: "Is an acapella extractor the same as an acapella maker?",
      a: "Yes. Both names describe the same job: separating the vocal from the instrumental. This acapella extractor returns the vocals stem on its own, and the same paid run also includes the drums, bass and other stems as MP3 320 files.",
    },
    {
      q: "Is there a free way to extract an acapella with AI here?",
      a: "No. There is no free-of-charge allowance: every separation costs GPU time, so every run is paid. The $2.90 Trial Pack is the cheapest option and includes 15 minutes and all four stems: the vocals stem (your acapella), drums, bass and other.",
    },
    {
      q: "Can I extract just the lead vocal without the backing vocals?",
      a: "Not with the standard model. Lead, harmonies and backing vocals all land in the vocals stem, which is normally what you want for a cover or remix. Separating lead from backing vocals is not currently offered.",
    },
    {
      q: "Will the acapella include reverb and effects?",
      a: "Yes, mostly. Reverb, delay and other effects are part of the original recording, so the model captures them along with the voice. The acapella usually sounds like the vocal as it was mixed, not a dry studio take.",
    },
    {
      q: "Can I make an acapella of a song I don't own?",
      a: "You can process audio you have the rights to use. We cannot grant rights to the underlying song, so publishing or monetising an acapella of someone else's track may infringe copyright. Personal practice is a different matter from public release.",
    },
    {
      q: "What format is the acapella download?",
      a: "Every paid run delivers MP3 320 files — the Trial Pack included. The vocals stem is named separately from the drums, bass and other stems so you can find it easily in the download list.",
    },
    {
      q: "Does the Trial Pack include the acapella?",
      a: "Yes. Any run returns all four stems: vocals (your acapella), drums, bass and other. The $2.90 Trial Pack includes 15 minutes of runs — about five three-minute songs — with no subscription.",
    },
  ],
  related: [
    {
      href: "/karaoke-maker",
      label: "Karaoke maker",
      blurb: "The same separation, used the other way around: keep the music and drop the vocal.",
    },
    {
      href: "/separate-stems",
      label: "Stem separation",
      blurb: "See the full four-stem view, including drums, bass and other.",
    },
    {
      href: "/ai-vocal-remover",
      label: "AI vocal remover",
      blurb: "How the AI isolates a vocal from a full mix, and where bleed comes from.",
    },
    {
      href: "/remove-vocals-from-song",
      label: "Remove vocals from a song",
      blurb: "Compare AI extraction with manual center-cancellation and official vocal-free versions.",
    },
  ],
  finalCta: {
    title: "Pull the acapella out of your next track",
    body: "Buy the $2.90 Trial Pack, upload a song and download the vocals stem for your cover, remix or practice session. 15 minutes, one-time payment.",
  },
};

export default function AcapellaMakerPage() {
  return <ToolLandingPage data={data} />;
}
