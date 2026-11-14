# DEPLOY-ROLLBACK — paid-tools 两站部署与回滚（task-27）

> 适用：A `stemextractor.com`（Worker `paid-tools-voice`）、B `headshotsnap.com`（Worker `paid-tools-headshot`）
> 最后更新：2026-11-15。原则：**CI 只验证不部署**；部署与回滚都留可复现命令与验证证据。

---

## 0. 一句话流程

```
CI（GitHub Actions, ci.yml）: npm ci → typecheck → 双站 next build      ← 只证明「能构建」，不碰生产
部署（二选一）:
  A) Cloudflare Workers Builds（推荐，免 token）：push main → CF 自动 opennext build + wrangler deploy
  B) Linux 机器 / Node ≥22 手工：npm ci → prisma generate → opennextjs-cloudflare build → wrangler deploy
验证: node tools/smoke-paid-tools.mjs && node tools/monitor-paid-tools.mjs
回滚: npx wrangler deployments list / versions list → npx wrangler rollback [version-id]
```

**为什么 CI 不部署**：仓库里没有 Cloudflare/生产 secrets；GitHub runner 构建产物还要 `wrangler deploy` 才上线，等于把生产写权限放进 Actions。当前策略是「CI 保证不坏代码进主干，部署用 Workers Builds 或手工」。

> CI 运行时：**Node 22**（`wrangler`/`miniflare`/`undici@7` 的 engines 要求 ≥22；生产 Worker runtime 报 `v22.23.4`）。本机 Node 20.10 只用于 `next build`、监控脚本与 typecheck —— 本轮的 typecheck 与双站 build 都已在 Node 20 通过，CI 换 Node 22 只为匹配 engines。

---

## 1. 前置与硬约束（踩过的坑）

| 约束 | 说明 |
| --- | --- |
| **必须 Linux 构建** | Windows 本地 `.open-next` 产物能上传但线上全 500（`site-eng-deploy` 2.2 实测，最小 Next 应用可复现）；用 Workers Builds / Linux / WSL/Docker |
| **wrangler 4.160 需要 Node ≥22** | 本机 Node 20.10 跑不了 wrangler；本机只能跑 `next build` 与监控脚本。要手工部署请换 Node 22+ 的机器 |
| Prisma client 先生成 | `npx prisma generate --schema packages/core/prisma/schema.prisma`（Workers Builds 的 Build command 里带上，或在仓库根先跑） |
| Worker 名唯一 | `paid-tools-voice` / `paid-tools-headshot`；重名报 `A project with that name already exists` |
| 生产分支 | Workers Builds 默认部署 `main`；代码在别的分支必须去 Settings → Builds → Branch control 改 |
| 不要提交 `.env.local` | 已在 `.gitignore`；泄露=密钥事故（见 docs/KEY-ROTATION-TUTORIAL.md） |
| PPR 保持关闭 | `next.config.ts` 不开 `cacheComponents`/`partialPrefetching`（Workers 上会 hang） |

---

## 2. 部署前检查（2 分钟）

```bash
cd D:/ai-workspace/paid-tools
git status --short          # 确认没有意外改动/未提交的敏感文件
git log --oneline -1        # 记下要上线的 commit
npm ci
npm run typecheck           # 必须 0 error
npm run build               # 双站 next build 必须 0 error（CI 等价步骤）
node tools/smoke-paid-tools.mjs   # 部署前基线（当前线上是否健康）
```

> `npm run build` 通过 ≠ 可以上线：它只证明 Next 构建层没问题，OpenNext/Workers 产物必须在 Linux 构建（§1）。

---

## 3. 部署方式 A：Cloudflare Workers Builds（推荐）

两个 app 各建一个 Workers Builds 项目（monorepo，root = 仓库根）：

| 配置项 | voice | headshot |
| --- | --- | --- |
| Build command | `npm run db:generate && npm run cf:build:voice` | `npm run db:generate && npm run cf:build:headshot` |
| Deploy command | `npm run cf:deploy:voice` | `npm run cf:deploy:headshot` |
| Preview command | `npx wrangler deploy --dry-run` | 同 |
| 环境变量（非敏感） | `NEXT_PUBLIC_SITE_URL_VOICE=https://stemextractor.com` 等 | `NEXT_PUBLIC_SITE_URL_HEADSHOT=https://headshotsnap.com` 等 |

生产 secrets（每个 Worker 各设一次，值只在 Cloudflare Dashboard / 本地 `.env.local`，**不要写进仓库**）：

```
DATABASE_URL, SESSION_SECRET, REPLICATE_API_TOKEN, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID,
R2_SECRET_ACCESS_KEY, R2_BUCKET, WAFFO_MERCHANT_ID, WAFFO_STORE_ID, WAFFO_PRIVATE_KEY,
WAFFO_WEBHOOK_PUBLIC_KEY, RESEND_API_KEY, NOTIFY_EMAIL_FROM, TURNSTILE_SECRET_KEY
（完整清单见 packages/core/src/env.ts 的 ENV_SPEC 与 docs/CLOUDFLARE-DEPLOY.md §3）
```

## 4. 部署方式 B：Linux / Node ≥22 手工

```bash
# 仓库根
npm ci
npx prisma generate --schema packages/core/prisma/schema.prisma

# A 站
cd apps/voice
npx opennextjs-cloudflare build     # 产物 .open-next/
npx wrangler deploy                 # 读 wrangler.jsonc
cd -

# B 站
cd apps/headshot
npx opennextjs-cloudflare build
npx wrangler deploy
cd -
```

首次登录用 device code：`npx wrangler login --device --browser=false`，打开终端打印的 `https://dash.cloudflare.com/oauth2/device/verify` 输入 8 位码。

---

## 5. 部署后验证（必须做，30 秒 ~ 2 分钟）

```bash
# 1) Worker 版本/部署记录
cd apps/voice && npx wrangler deployments list && cd -
cd apps/headshot && npx wrangler deployments list && cd -

# 2) 关键路径 smoke（期望 27/27 PASS，exit 0）
node tools/smoke-paid-tools.mjs

# 3) 指标巡检（期望 exit 0；warn=1 会列出短板）
node tools/monitor-paid-tools.mjs

# 4) 实时日志（观察 30 分钟；1102=CPU 超限、1101=未捕获异常、hang=兼容问题）
cd apps/voice && npx wrangler tail && cd -
```

线上人工点验清单：`/`、`/pricing`（**A 只有 $2.90 Trial Pack 可买、B 只有 $9 Sample Pack 可买**）、`/orders`、`/api/version`、`/sitemap.xml`（16 URL）、`/robots.txt`、`/llms.txt`。
新增的 `/api/health`（本轮已加入代码）只有**部署之后**才会 200；在那之前 404 属预期，别当故障。

> ⚠️ 已知限制：线上 `/api/version.commit` 目前是 `dev`（构建未注入 `GIT_COMMIT`），**无法用 commit 对账部署**。要让 `/api/version` 有真实 commit，需要在部署构建时注入 `GIT_COMMIT`（Workers Builds 环境变量或 build 命令里 `GIT_COMMIT=$(git rev-parse --short HEAD)`）。

---

## 6. 回滚

### 6.1 Worker 版本回滚（最快，1 分钟）

```bash
cd apps/voice
npx wrangler versions list      # 找到上一个正常 version-id
npx wrangler rollback           # 交互式：回上一 version
npx wrangler rollback <version-id>   # 或指定版本（若 CLI 版本支持该参数）

# 回滚后立刻验证
node tools/smoke-paid-tools.mjs
```

- 两个站要分别回滚（A 与 B 是独立 Worker）。
- Cloudflare 的 version 包含代码 + 配置（含该版本的 secrets 快照）。**如果事故是「新 secrets 配错」导致，回滚会带回旧 secrets**；需要按事故类型分别处理（配错 secret 的正确修法是 `wrangler secret put` 改对后重新部署，而不是回滚）。

### 6.2 从上一个 commit 重新部署（版本记录不可用时的兜底）

```bash
git log --oneline -5
git checkout <上一个正常 commit>     # 在 CI/Workers Builds 侧用「rollback to deployment」或临时分支
# 走 §3/§4 的构建 + 部署步骤，验证后 git checkout main
```

### 6.3 域名 / DNS 层回滚

- 自定义域是 Cloudflare Custom Domain（自动建 DNS + 证书）：把 Custom Domain 指回旧 Worker 即可秒级切换。
- 若切过 NS/记录：提前把 TTL 降到 60s 并保留旧记录，回滚 1 分钟内生效。

### 6.4 数据库

- 迁移只做**向前兼容**（新增列/表，不删不改类型）；回滚 Worker 不依赖回滚 DB。
- 真需要回退数据：先备份（Neon 分支/快照），再执行，不在本流程自动做。

---

## 7. 回滚决策表

| 症状 | 先判断 | 动作 |
| --- | --- | --- |
| 全站 5xx / 页面白屏，且刚部署 | 新版本问题 | §6.1 回滚 → smoke 验证 → 事后查 `wrangler tail` 日志 |
| 单个 API 502/503，页面正常 | 多为上游（Replicate/Waffo/R2） | 不回滚；查 `/api/orders/reconcile`、`/api/events`、CF 面板 |
| 支付链路异常（checkout 500） | 先看是否 secrets/产品 ID 配错 | 修 secret → 重新部署；不要在坏版本上改代码 |
| 线上 CPU 1102 | 新代码同步大循环/大 JSON | 回滚；把重活改到异步/流式 |
| 只有 SEO 文件异常（sitemap 404） | 构建产物缺静态文件 | 回滚或重新构建部署；`node tools/smoke-paid-tools.mjs` 会直接红 |
| 证书/域名错误（1016/522） | NS 或 Custom Domain 配置 | 修 DNS/Custom Domain，无需回滚 Worker |

---

## 8. 明确不做（纪律）

- ❌ 不在 CI 里 `wrangler deploy`（缺 secrets，且会把生产写权限放进 Actions）。
- ❌ 不用 Windows 本地 `.open-next` 产物部署。
- ❌ 不 `git commit` 任何 `.env.local` / 私钥 / webhook secret。
- ❌ 不在没有 `smoke` 通过的情况下宣布「部署完成」。

---

## 9. 当前生产事实（2026-11-15，写文档时的真实状态）

- 两站已 live：`https://stemextractor.com`、`https://headshotsnap.com`（`/api/version` 200，`commit=dev`，runtime `v22.23.4`）。
- `smoke` 27/27 PASS；`monitor` 22 checks 全 pass（详见 docs/OPS-MONITORING.md §9.4）。
- 已部署能力：事件 API（`/api/events`），R2（`r2:true`），sitemap 16 URL，安全头，付费闸门 402。
- 未部署：`/api/health`（本轮新增，等下次部署）、CF Web Analytics（无 token）、自动告警（脚本/workflow 已就绪，等 secrets）。
- 已知 P0（非本任务）：live webhook 全部 401，支付/退款状态暂靠 `/api/orders/reconcile` + `tools/refund-waffo-order.mjs`（见 docs/OPS-MONITORING.md §8.3）。
