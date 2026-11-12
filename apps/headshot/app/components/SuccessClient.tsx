"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Status = { status?: string; planId?: string; unitsGranted?: number; unitsUsed?: number; error?: string };

export function SuccessClient({ orderId }: { orderId: string | null }) {
  const [data, setData] = useState<Status | null>(null);

  useEffect(() => {
    if (!orderId) return;
    window.localStorage.setItem("paidOrderId", orderId);
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    async function load() {
      try {
        const res = await fetch(`/api/orders/status?order=${encodeURIComponent(orderId!)}`, { cache: "no-store" });
        const next = (await res.json()) as Status;
        if (cancelled) return;
        setData(next);
        if (next.status === "pending") timer = setTimeout(load, 2500);
      } catch {
        if (!cancelled) setData({ error: "Could not read the order yet. Refresh in a moment." });
      }
    }
    void load();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20">
        <h1 className="font-serif text-3xl font-bold">No order found</h1>
        <p className="mt-3 text-stone-600">Open the checkout from the pricing page and try again.</p>
        <Link href="/pricing" className="mt-6 inline-block rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white">
          Back to pricing
        </Link>
      </div>
    );
  }

  const paid = data?.status === "paid";
  return (
    <div className="mx-auto max-w-xl px-6 py-20">
      <p className="sans text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">Payment</p>
      <h1 className="mt-3 font-serif text-4xl font-bold">{paid ? "Payment received" : "Confirming your payment…"}</h1>
      <p className="mt-4 leading-relaxed text-stone-700">
        {paid
          ? "Your paid order is active. Open the generator below and upload your selfies — the order is unlocked automatically in this browser."
          : "Waffo is confirming the payment. This page refreshes itself; you can also continue once it shows Payment received."}
      </p>
      <div className="mt-6 rounded-2xl border border-stone-300 bg-white/70 p-5 text-sm text-stone-700">
        <div className="flex justify-between gap-4">
          <span>Order</span>
          <span className="font-mono text-xs text-stone-500">{orderId}</span>
        </div>
        <div className="mt-2 flex justify-between gap-4">
          <span>Status</span>
          <span className={paid ? "text-emerald-700" : "text-amber-700"}>{data?.status ?? "loading"}</span>
        </div>
        {data?.unitsGranted ? (
          <div className="mt-2 flex justify-between gap-4">
            <span>Images</span>
            <span>
              {Math.max(0, data.unitsGranted - (data.unitsUsed ?? 0))} / {data.unitsGranted} remaining
            </span>
          </div>
        ) : null}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/?order=${encodeURIComponent(orderId)}#generator`}
          className="rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white hover:bg-orange-600"
        >
          Continue to the generator
        </Link>
        <Link href="/pricing" className="rounded-xl border border-stone-300 px-5 py-3 font-semibold text-stone-800">
          View plans
        </Link>
      </div>
    </div>
  );
}
