# OPS-MONITORING — 上线后可观测性手册（A: stemextractor.com / B: headshotsnap.com）

> 最后更新：2026-11-14（task-23）。范围：**已实现的东西如实写、没配置的东西不谎称已配置**。
> 本文所有命令都可在本机 Git Bash 直接执行（除标注「需 Node ≥22」的 wrangler 命令）。

## 0. 现状：已有什么、没有什么

| 能力 | 现状 | 位置 / 说明 |
| --- | --- | --- |
| 健康检查 | ✅ 两站 `GET /api/version`（service/status/commit/time） | `apps/*/app/api/version/route.ts` |
| 前端事件 | ✅ `POST /api/events`（白名单事件，落 R2 `events/<site>/<date>/`） | 本任务新增；`GET` 同路径为健康检查 |
| 订单持久化 | ✅ R2 `orders/<site>/<orderId>.json`（pending→paid→refunded） | `packages/core/src/orders.ts` |
| 支付对账 | ✅ `GET /api/orders/reconcile?order=`（Waffo GraphQL 查询，completed→paid） | webhook 审核期兜底 |
| 站内事件埋点 | ✅ `Analytics.tsx` 零侵入挂载（checkout_started/paid/job_started/job_done/download_clicked） | 不改业务组件；只在 layout 挂载 |
| sitemap / robots | ✅ 两站 16 URL，线上 200 | `/sitemap.xml`、`/robots.txt` |
| IndexNow | ✅ 两站 key 文件 200；2026-11-14 重新提交两站 sitemap 全部 URL → HTTP 200 | 见 docs/GSC-BING.md |
| 自动告警 | ❌ **没有任何自动告警**（无 Sentry / 无 Logpush / 无 cron / 无飞书机器人） | 下文全部是「人工日报 + 阈值」，不是已配置告警 |
| 5xx / 402 按状态码统计 | ❌ 未落日志仓库 | 只能用 Cloudflare 面板/`wrangler tail` 人工看；GraphQL 指标只有 requests/errors 总量 |
| 每日自动报告 | ❌ 未建 | 建议方案见 §6，未实施 |

> ⚠️ 别把本文当「监控已就绪」。它是**可执行的人工巡检手册 + 告警阈值清单**。

## 1. 每日巡检（约 3 分钟，复制粘贴即可）

```bash
# 1) 两站健康 + 响应时间（期望 200，<1s）
for u in https://stemextractor.com/api/version https://headshotsnap.com/api/version; do
  curl -s -o /dev/null -m 10 -w "%{http_code} %{time_total}s $u\n" "$u"
done

# 2) 事件落库通道健康（期望 "r2":true；false = 环境变量缺失，事件只会进 stdout 日志）
curl -s -m 10 https://stemextractor.com/api/events; echo
curl -s -m 10 https://headshotsnap.com/api/events; echo

# 3) 付费闸门仍在（期望 402；若返回 201/200 说明免费口子被打开，P0 事故）
curl -s -o /dev/null -m 15 -w "%{http_code} voice POST /api/jobs\n" \
  -X POST https://stemextractor.com/api/jobs \
  -H 'Content-Type: application/json' -d '{"filename":"probe.mp3"}'
curl -s -o /dev/null -m 15 -w "%{http_code} headshot POST /api/orders\n" \
  -X POST https://headshotsnap.com/api/orders \
  -H 'Content-Type: application/json' -d '{}'

# 4) sitemap / robots 可抓 + URL 数（期望 200 且 16）
for base in https://stemextractor.com https://headshotsnap.com; do
  echo "== $base"
  curl -s -o /dev/null -m 15 -w "sitemap=%{http_code} " "$base/sitemap.xml"
  curl -s -m 15 "$base/sitemap.xml" | grep -c "<loc>" | xargs echo "urls="
  curl -s -o /dev/null -m 15 -w "robots=%{http_code}\n" "$base/robots.txt"
done

# 5) 已知订单状态抽查（把 ORD_ID 替换成真实订单；期望 paid）
curl -s -m 10 "https://stemextractor.com/api/orders/status?order=ORD_ID"; echo
```

`/api/version` 返回示例：`{"service":"voice","status":"ok","commit":"...","runtime":"...","time":"..."}`。

## 2. 指标与阈值（人工日报口径）

| # | 指标 | 采集方式 | 阈值 / 判读 | 触发后的动作 |
| --- | --- | --- | --- | --- |
| 1 | 站点可用性 | §1 健康检查 | 任意站点非 200 → 立即查 | 看 Cloudflare Worker 部署状态；回滚上一 version |
| 2 | 5xx 率 | Cloudflare 面板 → Workers → 站点 → Logs / Metrics；或 §3 GraphQL `errors/requests` | 15 分钟 >1% 或任意 5xx 连续 5 次 | 查 R2/Waffo/Replicate 依赖（502/503 多为上游）；先看 `/api/orders/reconcile` 与 `/api/jobs` 日志 |
| 3 | 402 占比（付费闸门） | 只能从 Worker Logs 按状态码过滤（未落库）；摘要指标可用 GraphQL 的请求量做分母粗估 | 402 占比长期 >95% = 没转化；突然跌到 <50% = 可能被绕过或免费口子打开 | 立即核对 P0 闸门 + 检查是否有 `ALLOW_MOCK/ALLOW_REAL` 泄漏到生产 |
| 4 | 支付成功 | R2 `orders/<site>/` 下 `status=paid` 数量（面板/脚本）；成功页事件 `paid` | 有 checkout_started 但 0 paid（24h） | 查 Waffo store 状态、reconcile 是否 404、webhook 是否审核期被 withhold |
| 5 | 支付失败/对账失败 | Worker Logs 中对 `/api/orders/reconcile` 的非 200；Waffo 控制台订单 | 单日 reconcile 失败 >3 次 | 查 Waffo API key/私钥是否轮换、产品 ID 是否对 |
| 6 | 任务完成率 | R2 `jobs` 记录状态（done/failed）+ 事件 `job_started` vs `job_done` | `job_done/job_started` <80%（当日 ≥5 单时） | 查 Replicate 余额/模型限流；看 `/api/jobs/[id]` 错误 |
| 7 | 事件量异常 | R2 `events/<site>/<date>/` 对象数（或 `page_view` 事件数） | 比过去 7 天中位数跌 >50% | 先 §1 第 2 条确认 `r2:true`；再看前端 Analytics 是否被 CSP/广告拦截 |
| 8 | 成本 / 毛利 | §4 成本公式 + R2 订单金额 | 单站点日毛利 <0 | 见 §4；voice 每分钟成本 $0.004667、headshot 每张 $0.053 |
| 9 | 收录 | GSC「网页」报告（人工） | 已编入索引数连续 7 天不涨 | URL 检查 + 请求编入索引；检查 sitemap 状态是否「成功」 |
| 10 | 搜索表现 | GSC「效果」（人工） | 28 天点击=0 且展示>1000 | 查 title/H1/意图匹配；见 docs/GSC-BING.md |

## 3. 5xx / 请求量：Cloudflare GraphQL（有 token 即可跑）

`CLOUDFLARE_API_TOKEN` 与 `CLOUDFLARE_ACCOUNT_ID` 已在本机 `paid-tools/.env.local`（未提交）。

```bash
set -a; source .env.local; set +a   # 只在可信终端做；不要把值 echo 出来
QUERY='query($acc:String!,$from:Time!,$to:Time!){viewer{accounts(filter:{accountTag:$acc}){workersInvocationsAdaptive(limit:5000,filter:{datetime_geq:$from,datetime_leq:$to}){sum{requests errors} dimensions{scriptName status}}}}'
NOW=$(date -u +%Y-%m-%dT%H:00:00Z); DAY_AGO=$(date -u -d '1 day ago' +%Y-%m-%dT%H:00:00Z)
curl -s https://api.cloudflare.com/client/v4/graphql \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H 'Content-Type: application/json' \
  --data "$(jq -n --arg q "$QUERY" --arg acc "$CLOUDFLARE_ACCOUNT_ID" --arg f "$DAY_AGO" --arg t "$NOW" \
    '{query:$q,variables:{acc:$acc,from:$f,to:$t}}')" \
  | jq '[.data.viewer.accounts[].workersInvocationsAdaptive[] | {script:.dimensions.scriptName,status:.dimensions.status,requests:.sum.requests,errors:.sum.errors}]'
```

判读：
- `scriptName` 应为 `paid-tools-voice` / `paid-tools-headshot`。
- 该数据集只有 **requests/errors 汇总**，**按 status 拆分不保证可用**（不同账户粒度不同）；需要 402/5xx 精确比例时用 Workers Logs 或 `wrangler tail`。
- 402 精确占比：Cloudflare Dashboard → Workers & Pages → 选中 Worker → **Logs**，过滤 `status:402`；或 `npx wrangler tail paid-tools-voice --format json`（**需 Node ≥22.12**，本机 Node 20 跑不了 wrangler 4.160）。

## 4. 成本与毛利（每单可算）

价格表来源 `packages/core/src/cost.ts`（`PRICE_BOOK`）：

| 站点 | 动作 | 成本 |
| --- | --- | --- |
| A voice | demucs 分离 | **$0.004667 / 分钟**（$0.014/3min） |
| A voice | 高质量档 mvsep-mdx23 | $0.16 / 首（若启用） |
| B headshot | Kontext + face-swap | **$0.053 / 张**（$0.04 + $0.013） |

每日毛利粗算（从 R2 订单 + 任务数）：

```
voice 毛利 = Σ(paid orders amountCents)/100 − Σ(job minutes × 0.004667) [− HQ 单数 × 0.16]
headshot 毛利 = Σ(paid orders amountCents)/100 − Σ(生成张数 × 0.053)
```

示例（手动）：Trial Pack $2.90 用满 15 分钟 → 成本 $0.070 → 毛利 $2.83（97.6%）；Sample Pack $9 生成 5 张 → 成本 $0.265 → 毛利 $8.735。
> 注意：`cost.ts` 当前默认内存存储（isolate 内），**未持久化**；生产要按 job 落库才能自动出日报，属于后续 TODO。

## 5. R2 数据布局与人工查询

```
paid-tools-files (bucket)
├─ orders/<voice|headshot>/<orderId>.json      # 订单（status/amountCents/unitsGranted/unitsUsed）
├─ events/<voice|headshot>/<YYYY-MM-DD>/*.json # 埋点（本任务新增，字段见 §7）
├─ <site>/in/<date>/<jobId>/...                # 用户上传（生命周期 24–48h）
└─ <site>/out/<date>/<jobId>/...               # 产物（生命周期 30d）
```

查询方式（任选）：
1. **Cloudflare Dashboard → R2 → paid-tools-files**，按前缀 `orders/`、`events/<site>/<date>/` 浏览（最简单，零依赖）。
2. 装了 AWS CLI 的机器：`aws s3 ls s3://paid-tools-files/events/voice/2026-11-14/ --endpoint-url https://$R2_ACCOUNT_ID.r2.cloudflarestorage.com`（需 `AWS_ACCESS_KEY_ID`=R2_ACCESS_KEY_ID、`AWS_SECRET_ACCESS_KEY`=R2_SECRET_ACCESS_KEY；本机未验证 CLI 是否安装）。
3. 在 Node ≥22 的机器/CI：`npx wrangler r2 object list paid-tools-files`（若你的 wrangler 版本支持；本机 Node 20 无法运行）。

事件 JSON 字段（`/api/events` 写入）：

```json
{"site":"voice","event":"checkout_started","path":"/pricing","orderId":"ord_...","jobId":null,
 "ts":"2026-11-14T10:08:30.886Z","receivedAt":"...","props":{"ext":"wav"}}
```

**PII 策略**：不存 IP、User-Agent、邮箱、姓名、地址、卡号、音频/人脸/文件内容；`props` 里命中 `email|phone|name|card|face|selfie|audio|...` 的 key 直接丢弃（已本地验证：`{"ext":"wav","email":"leak@example.com"}` 落库后只剩 `ext`）。

## 6. 自动告警：建议方案（**未实施**，别当已配置）

| 方案 | 成本 | 能做什么 | 状态 |
| --- | --- | --- | --- |
| Cloudflare Notifications（Workers 错误率/请求量） | 免费 | 5xx/请求量突增邮件 | ❌ 未开 |
| UptimeRobot（免费 50 个监控） | 免费 | 两站 `/api/version` 每 5 分钟探测 + 邮件/Webhook | ❌ 未开 |
| GitHub Actions 每日 cron | 免费额度 | 跑 §1 巡检脚本；失败发 Issue/Webhook 到飞书 | ❌ 未建（本任务允许新增 `.github/workflows`，但需要 webhook secret 与用户确认，未擅自创建） |
| Worker Logs + Logpush | 付费 | 402/5xx 精确比例、落 R2 便于 SQL | ❌ 未开 |

## 7. 事件口径（给后续分析用）

| 事件 | 触发点 | 关键字段 | 用途 |
| --- | --- | --- | --- |
| `checkout_started` | 前端 `POST /api/checkout` 成功后 | orderId | 支付漏斗分母 |
| `paid` | 前端轮询 `/api/orders/reconcile` 或 `/api/orders/status` 返回 `status:"paid"` | orderId | 支付成功（webhook 审核期以 reconcile 为准） |
| `job_started` | 前端 `POST /api/jobs`（A）/ `POST /api/orders`（B）成功后 | jobId | 任务开始 |
| `job_done` | 前端轮询 `/api/jobs/<id>` / `/api/orders/<id>` 返回 done/completed/succeeded | jobId | 任务完成 / 留存分母 |
| `download_clicked` | 点击 `<a download>` 或直链文件（mp3/wav/zip/jpg/png…） | props.ext | 交付完成价值事件 |

服务端也可以直接 `POST /api/events`（白名单：checkout_started / paid / job_started / job_done / download_clicked / page_view / ui_error）。**验收证据**：`docs/evidence/events-api-evidence.txt`（本地 curl：200、PII 过滤、R2 写入 `stored.r2=1`）。

## 8. 退款与 Waffo webhook 监控（2026-11-14 补，task-28）

> 操作手册见 `docs/REFUND-RUNBOOK.md`；工具 `tools/refund-waffo-order.mjs`（幂等，`--dry-run` 只读）。

### 8.1 每日必查（3 条 GraphQL，只读）

1. **退款 ticket 是否卡住**：`refundTickets(limit:20)` 里 `status` 非 `succeeded` 且 `createdAt` 超过 30 分钟 → P1，按 runbook §7 跟进（不要重复建 ticket）。
2. **退款记录是否落 R2**：`refunds(limit:20)` 每条 `succeeded` 都要能在 R2 `orders/<site>/<orderMerchantExternalId>.json` 看到 `status=refunded` + 同 `providerRefundId`。缺失 → 跑 `node tools/refund-waffo-order.mjs --order <id>`（幂等补写，不会二次退款）。
3. **webhook 投递健康**：`webhookDeliveries(storeId, limit:20)` 里 `status="failed"` 计数 > 0 → 立即查 `responseBody`。

### 8.2 阈值与告警

| 指标 | 阈值 | 级别 | 处置 |
| --- | --- | --- | --- |
| `webhookDeliveries.status=failed`（24h） | ≥1 | **P0**（当前必现，见 8.3） | 先确认 R2 订单是否已由 reconcile/脚本补上，再修验签 |
| 退款 ticket 非终态 > 30min | ≥1 | P1 | runbook §7 |
| R2 退款状态与 Waffo 不一致 | ≥1 | P0 | 用脚本 `--dry-run` 定位后幂等补写 |
| `payment_not_found` 的「paid」R2 订单 | ≥1 | P1 | 测试伪造单或丢支付：核对 Waffo orders，禁止退款 |
| 退款金额 > $50 或不在 runbook §2 口径 | 任意 | P1 | 需 Lead 书面确认后加 `--max-amount` |

### 8.3 已知 P0：live webhook 全部 401（2026-11-14 确认，未修）

- 现象：两站 `order.completed` / `refund.succeeded` 投递均 401（每事件 5 次重试），我方返回 `{"ok":false,"error":"bad_signature","reason":"webhook 时间戳过期（重放保护）"}`；旧站 `tidycontracts.com/api/webhook/waffo` 200。
- 根因：`packages/core/src/payments/waffo.ts` 的 `verifyWebhookSignature` 把 Waffo 的 `t`（**毫秒**）当秒比较，且窗口是 5 分钟（官方要求 45 分钟，重投会重放原始 `t`）。
- 影响：支付/退款状态更新只能走 `/api/orders/reconcile` + `tools/refund-waffo-order.mjs`；**在修复前，任何依赖 webhook 的自动化都不要上线**。
- 验收修复：`webhookDeliveries` 里 `status=failed` 清零 + 手动重放一次事件返回 200。
- 另：同一 URL 注册了 2 条 live webhook（11-12/11-14 各一次），清理命令见 REFUND-RUNBOOK §9（需 owner 批准）。

---

# 9. 自动监控（task-27，2026-11-15）：脚本 + GitHub Actions + 阈值/退出码

> 本节把 §0「没有任何自动告警」补成**可执行资产**。与 §8（退款/webhook 监控，task-28）互不覆盖。

## 9.1 资产清单

| 资产 | 作用 | 状态 |
| --- | --- | --- |
| `tools/monitor-paid-tools.mjs` | 两站可用性 + 付费闸门 + 已知订单 + R2 订单/收入/失败率 + CF 24h errors + 可选飞书摘要；输出 JSON | ✅ 本机真实跑通 |
| `tools/smoke-paid-tools.mjs` | 秒级关键路径 smoke（页面/API/sitemap/404/www/安全头/闸门/定价真实性/已知订单），严格 pass-fail | ✅ 27/27 通过 |
| `.github/workflows/ci.yml` | push/PR：`npm ci` → `typecheck` → 双站 build（**不部署**） | ✅ YAML 已校验，build 本机等价跑通 |
| `.github/workflows/monitor.yml` | 每日 01:00 UTC（09:00 CST）跑 smoke + monitor；critical 才让 job 变红；JSON/MD 存 artifact | ✅ YAML 已校验 |
| `apps/*/app/api/health/route.ts` | 只读健康检查（service/status/commit + `checks.r2`），给外部 uptime 探针用 | ✅ 已加入构建；**尚未部署**（线上 404 属预期） |

## 9.2 命令（本机 / CI）

```bash
# 本机（直连被网络策略挡住时脚本会自动探测 127.0.0.1:7897 代理；也可显式指定）
node tools/smoke-paid-tools.mjs                       # 期望 exit 0，27 项全 PASS
node tools/monitor-paid-tools.mjs                     # JSON→stdout，人读摘要→stderr
node tools/monitor-paid-tools.mjs --quiet > monitor.json
node tools/monitor-paid-tools.mjs --probe-r2          # 只做 R2 只读连通性自检
node tools/monitor-paid-tools.mjs --proxy=http://127.0.0.1:7897
node tools/monitor-paid-tools.mjs --no-proxy          # 强制直连（CI 用）

# GitHub Actions 里同样输出文件（供 Step Summary / artifact）
node tools/monitor-paid-tools.mjs --quiet --json-out=monitor.json --md-out=monitor.md
node tools/smoke-paid-tools.mjs   --json-out=smoke.json --md-out=smoke.md
```

## 9.3 阈值与退出码（脚本 `THRESHOLDS` 与本节必须一致）

| # | 指标 | 阈值 | 判读 |
| --- | --- | --- | --- |
| 1 | 页面可用性 `/`、`/pricing`、`/orders` | 非 200 = **fail(critical)** | 站点挂了 |
| 2 | 页面响应时间 | > 2500ms = warn | 只是慢，不判死 |
| 3 | `/api/version` | 200 且 `service` 匹配 = pass；否则 fail | commit=dev 仅 info（部署未注入 GIT_COMMIT） |
| 4 | `/api/events` GET | `r2:true` = pass；`r2:false` = warn | false 时事件只进 stdout，统计会失真 |
| 5 | `sitemap.xml` | 200 且 URL 数 ≥16；200 但 <16 = warn；非 200 = fail | 两站当前都是 16 |
| 6 | 付费闸门 `POST /api/jobs`(A) / `POST /api/orders`(B) | 必须 **402**；2xx = **fail(critical, P0 免费口子)**；5xx = fail | 探针无副作用（无订单必 402） |
| 7 | 已知订单 `/api/orders/status` | 非 200 且非 404 = fail；404 或状态不一致 = warn | 订单可能被 CLEANUP 清理 |
| 8 | CF 24h errorRate（scope: `paid-tools-*`） | > 1% = warn；> 5% = fail | 缺 `paid-tools-*` 脚本 = warn |
| 9 | R2 前缀 `orders/`、`events/` | 读取失败 = warn；凭证缺失 = skipped | 只读，绝不写 R2 |

**退出码**：`0` = ok；`1` = warn（可用但有短板）；`2` = critical（挂了/闸门被打开/核心 API 500）。
> `monitor.yml` 的处理：exit 2 → job 失败；exit 1 → 只打 `::warning::`，不阻塞（warn 仍进 Step Summary + artifact + 飞书）。`smoke` 任何 FAIL → job 失败（fail fast）。
> 抗抖动：两个脚本对**连接级失败**（超时/ECONNRESET/代理抖动）各重试 1 次；HTTP 4xx/5xx 不重试（那是真实信号）。实测本机连续 3 次 monitor + 2 次 smoke 全部 exit 0。

## 9.4 2026-11-14 23:5x–2026-11-15 00:0x 本机真实运行证据

- `smoke` → **PASS 27/27，exit 0**（A/B 各 13 项；含 402 闸门、16 URL sitemap、www 301、安全头、已知订单）。
- `monitor` → **OK，exit 0，22 checks 全 pass**（proxy 自动识别 `127.0.0.1:7897`，因为本机直连生产超时）。
- R2 只读统计（当时）：`voice` 12 单（paid 1 / refunded 4 / pending 7，net $2.90）；`headshot` 10 单（paid 5 / refunded 1 / pending 4，net $45.00）。
  ⚠️ 随后 task-28 的 `CLEANUP` 脚本清理了测试单，再跑变成 `voice` 2 单 / `headshot` 1 单 —— **数字会随运维动作变化，这是实时的，不是 bug**。
  ⚠️ `headshot` 的 5 个 paid 是 2026-11-14 测试伪造/手动标记（无真实 Waffo payment，见 PROGRESS），**净收入不等于真实收款**。
- CF GraphQL（24h）：`paid-tools-headshot` 4514 req / 0 err，`paid-tools-voice` 4256 req / 0 err，errorRate 0.00%；账号里另有 `tidycontracts-cf`、`hk-www-redirect`，已按 `paid-tools-*` 过滤，不污染判读。
- CF Web Analytics：`NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN` **未配置**（`.env.local` 与仓库都没有）→ `Analytics.tsx` 的 beacon 分支 no-op；monitor JSON 里 `meta.configured.cloudflareWebAnalyticsToken=false`（本轮不做伪造 ID）。
- 飞书：`FEISHU_WEBHOOK` 未配置 → `channels.feishu = skipped`（本地只输出 JSON/摘要，**不伪造已推送**）。
- 反向验证：把 `MONITOR_SITE_VOICE` 指向坏域名后 `monitor` 返回 **exit 2 / status=critical / 9 fails**，说明阈值真的会触发。

## 9.5 GitHub Actions 的启用方式（需要用户/Lead 动作）

1. 把仓库推到 GitHub（当前改动未 commit，按纪律未提交）。
2. Settings → Secrets and variables → Actions 添加（**全部可选**，缺了脚本会标 skipped）：
   `FEISHU_WEBHOOK`、`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`、`R2_ACCOUNT_ID`、`R2_ACCESS_KEY_ID`、`R2_SECRET_ACCESS_KEY`、`R2_BUCKET`、`R2_ENDPOINT`。
3. Actions 页面确认 `monitor` workflow 出现（schedule 只认默认分支；`workflow_dispatch` 可手动跑）。
4. 首次手动 Run workflow 验证：Step Summary 应出现 smoke/monitor 两张表；artifact 应有 `monitor.json`/`monitor.md`。

## 9.6 仍**未**自动化 / 明确 blocked 的部分（不冒充完成）

| 项 | 现状 | 原因 / 替代 |
| --- | --- | --- |
| 5xx/402 精确按状态码比例 | ❌ 未自动化 | GraphQL `workersInvocationsAdaptive` 只给 requests/errors 汇总；精确比例需 Workers Logs 或 `wrangler tail`（本机 Node 20 跑不了 wrangler 4.160，需 Node ≥22） |
| Worker CPU 时间 | ❌ 未自动化 | 该数据集无 CPU 维度；Dashboard → Workers → Metrics 人工看，或开 Logpush（付费） |
| `/api/health` 线上可用 | ⏳ 未部署 | 代码已加并通过 build；下一次部署后 `GET /api/health` 才会 200（在那之前 404 不是故障） |
| 线上 commit 与仓库 HEAD 对账 | ❌ 不可行 | 线上 `/api/version.commit=dev`（部署未注入 `GIT_COMMIT`）；要修需在部署时注入 build 环境变量 |
| webhook 自动投递健康 | ❌ 不在本任务 | 归属 task-28；**已知 P0：live webhook 全部 401**（见 §8.3）——修复前「paid/pending」数字可能滞后，监控里 `pending` 偏多属已知现象 |
| 自动告警到飞书 | ⏳ 只差 webhook | 脚本与 workflow 已支持，填 `FEISHU_WEBHOOK` secret 即生效 |

## 9.7 每周仍建议人工做的事（脚本替代不了）

1. `wrangler tail` 抽查 402/5xx 与 CPU（或等 Logpush 上）。
2. 核对 R2 `paid` 订单与 Waffo 真实付款一一对应（防测试伪造单混入收入）。
3. 看 `monitor` 的 `warnings` 趋势，而不是只看 exit code。
