"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type FileEntry = {
  jobId: string;
  name: string;
  available: boolean;
  url?: string;
  expiresAt?: string;
  reason?: string;
};

type JobSummary = {
  id: string;
  status: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  error?: string;
  files: { name: string; available: boolean }[];
};

type OrderFilesResponse = {
  order: {
    id: string;
    site: string;
    status: string;
    planId: string;
    planName: string;
    amountCents: number;
    currency: string;
    createdAt: string;
    paidAt: string | null;
    refundedAt: string | null;
  };
  usage: { granted: number; used: number; reserved: number; remaining: number };
  jobIds: string[];
  jobs: JobSummary[];
  files: FileEntry[];
  downloadsAvailable: boolean;
  warning?: string;
  linkLifetimeDays: number;
  retentionDays: number;
  generatedAt: string;
};

const ORDER_ID_RE = /^[A-Za-z0-9_-]{6,80}$/;
const RECENT_KEY = "paidOrderIds";
const ACTIVE_KEY = "paidOrderId";
const MAX_RECENT = 8;

const STATUS_LABEL: Record<string, string> = {
  paid: "Paid",
  pending: "Pending payment",
  refunded: "Refunded",
  failed: "Failed",
};

const REASON_LABEL: Record<string, string> = {
  order_not_paid: "Available after payment is confirmed.",
  r2_not_configured: "Download storage is not configured on this deployment.",
  mock_delivery_not_stored: "This was a test-mode job; images were not stored for download.",
  r2_sign_failed: "Could not sign a download link — try refreshing, or contact support.",
};

function readRecent(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === "string" && ORDER_ID_RE.test(value)).slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

function rememberOrder(orderId: string) {
  try {
    window.localStorage.setItem(ACTIVE_KEY, orderId);
    const next = [orderId, ...readRecent().filter((id) => id !== orderId)].slice(0, MAX_RECENT);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    return next;
  } catch {
    return [orderId];
  }
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function statusClass(status: string): string {
  if (status === "paid") return "border-emerald-300 bg-emerald-50 text-emerald-800";
  if (status === "pending") return "border-amber-300 bg-amber-50 text-amber-800";
  return "border-rose-300 bg-rose-50 text-rose-800";
}

export function OrdersClient() {
  const [input, setInput] = useState("");
  const [data, setData] = useState<OrderFilesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const requestId = useRef(0);

  const load = useCallback(async (id: string, options: { updateUrl?: boolean } = {}) => {
    if (!ORDER_ID_RE.test(id)) {
      setError("That does not look like an order ID. It looks like ord_xxxxxxxxxx from your receipt.");
      return;
    }
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(id)}/files`, { cache: "no-store" });
      const payload = (await res.json().catch(() => null)) as OrderFilesResponse | { error?: string } | null;
      if (currentRequest !== requestId.current) return;
      if (!res.ok) {
        const reason = (payload as { error?: string } | null)?.error;
        setData(null);
        setError(
          reason === "not_found"
            ? "No order with that ID was found on this site. Check the order ID from your receipt — it is case-sensitive."
            : reason === "invalid_order_id"
              ? "That order ID is not valid."
              : "Could not load this order right now. Try again in a moment.",
        );
        return;
      }
      setData(payload as OrderFilesResponse);
      setRecent(rememberOrder(id));
      if (options.updateUrl !== false) {
        const url = new URL(window.location.href);
        url.searchParams.set("order", id);
        window.history.replaceState(null, "", url.toString());
      }
    } catch {
      if (currentRequest !== requestId.current) return;
      setData(null);
      setError("Network error while loading the order. Check your connection and try again.");
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("order");
    const stored = window.localStorage.getItem(ACTIVE_KEY);
    const remembered = readRecent();
    setRecent(remembered);
    const candidate = [fromUrl, stored].find((value): value is string => Boolean(value && ORDER_ID_RE.test(value)));
    if (candidate) {
      setInput(candidate);
      void load(candidate, { updateUrl: Boolean(fromUrl) });
    } else if (remembered.length > 0) {
      setInput(remembered[0]);
      void load(remembered[0], { updateUrl: false });
    }
  }, [load]);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const value = input.trim();
    if (!value) {
      setError("Enter the order ID from your receipt.");
      return;
    }
    void load(value);
  }

  const available = data?.files.filter((file) => file.available) ?? [];
  const unavailable = data?.files.filter((file) => !file.available) ?? [];

  return (
    <div className="sans mx-auto max-w-3xl">
      <form onSubmit={onSubmit} className="rounded-2xl border border-stone-300 bg-white/70 p-6">
        <label htmlFor="order-id" className="block text-sm font-semibold text-stone-800">
          Order ID
        </label>
        <p className="mt-1 text-xs leading-relaxed text-stone-500">
          Find it on the payment receipt or in the confirmation page URL (“?order=ord_…”). It is also saved in this
          browser automatically.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            id="order-id"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="ord_xxxxxxxxxx"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-mono text-sm text-stone-900 outline-none focus:border-orange-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 rounded-xl bg-orange-700 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? "Loading…" : "Recover order"}
          </button>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-stone-500">
          Anyone with the order ID can view its download links — treat it like a receipt.
        </p>
      </form>

      {recent.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-500">
          <span>Recent orders:</span>
          {recent.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setInput(id);
                void load(id);
              }}
              className="rounded-full border border-stone-300 bg-white/60 px-2.5 py-1 font-mono text-[11px] text-stone-700 hover:border-orange-400 hover:text-orange-800"
            >
              {id}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div role="alert" className="mt-5 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <p className="font-semibold">Could not load the order</p>
          <p className="mt-1 leading-relaxed">{error}</p>
          <p className="mt-2 text-xs">
            Still stuck? Email{" "}
            <a href="mailto:support@headshotsnap.com" className="underline underline-offset-2">
              support@headshotsnap.com
            </a>{" "}
            with your receipt.
          </p>
        </div>
      )}

      {data && (
        <div className="mt-6 space-y-4">
          <section className="rounded-2xl border border-stone-300 bg-white/70 p-6" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Order</p>
                <p className="font-mono text-sm text-stone-800">{data.order.id}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(data.order.status)}`}>
                {STATUS_LABEL[data.order.status] ?? data.order.status}
              </span>
            </div>

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-stone-500">Package</dt>
                <dd className="mt-0.5 text-stone-800">{data.order.planName}</dd>
              </div>
              <div>
                <dt className="text-xs text-stone-500">Amount</dt>
                <dd className="mt-0.5 text-stone-800">
                  ${(data.order.amountCents / 100).toFixed(2)} {data.order.currency}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-stone-500">Created</dt>
                <dd className="mt-0.5 text-stone-800">{formatDate(data.order.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-stone-500">Paid</dt>
                <dd className="mt-0.5 text-stone-800">{formatDate(data.order.paidAt)}</dd>
              </div>
            </dl>

            <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Images</p>
              <div className="mt-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-stone-500">Remaining</p>
                  <p className="text-lg font-semibold text-stone-900">{data.usage.remaining}</p>
                </div>
                <div>
                  <p className="text-stone-500">Used</p>
                  <p className="text-lg font-semibold text-stone-700">{data.usage.used}</p>
                </div>
                <div>
                  <p className="text-stone-500">Held</p>
                  <p className="text-lg font-semibold text-stone-700">{data.usage.reserved}</p>
                </div>
                <div>
                  <p className="text-stone-500">Granted</p>
                  <p className="text-lg font-semibold text-stone-700">{data.usage.granted}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void load(data.order.id, { updateUrl: false })}
                disabled={loading}
                className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:border-orange-400"
              >
                {loading ? "Refreshing…" : "Refresh & re-sign links"}
              </button>
              <Link href={`/?order=${encodeURIComponent(data.order.id)}#generator`} className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:border-orange-400">
                Open the generator
              </Link>
              <Link href="/pricing" className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:border-orange-400">
                Buy another pack
              </Link>
            </div>
          </section>

          {data.warning && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
              {data.warning}
            </div>
          )}

          <section className="rounded-2xl border border-stone-300 bg-white/70 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-serif text-lg font-bold text-stone-900">Download links</h2>
              <span className="text-[11px] text-stone-500">
                Generated {formatDate(data.generatedAt)} · valid {data.linkLifetimeDays} days
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-stone-500">
              Images are kept for up to {data.retentionDays} days after generation. Open this page again inside that
              window to create fresh {data.linkLifetimeDays}-day links.
            </p>
            {available.length === 0 ? (
              <p className="mt-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
                {data.order.status !== "paid"
                  ? "Download links appear once this order is marked paid."
                  : "No downloadable images are linked to this order yet."}
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {available.map((file) => (
                  <li key={`${file.jobId}-${file.name}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-stone-100 px-3 py-2 text-sm">
                    <span className="truncate text-stone-800">{file.name}</span>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={file.name}
                      className="flex-none rounded-md border border-orange-300 px-2.5 py-1 text-xs font-semibold text-orange-800 hover:bg-orange-50"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {unavailable.length > 0 && (
              <ul className="mt-3 space-y-1.5 text-[11px] leading-relaxed text-stone-500">
                {unavailable.map((file) => (
                  <li key={`${file.jobId}-${file.name}-unavailable`}>
                    {file.name}: {REASON_LABEL[file.reason ?? ""] ?? "Not available for download."}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-stone-300 bg-white/70 p-6">
            <h2 className="font-serif text-lg font-bold text-stone-900">Jobs in this order</h2>
            {data.jobs.length === 0 ? (
              <p className="mt-3 text-sm text-stone-600">
                No generation jobs are linked to this order yet. If you just finished a generation, refresh in a
                moment — or contact support with the order ID.
              </p>
            ) : (
              <ol className="mt-4 space-y-3">
                {data.jobs.map((job) => (
                  <li key={job.id} className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-xs text-stone-500">{job.id}</span>
                      <span className="rounded-full border border-stone-300 bg-white px-2 py-0.5 text-[11px] text-stone-700">
                        {job.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-stone-500">
                      Created {formatDate(job.createdAt)} · {job.files.length} image{job.files.length === 1 ? "" : "s"}
                    </p>
                    {job.error && <p className="mt-1 text-xs text-rose-700">{job.error}</p>}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <p className="pb-4 text-center text-xs text-stone-500">
            Need help with this order?{" "}
            <Link href="/contact" className="underline underline-offset-2 hover:text-orange-800">
              Contact support
            </Link>{" "}
            and include the order ID above.
          </p>
        </div>
      )}
    </div>
  );
}
