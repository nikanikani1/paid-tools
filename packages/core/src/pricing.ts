import type { HeadshotPlan, VoicePlan } from "./types";

/**
 * 定价原则（对齐访谈《AI 工具站的订阅费应该怎么定》+ 用户要求「尽量不要免费试用」）：
 * - 不提供免费处理额度；入口是低客单「付费试用包」，不是 free trial。
 * - 年付 = 5 个月月费（访谈口径），不是 12 个月打折。
 * - 客单必须覆盖：获客成本 ÷ 付费转化率 ÷ 平均付费月数；上线前用真实数据校准。
 */
export const VOICE_PLANS: VoicePlan[] = [
  {
    id: "voice-trial",
    name: "Trial Pack",
    price: 2.9,
    minutes: 15,
    billing: "one-time",
    features: ["15 minutes, one-time", "4 stems", "WAV + MP3", "No subscription", "One-time payment"],
  },
  {
    id: "voice-starter",
    name: "Starter",
    price: 5,
    minutes: 90,
    billing: "monthly",
    features: ["90 minutes / month", "4 stems (vocals, drums, bass, other)", "WAV + MP3", "Batch upload", "No watermark"],
    popular: true,
  },
  {
    id: "voice-pro",
    name: "Pro",
    price: 9,
    minutes: 200,
    billing: "monthly",
    features: ["200 minutes / month", "4 + 6 stems", "High quality model", "Priority queue", "Commercial license"],
  },
  {
    id: "voice-annual",
    name: "Starter Annual",
    price: 39,
    minutes: 90,
    billing: "annual",
    features: ["90 minutes / month", "Billed $39/year (≈ 5 months of Starter)", "4 stems", "Priority support"],
  },
];

export const HEADSHOT_PLANS: HeadshotPlan[] = [
  {
    id: "headshot-trial",
    name: "Sample Pack",
    price: 9,
    images: 5,
    features: ["5 headshots", "1 style", "1 background", "One-time payment", "No subscription"],
  },
  {
    id: "headshot-40",
    name: "Starter",
    price: 35,
    images: 40,
    features: ["40 headshots", "2 outfits", "2 backgrounds", "1 free redo", "Commercial use"],
    popular: true,
  },
  {
    id: "headshot-60",
    name: "Professional",
    price: 45,
    images: 60,
    features: ["60 headshots", "4 outfits", "4 backgrounds", "1 free redo", "Premium resolution"],
  },
  {
    id: "headshot-100",
    name: "Executive",
    price: 75,
    images: 100,
    features: ["100 headshots", "All outfits", "All backgrounds", "Enhanced resolution", "Priority delivery"],
  },
];

/** 不提供免费处理额度；这两个常量保留给 UI 显示「0 free runs」用 */
export const FREE_VOICE_MINUTES = 0;
export const FREE_HEADSHOT_PREVIEWS = 0;
