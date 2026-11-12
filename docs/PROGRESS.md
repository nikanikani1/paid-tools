# 进度看板（2026-11-12 12:20）

## 本轮新增（真实 AI 已跑通）

- [x] **Replicate token 已配**；真实 demucs 分离 E2E：3 秒音频 → 4 stems，predict 3.22s；App 层 `/api/jobs` → done
- [x] **B 站真实头像 E2E**：flux-kontext-pro (6.0s) + face-swap (8.0s) → 1024² 结果图；App 层 `/api/orders` → done
- [x] B 改 **Replicate-only**（不再需要 fal），单张 $0.053；TECH-SELECTION/cost 已更新
- [x] Neon：现有项目内建 `paid_voice` / `paid_headshot` 两 schema，`prisma db push` 成功；连接串已进 `.env.local`
- [x] 证据：`docs/REAL-E2E.md`
- [ ] **等用户提供：域名、Cloudflare API Token、R2 S3 keys+bucket、Waffo 产品 ID**（阻塞部署/支付）
- [ ] 假门页/预售价验证；i18n；GSC/统计；外链（上线后）

## 审计 + 去免费试用（2026-11-11）

- [x] 审计报告 `docs/AUDIT-vs-SKILL-2026-11-11.md`：对照 6 个访谈派生 skill + 41 篇提炼 + 第三/第五篇校准；发现 3 个 P0（免费试用、B 主词 18.1K<2万、跳过假门页）
- [x] 核心定价改为**无免费额度**：A Trial Pack $2.90/15min + Starter $5/90min + Pro $9/200min + Annual $39；B Sample Pack $9/5 张 + $35/40 + $45/60 + $75/100
- [x] A 站页面去免费承诺 / API 生产 402（task-15，voice-builder，19 routes 0 error）
- [x] B 站页面去免费预览 / API 生产 402（task-16，headshot-stack，18 routes 0 error）
- [x] 复核：两站生产 402；A 免费文案 0 命中；B 10 处均为否定/对比语境、0 处免费生成；build/typecheck 全 0 error
- [x] B 主词修正：首页 `professional headshots` 22,200/KD50，新子页 `/ai-headshot-generator` 18,100/KD41（已完成，13 页 / sitemap 13）
- [x] 域名候选实查（RDAP）：A `stemextractor.com` / B `headshotsnap.com`（备选见 docs/DOMAINS.md）
- [x] A 站 E-E-A-T：/about、/contact、/authors、7 工具页系统方法段、作者/更新日期（sitemap 16）
- [x] B 站 E-E-A-T 与免费措辞清零（task-19：/about、/contact、/authors、16 页署名/更新日期、免费正则 0 命中；sitemap 16）
- [x] 复核：两站 19/19 页面 200、build/typecheck 0 error、生产 402、sitemap 16/16
- [ ] 假门页/预售价验证（目标 ≥20 留资或 ≥3 付费）
- [ ] i18n zh/es、GSC/统计/Bing、外链计划（上线后）

## 已完成（工程侧）

- [x] Monorepo 骨架：`apps/voice`、`apps/headshot`、`packages/core`（npm workspaces）
- [x] 两站生产构建 0 error：voice 19 routes、headshot 17 routes；`npm run typecheck` 0 error
- [x] A 站页面：首页 + 7 工具页 + pricing/how-it-works/privacy/terms/refund + sitemap/robots/JSON-LD
- [x] B 站页面：首页 + 6 子页 + pricing/how-it-works/privacy/terms/refund + sitemap/robots/JSON-LD
- [x] Mock E2E：A 上传→进度→5 stems 下载 200；B 5 自拍→进度→40 文件
- [x] `/api/version` 两站已加（部署验收用）
- [x] Cloudflare 配置：`open-next.config.ts` / `wrangler.jsonc` 两站；部署文档 `CLOUDFLARE-DEPLOY.md`
- [x] 共享核心骨架：env、r2 预签名（WebCrypto SigV4）、waffo webhook、cost、Prisma schema
- [x] 依赖已安装（Next 16.4.5 / React 19 / Prisma 6.19 / opennext / wrangler）
- [x] 生产服务器路由自测：31 个页面/端点全部 200

## 待付款后做（2026-11-13）

- [x] Cloudflare Workers Paid、2 个 .com、Replicate $10、R2 开通（用户已确认 2026-11-12；域名具体名字待确认）
- [ ] 填 `.env.local`：R2 keys、Neon 连接串（已完成 voice/headshot schema）、Waffo 产品 ID
- [x] 切真实 provider：demucs / flux-kontext-pro / face-swap；已跑 1 单人声 + 1 单头像 E2E
- [ ] 接 Waffo checkout/webhook；部署 Cloudflare Workers；GSC/统计
- [ ] Neon 两库 `prisma migrate deploy`；`packages/core/src/db.ts` 懒创建 client
- [ ] R2 lifecycle（in 24–48h、out 30 天）、CORS、预签名实测
- [ ] Waffo 产品 ID + webhook 验签 + 额度扣减
- [ ] Workers Builds：GitHub 仓库、Linux 构建、两个 Worker 首次部署、自定义域
- [ ] GSC 验证 + sitemap 提交；Turnstile + 限流

## 本地预览

```bash
cd D:/ai-workspace/paid-tools
npm run dev:voice      # http://localhost:3000
npm run dev:headshot   # http://localhost:3001
```

> 注意：本机 Node 20 可跑 `next build`，但 `wrangler 4.160` 要求 Node ≥22.12；本地不要直接 `wrangler deploy`。部署走 Workers Builds（Linux，Node 22）或 GitHub Actions。

## 部署里程碑（2026-11-12）

- [x] A 站 Cloudflare Worker 部署：`paid-tools-voice` → https://paid-tools-voice.wanghaotiannika.workers.dev
- [x] B 站 Cloudflare Worker 部署：`paid-tools-headshot` → https://paid-tools-headshot.wanghaotiannika.workers.dev
- [x] 25 个 secrets/站（Replicate/R2/Waffo/Neon/会话）；R2 bucket `paid-tools-files`，S3 PUT/GET 200
- [x] 生产 402 门禁修复：不再依赖 NODE_ENV，无 ALLOW_MOCK/ALLOW_REAL 即 402
- [x] 部署后真实 demucs E2E：1 秒 WAV → 4 stems（predict 2.03s），随后删除 ALLOW_REAL 恢复 402
- [ ] **NS 切换**：Dynadot → `felicia/marjory.ns.cloudflare.com`，Cloudflare zone 激活
- [ ] 自定义域 + www→apex 301；Waffo checkout/webhook；R2 转存；GSC/统计
- [ ] **密钥轮换**：旧 Worker version 曾包含构建期密钥，上线前轮换 CF token / R2 keys / Replicate token / Waffo private key
