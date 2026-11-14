#!/usr/bin/env node
/**
 * tools/refund-waffo-order.mjs — 幂等退款 Waffo 订单（P0 退款自动化）
 *
 * 用途：按站内订单号（orderMerchantExternalId，R2 里的 `ord_xxx`）在 Waffo 找到真实 payment，
 * 创建退款 ticket，轮询到终态，然后把 R2 的 `orders/<site>/<id>.json` 标记为 refunded。
 *
 * 关键事实（2026-11-14 用生产商户实测确认）：
 *   - 退款走 REST：POST /v1/actions/refund-ticket/create-ticket
 *     body: { paymentId, reason, requestedAmount: { amount: "2.90", currency: "USD" } }
 *     `requestedAmount.amount` 是**十进制美元字符串**（不是美分）；payment.amount.amount 才是美分。
 *   - 必填字段缺失时返回 400：`Missing required fields: paymentId, reason, requestedAmount`
 *   - ticket 状态机：pending → under_review → approved → processing → succeeded | failed | rejected | returned
 *   - 查单：GraphQL `/v1/graphql`
 *       payments(storeId, filter:{orderMerchantExternalId:{eq}})
 *       refunds(filter:{paymentId:{eq}})
 *       refundTicket(id)
 *   - 鉴权：RSA-SHA256 签名，canonical = `${METHOD}\n${path}\n${timestamp}\n${base64(sha256(body))}`，
 *     headers = X-Merchant-Id / X-Timestamp / X-Signature
 *   - 本机访问 api.waffo.ai 需要代理（默认 http://127.0.0.1:7897，可用 --proxy / --no-proxy 覆盖）
 *
 * 幂等规则（永远不会重复退款）：
 *   1. payment.isFullyRefunded / refundStatus === "refunded" → 直接返回 already_refunded，不调任何写接口；
 *   2. 已存在 pending/processing 的 refund/ticket → 只轮询，不创建新 ticket；
 *   3. R2 订单已是 refunded 且 providerRefundId 一致 → 不再写 R2；
 *   4. --dry-run 全程只读（不创建 ticket、不写 R2），用于对账与演练。
 *
 * 安全：
 *   - 私钥/密钥只从 .env.local 读取，任何日志都不打印密钥（只打印 merchant id 掩码）；
 *   - 默认单笔上限 $50（--max-amount 可调），防止手误把大额订单全退；
 *   - 金额必须 > 0 且 ≤ 可退余额（payment.amount - payment.refundedAmount）；
 *   - 非 TTY 环境（CI/Agent）不加 --yes 也会执行；TTY 交互环境需要输入 YES 确认（--yes 可跳过）。
 *
 * 用法：
 *   node tools/refund-waffo-order.mjs --order ord_mwfzkg8h_yy9s9md --dry-run
 *   node tools/refund-waffo-order.mjs --order ord_xxx --amount 2.90
 *   node tools/refund-waffo-order.mjs --order ord_xxx --dry-run --json
 *
 * 退出码：0 = 成功 / 已是退款态；1 = 参数或配置错误；2 = Waffo 远端错误；
 *         3 = ticket 超时未到终态；4 = 退款成功但 R2 回写失败（需人工补写）。
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { fetch as undiciFetch, ProxyAgent } from "undici";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..");
const DEFAULT_ENV_FILE = path.join(REPO_ROOT, ".env.local");
const DEFAULT_PROXY = process.env.WAFFO_PROXY || process.env.HTTPS_PROXY || "http://127.0.0.1:7897";
const DEFAULT_API_BASE = "https://api.waffo.ai";
const CREATE_TICKET_PATH = "/v1/actions/refund-ticket/create-ticket";
const GRAPHQL_PATH = "/v1/graphql";
const DEFAULT_REASON = "requested_by_customer";
const DEFAULT_MAX_AMOUNT = 50;
const TERMINAL_TICKET_STATUSES = new Set(["succeeded", "failed", "rejected", "returned"]);
const ACTIVE_TICKET_STATUSES = new Set(["pending", "under_review", "approved", "processing"]);

// ---------------------------------------------------------------------------
// 参数解析
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = {
    order: null,
    amount: null,
    dryRun: false,
    site: null,
    reason: DEFAULT_REASON,
    note: null,
    timeoutSec: 180,
    pollSec: 3,
    envFile: DEFAULT_ENV_FILE,
    proxy: DEFAULT_PROXY,
    json: false,
    yes: false,
    maxAmount: DEFAULT_MAX_AMOUNT,
    help: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = () => {
      const v = argv[i + 1];
      if (v === undefined || v.startsWith("--")) throw new Error(`参数 ${a} 缺少值`);
      i += 1;
      return v;
    };
    switch (a) {
      case "--order": args.order = next(); break;
      case "--amount": args.amount = next(); break;
      case "--site": args.site = next(); break;
      case "--reason": args.reason = next(); break;
      case "--note": args.note = next(); break;
      case "--timeout": args.timeoutSec = Number(next()); break;
      case "--poll": args.pollSec = Number(next()); break;
      case "--env-file": args.envFile = path.resolve(next()); break;
      case "--proxy": args.proxy = next(); break;
      case "--no-proxy": args.proxy = null; break;
      case "--max-amount": args.maxAmount = Number(next()); break;
      case "--dry-run": args.dryRun = true; break;
      case "--json": args.json = true; break;
      case "--yes": case "-y": args.yes = true; break;
      case "--help": case "-h": args.help = true; break;
      default: throw new Error(`未知参数：${a}`);
    }
  }
  return args;
}

function usage() {
  return `用法: node tools/refund-waffo-order.mjs --order ord_xxx [--amount 2.90] [--dry-run]

  --order <ord_xxx>   必填。站内订单号（R2 orders/<site>/<id>.json 的 id / Waffo orderMerchantExternalId）
  --amount <2.90>     可选。退款金额（美元十进制）；默认退「可退余额」（一次性订单通常=全额）
  --dry-run           只读演练：查 payment/refund/R2 状态并打印计划，绝不创建 ticket、绝不写 R2
  --site voice|headshot  可选。默认自动探测（先 voice 后 headshot）
  --reason <str>      退款原因，默认 requested_by_customer
  --note <str>        写进 R2 的备注（默认自动生成）
  --timeout <sec>     ticket 轮询超时，默认 180
  --poll <sec>        轮询间隔，默认 3
  --env-file <path>   默认仓库根目录 .env.local
  --proxy <url>       Waffo API 代理，默认 $WAFFO_PROXY 或 http://127.0.0.1:7897
  --no-proxy          直连（本机通常不通，排障用）
  --max-amount <usd>  单笔退款上限保护，默认 50
  --json              只输出一行 JSON（给自动化/Agent 用）
  --yes, -y           跳过 TTY 交互确认
  --help, -h          显示本帮助`;
}

// ---------------------------------------------------------------------------
// .env.local 解析（支持 PEM 多行续行；私钥可能是 base64(PEM)）
// ---------------------------------------------------------------------------
function parseEnvFile(file) {
  if (!fs.existsSync(file)) throw new Error(`env 文件不存在：${file}`);
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const env = Object.create(null);
  let lastKey = null;
  for (const line of lines) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) {
      env[m[1]] = m[2];
      lastKey = m[1];
      continue;
    }
    if (lastKey && line.trim() !== "" && !line.trimStart().startsWith("#")) {
      // PEM 的 body / END 行
      env[lastKey] += "\n" + line;
    }
  }
  for (const key of Object.keys(env)) {
    let value = env[key];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value.replace(/\\n/g, "\n");
  }
  return env;
}

function toPem(raw, kind = "PRIVATE KEY") {
  const value = String(raw ?? "").trim();
  if (value.includes("-----BEGIN")) return value;
  try {
    const decoded = Buffer.from(value.replace(/\s+/g, ""), "base64").toString("utf8");
    if (decoded.includes("-----BEGIN")) return decoded;
  } catch {
    /* ignore */
  }
  throw new Error(`env 里的 ${kind} 既不是 PEM 也不是 base64(PEM)`);
}

// ---------------------------------------------------------------------------
// 日志 / 输出
// ---------------------------------------------------------------------------
function makeLogger(json) {
  const lines = [];
  return {
    lines,
    info: (...msg) => {
      const line = msg.join(" ");
      lines.push(line);
      if (!json) process.stderr.write(line + "\n");
    },
    out: (obj) => {
      if (json) process.stdout.write(JSON.stringify(obj) + "\n");
      else process.stdout.write(JSON.stringify(obj, null, 2) + "\n");
    },
  };
}

const mask = (v) => (v ? v.slice(0, 8) + "…" : "(empty)");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Waffo 客户端
// ---------------------------------------------------------------------------
class WaffoClient {
  constructor({ apiBase, merchantId, privateKeyPem, dispatcher, log }) {
    this.apiBase = apiBase.replace(/\/+$/, "");
    this.merchantId = merchantId;
    this.key = crypto.createPrivateKey(privateKeyPem);
    this.dispatcher = dispatcher;
    this.log = log;
  }

  signedHeaders(pathname, body) {
    const ts = Math.floor(Date.now() / 1000).toString();
    const bodyHash = crypto.createHash("sha256").update(body).digest("base64");
    const canonical = `POST\n${pathname}\n${ts}\n${bodyHash}`;
    const signature = crypto.sign("RSA-SHA256", Buffer.from(canonical), this.key).toString("base64");
    return {
      "content-type": "application/json",
      "X-Merchant-Id": this.merchantId,
      "X-Timestamp": ts,
      "X-Signature": signature,
    };
  }

  async post(pathname, payload) {
    const body = JSON.stringify(payload ?? {});
    const res = await undiciFetch(this.apiBase + pathname, {
      method: "POST",
      headers: this.signedHeaders(pathname, body),
      body,
      ...(this.dispatcher ? { dispatcher: this.dispatcher } : {}),
    });
    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      /* non-json */
    }
    return { status: res.status, ok: res.ok, json, text };
  }

  async gql(query, variables = {}) {
    const r = await this.post(GRAPHQL_PATH, { query, variables });
    if (!r.ok) {
      throw new RefundError("waffo_graphql_failed", `GraphQL HTTP ${r.status}`, { status: r.status, body: r.text.slice(0, 500) });
    }
    if (!r.json || r.json.errors) {
      throw new RefundError("waffo_graphql_errors", "GraphQL 返回 errors", { errors: r.json?.errors ?? r.text.slice(0, 500) });
    }
    return r.json.data;
  }

  /**
   * 官方文档（docs.waffo.ai/api-reference/endpoints/refunds/create-refund-ticket）：
   *   body: paymentId, reason, requestedAmount{amount:"10.50", currency}, refundTicketMerchantExternalId?
   *   200: { data: { ticket: { id, status, subjectId, refundTicketMerchantExternalId } } }
   *   4xx 不重试；5xx/503 指数退避重试（官方建议 5s 起、最多 3 次）
   *   merchant API key 提交 = 自动批准，ticket 直接进 processing
   */
  async createRefundTicket({ paymentId, reason, amountDecimal, currency, refundTicketMerchantExternalId }) {
    const payload = {
      paymentId,
      reason,
      requestedAmount: { amount: amountDecimal, currency },
      ...(refundTicketMerchantExternalId ? { refundTicketMerchantExternalId } : {}),
    };
    let last = null;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      last = await this.post(CREATE_TICKET_PATH, payload);
      const error = last.json?.errors?.[0];
      if (last.ok && !error) {
        const data = last.json?.data ?? last.json;
        const ticket = data?.ticket ?? data?.refundTicket ?? data;
        const id = ticket?.id ?? data?.id ?? data?.ticketId ?? data?.refundTicketId ?? null;
        if (!id) {
          throw new RefundError("waffo_create_ticket_no_id", "create-ticket 返回成功但找不到 ticket id", { body: last.text.slice(0, 800) });
        }
        return { id: String(id), status: ticket?.status ?? null, raw: ticket };
      }
      const retryable = last.status >= 500 || last.status === 503;
      if (!retryable || attempt === 3) break;
      this.log.info(`[refund] create-ticket 返回 ${last.status}（可重试，5xx/503），${5 * attempt}s 后重试 ${attempt}/3`);
      await sleep(5000 * attempt);
    }
    const error = last?.json?.errors?.[0];
    throw new RefundError("waffo_create_ticket_failed", error?.message || `HTTP ${last?.status}`, {
      status: last?.status,
      body: String(last?.text ?? "").slice(0, 800),
    });
  }
}

class RefundError extends Error {
  constructor(code, message, details) {
    super(message);
    this.name = "RefundError";
    this.code = code;
    this.details = details;
  }
}

// ---------------------------------------------------------------------------
// R2 客户端（SigV4 预签名，零依赖；与 packages/core/src/r2.ts 同算法）
// ---------------------------------------------------------------------------
class R2Client {
  constructor(env, dispatcher) {
    this.accountId = env.R2_ACCOUNT_ID;
    this.accessKeyId = env.R2_ACCESS_KEY_ID;
    this.secretAccessKey = env.R2_SECRET_ACCESS_KEY;
    this.bucket = env.R2_BUCKET;
    let endpoint = env.R2_ENDPOINT;
    if (!endpoint) {
      if (!this.accountId) throw new RefundError("config", "缺少 R2_ACCOUNT_ID / R2_ENDPOINT");
      endpoint = `https://${this.accountId}.r2.cloudflarestorage.com`;
    }
    if (!/^https?:\/\//.test(endpoint)) endpoint = `https://${endpoint}`;
    this.host = new URL(endpoint).host;
    this.dispatcher = dispatcher;
    if (!this.accessKeyId || !this.secretAccessKey || !this.bucket) {
      throw new RefundError("config", "R2 配置不完整（需要 R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET）");
    }
  }

  static enc(v) {
    return encodeURIComponent(v).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  }

  presign(method, key, expiresIn = 300) {
    const region = "auto";
    const service = "s3";
    const iso = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    const dateStamp = iso.slice(0, 8);
    const scope = `${dateStamp}/${region}/${service}/aws4_request`;
    const canonicalUri = `/${this.bucket}/${key.split("/").map(R2Client.enc).join("/")}`;
    const params = [
      ["X-Amz-Algorithm", "AWS4-HMAC-SHA256"],
      ["X-Amz-Credential", `${this.accessKeyId}/${scope}`],
      ["X-Amz-Date", iso],
      ["X-Amz-Expires", String(expiresIn)],
      ["X-Amz-SignedHeaders", "host"],
    ];
    const canonicalQuery = [...params]
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([k, v]) => `${R2Client.enc(k)}=${R2Client.enc(v)}`)
      .join("&");
    const canonicalRequest = [method, canonicalUri, canonicalQuery, `host:${this.host}\n`, "host", "UNSIGNED-PAYLOAD"].join("\n");
    const stringToSign = ["AWS4-HMAC-SHA256", iso, scope, crypto.createHash("sha256").update(canonicalRequest).digest("hex")].join("\n");
    const hmac = (keyBytes, data) => crypto.createHmac("sha256", keyBytes).update(data).digest();
    let signingKey = hmac(`AWS4${this.secretAccessKey}`, dateStamp);
    signingKey = hmac(signingKey, region);
    signingKey = hmac(signingKey, service);
    signingKey = hmac(signingKey, "aws4_request");
    const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");
    return `https://${this.host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
  }

  async getJson(key) {
    const url = this.presign("GET", key, 120);
    const res = await undiciFetch(url, { ...(this.dispatcher ? { dispatcher: this.dispatcher } : {}) });
    if (res.status === 404) return { found: false, key };
    const text = await res.text();
    if (!res.ok) throw new RefundError("r2_get_failed", `R2 GET ${key} → ${res.status}`, { body: text.slice(0, 300) });
    try {
      return { found: true, key, value: JSON.parse(text), etag: res.headers.get("etag") };
    } catch {
      throw new RefundError("r2_bad_json", `R2 ${key} 不是合法 JSON`);
    }
  }

  async putJson(key, value) {
    const body = JSON.stringify(value);
    const url = this.presign("PUT", key, 120);
    const res = await undiciFetch(url, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body,
      ...(this.dispatcher ? { dispatcher: this.dispatcher } : {}),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new RefundError("r2_put_failed", `R2 PUT ${key} → ${res.status}`, { body: text.slice(0, 300) });
    }
    return { key, bytes: Buffer.byteLength(body) };
  }
}

const orderKey = (site, id) => `orders/${site}/${id}.json`;

// ---------------------------------------------------------------------------
// 金额工具（全部用整数美分，避免浮点误差）
// ---------------------------------------------------------------------------
function centsFromDecimal(input) {
  const s = String(input).trim().replace(/^\$/, "");
  if (!/^\d+(\.\d{1,2})?$/.test(s)) throw new RefundError("bad_amount", `金额格式非法：${input}（应形如 2.90）`);
  const [whole, frac = ""] = s.split(".");
  return Number(whole) * 100 + Number((frac + "00").slice(0, 2));
}

function decimalFromCents(cents) {
  return (cents / 100).toFixed(2);
}

function formatMoney(m) {
  if (!m) return "?";
  return `${decimalFromCents(Number(m.amount))} ${m.currency}`;
}

// ---------------------------------------------------------------------------
// 主流程
// ---------------------------------------------------------------------------
async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return 0;
  }
  if (!args.order || !/^ord_[A-Za-z0-9_]+$/.test(args.order)) {
    throw new RefundError("bad_args", "--order 必填且应形如 ord_xxx");
  }
  if (args.site && !["voice", "headshot"].includes(args.site)) throw new RefundError("bad_args", "--site 只能是 voice|headshot");
  if (!Number.isFinite(args.timeoutSec) || args.timeoutSec <= 0) throw new RefundError("bad_args", "--timeout 非法");
  if (!Number.isFinite(args.pollSec) || args.pollSec < 1) throw new RefundError("bad_args", "--poll 非法");
  if (!Number.isFinite(args.maxAmount) || args.maxAmount <= 0) throw new RefundError("bad_args", "--max-amount 非法");

  const log = makeLogger(args.json);
  const env = parseEnvFile(args.envFile);
  for (const key of ["WAFFO_MERCHANT_ID", "WAFFO_STORE_ID", "WAFFO_PRIVATE_KEY"]) {
    if (!env[key]) throw new RefundError("config", `.env.local 缺少 ${key}`);
  }
  const apiBase = (env.WAFFO_API_BASE || DEFAULT_API_BASE).replace(/\/+$/, "");
  const mode = (env.WAFFO_MODE || "").toLowerCase();
  if (mode && mode !== "live") log.info(`[refund] WARN WAFFO_MODE=${mode}（非 live，退款会落在测试环境）`);

  const dispatcher = args.proxy ? new ProxyAgent(args.proxy) : undefined;
  log.info(`[refund] env=${path.basename(args.envFile)} api=${apiBase} merchant=${mask(env.WAFFO_MERCHANT_ID)} store=${mask(env.WAFFO_STORE_ID)} proxy=${args.proxy || "none"} dry_run=${args.dryRun}`);

  const waffo = new WaffoClient({
    apiBase,
    merchantId: env.WAFFO_MERCHANT_ID,
    privateKeyPem: toPem(env.WAFFO_PRIVATE_KEY),
    dispatcher,
    log,
  });
  const r2 = new R2Client(env, dispatcher);

  // 1) 找 payment -----------------------------------------------------------
  log.info(`[refund] 查询 Waffo payment：orderMerchantExternalId=${args.order}`);
  const data = await waffo.gql(
    `query($store:String!, $ref:String!) {
       payments(storeId:$store, filter:{ orderMerchantExternalId:{ eq:$ref } }) {
         id orderId status testMode
         amount { amount currency }
         refundedAmount { amount currency }
         isFullyRefunded refundStatus orderMerchantExternalId createdAt
         refunds { id paymentId ticketId status amount { amount currency } pspRefundId reason createdAt }
         onetimeOrder { id status total { amount currency } orderMerchantExternalId }
       }
       onetimeOrders(storeId:$store, filter:{ orderMerchantExternalId:{ eq:$ref } }) { id status total { amount currency } }
     }`,
    { store: env.WAFFO_STORE_ID, ref: args.order },
  );

  const payments = Array.isArray(data.payments) ? data.payments : [];
  if (payments.length === 0) {
    const orders = data.onetimeOrders || [];
    throw new RefundError(
      "payment_not_found",
      `Waffo 找不到该订单的 payment（order=${args.order}, wafoOrder=${orders.map((o) => o.id).join(",") || "无"}）。可能：没真实扣款 / 测试伪造单 / 订单号错误。`,
      { onetimeOrders: orders },
    );
  }
  const payment =
    payments.find((p) => p.status === "succeeded" && !p.isFullyRefunded) ||
    payments.find((p) => p.status === "succeeded") ||
    payments[0];
  if (!payment) throw new RefundError("payment_not_found", "payment 列表为空");
  if (payment.status !== "succeeded") {
    throw new RefundError("payment_not_succeeded", `payment ${payment.id} 状态是 ${payment.status}，只有 succeeded 才能退款`);
  }
  if ((payment.amount?.currency || "").toUpperCase() !== "USD") {
    throw new RefundError("unsupported_currency", `只支持 USD，实际 ${payment.amount?.currency}`);
  }

  const amountCents = Number(payment.amount?.amount ?? 0);
  const refundedCents = Number(payment.refundedAmount?.amount ?? 0);
  const remainingCents = Math.max(0, amountCents - refundedCents);

  // 2) 定位 R2 订单 --------------------------------------------------------
  let r2Site = args.site;
  let r2Order = null;
  if (!r2Site) {
    for (const site of ["voice", "headshot"]) {
      const got = await r2.getJson(orderKey(site, args.order));
      if (got.found) {
        r2Site = site;
        r2Order = got.value;
        log.info(`[refund] R2 订单：orders/${site}/${args.order}.json（status=${got.value?.status}, amountCents=${got.value?.amountCents}）`);
        break;
      }
    }
    if (!r2Site) log.info(`[refund] WARN R2 两站都找不到 orders/<site>/${args.order}.json（会继续退款，最后回写时告警）`);
  } else {
    const got = await r2.getJson(orderKey(r2Site, args.order));
    if (got.found) {
      r2Order = got.value;
      log.info(`[refund] R2 订单：orders/${r2Site}/${args.order}.json（status=${got.value?.status}, amountCents=${got.value?.amountCents}）`);
    } else {
      log.info(`[refund] WARN R2 找不到 orders/${r2Site}/${args.order}.json`);
    }
  }
  if (r2Order && Number.isFinite(Number(r2Order.amountCents)) && Number(r2Order.amountCents) !== amountCents) {
    log.info(`[refund] WARN R2 金额 ${r2Order.amountCents} 分 ≠ Waffo payment ${amountCents} 分（以 Waffo 为准）`);
  }

  // 3) 已有退款状态（幂等第一层）-------------------------------------------
  const existingRefunds = Array.isArray(payment.refunds) ? payment.refunds : [];
  const succeededRefund = existingRefunds.find((r) => String(r.status).toLowerCase() === "succeeded");
  const pendingRefund = existingRefunds.find((r) => ["pending", "processing"].includes(String(r.status).toLowerCase()));

  const baseReport = {
    order: args.order,
    r2Key: r2Site ? orderKey(r2Site, args.order) : null,
    paymentId: payment.id,
    waffoOrderId: payment.orderId,
    paymentStatus: payment.status,
    paymentAmountCents: amountCents,
    refundedAmountCents: refundedCents,
    remainingRefundableCents: remainingCents,
    isFullyRefunded: Boolean(payment.isFullyRefunded),
    refundStatus: payment.refundStatus,
    dryRun: args.dryRun,
    existingRefunds: existingRefunds.map((r) => ({
      id: r.id,
      status: r.status,
      amount: formatMoney(r.amount),
      ticketId: r.ticketId,
      pspRefundId: r.pspRefundId,
    })),
    r2OrderStatus: r2Order?.status ?? null,
    r2ProviderRefundId: r2Order?.providerRefundId ?? null,
  };

  if (payment.isFullyRefunded || payment.refundStatus === "refunded") {
    log.info(`[refund] 已是退款完成态（isFullyRefunded=${payment.isFullyRefunded}, refundStatus=${payment.refundStatus}）→ 幂等返回，不再创建 ticket`);
    let repaired = false;
    if (succeededRefund && r2Site) {
      const patch = buildR2Patch({ order: r2Order, payment, refund: succeededRefund, ticketId: succeededRefund.ticketId, note: args.note });
      if (!isR2AlreadyRefunded(r2Order, patch)) {
        if (args.dryRun) {
          log.info(`[refund] DRY-RUN 会补写 R2：${orderKey(r2Site, args.order)}（status=${r2Order?.status} → refunded）`);
        } else {
          await r2.putJson(orderKey(r2Site, args.order), patch);
          repaired = true;
          log.info(`[refund] 已补写 R2 退款字段：${orderKey(r2Site, args.order)}`);
        }
      } else {
        log.info("[refund] R2 已是 refunded 且 providerRefundId 一致，无需写入");
      }
    }
    const report = {
      ok: true,
      action: "already_refunded",
      ...baseReport,
      refundId: succeededRefund?.id ?? r2Order?.providerRefundId ?? null,
      pspRefundId: succeededRefund?.pspRefundId ?? null,
      r2Repaired: repaired,
      message: "payment 已全额退款：未调用任何写接口（幂等）",
    };
    log.out(report);
    return 0;
  }

  // 4) 有进行中的退款：只轮询，不重复创建 ----------------------------------
  if (pendingRefund) {
    log.info(`[refund] 已有进行中的退款 ${pendingRefund.id}（ticket=${pendingRefund.ticketId ?? "?"}, status=${pendingRefund.status}）→ 只轮询，不创建新 ticket`);
    const ticketId = pendingRefund.ticketId;
    if (args.dryRun) {
      log.out({ ok: true, action: "in_progress", ...baseReport, refundId: pendingRefund.id, ticketId, message: "已存在进行中的退款；dry-run 不轮询也不创建" });
      return 0;
    }
    const final = await pollTicket({ waffo, log, ticketId, timeoutSec: args.timeoutSec, pollSec: args.pollSec });
    const outcome = await finishAfterTicket({ waffo, r2, r2Site, r2Order, args, payment, ticketId, storeId: env.WAFFO_STORE_ID, log });
    log.out({ ok: final === "succeeded", action: final === "succeeded" ? "refunded" : "ticket_terminal", ...baseReport, ticketId, ticketStatus: final, ...outcome });
    return final === "succeeded" ? (outcome.r2Written === false ? 4 : 0) : 2;
  }

  // 5) 计算本次退款金额 ----------------------------------------------------
  let requestCents;
  if (args.amount !== null) {
    requestCents = centsFromDecimal(args.amount);
  } else {
    requestCents = remainingCents;
  }
  if (requestCents <= 0) throw new RefundError("amount_zero", `可退余额为 0（amount=${amountCents}, refunded=${refundedCents}）`);
  if (requestCents > remainingCents) {
    throw new RefundError("amount_exceeds_remaining", `请求退款 ${decimalFromCents(requestCents)} USD 超过可退余额 ${decimalFromCents(remainingCents)} USD`);
  }
  if (requestCents > args.maxAmount * 100) {
    throw new RefundError("amount_exceeds_max", `请求退款 ${decimalFromCents(requestCents)} USD 超过单笔保护上限 ${args.maxAmount} USD（确认无误可加 --max-amount ${decimalFromCents(requestCents)}）`);
  }
  const amountDecimal = decimalFromCents(requestCents);
  const createPayload = { paymentId: payment.id, reason: args.reason, requestedAmount: { amount: amountDecimal, currency: "USD" } };

  // 6) dry-run：只打印计划 -------------------------------------------------
  if (args.dryRun) {
    log.info(`[refund] DRY-RUN 计划：POST ${CREATE_TICKET_PATH} ${JSON.stringify(createPayload)}`);
    log.info(`[refund] DRY-RUN 不会创建 ticket、不会写 R2；真实执行请去掉 --dry-run`);
    log.out({
      ok: true,
      action: "dry_run",
      ...baseReport,
      wouldCreateTicket: createPayload,
      wouldMarkR2: r2Site ? { key: orderKey(r2Site, args.order), status: "refunded", refundedAt: "<waffo refund.createdAt>", providerRefundId: "<REF_...>", providerPaymentId: payment.id } : null,
      message: "只读演练完成（未产生任何写操作）",
    });
    return 0;
  }

  // 7) 交互确认（TTY）------------------------------------------------------
  if (process.stdin.isTTY && !args.yes) {
    const answer = await prompt(`确认对订单 ${args.order}（payment ${payment.id}）退款 ${amountDecimal} USD？输入 YES 继续：`);
    if (answer.trim() !== "YES") {
      log.info("[refund] 已取消（未创建 ticket）");
      log.out({ ok: false, action: "aborted", ...baseReport, message: "用户取消" });
      return 1;
    }
  }

  // 8) 创建退款 ticket -----------------------------------------------------
  // 官方文档建议带业务侧引用，便于 GraphQL 反查（refundTicketMerchantExternalId，≤128 字符）
  const refundTicketMerchantExternalId = `${args.order}-refund-${Date.now().toString(36)}`.slice(0, 128);
  log.info(`[refund] 创建退款 ticket：payment=${payment.id} amount=${amountDecimal} USD ref=${refundTicketMerchantExternalId}`);
  let ticket;
  try {
    ticket = await waffo.createRefundTicket({
      paymentId: payment.id,
      reason: args.reason,
      amountDecimal,
      currency: "USD",
      refundTicketMerchantExternalId,
    });
  } catch (error) {
    // 官方 409：`A refund record already exists` / `A refund ticket already exists` → 幂等收口
    const message = error instanceof RefundError ? String(error.message) : String(error);
    if (error instanceof RefundError && error.details?.status === 409 && /already exists/i.test(message)) {
      log.info(`[refund] Waffo 返回 409「${message}」→ 走幂等：查已有 refund/ticket，不重复创建`);
      const state = await lookupExistingRefundState({ waffo, payment, log });
      if (state.refund && String(state.refund.status).toLowerCase() === "succeeded") {
        const outcome = await finishAfterTicket({ waffo, r2, r2Site, r2Order, args, payment, ticketId: state.refund.ticketId, storeId: env.WAFFO_STORE_ID, log });
        log.out({ ok: true, action: "already_refunded", ...baseReport, refundId: state.refund.id, pspRefundId: state.refund.pspRefundId, ...outcome, message: "409 already exists → 已有成功退款，已幂等收口" });
        return outcome.r2Written === false ? 4 : 0;
      }
      if (state.ticketId) {
        const finalStatus = await pollTicket({ waffo, log, ticketId: state.ticketId, timeoutSec: args.timeoutSec, pollSec: args.pollSec });
        const outcome = await finishAfterTicket({ waffo, r2, r2Site, r2Order, args, payment, ticketId: state.ticketId, storeId: env.WAFFO_STORE_ID, log });
        log.out({ ok: finalStatus === "succeeded", action: finalStatus === "succeeded" ? "refunded" : "ticket_terminal", ...baseReport, ticketId: state.ticketId, ticketStatus: finalStatus, ...outcome, message: "409 already exists → 轮询既有 ticket" });
        if (finalStatus !== "succeeded") return 2;
        return outcome.r2Written === false ? 4 : 0;
      }
      throw error;
    }
    throw error;
  }
  log.info(`[refund] ticket 已创建：${ticket.id}（status=${ticket.status ?? "?"}）`);

  // 9) 轮询到终态 ----------------------------------------------------------
  const finalStatus = await pollTicket({ waffo, log, ticketId: ticket.id, timeoutSec: args.timeoutSec, pollSec: args.pollSec });
  const outcome = await finishAfterTicket({ waffo, r2, r2Site, r2Order, args, payment, ticketId: ticket.id, storeId: env.WAFFO_STORE_ID, log });

  const ok = finalStatus === "succeeded";
  log.out({
    ok,
    action: ok ? "refunded" : "ticket_terminal",
    ...baseReport,
    ticketId: ticket.id,
    ticketStatus: finalStatus,
    ...outcome,
    message: ok ? "退款成功，R2 订单已标记 refunded" : `ticket 终态为 ${finalStatus}，未退款（见 runbook 处置）`,
  });
  if (!ok) return 2;
  return outcome.r2Written === false ? 4 : 0;
}

async function lookupExistingRefundState({ waffo, payment, log }) {
  const data = await waffo.gql(
    `query($pid:String!) {
       refunds(filter:{ paymentId:{ eq:$pid } }) { id paymentId ticketId status amount { amount currency } pspRefundId reason createdAt refundTicketMerchantExternalId }
       refundTickets(filter:{ subjectId:{ eq:$pid } }) { id status subjectId refundTicketMerchantExternalId createdAt }
     }`,
    { pid: payment.id },
  );
  const refunds = data.refunds || [];
  const succeeded = refunds.find((r) => String(r.status).toLowerCase() === "succeeded") || null;
  const active = refunds.find((r) => ["pending", "processing"].includes(String(r.status).toLowerCase())) || null;
  const tickets = data.refundTickets || [];
  const openTicket = tickets.find((t) => !TERMINAL_TICKET_STATUSES.has(String(t.status).toLowerCase())) || null;
  const ticketId = openTicket?.id || active?.ticketId || succeeded?.ticketId || tickets[0]?.id || null;
  log.info(`[refund] 已有退款记录：refunds=${refunds.length}, tickets=${tickets.length}, ticketId=${ticketId ?? "none"}`);
  return { refund: succeeded || active, ticketId, refunds, tickets };
}

function isR2AlreadyRefunded(order, patch) {
  if (!order) return false;
  return (
    order.status === "refunded" &&
    Boolean(order.providerRefundId) &&
    order.providerRefundId === patch.providerRefundId
  );
}

function buildR2Patch({ order, payment, refund, ticketId, note }) {
  const now = new Date().toISOString();
  const current = order && typeof order === "object" ? order : {};
  const refundId = refund?.id ?? current.providerRefundId ?? null;
  const merged = {
    ...current,
    status: "refunded",
    refundedAt: refund?.createdAt || current.refundedAt || now,
    providerRefundId: refundId,
    providerPaymentId: payment.id,
    providerTicketId: ticketId ?? refund?.ticketId ?? current.providerTicketId ?? null,
    refundTicketMerchantExternalId: refund?.refundTicketMerchantExternalId ?? current.refundTicketMerchantExternalId ?? null,
    refundAmountCents: Number(refund?.amount?.amount ?? current.refundAmountCents ?? 0) || undefined,
    refundedAmountCents: Number(payment.refundedAmount?.amount ?? current.refundedAmountCents ?? 0) || undefined,
    refundCurrency: "USD",
    refundNote:
      note ||
      `Refund executed via tools/refund-waffo-order.mjs; Waffo refund ticket ${ticketId ?? refund?.ticketId ?? "?"} succeeded.`,
  };
  const history = Array.isArray(current.refunds) ? [...current.refunds] : [];
  if (refundId && !history.some((r) => r && r.id === refundId)) {
    history.push({
      id: refundId,
      ticketId: ticketId ?? refund?.ticketId ?? null,
      amountCents: Number(refund?.amount?.amount ?? 0) || null,
      currency: refund?.amount?.currency ?? "USD",
      pspRefundId: refund?.pspRefundId ?? null,
      status: refund?.status ?? "succeeded",
      createdAt: refund?.createdAt ?? now,
      source: "tools/refund-waffo-order.mjs",
    });
  }
  if (history.length > 0) merged.refunds = history;
  return merged;
}

async function pollTicket({ waffo, log, ticketId, timeoutSec, pollSec }) {
  const deadline = Date.now() + timeoutSec * 1000;
  let last = null;
  for (;;) {
    const data = await waffo.gql(
      `query($id:String!){ refundTicket(id:$id){ id status subjectId reviewedAt reviewNote rejectReason executedAt createdAt refundTicketMerchantExternalId } }`,
      { id: ticketId },
    );
    const ticket = data.refundTicket;
    if (!ticket) throw new RefundError("ticket_not_found", `查不到退款 ticket ${ticketId}`);
    last = ticket;
    const status = String(ticket.status).toLowerCase();
    log.info(`[refund] ticket ${ticketId} status=${status}${ticket.reviewNote ? ` reviewNote=${ticket.reviewNote}` : ""}${ticket.rejectReason ? ` rejectReason=${ticket.rejectReason}` : ""}`);
    if (TERMINAL_TICKET_STATUSES.has(status)) return status;
    if (Date.now() >= deadline) {
      throw new RefundError(
        "ticket_timeout",
        `ticket ${ticketId} 在 ${timeoutSec}s 内未到终态（当前 ${status}）。不要重复创建 ticket；稍后用 --dry-run 查状态，或按 runbook 人工跟进。`,
        { ticket },
      );
    }
    await sleep(pollSec * 1000);
  }
}

async function finishAfterTicket({ waffo, r2, r2Site, r2Order, args, payment, ticketId, storeId, log }) {
  // 重新查 payment + 该 payment 下的 refunds，拿到 refund id / pspRefundId
  const data = await waffo.gql(
    `query($store:String!, $ref:String!, $pid:String!) {
       payments(storeId:$store, filter:{ orderMerchantExternalId:{ eq:$ref } }) {
         id refundedAmount { amount currency } isFullyRefunded refundStatus
         refunds { id paymentId ticketId status amount { amount currency } pspRefundId reason createdAt }
       }
       refunds(filter:{ paymentId:{ eq:$pid } }) { id paymentId ticketId status amount { amount currency } pspRefundId reason createdAt }
     }`,
    { store: storeId, ref: args.order, pid: payment.id },
  );
  const freshPayment = (data.payments || []).find((p) => p.id === payment.id) || payment;
  const refunds = (data.refunds || []).filter((r) => r.paymentId === payment.id);
  const refund =
    refunds.find((r) => r.ticketId === ticketId) ||
    refunds.find((r) => String(r.status).toLowerCase() === "succeeded") ||
    null;

  const outcome = {
    refundId: refund?.id ?? null,
    pspRefundId: refund?.pspRefundId ?? null,
    refundStatus: refund?.status ?? null,
    refundedAmountCents: Number(freshPayment.refundedAmount?.amount ?? 0),
    isFullyRefunded: Boolean(freshPayment.isFullyRefunded),
    r2Key: r2Site ? orderKey(r2Site, args.order) : null,
    r2Written: null,
  };

  if (!r2Site) {
    log.info("[refund] WARN 退款成功但找不到 R2 订单文件（orders/<site>/<order>.json），跳过回写；请人工补写");
    outcome.r2Written = false;
    return outcome;
  }
  const patch = buildR2Patch({ order: r2Order, payment: { ...freshPayment, id: payment.id }, refund, ticketId, note: args.note });
  if (isR2AlreadyRefunded(r2Order, patch)) {
    log.info("[refund] R2 已标记 refunded（providerRefundId 一致），跳过写入");
    outcome.r2Written = true;
    return outcome;
  }
  try {
    const res = await r2.putJson(orderKey(r2Site, args.order), patch);
    outcome.r2Written = true;
    outcome.r2Bytes = res.bytes;
    log.info(`[refund] R2 已更新：${orderKey(r2Site, args.order)}（status=refunded, providerRefundId=${patch.providerRefundId}）`);
  } catch (error) {
    outcome.r2Written = false;
    outcome.r2Error = error instanceof Error ? error.message : String(error);
    log.info(`[refund] ERROR R2 回写失败：${outcome.r2Error}（退款已成功，需人工补写）`);
  }
  return outcome;
}

function prompt(question) {
  return new Promise((resolve) => {
    process.stderr.write(question + " ");
    process.stdin.setEncoding("utf8");
    process.stdin.once("data", (d) => {
      process.stdin.pause();
      resolve(String(d));
    });
    process.stdin.resume();
  });
}

// ---------------------------------------------------------------------------
// 入口
// ---------------------------------------------------------------------------
main()
  .then((code) => process.exit(code))
  .catch((error) => {
    const isRefundError = error instanceof RefundError;
    const payload = {
      ok: false,
      action: "error",
      error: isRefundError ? error.code : "unexpected",
      message: error instanceof Error ? error.message : String(error),
      ...(isRefundError && error.details ? { details: error.details } : {}),
    };
    if (process.argv.includes("--json")) process.stdout.write(JSON.stringify(payload) + "\n");
    else process.stderr.write(JSON.stringify(payload, null, 2) + "\n");
    process.exit(isRefundError ? (error.code === "ticket_timeout" ? 3 : String(error.code).startsWith("waffo_") ? 2 : 1) : 1);
  });
