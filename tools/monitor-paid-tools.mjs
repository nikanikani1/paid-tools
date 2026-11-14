#!/usr/bin/env node
/**
 * tools/monitor-paid-tools.mjs — paid-tools 两站监控（只读）
 *
 * 覆盖（与 docs/OPS-MONITORING.md 的指标编号对应）：
 *   1) 可用性：/、/pricing、/orders、/api/version、/api/events、/sitemap.xml、/robots.txt
 *   2) 付费闸门：POST /api/jobs（voice）/ POST /api/orders（headshot）必须 402（不得 2xx）
 *   3) 已知订单：/api/orders/status?order=<id> 与 R2 订单记录状态一致
 *   4) 订单/收入：R2 前缀 orders/<site>/ 只读统计 paid/refunded/pending/failed、checkout→paid、净收入
 *   5) 失败率：订单 failed 占比；Cloudflare GraphQL workersInvocationsAdaptive 的 errors/requests（有 token 时）
 *   6) 事件通道：R2 events/<site>/<date>/ 对象数（事件量异常检测的代理指标）
 *
 * 输出：
 *   - stdout: 纯 JSON（可重定向保存；不含任何密钥/PII）
 *   - stderr: 人类可读摘要
 *   - FEISHU_WEBHOOK（或 MONITOR_FEISHU_WEBHOOK）存在时推送文本摘要；不存在则标记 skipped
 *
 * 退出码（明确阈值见 docs/OPS-MONITORING.md §8）：
 *   0 = ok（全部通过，允许 info）
 *   1 = warn（站点/API 仍可用，但出现慢响应、sitemap 数量异常、事件通道 r2=false、CF 5xx>1%、订单状态不一致等）
 *   2 = critical（站点非 200 / 付费闸门被打开（2xx）/ sitemap 不可用 / version service 不匹配 / 订单状态 API 500）
 *
 * 安全约束：
 *   - 只读：不创建订单、不创建 job、不写 R2、不删任何东西；两个 POST 探针在「无付费订单」时必然 402，不产生副作用
 *   - 不采集 PII：R2 订单只取 status/amountCents/planId/时间戳，绝不输出 email / provider 会话 / 用户文件
 *   - 不打印密钥：只输出「是否配置」
 *
 * 用法：
 *   node tools/monitor-paid-tools.mjs                 # JSON 到 stdout + 摘要到 stderr
 *   node tools/monitor-paid-tools.mjs --quiet         # 只输出 JSON
 *   node tools/monitor-paid-tools.mjs --probe-r2      # 只做 R2 只读连通性自检
 *   node tools/monitor-paid-tools.mjs --no-proxy      # 强制直连（CI 默认会自动走直连）
 *   node tools/monitor-paid-tools.mjs --proxy=http://127.0.0.1:7897
 *   node tools/monitor-paid-tools.mjs > .tmp/monitor.json
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { connect } from "node:net";
import { request as undiciRequest, ProxyAgent } from "undici";

const MONITOR_VERSION = 1;
const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"); // repo root（Windows 盘符修正）
const ENV_FILE = `${ROOT.replace(/\/$/, "")}/.env.local`;

// ---------------------------------------------------------------------------
// 阈值（唯一来源；docs/OPS-MONITORING.md §8 与此保持一致）
// ---------------------------------------------------------------------------
const THRESHOLDS = {
  pageSlowMs: 2500, // 页面/API 慢响应 → warn
  apiSlowMs: 1500, // /api/* 慢响应 → warn
  sitemapMinUrls: 16, // 两站 sitemap 目前都是 16 条；少于即 warn
  orderApiStatusCode: 200, // 订单状态 API 必须 200
  cloudflare5xxRateWarn: 0.01, // 24h errors/requests > 1% → warn
  cloudflare5xxRateCritical: 0.05, // > 5% → critical
  gateExpectStatus: 402, // 付费闸门：无订单时必须 402（2xx = 免费口子被打开 = critical）
  maxOrderPages: 20, // R2 分页上限，防止异常放大
};

// ---------------------------------------------------------------------------
// CLI / env
// ---------------------------------------------------------------------------
const ARGV = process.argv.slice(2);
const FLAG = {
  quiet: ARGV.includes("--quiet"),
  noProxy: ARGV.includes("--no-proxy"),
  probeR2: ARGV.includes("--probe-r2"),
  proxy: (ARGV.find((a) => a.startsWith("--proxy=")) || "").slice("--proxy=".length) || "",
  jsonOut: (ARGV.find((a) => a.startsWith("--json-out=")) || "").slice("--json-out=".length) || "",
  mdOut: (ARGV.find((a) => a.startsWith("--md-out=")) || "").slice("--md-out=".length) || "",
};

function loadEnvFile(file) {
  if (!existsSync(file)) return {};
  const out = {};
  for (const raw of readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i <= 0) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    out[key] = val;
  }
  return out;
}

/** .env.local 只补空缺，不覆盖真实环境变量（CI 用 secrets 注入时优先） */
const fileEnv = loadEnvFile(ENV_FILE);
const env = (name, fallback = "") => process.env[name] ?? fileEnv[name] ?? fallback;
const envFlag = (name) => Boolean(env(name));

function tcpProbe(host, port, timeoutMs = 600) {
  return new Promise((resolve) => {
    const socket = connect({ host, port });
    const done = (ok) => {
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
  });
}

async function resolveProxy() {
  if (FLAG.noProxy) return { used: false, source: "disabled by --no-proxy" };
  if (FLAG.proxy) return { used: true, url: FLAG.proxy, source: "--proxy flag" };
  for (const name of ["MONITOR_PROXY", "HTTPS_PROXY", "https_proxy", "HTTP_PROXY", "http_proxy"]) {
    if (env(name)) return { used: true, url: env(name), source: name };
  }
  // 本机开发：直连被网络策略挡住时自动识别本地代理端口（CI runner 上该端口不存在 → 直连）
  if (await tcpProbe("127.0.0.1", 7897)) {
    return { used: true, url: "http://127.0.0.1:7897", source: "auto-detect 127.0.0.1:7897" };
  }
  return { used: false, source: "direct" };
}

// ---------------------------------------------------------------------------
// HTTP（undici 低层 request：允许签名所需的 host 头；支持代理与超时）
// ---------------------------------------------------------------------------
let dispatcher = null;
async function httpRequest(url, { method = "GET", headers = {}, body = null, timeoutMs = 20000 } = {}) {
  // 连接级失败（超时/ECONNRESET/代理抖动）重试一次，避免 cron 因单次网络抖动误报 critical。
  // HTTP 状态码（4xx/5xx）不重试——那是真实信号。
  const attempt = async () => {
    const started = Date.now();
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);
    try {
      const res = await undiciRequest(url, {
        method,
        headers,
        body: body ?? undefined,
        signal: ac.signal,
        ...(dispatcher ? { dispatcher } : {}),
        maxRedirections: 5,
      });
      const text = await res.body.text();
      return { status: res.statusCode, headers: res.headers, text, ms: Date.now() - started };
    } finally {
      clearTimeout(timer);
    }
  };
  try {
    return await attempt();
  } catch (e) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      return await attempt();
    } catch (e2) {
      e2.message = `${e2.message} (retried once)`;
      throw e2;
    }
  }
}

async function getJson(url) {
  const r = await httpRequest(url, { headers: { accept: "application/json" } });
  let json = null;
  try {
    json = JSON.parse(r.text);
  } catch {
    json = null;
  }
  return { ...r, json };
}

// ---------------------------------------------------------------------------
// 检查记录
// ---------------------------------------------------------------------------
const checks = [];
function addCheck(c) {
  checks.push({
    id: c.id,
    site: c.site ?? "both",
    kind: c.kind,
    target: c.target,
    status: c.status, // pass | warn | fail | skipped
    httpStatus: c.httpStatus ?? null,
    ms: c.ms ?? null,
    expected: c.expected ?? null,
    observed: c.observed ?? null,
    detail: c.detail ?? null,
  });
}

function siteConfig() {
  return [
    {
      site: "voice",
      label: "A voice",
      base: (env("MONITOR_SITE_VOICE") || env("NEXT_PUBLIC_SITE_URL_VOICE") || "https://stemextractor.com").replace(/\/$/, ""),
      versionService: "voice",
      gate: { path: "/api/jobs", body: JSON.stringify({ filename: "monitor-probe.mp3", minutes: 1 }) },
      knownOrders: (env("MONITOR_KNOWN_ORDER_VOICE") || "ord_mwfzkg8h_yy9s9md:refunded,ord_mwggroyd_1q2v4v3:refunded")
        .split(",")
        .filter(Boolean)
        .map((pair) => {
          const [id, expected] = pair.split(":");
          return { id, expected: expected || null };
        }),
    },
    {
      site: "headshot",
      label: "B headshot",
      base: (env("MONITOR_SITE_HEADSHOT") || env("NEXT_PUBLIC_SITE_URL_HEADSHOT") || "https://headshotsnap.com").replace(/\/$/, ""),
      versionService: "headshot",
      gate: { path: "/api/orders", body: JSON.stringify({ files: 3, images: 5 }) },
      knownOrders: (env("MONITOR_KNOWN_ORDER_HEADSHOT") || "")
        .split(",")
        .filter(Boolean)
        .map((pair) => {
          const [id, expected] = pair.split(":");
          return { id, expected: expected || null };
        }),
    },
  ];
}

// ---------------------------------------------------------------------------
// 站点检查
// ---------------------------------------------------------------------------
async function checkSite(cfg) {
  const B = cfg.base;

  for (const [path, id] of [
    ["/", "home"],
    ["/pricing", "pricing"],
    ["/orders", "orders_page"],
  ]) {
    try {
      const r = await httpRequest(`${B}${path}`, { headers: { "user-agent": "paid-tools-monitor/1" } });
      const slow = r.ms > THRESHOLDS.pageSlowMs;
      const pass = r.status === 200;
      addCheck({
        id: `${cfg.site}.page.${id}`,
        site: cfg.site,
        kind: "page",
        target: `${B}${path}`,
        status: pass ? (slow ? "warn" : "pass") : "fail",
        httpStatus: r.status,
        ms: r.ms,
        expected: "200",
        observed: String(r.status),
        detail: pass ? (slow ? `slow > ${THRESHOLDS.pageSlowMs}ms` : null) : `body head: ${r.text.slice(0, 120).replace(/\s+/g, " ")}`,
      });
    } catch (e) {
      addCheck({
        id: `${cfg.site}.page.${id}`,
        site: cfg.site,
        kind: "page",
        target: `${B}${path}`,
        status: "fail",
        detail: `network error: ${String(e.message || e).slice(0, 200)}`,
      });
    }
  }

  // /api/version
  try {
    const r = await getJson(`${B}/api/version`);
    const j = r.json || {};
    const serviceOk = j.service === cfg.versionService;
    const statusOk = j.status === "ok";
    addCheck({
      id: `${cfg.site}.api.version`,
      site: cfg.site,
      kind: "api",
      target: `${B}/api/version`,
      status: r.status === 200 && serviceOk && statusOk ? "pass" : "fail",
      httpStatus: r.status,
      ms: r.ms,
      expected: `200 service=${cfg.versionService} status=ok`,
      observed: `${r.status} service=${j.service ?? "-"} status=${j.status ?? "-"} commit=${j.commit ?? "-"}`,
      detail: j.commit === "dev" ? "commit=dev（部署未注入 GIT_COMMIT，无法用线上 commit 对账 HEAD）" : null,
    });
  } catch (e) {
    addCheck({ id: `${cfg.site}.api.version`, site: cfg.site, kind: "api", target: `${B}/api/version`, status: "fail", detail: String(e.message || e).slice(0, 200) });
  }

  // /api/events（GET = 事件通道健康检查，r2:true 才算持久化可用）
  try {
    const r = await getJson(`${B}/api/events`);
    const j = r.json || {};
    const httpOk = r.status === 200;
    const r2Ok = j.r2 === true;
    addCheck({
      id: `${cfg.site}.api.events`,
      site: cfg.site,
      kind: "api",
      target: `${B}/api/events`,
      status: !httpOk ? "fail" : r2Ok ? "pass" : "warn",
      httpStatus: r.status,
      ms: r.ms,
      expected: "200 r2=true",
      observed: `${r.status} r2=${j.r2}`,
      detail: r2Ok ? null : "事件只会进 stdout 日志，不会落 R2（检查 Worker secrets / R2 绑定）",
    });
  } catch (e) {
    addCheck({ id: `${cfg.site}.api.events`, site: cfg.site, kind: "api", target: `${B}/api/events`, status: "fail", detail: String(e.message || e).slice(0, 200) });
  }

  // sitemap / robots
  try {
    const r = await httpRequest(`${B}/sitemap.xml`);
    const locs = (r.text.match(/<loc>/g) || []).length;
    const ok = r.status === 200 && locs >= THRESHOLDS.sitemapMinUrls;
    addCheck({
      id: `${cfg.site}.sitemap`,
      site: cfg.site,
      kind: "seo",
      target: `${B}/sitemap.xml`,
      status: r.status !== 200 ? "fail" : ok ? "pass" : "warn",
      httpStatus: r.status,
      ms: r.ms,
      expected: `200 urls>=${THRESHOLDS.sitemapMinUrls}`,
      observed: `${r.status} urls=${locs}`,
      detail: r.status === 200 && !ok ? `URL 数 ${locs} < ${THRESHOLDS.sitemapMinUrls}（可能被裁页/构建异常）` : null,
    });
  } catch (e) {
    addCheck({ id: `${cfg.site}.sitemap`, site: cfg.site, kind: "seo", target: `${B}/sitemap.xml`, status: "fail", detail: String(e.message || e).slice(0, 200) });
  }
  try {
    const r = await httpRequest(`${B}/robots.txt`);
    addCheck({
      id: `${cfg.site}.robots`,
      site: cfg.site,
      kind: "seo",
      target: `${B}/robots.txt`,
      status: r.status === 200 ? "pass" : "warn",
      httpStatus: r.status,
      ms: r.ms,
      expected: "200",
      observed: String(r.status),
    });
  } catch (e) {
    addCheck({ id: `${cfg.site}.robots`, site: cfg.site, kind: "seo", target: `${B}/robots.txt`, status: "warn", detail: String(e.message || e).slice(0, 200) });
  }

  // 付费闸门：无付费订单时必须 402；2xx = P0 事故（免费口子）
  try {
    const r = await httpRequest(`${B}${cfg.gate.path}`, {
      method: "POST",
      headers: { "content-type": "application/json", "user-agent": "paid-tools-monitor/1" },
      body: cfg.gate.body,
    });
    const expect = THRESHOLDS.gateExpectStatus;
    const status =
      r.status === expect ? "pass" : r.status >= 200 && r.status < 300 ? "fail" : r.status >= 500 ? "fail" : "warn";
    addCheck({
      id: `${cfg.site}.gate.paid_only`,
      site: cfg.site,
      kind: "p0-gate",
      target: `POST ${B}${cfg.gate.path}`,
      status,
      httpStatus: r.status,
      ms: r.ms,
      expected: `${expect} payment_required`,
      observed: `${r.status} ${r.text.slice(0, 120).replace(/\s+/g, " ")}`,
      detail: status === "fail" && r.status < 300 ? "免费口子被打开：无订单也创建了任务（P0）" : null,
    });
  } catch (e) {
    addCheck({ id: `${cfg.site}.gate.paid_only`, site: cfg.site, kind: "p0-gate", target: `POST ${B}${cfg.gate.path}`, status: "fail", detail: String(e.message || e).slice(0, 200) });
  }
}

// ---------------------------------------------------------------------------
// R2 只读：@aws-sdk/client-s3（已在 node_modules）+ 自定义 undici handler，
// 让 SDK 负责 SigV4 签名，网络走 undici（支持本机代理）。不新增依赖、不写任何对象。
// ---------------------------------------------------------------------------
const r2ClientCache = { client: null, cfg: null, debug: null };

function r2Config() {
  const cfg = {
    accountId: env("R2_ACCOUNT_ID"),
    accessKeyId: env("R2_ACCESS_KEY_ID"),
    secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
    bucket: env("R2_BUCKET") || "paid-tools-files",
    endpoint: env("R2_ENDPOINT"),
  };
  if (!cfg.endpoint && cfg.accountId) cfg.endpoint = `https://${cfg.accountId}.r2.cloudflarestorage.com`;
  return cfg;
}

function r2Ready(cfg) {
  return Boolean(cfg.endpoint && cfg.accessKeyId && cfg.secretAccessKey && cfg.bucket);
}

/** smithy HttpHandler → undici.request（保留 SDK 生成的已签名 headers，含 host） */
function undiciS3Handler() {
  return {
    metadata: { handlerProtocol: "http/1.1" },
    async handle(request) {
      const queryEntries = [];
      for (const [k, v] of Object.entries(request.query ?? {})) {
        if (v === undefined || v === null) continue;
        for (const item of Array.isArray(v) ? v : [v]) queryEntries.push([k, String(item)]);
      }
      // SigV4 的 canonical query 与 encodeURIComponent 一致（space=%20、/=``%2F``）
      const qs = queryEntries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
      const url = `${request.protocol}//${request.hostname}${request.port ? `:${request.port}` : ""}${request.path}${qs ? `?${qs}` : ""}`;
      const headers = {};
      for (const [k, v] of Object.entries(request.headers || {})) {
        if (v !== undefined && v !== null) headers[k] = String(v);
      }
      if (env("MONITOR_DEBUG_R2") === "1") {
        process.stderr.write(
          `[r2-debug] ${request.method} path=${request.path} query=${JSON.stringify(request.query ?? null)} headerNames=${Object.keys(headers).join(",")}\n`,
        );
      }
      const res = await undiciRequest(url, {
        method: request.method,
        headers,
        ...(dispatcher ? { dispatcher } : {}),
        timeoutMs: 20000,
      }).catch((e) => {
        throw new Error(`R2 network error: ${String(e.message || e).slice(0, 200)}`);
      });
      const { HttpResponse } = await import("@smithy/protocol-http");
      // undici 的 res.body 是 Node Readable（BodyReadable），smithy 的 HttpResponse 直接接受
      return {
        response: new HttpResponse({
          statusCode: res.statusCode,
          headers: Object.fromEntries(Object.entries(res.headers).map(([k, v]) => [k.toLowerCase(), String(v)])),
          body: res.body,
        }),
      };
    },
  };
}

async function r2Client() {
  const cfg = r2Config();
  if (!r2Ready(cfg)) return null;
  if (r2ClientCache.client && r2ClientCache.cfg?.endpoint === cfg.endpoint) return r2ClientCache.client;
  const { S3Client } = await import("@aws-sdk/client-s3");
  r2ClientCache.client = new S3Client({
    region: "auto",
    endpoint: cfg.endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
    requestHandler: undiciS3Handler(),
    maxAttempts: 2,
  });
  r2ClientCache.cfg = cfg;
  return r2ClientCache.client;
}

async function r2List(cfg, prefix, maxPages = THRESHOLDS.maxOrderPages) {
  const client = await r2Client();
  const { ListObjectsV2Command } = await import("@aws-sdk/client-s3");
  const keys = [];
  let token = null;
  let pages = 0;
  for (;;) {
    const out = await client.send(new ListObjectsV2Command({ Bucket: cfg.bucket, Prefix: prefix, ContinuationToken: token, MaxKeys: 1000 }));
    for (const obj of out.Contents ?? []) if (obj.Key) keys.push(obj.Key);
    pages += 1;
    if (!out.IsTruncated || !out.NextContinuationToken || pages >= maxPages) break;
    token = out.NextContinuationToken;
  }
  return { keys, pages };
}

async function r2GetJson(cfg, key) {
  const client = await r2Client();
  const { GetObjectCommand } = await import("@aws-sdk/client-s3");
  try {
    const out = await client.send(new GetObjectCommand({ Bucket: cfg.bucket, Key: key }));
    const text = await out.Body.transformToString("utf-8");
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** 只取统计字段，绝不带出 email/provider 会话等 PII */
function orderPublicView(o) {
  return {
    id: String(o?.id ?? ""),
    status: String(o?.status ?? ""),
    planId: String(o?.planId ?? ""),
    amountCents: Number(o?.amountCents ?? 0),
    currency: "USD",
    unitsGranted: Number(o?.unitsGranted ?? 0),
    unitsUsed: Number(o?.unitsUsed ?? 0),
    createdAt: o?.createdAt ?? null,
    paidAt: o?.paidAt ?? null,
    refundedAt: o?.refundedAt ?? null,
    // Harness orders were marked paid without a real Waffo payment.
    // Exclude them from revenue/paid conversion rather than inflating the dashboard.
    isTest:
      (typeof o?.providerSessionId === "string" &&
        (o.providerSessionId.startsWith("e2e_") || o.providerSessionId === "jobids_check")) ||
      (typeof o?.providerOrderId === "string" &&
        (o.providerOrderId.startsWith("e2e_") || o.providerOrderId === "jobids_check")),
  };
}

function summarizeOrders(orders) {
  const byStatus = { paid: 0, refunded: 0, pending: 0, failed: 0, other: 0 };
  let grossPaidCents = 0;
  let refundedCents = 0;
  let unitsGranted = 0;
  let unitsUsed = 0;
  let testsExcluded = 0;
  for (const o of orders) {
    if (o.isTest) { testsExcluded += 1; continue; }
    if (o.status in byStatus) byStatus[o.status] += 1;
    else byStatus.other += 1;
    if (o.status === "paid" || o.status === "refunded") grossPaidCents += o.amountCents;
    if (o.status === "refunded") refundedCents += o.amountCents;
    unitsGranted += o.unitsGranted;
    unitsUsed += o.unitsUsed;
  }
  const total = orders.length - testsExcluded;
  const paidEver = byStatus.paid + byStatus.refunded; // refunded 曾经 paid
  const newest = orders
    .filter((o) => !o.isTest)
    .slice()
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))[0] ?? null;
  return {
    total,
    byStatus,
    paidEver,
    testsExcluded,
    paidConversion: total > 0 ? Number((paidEver / total).toFixed(4)) : null,
    grossPaidCents,
    refundedCents,
    netRevenueCents: grossPaidCents - refundedCents,
    failureRate: total > 0 ? Number((byStatus.failed / total).toFixed(4)) : null,
    unitsGranted,
    unitsUsed,
    newestOrder: newest ? { id: newest.id, status: newest.status, createdAt: newest.createdAt } : null,
  };
}

async function collectR2(sites) {
  const cfg = r2Config();
  const out = { configured: r2Ready(cfg), note: null, orders: {}, events: {} };
  if (!r2Ready(cfg)) {
    out.note = "R2 credentials 未配置（R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY/R2_ENDPOINT）→ 订单/收入统计 skipped";
    return out;
  }
  for (const s of sites) {
    try {
      const { keys } = await r2List(cfg, `orders/${s.site}/`);
      const orders = [];
      for (const key of keys.slice(0, 500)) {
        if (!key.endsWith(".json")) continue;
        const raw = await r2GetJson(cfg, key);
        if (raw && raw.id) orders.push(orderPublicView(raw));
      }
      out.orders[s.site] = { source: "r2", prefix: `orders/${s.site}/`, objects: keys.length, ...summarizeOrders(orders) };
    } catch (e) {
      out.orders[s.site] = { source: "r2", status: "error", error: String(e.message || e).slice(0, 300), httpStatus: e.httpStatus ?? null };
    }
    // 事件量（只数对象，不抓内容；最近 2 天 CST 日期）
    try {
      const dates = [cstDate(0), cstDate(-1)];
      const perDay = {};
      for (const d of dates) {
        const { keys } = await r2List(cfg, `events/${s.site}/${d}/`, 2);
        perDay[d] = keys.length;
      }
      out.events[s.site] = { source: "r2", prefix: `events/${s.site}/`, objectsByDay: perDay };
    } catch (e) {
      out.events[s.site] = { source: "r2", status: "error", error: String(e.message || e).slice(0, 200) };
    }
  }
  return out;
}

function cstDate(offsetDays) {
  const d = new Date(Date.now() + offsetDays * 86400_000);
  return d.toLocaleDateString("sv-SE", { timeZone: "Asia/Shanghai" });
}

// ---------------------------------------------------------------------------
// 已知订单状态 API
// ---------------------------------------------------------------------------
async function checkKnownOrders(cfg, r2) {
  const orders = [...cfg.knownOrders];
  // B 站没有写死订单时，用 R2 最新订单自动补一条（只读）
  const fromR2 = r2?.configured ? r2.orders?.[cfg.site]?.newestOrder : null;
  if (fromR2 && !orders.some((o) => o.id === fromR2.id)) {
    orders.push({ id: fromR2.id, expected: fromR2.status || null, source: "r2-newest" });
  }
  if (orders.length === 0) {
    addCheck({
      id: `${cfg.site}.orders.status`,
      site: cfg.site,
      kind: "api",
      target: "/api/orders/status",
      status: "skipped",
      detail: "没有已知订单 ID（R2 未配置且未设置 MONITOR_KNOWN_ORDER_<SITE>）",
    });
    return;
  }
  for (const o of orders.slice(0, 3)) {
    try {
      const r = await getJson(`${cfg.base}/api/orders/status?order=${encodeURIComponent(o.id)}`);
      const j = r.json || {};
      const httpOk = r.status === THRESHOLDS.orderApiStatusCode;
      const observedStatus = j.status ?? null;
      const mismatch = o.expected && observedStatus && observedStatus !== o.expected;
      // 订单被人工清理是正常运维动作：404 记 warn（不是 P0），其它非 200 才是 fail
      const status = httpOk ? (mismatch ? "warn" : "pass") : r.status === 404 ? "warn" : "fail";
      addCheck({
        id: `${cfg.site}.orders.status`,
        site: cfg.site,
        kind: "api",
        target: `${cfg.base}/api/orders/status?order=${o.id}`,
        status,
        httpStatus: r.status,
        ms: r.ms,
        expected: `200${o.expected ? ` status=${o.expected}` : ""}`,
        observed: `${r.status} status=${observedStatus ?? "-"} units=${j.unitsGranted ?? "-"}/${j.unitsUsed ?? "-"}`,
        detail:
          r.status === 404
            ? "订单不存在：可能已被人工清理（如 docs/CLEANUP.md）；用 MONITOR_KNOWN_ORDER_<SITE> 更新已知订单"
            : mismatch
              ? `订单状态与 R2/预期不一致（R2=${o.expected} API=${observedStatus}）`
              : o.source === "r2-newest"
                ? "订单 ID 来自 R2 最新记录（自动）"
                : null,
      });
    } catch (e) {
      addCheck({
        id: `${cfg.site}.orders.status`,
        site: cfg.site,
        kind: "api",
        target: `${cfg.base}/api/orders/status?order=${o.id}`,
        status: "fail",
        detail: String(e.message || e).slice(0, 200),
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Cloudflare GraphQL：Worker requests / errors（5xx 代理指标；CPU 需 Dashboard/Logpush）
// ---------------------------------------------------------------------------
async function collectCloudflare() {
  const token = env("CLOUDFLARE_API_TOKEN");
  const accountId = env("CLOUDFLARE_ACCOUNT_ID");
  const out = { configured: Boolean(token && accountId), workers: [], errorRate: null, errorRate5xx: null, note: null };
  if (!out.configured) {
    out.note = "CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID 未配置 → Worker 5xx/CPU skipped（改用 Dashboard/Logpush，见 docs/OPS-MONITORING.md §9）";
    return out;
  }
  const now = new Date();
  const from = new Date(now.getTime() - 24 * 3600 * 1000);
  const query =
    "query($acc:String!,$from:Time!,$to:Time!){viewer{accounts(filter:{accountTag:$acc}){" +
    "workersInvocationsAdaptive(limit:5000,filter:{datetime_geq:$from,datetime_leq:$to}){" +
    "sum{requests errors} dimensions{scriptName status}}}}}";
  try {
    const res = await httpRequest("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ query, variables: { acc: accountId, from: from.toISOString(), to: now.toISOString() } }),
    });
    let j = null;
    try {
      j = JSON.parse(res.text);
    } catch {
      j = null;
    }
    if (res.status !== 200 || !j || j.errors) {
      out.note = `GraphQL 失败（HTTP ${res.status}）：${(j?.errors?.[0]?.message || res.text.slice(0, 200)).replace(/\s+/g, " ")}`;
      return out;
    }
    const rows = j?.data?.viewer?.accounts?.[0]?.workersInvocationsAdaptive || [];
    const byScript = {};
    for (const row of rows) {
      const name = row.dimensions?.scriptName || "(unknown)";
      const bucket = (byScript[name] ??= { script: name, requests: 0, errors: 0 });
      bucket.requests += row.sum?.requests ?? 0;
      bucket.errors += row.sum?.errors ?? 0;
    }
    out.workers = Object.values(byScript).sort((a, b) => b.requests - a.requests);
    // 这个 CF 账号还有别的 Worker（tidycontracts-cf / hk-www-redirect 等），本监控只对 paid-tools-* 判读
    out.workersRelevant = out.workers.filter((w) => /^paid-tools-/.test(w.script));
    out.expectedScripts = ["paid-tools-voice", "paid-tools-headshot"];
    out.missingScripts = out.expectedScripts.filter((name) => !out.workers.some((w) => w.script === name));
    const scoped = out.workersRelevant.length > 0 ? out.workersRelevant : out.workers;
    const totalReq = scoped.reduce((s, w) => s + w.requests, 0);
    const totalErr = scoped.reduce((s, w) => s + w.errors, 0);
    out.errorRate = totalReq > 0 ? Number((totalErr / totalReq).toFixed(4)) : null;
    out.errorRate5xx = out.errorRate; // 该数据集 errors 主要是 5xx/异常；精确状态码拆分见文档
    out.scope = out.workersRelevant.length > 0 ? "paid-tools-* scripts only" : "all scripts (no paid-tools-* found)";
    out.note = "workersInvocationsAdaptive 只给 requests/errors 汇总；402/5xx 精确比例需 Workers Logs 或 wrangler tail（见文档）";
  } catch (e) {
    out.note = `Cloudflare 查询异常：${String(e.message || e).slice(0, 200)}`;
  }
  return out;
}

// ---------------------------------------------------------------------------
// 飞书
// ---------------------------------------------------------------------------
async function sendFeishu(report) {
  const webhook = env("MONITOR_FEISHU_WEBHOOK") || env("FEISHU_WEBHOOK");
  if (!webhook) return { status: "skipped", note: "FEISHU_WEBHOOK 未配置（本地只输出摘要）" };
  const s = report.summary;
  const lines = [
    `paid-tools monitor: ${report.status.toUpperCase()} (${new Date(report.finishedAt).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })})`,
    `checks pass/warn/fail = ${s.pass}/${s.warn}/${s.fail}${s.skipped ? ` skipped=${s.skipped}` : ""}`,
  ];
  for (const f of report.failures.slice(0, 8)) lines.push(`FAIL ${f.id}: ${f.observed ?? f.detail ?? ""}`);
  for (const w of report.warnings.slice(0, 8)) lines.push(`WARN ${w.id}: ${w.observed ?? w.detail ?? ""}`);
  const voice = report.orders?.orders?.voice;
  if (voice && voice.total != null) lines.push(`A orders: paid=${voice.byStatus.paid} refunded=${voice.byStatus.refunded} net=$${(voice.netRevenueCents / 100).toFixed(2)}`);
  const hs = report.orders?.orders?.headshot;
  if (hs && hs.total != null) lines.push(`B orders: paid=${hs.byStatus.paid} refunded=${hs.byStatus.refunded} net=$${(hs.netRevenueCents / 100).toFixed(2)}`);
  try {
    const r = await httpRequest(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ msg_type: "text", content: { text: lines.join("\n") } }),
      timeoutMs: 15000,
    });
    const ok = r.status >= 200 && r.status < 300;
    return ok ? { status: "sent", httpStatus: r.status } : { status: "error", httpStatus: r.status, note: r.text.slice(0, 200) };
  } catch (e) {
    return { status: "error", note: String(e.message || e).slice(0, 200) };
  }
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
const startedAt = new Date();
const proxy = await resolveProxy();
if (proxy.used) dispatcher = new ProxyAgent(proxy.url);

const sites = siteConfig();

// --probe-r2：只做 R2 只读自检，便于排障
if (FLAG.probeR2) {
  const cfg = r2Config();
  const probe = { configured: r2Ready(cfg), bucket: cfg.bucket, endpointHost: cfg.endpoint ? new URL(cfg.endpoint).host : null, list: {}, orderSample: null };
  if (r2Ready(cfg)) {
    for (const s of sites) {
      try {
        const { keys } = await r2List(cfg, `orders/${s.site}/`);
        probe.list[s.site] = { objects: keys.length, first: keys.slice(0, 3) };
        const sample = keys.find((k) => k.endsWith(".json"));
        if (sample) probe.orderSample = { site: s.site, key: sample, status: (await r2GetJson(cfg, sample))?.status ?? null };
      } catch (e) {
        probe.list[s.site] = { error: String(e.message || e).slice(0, 300) };
      }
    }
  }
  process.stdout.write(JSON.stringify({ ok: probe.configured && !Object.values(probe.list).some((x) => x.error), probe }, null, 2) + "\n");
  process.exit(probe.configured && !Object.values(probe.list).some((x) => x.error) ? 0 : 2);
}

for (const cfg of sites) {
  await checkSite(cfg);
}

const r2 = await collectR2(sites);
for (const cfg of sites) {
  await checkKnownOrders(cfg, r2);
}

const cloudflare = await collectCloudflare();

// 订单/收入/失败率判读
if (r2.configured) {
  for (const cfg of sites) {
    const st = r2.orders[cfg.site];
    if (!st || st.status === "error") {
      addCheck({
        id: `${cfg.site}.revenue.r2`,
        site: cfg.site,
        kind: "revenue",
        target: `r2://orders/${cfg.site}/`,
        status: "warn",
        detail: st?.error ? `R2 读取失败：${st.error}` : "R2 无订单数据",
      });
      continue;
    }
    addCheck({
      id: `${cfg.site}.revenue.r2`,
      site: cfg.site,
      kind: "revenue",
      target: `r2://orders/${cfg.site}/`,
      status: "pass",
      expected: "R2 前缀可读（只读统计）",
      observed: `total=${st.total} paid=${st.byStatus.paid} refunded=${st.byStatus.refunded} pending=${st.byStatus.pending} failed=${st.byStatus.failed} net=$${(st.netRevenueCents / 100).toFixed(2)}`,
      detail: `checkout→paid=${st.paidConversion == null ? "-" : (st.paidConversion * 100).toFixed(1) + "%"}；failureRate=${st.failureRate == null ? "-" : (st.failureRate * 100).toFixed(1) + "%"}；对象数=${st.objects}`,
    });
  }
} else {
  for (const cfg of sites) {
    addCheck({
      id: `${cfg.site}.revenue.r2`,
      site: cfg.site,
      kind: "revenue",
      target: `r2://orders/${cfg.site}/`,
      status: "skipped",
      detail: r2.note,
    });
  }
}

// CF 5xx
if (!cloudflare.configured) {
  addCheck({ id: "cloudflare.workers", kind: "infra", target: "CF GraphQL workersInvocationsAdaptive", status: "skipped", detail: cloudflare.note });
} else if (cloudflare.errorRate == null) {
  addCheck({ id: "cloudflare.workers", kind: "infra", target: "CF GraphQL workersInvocationsAdaptive", status: "warn", detail: cloudflare.note });
} else {
  const rate = cloudflare.errorRate;
  const scoped = (cloudflare.workersRelevant?.length ? cloudflare.workersRelevant : cloudflare.workers) || [];
  const missing = cloudflare.missingScripts ?? [];
  const rateStatus = rate > THRESHOLDS.cloudflare5xxRateCritical ? "fail" : rate > THRESHOLDS.cloudflare5xxRateWarn ? "warn" : "pass";
  const status = missing.length > 0 && rateStatus === "pass" ? "warn" : rateStatus;
  addCheck({
    id: "cloudflare.workers",
    kind: "infra",
    target: "CF GraphQL workersInvocationsAdaptive (24h)",
    status,
    expected: `errors/requests <= ${(THRESHOLDS.cloudflare5xxRateWarn * 100).toFixed(0)}%（scope: paid-tools-*）`,
    observed: `errorRate=${rate == null ? "-" : (rate * 100).toFixed(2) + "%"} requests=${scoped.reduce((s, w) => s + w.requests, 0)} scope=${cloudflare.scope}`,
    detail: [
      missing.length ? `缺少 Worker：${missing.join(",")}（可能改名/未部署）` : null,
      cloudflare.workers.length ? `账号内脚本：${cloudflare.workers.map((w) => w.script).join(",")}` : null,
      cloudflare.note,
    ]
      .filter(Boolean)
      .join("；"),
  });
}

// 汇总
const summary = { checks: checks.length, pass: 0, warn: 0, fail: 0, skipped: 0 };
summary.pass = checks.filter((c) => c.status === "pass").length;
summary.warn = checks.filter((c) => c.status === "warn").length;
summary.fail = checks.filter((c) => c.status === "fail").length;
summary.skipped = checks.filter((c) => c.status === "skipped").length;

const failures = checks.filter((c) => c.status === "fail");
const warnings = checks.filter((c) => c.status === "warn");
const status = failures.length > 0 ? "critical" : warnings.length > 0 ? "warn" : "ok";
const exitCode = status === "critical" ? 2 : status === "warn" ? 1 : 0;

const report = {
  monitor: { name: "paid-tools", version: MONITOR_VERSION, task: "task-27" },
  startedAt: startedAt.toISOString(),
  finishedAt: new Date().toISOString(),
  durationMs: Date.now() - startedAt.getTime(),
  status,
  exitCode,
  thresholds: THRESHOLDS,
  meta: {
    node: process.version,
    platform: process.platform,
    repo: ROOT,
    proxy,
    configured: {
      feishu: envFlag("MONITOR_FEISHU_WEBHOOK") || envFlag("FEISHU_WEBHOOK"),
      cloudflare: cloudflare.configured,
      r2: r2.configured,
      cloudflareWebAnalyticsToken: envFlag("NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN"),
    },
    notes: [
      "只读监控：不创建订单/任务，不写 R2",
      "R2 订单统计排除 email 等 PII 字段",
      "线上 /api/version commit=dev：部署未注入 GIT_COMMIT，无法用线上 commit 对账仓库 HEAD",
    ],
  },
  summary,
  sites: sites.map((s) => ({ site: s.site, base: s.base })),
  checks,
  orders: r2,
  cloudflare,
  channels: { feishu: null },
  failures,
  warnings,
};

report.channels.feishu = await sendFeishu(report);

if (!FLAG.quiet) {
  const line = (l) => process.stderr.write(l + "\n");
  line(`\n=== paid-tools monitor: ${status.toUpperCase()} (exit ${exitCode}) ===`);
  line(`checks: pass=${summary.pass} warn=${summary.warn} fail=${summary.fail} skipped=${summary.skipped}  ${report.durationMs}ms`);
  line(`proxy: ${proxy.used ? proxy.url + " (" + proxy.source + ")" : "direct"}`);
  for (const c of checks) {
    const tag = { pass: "PASS", warn: "WARN", fail: "FAIL", skipped: "SKIP" }[c.status].padEnd(4);
    line(`${tag} ${c.id.padEnd(30)} ${c.httpStatus ?? "-"}${c.ms != null ? ` ${c.ms}ms` : ""} ${c.observed ?? c.detail ?? ""}`.slice(0, 240));
  }
  const feishu = report.channels.feishu;
  line(`feishu: ${feishu.status}${feishu.note ? " — " + feishu.note : ""}`);
}

/** GitHub Actions Step Summary 用的 Markdown（无 jq 依赖；由脚本自己格式化，便于本地验证） */
function renderMarkdown(report) {
  const s = report.summary;
  const lines = [];
  lines.push("## paid-tools monitor");
  lines.push("");
  lines.push(`- 状态：**${report.status.toUpperCase()}**（exit ${report.exitCode}，${report.durationMs}ms，${new Date(report.finishedAt).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })} CST）`);
  lines.push(`- checks：pass ${s.pass} / warn ${s.warn} / fail ${s.fail} / skipped ${s.skipped}（共 ${s.checks}）`);
  lines.push("");
  lines.push("### 订单/收入（R2 只读）");
  lines.push("");
  lines.push("| site | total | paid | refunded | pending | failed | checkout→paid | net (USD) |");
  lines.push("|---|---|---|---|---|---|---|---|");
  for (const [site, st] of Object.entries(report.orders?.orders ?? {})) {
    if (st.status === "error") {
      lines.push(`| ${site} | ERR | - | - | - | - | - | ${st.error ? st.error.slice(0, 60) : ""} |`);
      continue;
    }
    const net = st.netRevenueCents == null ? "-" : (st.netRevenueCents / 100).toFixed(2);
    const conv = st.paidConversion == null ? "-" : `${(st.paidConversion * 100).toFixed(1)}%`;
    lines.push(`| ${site} | ${st.total} | ${st.byStatus?.paid} | ${st.byStatus?.refunded} | ${st.byStatus?.pending} | ${st.byStatus?.failed} | ${conv} | ${net} |`);
  }
  if (!report.orders?.configured) lines.push("", `R2 未配置：${report.orders?.note ?? ""}`);
  lines.push("");
  lines.push("### Cloudflare Workers（24h）");
  lines.push("");
  if (report.cloudflare?.configured && report.cloudflare.errorRate != null) {
    lines.push(`- scope=${report.cloudflare.scope} errorRate=${(report.cloudflare.errorRate * 100).toFixed(2)}%`);
    for (const w of report.cloudflare.workers ?? []) lines.push(`  - ${w.script}: requests=${w.requests} errors=${w.errors}`);
    if ((report.cloudflare.missingScripts ?? []).length) lines.push(`- ⚠️ 缺少 Worker：${report.cloudflare.missingScripts.join(",")}`);
  } else {
    lines.push(`- skipped：${report.cloudflare?.note ?? "未配置"}`);
  }
  lines.push("");
  if (report.failures.length) {
    lines.push("### ❌ failures");
    for (const f of report.failures) lines.push(`- \`${f.id}\`：${f.observed ?? ""}${f.detail ? ` — ${f.detail}` : ""}`);
    lines.push("");
  }
  if (report.warnings.length) {
    lines.push("### ⚠️ warnings");
    for (const w of report.warnings) lines.push(`- \`${w.id}\`：${w.observed ?? ""}${w.detail ? ` — ${w.detail}` : ""}`);
    lines.push("");
  }
  lines.push("### 全部 checks");
  lines.push("");
  lines.push("| check | status | http | ms | observed / detail |");
  lines.push("|---|---|---|---|---|");
  for (const c of report.checks) {
    const obs = String(c.observed ?? c.detail ?? "").replace(/\|/g, "\\|").slice(0, 160);
    lines.push(`| \`${c.id}\` | ${c.status} | ${c.httpStatus ?? "-"} | ${c.ms ?? "-"} | ${obs} |`);
  }
  lines.push("");
  lines.push(`- feishu：${report.channels?.feishu?.status ?? "-"}${report.channels?.feishu?.note ? `（${report.channels.feishu.note}）` : ""}`);
  return lines.join("\n") + "\n";
}

if (FLAG.jsonOut) writeFileSync(FLAG.jsonOut, JSON.stringify(report, null, 2) + "\n", "utf8");
if (FLAG.mdOut) writeFileSync(FLAG.mdOut, renderMarkdown(report), "utf8");

process.stdout.write(JSON.stringify(report, null, 2) + "\n");
process.exit(exitCode);
