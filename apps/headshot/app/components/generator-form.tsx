"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { STYLES } from "../lib/site";

type JobFile = { name: string; url: string };
type Job = { id: string; status: string; progress: number; files: JobFile[]; error?: string };

const PACKAGES = [
  { images: 40, label: "40 headshots — $35" },
  { images: 60, label: "60 headshots — $45" },
  { images: 100, label: "100 headshots — $75" },
];

export type GeneratorFormProps = {
  id?: string;
  variant?: "full" | "compact" | "free";
  defaultStyle?: string;
  defaultPlan?: number;
  heading?: string;
  note?: string;
};

export default function GeneratorForm({
  id = "generator",
  variant = "full",
  defaultStyle = STYLES[0],
  defaultPlan = 40,
  heading,
  note,
}: GeneratorFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [style, setStyle] = useState(defaultStyle);
  const [images, setImages] = useState(defaultPlan);
  const [job, setJob] = useState<Job | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length < 3) {
      setError("Upload at least 3 selfies (5 recommended).");
      return;
    }
    setBusy(true);
    setError(null);
    setJob(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: files.length,
          style,
          images: variant === "free" ? 1 : images,
        }),
      });
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

  const isFree = variant === "free";

  return (
    <div id={id} className="sans scroll-mt-24 rounded-2xl border border-stone-300 bg-white/75 p-5 shadow-sm">
      {heading && <h2 className="mb-4 text-lg font-semibold text-stone-900">{heading}</h2>}
      <form onSubmit={onSubmit}>
        <label className="flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-stone-400 px-6 py-8 text-center transition hover:border-orange-600 hover:bg-orange-50/40">
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
            onChange={(e) => setFiles([...(e.target.files ?? [])])}
          />
        </label>
        <div className={`mt-4 grid gap-3 ${isFree ? "" : "sm:grid-cols-2"}`}>
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
          {!isFree && (
            <label className="text-sm text-stone-700">
              Package
              <select
                value={images}
                onChange={(e) => setImages(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white p-2 text-stone-900"
              >
                {PACKAGES.map((pkg) => (
                  <option key={pkg.images} value={pkg.images}>
                    {pkg.label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <button
          type="submit"
          disabled={busy}
          className="mt-4 w-full rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-40"
        >
          {busy ? "Generating…" : isFree ? "Render my free preview" : "Generate my headshots"}
        </button>
        {error && (
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
            {job.files.length > 0 && (
              <div className="mt-4 grid grid-cols-5 gap-2">
                {job.files.slice(0, isFree ? 1 : 20).map((f) => (
                  <div
                    key={f.name}
                    className="aspect-square rounded-lg border border-stone-200 bg-stone-200/70 p-1 text-[10px] leading-tight text-stone-600"
                  >
                    {f.name}
                  </div>
                ))}
              </div>
            )}
            {job.files.length > 0 && (
              <p className="mt-3 text-xs text-stone-600">
                {job.files.length} files ready.{" "}
                <a className="text-orange-700 underline underline-offset-2" href={`/api/orders/${job.id}`}>
                  Refresh status
                </a>
              </p>
            )}
          </div>
        )}
        <p className="mt-3 text-xs text-stone-500">
          {note ?? "Mock mode now — the AI pipeline runs once API keys are connected."}
        </p>
      </form>
    </div>
  );
}
