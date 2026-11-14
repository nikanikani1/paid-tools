"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type JobFile = { name: string; url: string };
type Job = { id: string; status: string; progress: number; files: JobFile[]; error?: string };
type PaymentRequiredPayload = { error?: string; message?: string; checkoutUrl?: string };

const MAX_SIZE = 100 * 1024 * 1024;
const SAMPLE_NAME = "stemsplit-demo-track.mp3";

function paidOrderId(): string | null {
  if (typeof window === "undefined") return null;
  const fromUrl = new URLSearchParams(window.location.search).get("order");
  return fromUrl || window.localStorage.getItem("paidOrderId");
}

async function audioMinutes(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    const finish = (value: number) => {
      URL.revokeObjectURL(url);
      resolve(Math.max(1, Math.ceil(value)));
    };
    audio.onloadedmetadata = () => finish(Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration / 60 : 1);
    audio.onerror = () => finish(1);
    audio.src = url;
    window.setTimeout(() => finish(1), 4000);
  });
}

export function ToolDemo({
  cta = "Start with the $2.90 trial",
  note = "Trial Pack: 15 minutes for $2.90, one-time payment. Runs start after checkout.",
}: {
  cta?: string;
  note?: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutRequired, setCheckoutRequired] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    setActiveOrderId(paidOrderId());
  }, []);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stop();
    };
  }, [stop]);

  const poll = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/jobs/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Job lookup failed (${res.status})`);
        const data = (await res.json()) as Job;
        if (!mounted.current) return;
        setJob(data);
        if (data.status === "done" || data.status === "failed") {
          stop();
          setBusy(false);
          if (data.status === "failed") setError(data.error ?? "Separation failed. Please try another file.");
        }
      } catch (err) {
        if (!mounted.current) return;
        stop();
        setBusy(false);
        setError(err instanceof Error ? err.message : "Something went wrong while polling the job.");
      }
    },
    [stop],
  );

  async function createJob(file: File) {
    setBusy(true);
    setError(null);
    setCheckoutRequired(null);
    setJob(null);
    stop();
    try {
      const form = new FormData();
      form.append("file", file, file.name);
      const orderId = paidOrderId();
      if (orderId) {
        form.append("orderId", orderId);
        form.append("minutes", String(await audioMinutes(file)));
      }
      const res = await fetch("/api/jobs", {
        method: "POST",
        body: form,
      });
      if (res.status === 402) {
        const payload = (await res.json().catch(() => null)) as PaymentRequiredPayload | null;
        if (!mounted.current) return;
        setBusy(false);
        setCheckoutRequired(
          payload?.message ??
            "A paid run is required. The $2.90 Trial Pack includes 15 minutes — one-time payment, no subscription.",
        );
        return;
      }
      if (!res.ok) throw new Error((await res.text()) || "Could not create the separation job.");
      const created = (await res.json()) as Job;
      if (!mounted.current) return;
      setJob(created);
      timer.current = setInterval(() => void poll(created.id), 800);
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  function chooseFile(next: File | null | undefined) {
    if (!next) return;
    if (!next.type.startsWith("audio/") && !/\.(mp3|wav|m4a|flac|ogg|aac)$/i.test(next.name)) {
      setError("Please choose an audio file (MP3, M4A, FLAC, OGG).");
      return;
    }
    if (next.size > MAX_SIZE) {
      setError("That file is larger than 100MB. Trim it to under 10 minutes and try again.");
      return;
    }
    setFile(next);
    setError(null);
    setCheckoutRequired(null);
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    chooseFile(e.dataTransfer.files?.[0]);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || busy) return;
    if (file.size > MAX_SIZE) {
      setError("That file is larger than 100MB. Trim it to under 10 minutes and try again.");
      return;
    }
    void createJob(file);
  }

  const percent = job?.progress ?? 0;
  const done = job?.status === "done";

  return (
    <div id="tool" className="card mx-auto mt-10 w-full max-w-2xl p-5 text-left sm:p-6">
      <form onSubmit={onSubmit}>
        <label
          className={`dropzone ${dragging ? "ring-2 ring-violet-400 ring-offset-2 ring-offset-[#0b1020]" : ""}`}
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
          <span className="wave-bars mb-4" aria-hidden="true">
            {[10, 18, 26, 34, 22, 30, 16, 24, 12].map((height, index) => (
              <span key={index} style={{ height, animationDelay: `${index * 0.12}s` }} />
            ))}
          </span>
          <span className="text-sm font-medium text-slate-200">
            {file ? file.name : "Drop an audio file here, or click to choose"}
          </span>
          <span className="mt-2 text-xs text-slate-500">
            {file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB · ready to separate` : "MP3, M4A, FLAC, OGG · max 100MB / 10 min per track"}
          </span>
          <input
            type="file"
            accept="audio/*"
            className="sr-only"
            onChange={(e) => {
              chooseFile(e.target.files?.[0]);
              e.currentTarget.value = "";
            }}
          />
        </label>

        <button type="submit" disabled={!file || busy} className="btn btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-40">
          {busy ? "Separating stems…" : cta}
        </button>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <Link href="/pricing#trial" className="text-xs font-medium text-cyan-300 transition-colors hover:text-cyan-200">
            Get the $2.90 Trial Pack · 15 minutes →
          </Link>
          <span className="text-[11px] text-slate-600">Paid runs only · $2.90 Trial Pack</span>
        </div>

        {error && (
          <p role="alert" className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </p>
        )}

        {checkoutRequired && (
          <div role="alert" className="mt-3 rounded-xl border border-violet-400/40 bg-violet-500/10 px-4 py-3">
            <p className="text-sm font-semibold text-violet-100">Checkout required</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">{checkoutRequired}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Link href="/pricing#trial" className="btn btn-primary btn-sm">
                Buy the $2.90 Trial Pack
              </Link>
              <Link href="/orders" className="text-xs text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                Already paid? Recover your order →
              </Link>
            </div>
          </div>
        )}

        {job && (
          <div className="card-soft mt-5 p-4" aria-live="polite">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-300">
                {done ? "Your stems are ready" : job.status === "queued" ? "Queued…" : "Separating stems…"} · {percent}%
              </span>
              <span className="truncate font-mono text-[11px] text-slate-600">{job.id}</span>
            </div>
            <div
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
            {job.files.length > 0 && (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {job.files.map((f) => (
                  <li key={f.name} className="flex items-center justify-between gap-2 rounded-lg bg-slate-800/70 px-3 py-2 text-sm">
                    <span className="truncate">{f.name}</span>
                    <a
                      href={f.url}
                      download={f.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-none rounded-md border border-cyan-400/30 px-2 py-1 text-xs font-medium text-cyan-300 hover:bg-cyan-400/10 hover:underline"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {job.files.length > 0 && (
              <p className="mt-3 text-[11px] text-slate-500">
                Each stem opens in a new tab so this page stays intact; download the rest from here.
              </p>
            )}
            {job.files.length > 0 && activeOrderId && (
              <p className="mt-2 text-[11px] text-slate-500">
                Looking for every download from this order, or an expired link?{" "}
                <Link
                  href={`/orders?order=${encodeURIComponent(activeOrderId)}`}
                  className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
                >
                  Open the order page →
                </Link>
              </p>
            )}
            {done && (
              <button
                type="button"
                onClick={() => {
                  setJob(null);
                  setFile(null);
                  setError(null);
                }}
                className="mt-3 text-xs text-slate-400 underline-offset-2 hover:text-slate-200 hover:underline"
              >
                Separate another track
              </button>
            )}
          </div>
        )}
      </form>
      <p className="mt-4 text-center text-xs text-slate-500">{note}</p>
      <p className="mt-2 text-center text-[11px] text-slate-600">
        Already paid?{" "}
        <Link href="/orders" className="text-cyan-300/80 underline underline-offset-2 hover:text-cyan-200">
          Recover your order and download links →
        </Link>
      </p>
    </div>
  );
}
