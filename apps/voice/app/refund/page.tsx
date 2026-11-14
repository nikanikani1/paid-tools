import { LegalPage, legalMetadata, type LegalPageData } from "@/components/LegalPage";

const data: LegalPageData = {
  slug: "/refund",
  crumb: "Refunds",
  title: "Refund Policy",
  description:
    "StemSplit.ai refund policy: 14-day money-back guarantee on your first purchase — including the $2.90 Trial Pack — plus refunds for duplicate charges and failed jobs.",
  h1: "Refund Policy",
  updated: "November 14, 2026",
  intro: [
    "We want you to pay only for separation that works for you. This policy explains when you can get a refund, how to request one and what is not covered.",
    "The headline: your first purchase — including the one-time $2.90 Trial Pack — is covered by a 14-day money-back guarantee while most of the minutes are unused, and failed or duplicate charges are always refunded or restored.",
  ],
  sections: [
    {
      h2: "14-day money-back guarantee",
      paragraphs: [
        "Your first purchase — currently the one-time $2.90 Trial Pack — is covered by a 14-day money-back guarantee. If the separation quality is not what you expected, or you simply change your mind, ask for a refund within 14 days of the charge and we will return it in full.",
        "To keep the guarantee fair, it applies while most of the allowance is unused: for the 15-minute Trial Pack that means at least 10 minutes unused. If you have already processed most of the allowance, we may refund the unused portion instead of the full amount.",
      ],
      bullets: [
        "Covers the first purchase, including the $2.90 Trial Pack.",
        "Request within 14 days of the charge.",
        "Full refund while most of the allowance is unused.",
        "One guarantee per customer, not per plan change.",
      ],
    },
    {
      h2: "What is currently on sale",
      paragraphs: [
        "Only plans whose checkout is active can be purchased. Today that is the one-time $2.90 Trial Pack (15 minutes); larger or subscription plans shown on the pricing page are not currently on sale. If you are not charged for a plan, there is no refund question to resolve — nothing was purchased.",
        "If subscription plans become available later, this policy will be updated before they go on sale to describe renewal and cancellation terms. Nothing renews automatically unless a subscription is explicitly purchased.",
      ],
    },
    {
      h2: "Failed jobs, duplicate charges and service errors",
      paragraphs: [
        "A job that fails for technical reasons does not consume your minutes. If a failed job does consume minutes in error, we will restore them or refund the equivalent amount. Duplicate charges, billing errors and charges after a confirmed cancellation are always refunded in full.",
        "If a separation completes but is clearly unusable — for example the output is silent or corrupted — send us the job ID and we will re-run the job or refund the minutes. Quality expectations for difficult source material are described on the how-it-works page and are not by themselves grounds for a refund.",
      ],
      bullets: [
        "Failed jobs do not consume minutes.",
        "Duplicate or post-cancellation charges are refunded.",
        "Corrupted or silent output is re-run or refunded.",
        "Quality differences on difficult sources are not automatic refunds.",
      ],
      bulletsColumns: 2,
    },
    {
      h2: "How to request a refund",
      paragraphs: [
        "Email billing@stemextractor.com with the email address used at checkout, the order or invoice ID, and a short description of the issue. If the request relates to a specific job, include the job ID from the result panel.",
        "We reply within 1–2 business days and process approved refunds within 5–10 business days, depending on your bank or card issuer. Refunds go back to the original payment method. Waffo, our merchant of record, issues the refund on our behalf.",
      ],
      bullets: [
        "Email billing@stemextractor.com.",
        "Include the checkout email and invoice ID.",
        "Add the job ID if a specific separation is involved.",
        "Approved refunds are processed within 5–10 business days.",
      ],
    },
    {
      h2: "Files and the 30-day window",
      paragraphs: [
        "Separated files are deleted from storage within 30 days of delivery, and download links are signed and time-limited (currently 7 days). A refund does not extend that window, so download anything you need before requesting a refund.",
      ],
    },
    {
      h2: "What is not covered",
      paragraphs: [
        "We cannot refund used minutes beyond the guarantee window, accounts terminated for abuse, or charges from third-party tools you used alongside the service. We also cannot refund a plan purchased with a stolen payment method or in violation of the terms of service.",
        "Please contact us before filing a chargeback. A chargeback usually freezes the account while it is investigated, and we can often resolve the issue faster directly.",
      ],
    },
    {
      h2: "Changes to this policy",
      paragraphs: [
        "We may update this policy as the service evolves. The version that applies to your purchase is the one published at the time of the charge, and the date at the top of this page shows when the current version took effect.",
      ],
    },
  ],
  faqs: [
    {
      q: "Is the $2.90 Trial Pack refundable?",
      a: "Yes. It is covered by the same 14-day money-back guarantee as any first purchase: email billing@stemextractor.com within 14 days of the charge, and we will refund it in full while most of the minutes are unused. The Trial Pack does not renew, so there is nothing to cancel.",
    },
    {
      q: "What if a separation fails?",
      a: "Failed jobs do not consume minutes. If minutes were deducted anyway, we restore them or refund the equivalent amount. Send the job ID to billing@stemextractor.com.",
    },
    {
      q: "How long does a refund take?",
      a: "We review requests within 1–2 business days. Once approved, Waffo issues the refund to your original payment method, and it typically appears within 5–10 business days.",
    },
    {
      q: "Are the monthly or annual plans refundable?",
      a: "Those plans are not currently on sale. Only plans with an active checkout can be purchased, and today that is the one-time Trial Pack. If subscription plans become available, this policy will be updated before they go on sale.",
    },
  ],
  contactNote:
    "Refund requests: billing@stemextractor.com. Include the checkout email, invoice ID and job ID where relevant, and we will reply within 1–2 business days.",
};

export const metadata = legalMetadata(data);

export default function RefundPage() {
  return <LegalPage data={data} />;
}
