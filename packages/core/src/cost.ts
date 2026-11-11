/**
 * cost.ts — 按 job 记录 provider 成本，用于算毛利（技术选型 §2/§3/§4）
 *
 * 价格来源：docs/TECH-SELECTION-v1.md（2026-11-11 实测/官方页）：
 *   - 人声分离 Replicate cjwbw/demucs：$0.014 / 3 分钟歌 ≈ $0.004667/分钟（T4 63s）
 *   - 质量档 lucataco/mvsep-mdx23：$0.16 / 首
 *   - 头像 fal flux-pulid $0.0333/MP + Replicate cdingram/face-swap $0.013 → ≈ $0.050/张（含重试系数）
 *
 * 用法（站点任务里，provider 返回后立刻记一笔）：
 *   recordJobCost({ jobId, site: "voice", ruleId: "voice:demucs", units: 3.2 });
 *   const cost = getJobCostUsd(jobId);           // 累计美元
 *   const m = grossMargin(5, cost);              // 毛利
 *
 * 存储：默认内存（globalThis，HMR/同 isolate 内共享）。生产换成 Prisma `Job.providerCostUsd`
 * + 这里 `setCostStore()` 注入 DB 实现（接口见 CostStore），不阻塞当前 mock 阶段。
 */

export type CostSite = "voice" | "headshot";
export type CostUnit = "minute" | "image" | "request" | "second";

export interface PriceRule {
  id: string;
  provider: "replicate" | "fal" | "other";
  model: string;
  unit: CostUnit;
  /** 每单位美元（保留 6 位计算，展示时四舍五入） */
  usdPerUnit: number;
  source: string;
  note?: string;
}

/** 价格表：改价时只改这里（并在 TECH-SELECTION 记一条变更）。 */
export const PRICE_BOOK: Record<string, PriceRule> = {
  "voice:demucs": {
    id: "voice:demucs",
    provider: "replicate",
    model: "cjwbw/demucs (htdemucs)",
    unit: "minute",
    usdPerUnit: 0.004667,
    source: "TECH-SELECTION §2.1：$0.014/3min（T4 63s）",
  },
  "voice:demucs-hq": {
    id: "voice:demucs-hq",
    provider: "replicate",
    model: "lucataco/mvsep-mdx23",
    unit: "request",
    usdPerUnit: 0.16,
    source: "TECH-SELECTION §2.2：$0.16/首（高质量档）",
  },
  "headshot:pulid": {
    id: "headshot:pulid",
    provider: "fal",
    model: "fal-ai/flux-pulid",
    unit: "image",
    usdPerUnit: 0.0333,
    source: "TECH-SELECTION §3.1：$0.0333/MP（1024² ≈ 1MP）",
  },
  "headshot:face-swap": {
    id: "headshot:face-swap",
    provider: "replicate",
    model: "cdingram/face-swap",
    unit: "image",
    usdPerUnit: 0.013,
    source: "TECH-SELECTION §3.1：$0.013/run",
  },
};

/** 头像单张综合成本（含 1.1 重生成 + 1.05 重试系数后的保守值） */
export const HEADSHOT_COST_PER_IMAGE_USD = 0.05;
/** 人声分离每分钟综合成本 */
export const VOICE_COST_PER_MINUTE_USD = 0.004667;
/** Waffo 官网公开费率（实际合同费率以商户后台为准） */
export const WAFFO_FEE_PCT = 0.039;
export const WAFFO_FEE_FIXED_USD = 0.5;

export interface JobCostEntry {
  jobId: string;
  site: CostSite;
  /** PRICE_BOOK 的 key；有 ruleId 就不用传 usdPerUnit/provider/model */
  ruleId?: string;
  provider?: PriceRule["provider"];
  model?: string;
  unit?: CostUnit;
  usdPerUnit?: number;
  /** 计量数量：分钟 / 张 / 次 */
  units: number;
  /** provider 返回的原始用量（tokens/秒等），便于对账 */
  rawUsage?: Record<string, number | string>;
  note?: string;
}

export interface JobCostRecord {
  id: string;
  jobId: string;
  site: CostSite;
  provider: PriceRule["provider"];
  model: string;
  ruleId?: string;
  unit: CostUnit;
  units: number;
  usdPerUnit: number;
  /** 本次成本（美元，6 位小数） */
  usd: number;
  rawUsage?: Record<string, number | string>;
  createdAt: string;
  note?: string;
}

export interface CostStore {
  record(record: JobCostRecord): void | Promise<void>;
  list(jobId: string): JobCostRecord[];
  all(): JobCostRecord[];
}

interface MemoryCostState {
  records: JobCostRecord[];
  byJob: Map<string, JobCostRecord[]>;
}

const globalState = globalThis as unknown as { __paidCostState?: MemoryCostState };
const memoryState: MemoryCostState = globalState.__paidCostState ?? (globalState.__paidCostState = { records: [], byJob: new Map() });

/** 默认内存 store。生产替换：setCostStore(prismaCostStore)。 */
export function createMemoryCostStore(): CostStore {
  return {
    record(record) {
      memoryState.records.push(record);
      const list = memoryState.byJob.get(record.jobId) ?? [];
      list.push(record);
      memoryState.byJob.set(record.jobId, list);
    },
    list: (jobId) => [...(memoryState.byJob.get(jobId) ?? [])],
    all: () => [...memoryState.records],
  };
}

let activeStore: CostStore = createMemoryCostStore();

export function setCostStore(store: CostStore): void {
  activeStore = store;
}

export function getCostStore(): CostStore {
  return activeStore;
}

function round6(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

/** 记一笔 provider 成本；返回落库记录（内存默认异步无关，调用方可不 await）。 */
export function recordJobCost(entry: JobCostEntry): JobCostRecord {
  if (!entry.jobId) throw new Error("[cost] jobId 必填");
  if (!Number.isFinite(entry.units) || entry.units < 0) throw new Error(`[cost] units 非法: ${entry.units}`);

  const rule = entry.ruleId ? PRICE_BOOK[entry.ruleId] : undefined;
  if (entry.ruleId && !rule) throw new Error(`[cost] 未知 ruleId: ${entry.ruleId}（可选: ${Object.keys(PRICE_BOOK).join(", ")}）`);

  const provider = entry.provider ?? rule?.provider;
  const model = entry.model ?? rule?.model;
  const unit = entry.unit ?? rule?.unit;
  const usdPerUnit = entry.usdPerUnit ?? rule?.usdPerUnit;
  if (!provider || !model || !unit || typeof usdPerUnit !== "number") {
    throw new Error("[cost] 需要 ruleId 或 provider/model/unit/usdPerUnit 四件套");
  }

  const record: JobCostRecord = {
    id: `cost_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    jobId: entry.jobId,
    site: entry.site,
    provider,
    model,
    ruleId: entry.ruleId,
    unit,
    units: entry.units,
    usdPerUnit,
    usd: round6(entry.units * usdPerUnit),
    rawUsage: entry.rawUsage,
    createdAt: new Date().toISOString(),
    note: entry.note,
  };
  // 默认内存 store 是同步的；若换成 Prisma/DB store（异步），持久化失败只告警不打断主流程
  void Promise.resolve(activeStore.record(record)).catch((error) => {
    console.warn(`[cost] 成本记录持久化失败（job ${entry.jobId}）: ${(error as Error).message}`);
  });
  return record;
}

export function getJobCosts(jobId: string): JobCostRecord[] {
  return activeStore.list(jobId);
}

/** 单个 job 累计 provider 成本（美元） */
export function getJobCostUsd(jobId: string): number {
  return round6(activeStore.list(jobId).reduce((sum, item) => sum + item.usd, 0));
}

/** 按 job 汇总（成本 + 售价 + 支付费 → 毛利），给 /api/cost 或日报用。 */
export function summarizeJobCost(jobId: string, priceUsd: number): {
  jobId: string;
  providerCostUsd: number;
  paymentFeeUsd: number;
  grossProfitUsd: number;
  grossMarginPct: number;
  records: JobCostRecord[];
} {
  const records = activeStore.list(jobId);
  const providerCostUsd = round6(records.reduce((sum, item) => sum + item.usd, 0));
  const margin = grossMargin(priceUsd, providerCostUsd);
  return { jobId, providerCostUsd, paymentFeeUsd: margin.paymentFeeUsd, grossProfitUsd: margin.grossProfitUsd, grossMarginPct: margin.grossMarginPct, records };
}

export interface CostSummary {
  count: number;
  totalUsd: number;
  byProvider: Record<string, number>;
  byModel: Record<string, number>;
  bySite: Record<string, number>;
}

export function summarizeCosts(records: JobCostRecord[] = activeStore.all()): CostSummary {
  const summary: CostSummary = { count: records.length, totalUsd: 0, byProvider: {}, byModel: {}, bySite: {} };
  for (const record of records) {
    summary.totalUsd = round6(summary.totalUsd + record.usd);
    summary.byProvider[record.provider] = round6((summary.byProvider[record.provider] ?? 0) + record.usd);
    summary.byModel[record.model] = round6((summary.byModel[record.model] ?? 0) + record.usd);
    summary.bySite[record.site] = round6((summary.bySite[record.site] ?? 0) + record.usd);
  }
  return summary;
}

// ---------------------------------------------------------------------------
// 预估 & 毛利
// ---------------------------------------------------------------------------

/** 人声分离预估：按音频分钟数 */
export function estimateVoiceJobCost(minutes: number): number {
  return round6(Math.max(0, minutes) * VOICE_COST_PER_MINUTE_USD);
}

/** 头像预估：按张数（$0.050/张，含重试系数） */
export function estimateHeadshotJobCost(images: number): number {
  return round6(Math.max(0, Math.floor(images)) * HEADSHOT_COST_PER_IMAGE_USD);
}

/** 按套餐/用量预估（给定价页与成本模型共用） */
export function estimateJobCost(site: CostSite, usage: { minutes?: number; images?: number }): number {
  return site === "voice" ? estimateVoiceJobCost(usage.minutes ?? 0) : estimateHeadshotJobCost(usage.images ?? 0);
}

/** Waffo 单笔手续费：3.9% + $0.50（官网公开价；合同费率另计） */
export function waffoFeeUsd(amountUsd: number): number {
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) return 0;
  return round6(amountUsd * WAFFO_FEE_PCT + WAFFO_FEE_FIXED_USD);
}

export interface MarginResult {
  revenueUsd: number;
  providerCostUsd: number;
  paymentFeeUsd: number;
  grossProfitUsd: number;
  grossMarginPct: number;
}

/** 毛利 = 售价 − AI 成本 − 支付手续费（未扣广告/人力/退款准备金） */
export function grossMargin(priceUsd: number, providerCostUsd: number, paymentFeeUsdOverride?: number): MarginResult {
  const revenueUsd = Number.isFinite(priceUsd) ? priceUsd : 0;
  const provider = Number.isFinite(providerCostUsd) ? providerCostUsd : 0;
  const fee = typeof paymentFeeUsdOverride === "number" ? paymentFeeUsdOverride : waffoFeeUsd(revenueUsd);
  const grossProfitUsd = round6(revenueUsd - provider - fee);
  const grossMarginPct = revenueUsd > 0 ? Math.round((grossProfitUsd / revenueUsd) * 10000) / 100 : 0;
  return { revenueUsd, providerCostUsd: round6(provider), paymentFeeUsd: round6(fee), grossProfitUsd, grossMarginPct };
}
