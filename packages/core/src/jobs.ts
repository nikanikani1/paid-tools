import type { Job, JobKind } from "./types";

/**
 * 内存 job store（仅 mock/开发用）。
 * 生产必须换 Postgres task 表；接口保持 create/get/update 三个方法，便于替换。
 */
const globalStore = globalThis as unknown as { __paidJobs?: Map<string, Job> };
const store: Map<string, Job> = globalStore.__paidJobs ?? (globalStore.__paidJobs = new Map());

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
