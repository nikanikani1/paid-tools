import type { Metadata } from "next";
import Link from "next/link";
import { OrdersClient } from "@/components/OrdersClient";

export const metadata: Metadata = {
  title: "Your orders & downloads",
  description: "Recover a StemSplit.ai order by order ID, check remaining minutes and re-issue download links for your stems.",
  robots: { index: false, follow: false },
};

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <div className="badge">Order recovery</div>
        <h1 className="display mx-auto mt-5 max-w-2xl text-4xl md:text-5xl">Your orders &amp; downloads</h1>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-slate-300">
          Paid but cannot find the download page, or opened it after the links expired? Enter the order ID from your
          receipt and we will show the order, its remaining minutes and fresh download links for every stem.
        </p>
        <p className="mt-2 text-xs text-slate-500">No order ID? Check the confirmation page URL or your payment receipt.</p>
        <Link href="/#tool" className="btn btn-ghost btn-sm mt-4">
          Back to the tool
        </Link>
      </div>

      <div className="mt-10">
        <OrdersClient />
      </div>
    </div>
  );
}
