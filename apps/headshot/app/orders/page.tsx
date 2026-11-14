import type { Metadata } from "next";
import Link from "next/link";
import { OrdersClient } from "../components/OrdersClient";

export const metadata: Metadata = {
  title: "Your orders & downloads",
  description: "Recover a PortraitLab order by order ID, check remaining images and re-issue download links for generated headshots.",
  robots: { index: false, follow: false },
};

export default function OrdersPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="text-center">
        <p className="sans text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">Order recovery</p>
        <h1 className="mt-3 font-serif text-4xl font-bold text-stone-900">Your orders &amp; downloads</h1>
        <p className="sans mx-auto mt-4 max-w-xl text-sm leading-relaxed text-stone-600">
          Paid but cannot find the download page, or opened it after the links expired? Enter the order ID from your
          receipt and we will show the order, remaining images and fresh download links.
        </p>
        <p className="sans mt-2 text-xs text-stone-500">No order ID? Check the confirmation page URL or your payment receipt.</p>
        <Link href="/#generator" className="sans mt-4 inline-block text-sm font-semibold text-orange-700 hover:text-orange-600">
          Back to the generator
        </Link>
      </div>

      <div className="mt-10">
        <OrdersClient />
      </div>
    </main>
  );
}
