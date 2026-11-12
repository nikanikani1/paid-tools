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
        <h1 className="display text-3xl">No order found</h1>
        <p className="mt-3 text-slate-300">Open the checkout from the pricing page and try again.</p>
        <Link href="/pricing" className="btn btn-primary mt-6">
          Back to pricing
        </Link>
      </div>
    );
  }

  const paid = data?.status === "paid";
  return (
    <div className="mx-auto max-w-xl px-6 py-20">
      <p className="eyebrow">Payment</p>
      <h1 className="display mt-3 text-4xl">{paid ? "Payment received" : "Confirming your payment…"}</h1>
      <p className="mt-4 leading-relaxed text-slate-300">
        {paid
          ? "Your paid order is active. Open the tool below and upload your file — the job is unlocked automatically in this browser."
          : "Waffo is confirming the payment. This page refreshes itself; you can also continue to the tool once it shows Payment received."}
      </p>
      <div className="card mt-6 p-5 text-sm text-slate-300">
        <div className="flex justify-between gap-4">
          <span>Order</span>
          <span className="font-mono text-xs text-slate-400">{orderId}</span>
        </div>
        <div className="mt-2 flex justify-between gap-4">
          <span>Status</span>
          <span className={paid ? "text-emerald-300" : "text-amber-300"}>{data?.status ?? "loading"}</span>
        </div>
        {data?.unitsGranted ? (
          <div className="mt-2 flex justify-between gap-4">
            <span>Allowance</span>
            <span>
              {Math.max(0, data.unitsGranted - (data.unitsUsed ?? 0))} / {data.unitsGranted} remaining
            </span>
          </div>
        ) : null}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/?order=${encodeURIComponent(orderId)}#tool`} className="btn btn-primary">
          Continue to the tool
        </Link>
        <Link href="/pricing" className="btn btn-ghost">
          View plans
        </Link>
      </div>
    </div>
  );
}
