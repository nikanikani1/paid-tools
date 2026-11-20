/**
 * job-service.ts — persistence + provider glue for the photo-studio brands.
 *
 * Why this file exists instead of calling the core job helpers directly:
 *  - `buildObjectKey()` in core is still typed for voice/headshot only, so the
 *    landscape/haircolor output keys are built here with the exact same layout
 *    (`<site>/out/<YYYY-MM-DD>/<jobId>/<file>`).
 *  - `getPersistedJob()` in core only scans the voice/headshot prefixes. This
 *    module restores studio jobs from R2 directly, which is what keeps a job
 *    alive when the Worker isolate is evicted between POST and the next poll.
 *
 * Everything else (orders, allowance reservations, R2 signing) goes through
 * `@paid/core` so behaviour matches the other two sites.
 */
import {
  createJob,
  getJob,
  isR2Configured,
  isReplicateConfigured,
  isReplicateThrottleError,
  persistJob,
  presignGet,
  presignPut,
  r2DownloadUrl,
  r2PutObject,
  replicateFetch,
  updateJob,
  createFluxKontextPrediction,
  type Job,
  type JobKind,
} from "@paid/core";
import { brandForKind, type SiteKind } from "./brands";

/** Every studio pack grants exactly four images. */
export const PACK_UNITS = 4;
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
export const MAX_UPLOAD_MB = 15;

export function isStudioKind(value: unknown): value is SiteKind {
  return value === "landscape" || value === "haircolor";
}

export function siteForKind(kind: SiteKind) {
  return brandForKind(kind).site;
}

export function kindForJob(job: Job): SiteKind | null {
  return isStudioKind(job.kind) ? job.kind : null;
}

/** Output filenames shown to the customer (matches the brand's vocabulary). */
export function outputNameFor(kind: SiteKind, index: number): string {
  return kind === "haircolor" ? `look-${index + 1}.png` : `concept-${index + 1}.png`;
}

/** Validate the shape of a job created by POST /api/jobs. */
export function readJobInput(job: Job): {
  orderId: string;
  reservationId: string;
  style: string;
  predictionIds: string[];
} | null {
  const input = job.input ?? {};
  const orderId = typeof input.orderId === "string" ? input.orderId : "";
  const reservationId = typeof input.reservationId === "string" ? input.reservationId : "";
  const style = typeof input.style === "string" ? input.style : "";
  const raw = input.predictionIds;
  if (!orderId || !reservationId || !Array.isArray(raw)) return null;
  const predictionIds = raw.filter((id): id is string => typeof id === "string" && id.length > 0);
  if (predictionIds.length === 0) return null;
  return { orderId, reservationId, style, predictionIds };
}

export function studioJobKey(kind: SiteKind, jobId: string): string {
  return `jobs/${kind}/${jobId}.json`;
}

/**
 * Same object layout as core `buildObjectKey` (which currently only accepts
 * voice/headshot), so existing R2 lifecycle rules still apply.
 */
export function buildOutputKey(kind: SiteKind, jobId: string, filename: string, at: Date = new Date()): string {
  const safeJob = jobId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || "job";
  const safeName =
    filename
      .normalize("NFKD")
      .replace(/[^\w.-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^[-.]+/, "")
      .slice(0, 96) || "file";
  return `${kind}/out/${at.toISOString().slice(0, 10)}/${safeJob}/${safeName}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Persist a job JSON straight to R2 (no core memory dependency). */
async function writeJobToR2(job: Job): Promise<boolean> {
  const kind = kindForJob(job);
  if (!kind || !isR2Configured()) return false;
  try {
    const body = JSON.stringify(job);
    const signed = await presignPut(studioJobKey(kind, job.id), {
      expiresIn: 300,
      contentType: "application/json",
      strict: true,
    });
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

/** Create the job in the core in-memory store and persist it for cross-isolate reads. */
export async function createStudioJob(kind: SiteKind, input: Record<string, unknown>): Promise<Job> {
  const job = createJob(kind as JobKind, input);
  await persistJob(job.id);
  await writeJobToR2(job);
  return getJob(job.id) ?? job;
}

/** Memory first, then the R2 record (survives isolate eviction). */
export async function loadStudioJob(kind: SiteKind, id: string): Promise<Job | undefined> {
  const inMemory = getJob(id);
  if (inMemory) return inMemory;
  if (!isR2Configured()) return undefined;
  try {
    const signed = await presignGet(studioJobKey(kind, id), { expiresIn: 120, strict: true });
    const res = await fetch(signed.url, { cache: "no-store" });
    if (!res.ok) return undefined;
    const loaded = (await res.json()) as Job;
    return loaded && loaded.id === id ? loaded : undefined;
  } catch {
    return undefined;
  }
}

/** Merge a patch into the job and persist it to both memory (when present) and R2. */
export async function patchStudioJob(kind: SiteKind, id: string, patch: Partial<Job>): Promise<Job | undefined> {
  const inMemory = getJob(id);
  let next: Job | undefined;
  if (inMemory) {
    next = updateJob(id, patch);
    if (next) await persistJob(next.id);
  }
  if (!next) {
    const current = await loadStudioJob(kind, id);
    if (!current) return undefined;
    next = {
      ...current,
      ...patch,
      id: current.id,
      kind: current.kind,
      updatedAt: new Date().toISOString(),
    } as Job;
  }
  await writeJobToR2(next);
  return next;
}

export interface StoredFile {
  name: string;
  url: string;
  size?: number;
  r2Key?: string;
}

/**
 * Copy a provider image into R2 and return a signed download URL.
 * Falls back to the provider URL when R2 is not configured or the copy fails
 * twice (the caller records that in job meta instead of failing the delivery).
 */
export async function storeGeneratedImage(
  kind: SiteKind,
  jobId: string,
  filename: string,
  sourceUrl: string,
): Promise<StoredFile> {
  const key = buildOutputKey(kind, jobId, filename);
  let lastBytes = 0;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const upstream = await fetch(sourceUrl, { signal: AbortSignal.timeout(60_000) });
      if (upstream.ok) {
        const bytes = await upstream.arrayBuffer();
        lastBytes = bytes.byteLength;
        const stored = await r2PutObject(key, bytes, "image/png");
        if (stored) {
          const signed = await r2DownloadUrl(key);
          if (signed) return { name: filename, url: signed, size: lastBytes, r2Key: key };
        }
      }
    } catch {
      /* retry below */
    }
    await sleep(700 * (attempt + 1));
  }
  return { name: filename, url: sourceUrl, size: lastBytes || undefined };
}

// ---------------------------------------------------------------------------
// Provider helpers (Replicate Files + flux-kontext-pro, both from @paid/core)
// ---------------------------------------------------------------------------

/** Upload the source photo to Replicate Files and return its URL. */
export async function uploadSourcePhoto(file: File, token: string): Promise<string> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const form = new FormData();
      form.append("content", file, file.name || (file.type === "image/png" ? "photo.png" : "photo.jpg"));
      const res = await replicateFetch("https://api.replicate.com/v1/files", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const retryable = res.status === 429 || res.status >= 500;
        const error = new Error(`file upload failed (${res.status}): ${text.slice(0, 200)}`);
        if (!retryable) throw error;
        lastError = error;
        const retryAfter = text.match(/retry_after["']?\s*:\s*(\d+(?:\.\d+)?)/i);
        await sleep(retryAfter ? Math.ceil(Number(retryAfter[1]) * 1000) + 300 : 1200 * 2 ** attempt);
        continue;
      }
      const data = (await res.json()) as { urls?: { get?: string } };
      if (!data.urls?.get) throw new Error("file upload returned no URL");
      return data.urls.get;
    } catch (error) {
      lastError = error;
      if (attempt === 2) break;
      await sleep(1200 * 2 ** attempt);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function sleepForThrottle(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, Math.min(Math.max(ms, 250), 15_000)));
}

/**
 * Create one flux-kontext-pro prediction per prompt. A Replicate 429 is an
 * account-level gate shared with the other sites: wait out `retry_after`
 * instead of failing the purchase.
 */
export async function createConceptPredictions(
  prompts: string[],
  imageUrl: string,
  aspectRatio: "1:1" | "3:2" | "16:9" = "1:1",
): Promise<string[]> {
  const ids: string[] = [];
  const deadline = Date.now() + 120_000;
  for (const prompt of prompts) {
    for (;;) {
      try {
        const prediction = await createFluxKontextPrediction(prompt, imageUrl, aspectRatio);
        ids.push(prediction.id);
        break;
      } catch (error) {
        if (isReplicateThrottleError(error) && Date.now() + error.retryAfterMs < deadline) {
          await sleepForThrottle(error.retryAfterMs + 250);
          continue;
        }
        throw error;
      }
    }
  }
  return ids;
}

export function replicateConfigured(): boolean {
  return isReplicateConfigured();
}
