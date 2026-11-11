"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type JobFile = { name: string; url: string };
type Job = { id: string; status: string; progress: number; files: JobFile[]; error?: string };

const MAX_SIZE = 100 * 1024 * 1024;
const SAMPLE_NAME = "stemsplit-demo-track.mp3";

export function ToolDemo({
  cta = "Separate vocals — free preview",
  note = "MP3, WAV, M4A, FLAC · up to 100MB · 10 min per track. Free preview: 3 minutes, no signup.",
}: {
  cta?: string;
  note?: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const mounted = useRef(true);

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

  async function createJob(filename: string, size: number) {
    setBusy(true);
    setError(null);
    setJob(null);
    stop();
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, size }),
      });
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

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || busy) return;
    if (file.size > MAX_SIZE) {
      setError("That file is larger than 100MB. Trim it to under 10 minutes and try again.");
      return;
    }
    void createJob(file.name, file.size);
  }

  const percent = job?.progress ?? 0;
  const done = job?.status === "done";

  return (
    <div id="tool" className="card mx-auto mt-10 w-full max-w-2xl p-5 text-left sm:p-6">
      <form onSubmit={onSubmit}>
        <label className="dropzone">
          <span className="wave-bars mb-4" aria-hidden="true">
            {[10, 18, 26, 34, 22, 30, 16, 24, 12].map((height, index) => (
              <span key={index} style={{ height, animationDelay: `${index * 0.12}s` }} />
            ))}
          </span>
          <span className="text-sm font-medium text-slate-200">
            {file ? file.name : "Drop an audio file here, or click to choose"}
          </span>
          <span className="mt-2 text-xs text-slate-500">
            {file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB · ready to separate` : "MP3, WAV, M4A, FLAC · max 100MB / 10 min"}
          </span>
          <input
            type="file"
            accept="audio/*"
            className="sr-only"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setError(null);
            }}
          />
        </label>

        <button type="submit" disabled={!file || busy} className="btn btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-40">
          {busy ? "Separating stems…" : cta}
        </button>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => void createJob(SAMPLE_NAME, 4_600_000)}
            disabled={busy}
            className="text-xs font-medium text-cyan-300 transition-colors hover:text-cyan-200 disabled:opacity-40"
          >
            Try it with a sample track →
          </button>
          <span className="text-[11px] text-slate-600">Demo mode: AI provider keys are not connected yet.</span>
        </div>

        {error && (
          <p role="alert" className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </p>
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
                      className="flex-none text-xs font-medium text-cyan-300 hover:underline"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
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
    </div>
  );
}
