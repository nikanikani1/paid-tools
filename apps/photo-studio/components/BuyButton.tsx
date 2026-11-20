"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { BrandConfig } from "@/lib/brands";

/**
 * Checkout button. The only responsibility is:
 *   POST /api/checkout { planId } -> save localStorage.paidOrderId -> follow the Waffo URL.
 * Amounts and plan validity are decided on the server; nothing here is trusted.
 */
export function BuyButton({
  planId,
  children,
  className = "w-full rounded-full px-5 py-3 text-center text-sm font-semibold text-white",
}: {
  planId: string;
  children?: React.ReactNode;
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
      const data = (await res.json().catch(() => null)) as
        | { url?: string; orderId?: string; error?: string; message?: string }
        | null;
      if (!res.ok || !data?.url) throw new Error(data?.message ?? data?.error ?? "Checkout is temporarily unavailable.");
      if (data.orderId) window.localStorage.setItem("paidOrderId", data.orderId);
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout is temporarily unavailable.");
      setBusy(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={start}
        disabled={busy}
        className={`${className} disabled:cursor-wait disabled:opacity-60`}
        style={{ backgroundColor: "var(--brand)" }}
      >
        {busy ? "Opening checkout…" : children ?? "Get the pack"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-center text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Order status widgets (kept in this client module so the write scope stays small)
// ---------------------------------------------------------------------------

type OrderStatusPayload = {
  id?: string;
  status?: string;
  planId?: string;
  unitsGranted?: number;
  unitsUsed?: number;
  unitsReserved?: number;
  remaining?: number;
  error?: string;
  message?: string;
};

/** Same key Studio uses to remember a paid order on this brand. */
function studioOrderKey(brand: BrandConfig): string {
  return `photoStudio:${brand.kind}:orderId`;
}

const STATUS_LABEL: Record<string, string> = {
  paid: "Paid",
  pending: "Confirming payment",
  refunded: "Refunded",
  failed: "Payment failed",
};

function statusClass(status: string | undefined): string {
  if (status === "paid") return "border-emerald-300 bg-emerald-50 text-emerald-900";
  if (status === "pending") return "border-amber-300 bg-amber-50 text-amber-900";
  return "border-red-300 bg-red-50 text-red-900";
}

async function fetchOrderStatus(orderId: string): Promise<{ ok: boolean; status: number; payload: OrderStatusPayload | null }> {
  const res = await fetch(`/api/orders/status?order=${encodeURIComponent(orderId)}`, { cache: "no-store" });
  const payload = (await res.json().catch(() => null)) as OrderStatusPayload | null;
  return { ok: res.ok, status: res.status, payload };
}

function useOrderStatus(brand: BrandConfig, orderId: string | null, pollPending: boolean) {
  const [payload, setPayload] = useState<OrderStatusPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    let candidate = orderId;
    if (!candidate) {
      try {
        candidate =
          window.localStorage.getItem("paidOrderId") ??
          window.localStorage.getItem(studioOrderKey(brand)) ??
          null;
      } catch {
        /* private mode */
      }
    }
    if (!candidate) {
      setPayload(null);
      setError(null);
      return;
    }
    try {
      window.localStorage.setItem("paidOrderId", candidate);
      window.localStorage.setItem(studioOrderKey(brand), candidate);
    } catch {
      /* private mode */
    }
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function load() {
      setLoading(true);
      try {
        const result = await fetchOrderStatus(candidate!);
        if (cancelled.current) return;
        if (!result.ok) {
          setPayload(null);
          setError(
            result.status === 404
              ? "No order with that ID was found. Check the order ID from your receipt."
              : result.payload?.message ?? result.payload?.error ?? "Could not read this order right now.",
          );
          return;
        }
        setError(null);
        setPayload(result.payload);
        if (pollPending && result.payload?.status === "pending") {
          timer = setTimeout(() => void load(), 2500);
        }
      } catch {
        if (!cancelled.current) setError("Network error while reading the order. Check your connection and try again.");
      } finally {
        if (!cancelled.current) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled.current = true;
      if (timer) clearTimeout(timer);
    };
  }, [orderId, pollPending, brand]);

  return { payload, error, loading };
}

function unitLabel(brand: BrandConfig, payload: OrderStatusPayload | null): string {
  return payload?.planId === brand.planId || !payload?.planId ? brand.unitLabel : payload.planId;
}

function StatusCard({
  brand,
  orderId,
  payload,
  error,
  loading,
}: {
  brand: BrandConfig;
  orderId: string | null;
  payload: OrderStatusPayload | null;
  error: string | null;
  loading: boolean;
}) {
  if (!orderId) return null;
  const status = payload?.status;
  const granted = payload?.unitsGranted ?? 0;
  const used = payload?.unitsUsed ?? 0;
  const reserved = payload?.unitsReserved ?? 0;
  const remaining = payload?.remaining ?? Math.max(0, granted - used - reserved);

  return (
    <div className="mt-6 rounded-2xl border border-black/10 bg-white/70 p-5 text-left sm:p-6" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="sans text-xs uppercase tracking-[0.16em] opacity-60">Order</p>
          <p className="sans break-all font-mono text-sm">{orderId}</p>
        </div>
        <span className={`sans rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(status)}`}>
          {loading && !status ? "Loading…" : STATUS_LABEL[status ?? ""] ?? status ?? "Unknown"}
        </span>
      </div>

      {error && (
        <p role="alert" className="sans mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      {payload && !error && (
        <dl className="sans mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="opacity-60">Pack</dt>
            <dd className="font-medium">{unitLabel(brand, payload)}</dd>
          </div>
          <div>
            <dt className="opacity-60">Delivered</dt>
            <dd className="font-medium">{used} of {granted}</dd>
          </div>
          <div>
            <dt className="opacity-60">Remaining</dt>
            <dd className="font-medium">{remaining}</dd>
          </div>
        </dl>
      )}

      {status === "pending" && (
        <p className="sans mt-4 text-sm leading-relaxed opacity-70">
          Waffo is confirming your payment. This box refreshes itself — keep this page open for a few seconds.
        </p>
      )}
      {status === "refunded" && (
        <p className="sans mt-4 text-sm leading-relaxed opacity-70">
          This order was refunded. If that is unexpected, email{" "}
          <a href={`mailto:${brand.supportEmail}`} className="underline underline-offset-2">
            {brand.supportEmail}
          </a>{" "}
          with the order ID.
        </p>
      )}
      {status === "failed" && (
        <p className="sans mt-4 text-sm leading-relaxed opacity-70">
          The payment did not complete. Nothing was charged; you can try checkout again from the pricing page.
        </p>
      )}
    </div>
  );
}

/** Used by /success: shows paid/pending and polls until the order settles. */
export function SuccessOrderPanel({ brand, orderId }: { brand: BrandConfig; orderId: string | null }) {
  const { payload, error, loading } = useOrderStatus(brand, orderId, true);
  const paid = payload?.status === "paid";

  if (!orderId) {
    return (
      <div className="mt-6 rounded-2xl border border-black/10 bg-white/70 p-6 text-left">
        <p className="sans text-sm leading-relaxed opacity-75">
          This page needs the order reference from the checkout return link. If you paid and lost the link, look up
          your order ID from the receipt, or use the order page.
        </p>
        <div className="sans mt-4 flex flex-wrap gap-3">
          <Link href="/orders" className="rounded-full border border-black/15 px-4 py-2 text-sm font-semibold" style={{ color: "var(--ink)" }}>
            Find an order
          </Link>
          <Link href="/pricing" className="rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>
            Back to pricing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <StatusCard brand={brand} orderId={orderId} payload={payload} error={error} loading={loading} />
      <div className="sans mt-5 flex flex-wrap gap-3">
        {paid ? (
          <Link
            href={`/?order=${encodeURIComponent(orderId)}#studio`}
            className="rounded-full px-5 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--brand)" }}
          >
            Start with this pack
          </Link>
        ) : (
          <Link href="/pricing" className="rounded-full border border-black/15 px-5 py-3 text-sm font-semibold" style={{ color: "var(--ink)" }}>
            View the pack
          </Link>
        )}
        <Link href="/orders" className="rounded-full border border-black/15 px-5 py-3 text-sm font-semibold" style={{ color: "var(--ink)" }}>
          Find another order
        </Link>
        <Link href="/refund" className="rounded-full px-5 py-3 text-sm font-semibold underline underline-offset-4" style={{ color: "var(--ink)" }}>
          Refund policy
        </Link>
      </div>
    </>
  );
}

/** Used by /orders: manual order-ID recovery (status and remaining credits only). */
export function OrderLookup({ brand }: { brand: BrandConfig }) {
  const [input, setInput] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<string | null>(null);
  const { payload, error, loading } = useOrderStatus(brand, orderId, false);

  const load = useCallback((value: string) => {
    const clean = value.trim();
    if (!/^[A-Za-z0-9_-]{4,120}$/.test(clean)) {
      setInvalid("That does not look like an order ID. Copy it from your receipt or the confirmation page URL.");
      return;
    }
    setInvalid(null);
    setOrderId(clean);
    try {
      window.localStorage.setItem("lastOrderId", clean);
      window.localStorage.setItem("paidOrderId", clean);
      window.localStorage.setItem(studioOrderKey(brand), clean);
    } catch {
      /* private mode */
    }
  }, [brand]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("order");
    const stored =
      fromUrl ??
      window.localStorage.getItem("paidOrderId") ??
      window.localStorage.getItem(studioOrderKey(brand)) ??
      window.localStorage.getItem("lastOrderId");
    if (stored) {
      setInput(stored);
      if (/^[A-Za-z0-9_-]{4,120}$/.test(stored)) setOrderId(stored);
    }
  }, [brand]);

  return (
    <div>
      <form
        className="rounded-2xl border border-black/10 bg-white/70 p-5 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          load(input);
        }}
      >
        <label htmlFor="order-id" className="sans block text-sm font-semibold">
          Order ID
        </label>
        <p className="sans mt-1 text-xs leading-relaxed opacity-60">
          It looks like <span className="font-mono">ord_…</span> and appears on your payment receipt and in the
          confirmation page URL. It is also saved in this browser after checkout.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            id="order-id"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="ord_xxxxxxxxxx"
            autoComplete="off"
            spellCheck={false}
            className="sans w-full rounded-xl border border-black/15 bg-white px-4 py-3 font-mono text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ outlineColor: "var(--brand)" }}
          />
          <button
            type="submit"
            disabled={loading}
            className="sans shrink-0 rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
            style={{ backgroundColor: "var(--brand)" }}
          >
            {loading ? "Looking up…" : "Find order"}
          </button>
        </div>
        {invalid && (
          <p role="alert" className="sans mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
            {invalid}
          </p>
        )}
      </form>

      <StatusCard brand={brand} orderId={orderId} payload={payload} error={error} loading={loading} />

      {payload?.status === "paid" && (
        <p className="sans mt-4 text-sm leading-relaxed opacity-70">
          This page is read-only: it shows the pack status and remaining images. Open the tool to use the pack and
          download the generated files.
        </p>
      )}
      <div className="sans mt-5 flex flex-wrap gap-3">
        <Link href="/pricing" className="rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--brand)" }}>
          Get a pack
        </Link>
        <Link href="/#studio" className="rounded-full border border-black/15 px-4 py-2 text-sm font-semibold" style={{ color: "var(--ink)" }}>
          Open the tool
        </Link>
        <Link href="/refund" className="rounded-full px-4 py-2 text-sm font-semibold underline underline-offset-4" style={{ color: "var(--ink)" }}>
          Refunds
        </Link>
      </div>
    </div>
  );
}
