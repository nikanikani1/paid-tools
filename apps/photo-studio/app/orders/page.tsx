import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brands";
import { SiteChrome } from "@/components/SiteChrome";
import { OrderLookup } from "@/components/BuyButton";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `Find your order — ${BRAND.name}`,
  description: `Recover a ${BRAND.name} order by order ID, check whether it is paid and see how many images remain in the pack.`,
  path: "/orders",
  noindex: true,
});

export default function OrdersPage() {
  return (
    <SiteChrome brand={BRAND}>
      <main className="mx-auto max-w-3xl px-5 py-14 md:py-20">
        <div className="text-center">
          <p className="sans text-xs font-semibold uppercase tracking-[0.2em] opacity-60" style={{ color: "var(--ink)" }}>
            Order lookup
          </p>
          <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: "var(--ink)" }}>
            Find your pack
          </h1>
          <p className="sans mx-auto mt-4 max-w-xl text-sm leading-relaxed opacity-75" style={{ color: "var(--ink)" }}>
            Enter the order ID from your receipt to check the payment status and remaining {BRAND.kind === "landscape" ? "concepts" : "looks"}.
            This lookup is read-only: downloads happen in the tool after a run.
          </p>
        </div>

        <div className="mt-10">
          <OrderLookup brand={BRAND} />
        </div>

        <p className="sans mt-8 text-center text-xs leading-relaxed opacity-60" style={{ color: "var(--ink)" }}>
          Lost the receipt? Email{" "}
          <a href={`mailto:${BRAND.supportEmail}`} className="underline underline-offset-2">
            {BRAND.supportEmail}
          </a>{" "}
          from the address you used at checkout. Read the{" "}
          <Link href="/refund" className="underline underline-offset-2">
            refund policy
          </Link>{" "}
          if a paid run never delivered.
        </p>
      </main>
    </SiteChrome>
  );
}
