import { ToolLandingPage, type ToolPageData } from "@/components/ToolLandingPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Karaoke Maker — Remove Vocals, Keep the Music",
  description:
    "Make a karaoke track from any song: the AI karaoke maker removes the vocals and keeps the band. Start with the $2.90 Trial Pack — 15 minutes, one-time payment, MP3 downloads.",
  path: "/karaoke-maker",
});

const data: ToolPageData = {
  slug: "/karaoke-maker",
  crumb: "Karaoke maker",
  title: "Karaoke Maker — Remove Vocals, Keep the Music",
  description:
    "Make a karaoke track from any song: the AI karaoke maker removes the vocals and keeps the band. Start with the $2.90 Trial Pack — 15 minutes, one-time payment, MP3 downloads.",
  h1: "Karaoke Maker — Remove Vocals, Keep the Music",
  badge: "Karaoke track maker · $2.90 trial",
  intro: [
    "A karaoke maker turns any song into a backing track by removing the lead vocal while keeping the instruments exactly where they are. That is what this page does: upload a track, get a karaoke version in about a minute, and sing over it.",
    "Unlike karaoke videos on streaming sites, you are not limited to the songs someone else chose to produce. Any track you have the rights to use can become your backing track, in its original key and arrangement. Runs are paid — the one-time $2.90 Trial Pack covers 15 minutes.",
  ],
  toolCta: "Make my karaoke track",
  quickFacts: ["Any song, original key", "Full band preserved", "MP3 320 downloads", "$2.90 trial · 15 min"],
  sections: [
    {
      h2: "Make a karaoke track from any song",
      paragraphs: [
        "The workflow is the same as any vocal removal: upload the song, let the AI separate the vocal from the instruments, and use the drum, bass and other stems as your karaoke backing mix. The result keeps the original tempo and key, minus the singer.",
        "Because the model separates rather than filters, the backing track keeps its drums, bass, guitars and stereo image. It sounds like the record with the vocal muted, not like a thin, hollow version of the song. For most pop, rock, country and hip-hop tracks, that is close enough to sing over at home, at a party or in a rehearsal room.",
      ],
    },
    {
      h2: "What makes a good karaoke backing track",
      paragraphs: [
        "Three things matter: the vocal has to be gone, the band has to still sound like a band, and the timing has to stay intact. AI separation is strong on all three because it rebuilds each instrument rather than subtracting a channel. The low end stays warm, the drums keep their transient snap, and the stereo width remains.",
        "Backing vocals are the one caveat. Harmonies and backing vocals are part of the vocals stem, so they are removed along with the lead. That is usually what karaoke singers want — but if a song relies on a call-and-response backing vocal, you may prefer to keep a little of the original vocal at low volume in your mix.",
      ],
      bullets: [
        "Lead vocal removed; drums, bass and other kept.",
        "Original tempo, key and arrangement — no re-recording.",
        "Backing vocals and harmonies are removed with the vocal stem.",
        "Stereo image and low end preserved by AI separation.",
      ],
      bulletsColumns: 2,
    },
    {
      h2: "How to make a karaoke version in three steps",
      paragraphs: [
        "First, buy the $2.90 Trial Pack — 15 minutes, one-time payment, no subscription. Then upload the song with the tool at the top of this page. The AI model separates the mix into four stems, and a typical three-minute track is finished in around a minute. Download the drum, bass and other stems and use them as your karaoke backing mix.",
        "If you also want the acapella for harmony practice, it is in the same download. Every paid run returns drums and bass too, which is useful if you want to build a custom arrangement or change the energy of a section.",
      ],
    },
    {
      h2: "Karaoke maker vs. karaoke apps and videos",
      paragraphs: [
        "Karaoke apps and video platforms offer a catalogue of tracks that someone else produced. They are convenient, but the catalogue is limited, the key is fixed and the arrangement may be a re-recording rather than the original. If your song is not in the catalogue, you are stuck.",
        "A karaoke maker gives you the original recording as a backing track, for any song you have the rights to process. You are not limited to a catalogue, and you can edit the backing track afterwards — loop a chorus, cut a bridge, or export it into a recording app. The trade-off is that you have to process the song yourself, which takes about a minute and a small one-time fee.",
      ],
      bullets: [
        "Catalogue karaoke: instant, but limited song choice and fixed arrangements.",
        "AI karaoke maker: any song, original recording, editable output.",
        "Catalogue tracks are licensed for karaoke use; check rights before public performance.",
        "AI output is a backing track you can edit, loop and re-export.",
      ],
      bulletsColumns: 2,
    },
    {
      h2: "Recording vocals over your karaoke track",
      paragraphs: [
        "Once you have the backing parts, load them into any recording app and add a vocal track. Use headphones so the backing mix does not bleed into your microphone, and record a few takes before choosing one. Most phones and laptops are good enough for a practice recording; for a release, use a proper mic and interface.",
        "If the song is in the wrong key for your voice, transpose the stems in your DAW. Because each stem is a normal MP3 file, any pitch-shifting tool will work — a semitone or two up or down usually sounds natural.",
      ],
      bullets: [
        "Use headphones to stop the backing track bleeding into the mic.",
        "Record several takes and comp the best lines.",
        "Transpose the stems if the key does not suit your range.",
        "Export at 44.1kHz or higher if you plan to publish.",
      ],
      bulletsColumns: 2,
    },
    {
      h2: "Karaoke, vocal-free mixes and acapella: what's the difference",
      paragraphs: [
        "A karaoke track and a vocal-free mix are practically the same thing: the song without the lead vocal. An acapella is the opposite — the vocal without the instruments. Stems are the individual parts that make all of this possible.",
        "One upload returns all of it: the drum, bass and other stems for your karaoke mix, the vocals stem for harmony practice or remix, and the parts for production. That is the advantage of stem separation over a single-purpose karaoke tool.",
      ],
    },
  ],
  faqs: [
    {
      q: "Is there a free karaoke maker here?",
      a: "No. There is no free-of-charge allowance: every separation costs GPU time, so every run is paid. The $2.90 Trial Pack is the cheapest entry point — 15 minutes, one-time payment, about five three-minute songs — and it returns all four separated stems.",
    },
    {
      q: "Can I make a karaoke version of any song?",
      a: "You can process any song you have the rights to use. The tool works best on studio recordings with a clear arrangement; dense or live recordings may leave some vocal bleed in the backing track.",
    },
    {
      q: "Will the backing vocals stay in the karaoke track?",
      a: "No. Backing vocals and harmonies are part of the vocals stem, so they are removed along with the lead vocal. If you want them, mix a little of the original vocal back in at low volume.",
    },
    {
      q: "Can I change the key of my karaoke track?",
      a: "Yes — download the stems and transpose them in any DAW or audio editor. The downloads are normal MP3 files, so any pitch-shifting tool works.",
    },
    {
      q: "Can I use the karaoke track at an event or online?",
      a: "We license you to use the separation service, but the rights to the song remain with its owners. Public performance, streaming or monetised use of a backing track may require a license from the rights holders.",
    },
    {
      q: "What download format do I get?",
      a: "Every paid run delivers MP3 320 files — the Trial Pack included. MP3 320 is enough for practice, transposition and recording over the track.",
    },
  ],
  related: [
    {
      href: "/acapella-maker",
      label: "Acapella maker",
      blurb: "Get the vocal stem too, for harmony practice or a remix.",
    },
    {
      href: "/remove-vocals-from-song",
      label: "Remove vocals from a song",
      blurb: "Compare the AI method with manual phase cancellation and official vocal-free versions.",
    },
    {
      href: "/vocal-remover-online",
      label: "Vocal remover online",
      blurb: "The browser-based workflow, including formats and privacy.",
    },
  ],
  finalCta: {
    title: "Turn your song into a karaoke track",
    body: "Buy the $2.90 Trial Pack, upload a track and download the four separated stems. 15 minutes, one-time payment, original key and arrangement.",
  },
};

export default function KaraokeMakerPage() {
  return <ToolLandingPage data={data} />;
}
