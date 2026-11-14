# 进度看板（2026-11-12 12:20）

## 本轮新增（真实 AI 已跑通）

- [x] **Replicate token 已配**；真实 demucs 分离 E2E：3 秒音频 → 4 stems，predict 3.22s；App 层 `/api/jobs` → done
- [x] **B 站真实头像 E2E**：flux-kontext-pro (6.0s) + face-swap (8.0s) → 1024² 结果图；App 层 `/api/orders` → done
- [x] B 改 **Replicate-only**（不再需要 fal），单张 $0.053；TECH-SELECTION/cost 已更新
- [x] Neon：现有项目内建 `paid_voice` / `paid_headshot` 两 schema，`prisma db push` 成功；连接串已进 `.env.local`
- [x] 证据：`docs/REAL-E2E.md`
- [ ] **等用户提供：域名、Cloudflare API Token、R2 S3 keys+bucket、Waffo 产品 ID**（阻塞部署/支付）
- [ ] 假门页/预售价验证；i18n；GSC/统计；外链（上线后）

## 审计 + 去免费试用（2026-11-11）

- [x] 审计报告 `docs/AUDIT-vs-SKILL-2026-11-11.md`：对照 6 个访谈派生 skill + 41 篇提炼 + 第三/第五篇校准；发现 3 个 P0（免费试用、B 主词 18.1K<2万、跳过假门页）
- [x] 核心定价改为**无免费额度**：A Trial Pack $2.90/15min + Starter $5/90min + Pro $9/200min + Annual $39；B Sample Pack $9/5 张 + $35/40 + $45/60 + $75/100
- [x] A 站页面去免费承诺 / API 生产 402（task-15，voice-builder，19 routes 0 error）
- [x] B 站页面去免费预览 / API 生产 402（task-16，headshot-stack，18 routes 0 error）
- [x] 复核：两站生产 402；A 免费文案 0 命中；B 10 处均为否定/对比语境、0 处免费生成；build/typecheck 全 0 error
- [x] B 主词修正：首页 `professional headshots` 22,200/KD50，新子页 `/ai-headshot-generator` 18,100/KD41（已完成，13 页 / sitemap 13）
- [x] 域名候选实查（RDAP）：A `stemextractor.com` / B `headshotsnap.com`（备选见 docs/DOMAINS.md）
- [x] A 站 E-E-A-T：/about、/contact、/authors、7 工具页系统方法段、作者/更新日期（sitemap 16）
- [x] B 站 E-E-A-T 与免费措辞清零（task-19：/about、/contact、/authors、16 页署名/更新日期、免费正则 0 命中；sitemap 16）
- [x] 复核：两站 19/19 页面 200、build/typecheck 0 error、生产 402、sitemap 16/16
- [ ] 假门页/预售价验证（目标 ≥20 留资或 ≥3 付费）
- [ ] i18n zh/es、GSC/统计/Bing、外链计划（上线后）

## 已完成（工程侧）

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

- [x] Cloudflare Workers Paid、2 个 .com、Replicate $10、R2 开通（用户已确认 2026-11-12；域名具体名字待确认）
- [ ] 填 `.env.local`：R2 keys、Neon 连接串（已完成 voice/headshot schema）、Waffo 产品 ID
- [x] 切真实 provider：demucs / flux-kontext-pro / face-swap；已跑 1 单人声 + 1 单头像 E2E
- [ ] 接 Waffo checkout/webhook；部署 Cloudflare Workers；GSC/统计
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

## 部署里程碑（2026-11-12）

- [x] A 站 Cloudflare Worker 部署：`paid-tools-voice` → https://paid-tools-voice.wanghaotiannika.workers.dev
- [x] B 站 Cloudflare Worker 部署：`paid-tools-headshot` → https://paid-tools-headshot.wanghaotiannika.workers.dev
- [x] 25 个 secrets/站（Replicate/R2/Waffo/Neon/会话）；R2 bucket `paid-tools-files`，S3 PUT/GET 200
- [x] 生产 402 门禁修复：不再依赖 NODE_ENV，无 ALLOW_MOCK/ALLOW_REAL 即 402
- [x] 部署后真实 demucs E2E：1 秒 WAV → 4 stems（predict 2.03s），随后删除 ALLOW_REAL 恢复 402
- [ ] **NS 切换**：Dynadot → `felipe/marjory.ns.cloudflare.com`，Cloudflare zone 激活
- [ ] 自定义域 + www→apex 301；Waffo checkout/webhook；R2 转存；GSC/统计
- [ ] **密钥轮换**：旧 Worker version 曾包含构建期密钥，上线前轮换 CF token / R2 keys / Replicate token / Waffo private key

## 自定义域已上线（2026-11-12）

- https://stemextractor.com ✅ 200，canonical 正确；`www` → apex **301**
- https://headshotsnap.com ✅ 200，canonical 正确；`www` → apex **301**
- 两站自定义域 `POST` 仍 **402 payment_required**
- Cloudflare zone 已 Active；$5 为 Workers Paid（账户级），域名 zone 的 Free 是网站套餐，二者独立
- 旧 Worker version 含构建期密钥，待轮换/删除

## 页面动效 + 示例成品（2026-11-12）

- [x] A 站：真实 4-stem 试听器（public-domain "Amazing Grace"），可切原曲、单轨 ON/OFF、同步播放、动态波形
- [x] B 站：6 张 FLUX 1.1 Pro 生成的高质量 AI 头像样片（896×1088），替换渐变占位图
- [x] 两站：ScrollReveal 渐入、hover 缩放/遮罩、`prefers-reduced-motion` 支持；无 JS 内容仍可见
- [x] 已 clean build + 部署：A version `1a3cca36`、B 站新版本（见 wrangler 输出）
- [x] 自定义域回归：stemextractor.com / headshotsnap.com 200，www 301，POST 402
- 素材授权见 `docs/SAMPLES.md`

## 线上自检（2026-11-12）

- [x] 32 页全量巡检：0 broken link / 0 broken asset / 0 JS error / 0 移动端横向溢出；JSON-LD 全部可解析
- [x] 音频实际播放、表单 402、404、www 301、自定义域 200 全部通过
- [ ] **邮箱未配置**：两域名无 MX/TXT，support@ 等不会转发到 Gmail；需开 Cloudflare Email Routing
- [ ] 所有页面缺 og:image（次要，社交分享无大图）

## 2026-11-12 收尾

- [x] Cloudflare Email Routing：两域名 catch-all 转发到 Gmail，状态 Active
- [x] 两站 OG 分享图 1200×630，首页 meta 已输出并验证
- [ ] 外部邮箱投递实测（建议手动发一封到 support@ 确认）
- [x] 邮件路由实测：Cloudflare 转发链路已到达 Gmail；同账号自测触发 Gmail 去重通知

## 2026-11-12 支付 + R2 上线

- [x] Waffo 真实 checkout：`POST /v1/actions/checkout/create-session`，RSA-SHA256；线上两站均返回真实 pancake.waffo.ai URL
- [x] 订单持久化：R2 `orders/<site>/<orderId>.json`（无数据库依赖）；线上 `/api/orders/status` 可读
- [x] 付费闸门：未支付/额度不足返回 402；支付后按订单额度扣减
- [x] Waffo webhook：两站 `/api/webhooks/waffo`，已注册 store webhook；用临时 key 实测签名事件 → 订单 paid；随后恢复真实公钥
- [x] 真实 E2E：A 站 demucs 4 stems + R2 输出（7 天签名 URL）；B 站 Kontext+face-swap 1 张 + R2 输出
- [x] B 站真实模式目前只生成 1 张（不是套餐张数），待做多图 fan-out
- [x] IndexNow：两站 key 文件 200，已向 indexnow.org 提交 sitemap URL（202）
- [ ] GSC 验证/提交（需要 Google 后台交互）
- [ ] 密钥轮换：旧 Worker version 仍存在；Cloudflare/R2/Replicate/Waffo 凭据尚未轮换

## 2026-11-12 GSC + IndexNow

- [x] GSC Domain properties verified for `stemextractor.com` and `headshotsnap.com` via Cloudflare DNS TXT
- [x] B 站 sitemap 提交成功（16 URLs）
- [~] A 站 sitemap 已提交但 GSC 显示「无法获取」，站点 sitemap 本身 200；等待重试
- [x] IndexNow key 文件根路径 200；两站 sitemap URL 已提交（202）
- [ ] 旧 Worker version/密钥轮换仍待做（当前 token 无删除 version/R2 admin 权限，需要 Dashboard 操作）
- [ ] B 站真实生成仍是 1 张/单，不是套餐张数（多图 fan-out 待做）

## 2026-11-14 支付环境修正

- [x] 定位 checkout 显示“测试模式”：原产品是 Test 环境，且 Worker 使用的是 test key
- [x] 用 `cf-secrets.json` 的 live key 重建 8 个 live 产品（见 WAFFO-PRODUCTS.md）
- [x] 切换本地 env + 两站 Worker secrets 到 live 私钥/公钥
- [x] 注册 live webhook（testMode=false）两站
- [x] 线上 checkout 页面已确认不再是测试模式，B 站 $9 产品正常显示
- [ ] 真实卡扣款 E2E 尚未执行（需要真实卡；不能用测试模式代替）

## 2026-11-14 真实付款排查

- 用户真实支付 $2.90（Waffo live order `ORD_3FE3bBRlLEJaeliEA30nYS`，business ref `ord_mwfzkg8h_yy9s9md`，status completed）
- R2 订单仍是 pending：**Waffo live webhook 在 store review 通过前不会投递**（官方文档明确）
- 修复：
  - 新增 `/api/orders/reconcile`：从 Waffo GraphQL 按 orderMerchantExternalId 查订单，completed 即标记 paid
  - success 页面每次轮询前先 reconcile
  - `/api/jobs`、`/api/orders` 的付费闸门在 unpaid 时先 reconcile 再决定 402
  - BuyButton 在跳转 checkout 前把 orderId 写入 localStorage，避免用户没点 Waffo 的 Done 就回站时丢单
- 该用户订单已标记 paid，额度 15/15；待用户用 success 链接恢复浏览器 orderId 后即可上传

## 2026-11-14 UX 修复

- [x] 结果下载：所有 stem/头像下载链接改为新标签打开，原结果页不再被覆盖，可连续下载多个文件
- [x] B 站头像结果增加可点击缩略图 + Download 覆盖层
- [x] A/B 上传区支持桌面文件拖拽（dragenter/over/drop，带高亮和类型/大小校验）
- [x] 拖拽测试：A 拖入 mp3 显示文件名；B 拖入 3 张 jpg 显示 "3 selfies selected"
- 注意：拖拽的是「文件」，不是文件夹本身；浏览器不会把文件夹内容自动展开

## 2026-11-14 P0/P1 智能体团队交付与验收

- 团队：product-truth / b-fanout / access-metering / growth-ops / security-compliance，Lead 集成部署
- A 站：只售 $2.90 Trial（15 分钟、4 个 MP3 stems），订阅隐藏；全站清除 WAV/6-stem/batch/priority/instrumental 承诺
- B 站：只售 $9 Sample Pack（5 张）；真实 Replicate + R2 E2E 5/5 张，193s，≈$0.265；40/60/100 仅 Coming soon
- 隐藏套餐服务端硬拒绝：/api/checkout → 409 plan_not_available
- 订单恢复：两站 /orders + /api/orders/[id]/files，按需重签 7 天 URL；用户订单 15/15 已恢复
- 额度：reserve→fail→refund / success→confirm；服务端解析真实音频时长，>10min 400 不扣费
- 增长：GSC A sitemap 恢复成功；B sitemap 成功、B 首页待复检；IndexNow 200；事件 API + llms.txt + 监控/外链文档
- 安全：线上安全 headers 生效；密钥轮换/旧 Worker 删除/R2 lifecycle 因权限 blocked；律师审阅 blocked
- 线上验收：typecheck/build/OpenNext deploy 0 error；两站关键页 console 0 error
- 详见 docs/ACCEPTANCE-P0-P1.md、SECURITY-ROTATION.md、COMPLIANCE.md、OPS-MONITORING.md、GSC-BING.md、BACKLINK-EXECUTION.md

## 2026-11-14 $0.10 真实环境测试单

- 建 live QA 产品：Voice QA `PROD_7PIC7us5fzMMo563pOzdqm`、Headshot QA `PROD_0929Yj0tKUY9jGRGDbgBTL`，$0.10 / 1 unit。
- 隐藏 `/qa` 入口；真实卡支付完成：订单 `ord_mwggroyd_1q2v4v3`，Waffo remote completed，reconcile 后 paid，amount=10 cents。
- 真实 AI job `voice_mwgh7t7f_ndvth1` 因 Replicate 502 失败；订单预留自动退回（used=0/reserved=0/remaining=1），验证失败不扣额度。
- 测试入口已下架：`/qa` 两站 404；`/api/checkout` 的 `voice-qa`/`headshot-qa` 返回 409；Worker QA secrets 已删除；本地 QA env 已清理。
- R2 lifecycle 已通过 Dashboard 配置：`voice-out-30d` + `headshot-out-30d`（prefix voice/out/、headshot/out/，Delete after 30 days，Enabled）。
- 旧 Worker versions 仍无法删除（Dashboard 版本菜单无 Delete，API token DELETE 返回 405 Method not allowed）；密钥轮换仍 blocked。

## 2026-11-14 真实付款退款 + 密钥教程

- 已通过 Waffo API 创建退款 ticket 并执行成功：
  - `$2.90`：payment `PAY_7cMFjz9NgtWwmAlJDGz4z5` → refund `REF_33QO5Zrs5b8nJINX5jMmAw`（succeeded）
  - `$0.10`：payment `PAY_7DwtS4efFKx6E8ZH74OoGL` → refund `REF_0KRhN70cseWHScS8fXld6D`（succeeded）
- R2 订单 `ord_mwfzkg8h_yy9s9md` / `ord_mwggroyd_1q2v4v3` 已标记 `refunded`。
- B 站 R2 里的 5 个 `headshot-trial` paid 是测试脚本伪造/手动标记，**没有真实 Waffo payment**，不属于真实扣款，不退款。
- 隐藏 $0.10 产品已置 `inactive`；入口已下架。
- 新增 `docs/KEY-ROTATION-TUTORIAL.md`：逐 key 轮换、干净部署、旧 Worker versions 删除路径/保底换服务、回滚。

## 2026-11-14 生产支付复核（用户确认信任、不再轮换）

- 用户决定：接受旧 Worker versions/密钥风险，不做轮换；支付继续使用生产 key。
- 生产 checkout 复核：
  - Voice Trial：`US$2.90`，`StemSplit Trial Pack - 15 minutes`，页面 `test-mode=false`，返回真实 `pancake.waffo.ai` URL。
  - Headshot Sample Pack：`US$9.00`，`PortraitLab Sample Pack - 5 headshots`，页面 `test-mode=false`。
- Worker secrets 无 `ALLOW_MOCK`；两站 Waffo live key、live product IDs 在运行。
- 测试入口已下架；QA 产品已 inactive；两笔真实付款已退款成功。
- 结论：支付/收款链路可生产使用；旧 versions/未轮换密钥按用户接受风险保留，不再作为上架阻塞。

## 2026-11-15 P0 监控/退款 + P1 6/7/8 收口

- 修正 Replicate 余额结论：Dashboard 当前 credit remaining **$9.23**；此前 429 原文 `<5` 是旧状态/错误文案，不能当当前事实。
- A 站 job 增加 429/502 瞬时错误重试与轮询容错（3 次才失败，失败仍退额度）。
- **P0 支付 webhook 修复**：Waffo `t` 是毫秒，旧代码按秒 + 5 分钟窗口 → 401；已改为毫秒归一化 + 45 分钟窗口，线上 invalid-sig 测试确认时间戳不再被误判。
- 移除 Waffo 11-12 两条重复 live webhook，保留 11-14 两条（voice/headshot）+ tidycontracts 旧站。
- P0 监控：`tools/monitor-paid-tools.mjs`（22 checks）/`tools/smoke-paid-tools.mjs`（27 checks）本地/线上 pass；排除测试伪造订单收入；Feishu 未配置。
- P0 退款自动化：`tools/refund-waffo-order.mjs` + `docs/REFUND-RUNBOOK.md`，两笔真实退款 dry-run 幂等通过。
- P1 7 清理：删除 38 个测试对象 / 41.01 MB，保留 14 个（真实退款证据 + B fanout 证据）；R2 20 对象。
- P1 6：GSC B 首页已编入索引；A/B sitemap 成功/16；CF Web Analytics token 未配置。
- P1 8：`.github/workflows/ci.yml` + `monitor.yml`、`docs/DEPLOY-ROLLBACK.md`；workflow 未跑（仓库未 push/无 Actions secrets）。
- `/api/health` 两站上线；smoke 27/27、monitor 22/22。

## 2026-11-15 P0 修复收口

- Replicate 当前 Dashboard credit remaining **$9.23**；之前 `<5` 的 429 原文是旧状态/错误文案，不作为当前结论；A 站已加 429/502 创建重试 + 轮询 3 次容错，失败仍退额度。
- **P0 webhook 修复已部署**：Waffo t 毫秒归一化 + 45 分钟窗口；线上用当前毫秒时间戳 + 非法 v1 测试返回 `签名不匹配`（不再错误返回时间戳过期）。live 正式事件需下一笔真实事件/delivery log 复核 200。
- 已移除 Waffo 11-12 两条重复 live webhook（voice/headshot 各一），保留 11-14 两条 + tidycontracts 旧站。
- P0 监控：`tools/monitor-paid-tools.mjs` 22/22 pass，`tools/smoke-paid-tools.mjs` 27/27 pass；排除测试伪造订单收入（B 的 $9 测试单不再计入 net）。
- P1 7：R2 清理 38 对象 / 41.01 MB，保留 14 个证据对象（含真实退款订单 + B fanout 证据）；R2 20 对象。
- P1 6：GSC B 首页已编入索引；A/B sitemap 成功/16；CF Web Analytics token 未配置。
- P1 8：CI/monitor workflow + DEPLOY-ROLLBACK.md 已落地；workflow 未实际跑（仓库未 push / Actions secrets 未配）。
- Feishu 告警未配置，monitor 的 feishu channel = skipped；这是 P0 监控唯一未闭环项。
