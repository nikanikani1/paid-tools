import { LegalPage, legalMetadata, type LegalPageData } from "@/components/LegalPage";

const data: LegalPageData = {
  slug: "/privacy",
  crumb: "Privacy",
  title: "Privacy Policy",
  description:
    "How StemSplit.ai handles your audio: what we collect, which processors see it, the 30-day file retention window, and why your uploads are not used to train models.",
  h1: "Privacy Policy",
  updated: "November 14, 2026",
  intro: [
    "This policy explains what data StemSplit.ai collects when you use the vocal remover, why we collect it, how long we keep it and what rights you have. It applies to the website and to every separation job you run.",
    "The short version: a completed job returns four MP3 stems (vocals, drums, bass, other) at 320 kbps. Your upload is used to process that job only, it is not used to train models, and the audio and output files are deleted from storage within 30 days. Payment details are handled by Waffo as merchant of record.",
  ],
  sections: [
    {
      h2: "Who we are",
      paragraphs: [
        "StemSplit.ai is an online audio separation service operated at stemextractor.com. We run the website, call a pre-trained separation model, and manage the storage and delivery of the resulting files. Paid plans are processed by Waffo as merchant of record.",
        "For privacy questions, contact privacy@stemextractor.com. For deletion or access requests, include the job ID shown in the result panel or the order ID from your receipt.",
      ],
    },
    {
      h2: "What we collect",
      paragraphs: [
        "We keep data collection to what the service needs. Running a separation requires the audio file itself plus basic metadata such as filename, size and the time the job was created. For paid runs, Waffo collects the billing details — we receive confirmation of the payment and an order identifier, not your full card number.",
      ],
      bullets: [
        "Audio files and file metadata you upload for processing.",
        "Job data: job ID, status, progress, timestamps, output file references and the account/order it belongs to.",
        "Technical logs: IP address, browser type, request timestamps and error traces used for security and debugging.",
        "Payment data for paid runs, handled by Waffo as merchant of record.",
        "Minimal, aggregate analytics about page visits — not the content of your audio.",
      ],
    },
    {
      h2: "How we use your audio",
      paragraphs: [
        "An uploaded track is used for one purpose: separating it into four stems (vocals, drums, bass, other), encoding each as a 320 kbps MP3 and delivering the downloads to you. We do not publish your files, do not resell them, and do not add them to any training dataset.",
        "The model is pre-trained and runs the same for every user. Nothing you upload changes the model or another customer's results. Uploads and outputs live in a private object-storage bucket and are served through time-limited signed links.",
      ],
      bullets: [
        "Purpose: process the job you requested.",
        "Output: four MP3 stems at 320 kbps (vocals, drums, bass, other).",
        "No model training or fine-tuning on your audio.",
        "No public sharing or resale of your files.",
        "Automatic deletion within 30 days.",
      ],
      bulletsColumns: 2,
    },
    {
      h2: "Who processes data for us",
      paragraphs: [
        "We use a small number of infrastructure providers, each of which only processes data on our instructions. Cloudflare provides hosting, R2 object storage and network services. Replicate runs the pre-trained Demucs model on GPU hardware and receives the audio for the duration of the run. Neon hosts the database that stores job and order records. Waffo handles payments, invoices and tax. Resend sends transactional email when you provide an address. Turnstile (Cloudflare) may be used to distinguish humans from bots at upload time.",
        "These providers are bound by their own data-processing terms and may process data in regions outside your country. Where that happens we rely on appropriate safeguards such as standard contractual clauses. We do not sell or share personal data with advertisers or data brokers.",
      ],
      bullets: [
        "Cloudflare — hosting, R2 object storage, network, Turnstile abuse checks.",
        "Replicate — AI inference on the uploaded audio (Demucs/htdemucs).",
        "Neon — job and order records (Postgres).",
        "Waffo — payments, invoices and tax handling (merchant of record).",
        "Resend — transactional email, when enabled.",
      ],
    },
    {
      h2: "How long we keep data",
      paragraphs: [
        "Uploaded audio and the separated stems are deleted from storage within 30 days of delivery. Download links are signed and time-limited (currently 7 days); while a file is retained you can request a fresh link from your order page instead of uploading again.",
        "Job and order records (status, timestamps, file names, amounts) may be kept longer for debugging, abuse prevention and accounting, but they do not contain the audio itself. Payment and invoice records are retained as long as tax and accounting rules require. Technical logs are rotated on a short cycle and are not used to profile you.",
        "If you need a specific file removed sooner, email privacy@stemextractor.com with the job or order ID. Deletion requests are actioned on request even before the 30-day window closes.",
      ],
    },
    {
      h2: "Model training",
      paragraphs: [
        "We do not use your audio to train, fine-tune or benchmark models, and we do not contribute your files to public or private datasets. The Demucs-family model we call is pre-trained: every separation runs the same weights.",
        "Our inference provider processes the file to execute the run we request; its own retention and model-use practices are governed by its published terms, which apply to its role as an independent processor.",
      ],
    },
    {
      h2: "Cookies and analytics",
      paragraphs: [
        "The site uses only the cookies and local storage needed to function — for example keeping a job or order reference in the browser tab. We do not use advertising cookies or sell data to ad networks.",
        "If we add product analytics, it will be privacy-oriented and limited to aggregate usage. You can block cookies in your browser settings; the core pages work without them, though checkout and some account features may not.",
      ],
    },
    {
      h2: "Your rights",
      paragraphs: [
        "Depending on where you live, you may have the right to access, correct, export or delete the personal data we hold about you, to object to certain processing, and to lodge a complaint with a supervisory authority. Under GDPR and CCPA/CPRA, these rights apply to personal information such as order and billing details and technical logs.",
        "Because audio files are deleted within 30 days, a deletion request should be sent promptly if you want a specific job's output removed sooner. We respond to verified requests within 30 days.",
      ],
      bullets: [
        "Access and export your personal data.",
        "Correct inaccurate order or billing details.",
        "Delete your data and request early file deletion.",
        "Object to processing and lodge a complaint.",
        "Do not sell or share — we do neither.",
      ],
      bulletsColumns: 2,
    },
    {
      h2: "Children and sensitive audio",
      paragraphs: [
        "The service is not directed at children under 13, and we do not knowingly collect personal data from them. Do not upload recordings of children, private conversations or any content that would violate someone else's privacy or publicity rights.",
        "You are responsible for having the right to process the audio you upload. See the terms of service for the acceptable-use rules and the DMCA process.",
      ],
    },
    {
      h2: "Changes to this policy",
      paragraphs: [
        "We may update this policy as the product changes. When a change is material, we will update the date at the top of the page and, where we have an email address, notify paying customers. Continuing to use the service after an update means you accept the revised policy.",
      ],
    },
  ],
  faqs: [
    {
      q: "Do you train AI models on my audio?",
      a: "No. Your upload is processed once with a pre-trained model, then deleted from storage within 30 days. It is never added to a training dataset or used to improve results for other users.",
    },
    {
      q: "Can I get my file deleted sooner?",
      a: "Yes. Email privacy@stemextractor.com with the job or order ID and we will remove the upload and output files on request, before the 30-day window closes.",
    },
    {
      q: "How long do the download links work?",
      a: "Download links are signed and time-limited (currently 7 days). Your files are kept for 30 days after delivery, and while they are retained you can request a fresh link from your order page.",
    },
    {
      q: "Do you sell my data?",
      a: "No. We do not sell or share personal data with advertisers or data brokers. Payments are processed by Waffo, and the only processors with access to your audio are the infrastructure providers listed above.",
    },
  ],
  contactNote:
    "Privacy questions or deletion requests: privacy@stemextractor.com. For billing, contact billing@stemextractor.com. Response time is up to 30 days for rights requests and 1–2 business days for support.",
};

export const metadata = legalMetadata(data);

export default function PrivacyPage() {
  return <LegalPage data={data} />;
}
