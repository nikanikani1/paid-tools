# 进度看板（2026-11-11 10:55）

## 已完成

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
