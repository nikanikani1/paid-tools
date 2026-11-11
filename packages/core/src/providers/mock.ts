import { createJob, updateJob } from "../jobs";
import type { Job, JobFile } from "../types";

const MOCK_VOICE_MS = 3500;
const MOCK_HEADSHOT_MS = 5000;

function file(name: string): JobFile {
  return { name, url: `/mock/${name}`, size: 1024 * 1024 };
}

export function createMockVoiceJob(input: Record<string, unknown>): Job {
  const job = createJob("voice", input);
  return updateJob(job.id, { meta: { mock: true, durationMs: MOCK_VOICE_MS, stems: 4 } })!;
}

export function createMockHeadshotJob(input: Record<string, unknown>): Job {
  const count = typeof input.images === "number" ? input.images : 40;
  const job = createJob("headshot", input);
  return updateJob(job.id, { meta: { mock: true, durationMs: MOCK_HEADSHOT_MS, count } })!;
}

/** 根据 elapsed 推进 mock 状态；GET /api/jobs/[id] 每次调用它 */
export function advanceMockJob(job: Job): Job {
  if (!job.meta?.mock || job.status === "done" || job.status === "failed") return job;
  const duration = Number(job.meta.durationMs ?? 4000);
  const elapsed = Date.now() - new Date(job.createdAt).getTime();
  if (elapsed >= duration) {
    const count = Number(job.meta.count ?? 0);
    const files: JobFile[] =
      job.kind === "voice"
        ? ["vocals.mp3", "instrumental.mp3", "drums.mp3", "bass.mp3", "other.mp3"].map(file)
        : Array.from({ length: count }, (_, i) => file(`headshot-${String(i + 1).padStart(2, "0")}.jpg`));
    return updateJob(job.id, { status: "done", progress: 100, files })!;
  }
  const progress = Math.min(95, Math.round((elapsed / duration) * 100));
  return updateJob(job.id, { status: "running", progress })!;
}

export function hasRealProviders(): boolean {
  return Boolean(process.env.REPLICATE_API_TOKEN || process.env.FAL_KEY);
}
