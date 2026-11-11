import { ToolLandingPage, type ToolPageData } from "@/components/ToolLandingPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Free Vocal Eliminator — Remove Vocals from Any Song",
  description:
    "Free vocal eliminator with AI quality: remove vocals from a song and download the instrumental. See exactly what the free tier includes and where the limits are.",
  path: "/free-vocal-eliminator",
});

const data: ToolPageData = {
  slug: "/free-vocal-eliminator",
  crumb: "Free vocal eliminator",
  title: "Free Vocal Eliminator — Remove Vocals from Any Song",
  description:
    "Free vocal eliminator with AI quality: remove vocals from a song and download the instrumental. See exactly what the free tier includes and where the limits are.",
  h1: "Free Vocal Eliminator — Remove Vocals from Any Song",
  badge: "Free tier · 3 minutes · 2 stems",
  intro: [
    "This free vocal eliminator uses the same AI stem-separation model as the paid plans — not a center-channel filter, not a 30-second watermark preview. Choose a track, wait about a minute, and download the instrumental.",
    "Here is exactly what the free tier covers, what it does not, and how to get the cleanest possible result before you decide whether to upgrade.",
  ],
  toolCta: "Remove vocals — free",
  quickFacts: ["Free 3 minutes", "No signup", "No watermark", "MP3 320 download"],
  sections: [
    {
      h2: "What the free vocal eliminator includes",
      paragraphs: [
        "The free tier is deliberately simple: one track per day, up to 3 minutes long, separated into vocals and instrumental and delivered as MP3 320kbps files. There is no account to create, no card to add and no watermark on the download.",
        "That covers a full verse-chorus-verse pop song and every karaoke track you are likely to want for personal use. It is also enough to judge whether the AI separation quality is good enough for your project before paying for anything.",
      ],
      bullets: [
        "1 track per day, up to 3 minutes.",
        "2 stems: vocals and instrumental (the instrumental doubles as a karaoke backing track).",
        "MP3 320kbps download, no watermark.",
        "No signup, no credit card, no install.",
      ],
      bulletsColumns: 2,
    },
    {
      h2: "Free vocal eliminator vs. the paid vocal remover",
      paragraphs: [
        "The free tier is not a crippled demo — it renders the same separation the paid plans do. What you pay for is scale and output quality: longer tracks, the full 4-stem set, lossless WAV, batch processing, the high-quality model and a priority queue.",
        "If you need drums, bass and other as separate files for production, or you are processing more than one track a day, the Starter plan at $5/month removes the limits and adds WAV output. If you only need an instrumental for karaoke practice every now and then, the free tier is genuinely all you need.",
      ],
      bullets: [
        "Free: 3 minutes, 2 stems, 1 track/day, MP3 320.",
        "Starter ($5/mo): 90 minutes, 4 stems, WAV + MP3, batch upload, no watermark.",
        "Pro ($9/mo): 200 minutes, 6-stem model, priority queue, commercial-use license.",
        "Annual ($39/yr): the Starter allowance for about $3.25/month.",
      ],
    },
    {
      h2: "How to get the cleanest instrumental for free",
      paragraphs: [
        "Free tools get a bad reputation because most of them are phase filters. Run the same high-quality source through a real AI separator and the difference is obvious. The remaining variable is the file you upload.",
        "Start with the best copy of the song you have — a WAV, FLAC or 320kbps MP3 rather than a low-bitrate stream. Keep the excerpt under three minutes so it fits in the free allowance, and try to end on a clean bar rather than in the middle of a vocal phrase. If the track has a long intro, trim it; you will get your stems back faster.",
      ],
      bullets: [
        "Upload lossless or 320kbps audio, never a 96–128kbps rip.",
        "Keep the free run under 3 minutes — a verse, chorus and bridge is plenty to judge quality.",
        "Avoid clipped or distorted files; artifacts in the source become artifacts in the stems.",
        "Compare the instrumental with the original at the same volume before judging.",
      ],
      bulletsColumns: 2,
    },
    {
      h2: "Free vocal removal without signing up: step by step",
      paragraphs: [
        "The workflow is the same on every device: open this page in a browser, select a file, and let the model run. You can watch the progress live, and when it finishes the download links appear next to each stem.",
        "Nothing is installed, no plugin is loaded and no account is created. The file is processed on cloud hardware, the stems are made available through time-limited links, and the upload is removed from working storage automatically.",
      ],
      bullets: [
        "Pick an audio file under 100MB and under 3 minutes for the free tier.",
        "Click 'Remove vocals — free' and keep the tab open while it processes.",
        "Download the vocals and instrumental from the result panel.",
        "Come back tomorrow for another free track, or upgrade for unlimited runs.",
      ],
    },
    {
      h2: "Why free vocal eliminators usually sound bad — and why this one doesn't",
      paragraphs: [
        "Most 'free vocal eliminator' pages online are built on a 20-year-old stereo trick: invert one channel, sum both channels, and anything centered cancels out. It is fast and free to run, which is why so many sites offer it, but it cannot distinguish a vocal from a kick drum. The low end disappears and the result sounds like a phone call.",
        "This tool runs a trained separation model instead. It estimates the vocal, drum, bass and other components across the whole frequency spectrum and rebuilds them separately, so the instrumental keeps its weight and the acapella keeps its detail. The free allowance is shorter and returns fewer stems, but the sound quality is the same engine the paid plans use.",
      ],
    },
    {
      h2: "When the free tier is enough",
      paragraphs: [
        "For karaoke at home, learning a bass line by ear, making a quick cover video or checking whether separation works on an obscure track, the free tier is the right tool. It is also the cheapest way to test our quality against the alternatives before committing to a subscription.",
        "Upgrade when you need individual drums and bass files, lossless downloads, tracks longer than three minutes, or more than one job a day. Both plans are month-to-month and the refund policy covers your first purchase for 14 days.",
      ],
    },
  ],
  faqs: [
    {
      q: "Is the free vocal eliminator really free?",
      a: "Yes. One separation per day, up to 3 minutes, with vocals and instrumental stems and no watermark. No account or card is required, and you can use the free tier as long as you like.",
    },
    {
      q: "Do I need to create an account?",
      a: "No. The free flow works without signing up. An account becomes useful only for managing a paid subscription and its minute allowance.",
    },
    {
      q: "Is there a watermark on free downloads?",
      a: "No. Free downloads are clean MP3 320 files. The limits are the track length, the number of stems and one job per day — not the audio itself.",
    },
    {
      q: "What are the free tier limits exactly?",
      a: "One track per day, maximum 3 minutes per track, 2 stems (vocals and instrumental), MP3 320kbps only. Longer tracks, 4-stem output and WAV files require a paid plan.",
    },
    {
      q: "Can I use free instrumental stems commercially?",
      a: "We license the separation service to you, but the rights to the underlying song are not ours to grant. If you own the recording or have a license, you can use the stems commercially. If not, your use may infringe the rights holders' copyright.",
    },
  ],
  related: [
    {
      href: "/vocal-remover-online",
      label: "Vocal remover online",
      blurb: "The browser-based workflow explained: formats, limits and privacy without installing anything.",
    },
    {
      href: "/remove-vocals-from-song",
      label: "Remove vocals from a song",
      blurb: "Three methods compared, including the free Audacity center-cancellation approach.",
    },
    {
      href: "/ai-vocal-remover",
      label: "AI vocal remover",
      blurb: "How the model actually separates a mix — and why it sounds better than filters.",
    },
  ],
  finalCta: {
    title: "Try the free vocal eliminator now",
    body: "One free 3-minute track per day, no signup and no watermark. If you need more stems or longer tracks, the Starter plan is $5/month.",
  },
};

export default function FreeVocalEliminatorPage() {
  return <ToolLandingPage data={data} />;
}
