import { NextResponse } from "next/server";
import {
  VOICE_PLANS,
  buildObjectKey,
  confirmOrderAllowance,
  getJob,
  getOrder,
  getPersistedJob,
  getR2Config,
  isR2Configured,
  orderUsage,
  presignGet,
  refundOrderAllowance,
  releaseStaleOrderReservations,
  type Job,
} from "@paid/core";

const SITE = "voice" as const;
const ORDER_ID_RE = /^[A-Za-z0-9_-]{6,80}$/;
const LINK_LIFETIME_DAYS = 7;
const LINK_LIFETIME_SECONDS = LINK_LIFETIME_DAYS * 24 * 60 * 60;
const RETENTION_DAYS = 30;
const MOCK_PREFIXES = ["/mock/", "mock://"];

type DownloadFile = {
  jobId: string;
  name: string;
  available: boolean;
  url?: string;
  expiresAt?: string;
  reason?: string;
};

function r2KeyFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith("r2.cloudflarestorage.com")) return null;
    let key = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
    const bucket = getR2Config()?.bucket;
    if (bucket && key.startsWith(`${bucket}/`)) key = key.slice(bucket.length + 1);
    return key || null;
  } catch {
    return null;
  }
}

function jobFileKey(job: Job, fileName: string): string {
  const mapped = job.meta?.r2Keys;
  if (mapped && typeof mapped === "object") {
    const value = (mapped as Record<string, unknown>)[fileName];
    if (typeof value === "string" && value) return value;
  }
  const headshotKey = job.meta?.r2Key;
  if (typeof headshotKey === "string" && /\.(jpg|jpeg|png)$/i.test(fileName)) return headshotKey;
  for (const file of job.files) {
    if (file.name !== fileName) continue;
    if (file.url && !MOCK_PREFIXES.some((prefix) => file.url.startsWith(prefix))) {
      const fromUrl = r2KeyFromUrl(file.url);
      if (fromUrl) return fromUrl;
    }
  }
  // Deterministic fallback for jobs rendered before r2Keys was persisted:
  // every voice output is stored under <site>/out/<job creation day>/<jobId>/<name>.
  return buildObjectKey(SITE, "out", job.id, fileName, new Date(job.createdAt));
}

/**
 * GET /api/orders/[id]/files
 *
 * Order-recovery download endpoint. Re-signs R2 URLs for every job that belongs to this
 * order — links are never stored in the order (they expire after 7 days). Opening the order
 * page again always produces fresh links. When R2 is not configured the order/job metadata
 * is still returned with `downloadsAvailable: false` instead of throwing.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!ORDER_ID_RE.test(id)) {
    return NextResponse.json({ error: "invalid_order_id" }, { status: 400 });
  }
  const initial = await getOrder(SITE, id);
  if (!initial) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Housekeeping: settle reservations against the persisted job state before showing usage.
  // The poll route normally does this; a Worker restart between the final poll and the
  // settle write is recovered here (and by the stale-reservation sweep below).
  const jobs: Job[] = [];
  const protectedReservations: string[] = [];
  for (const jobId of initial.jobIds ?? []) {
    if (!/^[A-Za-z0-9_-]{4,80}$/.test(jobId)) continue;
    const job = getJob(jobId) ?? (await getPersistedJob(jobId));
    if (!job || job.kind !== "voice") continue;
    jobs.push(job);
    const reservationId = typeof job.input.reservationId === "string" ? job.input.reservationId : null;
    if (!reservationId) continue;
    if (job.status === "done" || job.status === "running" || job.status === "queued") {
      protectedReservations.push(reservationId);
    }
    if (job.status === "done") await confirmOrderAllowance(SITE, id, reservationId).catch(() => null);
    if (job.status === "failed") await refundOrderAllowance(SITE, id, reservationId, "job failed").catch(() => null);
  }
  const stale = await releaseStaleOrderReservations(SITE, id, 60 * 60 * 1000, protectedReservations).catch(() => null);
  const order = (await getOrder(SITE, id)) ?? initial;
  const usage = orderUsage(order);
  const paid = order.status === "paid";
  const r2Ready = isR2Configured();
  const planName = VOICE_PLANS.find((plan) => plan.id === order.planId)?.name ?? order.planId;

  const files: DownloadFile[] = [];
  const jobSummaries = await Promise.all(
    jobs.map(async (job) => {
      const entries: DownloadFile[] = await Promise.all(
        job.files.map(async (file) => {
          if (!paid) {
            return { jobId: job.id, name: file.name, available: false, reason: "order_not_paid" };
          }
          if (!r2Ready) {
            return { jobId: job.id, name: file.name, available: false, reason: "r2_not_configured" };
          }
          if (MOCK_PREFIXES.some((prefix) => file.url.startsWith(prefix))) {
            return { jobId: job.id, name: file.name, available: false, reason: "mock_delivery_not_stored" };
          }
          const key = jobFileKey(job, file.name);
          try {
            const signed = await presignGet(key, { expiresIn: LINK_LIFETIME_SECONDS, strict: true });
            return {
              jobId: job.id,
              name: file.name,
              available: true,
              url: signed.url,
              expiresAt: signed.expiresAt,
            };
          } catch {
            return { jobId: job.id, name: file.name, available: false, reason: "r2_sign_failed" };
          }
        }),
      );
      files.push(...entries);
      return {
        id: job.id,
        status: job.status,
        progress: job.progress,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        ...(job.error ? { error: job.error } : {}),
        files: entries.map(({ name, available }) => ({ name, available })),
      };
    }),
  );

  const warning = !paid
    ? "This order is not paid yet — download links are created once the payment is confirmed."
    : !r2Ready
      ? "Download storage is not configured on this deployment (R2 is missing). The order and job records are shown, but files cannot be re-signed right now."
      : undefined;

  return NextResponse.json(
    {
      order: {
        id: order.id,
        site: order.site,
        status: order.status,
        planId: order.planId,
        planName,
        amountCents: order.amountCents,
        currency: order.currency,
        createdAt: order.createdAt,
        paidAt: order.paidAt ?? null,
        refundedAt: order.refundedAt ?? null,
      },
      usage,
      jobIds: order.jobIds ?? [],
      jobs: jobSummaries,
      files,
      downloadsAvailable: paid && r2Ready,
      warning,
      linkLifetimeDays: LINK_LIFETIME_DAYS,
      retentionDays: RETENTION_DAYS,
      staleReservationsReleased: stale?.released ?? 0,
      generatedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
