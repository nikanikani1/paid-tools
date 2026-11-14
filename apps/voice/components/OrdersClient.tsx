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

const STATUS_STYLE: Record<string, string> = {
  paid: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  pending: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  refunded: "border-rose-400/40 bg-rose-400/10 text-rose-200",
  failed: "border-rose-400/40 bg-rose-400/10 text-rose-200",
};

const REASON_LABEL: Record<string, string> = {
  order_not_paid: "Available after payment is confirmed.",
  r2_not_configured: "Download storage is not configured on this deployment.",
  mock_delivery_not_stored: "This was a test-mode job; files were not stored for download.",
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

function statusBadge(status: string): string {
  return STATUS_STYLE[status] ?? "border-slate-600 bg-slate-800/60 text-slate-300";
}

export function OrdersClient() {
  const [input, setInput] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [data, setData] = useState<OrderFilesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const requestId = useRef(0);

  const load = useCallback(async (id: string, options: { updateUrl?: boolean } = {}) => {
    if (!ORDER_ID_RE.test(id)) {
      setError("That does not look like an order ID. It starts with “ord_” and looks like ord_xxxx.");
      return;
    }
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    setOrderId(id);
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
    const known = [fromUrl, stored].filter((value): value is string => Boolean(value && ORDER_ID_RE.test(value)));
    const remembered = readRecent();
    setRecent(remembered);
    if (fromUrl) {
      setInput(fromUrl);
      void load(fromUrl, { updateUrl: false });
    } else if (known.length > 0) {
      setInput(known[0]);
      void load(known[0], { updateUrl: false });
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

  const remainingFiles = data?.files.filter((file) => file.available) ?? [];
  const unavailableFiles = data?.files.filter((file) => !file.available) ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <form onSubmit={onSubmit} className="card p-5 sm:p-6">
        <label htmlFor="order-id" className="block text-sm font-medium text-slate-200">
          Order ID
        </label>
        <p className="mt-1 text-xs text-slate-500">
          You can find it in the payment receipt and in the URL of the confirmation page (“?order=ord_…”). It is also
          saved in this browser automatically.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            id="order-id"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="ord_xxxxxxxxxx"
            autoComplete="off"
            spellCheck={false}
            className="input font-mono text-sm"
          />
          <button type="submit" disabled={loading} className="btn btn-primary shrink-0 disabled:cursor-wait disabled:opacity-60">
            {loading ? "Loading…" : "Recover order"}
          </button>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
          Anyone with the order ID can view its download links — treat it like a receipt, do not post it publicly.
        </p>
      </form>

      {recent.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Recent orders in this browser:</span>
          {recent.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setInput(id);
                void load(id);
              }}
              className="rounded-full border border-slate-700 px-2.5 py-1 font-mono text-[11px] text-slate-300 hover:border-slate-500 hover:text-white"
            >
              {id}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div role="alert" className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
          <p className="text-sm font-semibold text-rose-100">Could not load the order</p>
          <p className="mt-1 text-sm leading-relaxed text-rose-200/90">{error}</p>
          <p className="mt-2 text-xs text-rose-200/70">
            Still stuck? Email{" "}
            <a href="mailto:support@stemsplit.ai" className="underline underline-offset-2">
              support@stemsplit.ai
            </a>{" "}
            with your receipt.
          </p>
        </div>
      )}

      {data && (
        <div className="mt-6 space-y-4">
          <section className="card p-5 sm:p-6" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">Order</p>
                <p className="font-mono text-sm text-slate-200">{data.order.id}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge(data.order.status)}`}>
                {STATUS_LABEL[data.order.status] ?? data.order.status}
              </span>
            </div>

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-500">Plan</dt>
                <dd className="mt-0.5 text-slate-200">{data.order.planName}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Amount</dt>
                <dd className="mt-0.5 text-slate-200">
                  ${(data.order.amountCents / 100).toFixed(2)} {data.order.currency}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Created</dt>
                <dd className="mt-0.5 text-slate-200">{formatDate(data.order.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Paid</dt>
                <dd className="mt-0.5 text-slate-200">{formatDate(data.order.paidAt)}</dd>
              </div>
            </dl>

            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">Minutes</p>
              <div className="mt-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-slate-500">Remaining</p>
                  <p className="text-lg font-semibold text-slate-100">{data.usage.remaining}</p>
                </div>
                <div>
                  <p className="text-slate-500">Used</p>
                  <p className="text-lg font-semibold text-slate-300">{data.usage.used}</p>
                </div>
                <div>
                  <p className="text-slate-500">Held by runs</p>
                  <p className="text-lg font-semibold text-slate-300">{data.usage.reserved}</p>
                </div>
                <div>
                  <p className="text-slate-500">Granted</p>
                  <p className="text-lg font-semibold text-slate-300">{data.usage.granted}</p>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                “Held by runs” are minutes reserved for a job in progress; they are returned automatically if the job
                fails.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => void load(data.order.id, { updateUrl: false })} disabled={loading} className="btn btn-ghost btn-sm">
                {loading ? "Refreshing…" : "Refresh & re-sign links"}
              </button>
              <Link href={`/?order=${encodeURIComponent(data.order.id)}#tool`} className="btn btn-ghost btn-sm">
                Open the tool
              </Link>
              <Link href="/pricing" className="btn btn-ghost btn-sm">
                Buy more minutes
              </Link>
            </div>
          </section>

          {data.warning && (
            <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm leading-relaxed text-amber-100/90">
              {data.warning}
            </div>
          )}

          <section className="card p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-100">Download links</h2>
              <span className="text-[11px] text-slate-500">
                Generated {formatDate(data.generatedAt)} · valid {data.linkLifetimeDays} days
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Stems are kept for up to {data.retentionDays} days after processing. Open this page again any time in
              that window to generate fresh {data.linkLifetimeDays}-day links — the URLs are not stored anywhere.
            </p>

            {remainingFiles.length === 0 ? (
              <p className="mt-4 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-400">
                {data.order.status !== "paid"
                  ? "Download links appear once this order is marked paid."
                  : data.jobs.length === 0
                    ? "No jobs have been created with this order yet. Upload a track in the tool and it will appear here."
                    : "No downloadable files are available right now — see the reasons below."}
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {remainingFiles.map((file) => (
                  <li
                    key={`${file.jobId}-${file.name}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-800/70 px-3 py-2 text-sm"
                  >
                    <span className="truncate text-slate-200">{file.name}</span>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={file.name}
                      className="flex-none rounded-md border border-cyan-400/30 px-2.5 py-1 text-xs font-medium text-cyan-300 hover:bg-cyan-400/10"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {unavailableFiles.length > 0 && (
              <ul className="mt-3 space-y-1.5 text-[11px] leading-relaxed text-slate-500">
                {unavailableFiles.map((file) => (
                  <li key={`${file.jobId}-${file.name}-unavailable`}>
                    {file.name}: {REASON_LABEL[file.reason ?? ""] ?? "Not available for download."}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-100">Jobs in this order</h2>
            {data.jobs.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">No jobs yet.</p>
            ) : (
              <ol className="mt-4 space-y-3">
                {data.jobs.map((job) => (
                  <li key={job.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-xs text-slate-400">{job.id}</span>
                      <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[11px] text-slate-300">
                        {job.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Created {formatDate(job.createdAt)} · {job.files.length} file{job.files.length === 1 ? "" : "s"}
                    </p>
                    {job.error && <p className="mt-1 text-xs text-rose-300">{job.error}</p>}
                    <Link
                      href={`/?order=${encodeURIComponent(data.order.id)}#tool`}
                      className="mt-2 inline-block text-xs text-cyan-300 hover:underline"
                    >
                      Run another track with this order →
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <p className="pb-4 text-center text-xs text-slate-500">
            Need help with this order?{" "}
            <Link href="/contact" className="underline underline-offset-2 hover:text-slate-300">
              Contact support
            </Link>{" "}
            and include the order ID above.
          </p>
        </div>
      )}
    </div>
  );
}
