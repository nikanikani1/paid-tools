# 付款清单（Mastercard 周五到）

> 2026-11-11 制定。目标：周五卡到后 **1 小时内付完**，不耽误当天开始联调。
> 原则：能免费的先免费；只为「上线必需 + AI 调用」付钱；Render 方案已弃用，改 Cloudflare Workers。

---

## 一、周五必须付（P0）

| # | 项目 | 金额 | 付给谁 / 链接 | 为什么必须 | 付款后给我什么 |
|---|---|---|---|---|---|
| 1 | **Cloudflare Workers Paid** | **$5/月**（账号级，含两站） | https://dash.cloudflare.com/a6d8b503165fb8f7b7e1a29d2209c90a/workers/plans → Paid 列 **Upgrade** | 托管两站；免费档 10ms CPU 跑不了 Next SSR | 页面上显示 Paid / Current plan；不用发我卡信息 |
| 2 | **2 个 .com 域名** | **$22.34/年**（$11.17 × 2，Cloudflare Registrar at-cost） | https://dash.cloudflare.com/a6d8b503165fb8f7b7e1a29d2209c90a/domains/registrations | 品牌 + SEO + GSC + 自定义域必需 | 域名列表；我配 DNS/Worker 路由 |
| 3 | **Replicate 充值** | **$10–20**（按次扣，无月费） | https://replicate.com/account/billing | 人声分离（demucs）+ 头像 face-swap；**主力 AI** | API Token（`r8_...`）放到 `.env.local` |
| 4 | **Cloudflare R2 开通** | **$0**（10GB 免费；需绑卡才可开通） | https://dash.cloudflare.com/a6d8b503165fb8f7b7e1a29d2209c90a/r2 | 存上传文件/分离结果/头像 zip；egress 免费 | R2 bucket + S3 API Token（Access Key/Secret） |

**P0 合计：$37.34 – $47.34**（Replicate 充 $10 或 $20）

---

## 二、可选 / 延后（P1）

| # | 项目 | 金额 | 什么时候付 | 备注 |
|---|---|---|---|---|
| 5 | **fal 充值** | $10 | 头像联调前；可先不付 | 只有用 `flux-pulid` 才需要；不想注册第二家就改用 Replicate Kontext + face-swap，成本 +6%，先 A/B 质量再定 |
| 6 | Resend Pro | $20/月 | 月邮件 >3,000 封或 >100 封/天 | 现在免费 3,000 封够用 |
| 7 | Neon Launch | ~$15/月 | 单项目 >1GB 或 >100 CU-hrs/月 | 现在 Free 够用 |
| 8 | Waffo 交易费 | 3.9% + $0.50/笔 | 有成交才扣 | 无预付；**务必确认现有商户合同费率** |
| 9 | RunPod / 自托管 | $0.89/hr 起 | 人声 >2,000–3,000 分钟/月再考虑 | 现在 API 更便宜 |
| 10 | 法务/隐私模板 | $0–50 | 上线前 | 可先用标准模板 + 自己改，不阻塞开发 |
| 11 | Logo/品牌设计 | $0 | 现在 | 先用文字 logo/免费模板，不阻塞 |

**明确不用付**：Render（已放弃）、Vercel、Stripe（用 Waffo）、域名隐私/SSL（Cloudflare 免费）、GitHub（免费 private repo）、GSC（免费）。

---

## 三、现在就能做（不需要卡）

- [ ] **注册 Replicate 账号**（免费）→ 先拿 API Token（`r8_...`）；充值等周五
- [ ] （可选）注册 fal 账号（免费）
- [ ] Cloudflare：确认两个域名候选；Turnstile widget 可先建（免费）；R2 等卡到再开通
- [ ] Neon：建 2 个免费项目（voice / headshot）→ pooler 连接串
- [ ] Resend：注册/登录，准备验证两个发件域（免费 3,000 封/月）
- [ ] GitHub：建 private repo `paid-tools`（免费）
- [ ] GSC：先不用建，域名买后再验证
- [ ] 把密钥写进 `D:\ai-workspace\paid-tools\.env.local`（**不要贴聊天**）

---

## 四、付款顺序（周五 30 分钟）

1. Cloudflare Workers Paid **$5**（升级后立即生效）
2. Cloudflare Registrar 买 2 个 .com（$22.34）
3. Replicate 绑卡充值 **$10–20**
4. Cloudflare R2 开通（绑卡，$0 用量）
5. （可选）fal 充值 $10
6. 把 API Token / R2 keys / Neon 连接串放进 `.env.local`，告诉我「已付完」
7. 我切真实 provider，跑 1 单人声 + 1 单头像 E2E，确认成本与耗时后部署

---

## 五、月度固定成本（付款后）

| 项 | 金额 |
|---|---|
| Cloudflare Workers Paid | $5.00/月 |
| 2 个 .com 摊销 | $1.86/月 |
| Neon / R2 / Resend / Turnstile | $0（免费额度内） |
| **合计** | **$6.86/月** |
| AI 成本 | 人声 $0.014/3 分钟；头像 $0.050/张（按量） |
| 支付费 | Waffo 3.9% + $0.50/笔（有成交才扣） |
