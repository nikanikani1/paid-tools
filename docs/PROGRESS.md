# 进度看板（2026-11-11 11:05）

## 本轮新增（审计 + 去免费试用）

- [x] 审计报告 `docs/AUDIT-vs-SKILL-2026-11-11.md`：对照 6 个访谈派生 skill + 41 篇提炼 + 第三/第五篇校准；发现 3 个 P0（免费试用、B 主词 18.1K<2万、跳过假门页）
- [x] 核心定价改为**无免费额度**：A Trial Pack $2.90/15min + Starter $5/90min + Pro $9/200min + Annual $39；B Sample Pack $9/5 张 + $35/40 + $45/60 + $75/100
- [x] A 站页面去免费承诺 / API 生产 402（task-15，voice-builder，19 routes 0 error）
- [x] B 站页面去免费预览 / API 生产 402（task-16，headshot-stack，18 routes 0 error）
- [x] 复核：两站生产 402；A 免费文案 0 命中；B 10 处均为否定/对比语境、0 处免费生成；build/typecheck 全 0 error
- [ ] B 站主词决策（18.1K < 2 万硬门槛）：付费实验 or 换词
- [ ] 假门页/预售价验证（目标 ≥20 留资或 ≥3 付费）

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

- [ ] Cloudflare Workers Paid $5、2 个 .com、Replicate $10–20、R2 开通（清单见 `PAYMENT-CHECKLIST.md`）
- [ ] 填 `.env.local`：Replicate token、R2 keys、Neon 连接串（可选 fal）
- [ ] 切真实 provider：demucs / flux-pulid / face-swap；跑 1 单人声 + 1 单头像 E2E
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
