#!/usr/bin/env node
/**
 * tools/smoke-paid-tools.mjs — paid-tools 两站关键路径 smoke（只读，无 R2/CF 依赖）
 *
 * 与 monitor-paid-tools.mjs 的分工：
 *   - smoke：秒级「能不能用」验收，严格 pass/fail，适合部署后立刻跑 / CI 手跑
 *   - monitor：指标/阈值/收入/失败率/告警，适合 cron 巡检
 *
 * 覆盖：
 *   1) 页面可用：/、/pricing、/orders 200 + <title> + 内容长度
 *   2) /api/version 200 且 service 正确；/api/events 200 且 r2=true
 *   3) sitemap.xml 200 且 URL 数 = 16；robots.txt 200 且含 Sitemap:；llms.txt 200
 *   4) 404 页面返回 404；www 子域 301/308 到 apex（跟随到底 200 且最终 URL = apex）
 *   5) 安全响应头：x-frame-options / x-content-type-options / referrer-policy / permissions-policy
 *   6) 付费闸门：POST /api/jobs（A）/ POST /api/orders（B）无订单时必须 402（2xx = 免费口子 = FAIL）
 *   7) 已知订单：/api/orders/status?order=<id> 200 且状态符合预期
 *   8) 定价真实性（防回潮）：A 页面必须含 2.90/Trial Pack 且不含 WAV/6 stems；B 含 Sample Pack/5 headshots
 *
 * 输出：stdout = JSON；stderr = 人读摘要；退出码 0=全通过，1=有 FAIL
 * 用法：
 *   node tools/smoke-paid-tools.mjs
 *   node tools/smoke-paid-tools.mjs --quiet --no-proxy
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { connect } from "node:net";
import { request as undiciRequest, ProxyAgent } from "undici";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const ENV_FILE = `${ROOT.replace(/\/$/, "")}/.env.local`;
const ARGV = process.argv.slice(2);
const FLAG = {
  quiet: ARGV.includes("--quiet"),
  noProxy: ARGV.includes("--no-proxy"),
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
    out[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^(['"])(.*)\1$/, "$2");
  }
  return out;
}
const fileEnv = loadEnvFile(ENV_FILE);
const env = (name, fallback = "") => process.env[name] ?? fileEnv[name] ?? fallback;

function tcpProbe(host, port, timeoutMs = 600) {
  return new Promise((resolve) => {
    const s = connect({ host, port });
    const done = (ok) => {
      s.destroy();
      resolve(ok);
    };
    s.setTimeout(timeoutMs);
    s.once("connect", () => done(true));
    s.once("timeout", () => done(false));
    s.once("error", () => done(false));
  });
}
async function resolveProxy() {
  if (FLAG.noProxy) return { used: false, source: "disabled" };
  if (FLAG.proxy) return { used: true, url: FLAG.proxy, source: "--proxy flag" };
  for (const n of ["MONITOR_PROXY", "HTTPS_PROXY", "https_proxy", "HTTP_PROXY", "http_proxy"]) {
    if (env(n)) return { used: true, url: env(n), source: n };
  }
  if (await tcpProbe("127.0.0.1", 7897)) return { used: true, url: "http://127.0.0.1:7897", source: "auto-detect 127.0.0.1:7897" };
  return { used: false, source: "direct" };
}

const proxy = await resolveProxy();
const dispatcher = proxy.used ? new ProxyAgent(proxy.url) : null;

async function req(url, { method = "GET", headers = {}, body = null, timeoutMs = 20000, redirect = 5 } = {}) {
  // 连接级失败重试一次（HTTP 状态码不重试）：CI/本机代理抖动不应把 smoke 判成 FAIL
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
        maxRedirections: redirect,
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

const checks = [];
function check(id, ok, detail) {
  checks.push({ id, ok: Boolean(ok), ...detail });
}

const SITES = [
  {
    site: "voice",
    label: "A voice",
    base: (env("MONITOR_SITE_VOICE") || env("NEXT_PUBLIC_SITE_URL_VOICE") || "https://stemextractor.com").replace(/\/$/, ""),
    versionService: "voice",
    gatePath: "/api/jobs",
    gateBody: JSON.stringify({ filename: "smoke-probe.mp3", minutes: 1 }),
    sitemapUrls: 16,
    knownOrder: env("MONITOR_KNOWN_ORDER_VOICE") || "ord_mwfzkg8h_yy9s9md:refunded",
    pricingMust: ["2.90", "Trial Pack"],
    pricingMustNot: ["WAV", "6 stems"],
  },
  {
    site: "headshot",
    label: "B headshot",
    base: (env("MONITOR_SITE_HEADSHOT") || env("NEXT_PUBLIC_SITE_URL_HEADSHOT") || "https://headshotsnap.com").replace(/\/$/, ""),
    versionService: "headshot",
    gatePath: "/api/orders",
    gateBody: JSON.stringify({ files: 3, images: 5 }),
    sitemapUrls: 16,
    knownOrder: env("MONITOR_KNOWN_ORDER_HEADSHOT") || "",
    pricingMust: ["Sample Pack", "5 headshots", "Coming soon"],
    pricingMustNot: [],
  },
];

for (const s of SITES) {
  const B = s.base;
  const html = {};
  for (const [path, id] of [
    ["/", "home"],
    ["/pricing", "pricing"],
    ["/orders", "orders"],
  ]) {
    try {
      const r = await req(`${B}${path}`, { headers: { "user-agent": "paid-tools-smoke/1" } });
      html[id] = r.text;
      const hasTitle = /<title[^>]*>[^<]{3,}/i.test(r.text);
      check(`${s.site}.page.${id}`, r.status === 200 && hasTitle && r.text.length > 2000, {
        httpStatus: r.status,
        ms: r.ms,
        expected: "200 + <title> + >2000 bytes",
        observed: `${r.status} title=${hasTitle} bytes=${r.text.length}`,
      });
    } catch (e) {
      check(`${s.site}.page.${id}`, false, { detail: `network: ${String(e.message || e).slice(0, 160)}` });
    }
  }

  // /api/version
  try {
    const r = await req(`${B}/api/version`, { headers: { accept: "application/json" } });
    const j = JSON.parse(r.text);
    check(`${s.site}.api.version`, r.status === 200 && j.service === s.versionService && j.status === "ok", {
      httpStatus: r.status,
      ms: r.ms,
      expected: `200 service=${s.versionService}`,
      observed: `${r.status} service=${j.service} status=${j.status} commit=${j.commit ?? "-"}`,
    });
  } catch (e) {
    check(`${s.site}.api.version`, false, { detail: String(e.message || e).slice(0, 160) });
  }

  // /api/events
  try {
    const r = await req(`${B}/api/events`, { headers: { accept: "application/json" } });
    const j = JSON.parse(r.text);
    check(`${s.site}.api.events`, r.status === 200 && j.ok === true && j.r2 === true, {
      httpStatus: r.status,
      ms: r.ms,
      expected: "200 ok=true r2=true",
      observed: `${r.status} ok=${j.ok} r2=${j.r2}`,
    });
  } catch (e) {
    check(`${s.site}.api.events`, false, { detail: String(e.message || e).slice(0, 160) });
  }

  // sitemap / robots / llms.txt
  try {
    const r = await req(`${B}/sitemap.xml`);
    const locs = (r.text.match(/<loc>/g) || []).length;
    check(`${s.site}.sitemap`, r.status === 200 && locs === s.sitemapUrls, {
      httpStatus: r.status,
      ms: r.ms,
      expected: `200 urls=${s.sitemapUrls}`,
      observed: `${r.status} urls=${locs}`,
    });
  } catch (e) {
    check(`${s.site}.sitemap`, false, { detail: String(e.message || e).slice(0, 160) });
  }
  try {
    const r = await req(`${B}/robots.txt`);
    check(`${s.site}.robots`, r.status === 200 && /sitemap:\s*https?:\/\//i.test(r.text), {
      httpStatus: r.status,
      ms: r.ms,
      expected: "200 + Sitemap:",
      observed: `${r.status} hasSitemap=${/sitemap:/i.test(r.text)}`,
    });
  } catch (e) {
    check(`${s.site}.robots`, false, { detail: String(e.message || e).slice(0, 160) });
  }
  try {
    const r = await req(`${B}/llms.txt`);
    check(`${s.site}.llms_txt`, r.status === 200 && r.text.length > 500, {
      httpStatus: r.status,
      ms: r.ms,
      expected: "200 + >500 bytes",
      observed: `${r.status} bytes=${r.text.length}`,
    });
  } catch (e) {
    check(`${s.site}.llms_txt`, false, { detail: String(e.message || e).slice(0, 160) });
  }

  // 404
  try {
    const r = await req(`${B}/nonexistent-smoke-${Date.now()}`);
    check(`${s.site}.404`, r.status === 404, { httpStatus: r.status, expected: "404", observed: String(r.status) });
  } catch (e) {
    check(`${s.site}.404`, false, { detail: String(e.message || e).slice(0, 160) });
  }

  // www → apex（不跟随重定向，直接断言 301/308 + Location=apex）
  try {
    const host = new URL(B).hostname;
    const r = await req(`https://www.${host}/`, { redirect: 0 });
    const loc = String(r.headers.location || "");
    const redirectedToApex = /^30[178]$/.test(String(r.status)) && loc.replace(/\/$/, "") === B;
    check(`${s.site}.www_redirect`, redirectedToApex, {
      httpStatus: r.status,
      expected: `301/308 Location=${B}`,
      observed: `${r.status} location=${loc || "-"}`,
    });
  } catch (e) {
    check(`${s.site}.www_redirect`, false, { detail: String(e.message || e).slice(0, 160) });
  }

  // 安全头
  try {
    const r = await req(`${B}/`);
    const want = ["x-frame-options", "x-content-type-options", "referrer-policy", "permissions-policy"];
    const missing = want.filter((h) => !r.headers[h]);
    check(`${s.site}.security_headers`, missing.length === 0, {
      httpStatus: r.status,
      expected: want.join(","),
      observed: missing.length ? `missing=${missing.join(",")}` : "all present",
    });
  } catch (e) {
    check(`${s.site}.security_headers`, false, { detail: String(e.message || e).slice(0, 160) });
  }

  // 付费闸门
  try {
    const r = await req(`${B}${s.gatePath}`, {
      method: "POST",
      headers: { "content-type": "application/json", "user-agent": "paid-tools-smoke/1" },
      body: s.gateBody,
    });
    check(`${s.site}.paid_gate`, r.status === 402, {
      httpStatus: r.status,
      expected: "402 payment_required",
      observed: `${r.status} ${r.text.slice(0, 120).replace(/\s+/g, " ")}`,
    });
  } catch (e) {
    check(`${s.site}.paid_gate`, false, { detail: String(e.message || e).slice(0, 160) });
  }

  // 定价真实性（防回潮）
  if (html.pricing) {
    const missing = s.pricingMust.filter((t) => !html.pricing.includes(t));
    const forbidden = s.pricingMustNot.filter((t) => html.pricing.includes(t));
    check(`${s.site}.pricing_truth`, missing.length === 0 && forbidden.length === 0, {
      expected: `含 ${s.pricingMust.join("/")}${s.pricingMustNot.length ? "；不含 " + s.pricingMustNot.join("/") : ""}`,
      observed: `missing=[${missing.join(",")}] forbidden=[${forbidden.join(",")}]`,
    });
  }

  // 已知订单
  if (s.knownOrder) {
    const [orderId, expectedStatus] = s.knownOrder.split(":");
    try {
      const r = await req(`${B}/api/orders/status?order=${encodeURIComponent(orderId)}`, { headers: { accept: "application/json" } });
      const j = JSON.parse(r.text);
      check(`${s.site}.known_order`, r.status === 200 && (!expectedStatus || j.status === expectedStatus), {
        httpStatus: r.status,
        expected: `200 status=${expectedStatus || "*"}`,
        observed: `${r.status} status=${j.status} units=${j.unitsGranted}/${j.unitsUsed}`,
      });
    } catch (e) {
      check(`${s.site}.known_order`, false, { detail: String(e.message || e).slice(0, 160) });
    }
  }
}

const passed = checks.filter((c) => c.ok).length;
const failed = checks.length - passed;
const status = failed === 0 ? "pass" : "fail";
const result = {
  smoke: { name: "paid-tools", version: 1, task: "task-27" },
  startedAt: new Date(Date.now() - 0).toISOString(),
  finishedAt: new Date().toISOString(),
  status,
  exitCode: failed === 0 ? 0 : 1,
  proxy,
  sites: SITES.map((s) => ({ site: s.site, base: s.base })),
  summary: { checks: checks.length, passed, failed },
  checks,
  failedChecks: checks.filter((c) => !c.ok),
};

if (!FLAG.quiet) {
  process.stderr.write(`\n=== paid-tools smoke: ${status.toUpperCase()} (${passed}/${checks.length}) ===\n`);
  for (const c of checks) {
    process.stderr.write(`${c.ok ? "PASS" : "FAIL"} ${c.id.padEnd(26)} ${c.httpStatus ?? "-"} ${c.observed ?? c.detail ?? ""}\n`.slice(0, 200));
  }
}
/** GitHub Actions Step Summary 用的 Markdown（无 jq 依赖） */
function renderMarkdown(r) {
  const lines = [];
  lines.push("## paid-tools smoke");
  lines.push("");
  lines.push(`- 状态：**${r.status.toUpperCase()}**（${r.summary.passed}/${r.summary.checks} 通过，exit ${r.exitCode}）`);
  lines.push(`- proxy：${r.proxy.used ? r.proxy.url + "（" + r.proxy.source + "）" : "direct"}`);
  lines.push("");
  lines.push("| check | 结果 | http | observed / detail |");
  lines.push("|---|---|---|---|");
  for (const c of r.checks) {
    const obs = String(c.observed ?? c.detail ?? "").replace(/\|/g, "\\|").slice(0, 140);
    lines.push(`| \`${c.id}\` | ${c.ok ? "PASS" : "FAIL"} | ${c.httpStatus ?? "-"} | ${obs} |`);
  }
  return lines.join("\n") + "\n";
}

if (FLAG.jsonOut) writeFileSync(FLAG.jsonOut, JSON.stringify(result, null, 2) + "\n", "utf8");
if (FLAG.mdOut) writeFileSync(FLAG.mdOut, renderMarkdown(result), "utf8");

process.stdout.write(JSON.stringify(result, null, 2) + "\n");
process.exit(result.exitCode);
