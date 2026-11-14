"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { STYLES } from "../lib/site";

type JobFile = { name: string; url: string };
type JobFailure = { index: number; stage: string; reason: string };
type JobMeta = {
  real?: boolean;
  fanout?: boolean;
  requestedImages?: number;
  succeeded?: number;
  failed?: number;
  failures?: JobFailure[];
  chargedUnits?: number;
  r2Stored?: number;
};
type Job = { id: string; status: string; progress: number; files: JobFile[]; error?: string; meta?: JobMeta };

// Launch catalogue: only the paid 5-image Sample Pack is sold. Larger packages
// (40/60/100) are intentionally not selectable until they are implemented.
const PACKAGES = [{ images: 5, label: "Sample Pack — 5 headshots — $9" }];

export type GeneratorFormProps = {
  id?: string;
  variant?: "full" | "compact" | "sample";
  defaultStyle?: string;
  defaultPlan?: number;
  heading?: string;
  note?: string;
};

export default function GeneratorForm({
  id = "generator",
  variant = "full",
  defaultStyle = STYLES[0],
  defaultPlan = 5,
  heading,
  note,
}: GeneratorFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [style, setStyle] = useState(defaultStyle);
  // Only the 5-image Sample Pack exists at launch; any defaultPlan prop is clamped to it.
  const images = Math.min(Math.max(1, Math.floor(defaultPlan || PACKAGES[0].images)), PACKAGES[0].images);
  const [job, setJob] = useState<Job | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutRequired, setCheckoutRequired] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  const poll = useCallback(async (jobId: string) => {
    try {
      const res = await fetch(`/api/orders/${jobId}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Order lookup failed (${res.status})`);
      const data = (await res.json()) as Job;
      setJob(data);
      if (data.status === "done" || data.status === "failed") {
        stop();
        setBusy(false);
      }
    } catch (err) {
      stop();
      setBusy(false);
      setError(err instanceof Error ? err.message : "Could not read order status");
    }
  }, [stop]);

  useEffect(() => () => stop(), [stop]);

  const selected = PACKAGES.find((pkg) => pkg.images === images) ?? PACKAGES[0];

  function chooseFiles(next: FileList | File[] | null | undefined) {
    if (!next) return;
    const incoming = Array.from(next);
    const imagesOnly = incoming.filter((f) => f.type.startsWith("image/") || /\.(jpe?g|png|webp|heic)$/i.test(f.name));
    if (imagesOnly.length === 0) {
      setError("Please choose JPG, PNG, WebP or HEIC selfies.");
      return;
    }
    if (imagesOnly.some((f) => f.size > 15 * 1024 * 1024)) {
      setError("Each selfie must be under 15 MB.");
      return;
    }
    setFiles(imagesOnly);
    setError(null);
    setCheckoutRequired(false);
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    chooseFiles(e.dataTransfer.files);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length < 3) {
      setError("Upload at least 3 selfies (5 recommended).");
      return;
    }
    setBusy(true);
    setError(null);
    setCheckoutRequired(false);
    setJob(null);
    try {
      const form = new FormData();
      files.forEach((file) => form.append("selfies", file, file.name));
      form.append("style", style);
      form.append("images", String(images));
      form.append("package", selected.label);
      const orderId =
        new URLSearchParams(window.location.search).get("order") || window.localStorage.getItem("paidOrderId");
      if (orderId) form.append("orderId", orderId);
      const res = await fetch("/api/orders", {
        method: "POST",
        body: form,
      });
      if (res.status === 402) {
        const payload = (await res.json().catch(() => null)) as { message?: string } | null;
        setCheckoutRequired(true);
        setError(
          payload?.message ??
            "Checkout required. Every order is paid — start with the $9 Sample Pack once payments are connected.",
        );
        setBusy(false);
        return;
      }
      if (!res.ok) throw new Error((await res.text()) || "Could not create the order");
      const created = (await res.json()) as Job;
      setJob(created);
      stop();
      timer.current = setInterval(() => void poll(created.id), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div id={id} className="sans scroll-mt-24 rounded-2xl border border-stone-300 bg-white/75 p-5 shadow-sm">
      {heading && <h2 className="mb-4 text-lg font-semibold text-stone-900">{heading}</h2>}
      <form onSubmit={onSubmit}>
        <label
          className={`flex cursor-pointer flex-col items-center rounded-xl border border-dashed px-6 py-8 text-center transition ${
            dragging
              ? "border-orange-600 bg-orange-100 ring-2 ring-orange-500/30"
              : "border-stone-400 hover:border-orange-600 hover:bg-orange-50/40"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragging(true);
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragging(false);
          }}
          onDrop={onDrop}
        >
          <span className="text-sm font-medium text-stone-700">
            {files.length > 0 ? `${files.length} selfies selected` : "Drop 3–8 selfies here, or click to choose"}
          </span>
          <span className="mt-1 text-xs text-stone-500">
            Front-facing, good light, no sunglasses · JPG/PNG · max 15 MB each
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            aria-label="Upload selfies"
            onChange={(e) => {
              chooseFiles(e.target.files);
              e.currentTarget.value = "";
            }}
          />
        </label>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-stone-700">
            Style
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white p-2 text-stone-900"
            >
              {STYLES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <div className="text-sm text-stone-700">
            Package
            <div className="mt-1 rounded-lg border border-stone-300 bg-stone-100 px-3 py-2 text-stone-900">
              Sample Pack — 5 headshots — $9
            </div>
            <p className="mt-1 text-xs text-stone-500">Only the 5-image Sample Pack is available at launch.</p>
          </div>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="mt-4 w-full rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-40"
        >
          {busy ? "Starting your order…" : `Continue — ${selected.label.split(" — ").at(-1)} one-time`}
        </button>
        <p className="mt-2 text-xs text-stone-500">
          Paid order required — every set is generated after payment, with one free redo if the likeness misses.
        </p>
        {checkoutRequired && (
          <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-3 text-sm text-amber-900">
            <p className="font-semibold">Checkout required</p>
            <p className="mt-1">
              This build has no payment provider connected, so no order can be created. In production you would be sent
              to checkout for the {selected.images}-image package.
            </p>
          </div>
        )}
        {error && !checkoutRequired && (
          <p className="mt-3 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>
        )}
        {job && (
          <div className="mt-5 rounded-xl border border-stone-300 bg-stone-50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span>
                {job.status === "done" ? "Done" : job.status === "failed" ? "Failed" : "Generating"} · {job.progress}%
              </span>
              <span className="text-xs text-stone-500">{job.id}</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-stone-200">
              <div className="h-full bg-orange-600 transition-all" style={{ width: `${job.progress}%` }} />
            </div>
            {typeof job.meta?.requestedImages === "number" && job.meta.requestedImages > 0 && (job.status === "done" || job.status === "failed") && (
              <div
                className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
                  job.meta.failed && job.meta.failed > 0
                    ? "border-amber-300 bg-amber-50 text-amber-900"
                    : "border-emerald-300 bg-emerald-50 text-emerald-900"
                }`}
              >
                <p className="font-semibold">
                  {job.meta.succeeded ?? job.files.length}/{job.meta.requestedImages} images succeeded
                  {typeof job.meta.failed === "number" && job.meta.failed > 0 ? ` · ${job.meta.failed} failed` : ""}
                  {typeof job.meta.chargedUnits === "number" ? ` · ${job.meta.chargedUnits} image credits used` : ""}
                </p>
                {job.meta.failures && job.meta.failures.length > 0 && (
                  <ul className="mt-1 list-disc space-y-0.5 pl-4">
                    {job.meta.failures.map((failure) => (
                      <li key={`${failure.index}-${failure.stage}`}>
                        Image {failure.index} — {failure.stage}: {failure.reason}
                      </li>
                    ))}
                  </ul>
                )}
                {job.meta.failed && job.meta.failed > 0 && (
                  <p className="mt-1">You are only charged for images that were delivered.</p>
                )}
              </div>
            )}
            {job.error && (
              <p className="mt-3 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-800">{job.error}</p>
            )}
            {job.files.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {job.files.slice(0, 20).map((f) => (
                  <a
                    key={f.name}
                    href={f.url}
                    download={f.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-stone-300 bg-stone-200"
                    title={`Download ${f.name}`}
                  >
                    <img src={f.url} alt={f.name} className="h-full w-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-stone-950/65 px-2 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm">
                      <span className="truncate">{f.name}</span>
                      <span className="flex-none rounded bg-white/20 px-1.5 py-0.5">Download</span>
                    </span>
                  </a>
                ))}
              </div>
            )}
            {job.files.length > 0 && (
              <p className="mt-3 text-xs text-stone-600">
                {job.files.length} files ready. Each download opens in a new tab so this page stays intact.{" "}
                <a className="text-orange-700 underline underline-offset-2" href={`/api/orders/${job.id}`}>
                  Refresh status
                </a>
              </p>
            )}
          </div>
        )}
        <p className="mt-3 text-xs text-stone-500">
          {note ??
            "Demo mode: order creation is disabled in production until checkout is connected (API answers 402 payment_required)."}
        </p>
      </form>
    </div>
  );
}
