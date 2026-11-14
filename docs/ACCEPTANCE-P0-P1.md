# P0/P1 验收清单（2026-11-14，Lead 最终版）

> 结论：**代码层 P0/P1 已完成并部署；4 项外部权限/人工动作仍 blocked，已在下方标明，不冒充完成。**
> 线上验证时间：2026-11-14 19:20–19:35 CST。

## P0 产品真实性 — PASS

| 项 | 证据 |
|---|---|
| A 只卖 $2.90 Trial | 线上 `/pricing`：`voice-trial` 有 BuyButton；Starter/Pro/Annual 渲染 `Coming soon — subscriptions not open yet`，无按钮 |
| A 删除未兑现承诺 | 首页/9 个工具页/about/legal 渲染 HTML：`WAV / 6 stems / batch upload / priority queue / instrumental` 严格匹配为 0 |
| B 只卖 $9 Sample Pack | 线上 `/pricing`：`headshot-trial` 有 BuyButton；40/60/100 `Coming soon — not on sale yet`，无按钮 |
| 隐藏套餐不能手工购买 | `POST /api/checkout` 传 `voice-starter` → **409 plan_not_available**；`headshot-40` → **409** |
| 服务端 plan 特征与真实一致 | core `VOICE_PLANS` 已改为 4 MP3 stems，删除 WAV/6-stem/batch/priority；402 文案改真实交付 |

## P0 B Sample Pack fan-out — PASS（真实 E2E）

- 任务 `headshot_mwg9j392_k4cqqp` 线上 `GET /api/orders/:id` 返回：**status=done，files=5，succeeded=5，failed=0，r2Stored=5**，5 个文件名 `headshot-01..05.jpg`。
- Agent 真实 Replicate + 真实 R2 运行：**5/5 张，全部 HTTP 200，扣 5 张额度，成本 ≈$0.265，耗时 193s**。
- 部分失败只扣成功张数、全失败扣 0、429 等待/重试、同单重复提交 409、`images` clamp 5：确定性 harness 36 项 ALL PASS。
- 订单 job 关联：fan-out 创建后调用 `appendOrderJob("headshot", orderId, job.id)`；真实 R2 往返验证通过。

## P0 订单恢复/额度 — PASS

- 线上 `GET /api/orders/status?order=ord_mwfzkg8h_yy9s9md`：`paid / 15 granted / 0 used / 15 remaining`（用户此前被测试消耗的 1 分钟已恢复）。
- 线上 `/api/orders/ord_mwfzkg8h_yy9s9md/files`：200，`downloadsAvailable:true`，7 天按需重签、30 天保留字段。
- `/orders` 两站 200；支持 orderId/localStorage/URL 恢复。
- 跨站读订单文件 → 404。
- 额度预留/确认/退款：本地集成测试 reserve→fail→refund、reserve→success→confirm、幂等、超额拒绝 ALL PASS。
- 服务端真实时长：WAV/FLAC/MP3/M4A 解析；>10 分钟 → 400，不扣额度；无订单有效音频 → 402。
- 真实 AI 失败回滚未用真实 provider 触发（会烧额度），由 503/ledger 分支覆盖。

## P1 增长/运营 — 部分完成，外部项 blocked

| 项 | 结果 |
|---|---|
| GSC A sitemap | **成功**；16 个已发现网页（此前“无法获取”已恢复） |
| GSC A 首页 | 已编入索引；已请求编入索引 |
| GSC B sitemap | 成功/16；B 首页仍“Google 无法识别此网址”，需 24–72h 复检 |
| IndexNow | 两站 sitemap 全量提交，HTTP 200 |
| Bing Webmaster | **BLOCKED**：无 Microsoft 登录态；步骤已写 docs/GSC-BING.md |
| 事件 API | 线上两站 GET 200 / POST 200；R2 写入成功；白名单 7 事件、PII 过滤 |
| CF Web Analytics | **未启用**：无 `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN`，当前 no-op，未伪造 ID |
| 自动告警/日报 cron | **未建**：docs/OPS-MONITORING.md 如实标记，给出命令/阈值 |
| llms.txt | 两站 200 |
| 外链执行 | 10 条清单已落地 docs/BACKLINK-EXECUTION.md；需人工账号的动作未执行 |

## P0 安全/合规 — 部分完成，轮换 blocked

| 项 | 结果 |
|---|---|
| 安全 headers 线上 | **PASS**：两域名均返回 `x-content-type-options`、`referrer-policy`、`permissions-policy`、`x-frame-options: DENY`；CSP Report-Only |
| 隐私/条款/退款对齐 | **PASS（文案层）**：30 天保留、4 MP3 stems、B 肖像权/未成年人、A DMCA、删除无法兑现承诺 |
| 密钥轮换 | **BLOCKED**：没有任何生产密钥完成轮换；需用户后台+MFA |
| 旧 Worker versions 删除 | **BLOCKED**：当前 Cloudflare token 无删除 version 权限 |
| R2 lifecycle | **BLOCKED**：`wrangler r2 bucket lifecycle list` 返回 10000 Authentication error；需 R2 管理员权限 |
| 律师审阅 | **BLOCKED**：docs/COMPLIANCE.md 列 11 项待律师/用户确认 |

## 集成验收

- `npm run typecheck` → **0 error**
- `npm run build:voice` / `build:headshot` → **0 error**
- OpenNext clean build + `wrangler deploy` 两站 → **0 error**
- 线上关键页 console error：A/B 首页、pricing、orders → **0**
- 线上 404 / www 301 / OG / sitemap 已有既有证据；本轮新增 headers 已验
- 用户付费订单保持 `paid`，额度 **15/15**

## 仍 blocked / 需要用户操作（不冒充完成）

1. 轮换 8 组生产密钥 → 干净部署 → Dashboard 删除旧 Worker versions → 清理本地明文副本（详见 docs/SECURITY-ROTATION.md）。
2. Cloudflare R2 管理员权限配置 lifecycle（30 天输出、输入临时文件）。
3. Bing Webmaster 登录后导入 GSC / 提交 sitemap。
4. CF Web Analytics token（可选）与自动告警/日报 cron 的授权。
5. 律师审阅 privacy/terms/refund、DMCA designated agent、运营主体/管辖。
6. 外链 10 条中需人工账号的目录/社区提交。
7. B 站首页 Google 收录 24–72h 后复检。

## 追加验收：$0.10 真实环境测试单（2026-11-14）

- [x] 隐藏 `/qa` 入口（noindex，不链接、不在 pricing/sitemap）
- [x] Waffo live $0.10 产品创建，真实卡支付完成
- [x] 订单 `ord_mwggroyd_1q2v4v3`：reconcile 后 `paid`，amountCents=10
- [x] 真实 AI job 因 Replicate 502 失败，订单额度自动退回 1/1（failure refund 真实验证）
- [x] 入口已下架：上线 `/qa` 两站 **404**；`voice-qa`/`headshot-qa` checkout **409**
- [x] Worker QA secrets 删除；本地 QA env 清理
- [~] 真实成功 stem 未产出（provider 502，非项目扣费/权限问题）；已验证失败退款路径
- [x] R2 lifecycle：`voice-out-30d`、`headshot-out-30d` 已 Enabled（30 天删除）
- [ ] 旧 Worker versions 删除 / 全部密钥轮换：仍 blocked（见 SECURITY-ROTATION.md）
