"use client";

import { useEffect, useRef, useState } from "react";

const TRACKS = [
  { id: "vocals", name: "Vocals", src: "/samples/audio/vocals.mp3", color: "from-fuchsia-400 to-violet-500", hint: "Lead vocal + harmonies" },
  { id: "drums", name: "Drums", src: "/samples/audio/drums.mp3", color: "from-cyan-400 to-sky-500", hint: "Kick, snare, hats" },
  { id: "bass", name: "Bass", src: "/samples/audio/bass.mp3", color: "from-amber-300 to-orange-500", hint: "Low end, isolated" },
  { id: "other", name: "Other", src: "/samples/audio/other.mp3", color: "from-emerald-300 to-teal-500", hint: "Guitar, keys, textures" },
] as const;

type TrackId = (typeof TRACKS)[number]["id"];
const BARS = [14, 24, 38, 52, 30, 64, 44, 72, 36, 58, 78, 46, 66, 32, 54, 84, 40, 62, 48, 70, 28, 56, 76, 42, 60, 34, 50, 68, 38, 58, 46, 30];

function fmt(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function StemPlayer() {
  const trackRefs = useRef<Partial<Record<TrackId, HTMLAudioElement | null>>>({});
  const originalRef = useRef<HTMLAudioElement | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [mode, setMode] = useState<"stems" | "original">("stems");
  const [enabled, setEnabled] = useState<Record<TrackId, boolean>>({ vocals: true, drums: true, bass: true, other: true });
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const activeIds = TRACKS.filter((t) => enabled[t.id]).map((t) => t.id);

  function stopTimer() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }

  function pauseAll() {
    stopTimer();
    Object.values(trackRefs.current).forEach((a) => a?.pause());
    originalRef.current?.pause();
    setPlaying(false);
  }

  function syncTo(seconds: number) {
    Object.values(trackRefs.current).forEach((a) => {
      if (!a) return;
      try {
        if (Math.abs(a.currentTime - seconds) > 0.25) a.currentTime = seconds;
      } catch {
        /* metadata not ready yet */
      }
    });
    if (originalRef.current) {
      try {
        if (Math.abs(originalRef.current.currentTime - seconds) > 0.25) originalRef.current.currentTime = seconds;
      } catch {
        /* metadata not ready yet */
      }
    }
  }

  function startTimer() {
    stopTimer();
    timer.current = setInterval(() => {
      const master = mode === "original" ? originalRef.current : trackRefs.current[activeIds[0] ?? "vocals"];
      if (!master) return;
      setTime(master.currentTime);
      if (!Number.isFinite(master.duration)) return;
      const drift = Math.abs(master.currentTime - (trackRefs.current.vocals?.currentTime ?? 0));
      if (mode === "stems" && drift > 0.3) syncTo(master.currentTime);
      if (master.ended || master.currentTime >= master.duration - 0.05) pauseAll();
    }, 350);
  }

  async function playStems() {
    setError(null);
    originalRef.current?.pause();
    const start = time || 0;
    const ids = activeIds.length ? activeIds : (["vocals"] as TrackId[]);
    try {
      await Promise.all(
        ids.map(async (id) => {
          const a = trackRefs.current[id];
          if (!a) return;
          a.muted = false;
          if (Math.abs(a.currentTime - start) > 0.2) a.currentTime = start;
          await a.play();
        }),
      );
      setMode("stems");
      setPlaying(true);
      startTimer();
    } catch {
      setError("Your browser blocked audio playback. Tap play again.");
      setPlaying(false);
    }
  }

  async function playOriginal() {
    setError(null);
    Object.values(trackRefs.current).forEach((a) => a?.pause());
    const a = originalRef.current;
    if (!a) return;
    try {
      a.currentTime = time || 0;
      await a.play();
      setMode("original");
      setPlaying(true);
      startTimer();
    } catch {
      setError("Your browser blocked audio playback. Tap play again.");
      setPlaying(false);
    }
  }

  function toggle() {
    if (playing) pauseAll();
    else if (mode === "original") void playOriginal();
    else void playStems();
  }

  function switchMode(next: "stems" | "original") {
    const at = time;
    pauseAll();
    setMode(next);
    setTime(at);
    syncTo(at);
  }

  function toggleTrack(id: TrackId) {
    const next = { ...enabled, [id]: !enabled[id] };
    setEnabled(next);
    const audio = trackRefs.current[id];
    if (!audio) return;
    if (!next[id]) audio.pause();
    else if (playing && mode === "stems") {
      const master = trackRefs.current[activeIds[0] ?? "vocals"];
      if (master) audio.currentTime = master.currentTime;
      void audio.play().catch(() => undefined);
    }
  }

  function seek(value: number) {
    setTime(value);
    syncTo(value);
  }

  useEffect(() => {
    const original = originalRef.current;
    const onMeta = () => setDuration(original?.duration ?? 0);
    original?.addEventListener("loadedmetadata", onMeta);
    return () => {
      original?.removeEventListener("loadedmetadata", onMeta);
      stopTimer();
      Object.values(trackRefs.current).forEach((a) => a?.pause());
      original?.pause();
    };
  }, []);

  const progress = duration > 0 ? Math.min(100, (time / duration) * 100) : 0;

  return (
    <div className="card overflow-hidden p-0" data-reveal>
      <div className="border-b border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Hear the actual output</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-100">A real 4-stem split, synced in your browser</h3>
            <p className="mt-1 text-sm text-slate-400">
              Public-domain demo · &ldquo;Amazing Grace&rdquo; (vocalist with guitar), U.S. Air Force Reserve Band
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => switchMode("stems")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${mode === "stems" ? "bg-violet-500 text-white" : "border border-white/15 text-slate-300 hover:bg-white/10"}`}
            >
              4 stems
            </button>
            <button
              type="button"
              onClick={() => switchMode("original")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${mode === "original" ? "bg-violet-500 text-white" : "border border-white/15 text-slate-300 hover:bg-white/10"}`}
            >
              Original mix
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause demo" : "Play demo"}
            className="btn btn-primary h-11 w-11 !rounded-full !p-0 text-lg"
          >
            {playing ? "❚❚" : "▶"}
          </button>
          <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400" style={{ width: `${progress}%` }} />
          </div>
          <span className="w-20 text-right text-xs tabular-nums text-slate-400">
            {fmt(time)} / {fmt(duration)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={Math.max(1, duration)}
          step={0.1}
          value={Math.min(time, duration || 1)}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Seek demo audio"
          className="mt-3 w-full accent-violet-400"
        />
        {error && <p className="mt-2 text-xs text-amber-300">{error}</p>}
      </div>

      <div className="grid gap-2 p-4 sm:p-5">
        {TRACKS.map((track) => {
          const on = enabled[track.id];
          return (
            <div
              key={track.id}
              className={`flex items-center gap-3 rounded-xl border p-3 transition ${on ? "border-white/10 bg-white/[0.05]" : "border-white/5 bg-white/[0.015] opacity-55"}`}
            >
              <button
                type="button"
                onClick={() => toggleTrack(track.id)}
                aria-pressed={on}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${on ? "border-violet-400/60 bg-violet-500/20 text-violet-200" : "border-white/15 text-slate-500"}`}
                title={on ? `Mute ${track.name}` : `Unmute ${track.name}`}
              >
                {on ? "ON" : "OFF"}
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-100">{track.name}</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">{track.hint}</span>
                </div>
                <div className="mt-1.5 flex h-7 items-end gap-[3px]" aria-hidden="true">
                  {BARS.map((h, i) => (
                    <span
                      key={i}
                      className={`eq-bar w-full rounded-sm bg-gradient-to-t ${track.color}`}
                      style={{
                        height: `${on ? h : Math.round(h * 0.55)}%`,
                        animationDelay: `${i * 55}ms`,
                        animationPlayState: playing && on ? "running" : "paused",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="border-t border-white/10 px-5 py-3 text-[11px] leading-relaxed text-slate-500">
        Demo audio is a public-domain recording from Wikimedia Commons, processed with the same Demucs model used in
        production. Toggle stems on/off, switch to the original mix, or seek anywhere in the track.
      </p>

      {TRACKS.map((track) => (
        <audio
          key={track.id}
          ref={(el) => {
            trackRefs.current[track.id] = el;
          }}
          src={track.src}
          preload="none"
          crossOrigin="anonymous"
        />
      ))}
      <audio
        ref={originalRef}
        src="/samples/audio/original.mp3"
        preload="metadata"
        crossOrigin="anonymous"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
    </div>
  );
}
