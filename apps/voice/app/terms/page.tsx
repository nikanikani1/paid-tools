import { LegalPage, legalMetadata, type LegalPageData } from "@/components/LegalPage";
import { LEGAL_UPDATED } from "@/lib/seo";

const data: LegalPageData = {
  slug: "/terms",
  crumb: "Terms",
  title: "Terms of Service",
  description:
    "The rules for using StemSplit.ai: acceptable use, audio rights, accounts and limits, subscriptions, DMCA takedowns, disclaimers and liability.",
  h1: "Terms of Service",
  updated: LEGAL_UPDATED,
  intro: [
    "These terms govern your use of StemSplit.ai. By uploading a file or using any part of the service, you agree to them. If you do not agree, do not use the service.",
    "The important parts: only process audio you have the right to use, do not abuse the service, and understand that separation is an estimate rather than a perfect extraction.",
  ],
  sections: [
    {
      h2: "The service",
      paragraphs: [
        "StemSplit.ai provides AI-based audio separation: you upload a song, the service returns vocals, instrumental and additional stems. Access starts with the one-time $2.90 Trial Pack (15 minutes); subscription plans add monthly minutes, more stems and higher-quality output. There is no free-of-charge processing tier. Features may change as the product develops.",
        "The service runs on third-party infrastructure for hosting, storage, model inference and payments. Access may be interrupted for maintenance, model upgrades, capacity limits or events outside our control.",
      ],
    },
    {
      h2: "Your content and the rights you need",
      paragraphs: [
        "You keep all rights you hold in the audio you upload. To operate the service, you grant us a limited, non-exclusive license to store, process and transmit that audio solely for the purpose of producing and delivering your stems. That license ends when the files are deleted.",
        "You must own the audio or have permission from the rights holders to process it. We cannot grant you rights to someone else's recording, composition or performance, and you are solely responsible for how you use the separated stems.",
      ],
      bullets: [
        "You keep ownership of your uploads.",
        "We process them only to deliver your job.",
        "You need permission for any song you do not own.",
        "Publishing or monetising stems may require additional licenses.",
      ],
      bulletsColumns: 2,
    },
    {
      h2: "Acceptable use",
      paragraphs: [
        "You agree not to use the service for anything unlawful, infringing or abusive. That includes uploading content you have no right to process, attempting to bypass usage limits or payment, reselling or redistributing the service itself, or using automated systems to scrape pages or hammer the API.",
        "We may suspend or terminate access if we detect abuse, attempts to reverse-engineer the model, illegal content, or behaviour that harms other users or the service. Where the law requires it, we may report illegal activity to the authorities.",
      ],
      bullets: [
        "No infringing, illegal or non-consensual audio.",
        "No attempts to bypass limits, payments or security.",
        "No resale of the service or bulk automated access.",
        "No uploading private conversations without consent.",
      ],
      bulletsColumns: 2,
    },
    {
      h2: "Accounts, limits and fair use",
      paragraphs: [
        "The Trial Pack is a one-time allowance of 15 minutes and does not renew. Subscription plans include a monthly minute allowance; allowances reset each billing period and do not roll over. Jobs that fail for technical reasons do not consume minutes.",
        "We may adjust fair-use limits to prevent abuse. If a subscription plan's limits change materially, we will give notice before the change applies to your renewal.",
      ],
    },
    {
      h2: "Payments, subscriptions and cancellation",
      paragraphs: [
        "Payments are billed through Waffo as merchant of record, which handles card processing, invoicing and applicable sales tax. The $2.90 Trial Pack is a single one-time charge and does not renew. Monthly and annual subscriptions renew automatically until cancelled; you can cancel at any time from the billing portal, and access continues until the end of the current period.",
        "Refunds are governed by the refund policy. If you cancel, you will not be charged for the next period; cancelling does not automatically refund the current period.",
      ],
    },
    {
      h2: "Intellectual property",
      paragraphs: [
        "The service, the site design, the code and the written content are owned by us or our licensors and are protected by intellectual property law. You may not copy, redistribute or create derivative products from the service itself. The stems you generate are yours to use subject to the rights in the underlying song.",
        "Open-source components and model weights used by the service remain under their respective licenses, including the MIT license for the Demucs model. Those licenses are unaffected by these terms.",
      ],
    },
    {
      h2: "DMCA and copyright complaints",
      id: "dmca",
      paragraphs: [
        "We respect copyright and expect users to do the same. If you believe content processed through the service infringes your rights, send a notice to dmca@stemextractor.com with the details required by the Digital Millennium Copyright Act: identification of the copyrighted work, identification of the material and where it appears, your contact information, a good-faith statement, a statement under penalty of perjury that the information is accurate and that you are authorised to act, and your physical or electronic signature.",
        "We will review valid notices, remove or disable access to the material where appropriate, and take repeat-infringer accounts out of service. Counter-notices should be sent to the same address.",
      ],
    },
    {
      h2: "Disclaimers and limitation of liability",
      paragraphs: [
        "The service is provided on an as-is and as-available basis. We do not warrant that separation will be perfect, uninterrupted or error-free, or that stems will be suitable for a particular production use. AI separation is an estimate and can leave vocal bleed or artifacts, especially on difficult source material.",
        "To the maximum extent permitted by law, we are not liable for indirect, incidental, special or consequential damages, or for lost profits, lost revenue or lost data. Our total liability for any claim is limited to the amount you paid us in the twelve months before the claim, or $50 if you have not paid anything.",
      ],
    },
    {
      h2: "Termination and changes",
      paragraphs: [
        "You can stop using the service at any time. We may suspend or terminate access for violations of these terms or for legal reasons. Sections that by their nature should survive termination — including intellectual property, disclaimers, liability limits and governing law — survive.",
        "We may update these terms from time to time. Material changes will be announced on the site or by email to paying subscribers, and the updated date at the top of the page will change. Continued use after an update means you accept the revised terms.",
      ],
    },
    {
      h2: "Governing law and contact",
      paragraphs: [
        "These terms are governed by the laws of the State of Delaware, United States, without regard to conflict-of-law rules. Disputes will be handled in the courts located there, unless applicable consumer law gives you the right to a different forum.",
        "Questions about these terms: legal@stemextractor.com. Billing questions: billing@stemextractor.com. Copyright notices: dmca@stemextractor.com.",
      ],
    },
  ],
  faqs: [
    {
      q: "Do I own the stems I create?",
      a: "You own the rights you hold in the source audio, and we grant you a license to use the stems the service produces. However, we cannot transfer rights to a song you do not own, so your ability to publish or monetise stems depends on your rights to the original recording.",
    },
    {
      q: "Can I use the service commercially?",
      a: "Yes, the separation service can be used for commercial projects as long as you have the rights to the source audio. Paid plans include a commercial-use license for the processing itself. The original song's rights still apply.",
    },
    {
      q: "How do I cancel a subscription?",
      a: "Use the billing portal link in your purchase email or contact billing@stemextractor.com. Cancellation stops future renewals and access continues until the end of the paid period.",
    },
  ],
  contactNote:
    "Legal notices: legal@stemextractor.com · DMCA: dmca@stemextractor.com · Billing: billing@stemextractor.com. These terms should be reviewed by qualified counsel before launch; this page is product copy for the demo build.",
};

export const metadata = legalMetadata(data);

export default function TermsPage() {
  return <LegalPage data={data} />;
}
