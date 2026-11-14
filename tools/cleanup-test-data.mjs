#!/usr/bin/env node
/**
 * cleanup-test-data.mjs — 列出并安全清理 R2 里的测试数据（P1-7）
 *
 * 默认行为：DRY RUN（只读）。不会删除任何对象；只打印清单与将删除的 key/大小/原因。
 * 删除必须显式加 `--apply`。
 *
 * 数据布局（见 packages/core/src/orders.ts / jobs.ts / r2.ts）：
 *   orders/<site>/<orderId>.json           订单（pending/paid/refunded 证据）
 *   jobs/<kind>/<jobId>.json               AI 任务记录
 *   <site>/<in|out>/<YYYY-MM-DD>/<jobId>/<file>   上传/输出对象
 *
 * 保留规则（硬保护，永不删除）：
 *   - 真实付款/退款证据订单：ord_mwfzkg8h_yy9s9md（$2.90 真实卡，已退款）
 *                            ord_mwggroyd_1q2v4v3（$0.10 真实卡 QA 单，已退款）
 *   - B fanout 真实 E2E 证据（Lead 2026-11-14 指定保护）：
 *                            ord_mwg9ivk0_dgk2bjw + job headshot_mwg9j392_k4cqqp + 5 张输出
 *   - 与上述订单关联的 job / 输出（真实用户/证据数据）
 *   - 任何无法识别的 key（归入 unknown，不删）
 *
 * 自动删除（已批准类别，`--apply` 才执行）：
 *   - B 站 e2e 测试订单（手工标记 paid、无真实 Waffo payment）及其 jobs / 输出：
 *     ord_mwg8u8c2_cscke5i ord_mwg95akh_eohr2pu ord_mwg98npc_21xbl9p
 *     ord_mwgaj564_dups35c
 *   - QA 已退款单 ord_mwggroyd_1q2v4v3 的 job/输出（订单 JSON 保留为退款证据）
 *
 * 需人工决定（默认只列出，不删）：
 *   - pending QA checkout：ord_mwgfkkc3_6smw1w4 ord_mwgg5izz_g1066ru
 *     ord_mwghhfc7_o9i5jz2 ord_mwghi8yg_8kvhp00 等（`--include-pending-qa` 才纳入删除）
 *   - 其它历史测试订单 / 孤儿 job / 孤儿输出
 *
 * 用法：
 *   node tools/cleanup-test-data.mjs                  # dry-run，打印清单
 *   node tools/cleanup-test-data.mjs --json           # dry-run，输出机器可读 JSON
 *   node tools/cleanup-test-data.mjs --write-plan     # dry-run，并把计划写到 docs/evidence/
 *   node tools/cleanup-test-data.mjs --apply          # 备份清单后执行删除 + 删除后验证
 *   node tools/cleanup-test-data.mjs --apply --include-pending-qa
 *   可选：--env-file <path> --bucket <name> --out <manifest path>
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..");
const EVIDENCE_DIR = join(REPO_ROOT, "docs", "evidence");

// ---------------------------------------------------------------------------
// 规则常量（与 task-29 / docs/PROGRESS.md 对齐）
// ---------------------------------------------------------------------------

/** B 站 e2e 测试订单：脚本伪造/手工 marked paid，无真实 Waffo payment → 可删 */
const E2E_TEST_ORDER_IDS = [
  "ord_mwg8u8c2_cscke5i",
  "ord_mwg95akh_eohr2pu",
  "ord_mwg98npc_21xbl9p",
  "ord_mwgaj564_dups35c",
];

/** 真实付款/退款证据 + B fanout 真实 E2E 证据（Lead 指定）：订单 JSON 永远保留；关联 job/输出也保留 */
const PROTECTED_ORDERS = {
  ord_mwfzkg8h_yy9s9md: "真实付款 $2.90（Waffo live ORD_3FE3bBRlLEJaeliEA30nYS，已退款）— 退款证据，保留",
  ord_mwggroyd_1q2v4v3: "真实付款 $0.10 QA 单（已退款，REF_0KRhN70cseWHScS8fXld6D）— 退款证据，保留",
  ord_mwg9ivk0_dgk2bjw: "B fanout 真实 E2E 证据（Lead 2026-11-14 指定：job headshot_mwg9j392_k4cqqp + 5 张 headshot-0N.jpg）— 保留",
};

/** QA 已退款单：订单 JSON 保留；其 job/输出可删 */
const QA_REFUNDED_ORDER = "ord_mwggroyd_1q2v4v3";

/** pending QA checkout：先列出；--include-pending-qa 才删 */
const PENDING_QA_ORDER_IDS = [
  "ord_mwgfkkc3_6smw1w4",
  "ord_mwgg5izz_g1066ru",
  "ord_mwghhfc7_o9i5jz2",
  "ord_mwghi8yg_8kvhp00",
];

/** 订单 JSON 里没有 jobIds 时的兜底：job.input.orderId 命中这些订单视为测试 job */
const E2E_TEST_ORDER_SET = new Set(E2E_TEST_ORDER_IDS);

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = {
    apply: false,
    includePendingQa: false,
    includeHistorical: false,
    json: false,
    writePlan: false,
    help: false,
    envFile: join(REPO_ROOT, ".env.local"),
    bucket: null,
    out: null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--apply") opts.apply = true;
    else if (arg === "--dry-run") opts.apply = false;
    else if (arg === "--include-pending-qa") opts.includePendingQa = true;
    else if (arg === "--include-historical") opts.includeHistorical = true;
    else if (arg === "--json") opts.json = true;
    else if (arg === "--write-plan") opts.writePlan = true;
    else if (arg === "--help" || arg === "-h") opts.help = true;
    else if (arg === "--env-file") opts.envFile = resolve(process.cwd(), argv[++i] ?? "");
    else if (arg === "--bucket") opts.bucket = argv[++i] ?? null;
    else if (arg === "--out") opts.out = resolve(process.cwd(), argv[++i] ?? "");
    else {
      console.error(`[cleanup] 未知参数: ${arg}（--help 查看用法）`);
      process.exit(2);
    }
  }
  return opts;
}

const HELP = `cleanup-test-data.mjs — R2 测试数据清理（默认 dry-run）

  node tools/cleanup-test-data.mjs                     dry-run：列清单，不写不删
  node tools/cleanup-test-data.mjs --json              dry-run，机器可读输出
  node tools/cleanup-test-data.mjs --write-plan         dry-run + 计划写 docs/evidence/
  node tools/cleanup-test-data.mjs --apply             备份后执行删除，并做删除后验证
  node tools/cleanup-test-data.mjs --apply --include-pending-qa
  node tools/cleanup-test-data.mjs --apply --include-pending-qa --include-historical
       --env-file <path>  默认 <repo>/.env.local
       --bucket <name>    覆盖 R2_BUCKET
       --out <path>       覆盖 manifest 输出路径
       --dry-run          显式 dry-run（默认）
       --include-pending-qa   把 pending QA checkout 纳入删除（默认只列出）
       --include-historical   把历史测试订单/孤儿 job/孤儿输出纳入删除（默认只列出）

规则：保留真实/退款证据订单；只删测试订单及其 job/out；未识别 key 不删。`;

// ---------------------------------------------------------------------------
// 配置
// ---------------------------------------------------------------------------

function parseEnvFile(path) {
  if (!existsSync(path)) {
    throw new Error(`env 文件不存在: ${path}`);
  }
  const text = readFileSync(path, "utf8");
  const env = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function loadConfig(opts) {
  const env = parseEnvFile(opts.envFile);
  const required = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"];
  const missing = required.filter((k) => !env[k] || !env[k].trim());
  const bucket = opts.bucket || env.R2_BUCKET;
  if (!bucket || !bucket.trim()) missing.push("R2_BUCKET");
  if (missing.length) {
    throw new Error(`R2 配置缺失: ${missing.join(", ")}（检查 ${relative(process.cwd(), opts.envFile) || opts.envFile}）`);
  }
  const endpoint = (env.R2_ENDPOINT || `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`).replace(/\/+$/, "");
  return {
    bucket: bucket.trim(),
    endpoint,
    client: new S3Client({
      region: "auto",
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID.trim(),
        secretAccessKey: env.R2_SECRET_ACCESS_KEY.trim(),
      },
    }),
  };
}

// ---------------------------------------------------------------------------
// R2 操作
// ---------------------------------------------------------------------------

async function listAllObjects(client, bucket) {
  const objects = [];
  let ContinuationToken;
  do {
    const res = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken,
        MaxKeys: 1000,
      }),
    );
    for (const item of res.Contents ?? []) {
      if (!item.Key) continue;
      objects.push({
        key: item.Key,
        size: Number(item.Size ?? 0),
        lastModified: item.LastModified ? item.LastModified.toISOString() : null,
        etag: (item.ETag ?? "").replace(/"/g, ""),
      });
    }
    ContinuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return objects;
}

async function getJsonObject(client, bucket, key) {
  try {
    const res = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const text = await res.Body.transformToString("utf8");
    return { ok: true, json: JSON.parse(text), bytes: Buffer.byteLength(text) };
  } catch (error) {
    const code = error?.name || error?.Code || "";
    const status = error?.$metadata?.httpStatusCode;
    return { ok: false, code, status, message: error instanceof Error ? error.message : String(error) };
  }
}

async function headObject(client, bucket, key) {
  try {
    const res = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return { exists: true, size: Number(res.ContentLength ?? 0), lastModified: res.LastModified?.toISOString() ?? null };
  } catch (error) {
    const status = error?.$metadata?.httpStatusCode;
    if (status === 404 || error?.name === "NotFound" || error?.name === "NoSuchKey") {
      return { exists: false };
    }
    return { exists: null, error: error?.name || String(error) };
  }
}

async function deleteKeys(client, bucket, keys) {
  const deleted = [];
  const errors = [];
  for (let i = 0; i < keys.length; i += 1000) {
    const chunk = keys.slice(i, i + 1000);
    const res = await client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: chunk.map((k) => ({ Key: k })), Quiet: false },
      }),
    );
    for (const d of res.Deleted ?? []) if (d.Key) deleted.push(d.Key);
    for (const e of res.Errors ?? []) errors.push({ key: e.Key, code: e.Code, message: e.Message });
  }
  return { deleted, errors };
}

// ---------------------------------------------------------------------------
// 分类
// ---------------------------------------------------------------------------

function classify(objects, orderDocs, jobDocs, opts) {
  const plan = {
    delete: [], // {key,size,reason,orderId?}
    needsDecision: [], // {key,size,reason,orderId?,status?}
    protected: [], // {key,size,reason}
    unknown: [], // {key,size}
  };
  const ordersByKey = new Map();
  for (const o of orderDocs) ordersByKey.set(o.key, o);

  const jobsByKey = new Map();
  for (const j of jobDocs) jobsByKey.set(j.key, j);

  // 1) 关联关系：测试订单 -> jobIds
  const testOrderJobIds = new Set();
  const protectedOrderJobIds = new Set();
  for (const order of orderDocs) {
    const ids = Array.isArray(order.json?.jobIds) ? order.json.jobIds.filter(Boolean) : [];
    if (E2E_TEST_ORDER_SET.has(order.id)) ids.forEach((id) => testOrderJobIds.add(id));
    if (PROTECTED_ORDERS[order.id]) ids.forEach((id) => protectedOrderJobIds.add(id));
  }
  // 2) job 记录自身 orderId（worker 崩溃可能没 appendOrderJob）
  for (const job of jobDocs) {
    const orderId = job.json?.input?.orderId;
    if (!orderId) continue;
    if (E2E_TEST_ORDER_SET.has(orderId)) testOrderJobIds.add(job.id);
    if (PROTECTED_ORDERS[orderId] && orderId !== QA_REFUNDED_ORDER) protectedOrderJobIds.add(job.id);
    if (orderId === QA_REFUNDED_ORDER) testOrderJobIds.add(job.id);
  }
  // 3) jobId 在元数据里出现（backstop：jobIds 字段缺省）
  const jobIdsWithAnyTestRef = () => {
    const set = new Set(testOrderJobIds);
    for (const order of orderDocs) {
      if (!E2E_TEST_ORDER_SET.has(order.id)) continue;
      for (const value of Object.values(order.json ?? {})) {
        if (typeof value === "string" && value.startsWith("headshot_")) set.add(value);
      }
    }
    return set;
  };
  const deleteJobIds = jobIdsWithAnyTestRef();

  const pendingQaOrderIds = new Set(PENDING_QA_ORDER_IDS);
  for (const order of orderDocs) {
    const planId = String(order.json?.planId ?? "");
    if (/qa$/i.test(planId) || /-qa-/.test(planId)) pendingQaOrderIds.add(order.id);
  }

  const isTestJob = (job) => {
    const orderId = job.json?.input?.orderId;
    if (E2E_TEST_ORDER_SET.has(orderId)) return true;
    if (orderId === QA_REFUNDED_ORDER) return true;
    return deleteJobIds.has(job.id);
  };
  const isProtectedJob = (job) => {
    const orderId = job.json?.input?.orderId;
    // QA 已退款单只保留订单 JSON；其 job/输出按任务要求可删
    if (orderId === QA_REFUNDED_ORDER) return false;
    if (PROTECTED_ORDERS[orderId]) return true;
    return protectedOrderJobIds.has(job.id);
  };

  const jobIdOfKey = (key) => {
    const parts = key.split("/");
    // <site>/<in|out>/<date>/<jobId>/<file>
    if (parts.length >= 5 && (parts[0] === "voice" || parts[0] === "headshot") && (parts[1] === "in" || parts[1] === "out")) {
      return { site: parts[0], area: parts[1], day: parts[2], jobId: parts[3] };
    }
    return null;
  };

  for (const obj of objects) {
    const { key, size } = obj;

    // orders/<site>/<id>.json
    if (key.startsWith("orders/") && key.endsWith(".json")) {
      const parts = key.split("/");
      const site = parts[1];
      const id = parts[2]?.replace(/\.json$/, "");
      if (!site || !id) {
        plan.unknown.push({ key, size, reason: "orders/ 下无法解析的 key" });
        continue;
      }
      if (PROTECTED_ORDERS[id]) {
        plan.protected.push({ key, size, category: "protected_order", reason: `真实/退款证据订单（${site}）— ${PROTECTED_ORDERS[id]}` });
        continue;
      }
      if (E2E_TEST_ORDER_SET.has(id)) {
        plan.delete.push({
          key,
          size,
          category: "e2e_test_order",
          reason: `B 站 e2e 测试订单（${site}，手工标记 paid、无真实 Waffo payment）`,
          orderId: id,
        });
        continue;
      }
      if (pendingQaOrderIds.has(id)) {
        const doc = orderDocs.find((d) => d.key === key)?.json;
        const status = doc?.status ?? "unknown";
        const actionable = opts.includePendingQa ? plan.delete : plan.needsDecision;
        actionable.push({
          key,
          size,
          category: "pending_qa",
          reason: opts.includePendingQa
            ? `pending QA checkout（${site}，status=${status}，从未付款；--include-pending-qa 指定删除）`
            : `pending QA checkout（${site}，status=${status}，从未付款）— 待 Lead 决定`,
          orderId: id,
        });
        continue;
      }
      // 其它订单：默认人工决定；--include-historical 才纳入删除（历史 E2E/测试单，无真实 Waffo payment）
      const doc = orderDocs.find((d) => d.key === key)?.json;
      const actionable = opts.includeHistorical ? plan.delete : plan.needsDecision;
      actionable.push({
        key,
        size,
        category: "historical_order",
        reason: opts.includeHistorical
          ? `历史测试订单（${site}，status=${doc?.status ?? "?"}, plan=${doc?.planId ?? "?"}；无真实付款，非证据单）— --include-historical 指定删除`
          : `未列入批准清单的历史/未知订单（${site}，status=${doc?.status ?? "?"}, plan=${doc?.planId ?? "?"}）— 待 Lead 决定`,
        orderId: id,
      });
      continue;
    }

    // jobs/<kind>/<id>.json
    if (key.startsWith("jobs/") && key.endsWith(".json")) {
      const job = jobsByKey.get(key);
      if (!job) {
        plan.unknown.push({ key, size, reason: "jobs/ 下无法读取记录的 key" });
        continue;
      }
      if (isProtectedJob(job)) {
        plan.protected.push({ key, size, category: "protected_job", reason: `真实订单关联 job（orderId=${job.json?.input?.orderId ?? "?"}）` });
        continue;
      }
      if (isTestJob(job)) {
        const orderId = job.json?.input?.orderId;
        plan.delete.push({
          key,
          size,
          category: orderId === QA_REFUNDED_ORDER ? "qa_refunded_job" : "test_job",
          reason: `测试订单关联 job（kind=${job.kind}${orderId ? `, orderId=${orderId}` : ""}${job.json?.status ? `, status=${job.json.status}` : ""}）`,
          orderId,
          jobId: job.id,
        });
        continue;
      }
      const actionable = opts.includeHistorical ? plan.delete : plan.needsDecision;
      actionable.push({
        key,
        size,
        category: "orphan_job",
        reason: opts.includeHistorical
          ? `孤儿/历史 job（kind=${job.kind}, status=${job.json?.status ?? "?"}，无真实订单关联）— --include-historical 指定删除`
          : `孤儿/历史 job（kind=${job.kind}, status=${job.json?.status ?? "?"}, 无测试订单关联）— 待 Lead 决定`,
        jobId: job.id,
      });
      continue;
    }

    // <site>/<in|out>/<date>/<jobId>/<file>
    const parsed = jobIdOfKey(key);
    if (parsed) {
      const jobId = parsed.jobId;
      if (protectedOrderJobIds.has(jobId)) {
        plan.protected.push({ key, size, category: "protected_output", reason: `真实订单关联输出（${parsed.site}/${parsed.area}，jobId=${jobId}）` });
        continue;
      }
      if (deleteJobIds.has(jobId) || isTestJob({ id: jobId, kind: parsed.site, json: { input: {} } })) {
        plan.delete.push({
          key,
          size,
          category: "test_output",
          reason: `测试订单关联${parsed.area === "out" ? "输出" : "输入"}（${parsed.site}/${parsed.area}，jobId=${jobId}）`,
          jobId,
        });
        continue;
      }
      const actionable = opts.includeHistorical ? plan.delete : plan.needsDecision;
      actionable.push({
        key,
        size,
        category: "orphan_output",
        reason: opts.includeHistorical
          ? `孤儿/历史 ${parsed.site}/${parsed.area} 对象（jobId=${jobId}，无真实订单关联）— --include-historical 指定删除`
          : `孤儿/历史 ${parsed.site}/${parsed.area} 对象（jobId=${jobId}，无测试订单关联）— 待 Lead 决定`,
        jobId,
      });
      continue;
    }

    plan.unknown.push({ key, size, reason: "无法识别的 key（不删）" });
  }

  return { plan, testOrderJobIds, deleteJobIds };
}

// ---------------------------------------------------------------------------
// 输出 / 备份 / 验证
// ---------------------------------------------------------------------------

function fmtBytes(n) {
  if (!Number.isFinite(n) || n <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  return `${(n / 1024 ** i).toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

function sumBytes(items) {
  return items.reduce((acc, x) => acc + (Number(x.size) || 0), 0);
}

function compactTs(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}-${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}`;
}

function printPlan(result, meta) {
  const { plan, orderDocs, jobDocs, objects } = result;
  console.log(`\n=== R2 测试数据清理（${meta.apply ? "APPLY" : "DRY-RUN"}）===`);
  console.log(`bucket: ${meta.bucket}   对象总数: ${objects.length}   读取订单: ${orderDocs.length}   job: ${jobDocs.length}`);
  console.log(`选项: includePendingQa=${meta.includePendingQa} includeHistorical=${meta.includeHistorical}`);
  console.log(`将删除: ${plan.delete.length} 个对象 / ${fmtBytes(sumBytes(plan.delete))}`);
  console.log(`待决定: ${plan.needsDecision.length} 个对象 / ${fmtBytes(sumBytes(plan.needsDecision))}`);
  console.log(`受保护: ${plan.protected.length} 个对象 / ${fmtBytes(sumBytes(plan.protected))}`);
  console.log(`无法识别: ${plan.unknown.length} 个对象（不删）`);

  const section = (title, items) => {
    if (!items.length) {
      console.log(`\n-- ${title}: 0 --`);
      return;
    }
    const groups = new Map();
    for (const item of items) {
      const category = item.category ?? "other";
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(item);
    }
    console.log(`\n-- ${title}: ${items.length} 个对象 / ${fmtBytes(sumBytes(items))} --`);
    for (const [category, group] of groups) {
      console.log(`  [${category}] ${group.length} 个 / ${fmtBytes(sumBytes(group))}`);
      for (const item of group) {
        console.log(`    ${item.key}  ${fmtBytes(item.size)}  :: ${item.reason}`);
      }
    }
  };
  section("将删除（--apply 执行）", plan.delete);
  section("待 Lead 决定（默认不删）", plan.needsDecision);
  section("受保护（永不删）", plan.protected);
  section("无法识别（不删）", plan.unknown);
}

function writePlanFile(plan, meta, result) {
  const ts = compactTs();
  const path = meta.out || join(EVIDENCE_DIR, `r2-cleanup-plan-${ts}.json`);
  mkdirSync(dirname(path), { recursive: true });
  const payload = {
    generatedAt: new Date().toISOString(),
    mode: meta.apply ? "apply" : "dry-run",
    includePendingQa: meta.includePendingQa,
    includeHistorical: meta.includeHistorical,
    bucket: meta.bucket,
    options: { envFile: relative(REPO_ROOT, meta.envFile), out: path },
    orderSummaries: result.orderDocs.map((order) => ({
      key: order.key,
      site: order.site,
      id: order.id,
      status: order.json?.status ?? null,
      planId: order.json?.planId ?? null,
      amountCents: order.json?.amountCents ?? null,
      unitsGranted: order.json?.unitsGranted ?? null,
      unitsUsed: order.json?.unitsUsed ?? null,
      createdAt: order.json?.createdAt ?? null,
      paidAt: order.json?.paidAt ?? null,
      refundedAt: order.json?.refundedAt ?? null,
      hasEmail: Boolean(order.json?.email),
      jobIds: Array.isArray(order.json?.jobIds) ? order.json.jobIds : [],
      protected: Boolean(PROTECTED_ORDERS[order.id]),
      readError: order.readError ?? null,
    })),
    totals: {
      objects: result.objects.length,
      delete: { count: plan.delete.length, bytes: sumBytes(plan.delete) },
      needsDecision: { count: plan.needsDecision.length, bytes: sumBytes(plan.needsDecision) },
      protected: { count: plan.protected.length, bytes: sumBytes(plan.protected) },
      unknown: { count: plan.unknown.length, bytes: sumBytes(plan.unknown) },
    },
    delete: plan.delete,
    needsDecision: plan.needsDecision,
    protected: plan.protected,
    unknown: plan.unknown,
  };
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return path;
}

async function backupBeforeApply(result, meta) {
  const { plan, orderDocs, client } = result;
  const ts = compactTs();
  const dir = join(EVIDENCE_DIR, `r2-cleanup-backup-${ts}`);
  const manifestPath = meta.out || join(dir, "manifest.json");
  mkdirSync(join(dir, "orders"), { recursive: true });

  const backups = [];
  const warnings = [];
  for (const item of plan.delete) {
    const order = orderDocs.find((d) => d.key === item.key);
    if (!order || !order.json) {
      warnings.push({ key: item.key, warning: "订单 JSON 读取失败，仅记录 key/size（无内容备份）" });
      continue;
    }
    const site = order.site || "unknown";
    const target = join(dir, "orders", `${site}__${order.id}.json`);
    writeFileSync(target, `${JSON.stringify(order.json, null, 2)}\n`, "utf8");
    backups.push({ key: item.key, backupFile: relative(REPO_ROOT, target), bytes: Buffer.byteLength(JSON.stringify(order.json)) });
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    mode: "apply",
    includePendingQa: meta.includePendingQa,
    includeHistorical: meta.includeHistorical,
    bucket: meta.bucket,
    backupDir: relative(REPO_ROOT, dir),
    totals: {
      delete: { count: plan.delete.length, bytes: sumBytes(plan.delete) },
      needsDecision: { count: plan.needsDecision.length, bytes: sumBytes(plan.needsDecision) },
      protected: { count: plan.protected.length, bytes: sumBytes(plan.protected) },
      unknown: { count: plan.unknown.length, bytes: sumBytes(plan.unknown) },
    },
    // 删除前快照：受保护对象元数据（用于删除后对比）
    protectedSnapshot: [],
    delete: plan.delete,
    backups,
    warnings,
    needsDecision: plan.needsDecision,
    unknown: plan.unknown,
  };
  for (const item of plan.protected) {
    const head = await headObject(client, meta.bucket, item.key);
    manifest.protectedSnapshot.push({ key: item.key, size: item.size, exists: head.exists, lastModified: head.lastModified ?? null });
  }
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return { dir, manifestPath, manifest };
}

function writeManifestMarkdown(dir, manifest, verification) {
  const lines = [];
  lines.push(`# R2 测试数据清理 — apply 记录`);
  lines.push("");
  lines.push(`- 生成时间：${manifest.generatedAt}`);
  lines.push(`- 模式：apply${manifest.includePendingQa ? "（含 pending QA）" : ""}`);
  lines.push(`- bucket：\`${manifest.bucket}\``);
  lines.push(`- 备份目录：\`${manifest.backupDir}\``);
  lines.push("");
  lines.push(`## 删除清单（${manifest.delete.length} 个对象，${fmtBytes(manifest.totals.delete.bytes)}）`);
  lines.push("");
  lines.push("| key | bytes | reason |");
  lines.push("|---|---|---|");
  for (const item of manifest.delete) lines.push(`| \`${item.key}\` | ${item.size} | ${item.reason.replace(/\|/g, "\\|")} |`);
  lines.push("");
  lines.push(`## 保留（真实/退款/B fanout E2E 证据，${manifest.totals.protected.count} 个对象）`);
  lines.push("");
  for (const item of manifest.protected ?? []) lines.push(`- \`${item.key}\` — ${item.reason}`);
  lines.push("");
  lines.push(`## 待 Lead 决定（未删，${manifest.needsDecision.length} 个对象）`);
  lines.push("");
  for (const item of manifest.needsDecision) lines.push(`- \`${item.key}\` (${fmtBytes(item.size)}) — ${item.reason}`);
  lines.push("");
  lines.push(`## 删除后验证`);
  lines.push("");
  lines.push(`- 受保护订单仍可读：${verification.protectedReadable ? "✅ 是" : "❌ 否"}`);
  lines.push(`- 被删 key 已不存在：${verification.deletedGone ? "✅ 是" : "❌ 否"}`);
  lines.push(`- 残留（应为 0）：${verification.residualKeys.length}`);
  if (verification.residualKeys.length) {
    for (const key of verification.residualKeys) lines.push(`  - \`${key}\``);
  }
  lines.push(`- 错误：${verification.deleteErrors.length}`);
  for (const err of verification.deleteErrors) lines.push(`  - \`${err.key}\` ${err.code ?? ""} ${err.message ?? ""}`);
  lines.push("");
  lines.push(`详细 JSON：\`${relative(REPO_ROOT, join(dir, "manifest.json"))}\``);
  const mdPath = join(dir, "manifest.md");
  writeFileSync(mdPath, `${lines.join("\n")}\n`, "utf8");
  return mdPath;
}

async function verifyAfterApply(result, meta, deleteResult) {
  const { client, plan, orderDocs } = result;
  const protectedKeys = plan.protected.filter((p) => p.key.startsWith("orders/") && p.key.endsWith(".json"));
  const protectedChecks = [];
  for (const item of protectedKeys) {
    protectedChecks.push({ key: item.key, head: await headObject(client, meta.bucket, item.key) });
  }
  const protectedReadable =
    protectedChecks.length > 0 && protectedChecks.every((c) => c.head.exists === true);

  // 被删 key 逐一 HEAD（DeleteObjects 已返回 Deleted，但再确认一次）
  const stillThere = [];
  for (const item of plan.delete) {
    const head = await headObject(client, meta.bucket, item.key);
    if (head.exists !== false) stillThere.push(item.key);
  }
  const expectedGone = new Set(plan.delete.map((d) => d.key));
  const after = await listAllObjects(client, meta.bucket);
  const residualKeys = after.map((o) => o.key).filter((k) => expectedGone.has(k));

  return {
    protectedReadable,
    protectedChecks,
    deletedGone: stillThere.length === 0 && residualKeys.length === 0,
    residualKeys: [...new Set([...stillThere, ...residualKeys])],
    deleteErrors: deleteResult.errors,
    deletedCount: deleteResult.deleted.length,
    remainingObjects: after.length,
    protectedOrderDocs: orderDocs.filter((d) => PROTECTED_ORDERS[d.id]).map((d) => ({
      key: d.key,
      id: d.id,
      status: d.json?.status ?? null,
      refundedAt: d.json?.refundedAt ?? null,
    })),
  };
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(HELP);
    return;
  }

  const { client, bucket, endpoint } = loadConfig(opts);
  void endpoint;
  console.log(`[cleanup] ${opts.apply ? "APPLY" : "DRY-RUN"} bucket=${bucket} envFile=${opts.envFile}`);

  const objects = await listAllObjects(client, bucket);
  const orderObjects = objects.filter((o) => o.key.startsWith("orders/") && o.key.endsWith(".json"));
  const jobObjects = objects.filter((o) => o.key.startsWith("jobs/") && o.key.endsWith(".json"));

  console.log(`[cleanup] R2 对象 ${objects.length} 个，其中 orders ${orderObjects.length} / jobs ${jobObjects.length}`);

  const orderDocs = [];
  for (const obj of orderObjects) {
    const doc = await getJsonObject(client, bucket, obj.key);
    const parts = obj.key.split("/");
    orderDocs.push({
      key: obj.key,
      site: parts[1],
      id: parts[2]?.replace(/\.json$/, ""),
      json: doc.ok ? doc.json : null,
      readError: doc.ok ? null : `${doc.code ?? ""} ${doc.message ?? ""}`.trim(),
    });
  }
  const jobDocs = [];
  for (const obj of jobObjects) {
    const doc = await getJsonObject(client, bucket, obj.key);
    const parts = obj.key.split("/");
    jobDocs.push({
      key: obj.key,
      kind: parts[1],
      id: parts[2]?.replace(/\.json$/, ""),
      json: doc.ok ? doc.json : null,
      readError: doc.ok ? null : `${doc.code ?? ""} ${doc.message ?? ""}`.trim(),
    });
  }

  const result = { client, bucket, objects, orderDocs, jobDocs, ...classify(objects, orderDocs, jobDocs, opts) };
  const meta = {
    apply: opts.apply,
    includePendingQa: opts.includePendingQa,
    includeHistorical: opts.includeHistorical,
    bucket,
    envFile: opts.envFile,
    out: opts.out,
  };

  printPlan(result, meta);

  if (!opts.apply) {
    const planPath = opts.writePlan || opts.out ? writePlanFile(result.plan, meta, result) : null;
    if (planPath) console.log(`\n[cleanup] 计划已写入: ${relative(REPO_ROOT, planPath)}`);
    if (opts.json) {
      console.log(
        JSON.stringify(
          {
            mode: "dry-run",
            totals: {
              objects: objects.length,
              delete: { count: result.plan.delete.length, bytes: sumBytes(result.plan.delete) },
              needsDecision: { count: result.plan.needsDecision.length, bytes: sumBytes(result.plan.needsDecision) },
              protected: { count: result.plan.protected.length, bytes: sumBytes(result.plan.protected) },
              unknown: { count: result.plan.unknown.length },
            },
            delete: result.plan.delete,
            needsDecision: result.plan.needsDecision,
            protected: result.plan.protected,
          },
          null,
          2,
        ),
      );
    }
    return;
  }

  // ---- apply ----
  if (result.plan.delete.length === 0) {
    console.log("\n[cleanup] 没有需要删除的对象（apply 空操作），不写备份。");
    return;
  }
  const backup = await backupBeforeApply(result, meta);
  console.log(`[cleanup] 备份完成: ${relative(REPO_ROOT, backup.dir)} (manifest: ${relative(REPO_ROOT, backup.manifestPath)})`);

  const deleteResult = await deleteKeys(client, bucket, result.plan.delete.map((x) => x.key));
  console.log(`[cleanup] 删除完成: ${deleteResult.deleted.length} 成功 / ${deleteResult.errors.length} 失败`);

  const verification = await verifyAfterApply(result, meta, deleteResult);
  const mdPath = writeManifestMarkdown(backup.dir, { ...backup.manifest, protected: result.plan.protected }, verification);
  // 更新 manifest.json：追加删除结果 + 验证
  const manifestPath = meta.out || join(backup.dir, "manifest.json");
  const updated = {
    ...backup.manifest,
    deleteResult: { deleted: deleteResult.deleted.length, errors: deleteResult.errors },
    verification,
    manifestMarkdown: relative(REPO_ROOT, mdPath),
  };
  writeFileSync(manifestPath, `${JSON.stringify(updated, null, 2)}\n`, "utf8");

  console.log("\n=== 删除后验证 ===");
  console.log(`受保护订单仍可读: ${verification.protectedReadable ? "OK" : "FAIL"}`);
  console.log(`被删 key 已不存在: ${verification.deletedGone ? "OK" : "FAIL"}（残留 ${verification.residualKeys.length}）`);
  console.log(`删除错误: ${verification.deleteErrors.length}`);
  console.log(`剩余对象: ${verification.remainingObjects}`);
  console.log(`记录: ${relative(REPO_ROOT, manifestPath)}`);
  console.log(`报告: ${relative(REPO_ROOT, mdPath)}`);

  if (!verification.protectedReadable || !verification.deletedGone || verification.deleteErrors.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`[cleanup] 失败: ${error instanceof Error ? error.message : String(error)}`);
  if (error?.stack && process.env.DEBUG) console.error(error.stack);
  process.exitCode = 1;
});
