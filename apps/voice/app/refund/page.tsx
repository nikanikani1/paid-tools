import { LegalPage, legalMetadata, type LegalPageData } from "@/components/LegalPage";
import { LEGAL_UPDATED } from "@/lib/seo";

const data: LegalPageData = {
  slug: "/refund",
  crumb: "Refunds",
  title: "Refund Policy",
  description:
    "StemSplit.ai refund policy: 14-day money-back guarantee on your first purchase — including the $2.90 Trial Pack — plus refunds for duplicate charges and failed jobs, and how to request one.",
  h1: "Refund Policy",
  updated: LEGAL_UPDATED,
  intro: [
    "We want you to pay only for separation that works for you. This policy explains when you can get a refund, how to request one and what is not covered.",
    "The headline: your first purchase — including the one-time $2.90 Trial Pack — is covered by a 14-day money-back guarantee while most of the minutes are unused, and failed or duplicate charges are always refunded or restored.",
  ],
  sections: [
    {
      h2: "14-day money-back guarantee",
      paragraphs: [
        "Your first purchase — the one-time $2.90 Trial Pack, a monthly plan or an annual plan — is covered by a 14-day money-back guarantee. If the separation quality is not what you expected, or you simply change your mind, ask for a refund within 14 days of the charge and we will return it in full.",
        "To keep the guarantee fair, it applies while most of the allowance is unused. For the 15-minute Trial Pack that means at least 10 minutes unused; for monthly and annual plans it means less than 20 minutes used. If you have already processed most of the allowance, we may refund the unused portion instead of the full amount.",
      ],
      bullets: [
        "Covers the first purchase, including the $2.90 Trial Pack.",
        "Request within 14 days of the charge.",
        "Full refund while most of the allowance is unused.",
        "One guarantee per customer, not per plan change.",
      ],
    },
    {
      h2: "Monthly subscriptions",
      paragraphs: [
        "Monthly plans renew automatically. If you cancel, you keep access until the end of the period you already paid for and are not charged again. After the 14-day guarantee window, monthly payments are not refunded for partial periods — cancel before the renewal date to avoid the next charge.",
        "If you cancel and are charged again by mistake within a few days, contact us and we will refund the duplicate charge.",
      ],
    },
    {
      h2: "Annual plans",
      paragraphs: [
        "Annual plans are covered by the same 14-day money-back guarantee. After the guarantee window, annual plans are generally non-refundable, but we will refund the unused full months if you cancel because of a service failure we cannot fix. The annual discount exists because the plan is committed for a year — please compare the monthly plan if you are unsure.",
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
      h2: "What is not covered",
      paragraphs: [
        "We cannot refund used minutes beyond the guarantee window, accounts terminated for abuse, or charges from third-party tools you used alongside the service. We also cannot refund a plan that was purchased with a stolen payment method or in violation of the terms of service.",
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
      q: "Can I get a refund on an annual plan after 14 days?",
      a: "Annual plans are generally non-refundable after the guarantee window, but we refund unused full months if you cancel because of a service failure we cannot fix.",
    },
  ],
  contactNote:
    "Refund requests: billing@stemextractor.com. Include the checkout email, invoice ID and job ID where relevant, and we will reply within 1–2 business days.",
};

export const metadata = legalMetadata(data);

export default function RefundPage() {
  return <LegalPage data={data} />;
}
