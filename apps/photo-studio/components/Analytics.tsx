"use client";

import { useEffect } from "react";

/**
 * Analytics.tsx — 无侵入（zero-touch）产品分析挂载点。
 *
 * 1) Cloudflare Web Analytics：只有配置了 NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN 才注入
 *    beacon；没配就 no-op，绝不伪造 GA/CF ID。
 * 2) 事件埋点：不修改任何业务组件，用 fetch 观察器 + 下载链接 click 捕获，覆盖
 *    checkout_started / paid / job_started / job_done / download_clicked，发到
 *    /api/events（服务端落 R2 events/<site>/<date>/）。
 * 3) 不采集 PII：只发事件名、页面路径、订单/任务 id、文件扩展名；不读输入框、不读
 *    签名下载 URL（避免把 R2 签名带进日志）。
 * 4) 任何异常都必须吞掉——统计不能影响上传/支付主流程。
 */

export type AnalyticsSite = "voice" | "headshot" | "landscape" | "haircolor";

type Props = Record<string, string | number | boolean>;

interface TrackPayload {
  event: string;
  site: AnalyticsSite;
  path?: string;
  orderId?: string;
  jobId?: string;
  ts?: number;
  props?: Props;
}

const JOB_DONE_STATUSES = new Set(["done", "completed", "succeeded"]);
const BEACON_SRC = "https://static.cloudflareinsights.com/beacon.min.js";

function post(payload: TrackPayload): void {
  const body = JSON.stringify(payload);
  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      if (navigator.sendBeacon("/api/events", new Blob([body], { type: "text/plain;charset=UTF-8" }))) return;
    }
  } catch {
    /* fall through to fetch */
  }
  try {
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* analytics must never break the page */
  }
}

function readJson(res: Response): Promise<Record<string, unknown> | null> {
  return res
    .clone()
    .json()
    .then((value: unknown) => (value && typeof value === "object" ? (value as Record<string, unknown>) : null))
    .catch(() => null);
}

function requestMethod(input: RequestInfo | URL, init?: RequestInit): string {
  if (init?.method) return init.method.toUpperCase();
  if (typeof input === "object" && input !== null && "method" in input) {
    const method = (input as Request).method;
    if (method) return method.toUpperCase();
  }
  return "GET";
}

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

function isDownloadAnchor(anchor: HTMLAnchorElement): boolean {
  if (anchor.hasAttribute("download")) return true;
  try {
    const url = new URL(anchor.href, window.location.origin);
    if (/\/download\/?$/i.test(url.pathname)) return true;
    return /\.(mp3|wav|m4a|flac|ogg|zip|jpe?g|png|webp)$/i.test(url.pathname);
  } catch {
    return false;
  }
}

declare global {
  interface Window {
    __paidTrack?: (event: string, props?: Props) => void;
  }
}

export function Analytics({ site }: { site: AnalyticsSite }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1) Cloudflare Web Analytics beacon（无 token 时完全 no-op）
    const beaconToken = process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN;
    if (beaconToken && !document.querySelector("script[data-cf-beacon]")) {
      const script = document.createElement("script");
      script.defer = true;
      script.src = BEACON_SRC;
      script.setAttribute("data-cf-beacon", JSON.stringify({ token: beaconToken }));
      document.head.appendChild(script);
    }

    const globalWindow = window as unknown as {
      __paidAnalytics?: { site: AnalyticsSite };
      __paidTrack?: (event: string, props?: Props) => void;
    };
    if (globalWindow.__paidAnalytics) return;
    globalWindow.__paidAnalytics = { site };

    const seen = new Set<string>();
    const emit = (event: string, extra?: Omit<Partial<TrackPayload>, "event" | "site">): void => {
      post({ event, site, path: window.location.pathname, ts: Date.now(), ...extra });
    };
    const once = (key: string, event: string, extra?: Omit<Partial<TrackPayload>, "event" | "site">): void => {
      if (seen.has(key)) return;
      seen.add(key);
      emit(event, extra);
    };

    globalWindow.__paidTrack = (event: string, props?: Props): void => emit(event, { props });

    // 2) fetch 观察器：零侵入覆盖 checkout / 生成 / 支付 / 任务完成
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const method = requestMethod(input, init);
      const rawUrl = requestUrl(input);
      let pathname = rawUrl;
      try {
        pathname = new URL(rawUrl, window.location.origin).pathname;
      } catch {
        /* keep raw */
      }
      const response = await originalFetch(input as RequestInfo, init);
      try {
        if (method === "POST" && pathname === "/api/checkout") {
          const data = await readJson(response);
          const orderId = typeof data?.orderId === "string" ? data.orderId : undefined;
          once(`checkout_started:${orderId ?? "session"}`, "checkout_started", { path: pathname, orderId });
        } else if (method === "POST" && (pathname === "/api/jobs" || pathname === "/api/orders")) {
          const data = await readJson(response);
          const jobId = typeof data?.id === "string" ? data.id : undefined;
          once(`job_started:${jobId ?? "session"}`, "job_started", { jobId });
        } else if (method === "GET" && (pathname === "/api/orders/reconcile" || pathname === "/api/orders/status")) {
          const data = await readJson(response);
          const orderId = typeof data?.id === "string" ? data.id : undefined;
          const status = typeof data?.status === "string" ? data.status : "";
          if (status === "paid") once(`paid:${orderId ?? "session"}`, "paid", { orderId });
        } else if (method === "GET" && (/^\/api\/jobs\/[^/]+$/.test(pathname) || /^\/api\/orders\/[^/]+$/.test(pathname))) {
          const data = await readJson(response);
          const status = typeof data?.status === "string" ? data.status : "";
          const jobId = typeof data?.id === "string" ? data.id : pathname.split("/").pop();
          if (jobId && JOB_DONE_STATUSES.has(status)) once(`job_done:${jobId}`, "job_done", { jobId });
        }
      } catch {
        /* observation errors must not affect the caller */
      }
      return response;
    };

    // 3) 下载点击（结果页 <a download> / 文件直链；只记录扩展名，不记录签名 URL）
    const onClick = (event: MouseEvent): void => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!isDownloadAnchor(anchor)) return;
      let ext = "unknown";
      try {
        const url = new URL(anchor.href, window.location.origin);
        const match = /\.([a-z0-9]{1,5})$/i.exec(url.pathname);
        if (match?.[1]) ext = match[1].toLowerCase();
      } catch {
        /* keep unknown */
      }
      emit("download_clicked", { props: { ext } });
    };
    document.addEventListener("click", onClick, true);

    return () => {
      window.fetch = originalFetch;
      document.removeEventListener("click", onClick, true);
      delete globalWindow.__paidAnalytics;
    };
  }, [site]);

  return null;
}
