# REFUND-RUNBOOK — Waffo 退款操作手册（A: stemextractor.com / B: headshotsnap.com）

- 维护者：voice-stack（task-28），2026-11-14
- 适用：Waffo（Pancake MoR）live 环境真实扣款订单的退款、退款对账、退款后额度回收、webhook 故障兜底
- 工具：`tools/refund-waffo-order.mjs`（新增，幂等；只读演练 `--dry-run`）
- 商户/店铺（2026-11-14 生产核验）：merchant `MER_…`（见 `.env.local`）、store `STO_0PjvI9SX3zMUP176pCadMg`（slug `tidycontracts-qzvinaig`），两个站点共用同一 store
- **重要：已退款的两笔真实订单不得重复退款**
  | 订单 | 金额 | payment | refund | ticket | psp refund |
  | --- | --- | --- | --- | --- | --- |
  | `ord_mwfzkg8h_yy9s9md`（A voice trial） | $2.90 | `PAY_7cMFjz9NgtWwmAlJDGz4z5` | `REF_33QO5Zrs5b8nJINX5jMmAw` | `TKT_73NWobkn21didSZsdG9UTY` | `RA20261114055022625325800` |
  | `ord_mwggroyd_1q2v4v3`（A voice QA $0.10） | $0.10 | `PAY_7DwtS4efFKx6E8ZH74OoGL` | `REF_0KRhN70cseWHScS8fXld6D` | `TKT_7JTMou8YaxVhck3y5j0NJw` | `RA20261114135731558355600` |

---

## 1. 一条命令速查

```bash
# 0) 只读演练（推荐：先看真实 payment/金额/已有 refund/R2 状态，不产生任何写操作）
node tools/refund-waffo-order.mjs --order ord_xxx --dry-run

# 1) 真实退款（默认退「可退余额」，一次性订单=全额；TTY 下要输入 YES；CI/Agent 无 TTY 直接执行）
node tools/refund-waffo-order.mjs --order ord_xxx

# 2) 部分退款（美元十进制；不能超过可退余额，单笔默认上限 $50）
node tools/refund-waffo-order.mjs --order ord_xxx --amount 1.45

# 3) 机器可读输出（对账/自动化）
node tools/refund-waffo-order.mjs --order ord_xxx --dry-run --json

# 4) 幂等复跑：已退款订单永远返回 already_refunded（不会创建 ticket、不会写 R2）
node tools/refund-waffo-order.mjs --order ord_mwfzkg8h_yy9s9md --dry-run
```

退出码：

| 码 | 含义 | 处置 |
| --- | --- | --- |
| 0 | 退款成功 / 已是退款态（幂等） | 完成，记录 refund id |
| 1 | 参数或配置错误（含 `payment_not_found`） | 看 message：订单号错 / 没真实扣款（测试伪造单）→ **不要退** |
| 2 | Waffo 远端错误 / ticket 终态 failed·rejected·returned | 按 §7 处理；不要盲目重试 4xx |
| 3 | ticket 超时未到终态 | 不要新建 ticket；用 GraphQL 查 `refundTicket(id)`，按 §7 跟进 |
| 4 | **退款已成功但 R2 回写失败** | 人工补写 R2（§6），并告警 |

前置条件：
- `.env.local` 有 `WAFFO_MERCHANT_ID / WAFFO_STORE_ID / WAFFO_PRIVATE_KEY / R2_*`（脚本只读这两个来源，不打印任何密钥）
- 本机访问 `api.waffo.ai` 需代理：默认 `http://127.0.0.1:7897`；可用 `--proxy <url>` / `--no-proxy`
- Node ≥ 20，仓库根目录已 `npm i`（脚本仅依赖内置模块 + `undici`）

---

## 2. 14 天退款口径（A 站 voice / B 站 headshot 通用）

1. **14 个自然日**（按 Waffo `payment.createdAt` 起算）内，未使用额度的订单：**全额原路退回**。
2. 已部分使用额度：**按剩余未用额度比例退款**，向上取整到美分；已消耗的分钟/张数不退（成本已发生）。
   例：$2.90 / 15 分钟，用了 5 分钟 → 可退 10/15×290=193.33 → 退 **$1.93**（用 `--amount 1.93`）。
3. 超过 14 天：默认不退；确属我方故障（生成失败/文件不可用）可全额退，需 Lead 书面确认。
4. **重复支付 / 未到账但扣款**：无条件全额退，不受 14 天限制（用户没拿到服务）。
5. 退款只走 Waffo 原路（`/v1/actions/refund-ticket/create-ticket`），**不做线下转账/优惠券补偿**。
6. 退款原因统一用 `requested_by_customer`；内部备注写在 `--note`（落 R2 `refundNote`），不要写用户隐私。
7. 部分退款后订单仍然有效（剩余额度可继续用）；**全额退款后订单必须失效**（§5 额度回收）。

> B 站 48h redo 不属于「退款」：见 §4，优先 redo，不轻易退款（退款率影响 store review 与 PSP 风险）。

---

## 3. 执行前检查清单（30 秒）

- [ ] 订单号来自用户邮件/后台/R2，形如 `ord_xxx`（**不是** Waffo `ORD_xxx` / `PAY_xxx`；脚本接受站内 id）
- [ ] `--dry-run` 输出里：`paymentStatus=succeeded`、`isFullyRefunded=false`、`remainingRefundableCents>0`
- [ ] 金额 `≤ remainingRefundableCents`，且符合 §2 口径
- [ ] `r2OrderStatus` 是 `paid`（若已是 `refunded` 且 providerRefundId 一致 → 幂等返回，无需操作）
- [ ] 非测试单：B 站历史上有 5 个「手动标记 paid 但无真实 Waffo payment」的 fake 单，脚本会报 `payment_not_found` → 这些**不属于真实扣款，不退款**

`--dry-run` 真实输出示例（2026-11-14 生产订单，已退款单，幂等）：

```json
{"ok":true,"action":"already_refunded","order":"ord_mwfzkg8h_yy9s9md",
 "paymentId":"PAY_7cMFjz9NgtWwmAlJDGz4z5","paymentStatus":"succeeded",
 "paymentAmountCents":290,"refundedAmountCents":290,"remainingRefundableCents":0,
 "isFullyRefunded":true,"refundStatus":"refunded",
 "existingRefunds":[{"id":"REF_33QO5Zrs5b8nJINX5jMmAw","status":"succeeded","amount":"2.90 USD",
   "ticketId":"TKT_73NWobkn21didSZsdG9UTY","pspRefundId":"RA20261114055022625325800"}],
 "r2OrderStatus":"refunded","r2ProviderRefundId":"REF_33QO5Zrs5b8nJINX5jMmAw","r2Repaired":false,
 "message":"payment 已全额退款：未调用任何写接口（幂等）"}
```

---

## 4. B 站（headshot）48h redo 口径

1. 用户对 5 张结果不满意：**48 小时内可免费重做一次**（同一组 selfie、同套餐张数），不退款。
2. 重做走任务重发（不新建订单、不再扣额度）：用原 `orderId` 记录 `redo` 标记；产物仍是 `headshot/out/...`。
3. 重做后仍不满意：按 §2 打 8 折退款或全额（Lead 定），退款走本脚本。
4. 重做不需要 Waffo API；只动 job/R2，不触发资金流。

---

## 5. 退款后额度回收（必须做，脚本已处理 R2 标记；gate 自动生效）

- 脚本退款成功后会写 R2 `orders/<site>/<id>.json`：
  ```json
  {"status":"refunded","refundedAt":"<waffo refund.createdAt>",
   "providerRefundId":"REF_...","providerPaymentId":"PAY_...","providerTicketId":"TKT_...",
   "refundTicketMerchantExternalId":"ord_xxx-refund-<ts>",
   "refundAmountCents":290,"refundedAmountCents":290,"refundCurrency":"USD",
   "refundNote":"...","refunds":[{"id":"REF_...","ticketId":"TKT_...","amountCents":290,"pspRefundId":"RA...","status":"succeeded"}]}
  ```
- 付费闸门 `checkOrderAllowance()` 只认 `status==="paid"` → `refunded` 后 `/api/jobs`、`/api/orders` 立即 402（**不需要改代码**）。
- 已生成的文件（R2 `out/`）不主动删除：
  - 退款是「退钱不追溯已交付文件」，保留 30 天生命周期到点自然删除；
  - 若涉及盗刷/投诉，按 §8 手动删除对应前缀并留审计记录。
- `unitsUsed/unitsReserved` 不回滚（保留真实用量，便于审计与争议处理）。

---

## 6. R2 回写失败（脚本 exit 4）的人工补写

脚本会打印 `r2Key` 与 `r2Error`。补写步骤（只需改 `status` 等字段，保留原 JSON 其它字段）：

1. Cloudflare Dashboard → R2 → `paid-tools-files` → `orders/<site>/<orderId>.json` → Edit；
2. 合并以下字段（值从脚本输出/GraphQL 抄）：
   `status:"refunded"`, `refundedAt`, `providerRefundId`, `providerPaymentId`, `providerTicketId`, `refundAmountCents`, `refundNote`；
3. 保存后用 `node tools/refund-waffo-order.mjs --order <id> --dry-run` 复核 `r2OrderStatus=refunded` 且 `r2Repaired=false`。

---

## 7. Waffo 退款 ticket 状态机与异常处置

状态（官方文档）：`pending → approved → processing → succeeded | failed | rejected | returned`
- 商户 API Key 提交的退款**自动批准**，直接进 `processing`（本次实测：创建→执行 ≈ 10s）；
- 创建后脚本每 3s 轮询 `refundTicket(id)`，默认 180s 超时（`--timeout` / `--poll` 可调）。

| 情况 | 脚本表现 | 处置 |
| --- | --- | --- |
| `succeeded` | exit 0，R2 已写 | 完成 |
| `failed` / `rejected` / `returned` | exit 2 | 先查 `reviewNote`/`rejectReason`；修正后用官方 resubmit 接口（`POST /v1/actions/refund-ticket/resubmit-refund-ticket`，见 docs）重提；**不要**新建 ticket |
| 超时（exit 3） | 打印 ticket id/状态 | `refundTicket(id)` 复查；`processing` 常见于 PSP 慢，等 5–30 分钟；**同一 payment 在途时禁止新建 ticket**（Waffo 会 409） |
| 409 `A refund record already exists` | 脚本自动走幂等：查已有 refund → 补写 R2 → exit 0 | 无需处理 |
| 409 `A refund ticket already exists` | 脚本自动查在途 ticket 并轮询 | 无需处理 |
| 409 `Insufficient available balance` | exit 2 | 余额不足：充值/等结算后再退；不要拆成多笔绕过 |
| 400 `Expected format: PAY_xxx` | exit 2 | `paymentId` 错误：用本脚本查单（自动取 payment），不要手拼 |
| 401 `Unauthorized` | exit 2 | 私钥/商户号不匹配：检查 `.env.local`，不要轮换生产 key（见 KEY-ROTATION-TUTORIAL） |

**官方口径**：4xx 不重试；5xx/503 退避重试（脚本已内置 3 次、5s/10s）；退款无时间限制，可部分退，币种必须与 payment 一致。

---

## 8. 退款对账（每日/每周）

### 8.1 每日（1 分钟）

1. Waffo 侧：GraphQL 查最近 24h 的 refund ticket 与 refund：
   ```graphql
   query { refundTickets(limit:20) { id status subjectId refundTicketMerchantExternalId reviewedAt executedAt createdAt }
           refunds(limit:20) { id paymentId ticketId status amount{amount currency} pspRefundId createdAt } }
   ```
   `status` 不是 `succeeded` 的可疑单 → 用脚本 `--dry-run` 看对应订单。
2. R2 侧：对每笔 `refunds` 核对 `orders/<site>/<orderId>.json` 是否 `status=refunded` 且 `providerRefundId` 一致。
3. 不一致 → 脚本 `--dry-run` 找出 R2 未写/写错，再 `node tools/refund-waffo-order.mjs --order <id>`（幂等，只会补写 R2，不会二次退款）。

### 8.2 每周（5 分钟）

- GraphQL `payments(storeId, limit:50)` 拉全量 payment，与 R2 `orders/*/` 对账：
  - `payment.isFullyRefunded=true` 但 R2 不是 refunded → 补写（脚本）；
  - R2 refunded 但 Waffo 无 refund → 事故，查 ticket 与 pspRefundId，必要时联系 Waffo 支持；
  - `payment.status=succeeded` 但对应 R2 订单不存在 → 丢单，按 PROGRESS.md「订单恢复」流程补录。
- 记录：日期、refund 数、金额合计、异常数（写进本文件「变更记录」或运维日志）。

### 8.3 可复制的对账片段（只读）

单笔核对（脚本自带 Waffo 签名 + R2 预签名，无需额外工具）：

```bash
# 把疑似订单号每行一个放进 .tmp/orders.txt，然后批量 dry-run
while read -r id; do
  node tools/refund-waffo-order.mjs --order "$id" --dry-run --json
done < .tmp/orders.txt
```

每行 JSON 关键字段：`action`（`already_refunded` / `dry_run` / `error`）、`paymentAmountCents`、
`refundedAmountCents`、`r2OrderStatus`、`r2ProviderRefundId`。判定规则：
- `already_refunded` + `r2OrderStatus=refunded` → 一致；
- `already_refunded` + `r2OrderStatus!=refunded` → R2 漏写，去掉 `--dry-run` 跑一次即可幂等补写；
- `dry_run` → Waffo 尚未退款，若用户已申请按 §3 执行；
- `error/payment_not_found` → 无真实扣款（测试伪造单），不退款。

---

## 9. Waffo webhook 现状（P0）：live webhook 全部 401，必须靠脚本/对账兜底

**结论：webhook 目前不可用（我方验签代码把合法签名判为过期），退款后的 R2 状态更新不能依赖 webhook，必须用本脚本。**
证据（2026-11-14 22:0x 通过 Waffo GraphQL `webhookDeliveries` 只读查询，生产 store）：

| webhookUrl | 事件 | 结果 | HTTP | 尝试 | 最后尝试 |
| --- | --- | --- | --- | --- | --- |
| `https://stemextractor.com/api/webhooks/waffo` | `refund.succeeded` | failed | **401** | 5 | 2026-11-14T15:19:23Z |
| `https://headshotsnap.com/api/webhooks/waffo` | `refund.succeeded` | failed | **401** | 5 | 2026-11-14T15:17:03Z |
| `https://stemextractor.com/api/webhooks/waffo` | `order.completed` | failed | **401** | 5 | — |
| `https://headshotsnap.com/api/webhooks/waffo` | `order.completed` | failed | **401** | 5 | — |
| `https://tidycontracts.com/api/webhook/waffo`（旧站） | 两者 | success | 200 | 1 | — |

我方返回体（Waffo 记录的 `responseBody`，两站一致）：

```json
{"ok":false,"error":"bad_signature","reason":"webhook 时间戳过期（重放保护）"}
```

根因（`packages/core/src/payments/waffo.ts` 的 `verifyWebhookSignature`，**本任务不改 apps 代码，只记录**）：

1. **时间戳单位错**：Waffo 的 `t` 是**毫秒**（官方文档 §Signature Verification：「Parse t (timestamp in ms)」），现有代码按**秒**比较 `Date.now()/1000 - Number(t)`，任何真实事件都会被判过期；
2. **窗口错**：官方建议 **45 分钟**（「NOT 5: retries replay the ORIGINAL signature header — t is never re-stamped, and the final retry lands 31+ minutes after first delivery」），现有 `MAX_WEBHOOK_SKEW_SECONDS = 5*60` 即使单位修好也会把第 4–5 次重投判 401；
3. 签名串本身是对的：官方 `${t}.${rawBody}`，代码 candidates 里已有 `${timestamp}.${rawBody}`。

修复建议（交给 apps 负责人，1 行 + 1 常量）：
```ts
// MAX_WEBHOOK_SKEW_SECONDS: 5*60 -> 45*60
// 解析 t 后：const tsSec = Number(t) > 1e12 ? Number(t)/1000 : Number(t);
```
修复并部署后，回放一次 `refund.succeeded`（或用 Waffo 后台 resend）验证 200，再把 `webhookDeliveries` 里 failed 清零作为验收。

**兜底路径（当前生效）**：
- 支付 success 页/付费闸门：`/api/orders/reconcile`（已存在，Waffo GraphQL 查 `onetimeOrders`，completed→paid）
- 退款：本脚本（退款成功后直接写 R2，不依赖 webhook）
- 对账：§8 每日/每周人工/脚本

**重复 webhook 配置（建议清理，需 owner 批准后再动生产配置）**：同一 store 同一 URL 注册了 **2 条 live webhook**（11-12 与 11-14 各一次），事件重复投递（靠我方幂等去重，但会放大重试与告警噪音）：
| URL | webhook id | 创建时间 |
| --- | --- | --- |
| headshotsnap.com | `bda3aeb6-21ec-4933-927a-08eeb5d24062` | 2026-11-14T05:38:38Z |
| stemextractor.com | `f59263df-53cb-42d3-87ec-782e38b8b34d` | 2026-11-14T05:38:37Z |
| headshotsnap.com（旧） | `8b693465-8989-4b03-a2db-e3435e472de2` | 2026-11-12T12:17:54Z |
| stemextractor.com（旧） | `ba6c31db-f7f1-41f8-b601-42baf4c76554` | 2026-11-12T12:17:54Z |
| tidycontracts.com（旧站，保留） | `7348c309-5f43-4fe8-ba09-94a1012aedc1` | 2026-11-02T14:57:27Z |

清理命令（官方 `POST /v1/actions/store/remove-webhook`，body `{"id":"<webhook uuid>"}`；**不要擅自执行**，先确认 11-12 两条确实是测试期遗留）：

```bash
# 伪代码：签名复用 tools/refund-waffo-order.mjs 的 signedHeaders
curl -X POST https://api.waffo.ai/v1/actions/store/remove-webhook \
  -H "X-Merchant-Id: $WAFFO_MERCHANT_ID" -H "X-Timestamp: ..." -H "X-Signature: ..." \
  -d '{"id":"8b693465-8989-4b03-a2db-e3435e472de2"}'
```

---

## 10. Store review / live 支付状态（2026-11-14 22:0x 核验）

通过 Waffo GraphQL（只读）确认 **store review 已通过、live 支付已开启**：

```json
{"store":{"id":"STO_0PjvI9SX3zMUP176pCadMg","name":"TidyContracts","slug":"tidycontracts-qzvinaig",
 "status":"active","prodEnabled":true,"payinEnable":true,"isPublic":false,
 "supportEmail":"…","website":"https://tidycontracts.com"}}
```

- 官方文档：review 通过的标志就是 **`prodEnabled` 变 true**（`docs.waffo.ai/mor/account-reviews`：Approved → store can accept live payments (`prodEnabled`)）。
- live webhook 正在被投递（有 `order.completed`/`refund.succeeded` delivery 记录）+ 两笔真实卡扣款成功并退款成功 → 进一步佐证 review 已通过。
- **商家后台 UI 检查 = blocked**：`https://pancake.waffo.ai/merchant/dashboard` 未登录会 302 到 `merchant/auth/signin`（需要邮箱/密码/2FA，Agent 不代填凭据）。证据：`.tmp/waffo-merchant-signin.png`、`.tmp/waffo-merchant-dashboard.png`、`.tmp/waffo-review-check.json`（workspace 内，未入库）。
- 结论：**API 证据充分，UI 检查标记 blocked（等用户登录后可人工复核 Business Details 页）**。

---

## 11. 变更记录

| 日期 | 变更 | 验证 |
| --- | --- | --- |
| 2026-11-14 | 新增 `tools/refund-waffo-order.mjs` + 本 runbook | `node --check` 通过；`--dry-run` 两笔真实订单均返回 `already_refunded`（payment/refund/pspRefundId 真实）；生产模式对已退款单幂等 exit 0，无写调用；fake 单 `ord_mwdjc0nd_j5a2v8g` 返回 `payment_not_found` exit 1 |
| 2026-11-14 | 记录 Waffo live webhook 401 根因（毫秒时间戳 + 5 分钟窗口）与重复 webhook 配置 | `webhookDeliveries` 只读查询 + 官方文档交叉验证 |
| 2026-11-14 | 确认 store review 通过（`prodEnabled=true`）/ 后台 UI blocked | GraphQL `store` 查询 + ego-browser 登录墙截图 |
