"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BRAND, type BrandConfig } from "@/lib/brands";

type JobFile = { name: string; url: string; size?: number };
type Job = {
  id: string;
  status: string;
  progress: number;
  files: JobFile[];
  error?: string;
  meta?: Record<string, unknown>;
};
type OrderStatus = {
  id: string;
  status: string;
  planId: string;
  unitsGranted: number;
  unitsUsed: number;
  unitsReserved: number;
  remaining: number;
  amountCents: number;
  currency: string;
};

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

function storageKey(brand: BrandConfig): string {
  return `photoStudio:${brand.kind}:orderId`;
}

function friendlySize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export type StudioProps = {
  /** Defaults to the brand selected by NEXT_PUBLIC_SITE_KIND at build time. */
  brand?: BrandConfig;
};

/**
 * The whole customer flow for one photo-studio brand:
 * buy → upload one photo + pick a style → generate four concepts → download.
 *
 * Paid-only: the generate button routes to checkout until the order webhook has
 * marked the pack as paid. Nothing is generated on an unpaid order, and a failed
 * pack is refunded by the API (the UI says so explicitly instead of failing silently).
 */
export function Studio({ brand = BRAND }: StudioProps) {
  const [file, setFile] = useState<File | null>(null);
  const [styleId, setStyleId] = useState(brand.styles[0]?.id ?? "");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [busy, setBusy] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const jobTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const planUnits = order?.unitsGranted ?? 4;
  const paid = order?.status === "paid" && order.remaining > 0;
  const jobRunning = job?.status === "pending" || job?.status === "queued" || job?.status === "running";
  const selectedStyle = brand.styles.find((style) => style.id === styleId) ?? brand.styles[0];

  // Restore an order id from the checkout return URL or a previous visit.
  useEffect(() => {
    try {
      const fromUrl = new URLSearchParams(window.location.search).get("order");
      const stored = window.localStorage.getItem(storageKey(brand));
      const id = fromUrl || stored;
      if (id) {
        setOrderId(id);
        window.localStorage.setItem(storageKey(brand), id);
      }
      if (new URLSearchParams(window.location.search).get("checkout") === "canceled") {
        setNotice("Checkout was canceled — nothing was charged.");
      }
    } catch {
      /* storage can be unavailable in private mode; checkout return URL still works */
    }
  }, [brand]);

  // Poll the order until it is paid (webhook is async).
  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      return;
    }
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/orders/status?order=${encodeURIComponent(orderId)}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as OrderStatus;
        if (!cancelled) setOrder(data);
      } catch {
        /* transient network error: next tick retries */
      }
    };
    void tick();
    const timer = setInterval(tick, 3000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [orderId]);

  const stopJobPolling = useCallback(() => {
    if (jobTimer.current) clearInterval(jobTimer.current);
    jobTimer.current = null;
  }, []);

  useEffect(() => () => stopJobPolling(), [stopJobPolling]);

  const pollJob = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/jobs/${id}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as Job;
        setJob(data);
        if (data.status === "done" || data.status === "failed") {
          stopJobPolling();
          setBusy(false);
          if (data.status === "failed") setError(data.error ?? "Generation failed. You were not charged.");
          else setNotice("Your four images are ready. Each download opens in a new tab.");
        }
      } catch {
        /* transient network error: next tick retries */
      }
    },
    [stopJobPolling],
  );

  async function startCheckout() {
    setCheckoutBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; orderId?: string; url?: string; mock?: boolean; error?: string; message?: string }
        | null;
      if (!res.ok || !data?.ok || !data.orderId) {
        setError(data?.message ?? data?.error ?? "Checkout is unavailable right now.");
        return;
      }
      setOrderId(data.orderId);
      try {
        window.localStorage.setItem(storageKey(brand), data.orderId);
      } catch {
        /* ignore storage errors */
      }
      if (data.mock) {
        setNotice("Sandbox checkout: no real charge was made. Payments activate once the merchant keys are configured.");
        return;
      }
      if (data.url) {
        window.location.assign(data.url);
        return;
      }
      setNotice("Order created. Waiting for payment confirmation…");
    } catch {
      setError("Checkout is unavailable right now.");
    } finally {
      setCheckoutBusy(false);
    }
  }

  function chooseFile(incoming: File | null | undefined) {
    setError(null);
    if (!incoming) return;
    const looksImage = incoming.type.startsWith("image/") || /\.(jpe?g|png|webp|heic|heif)$/i.test(incoming.name);
    if (!looksImage) {
      setError("Use a JPG, PNG, WebP or HEIC image.");
      return;
    }
    if (incoming.size > MAX_UPLOAD_BYTES) {
      setError("That image is larger than 15 MB — please pick a smaller one.");
      return;
    }
    setFile(incoming);
  }

  async function generate() {
    if (!orderId || !paid) {
      await startCheckout();
      return;
    }
    if (!file) {
      setError(`Choose a photo to turn into ${brand.unitLabel}.`);
      return;
    }
    if (!selectedStyle?.id) {
      setError(`Pick a ${brand.choiceLabel.toLowerCase()}.`);
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    setJob(null);
    stopJobPolling();
    try {
      const form = new FormData();
      form.append("photo", file, file.name || "photo.jpg");
      form.append("style", selectedStyle.id);
      form.append("orderId", orderId);
      const res = await fetch("/api/jobs", { method: "POST", body: form });
      if (res.status === 402) {
        const payload = (await res.json().catch(() => null)) as { message?: string } | null;
        setError(payload?.message ?? `Buy the ${brand.price} pack before generating.`);
        setBusy(false);
        return;
      }
      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { message?: string; error?: string } | null;
        setError(payload?.message ?? payload?.error ?? "Could not start the pack. Please try again.");
        setBusy(false);
        return;
      }
      const created = (await res.json()) as Job;
      setJob(created);
      stopJobPolling();
      jobTimer.current = setInterval(() => void pollJob(created.id), 1500);
    } catch {
      setError("Could not reach the generation service. Please try again.");
      setBusy(false);
    }
  }

  return (
    <section data-testid="studio" className="mx-auto max-w-6xl px-6 pb-20 pt-10">
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="sans text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
            {brand.name} · {brand.price} one-time
          </p>
          <h1 className="mt-3 text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">{brand.headline}</h1>
          <p className="sans mt-4 max-w-xl text-base leading-relaxed opacity-80">{brand.intro}</p>

          <div className="sans mt-8 rounded-2xl border border-black/10 bg-white/60 p-5">
            <label className="flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-black/30 px-6 py-8 text-center transition hover:border-[var(--brand)]">
              <span className="text-sm font-medium">
                {file ? file.name : brand.uploadLabel}
              </span>
              <span className="mt-1 text-xs opacity-60">
                {file ? friendlySize(file.size) : "JPG, PNG, WebP or HEIC · max 15 MB"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                aria-label={brand.uploadLabel}
                onChange={(event) => {
                  chooseFile(event.target.files?.[0]);
                  event.currentTarget.value = "";
                }}
              />
            </label>

            <fieldset className="mt-5">
              <legend className="text-sm font-medium">{brand.choiceLabel}</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {brand.styles.map((style) => {
                  const active = style.id === styleId;
                  return (
                    <label
                      key={style.id}
                      className={`cursor-pointer rounded-xl border px-3 py-3 text-sm transition ${
                        active
                          ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                          : "border-black/10 bg-white/50 hover:border-[var(--brand)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="style"
                        value={style.id}
                        checked={active}
                        className="sr-only"
                        onChange={() => setStyleId(style.id)}
                      />
                      <span className="block font-semibold">{style.label}</span>
                      <span className="mt-1 block text-xs opacity-65">{style.description}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <button
              type="button"
              data-testid="generate"
              onClick={() => void generate()}
              disabled={busy || jobRunning}
              className="mt-5 w-full rounded-xl bg-[var(--brand)] px-5 py-3 font-semibold text-white disabled:opacity-40"
            >
              {busy || jobRunning
                ? "Generating your images…"
                : paid
                  ? `Generate ${brand.unitLabel}`
                  : `Buy ${brand.price} to generate`}
            </button>
            {!paid && (
              <p className="mt-2 text-xs opacity-60">
                One-time payment. Your photo is only used for this pack, and a failed generation is refunded.
              </p>
            )}
          </div>

          {(error || notice) && (
            <div className="sans mt-4 space-y-2">
              {error && (
                <p data-testid="error" className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                  {error}
                </p>
              )}
              {notice && (
                <p className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{notice}</p>
              )}
            </div>
          )}

          {job && (
            <div className="sans mt-6 rounded-2xl border border-black/10 bg-white/60 p-5" data-testid="job">
              <div className="flex items-center justify-between text-sm">
                <span>
                  {job.status === "done" ? "Done" : job.status === "failed" ? "Failed" : "Generating"} · {job.progress}%
                </span>
                <span className="text-xs opacity-60">{job.id}</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/10">
                <div className="h-full bg-[var(--brand)] transition-all" style={{ width: `${job.progress}%` }} />
              </div>
              {job.status === "failed" && job.error && (
                <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  {job.error}
                </p>
              )}
              {job.files.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3" data-testid="results">
                  {job.files.map((result) => (
                    <a
                      key={result.name}
                      href={result.url}
                      download={result.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sample-hover block overflow-hidden rounded-xl border border-black/10 bg-black/5"
                      title={`Download ${result.name}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={result.url} alt={result.name} className="aspect-[4/3] w-full object-cover" />
                      <span className="flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium">
                        <span className="truncate">{result.name}</span>
                        <span className="flex-none rounded bg-[var(--brand)]/10 px-1.5 py-0.5">Download</span>
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="sans h-fit rounded-2xl border border-black/10 bg-white/70 p-6">
          <p className="text-xs uppercase tracking-[0.16em] opacity-60">One-time pack</p>
          <p className="mt-2 text-4xl font-extrabold">{brand.price}</p>
          <p className="mt-1 text-sm opacity-70">{brand.unitLabel}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {brand.features.map((feature) => (
              <li key={feature}>· {feature}</li>
            ))}
          </ul>

          <div className="mt-5 rounded-xl border border-black/10 bg-[var(--brand-soft)] px-3 py-3 text-xs" data-testid="order-status">
            {!orderId && <p>No order yet — buy the pack to generate.</p>}
            {orderId && !order && <p>Checking order {orderId.slice(0, 14)}…</p>}
            {order && (
              <p>
                Order <span className="font-semibold">{order.status}</span> · {order.unitsGranted - order.remaining}/
                {order.unitsGranted} images used · {planUnits} per pack
              </p>
            )}
            {paid && order && (
              <p className="mt-1 font-semibold text-[var(--brand)]">
                {order.remaining} of {order.unitsGranted} images available
              </p>
            )}
          </div>

          <button
            type="button"
            data-testid="buy"
            onClick={() => void startCheckout()}
            disabled={checkoutBusy}
            className="mt-4 w-full rounded-xl bg-[var(--brand)] px-5 py-3 font-semibold text-white disabled:opacity-40"
          >
            {checkoutBusy ? "Opening checkout…" : paid ? "Buy another pack" : `Buy — ${brand.price}`}
          </button>
          <p className="mt-3 text-xs opacity-60">
            Payments are handled by our merchant of record. Card details never touch this site.
          </p>
          {job?.status === "failed" && (
            <p className="mt-3 text-xs text-amber-800">
              A failed pack releases its hold automatically — you can retry with the same order.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}

export default Studio;
