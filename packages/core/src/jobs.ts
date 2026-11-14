import type { Job, JobKind } from "./types";
import { isR2Configured, presignGet, presignPut } from "./r2";

/**
 * In-memory job cache plus R2-backed durable records.
 * A Worker isolate can be evicted between the POST that creates a job and the
 * browser poll; the in-memory Map alone loses the job. Every route that
 * creates/updates a job calls persistJob(), and getPersistedJob() restores it.
 */
const globalStore = globalThis as unknown as { __paidJobs?: Map<string, Job> };
const store: Map<string, Job> = globalStore.__paidJobs ?? (globalStore.__paidJobs = new Map());

function jobKey(job: Job): string {
  return `jobs/${job.kind}/${job.id}.json`;
}

export async function persistJob(id: string): Promise<boolean> {
  const job = store.get(id);
  if (!job || !isR2Configured()) return false;
  try {
    const body = JSON.stringify(job);
    const signed = await presignPut(jobKey(job), { expiresIn: 300, contentType: "application/json", strict: true });
    const res = await fetch(signed.url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body,
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getPersistedJob(id: string): Promise<Job | undefined> {
  if (!isR2Configured()) return undefined;
  for (const kind of ["voice", "headshot"] as const) {
    try {
      const key = `jobs/${kind}/${id}.json`;
      const signed = await presignGet(key, { expiresIn: 120, strict: true });
      const res = await fetch(signed.url, { cache: "no-store" });
      if (!res.ok) continue;
      const job = (await res.json()) as Job;
      store.set(job.id, job);
      return job;
    } catch {
      /* try next kind */
    }
  }
  return undefined;
}


export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createJob(kind: JobKind, input: Record<string, unknown>): Job {
  const now = new Date().toISOString();
  const job: Job = {
    id: newId(kind),
    kind,
    status: "queued",
    progress: 0,
    createdAt: now,
    updatedAt: now,
    input,
    files: [],
  };
  store.set(job.id, job);
  return job;
}

export function getJob(id: string): Job | undefined {
  return store.get(id);
}

export function updateJob(id: string, patch: Partial<Job>): Job | undefined {
  const current = store.get(id);
  if (!current) return undefined;
  const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
  store.set(id, next);
  return next;
}

export function listJobs(limit = 20): Job[] {
  return [...store.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
}

/** Remove a job that never reached the provider (e.g. allowance reservation failed). */
export function discardJob(id: string): boolean {
  return store.delete(id);
}

// ---------------------------------------------------------------------------
// Server-side audio duration parsing
// ---------------------------------------------------------------------------

/**
 * Hard product limit for a single voice upload: 10 minutes.
 * Enforced on the server from the actual file header, not from the client's `minutes` field.
 */
export const MAX_VOICE_AUDIO_MINUTES = 10;

export type AudioFormat = "wav" | "mp3" | "flac" | "m4a";

export interface ParsedAudioDuration {
  seconds: number;
  minutes: number;
  format: AudioFormat;
  /** true when the duration comes from an estimate (e.g. CBR bitrate) rather than an exact header. */
  estimated: boolean;
}

function readAscii(bytes: Uint8Array, offset: number, length: number): string {
  if (offset < 0 || offset + length > bytes.length) return "";
  let value = "";
  for (let i = 0; i < length; i += 1) value += String.fromCharCode(bytes[offset + i]);
  return value;
}

function viewOf(bytes: Uint8Array): DataView {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

function result(seconds: number, format: AudioFormat, estimated: boolean): ParsedAudioDuration | null {
  if (!Number.isFinite(seconds) || seconds <= 0 || seconds > 24 * 60 * 60) return null;
  return { seconds, minutes: seconds / 60, format, estimated };
}

function parseWav(bytes: Uint8Array): ParsedAudioDuration | null {
  if (bytes.length < 44 || readAscii(bytes, 0, 4) !== "RIFF" || readAscii(bytes, 8, 4) !== "WAVE") return null;
  const view = viewOf(bytes);
  let offset = 12;
  let byteRate = 0;
  while (offset + 8 <= bytes.length) {
    const id = readAscii(bytes, offset, 4);
    const size = view.getUint32(offset + 4, true);
    const body = offset + 8;
    if (id === "fmt " && body + 16 <= bytes.length) {
      byteRate = view.getUint32(body + 8, true);
    } else if (id === "data") {
      if (byteRate > 0) return result(size / byteRate, "wav", false);
      // data before fmt is legal but uncommon; bail out rather than mis-bill.
      return null;
    }
    offset = body + size + (size % 2);
    if (size === 0xffffffff) break;
  }
  return null;
}

const MP3_BITRATES_MPEG1_L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const MP3_BITRATES_MPEG2_L3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
const MP3_SAMPLE_RATES: Record<number, number[]> = {
  3: [44100, 48000, 32000], // MPEG 1
  2: [22050, 24000, 16000], // MPEG 2
  0: [11025, 12000, 8000], // MPEG 2.5
};

function mp3FrameInfo(bytes: Uint8Array, frameStart: number) {
  if (frameStart + 4 > bytes.length) return null;
  const view = viewOf(bytes);
  const b1 = bytes[frameStart + 1];
  const b2 = bytes[frameStart + 2];
  const b3 = bytes[frameStart + 3];
  if (bytes[frameStart] !== 0xff || (b1 & 0xe0) !== 0xe0) return null;
  const versionBits = (b1 >> 3) & 0x03;
  const layerBits = (b1 >> 1) & 0x03;
  if (layerBits !== 0x01) return null; // Layer III only (the format demucs inputs use)
  const bitrateIndex = (b2 >> 4) & 0x0f;
  const sampleRateIndex = (b2 >> 2) & 0x03;
  const padding = (b2 >> 1) & 0x01;
  const channelMode = (b3 >> 6) & 0x03;
  const sampleRates = MP3_SAMPLE_RATES[versionBits];
  if (!sampleRates || bitrateIndex === 0 || bitrateIndex === 15 || sampleRateIndex === 3) return null;
  const bitrateTable = versionBits === 3 ? MP3_BITRATES_MPEG1_L3 : MP3_BITRATES_MPEG2_L3;
  const bitrateKbps = bitrateTable[bitrateIndex];
  const sampleRate = sampleRates[sampleRateIndex];
  const samplesPerFrame = versionBits === 3 ? 1152 : 576;
  const frameLength = Math.floor((samplesPerFrame / 8) * ((bitrateKbps * 1000) / sampleRate)) + padding;
  const sideInfo = versionBits === 3 ? (channelMode === 3 ? 17 : 32) : channelMode === 3 ? 9 : 17;
  return { bitrateKbps, sampleRate, samplesPerFrame, frameLength, sideInfo, view };
}

function parseMp3(bytes: Uint8Array, fileSize: number): ParsedAudioDuration | null {
  let start = 0;
  if (readAscii(bytes, 0, 3) === "ID3" && bytes.length >= 10) {
    const size =
      ((bytes[6] & 0x7f) << 21) | ((bytes[7] & 0x7f) << 14) | ((bytes[8] & 0x7f) << 7) | (bytes[9] & 0x7f);
    start = 10 + size;
  }
  const scanLimit = Math.min(bytes.length - 4, start + 65536);
  for (let frameStart = start; frameStart <= scanLimit; frameStart += 1) {
    const info = mp3FrameInfo(bytes, frameStart);
    if (!info) continue;
    const xing = readAscii(bytes, frameStart + 4 + info.sideInfo, 4);
    if (xing === "Xing" || xing === "Info") {
      const flags = info.view.getUint32(frameStart + 4 + info.sideInfo + 4, false);
      if (flags & 0x01) {
        const frames = info.view.getUint32(frameStart + 4 + info.sideInfo + 8, false);
        if (frames > 0) {
          return result((frames * info.samplesPerFrame) / info.sampleRate, "mp3", false);
        }
      }
    }
    const audioBytes = Math.max(0, fileSize - frameStart);
    if (audioBytes > 0 && info.bitrateKbps > 0) {
      return result((audioBytes * 8) / (info.bitrateKbps * 1000), "mp3", true);
    }
    return null;
  }
  return null;
}

function parseFlac(bytes: Uint8Array): ParsedAudioDuration | null {
  if (bytes.length < 42 || readAscii(bytes, 0, 4) !== "fLaC") return null;
  // STREAMINFO must be the first metadata block (offset 8 = block payload start).
  const data = 8;
  const sampleRate = (bytes[data + 10] << 12) | (bytes[data + 11] << 4) | (bytes[data + 12] >> 4);
  if (sampleRate <= 0) return null;
  const totalSamples =
    (bytes[data + 13] & 0x0f) * 2 ** 32 +
    bytes[data + 14] * 2 ** 24 +
    bytes[data + 15] * 2 ** 16 +
    bytes[data + 16] * 2 ** 8 +
    bytes[data + 17];
  if (!totalSamples) return null;
  return result(totalSamples / sampleRate, "flac", false);
}

function parseMp4(bytes: Uint8Array): ParsedAudioDuration | null {
  // ISO BMFF: walk top-level boxes, look inside moov for mvhd.
  function readBoxSize(view: DataView, offset: number): number {
    if (offset + 8 > view.byteLength) return 0;
    const size = view.getUint32(offset, false);
    if (size === 1 && offset + 16 <= view.byteLength) {
      const high = view.getUint32(offset + 8, false);
      const low = view.getUint32(offset + 12, false);
      return high * 2 ** 32 + low;
    }
    if (size === 0) return view.byteLength - offset;
    return size;
  }

  const view = viewOf(bytes);
  let offset = 0;
  while (offset + 8 <= bytes.length) {
    const size = readBoxSize(view, offset);
    if (size <= 0) break;
    const type = readAscii(bytes, offset + 4, 4);
    if (type === "moov") {
      let inner = offset + 8;
      const end = Math.min(bytes.length, offset + size);
      while (inner + 8 <= end) {
        const innerSize = readBoxSize(view, inner);
        if (innerSize <= 0) break;
        if (readAscii(bytes, inner + 4, 4) === "mvhd") {
          const payload = inner + 8;
          if (payload + 4 > bytes.length) return null;
          const version = bytes[payload];
          const timescale = version === 1 ? view.getUint32(payload + 20, false) : view.getUint32(payload + 12, false);
          const duration =
            version === 1
              ? view.getUint32(payload + 24, false) * 2 ** 32 + view.getUint32(payload + 28, false)
              : view.getUint32(payload + 16, false);
          if (timescale > 0 && duration > 0) return result(duration / timescale, "m4a", false);
          return null;
        }
        inner += innerSize;
      }
      return null;
    }
    offset += size;
  }
  return null;
}

/**
 * Parse the real duration of an audio file from its header.
 *
 * Used by the job-creation route to reject >10-minute uploads and to bill the actual length
 * instead of trusting the browser. `bytes` only needs the first ~1MB; `fileSize` is used for
 * MP3 CBR estimation. Returns null when the format is unsupported/truncated, in which case
 * the caller falls back to a validated client-provided minute count.
 */
export function parseAudioDuration(bytes: Uint8Array, filename = "", fileSize?: number): ParsedAudioDuration | null {
  const lower = filename.toLowerCase();
  const size = Math.max(bytes.length, fileSize ?? 0);
  try {
    if (readAscii(bytes, 0, 4) === "RIFF") return parseWav(bytes);
    if (readAscii(bytes, 0, 4) === "fLaC") return parseFlac(bytes);
    if (readAscii(bytes, 0, 3) === "ID3" || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)) return parseMp3(bytes, size);
    if (lower.endsWith(".mp3")) return parseMp3(bytes, size);
    if (lower.endsWith(".m4a") || readAscii(bytes, 4, 4) === "ftyp") return parseMp4(bytes);
    if (lower.endsWith(".wav")) return parseWav(bytes);
    return null;
  } catch {
    return null;
  }
}
