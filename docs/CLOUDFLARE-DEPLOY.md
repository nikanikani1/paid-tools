# Cloudflare Workers 部署手册（paid-tools 两站）

> 目标：把 `apps/voice`（人声分离）和 `apps/headshot`（AI 头像）用 **OpenNext + Wrangler** 部署到 Cloudflare Workers。
> 依据：本机 skill `site-eng-deploy`（Workers 路径实测结论）、`site-eng-stack`（Prisma/Next 16 约束）、`site-eng-accounts`（账号/密钥清单）。
> 当前状态（2026-11-11）：**配置已就绪，未安装依赖、未部署、未配置 secrets**；等 Mastercard 到账后按本文执行。

---

## 0. 结论 / 关键数字

| 项 | 值 |
|---|---|
| 托管 | 一个 Cloudflare 账号 = 2 个 Worker（`paid-tools-voice`、`paid-tools-headshot`） |
| 计费 | Workers Paid **$5/账号/月**（含 10M 请求 + 30M CPU ms；静态资源请求免费不限量） |
| 免费档 | 100k 请求/天 + **10ms CPU/次** → Next SSR 常见 10–20ms，**生产不要用免费档** |
| 构建 | **必须 Linux**（Windows 产物能上传但全站 500） |
| 构建配置 | 已写：`apps/*/open-next.config.ts`、`apps/*/wrangler.jsonc` |
| 入口 | `main = .open-next/worker.js`，`compatibility_flags = ["nodejs_compat", "global_fetch_strictly_public"]` |

---

## 1. 前置检查

1. **Node 版本**：`wrangler@4.160` 要求 **Node >= 22.12**（本机系统 Node 是 v20，不能本地跑 wrangler）。
   - 本地只做 `npm run build:voice` / `build:headshot`（`next build --webpack`）验证；
   - 真正 build/deploy 放 **Workers Builds（Linux）** 或 GitHub Actions（ubuntu）。
2. **Cloudflare 账号**：需 Workers Paid 计划（$5/月）；账号 ID 在 `dash.cloudflare.com` → 右下角/URL `accounts/<id>`。
3. **域名**：在 Cloudflare Registrar 或 Namecheap 注册后，**NS 必须托管到 Cloudflare**（Custom Domain 前提）。
4. **Neon**：两个项目（voice 库、headshot 库），连接串用 **pooler**：
   `postgresql://USER:PASS@ep-xxx-pooler.c-14.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connection_limit=1`
5. **R2**：一个 bucket（两站共用，按 `voice/`、`headshot/` 前缀隔离）+ S3 API Token（Access Key / Secret）。
6. **Resend**：验证发件域（SPF/DKIM），拿 API key。
7. **Waffo**：商户号/商店号/私钥/webhook 公钥（`site-eng-accounts` 已有 MER/STO 与公私钥）。

---

## 2. 依赖安装（Lead 统一执行，本任务未安装）

在仓库根：

```bash
npm install
```

本任务新增的依赖（已写入 package.json，`npm install` 后 `package-lock.json` 会更新）：

| 位置 | 依赖 | 版本 | 用途 |
|---|---|---|---|
| `apps/voice` devDependencies | `@opennextjs/cloudflare` | `^1.20.16` | OpenNext Workers 构建 |
| `apps/voice` devDependencies | `wrangler` | `^4.160.0` | Workers CLI/部署 |
| `apps/headshot` devDependencies | `@opennextjs/cloudflare` | `^1.20.16` | 同上 |
| `apps/headshot` devDependencies | `wrangler` | `^4.160.0` | 同上 |
| `packages/core` dependencies | `@prisma/client` | `^6.19.3` | Prisma 6 基线（**不要装 latest**：2026-11 npm latest 已是 7/8-rc） |
| `packages/core` dependencies | `@prisma/adapter-neon` | `^6.19.3` | Workers 用 `PrismaNeonHttp` |
| `packages/core` devDependencies | `prisma` | `^6.19.3` | CLI / migrate / generate |

> `@opennextjs/cloudflare@1.20.16` 的 peer：`next >=16.4.5`（本仓 next 16.4.5 ✅）、`wrangler ^4.148.0`（4.160 ✅）。
> 安装后 `apps/*/open-next.config.ts` 顶部的 `@ts-ignore` 可以删掉（保留也无害）。

---

## 3. 环境变量

来源：`packages/core/src/env.ts` 的 `ENV_SPEC`（唯一事实来源）。生产必需项缺任何一个，`readEnv().ok === false`。

| 组 | 变量 | 必需 | 说明 |
|---|---|---|---|
| core | `NEXT_PUBLIC_SITE_URL` | ✅ | 正式域名（canonical/邮件链接用）；**构建期变量**，Workers Builds 的 Build env 里设，不是只设 secret |
| core | `SESSION_SECRET` | ✅ | 会话/token 签名（64 hex） |
| core | `STATS_KEY` | — | 只读统计接口保护；不设则由 SESSION_SECRET 派生 |
| core | `SITE` | — | `voice` / `headshot`，成本日志归因 |
| db | `DATABASE_URL` | ✅ | Neon **pooler** 连接串（每站一个库） |
| ai | `REPLICATE_API_TOKEN` | ✅ | demucs 分离 + face-swap（两站共用） |
| ai | `FAL_KEY` | ✅ | flux-pulid 头像生成 |
| storage | `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET` | ✅ | 预签名直传/直下（`src/r2.ts`） |
| storage | `R2_PUBLIC_BASE_URL` | — | 可选：R2 自定义域 |
| payment | `WAFFO_MERCHANT_ID` / `WAFFO_STORE_ID` / `WAFFO_PRIVATE_KEY` / `WAFFO_WEBHOOK_PUBLIC_KEY` | ✅ | `src/payments/waffo.ts` |
| payment | `WAFFO_MODE`（live/test）、`WAFFO_API_BASE`、`WAFFO_SIGNATURE_HEADER` | — | 默认 test / api.waffo.ai / x-waffo-signature |
| email | `RESEND_API_KEY` / `NOTIFY_EMAIL_FROM` | ✅ | HTTP API（Workers 不支持 SMTP） |
| security | `TURNSTILE_SECRET_KEY` / `TURNSTILE_SITE_KEY` | — | 免费；建议上线前配 |

**设置方式（推荐顺序）**：

```bash
# 1) 非敏感 vars：wrangler.jsonc "vars" 或 Cloudflare 后台 Settings → Variables
# 2) 敏感 secrets：每个 Worker 各设一次（在 apps/voice、apps/headshot 目录执行）
npx wrangler secret put DATABASE_URL
npx wrangler secret put SESSION_SECRET
npx wrangler secret put REPLICATE_API_TOKEN
npx wrangler secret put FAL_KEY
npx wrangler secret put R2_ACCOUNT_ID       # 非敏感也可放 vars
npx wrangler secret put R2_ACCESS_KEY_ID
npx wrangler secret put R2_SECRET_ACCESS_KEY
npx wrangler secret put R2_BUCKET
npx wrangler secret put WAFFO_MERCHANT_ID
npx wrangler secret put WAFFO_STORE_ID
npx wrangler secret put WAFFO_PRIVATE_KEY
npx wrangler secret put WAFFO_WEBHOOK_PUBLIC_KEY
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put NOTIFY_EMAIL_FROM
npx wrangler secret put TURNSTILE_SECRET_KEY
# 本地 preview（wrangler dev）用 apps/<app>/.dev.vars，格式 KEY=value；.dev.vars* 已在 .gitignore
```

> `NEXT_PUBLIC_*` 在 `next build` 时被内联，**必须配置在构建环境**（Workers Builds 的 Build 环境变量），只设 runtime secret 不生效。

---

## 4. 构建（Linux 标准流程）

```bash
# 仓库根
npm ci
npx prisma generate --schema packages/core/prisma/schema.prisma

# 每站分别构建（产物 apps/<app>/.open-next/）
cd apps/voice && npx opennextjs-cloudflare build && cd -
cd apps/headshot && npx opennextjs-cloudflare build && cd -
```

**注意**：
- `opennextjs-cloudflare build` 内部会先跑 `next build`；本仓 app 的 `build` 脚本是 `next build --webpack`（Windows/Turbopack 兼容用）。若 OpenNext 内部调 `next build` 且 Linux 上 Turbopack 正常，则无需额外参数。
- 如果 Linux 上 Next 想用 webpack，先 `next build --webpack`，再 `npx opennextjs-cloudflare build --skipBuild`（跳过内部 next build）。
- Windows 本地**不要**尝试 `.open-next` 构建：产物能上传但运行时全 500（`site-eng-deploy` 2.2 实测，最小 create-next-app 也复现）。
- 构建失败先看 `open-next` 日志里的 `nodejs_compat` / Prisma adapter / `cacheComponents` 提示。

## 4.1 部署（Linux / 本机 Node ≥22 / Workers Builds）

```bash
cd apps/voice
npx wrangler deploy          # 读 wrangler.jsonc；首次会提示登录

cd apps/headshot
npx wrangler deploy
```

首次 `wrangler login` 用 **device code**（本机 localhost 回调有 IPv6 问题、2 分钟不完成会超时）：

```bash
npx wrangler login --device --browser=false
# 打开 https://dash.cloudflare.com/oauth2/device/verify 输入 8 位码
```

> 两个 Worker 的 `name` 全账号唯一：`paid-tools-voice`、`paid-tools-headshot`。重名报 `A project with that name already exists`。

---

## 5. Workers Builds（推荐，免 token）

Cloudflare 后台 → **Workers & Pages → Create → Connect GitHub**：

| 配置项 | 推荐值（单仓 monorepo） |
|---|---|
| 仓库 / 分支 | `nikanikani1/...`（paid-tools）/ 生产分支（默认 `main`，不是 main 要去 Settings → Builds → Branch control 改） |
| Root directory | **仓库根**（留空/`.`） |
| Build command | `npm run db:generate && npm run cf:build:voice`（headshot 换 `cf:build:headshot`） |
| Deploy command | `npm run cf:deploy:voice`（headshot 换 `cf:deploy:headshot`） |
| Preview command | `npx wrangler deploy --dry-run`（必填，可不生效） |
| 环境变量 | 上面的非敏感 vars + `NEXT_PUBLIC_SITE_URL`（Build env） |

**两个 app 要建两个 Workers Builds 项目**，root 都是仓库根，只有 build/deploy 命令不同。

备选方案（Root directory 填 `apps/voice` / `apps/headshot`）：Build command 保留 `npx opennextjs-cloudflare build`，Deploy `npx wrangler deploy`；但此时 `prisma generate` 需要在 build 命令里用相对路径执行（`cd ../.. && npx prisma generate --schema packages/core/prisma/schema.prisma`），否则 Prisma client 未生成。**踩坑记录**：Root directory 填错会直接 `Failed: root directory not found`；生产分支默认 `main`，代码在别的分支时必须在 Settings 改，否则部署的是 main 的旧代码或缺配置。

---

## 6. 部署后验证

```bash
# 1) 部署记录 / 实时日志
npx wrangler deployments list
npx wrangler tail                       # Ctrl+C 退出；1102=CPU 超限，1101=未捕获异常，hung=兼容问题

# 2) 冒烟（workers.dev；大陆不可直连，用代理）
HTTPS_PROXY=http://127.0.0.1:7897 curl -sS -o /dev/null -w '%{http_code}\n' https://paid-tools-voice.<workers-subdomain>.workers.dev/
HTTPS_PROXY=http://127.0.0.1:7897 curl -sS https://paid-tools-voice.<workers-subdomain>.workers.dev/api/version
```

- **`/api/version` 验收**（`site-eng-deploy` 第 5 节）：应返回 `{ commit, node/worker 环境 }`。
  ⚠️ 当前 **apps/*/app 里还没有 `/api/version` 路由**（页面文件不在 task-14 写作用域，由站点任务补）。
  上线前必须补：`app/api/version/route.ts` 返回 `{ commit: process.env.CF_PAGES_COMMIT_SHA ?? process.env.GIT_COMMIT ?? "dev", runtime: "cloudflare-workers" }`。
  临时替代：`curl -I` 首页 + `wrangler tail` 看是否有 500/hung。
- 自定义域生效后，逐项验证：首页、`/pricing`、核心 API、`sitemap.xml`、`robots.txt`（DNS TTL 提前降 60s，旧记录保留可回滚）。

---

## 7. 排错手册（对齐 site-eng-deploy 2.3 / 2.4）

| 症状 | 原因 | 修法 |
|---|---|---|
| 所有页面 500，`wrangler tail` 里 `setTimeout()` + `Workers runtime canceled... hung` | `cacheComponents`/PPR 在 Workers 上不兼容 | `next.config.ts` 关 `cacheComponents`、`partialPrefetching`，删 `export const instant`；本仓当前未开 PPR，保持关闭 |
| 打包失败（找不到 query engine / native） | Prisma 默认引擎在 Workers 不可用 | 用 `@prisma/adapter-neon` 的 **`PrismaNeonHttp`**（HTTP），不要用 WebSocket Pool |
| 请求挂住不返回 | 模块顶层创建 Prisma client / 用 `PrismaNeon` | 懒创建（`getPrisma()` 内创建），见 `packages/core/prisma/README.md` §3 |
| `Transactions are not supported in HTTP mode` | HTTP adapter 无事务 | `upsert` 改写「唯一键 + 先查后建 + catch 冲突」幂等写 |
| 免费档偶发 000/失败（PDF/DOCX 解析） | 免费档 10ms CPU/次 | 升 Workers Paid $5；或功能裁剪（本产品只做 AI I/O，不受影响） |
| `Error 1102 Worker exceeded resource limits` | CPU 超限 | 检查同步大循环/同步 JSON 解析；AI 等待是 I/O 不计 CPU |
| `Error 1027` | 免费档日请求超限 | 升 Paid |
| 自定义域 1016/522 | 域名 NS 未托管 Cloudflare / 记录冲突 | 先把 NS 迁到 CF，再绑 Custom Domain（会自动建 DNS + 证书） |
| 构建成功但线上 500（Windows 本地构建） | Windows 产物不兼容 Workers | 必须 Linux 构建（Workers Builds / GitHub Actions / WSL/Docker） |
| 页面 404（新分支） | Workers Builds 生产分支是 `main` | Settings → Builds → Branch control 改分支 |
| `A project with that name already exists` | Worker 名重复 | 改 `wrangler.jsonc` 的 `name` 或删旧项目 |

---

## 8. 回滚

```bash
npx wrangler versions list      # 版本历史
npx wrangler rollback           # 回上一版本（交互式）
```
- 自定义域切换前把 DNS TTL 降到 60s、保留旧记录；回滚 DNS 1 分钟内生效。
- 数据库迁移尽量只做向前兼容（新增列/表），回滚 Worker 不依赖回滚 DB。

---

## 9. 当前未完成 TODO（阻塞上线，按顺序）

1. **Lead 执行 `npm install`**（含第 2 节新增依赖），确认 `package-lock.json` 更新并提交。
2. **Prisma client 运行时封装**：`packages/core/src/db.ts`（懒创建 `PrismaNeonHttp`）— 本任务未包含，等依赖装好再加并 export；同时把 `waffo.ts` 的 `setWebhookStore()` / `cost.ts` 的 `setCostStore()` 接 Prisma 实现。
3. **`/api/version` 路由**（两站各一个）— 由站点任务补，部署验收用。
4. **数据库迁移**：两个 Neon 库各跑一次 `prisma migrate deploy`（见 `packages/core/prisma/README.md`）。
5. **R2 lifecycle**：`in/` 24–48h、`out/` 30 天删除（R2 控制台 → 对象生命周期规则）。
6. **secrets/vars**：按第 3 节写入两个 Worker（构建期变量单独设）。
7. **Workers Builds 两个项目**：按第 5 节创建，首次部署 + `/api/version` 冒烟。
8. **自定义域**：域名 NS 托管 CF 后绑定；上线前 `wrangler tail` 观察 30 分钟。
9. **`next.config.ts` 保持无 `cacheComponents`**：迁移期不要开 PPR（若将来要用 R2 增量缓存，按 open-next.config.ts 注释开）。

---

## 9. 实际部署记录（2026-11-12）

- A：https://paid-tools-voice.wanghaotiannika.workers.dev （Worker `paid-tools-voice`，version `c9d3ead8`）
- B：https://paid-tools-headshot.wanghaotiannika.workers.dev （Worker `paid-tools-headshot`，version `6efed6f6`）
- 两站 `/api/version` 200；生产 `POST /api/jobs`、`/api/orders` 均 **402 payment_required**（已实测）。
- 已配 secrets（25 个/站）：Replicate、R2、Waffo（商户/产品）、Neon URL、SESSION_SECRET、STATS_KEY、SITE 等。
- R2 bucket：`paid-tools-files`；S3 PUT/GET smoke test 200（`smoke.txt`）。
- 域名：`stemextractor.com` / `headshotsnap.com` 已在 Cloudflare 添加 zone（Free 计划），状态 **Pending Nameserver Update**；需在 Dynadot 把 NS 改为：
  - `felicia.ns.cloudflare.com`
  - `marjorie.ns.cloudflare.com`
- 自定义域 / `www→apex` 301 等 NS 生效后再加。

### Windows 构建注意（实测修正）

- `opennextjs-cloudflare build` 在 Windows **可以**成功，但必须把 `TMPDIR/TEMP/TMP` 指到可写目录（如 `D:/ai-workspace/paid-tools/.tmp`），否则 esbuild 写 `open-next-tmp` 报 Access denied。
- **构建前必须把根 `.env.local` 移走**：OpenNext 会把 `.env.local` 的所有变量（包括 token/私钥）打进 `.open-next/cloudflare/next-env.mjs`。生产构建只传 `NEXT_PUBLIC_SITE_URL_*`；密钥通过 `wrangler secret bulk` 注入运行时。
- 本次曾用带 `.env.local` 的构建部署过一版，旧版本 bundle 内含密钥；**上线前轮换 Cloudflare API token / R2 keys / Replicate token / Waffo private key**，并删除旧 Worker versions。
