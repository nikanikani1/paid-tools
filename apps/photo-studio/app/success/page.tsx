import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brands";
import { SiteChrome } from "@/components/SiteChrome";
import { SuccessOrderPanel } from "@/components/BuyButton";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `Payment status — ${BRAND.name}`,
  description: `Check whether your ${BRAND.name} payment is confirmed and open the ${BRAND.kind === "landscape" ? "landscape" : "hair-colour"} tool with your paid pack.`,
  path: "/success",
  noindex: true,
});

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  const orderId = typeof order === "string" && order.trim() ? order.trim() : null;

  return (
    <SiteChrome brand={BRAND}>
      <main className="mx-auto max-w-2xl px-5 py-14 md:py-20">
        <div className="text-center">
          <p className="sans text-xs font-semibold uppercase tracking-[0.2em] opacity-60" style={{ color: "var(--ink)" }}>
            Payment
          </p>
          <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: "var(--ink)" }}>
            Your {BRAND.name} order
          </h1>
          <p className="sans mx-auto mt-4 max-w-xl text-sm leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            This page checks the order with our payment provider. Keep it open for a few seconds if the status is
            still pending — it refreshes automatically.
          </p>
        </div>

        <SuccessOrderPanel brand={BRAND} orderId={orderId} />

        <p className="sans mt-8 text-center text-xs leading-relaxed opacity-60" style={{ color: "var(--ink)" }}>
          Payment questions:{" "}
          <a href={`mailto:${BRAND.supportEmail}`} className="underline underline-offset-2">
            {BRAND.supportEmail}
          </a>
          . Payments are processed by Waffo as merchant of record. Read the{" "}
          <Link href="/refund" className="underline underline-offset-2">
            refund policy
          </Link>{" "}
          or the{" "}
          <Link href="/terms" className="underline underline-offset-2">
            terms
          </Link>
          .
        </p>
      </main>
    </SiteChrome>
  );
}
