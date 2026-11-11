import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContentSections, type Section } from "@/components/ContentSections";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import {
  breadcrumbSchema,
  faqSchema,
  graphSchema,
  pageMetadata,
  webApplicationSchema,
  type FaqItem,
} from "@/lib/seo";

export const metadata = pageMetadata({
  title: "How Our AI Vocal Remover Works",
  description:
    "The full pipeline behind StemSplit.ai: upload, Demucs-based AI separation, 4-stem output, automatic deletion, privacy and copyright rules. No black boxes.",
  path: "/how-it-works",
});

const SECTIONS: Section[] = [
  {
    h2: "The three-step workflow",
    paragraphs: [
      "Every job on StemSplit follows the same three steps. You choose an audio file in the browser and upload it over an encrypted connection. Our servers send the audio through a Demucs-based separation model running on cloud GPU hardware. When the model finishes, the stems are rendered and offered as time-limited downloads.",
      "There is no software to install and no plugin to load. A run starts after you buy a Trial Pack or a plan — there is no free-of-charge processing tier — and the browser tab shows a progress bar while the job runs, with every output file listed in the result panel.",
    ],
  },
  {
    h2: "What happens to your file after upload",
    paragraphs: [
      "The upload goes to encrypted storage in the same region as the processing worker. A job record is created with a unique ID, and the model reads the audio from that storage location. Once the stems are produced, they are written to output storage and the links in your browser point at those files — your song itself is not exposed through a public URL.",
      "Working files are deleted automatically. In the current design the upload and output objects have a 24–48 hour lifecycle, and the download links themselves expire sooner. You can download your stems as many times as you need while the links are valid, and you can request early deletion through support if you want the files gone immediately.",
    ],
    bullets: [
      "Encrypted upload — no public URLs for your audio.",
      "Unique job ID used to track processing.",
      "Stems written to short-lived output storage.",
      "Uploads and outputs expire automatically within 24–48 hours.",
    ],
    bulletsColumns: 2,
  },
  {
    h2: "How the separation model works",
    paragraphs: [
      "The model is htdemucs, part of the Demucs family originally developed by Meta AI and released under an MIT license. It is a hybrid transformer: it analyses both the raw waveform and a time-frequency representation of the audio. The waveform path preserves transients — drum hits, vocal consonants, plosive sounds — while the spectral path makes sustained and overlapping sources easier to tell apart.",
      "The network is trained to estimate four sources: vocals, drums, bass and other. During training, those four estimates are summed back together and compared with the original mix, so the model learns a decomposition that reconstructs the song accurately while keeping each stem usable on its own. The 'other' stem carries guitars, keys, strings, synths and background textures.",
      "We do not train the model on your uploads and we do not fine-tune a model per customer. Every user runs the same pre-trained model, which is why results are consistent and why your audio never influences anyone else's separation.",
    ],
  },
  {
    h2: "Why separation is not perfect — and what to expect",
    paragraphs: [
      "Stem separation is an estimation problem, not a decoding problem. When a vocal and a guitar occupy the same frequencies at the same moment, the model has to guess how much energy belongs to each. Modern models are good at this, but not perfect, and the artifacts are predictable.",
      "The most common issues are vocal bleed in the instrumental, a slightly underwater quality on cymbals, and reduced clarity in dense mixes. Mono recordings, live bootlegs and heavily compressed sources are the hardest cases. If a result is not clean enough, try a higher-quality source file, trim to the section you need, or use the high-quality model available on Pro.",
    ],
    bullets: [
      "Vocal bleed — some vocal remains in the instrumental at low level.",
      "Cymbal smearing — high-frequency artifacts in dense mixes.",
      "Live recordings — bleed between stems because the mics captured everything.",
      "Mono masters — no stereo information for the model to use.",
    ],
    bulletsColumns: 2,
  },
  {
    h2: "Privacy and data handling",
    paragraphs: [
      "We collect the minimum needed to run a job: the audio file, basic file metadata, and technical logs such as job ID and timestamps. Payment details are handled by Waffo as merchant of record, so your full card number never reaches our servers, and we do not sell or share personal data with advertisers.",
      "Audio is processed only for the job you requested, is not published and is not used to train models. The full picture — including our processors, retention periods, cookies and your rights under GDPR and CCPA — is documented in the privacy policy.",
    ],
    bullets: [
      "No training on your audio.",
      "Automatic deletion within 24–48 hours.",
      "Time-limited download links.",
      "Payment handled by Waffo — card details never touch our servers.",
    ],
    bulletsColumns: 2,
  },
  {
    h2: "Copyright, ownership and acceptable use",
    paragraphs: [
      "Separating a song does not change who owns it. We grant you a license to use the separation service and the files it produces, but we cannot give you rights to the underlying recording or composition. If you own the track or have permission from the rights holders, you are allowed to use the stems. If you do not, publishing or monetising them may infringe copyright.",
      "Do not upload content that is illegal, that you have no right to process, or that violates someone else's privacy. We respond to valid DMCA takedown notices, and repeated abuse can result in access being blocked. The terms of service spell out the full acceptable-use rules.",
    ],
  },
  {
    h2: "The technology behind the site",
    paragraphs: [
      "The front end is a Next.js application rendered on Cloudflare's edge network. Audio is stored in Cloudflare R2 and processed by a Demucs model hosted on Replicate, with job state managed in a Postgres database. Payments, when you upgrade, are handled by Waffo as merchant of record, which means they take care of sales tax and card processing.",
      "The goal of this architecture is boring reliability: no GPU cluster to maintain, no queue server to babysit, and a processing path that can be swapped to a different model when a better one becomes available. If you want the longer version of any part of this page, the blog will cover model comparisons and quality tests as we publish them.",
    ],
  },
];

const FAQS: FaqItem[] = [
  {
    q: "Can I try before paying?",
    a: "No. There is no free-of-charge processing tier. The entry point is the one-time $2.90 Trial Pack: 15 minutes, 4 stems, WAV + MP3, no subscription. Every run is paid because every run costs GPU time.",
  },
  {
    q: "How long does a separation take?",
    a: "A typical three-minute song takes around 60–90 seconds including queue time. Longer tracks and the high-quality model take proportionally longer. Paid plans include a priority queue.",
  },
  {
    q: "Is my audio used to train the AI model?",
    a: "No. Your upload is processed once and deleted from working storage within 24–48 hours. It is never added to a training set or shared with other users.",
  },
  {
    q: "Which model do you use?",
    a: "htdemucs, a Demucs-family model developed by Meta AI and released under an MIT license. The Pro plan adds a 6-stem variant. We do not train custom models per user.",
  },
  {
    q: "Can I delete my files sooner?",
    a: "Yes — contact support with the job ID and we will remove the upload and output files immediately. Normal deletion is automatic within 24–48 hours.",
  },
  {
    q: "Can I upload copyrighted songs?",
    a: "Only if you own the track or have permission from the rights holders. We cannot grant rights to someone else's recording, and publishing stems of a song you do not control may infringe copyright.",
  },
];

export default function HowItWorksPage() {
  const schema = graphSchema(
    webApplicationSchema({
      name: "StemSplit.ai Vocal Remover",
      description:
        "AI vocal remover that separates a song into vocals, drums, bass and other stems. Upload, process, download in minutes.",
      path: "/how-it-works",
    }),
    faqSchema(FAQS),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "How it works", path: "/how-it-works" },
    ]),
  );

  return (
    <>
      <JsonLd data={schema} />
      <div className="mx-auto max-w-6xl px-6">
        <div className="pt-6">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "How it works" }]} />
        </div>

        <header className="py-10 md:py-14">
          <div className="max-w-3xl">
            <div className="badge">Trust &amp; transparency</div>
            <h1 className="display mt-5 text-4xl md:text-5xl">How Our AI Vocal Remover Works</h1>
            <p className="mt-5 leading-relaxed text-slate-300">
              Most vocal remover sites explain the result and skip the process. This page is the other way around:
              what happens between upload and download, which model runs, how long your files are kept and what the
              tool can and cannot do.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/pricing#trial" className="btn btn-primary">
                Start with the $2.90 trial
              </Link>
              <Link href="/pricing" className="btn btn-ghost">
                See pricing
              </Link>
            </div>
          </div>
        </header>

        <ContentSections sections={SECTIONS} />

        <Faq items={FAQS} />

        <section className="hairline py-14">
          <div className="card mx-auto max-w-3xl p-6 md:p-8">
            <h2 className="text-xl font-semibold">Questions about the pipeline?</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Read the{" "}
              <Link href="/privacy" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                privacy policy
              </Link>{" "}
              for data handling, the{" "}
              <Link href="/terms" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                terms of service
              </Link>{" "}
              for acceptable use, or the{" "}
              <Link href="/refund" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                refund policy
              </Link>{" "}
              for billing questions.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
