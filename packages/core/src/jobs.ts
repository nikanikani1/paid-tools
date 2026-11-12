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
