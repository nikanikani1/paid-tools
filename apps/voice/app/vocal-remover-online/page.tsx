import { ToolLandingPage, type ToolPageData } from "@/components/ToolLandingPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Vocal Remover Online — No Install, Runs in Your Browser",
  description:
    "A vocal remover online that runs in your browser: separate vocals and instrumental from any song with no install. Start with the $2.90 Trial Pack — 15 minutes, one-time payment.",
  path: "/vocal-remover-online",
});

const data: ToolPageData = {
  slug: "/vocal-remover-online",
  crumb: "Vocal remover online",
  title: "Vocal Remover Online — No Install, Runs in Your Browser",
  description:
    "A vocal remover online that runs in your browser: separate vocals and instrumental from any song with no install. Start with the $2.90 Trial Pack — 15 minutes, one-time payment.",
  h1: "Vocal Remover Online — No Install, Runs in Your Browser",
  badge: "Browser-based · no install · $2.90 trial",
  intro: [
    "Some vocal removers ask you to install a desktop app or a VST plugin before you can hear a single result. This one runs entirely in your browser: open the page, buy the $2.90 Trial Pack, choose a file and download your stems.",
    "No install and no plugin — the processing happens on our servers and the browser only handles the upload and download. It works on Windows, macOS, Linux, ChromeOS, Android and iOS.",
  ],
  toolCta: "Remove vocals online",
  quickFacts: ["Works in any browser", "No install", "$2.90 trial · 15 min", "Any device"],
  sections: [
    {
      h2: "Why an online vocal remover is usually enough",
      paragraphs: [
        "Desktop stem-separation tools exist, and they are useful when you are processing hundreds of tracks or need a custom model. For the majority of jobs — a karaoke backing track, an acapella for a cover, a drum loop for practice — an online tool removes the biggest obstacle: setup.",
        "There is nothing to download, no GPU to buy, no Python environment to configure and no plugin to load into a DAW. The heavy model runs on cloud hardware, which means a laptop or a phone can produce the same result as a workstation. Updates happen on our side, so the tool you open next month has the latest model without you reinstalling anything.",
      ],
    },
    {
      h2: "Supported formats and size limits",
      paragraphs: [
        "You can upload MP3, WAV, M4A and FLAC files up to 100MB, which is roughly 10 minutes of audio depending on the format. The upload runs over the browser's normal HTTPS connection, and every paid run delivers MP3 320 and WAV files — the Trial Pack included.",
        "Very large files are rejected before processing so you do not lose paid minutes on an upload that cannot work. If a track is longer than ten minutes, split it into sections and process each one — the model handles a section just as well as a full track.",
      ],
      bullets: [
        "MP3, WAV, M4A, FLAC — the formats people actually have.",
        "Up to 100MB / about 10 minutes per track.",
        "MP3 320 + WAV on the Trial Pack and every plan.",
        "No plugin, no software, no file conversion step.",
      ],
      bulletsColumns: 2,
    },
    {
      h2: "Online vs. desktop vocal remover: an honest comparison",
      paragraphs: [
        "A desktop tool wins if you need offline processing, batch thousands of tracks, or want to run a fine-tuned model yourself. But those advantages come with costs: a capable GPU, installation and maintenance, and a learning curve before your first result.",
        "The online approach wins on time-to-first-result, on any-device access and on simplicity. The trade-offs are upload time for large files and a queue on busy days — both of which matter less than they sound for a 3-minute karaoke track. If you process tracks professionally every day, a desktop setup may eventually make sense; if you need results today, the browser is faster.",
      ],
      bullets: [
        "Setup: zero for online, minutes to hours for desktop.",
        "Hardware: any device online, GPU recommended for desktop.",
        "Updates: automatic online, manual for desktop.",
        "Convenience: same tool on phone, laptop and studio machine online.",
      ],
      bulletsColumns: 2,
    },
    {
      h2: "Works on any device you already own",
      paragraphs: [
        "The upload tool is built on standard browser APIs and has no native dependencies, so it works in current versions of Chrome, Edge, Safari and Firefox. There is no app store download, no Android/iOS version to keep updated and no desktop-only install step.",
        "On a phone or tablet, tap the upload area and choose a file from your storage app or cloud drive. On a Chromebook or Linux machine, drag the file straight into the page. If your browser can upload a file, it can use the vocal remover.",
      ],
    },
    {
      h2: "Your audio stays private online",
      paragraphs: [
        "Uploads travel over an encrypted connection to the processing environment, are used only for the job you requested, and are removed from working storage automatically — normally within 24 to 48 hours. Download links are time-limited, and your audio is never used to train models.",
        "That matters because 'online' can sound like 'public'. It is not: your file is not shared, published or added to a library of songs. Read the privacy policy for the full description of what is stored, for how long and who processes it.",
      ],
    },
    {
      h2: "Separate vocals online in three steps",
      paragraphs: [
        "First, buy the $2.90 Trial Pack — a one-time purchase that adds 15 minutes to your account. Then choose an audio file using the tool at the top of this page. The AI model separates the mix into vocals, instrumental, drums, bass and other; a typical three-minute song takes about a minute and you can watch the progress bar move. Finally, download the stems you need from the result panel.",
        "The whole flow takes less time than installing most desktop alternatives. If you want the full technical explanation of what happens between upload and download, the how-it-works page walks through the pipeline step by step.",
      ],
    },
  ],
  faqs: [
    {
      q: "Is there a free version of the online vocal remover?",
      a: "No. Every run is paid because every run costs GPU time. The entry point is the one-time $2.90 Trial Pack: 15 minutes, 4 stems, MP3 320 and WAV, no subscription. There is no complimentary preview and no free-of-charge allowance.",
    },
    {
      q: "Does the online vocal remover upload my whole song?",
      a: "Yes — the file you select is uploaded to our processing environment so the model can separate it. It is used only for your job, deleted from working storage automatically, and never used for model training or shared with other users.",
    },
    {
      q: "Do I need Chrome?",
      a: "No. Current versions of Chrome, Edge, Safari and Firefox all work. Any modern browser that supports file uploads and JavaScript can use the tool.",
    },
    {
      q: "Can I use the vocal remover on my phone?",
      a: "Yes. The page is responsive and works on iOS and Android browsers. Tap the upload area, pick a file from your device or cloud storage, and wait for the stems — no app install required.",
    },
    {
      q: "Is online separation slower than desktop software?",
      a: "Processing itself is comparable because the model runs on dedicated cloud hardware. Online adds upload and download time, which is usually a few seconds for a 3-minute MP3. Large WAV files take longer to upload than to process.",
    },
    {
      q: "What do I get for $2.90?",
      a: "15 minutes of AI separation, billed once — about five three-minute songs. Each job returns vocals, instrumental, drums, bass and other as separate files in MP3 320 and WAV. The minutes never expire and nothing renews automatically.",
    },
  ],
  related: [
    {
      href: "/free-vocal-eliminator",
      label: "Free vocal eliminator",
      blurb: "An honest comparison of free phase-cancellation methods versus paid AI separation.",
    },
    {
      href: "/remove-vocals-from-song",
      label: "Remove vocals from a song",
      blurb: "Three ways to get an instrumental, including manual methods in your DAW.",
    },
    {
      href: "/karaoke-maker",
      label: "Karaoke maker",
      blurb: "Turn the instrumental stem into a karaoke backing track you can sing over.",
    },
  ],
  finalCta: {
    title: "Open the vocal remover and upload a track",
    body: "No install, no plugin. Buy the $2.90 Trial Pack first — 15 minutes, 4 stems, one-time payment — then run the whole job in the browser tab you already have open.",
  },
};

export default function VocalRemoverOnlinePage() {
  return <ToolLandingPage data={data} />;
}
