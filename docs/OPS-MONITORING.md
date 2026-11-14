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
