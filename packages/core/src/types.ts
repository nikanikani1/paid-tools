export type JobKind = "voice" | "headshot" | "landscape" | "haircolor";

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

/** Generic one-time image pack used by the newer photo tools. */
export interface ImagePackPlan {
  id: string;
  name: string;
  price: number;
  images: number;
  billing: "one-time";
  features: string[];
  popular?: boolean;
}
