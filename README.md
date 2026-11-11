# Paid Tools — 两个付费 AI 工具站

Monorepo：`apps/voice`（人声/伴奏分离）+ `apps/headshot`（AI 职业头像）+ `packages/core`（共享 mock/真实 provider、R2、Waffo、任务状态机）。

## 开发

```bash
npm install
npm run dev:voice      # http://localhost:3000
npm run dev:headshot   # http://localhost:3001（第二个 app 需 -- -p 3001）
npm run build
```

## 当前阶段（2026-11-11）

- 用户选择 Cloudflare Workers 部署，Mastercard 周五到；付款清单见 `docs/PAYMENT-CHECKLIST.md`。
- 现在为 **mock 模式**：不依赖 Replicate/fal/Cloudflare keys，先跑通 UI、任务状态机、页面与 SEO 骨架。
- 卡到/付款后：在 `.env.local` 填 key，把 `packages/core/src/providers/mock.ts` 切到真实实现，跑 E2E，再按 `site-eng-deploy` 部署 Workers。

## 文档

- `docs/TECH-SELECTION-v1.md`：技术选型与成本
- `docs/PAGE-MAP.md`：两站页面与关键词地图
- `docs/PAYMENT-CHECKLIST.md`：周五付款清单
- `docs/CLOUDFLARE-DEPLOY.md`：**Workers 构建/部署/排错手册**（依赖、env、Workers Builds、`/api/version`、500/hung 排查）

## Cloudflare Workers（部署）

两站各一个 Worker，配置已在 `apps/*/open-next.config.ts` + `apps/*/wrangler.jsonc`（`main=.open-next/worker.js`、`nodejs_compat`、`ASSETS` 绑定）。

```bash
# 一次性（Lead 统一）：装依赖（含 @opennextjs/cloudflare / wrangler / prisma 6 / @prisma/adapter-neon）
npm install

# 本地只验证 Next 构建（Windows 用 webpack；不要期望本地产出可部署的 Workers 包）
npm run build:voice
npm run build:headshot

# Cloudflare 构建/部署 —— 必须在 Linux（Workers Builds / GitHub Actions / WSL/Docker）
npx prisma generate --schema packages/core/prisma/schema.prisma
(cd apps/voice    && npx opennextjs-cloudflare build && npx wrangler deploy)
(cd apps/headshot && npx opennextjs-cloudflare build && npx wrangler deploy)

# 根目录快捷脚本（Linux 上等价）
npm run cf:build:voice && npm run cf:deploy:voice
npm run cf:build:headshot && npm run cf:deploy:headshot
```

> ⚠️ Windows 本地构建的 `.open-next` 产物能上传但线上全 500（site-eng-deploy 2.2 实测）——部署一律走 Linux。
> 详细 env 清单、Workers Builds 配置、`/api/version` 验收与排错见 [`docs/CLOUDFLARE-DEPLOY.md`](docs/CLOUDFLARE-DEPLOY.md)。
