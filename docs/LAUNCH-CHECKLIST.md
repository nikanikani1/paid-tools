# 上线检查清单（付款后按顺序执行）

> 依据 `site-eng-accounts` / `site-eng-deploy` / `site-selection-runbook` Step 18 / `site-gsc` / `site-risk-compliance`。
> 勾选 = 有证据（命令输出/截图/URL），不是「应该好了」。

## 0. 域名（付款当天）

- [ ] 买 `stemextractor.com`（A）+ `headshotsnap.com`（B）或备选（见 `DOMAINS.md`）
- [ ] **Auto-Renew 打开**；记入域名台账（注册/到期/续费/收录）
- [ ] Cloudflare Registrar 自动托管 DNS；TTL 默认
- [ ] 不买竞品商标近似域名（UDRM 风险）

## 1. Cloudflare（$5 Workers Paid 后）

- [ ] Workers Paid 生效（Billing 显示 $5/月）
- [ ] R2 bucket：`paid-tools-voice`、`paid-tools-headshot`（或一个 bucket 两前缀）
- [ ] R2 S3 API Token（Access Key/Secret）；CORS 允许两个域名 PUT/GET
- [ ] R2 lifecycle：`in/` 24–48h、`out/` 30 天；失败文件 7 天
- [ ] Turnstile widget（两站各一）；site key/secret 进 env
- [ ] Workers Builds：GitHub repo `paid-tools` → 两个 Worker，Root=仓库根，Build/Deploy 按 `CLOUDFLARE-DEPLOY.md`
- [ ] Custom Domain：`stemextractor.com` → voice worker；`headshotsnap.com` → headshot worker
- [ ] Redirect Rule：`www → apex` 301（两域各一条，保留 query）
- [ ] 限流规则：`POST /api/jobs`、`/api/orders` 每 IP 10 次/分钟

## 2. Neon / DB

- [ ] 两个 Neon 项目（voice / headshot）→ pooler `DATABASE_URL_*`
- [ ] `npm run db:generate`；两库 `npm run db:migrate:deploy`
- [ ] `packages/core/src/db.ts`：PrismaNeonHttp 懒创建（Workers 无事务，幂等写）
- [ ] 迁移后查表：Job/Order/Credit/WebhookEvent 存在

## 3. AI + 文件

- [ ] Replicate token（`REPLICATE_API_TOKEN`）测 1 次 `cjwbw/demucs`
- [ ] 可选 fal key；跑 1 次 `flux-pulid` + `cdingram/face-swap`
- [ ] R2 预签名 PUT/GET 实测：浏览器直传 → provider 能读 → 产物转存
- [ ] Replicate 1 小时删除兜底：webhook 失败时轮询补转存 + 告警
- [ ] 文件大小/时长限制生效（A ≤10min/100MB；B 3–8 张/10MB）

## 4. 支付（Waffo）

- [ ] 商户后台新建产品：
  - A：Trial $2.90 一次性、Starter $5/月、Pro $9/月、Annual $39/年
  - B：Sample $9/5 张、Starter $35/40、Professional $45/60、Executive $75/100
- [ ] `WAFFO_*` env；checkout 创建 → 跳转 → 回调
- [ ] webhook RSA 验签 + 幂等（同一 event id 只处理一次）
- [ ] 支付成功 → 发 access token / 创建 job；失败/取消 → 不创建
- [ ] 退款路径：后台退款 → webhook/状态同步 → 额度回收
- [ ] 生产 402 改为「未付款 → checkout」；`ALLOW_MOCK` **不得**在生产常开

## 5. SEO / 收录（上线当天）

- [ ] GSC 两个网域资源（DNS TXT 验证）
- [ ] sitemap 提交（A 13+ / B 13+；新增页后更新）
- [ ] URL 检查：首页 + 前 3 工具页逐个「请求编入索引」
- [ ] Bing Webmaster Tools（从 GSC 导入）
- [ ] 统计：GA4 或 Cloudflare Web Analytics（privacy 页同步说明）
- [ ] canonical 指向正式域名（非 workers.dev/onrender）
- [ ] hreflang en + x-default（zh/es 后补）
- [ ] robots.txt 有 Sitemap、无 host；sitemap 全 200
- [ ] www→apex 301、尾斜杠归一化实测
- [ ] JSON-LD 用 Rich Results Test 验 1 页/站
- [ ] 404/500 页、favicon/OG 图

## 6. 信任/合规

- [ ] About / Contact / Authors 页上线（Task 18/19）
- [ ] privacy：音频/人脸数据、provider 列表、保留期、删除入口、不训练声明
- [ ] terms：可接受使用、版权/DMCA、退款、责任限制
- [ ] refund：48h 重做/退款规则，Trial/Sample 也适用
- [ ] B 站：肖像权/未成年人/公众人物禁止；人脸数据删除
- [ ] A 站：上传者版权声明 + DMCA 举报入口
- [ ] 法务过一遍（demo 文案不能直接上线）

## 7. 监控/回滚

- [ ] `/api/version` 返回 commit（两站）
- [ ] 每小时成本日志：job 数、AI 成本、支付失败、402 比例
- [ ] 飞书日报（复用 site-eng-monitor）
- [ ] Cloudflare 告警：5xx、CPU 1102、Worker 异常
- [ ] 回滚预案：域名/DNS、上一版 Worker、R2 不删数据
- [ ] 上线后 2 周不改 URL/结构；内容每周 2–3 页小批量

## 8. 上线后第一周

- [ ] GSC 收录数、曝光、点击；未收录原因
- [ ] 402→checkout→支付成功率；退款率
- [ ] 真实 AI 成本 vs 报价毛利
- [ ] 外链：每天 1–2 小时，目标 20 条/周（见 `BACKLINK-PLAN.md`）
- [ ] 假门页/预售价数据复盘：<20 留资或 <3 付费 → 换需求
