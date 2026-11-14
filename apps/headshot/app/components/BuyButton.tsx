"use client";

import { useState } from "react";

export function BuyButton({
  planId,
  children,
  className = "mt-6 w-full rounded-xl bg-orange-700 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-orange-600",
}: {
  planId: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = (await res.json().catch(() => null)) as { url?: string; orderId?: string; error?: string; message?: string } | null;
      if (!res.ok || !data?.url) throw new Error(data?.message ?? data?.error ?? "Checkout is temporarily unavailable.");
      // Persist before leaving: Waffo only follows successUrl when the buyer clicks Done.
      if (data.orderId) window.localStorage.setItem("paidOrderId", data.orderId);
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout is temporarily unavailable.");
      setBusy(false);
    }
  }

  return (
    <div className="w-full">
      <button type="button" onClick={start} disabled={busy} className={`${className} disabled:cursor-wait disabled:opacity-60`}>
        {busy ? "Opening checkout…" : children}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-center text-xs text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}
