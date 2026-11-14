# 密钥轮换与凭据卫生（P0，2026-11-14）

> 任务：task-24（安全/合规收敛）。本文件把「哪些密钥要轮换、在哪操作、怎么验证、怎么回滚、现在卡在哪」写清楚。
> **本文件不包含任何密钥值**（只写变量名/后台位置/操作路径）。不要把 `.env.local`、`cf-env.json`、`cf-secrets.json`、`.tmp/secrets-*.json` 的内容贴进聊天、issue 或文档。
> ⚠️ 结论：**截至本文撰写，没有任何一个生产密钥完成轮换**。这里不谎称已完成——已完成的是代码/仓库侧与核查，密钥轮换全部需要账号后台操作，属「阻塞 / 需用户操作」。

---

## 0. 状态总览（三栏）

### A. 已完成（本任务内可做且已做）

| 项 | 证据 |
|---|---|
| 仓库密钥泄漏审计（跟踪文件） | `git ls-files` 仅跟踪 `.env.example`；`.env` / `.env.local` / `.env.*.local` / `.tmp/` 已在 `.gitignore`；`git grep` 未在跟踪文件中发现私钥/API token 形态的值 |
| 定位所有本地明文密钥副本（只列路径，不读值） | `D:\ai-workspace\paid-tools\.env.local`、`.tmp/secrets-voice.json`、`.tmp/secrets-head.json`、`.tmp/webhook-test-private.pem`、`D:\ai-workspace\cf-env.json`、`D:\ai-workspace\cf-secrets.json`、`~/.dsh/skills/site-eng-accounts/SKILL.md` |
| 确认旧 Worker version 风险来源 | `docs/PROGRESS.md`（部署里程碑）与 `docs/CLOUDFLARE-DEPLOY.md` §9：曾用带 `.env.local` 的构建产部署过一版，旧 version bundle 内含构建期密钥 |
| 安全响应头落到代码 | `apps/voice/next.config.ts`、`apps/headshot/next.config.ts`（X-Content-Type-Options / Referrer-Policy / Permissions-Policy / X-Frame-Options + CSP report-only） |
| 轮换所需的「验证命令」全部去敏化 | 本文 §3：命令只读环境变量，不回显值 |
| .gitignore 缺口记录 | `.dev.vars`（wrangler 本地 secret 文件）未被显式忽略 → 见 C 栏 |

### B. 阻塞（需要平台权限/Dashboard，当前 token 不足）

| 项 | 阻塞原因 |
|---|---|
| 删除旧 Worker versions（含构建期密钥的 bundle） | 当前 Cloudflare API token **没有删除 version 的权限**（`docs/PROGRESS.md` 2026-11-12 记录）；只能到 Dashboard → Workers → 对应 Worker → Versions/Deployments 手动删 |
| Cloudflare API Token 轮换 | 账号级操作，需要用户在有 MFA 的账号里新建/吊销 token；本任务不能代做 |
| R2 Access Keys 轮换 | R2 管理员权限（当前 token 无 R2 admin），需要在 R2 → Manage R2 API Tokens 新建/吊销 |
| Workers secrets 更新（轮换后写入） | 需要 `wrangler secret put`（Node ≥22 + 登录态）或 Dashboard；本任务不部署 |
| 安全 headers 线上生效 | 配置已提交但**尚未部署**；部署属集成任务，本任务禁止 deploy |
| 生产验证（curl 响应头 / 轮换后 smoke） | 需部署后执行；当前线上无安全头（见 §5 现状） |

### C. 需用户操作（只有用户能做）

| # | 操作 | 说明 |
|---|---|---|
| 1 | 登录 Cloudflare Dashboard 删除两个 Worker 的旧 versions | 风险最高的遗留物；删之前先按 §2 完成密钥轮换，否则旧版本仍可回滚出旧密钥 |
| 2 | 新建 Cloudflare API token（Workers Scripts:Edit + Account Settings:Read），吊销旧 token | 旧 token 是否泄漏取决于它是否写进过已部署 bundle/日志；按「已泄漏」处理 |
| 3 | 轮换 R2 S3 Access Key（新建 → 写入 Worker → 验证 → 吊销旧） | 旧 key 曾写入 Worker secrets 与本地文件 |
| 4 | 轮换 Replicate API token | 旧 token 在本地明文文件与（可能的）构建产物里 |
| 5 | 轮换 Waffo 商户私钥 + webhook 公钥对 | 2026-11-14 刚切到 live key；live 私钥/公钥来自 `cf-secrets.json`/`.env.local`，按已暴露处理；Waffo 后台重生成后两站 secrets 各更新一次 |
| 6 | 重置 Neon 数据库密码（或新建 role）并更新 `DATABASE_URL` | 旧连接串在本地明文文件中；重置后旧连接串立即失效 |
| 7 | 轮换 Resend API key | 本机 skill 文件里曾有真实 key |
| 8 | 生成新的 `SESSION_SECRET`（两站各自独立） | 轮换会使已签发的会话/下载 token 失效，选低峰期做 |
| 9 | 清理本地明文副本：`.env.local`、`.tmp/secrets-*.json`、`.tmp/webhook-test-private.pem`、`cf-env.json`、`cf-secrets.json`、`~/.dsh/skills/site-eng-accounts/SKILL.md` | 移到密码管理器后 shred；**不要**再写回仓库 |
| 10 | 在 `.gitignore` 增加 `.dev.vars` / `.dev.vars.*` | 小改动，但不在 task-24 写作用域，需 Lead/其他任务落 |
| 11 | 确认 Waffo live 商户合同费率与退款权限（与轮换无关但同为 P0 依赖） | 见 `docs/PAYMENT-R2-2026-11-12.md` 已知项 |

---

## 1. 风险模型（为什么要全量轮换）

| 暴露面 | 事实 | 影响 |
|---|---|---|
| 旧 Worker version | 曾用带 `.env.local` 的构建部署；Workers 保留历史 versions | 有 Workers 读权限的人/被盗账号可查看旧 bundle、回滚出旧密钥；Cloudflare 侧日志也可能留痕 |
| 本地明文文件 | `.env.local`、`cf-*.json`、`.tmp/secrets-*.json`、skill 文件 | 本机被读 = 全部账号失守；这些文件也被多个 Agent 会话读取过环境 |
| Agent/会话上下文 | 构建/部署过程中密钥曾进入命令行与环境变量 | 终端 scrollback、CI 日志、聊天记录都可能持有副本 |
| 仓库 git | 未发现跟踪的密钥文件 | 目前未泄漏到 git；但 `.env.example` 曾列变量名（安全） |

**原则**：只要「可能进过构建产物 / 日志 / 本地明文 / 聊天」，就按已泄漏处理；轮换顺序 = 先建新 → 验证新 → 再吊销旧，避免服务中断。

---

## 2. 逐密钥操作清单（后台位置 / 步骤 / 验证 / 回滚）

> 通用：变量名来自 `packages/core/src/env.ts` 的 `ENV_SPEC`；写 secret 用 `wrangler secret put <NAME>`（在 `apps/voice`、`apps/headshot` 各执行一次），或在 Dashboard → Workers → Settings → Variables and Secrets 更新。**不要**把值写进 `wrangler.jsonc` 或仓库。

### 2.1 Cloudflare API Token（部署用）

| 项 | 内容 |
|---|---|
| 后台 | Cloudflare Dashboard → 右上头像 → My Profile → API Tokens |
| 新 token 权限 | Account → Workers Scripts:Edit；Account → Account Settings:Read；Zone → Workers Routes:Edit（自定义域需要） |
| 写入位置 | Workers Builds 的环境变量 / GitHub Actions secrets `CLOUDFLARE_API_TOKEN`；本机 `.env.local` 仅本地临时用 |
| 验证 | `CLOUDFLARE_API_TOKEN=<new> npx wrangler whoami`（应显示目标账号）；`npx wrangler versions list`（只读） |
| 吊销 | 验证通过后立即 Delete 旧 token |
| 回滚 | 在吊销旧 token 前保留旧 token；若新 token 权限不足，恢复旧 token 继续用，重新建新 token |

### 2.2 R2 Access Keys（S3 API）

| 项 | 内容 |
|---|---|
| 后台 | Dashboard → R2 → Manage R2 API Tokens → Create API Token（Object Read & Write，限定 bucket `paid-tools-files` 或全量） |
| 写入位置 | 两站 Worker secrets：`R2_ACCOUNT_ID`（非敏感）、`R2_ACCESS_KEY_ID`、`R2_SECRET_ACCESS_KEY`、`R2_BUCKET`；本地 `.env.local` 同步 |
| 验证 | 部署后用 `packages/core` 的 `presignPut` 走一次上传（或订单页）→ R2 控制台确认对象出现；`GET` 签名 URL 200 |
| 吊销 | R2 → API Tokens → 删除旧 token |
| 回滚 | 保留旧 token 至验证通过；失败则把 Worker secrets 回写旧值（旧值在密码管理器） |

### 2.3 Replicate API token

| 项 | 内容 |
|---|---|
| 后台 | https://replicate.com/account/api-tokens |
| 写入位置 | 两站 Worker secret `REPLICATE_API_TOKEN` |
| 验证 | `curl -sS -H "Authorization: Bearer $REPLICATE_API_TOKEN" https://api.replicate.com/v1/account`（200 且账号名正确）；再跑一次最小 demucs 预测（可用已有 `ALLOW_REAL` 测试单） |
| 吊销 | Replicate 后台删除旧 token |
| 回滚 | 旧 token 删除前保留；失败则 Worker secret 回写旧 token |

### 2.4 Waffo 商户私钥 + webhook 公钥

| 项 | 内容 |
|---|---|
| 后台 | Waffo 商户后台（Pancake）→ 开发者/API 设置 → 密钥对（具体菜单以 live 商户后台为准） |
| 写入位置 | 两站 Worker secrets：`WAFFO_MERCHANT_ID`、`WAFFO_STORE_ID`、`WAFFO_PRIVATE_KEY`、`WAFFO_WEBHOOK_PUBLIC_KEY`；`WAFFO_MODE=live` |
| 验证 | ① 建一笔 live checkout（$2.90 Trial）→ 返回 pancake.waffo.ai URL；② 用测试事件/真实小额单触发 webhook → 订单转 `paid`（两站 `/api/webhooks/waffo`） |
| 吊销 | Waffo 后台吊销旧密钥对 |
| 回滚 | 旧密钥对先保留：Waffo 一般不支持双活，回滚 = 把旧密钥写回 Worker；若已吊销则必须用新密钥重新走验证 |
| 注意 | 2026-11-14 刚把 test → live key 切换；live 密钥材料来自本地明文文件，**必须轮换** |

### 2.5 Neon `DATABASE_URL`

| 项 | 内容 |
|---|---|
| 后台 | Neon Console → 项目 → Roles → 重置密码（或新建 role 并改连接串） |
| 写入位置 | 两站 Worker secret `DATABASE_URL`（**pooler** 连接串，含 `sslmode=require&pgbouncer=true&connection_limit=1`） |
| 验证 | 部署后任一会写库的接口 200；或本地 `npx prisma db execute --url "$DATABASE_URL" --stdin`（只读 `SELECT 1`） |
| 回滚 | 密码重置不可逆但可再次重置；保留旧连接串备份直到验证通过（旧值随即失效，回滚=再重置一次并更新 secrets） |

### 2.6 Resend API key

| 项 | 内容 |
|---|---|
| 后台 | https://resend.com/api-keys → Create API Key（Sending access） |
| 写入位置 | 两站 Worker secret `RESEND_API_KEY`（当前业务主要用 R2 订单记录 + 邮件通知；未启用时也先轮换） |
| 验证 | `curl -sS -H "Authorization: Bearer $RESEND_API_KEY" https://api.resend.com/domains`（200） |
| 吊销 | Resend 后台删除旧 key；回滚 = Worker secret 回写旧 key |

### 2.7 `SESSION_SECRET` / `STATS_KEY`（自签密钥）

| 项 | 内容 |
|---|---|
| 生成 | `openssl rand -hex 32`（或 Node `crypto.randomBytes(32).toString("hex")`），两站分别独立，不复用 |
| 写入位置 | 两站 Worker secrets；`STATS_KEY` 不设则从 SESSION_SECRET 派生 |
| 影响 | 轮换会让旧会话/旧下载授权立即失效；选低峰期，提前在状态页/站内说明 |
| 验证 | 重新登录/下单流程可用；`/api/stats`（如启用）用新 key 200、旧 key 401 |
| 回滚 | 旧值在密码管理器 → 回写 Worker secret 即恢复 |

### 2.8 Turnstile（如启用）

| 项 | 内容 |
|---|---|
| 后台 | Cloudflare Dashboard → Turnstile → 对应 widget → Rotate secret / 新建 widget |
| 写入位置 | `TURNSTILE_SECRET_KEY`（Worker secret）、`TURNSTILE_SITE_KEY`（构建期变量或 wrangler vars） |
| 验证 | 表单提交带 token 成功；无效 token 被服务端拒绝 |
| 回滚 | 保留旧 widget 直到验证通过；site key 变更需重新部署前端 |

---

## 3. 旧 Worker version 风险处置（最高优先）

**风险**：`paid-tools-voice` / `paid-tools-headshot` 的历史 version 中，至少有一版是带 `.env.local` 构建的，可能内联了 `NEXT_PUBLIC_*` 之外的构建期变量；Workers 平台保留 versions 并可回滚 → 旧密钥仍然“活着”。

**处置顺序（必须按序，否则轮换无意义）**：

1. 轮换 §2 全部密钥（新密钥写入 Worker secrets，**不重新构建包含旧值的产物**）。
2. 触发一次干净部署（Workers Builds 用干净环境变量，不把 secret 作为 build env；`NEXT_PUBLIC_*` 按要求设）。
3. 验证：两站首页 200、`/pricing` 200、无订单 POST 402、headers 出现（见 §5）。
4. 到 Dashboard 删除旧 versions：Workers → 选 Worker → Deployments/Versions → 删除早于本次干净部署的所有 version（保留当前生产 version 1–2 个用于回滚）。
5. 记录：把删除前后的 version ID 截图/记录到本文件「执行记录」区（见 §7）。
6. 之后任何“怀疑泄漏”的密钥，重复 §2 + 干净部署 + 删版本。

**验证是否仍有旧版本**：

```bash
# 需要已登录的 wrangler（Node ≥22.12）
cd apps/voice && npx wrangler versions list
cd apps/headshot && npx wrangler versions list
# 确认最新 version 是干净部署时间之后；旧 version 已删除
```

**回滚**：删除旧 version 后不能回滚到旧代码；需要回滚时用当前分支重新构建部署（构建产物不含旧密钥）。这也是为什么先轮换 secrets 再删 version —— 二者顺序反了会留下“可回滚到带旧密钥版本”的窗口。

---

## 4. 验证命令（去敏，安全可复制）

```bash
# 只检查“是否配置”，不打印值
cd apps/voice && npx wrangler secret list        # 只显示名称列表
cd apps/headshot && npx wrangler secret list

# 环境完整性（本地 Node 20 可跑；不打印值，只打印缺失变量名/模式）
node -e "const {readEnv}=require('./packages/core/src/env.ts');console.log(readEnv().missingRequired, readEnv().mode)" 2>/dev/null || \
node --experimental-strip-types -e "import('./packages/core/src/env.ts').then(m=>console.log(m.readEnv().missingRequired, m.readEnv().mode))"

# 安全头（部署后）
curl -sS -I https://stemextractor.com | grep -iE "^(HTTP|x-content-type|referrer-policy|permissions-policy|x-frame|content-security)"
curl -sS -I https://headshotsnap.com  | grep -iE "^(HTTP|x-content-type|referrer-policy|permissions-policy|x-frame|content-security)"

# 生产付费闸门仍然是 402（轮换后回归）
curl -sS -o /dev/null -w "%{http_code}\n" -X POST https://stemextractor.com/api/jobs
```

> `wrangler` 需要 Node ≥ 22.12；本机系统 Node 是 v20 → 用 DSH 自带 Node（见 `site-eng-accounts` §4）或在 Workers Builds/GitHub Actions 执行。

---

## 5. 现状证据（本任务抓取）

| 检查 | 结果 | 时间 |
|---|---|---|
| `https://stemextractor.com` | HTTP/1.1 200，响应头中**没有** `X-Content-Type-Options` / `Referrer-Policy` / `Permissions-Policy` / CSP | 2026-11-14 18:0x |
| `https://headshotsnap.com` | HTTP/1.1 200，同上无安全头 | 2026-11-14 18:0x |
| 原因 | 安全头代码已加但**尚未部署**（本任务禁止 deploy）；部署后按 §3/§4 验证 | — |

---

## 6. 时间线与归属

| 顺序 | 动作 | 归属 | 完成判据 |
|---|---|---|---|
| 1 | 轮换 8 组密钥（§2） | 用户（后台）+ Lead（写 secrets） | 每组新 key 验证通过、旧 key 吊销 |
| 2 | 干净部署两站 | Lead/集成任务 | 两站 200 + 402 + headers |
| 3 | 删除旧 Worker versions | 用户（Dashboard） | `wrangler versions list` 只剩干净版本 |
| 4 | 清理本地明文副本 | 用户 | 文件删除并移到密码管理器 |
| 5 | `.gitignore` 补 `.dev.vars*` | Lead | `git check-ignore` 生效 |
| 6 | 把结果回写到本文件「执行记录」 | 执行人 | 每组一行「时间/操作者/验证证据」 |

## 7. 执行记录（待填写；完成一项填一行，不写密钥值）

| 时间 | 密钥/动作 | 操作者 | 验证方式与结果 | 旧值是否已吊销 |
|---|---|---|---|---|
| 2026-11-14 | 本文件创建；完成审计与状态盘点 | platform-stack | 见 §0/§5 | —（全部未轮换） |
