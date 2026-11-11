import { LegalPage, legalMetadata, type LegalPageData } from "@/components/LegalPage";
import { LEGAL_UPDATED } from "@/lib/seo";

const data: LegalPageData = {
  slug: "/privacy",
  crumb: "Privacy",
  title: "Privacy Policy",
  description:
    "How StemSplit.ai handles your audio and personal data: encrypted uploads, processing only, automatic deletion within 24–48 hours, no training on your files.",
  h1: "Privacy Policy",
  updated: LEGAL_UPDATED,
  intro: [
    "This policy explains what data StemSplit.ai collects when you use the vocal remover, why we collect it, how long we keep it and what rights you have. It applies to the website and to every separation job you run.",
    "The short version: your audio is used to process the job you asked for, it is not used to train models, and it is deleted automatically within 24–48 hours. You do not need an account to try the free preview.",
  ],
  sections: [
    {
      h2: "Who we are",
      paragraphs: [
        "StemSplit.ai is an online audio separation service. We operate the website, run the AI models that separate songs into stems, and manage the storage and delivery of the resulting files. Payments for paid plans are processed by Waffo as merchant of record.",
        "For privacy questions, contact privacy@stemsplit.ai. For data deletion requests, include the job ID shown in the result panel or the email address used for a paid plan.",
      ],
    },
    {
      h2: "What we collect",
      paragraphs: [
        "We keep data collection to what the service needs. Running a separation requires the audio file itself plus basic metadata such as filename, size and the time the job was created. If you purchase a plan, our payment provider collects the billing details — we receive confirmation of the payment and a subscription identifier, not your full card number.",
      ],
      bullets: [
        "Audio files and file metadata you upload for processing.",
        "Job data: job ID, status, progress, timestamps and output file references.",
        "Technical logs: IP address, browser type, request timestamps, error traces.",
        "Payment data for paid plans, handled by Waffo as merchant of record.",
        "Minimal analytics data about page visits and feature usage.",
      ],
    },
    {
      h2: "How we use your audio",
      paragraphs: [
        "Uploaded audio is used for one purpose: separating it into stems and delivering the results to you. We do not listen to your files for content moderation beyond automated abuse checks, we do not publish them, and we do not add them to any training dataset.",
        "The model is pre-trained and runs the same for every user. Nothing you upload influences the model or other people's results. The audio is written to short-lived storage, processed, and removed on a 24–48 hour lifecycle (download links expire earlier).",
      ],
      bullets: [
        "Purpose: process the job you requested.",
        "No model training on your audio.",
        "No public sharing or resale of your files.",
        "Automatic deletion within 24–48 hours.",
      ],
      bulletsColumns: 2,
    },
    {
      h2: "Who processes data for us",
      paragraphs: [
        "We use a small number of infrastructure providers, each of which only processes data on our instructions. Cloudflare provides hosting, storage and network services. Replicate runs the Demucs model on GPU hardware. Neon hosts the Postgres database that stores job records. Waffo handles payments and billing. Resend may be used to send transactional emails if you provide an address.",
        "These providers are bound by their own data processing terms and may process data in regions outside your country. Where that happens, we rely on appropriate safeguards such as standard contractual clauses.",
      ],
      bullets: [
        "Cloudflare — hosting, R2 object storage, network.",
        "Replicate — AI model inference on uploaded audio.",
        "Neon — job and subscription records (Postgres).",
        "Waffo — payments, invoices and tax handling.",
        "Resend — transactional email, when enabled.",
      ],
    },
    {
      h2: "How long we keep data",
      paragraphs: [
        "Audio uploads and separated stems are deleted automatically within 24–48 hours. Download links expire before that, usually within 24 hours. Job records (status, timestamps, file names) may be kept longer for debugging, abuse prevention and accounting, but they do not contain the audio itself.",
        "Payment and invoice records are retained as long as tax and accounting rules require. Technical logs are rotated on a short cycle and are not used to profile you.",
      ],
    },
    {
      h2: "Cookies and analytics",
      paragraphs: [
        "The site uses only the cookies and local storage needed to function — for example remembering your session on a paid plan or keeping a job reference in the browser tab. We do not use advertising cookies or sell data to ad networks.",
        "If we add product analytics, it will be privacy-oriented and limited to aggregate usage. You can block cookies in your browser settings; the free preview works without them, though some paid-plan features may not.",
      ],
    },
    {
      h2: "Your rights",
      paragraphs: [
        "Depending on where you live, you may have the right to access, correct, export or delete the personal data we hold about you, to object to certain processing, and to lodge a complaint with a supervisory authority. Under GDPR and CCPA/CPRA, these rights apply to personal information such as account and billing details and technical logs.",
        "Because audio files are deleted automatically, a deletion request should be sent quickly if you want a specific job's output removed sooner. We respond to verified requests within 30 days.",
      ],
      bullets: [
        "Access and export your personal data.",
        "Correct inaccurate account or billing details.",
        "Delete your data and request early file deletion.",
        "Object to processing and lodge a complaint.",
        "Do not sell or share — we do neither.",
      ],
      bulletsColumns: 2,
    },
    {
      h2: "Children and sensitive content",
      paragraphs: [
        "The service is not directed at children under 13, and we do not knowingly collect personal data from them. Do not upload recordings of children, private conversations or any content that would violate someone else's privacy or publicity rights.",
        "You are responsible for having the right to process the audio you upload. See the terms of service for the acceptable-use rules.",
      ],
    },
    {
      h2: "Changes to this policy",
      paragraphs: [
        "We may update this policy as the product changes. When a change is material, we will update the date at the top of the page and, where we have an email address, notify paying subscribers. Continuing to use the service after an update means you accept the revised policy.",
      ],
    },
  ],
  faqs: [
    {
      q: "Do you train AI models on my audio?",
      a: "No. Your upload is processed once with a pre-trained model, then deleted within 24–48 hours. It is never added to a training dataset or used to improve results for other users.",
    },
    {
      q: "Can I get my file deleted sooner?",
      a: "Yes. Email privacy@stemsplit.ai with the job ID and we will remove the upload and output files immediately instead of waiting for the automatic 24–48 hour deletion.",
    },
    {
      q: "Do you sell my data?",
      a: "No. We do not sell or share personal data with advertisers or data brokers. Payments are processed by Waffo, and the only processors with access to audio are the infrastructure providers listed above.",
    },
  ],
  contactNote:
    "Privacy questions or deletion requests: privacy@stemsplit.ai. For billing, contact billing@stemsplit.ai. Response time is up to 30 days for rights requests and 1–2 business days for support.",
};

export const metadata = legalMetadata(data);

export default function PrivacyPage() {
  return <LegalPage data={data} />;
}
