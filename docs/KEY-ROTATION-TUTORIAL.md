# 密钥轮换 + 旧 Worker versions 清理教程

> 适用：当前两个站点 `paid-tools-voice` / `paid-tools-headshot`，Cloudflare 账户 `a6d8b503165fb8f7b7e1a29d2209c90a`，R2 bucket `paid-tools-files`。
> 本文不含任何密钥值。不要把 `.env.local`、`cf-env.json`、`cf-secrets.json` 的内容贴进聊天、issue 或提交记录。
> 当前事实：R2 lifecycle 已完成；旧 Worker versions 仍存在；**没有任何生产密钥完成轮换**。

---

## 0. 先理解风险

旧 Worker versions 是 Cloudflare 保存的历史部署。只要旧版本里曾经内联过构建期密钥，拥有 Workers 预览/版本访问权限的人就可能从旧 bundle 读到它们。

**正确顺序：先轮换密钥 → 干净部署 → 验证 → 再删旧版本。**
如果先删旧版本，回滚窗口没了；如果只删旧版本不轮换，已泄露的旧 key 仍然有效。

---

## 1. 准备工作

1. 确认你能登录 Cloudflare / Waffo / Replicate / Neon 后台，并有 MFA。
2. 把当前 `.env.local` 备份到加密磁盘/密码管理器，不要放仓库。
3. 停止自动部署，避免轮换过程中旧 key 又被写进新 bundle：
   - Cloudflare Workers Builds / GitHub Actions 如有开启，先暂停。
4. 后续每个 key 都按「创建新 key → 更新两站 Worker secrets → 验证 → 再撤销旧 key」执行，不要一步全删。

---

## 2. 逐项轮换

### 2.1 Cloudflare API token（部署用）

旧版本可能包含构建期 `CLOUDFLARE_API_TOKEN`。

1. Cloudflare Dashboard → 右上头像 → **My Profile → API Tokens → Create Token**。
2. 权限至少：
   - Account → **Workers Scripts: Edit**
   - Account → **Workers R2 Storage: Edit**
   - Zone → **Workers Routes: Edit**（如用自定义域）
   - Account → **Account Settings: Read**（wrangler 需要）
3. 创建后只显示一次，保存到密码管理器。
4. 更新本地 `.env.local` 的 `CLOUDFLARE_API_TOKEN`。
5. 验证：
   ```bash
   export CLOUDFLARE_API_TOKEN='新token'
   npx wrangler whoami
   ```
6. 确认能 deploy 后，回 Dashboard 撤销旧 token。

> 如果只是想清旧版本、不想动部署 key，可只创建 **Account API token**（见 §3），但部署 token 也应轮换。

---

### 2.2 R2 S3 access keys

旧 Worker versions 可能内联了 `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`。

1. Dashboard → **R2 Object Storage → Manage R2 API Tokens**。
2. **Create Account API token**：
   - Permission：**Object Read & Write**
   - Buckets：**Apply to all buckets**（或至少 `paid-tools-files`）
   - TTL：Forever（或 1 年）
3. 创建后立刻复制 **Access Key ID** 和 **Secret Access Key**（只显示一次），先存密码管理器。
4. 更新本地 `.env.local`：
   ```dotenv
   R2_ACCESS_KEY_ID=新的
   R2_SECRET_ACCESS_KEY=新的
   ```
5. 更新两个 Worker 的 secrets（Windows，Node 24 跑 wrangler）：
   ```bash
   cd D:/ai-workspace/paid-tools
   NODE24='C:/Users/ht/.dsh/dsh-runtimes/dsh-primary-runtime/dependencies/node/bin/node.exe'
   "$NODE24" node_modules/wrangler/bin/wrangler.js secret put R2_ACCESS_KEY_ID --name paid-tools-voice
   "$NODE24" node_modules/wrangler/bin/wrangler.js secret put R2_SECRET_ACCESS_KEY --name paid-tools-voice
   "$NODE24" node_modules/wrangler/bin/wrangler.js secret put R2_ACCESS_KEY_ID --name paid-tools-headshot
   "$NODE24" node_modules/wrangler/bin/wrangler.js secret put R2_SECRET_ACCESS_KEY --name paid-tools-headshot
   ```
   命令会交互式要求粘贴值；不要把值写进 shell 历史。
6. 验证：
   - 打开 `https://stemextractor.com/api/orders/status?order=ord_mwfzkg8h_yy9s9md`（任意真实订单），应返回订单 JSON 而不是 500。
   - 打开订单页触发 R2 读取/签名，确认下载链接可生成。
7. 验证后回 R2 API Tokens 删除旧 token（如 `paid-tools-r2`）。旧 token 删除后，旧 bundle 里的 key 立即失效。

---

### 2.3 Replicate token

1. 登录 https://replicate.com/account/api-tokens。
2. 创建新 token，命名 `paid-tools-20261114`。
3. 更新本地 `.env.local` 的 `REPLICATE_API_TOKEN`。
4. 更新两站 Worker secrets：
   ```bash
   "$NODE24" node_modules/wrangler/bin/wrangler.js secret put REPLICATE_API_TOKEN --name paid-tools-voice
   "$NODE24" node_modules/wrangler/bin/wrangler.js secret put REPLICATE_API_TOKEN --name paid-tools-headshot
   ```
5. 用最小真实任务验证（A 站 5 秒 WAV / B 站 1 张自拍），确认 provider 可创建 prediction。
6. 再删除旧 Replicate token。

> 当前 Replicate 账户余额 <$5 会被限流（6 次/分钟、burst 1），且出现过 502；这与 token 轮换是两件事，测试时预留重试/等待。

---

### 2.4 Waffo live 私钥（支付）

1. Waffo Dashboard → **API & Development / API Keys**。
2. 创建新的 **Production** API Key；下载私钥（只显示一次）。
3. 更新本地 `.env.local` 的 `WAFFO_PRIVATE_KEY`（base64 编码的 PEM 或 PEM 全文，按现有格式）。
4. 更新两站 Worker secret：
   ```bash
   "$NODE24" node_modules/wrangler/bin/wrangler.js secret put WAFFO_PRIVATE_KEY --name paid-tools-voice
   "$NODE24" node_modules/wrangler/bin/wrangler.js secret put WAFFO_PRIVATE_KEY --name paid-tools-headshot
   ```
5. 验证 `POST /api/checkout` 能返回真实 `pancake.waffo.ai` URL（不要真的付款；用未支付 session 即可）。
6. 验证通过后删除旧 Waffo API Key。
7. **webhook public key 不是私钥**；如果你同时轮换 webhook secret/key，到 Waffo webhook 设置更新公钥，并验证 `X-Waffo-Signature`。

---

### 2.5 Neon / Resend / SESSION_SECRET

- **Neon**：Neon Console → Project → Settings → Reset password；更新 `DATABASE_URL`（如果当前代码仍用 R2 JSON，不影响订单，但未来切 DB 前必须做）。
- **Resend**：Resend Dashboard → API Keys → Create；更新 `RESEND_API_KEY`；旧 key 删除。
- **SESSION_SECRET**：生成 32+ 字节随机值；更新两站 secret；会使现有会话失效，属预期。
- 如果启用 Turnstile：创建新 secret，更新 `TURNSTILE_SECRET_KEY`；旧 secret 删除。

---

## 3. 干净部署 + 验证

轮换所有 secret 后，做一次**不带 `.env.local` 的干净构建**，确保 build 不再把密钥内联：

```bash
cd D:/ai-workspace/paid-tools
mv .env.local .env.local.secrets
rm -rf apps/voice/.open-next apps/headshot/.open-next

cd apps/voice
export NEXT_PUBLIC_SITE_URL_VOICE=https://stemextractor.com
export NEXT_PUBLIC_SITE_URL=https://stemextractor.com
export TMPDIR='D:/ai-workspace/paid-tools/.tmp' TEMP='D:/ai-workspace/paid-tools/.tmp' TMP='D:/ai-workspace/paid-tools/.tmp'
NODE24='C:/Users/ht/.dsh/dsh-runtimes/dsh-primary-runtime/dependencies/node/bin/node.exe'
"$NODE24" ../../node_modules/@opennextjs/cloudflare/dist/cli/index.js build
export CLOUDFLARE_ACCOUNT_ID='a6d8b503165fb8f7b7e1a29d2209c90a'
"$NODE24" ../../node_modules/wrangler/bin/wrangler.js deploy
# headshot 同理，把 URL 换成 https://headshotsnap.com
cd ../..
mv .env.local.secrets .env.local
```

验证清单：

- `GET /`、`/pricing`、`/orders` 200
- `POST /api/checkout` 正式套餐返回真实 Waffo URL
- 未付款 `POST /api/jobs` 返回 402
- 已付款真实订单可读、R2 签名 URL 可生成
- 两站安全 headers 仍存在
- `wrangler secret list --name paid-tools-voice` 只列出 key 名称，没有旧 key 值
- 仓库无明文密钥：`git grep -nE 'BEGIN (RSA )?PRIVATE KEY|re_[A-Za-z0-9]{20,}|r8_[A-Za-z0-9]{20,}'`

---

## 4. 旧 Worker versions 怎么删

### 4.1 Dashboard 先看

Workers & Pages → `paid-tools-voice` → **Deployments / Version History**：

- 当前 active version 保留（100% traffic）。
- 旧 version 行右侧 `...` 菜单；如果出现 **Delete version**，逐个删除。
- **当前实测：菜单只有 Rollback / Split versions / View logs，没有 Delete。**

### 4.2 API 尝试（需要 Account API token）

用 **Account API token**（不是 User token）带 `Workers Scripts: Edit`，先列版本：

```bash
curl -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/workers/scripts/paid-tools-voice/versions?per_page=100"
```

删除非 active version：

```bash
curl -X DELETE \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/workers/scripts/paid-tools-voice/versions/<VERSION_ID>"
```

**当前实测**：User API token + `DELETE` 返回 `405 Method not allowed`（错误码 10405），说明当前认证方式/权限不允许删版本。
如果 Account token 仍返回 405，不要在脚本里反复重试；进入 §4.3。

### 4.3 保底方案：换服务，删旧服务

如果 Cloudflare 不提供单版本删除：

1. 用干净构建新建 Worker：`paid-tools-voice-clean`（不要复用旧 service）。
2. 绑定同一个自定义域/Route，先 0% 或测试域验证；验证通过后切 100%。
3. 确认新服务正常后，**删除旧 service** `paid-tools-voice`（删除 service 会删除它的全部 versions）。
4. 旧 service 删除前，确保 DNS/Route 已迁到新 service；保留旧版本构建产物在本地/对象存储，作为回滚。
5. 对 `paid-tools-headshot` 重复。

也可以用 Cloudflare Support 工单请求「清理某个 Worker 的历史 versions / 确认旧版本是否含敏感构建环境」，但不要等支持才轮换 key——轮换后旧 key 已失效，旧版本风险大幅降低。

---

## 5. 回滚

- 新 key 验证通过前，**不要删除旧 key**。
- 如果新 key 导致 401/500：
  1. 用 `wrangler secret put` 把旧 key 临时写回；
  2. 重新部署；
  3. 查新 key 的权限/环境（test vs live）后重试。
- 24 小时无异常后再删除旧 key；删除后不可恢复。

---

## 6. 当前状态（2026-11-14）

- [x] R2 lifecycle：`voice-out-30d`、`headshot-out-30d` 已 Enabled
- [x] $0.10 测试单真实支付、失败退款、入口下架
- [ ] Cloudflare API token 轮换
- [ ] R2 access keys 轮换
- [ ] Replicate token 轮换
- [ ] Waffo 私钥轮换
- [ ] Neon / Resend / SESSION_SECRET 轮换
- [ ] 旧 Worker versions 删除（Dashboard 无入口；API 405；需 Account token/Support/换服务）
