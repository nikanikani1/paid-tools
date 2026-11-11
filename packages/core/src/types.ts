export type JobKind = "voice" | "headshot";

export type JobStatus = "queued" | "running" | "done" | "failed";

export interface JobFile {
  name: string;
  url: string;
  size?: number;
}

export interface Job {
  id: string;
  kind: JobKind;
  status: JobStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
  input: Record<string, unknown>;
  files: JobFile[];
  error?: string;
  meta?: Record<string, unknown>;
}

export interface VoicePlan {
  id: string;
  name: string;
  price: number;
  minutes: number;
  billing: "monthly" | "annual" | "one-time";
  features: string[];
  popular?: boolean;
}

export interface HeadshotPlan {
  id: string;
  name: string;
  price: number;
  images: number;
  features: string[];
  popular?: boolean;
}
