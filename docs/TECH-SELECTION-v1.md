# 两站并行：技术选型与成本预估（v1，2026-11-11）

> **2026-11-11 10:20 更新：用户已确认走 Cloudflare Workers（弃用 Render 方案）。**
> 部署以 Cloudflare 为准：$5/账号/月，固定成本 **$6.86/月**（含 2 个域名摊销）；需做 4 处兼容修正（见 §1/§4.1/§5）。Render 内容仅保留为历史对照。

> 产品：**A. 人声/伴奏分离站**（vocal remover）+ **B. AI 职业头像站**（headshot）
> 依据 skill：`site-eng-stack`（Next 16/Prisma/Neon）、`site-eng-deploy`（Render vs Workers）、`site-eng-accounts`（账户清单）、`site-build`（页面结构/SEO）、`site-eng-multiagent`（团队施工规范）。
> 价格全部 2026-11-11 用 ego-browser 实访官方页面（研究全文与截图：`D:\ai-workspace\site-selection\2026-11-10-paid\research\`）。

---

## 0. 结论（先看这段）

| 决策项 | 结论 |
|---|---|
| **共享底座** | Next.js 16 App Router + TS + Tailwind v4 + Prisma 6 + Neon Postgres + Cloudflare R2 + Waffo + Resend + Turnstile；**npm workspaces 单仓两个 app** |
| **部署** | **Cloudflare Workers（OpenNext）**：一个账号 $5/月，两个 Worker/两个自定义域；**不做 Render**（省 4 处兼容改造的钱不值得，但用户已选 CF；按 site-eng-deploy 2.3 修 4 处） |
| **固定成本** | **$6.86/月**（CF $5 + 2 个 .com 摊销 $1.86）；Render 对照 $15.86/月 |
| **A 人声分离的 AI** | **Replicate `cjwbw/demucs`**（htdemucs，4 stems，T4，webhook）→ **$0.014 / 3 分钟歌**（$0.00467/分钟）；90 分钟订阅 COGS **$0.42** |
| **B AI 头像的 AI** | **fal `flux-pulid` $0.0333/MP + Replicate `cdingram/face-swap` $0.013** → **$0.050/张**；40/60/100 张 = **$2.01 / $3.02 / $5.03** |
| **定价** | A：$5/月 90 分钟、$9/月 200 分钟、$5/60 分钟按量、**$39/年**；B：$35/40 张、$45/60 张、$75/100 张（对齐 aragon） |
| **单站固定成本** | A≈$7.93/月、B≈$7.93/月（各摊一半共享项）；两站合计 **$15.86/月** 起 |
| **毛利（扣 AI + 支付，未扣广告/人力）** | A 约 **78%**（低客单被 Waffo $0.50/笔固定费吃掉一部分）；B 约 **88.7%** |
| **启动现金** | 域名 $22.34 + Render 首月 $14 + AI 测试预算 ~$60 ≈ **<$100** |
| **最大风险** | B 的人脸一致性/退款 + 换脸合规 + 商用 license；A 的 Replicate 产物 1 小时删除 + 版权/DMCA；两站的 Waffo 低客单固定费 |

**一句话**：这条技术路线不需要自建 GPU、不需要队列服务、不需要复杂账号体系；两站共用 60% 代码，**2 周内可并行上线 MVP**，单站固定成本 $8/月量级，AI 成本占售价 5–22%。

---

## 1. 共享技术栈（严格按 site-eng-stack）

| 层 | 选型 | 说明 |
|---|---|---|
| 框架 | Next.js **16.x** App Router + TypeScript | 16 的 `middleware.ts` → `proxy.ts`；本地 Turbopack，Windows 构建用 `next build --webpack` |
| 样式 | Tailwind v4 | 不自己设计，套模板改配色（site-build 原则） |
| DB | Prisma 6 + Neon Postgres（**pooler** 连接串） | 两站各 1 个 Neon 项目（数据隔离、免费额度按项目算：1GB / 100 CU-hrs/月） |
| 本地开发 | 第二 schema `schema.sqlite.prisma` | 双 schema 切换（site-eng-stack 第 2 节） |
| 文件 | **Cloudflare R2**，浏览器预签名直传/直下 | egress 免费；音频/头像产物 30 天生命周期；不经过 Next 进程 |
| 异步任务 | **零队列**：`task` 表 + provider webhook + 轮询兜底 | MVP 不加 Queues/QStash；失败重试 + 超时告警 |
| 支付 | 现有 **Waffo** 商户（MoR） | 官网价 3.9% + $0.50/笔；实际合同费率待商户后台核实 |
| 邮件 | Resend HTTP API | 免费 3,000 封/月（100 封/天）；2000 单/月时升 Pro $20 |
| 认证 | 订单 access token + 邮箱 magic link（订阅用） | 不做密码/第三方登录，降低摩擦 |
| 防滥用 | Turnstile 免费 + CF 限流 1 条（`POST /api/jobs`）+ 应用层额度 | 试用包/订阅额度硬限制，**无免费处理额度** |
| 部署 | **Cloudflare Workers**（OpenNext，$5/账号） | 两站两个 Worker；按 site-eng-deploy 2.3 修 4 处；上线先验 `/api/version` |
| 监控 | `/api/version` + 服务端成本日志（每 job 记录 provider 费用）+ 飞书日报（复用 site-eng-monitor 三件套） | 先记成本，再谈优化 |

### 1.1 单仓结构（npm workspaces）

```
D:\ai-workspace\paid-tools\
  apps/
    voice/          # Next app A：首页 + 子页 + /api/jobs + /api/webhook/*
    headshot/       # Next app B：首页 + 职业子页 + /api/orders + /api/webhook/*
  packages/
    core/           # r2.ts, jobs.ts, provider.ts, waffo.ts, email.ts, auth.ts, analytics.ts
    ui/             # 按钮/卡片/进度/定价表/FAQ 组件
  docs/             # 本文件、API 契约、环境变量清单
  prisma/           # 两套 schema（voice / headshot）或共享基础表 + site 字段
```

两站独立 SEO/品牌/路由，但共享：R2 预签名、任务状态机、provider 客户端、Waffo 签名与幂等、邮件、限流、埋点。**Render 两个 Web Service 的 Root Directory 分别填 `apps/voice`、`apps/headshot`。**

---

### 1.2 模型归属（谁家的）

> 我们**不训练模型**，只调用「原创模型 + 托管/封装平台」；所以下面分「模型原创方」和「我们调的 endpoint」。

| 我们调的 endpoint | 模型原创方 | 托管/封装方 | 商用授权 | 备注 |
|---|---|---|---|---|
| Replicate `cjwbw/demucs`（`htdemucs`） | **Meta AI / Facebook Research**（Demucs，MIT） | Replicate 社区作者 **cjwbw** 的 Cog 封装 | MIT，可商用 | 上游仓库 2025-01 已归档，模型仍稳定可用 |
| Replicate `lucataco/mvsep-mdx23` | **MVSEP / MDX'23 社区方案**（Music Demixing Challenge） | Replicate 社区作者 **lucataco** | 按模型页 | 质量档，$0.16/首 |
| Replicate `ryan5453/demucs` | **Meta AI**（Demucs） | Replicate 社区作者 **ryan5453** | MIT | 降本备选，$0.0066/次 |
| fal `fal-ai/flux-pulid` | 底座 **FLUX：Black Forest Labs（德国）**；身份保持 **PuLID：ByteDance（字节跳动，NeurIPS 2024，Apache-2.0）** | **fal** 打包托管 | FLUX 商用 + PuLID Apache-2.0；fal 页标 Commercial use | 头像主生成模型 |
| Replicate `cdingram/face-swap` | 社区作者 **cdingram**（个人开发者）封装的换脸方案 | Replicate | 页面标 **Commercial use permitted** | 底层换脸库 license 需上线前再核验（P2 风险） |
| Replicate/fal `black-forest-labs/flux-kontext-pro` | **Black Forest Labs** | Replicate / fal | 商用 | 背景/服装编辑备用 |
| MediaPipe（人脸检测/质量门） | **Google** | 自建（pip 包） | Apache 2.0 | 不用 InsightFace |
| DeepSeek（写代码/文案/SEO） | **DeepSeek（中国）** | 官方 API | 按官方 ToS | 不参与产品生成 |

**平台方（不是模型作者）**：Replicate（模型托管，按秒计费）、fal（生成媒体平台）、Render（Web 托管）、Cloudflare（DNS/R2）、Neon（Postgres）、Waffo（MoR 支付）。
**明确排除**：InstantID / IP-Adapter FaceID（insightface 权重仅非商用）、CodeFormer（Replicate 明示禁商用）、自托管 FLUX dev 权重（需 BFL 商用许可）。

---

## 2. 产品 A：人声/伴奏分离站

### 2.1 推荐方案 A1（MVP）：Replicate cjwbw/demucs + R2

```
浏览器 ──① 选文件/时长≤10min/≤100MB → R2 presigned PUT（in/ 前缀）
      ──② POST /api/jobs → 创建 task（queued）→ 调 Replicate prediction（webhook）
      ──③ Replicate T4 跑 htdemucs（3 分钟歌 ~63s）→ webhook 回调
      ──④ 立即下载 4 个 stems → 转存 R2 out/{jobId}/（官方 1 小时后删除！）
      ──⑤ 前端轮询 / SSE → 下载页（presigned GET，24h 有效）
      ──⑥ R2 生命周期 24–48h 删除 in/out；付费用户可“长期保存”作为增值
```

- 模型：`cjwbw/demucs`，默认 4 stems（vocals/bass/drums/other），可选 6 stems（htdemucs_6s）；输出 mp3 320 / wav / flac。
- 质量档（可选）：`lucataco/mvsep-mdx23`（$0.16/首，MDX'23 第 3）做“高质量档”，与 Demucs 标准档双档定价。
- 降本备选：`ryan5453/demucs`（$0.0066/次，约半价；先 A/B 质量）。
- 成本：**$0.014 / 3 分钟**（T4 63s × $0.000225/s）；折 **$0.00467/分钟**。
- 延迟：60–90 秒/3 分钟歌（含冷启动），UI 必须异步 + 邮件通知。
- 上限：Replicate 输入 ≤100MB；应用层限 10 分钟/200MB；超出提示“分轨上传/联系”。
- 商用：Demucs 上游 **MIT**；平台 ToS 允许商用；用户上传内容版权由上传者负责（声明 + DMCA 通道）。

### 2.2 为什么不是 fal / LALAL / 自托管（MVP 阶段）

| 方案 | 3 分钟成本 | 结论 |
|---|---|---|
| **Replicate cjwbw/demucs** | **$0.014** | ✅ MVP |
| Replicate ryan5453/demucs | $0.0066 | 备选降本，质量先 A/B |
| fal-ai/demucs | $0.126（按音频秒 $0.0007/s） | ❌ 贵 9 倍；且计费单位口径待实单验证 |
| fal mureka stem | $0.20/首（默认档） | ❌ 贵 14 倍 |
| LALAL.AI API（Top-up） | $0.20/首（$0.0667/min） | ❌ 贵 14 倍，适合做“高质量专业档” |
| Music.ai 4-stem | $0.21/首（$0.07/min） | ❌ 同上 |
| 自托管 RunPod 4090 | $0.0059/首（7.5×实时，$0.00198/min） | ⏳ >2000–3000 分钟/月再切；常驻/冷启动/运维另算 |

### 2.3 定价与毛利

| 套餐 | 价格 | AI COGS（满额） | Waffo 费 | 贡献毛利 | 毛利率 |
|---|---|---|---|---|---|
| Trial Pack 15 分钟（一次性） | **$2.90** | $0.07 | $0.613 | $2.217 | **76.4%** |
| Starter 90 分钟/月 | **$5/月** | $0.42 | $0.695 | $3.885 | **77.7%** |
| Pro 200 分钟/月 | **$9/月** | $0.93 | $0.851 | $7.219 | **80.2%** |
| 按量包 60 分钟 | **$5** | $0.28 | $0.695 | $4.025 | 80.5% |
| **年付 90 分钟/月** | **$39/年** | $5.04/年 | $2.02 | $31.94 | **81.9%** |

> 关键：**不提供免费额度**；入口是 $2.90/15 分钟 Trial Pack（一次性付费）。低客单被 Waffo 的 $0.50/笔固定费吃掉 10–14%，年付 $39 折 $3.25/月，适合做留存；年费按访谈「5 个月月费」口径应在真实 CAC/留存数据后复核（$5×5=$25–29，不排除后续调整）。

### 2.4 流量与用量成本

| 场景 | API 成本 | R2 存储 | 说明 |
|---|---|---|---|
| 100 分钟/月 | $0.47 | $0（免额） | Trial Pack/小流量 |
| 1,000 分钟/月 | $4.67 | $0.03–0.48 | 约 333 首 |
| 5,000 分钟/月 | $23.33 | $0.75–3.03 | 约 1,667 首 |
| 无免费额度 | $0 | $0 | **不提供免费处理**；Trial 15min/单 = $0.07/单 |

---

## 3. 产品 B：AI 职业头像站

### 3.1 推荐 pipeline A1（$0.050/张）

```
① 人脸质量门（自建，MediaPipe/face-api；禁用 InsightFace 权重）
   单人脸 / 人脸占比≥15% / 清晰度≥100 / yaw·pitch·roll≤±30° / 短边≥512px / 无遮挡 / 曝光正常
   → 不合格前端直接拦截（不烧算力，降低退款）
② 上传 3–8 张（建议 5 张：正脸+左右15°+微笑+不同光照）→ R2
③ 支付（$35/40 / $45/60 / $75/100）→ 创建 order + 生成任务
④ fal-ai/flux-pulid 生成（$0.0333/MP，1024²≈1MP，单张 ~4.25s）
⑤ Replicate cdingram/face-swap 融合（$0.013/run，页面明示可商用）
⑥ 内置 safety checker（fal/Replicate）
⑦ 输出立刻转存 R2（Replicate 1 小时删除）→ zip + 邮件通知
⑧ 交付页：预览 + 逐张下载 + 一键 ZIP；48 小时内 1 次免费重做
```

- 每张 **$0.050**（含 1.1 重生成 + 1.05 重试系数）；每单 40/60/100 张 = **$2.01 / $3.02 / $5.03**。
- 生成时间（并发 10）：40 张 **≈2.0 分钟**、60 张 **≈2.6 分钟**、100 张 **≈3.9 分钟**；并发 3 则 ×3。
- 交付分辨率 1024²；2048² 只在 $75/100 张档用 Topaz 放大（+$0.08/张，COGS 14.9% 贴红线），或后续自托管 Real-ESRGAN。

### 3.2 License 红线（P0，必须遵守）

| 方案 | 商用 | 结论 |
|---|---|---|
| fal `flux-pulid` | ✅ Commercial use | ✅ MVP 生成 |
| Replicate `cdingram/face-swap` | ✅ Commercial use permitted | ✅ MVP 融合 |
| Black Forest Labs FLUX Kontext Pro (Replicate/fal) | ✅ 输出可商用 | ✅ 主备切换/编辑 |
| InstantID / zsxkib/instant-id | ❌ insightface 权重仅非商用 | ❌ 排除 |
| IP-Adapter FaceID（Replicate/fal） | ❌ research only | ❌ 排除 |
| CodeFormer（Replicate） | ❌ cannot be used commercially | ❌ 排除 |
| GFPGAN | License 页未明示 | ⚠️ 需核实，不作为默认 |
| MediaPipe（人脸检测/对齐） | Apache 2.0 | ✅ 自建质量门 |

> 结论：MVP 只能走 **fal flux-pulid + Replicate face-swap** 这条商用最干净的线；自研人脸检测用 MediaPipe，不碰 insightface。

### 3.3 定价与毛利

| 套餐 | 价格 | AI COGS | Waffo 费 | 贡献毛利 | 毛利率（扣 AI+支付） |
|---|---|---|---|---|---|
| 40 张 | **$35** | $2.01 | $1.865 | $31.13 | **88.9%** |
| 60 张 | **$45** | $3.02 | $2.255 | $39.73 | **88.3%** |
| 100 张 | **$75** | $5.03 | $3.425 | $66.55 | **88.7%** |

- 退款准备金：按 **8–12%** 预留（人脸不像本人是主因）；重做 1 次成本约 $2–5，可承受。
- **CAC 是生死线**：单均毛利约 $40，若投流 CAC >$20 基本不赚钱。**优先做 SEO/长尾（职业/团队页）+ 联盟 + B2B 团队单**，广告只做小预算验证。
- 团队/B2B：$25–29/人（10 人起），可把客单拉到 $250–$2900。

### 3.4 为什么不是自托管 / 专用 API（MVP 阶段）

| 方案 | 40 张成本 | 结论 |
|---|---|---|
| **A1（fal PuLID + Replicate face-swap）** | **$2.01** | ✅ MVP，商用条款最干净 |
| A0（Replicate bytedance/pulid + GFPGAN） | $0.98 | ⚠️ 便宜但写实度弱、License 未明示 |
| A-native（fal headshot-photo + face-enhance） | $3.44 | ⚠️ 工程最省，风格/一致性弱 |
| A2（A1 + Topaz 2048²） | $5.21 | ❌ COGS 14.9% 贴红线，只在 100 张档 |
| 自托管 RunPod 4090 | $0.073 | ⏳ 常驻地板 $650/月，约 323 单/月才回本；且 FLUX dev 权重自跑不可商用 |

---

## 4. 成本总表

### 4.1 固定月成本（0 单）

| 项 | Render 方案（推荐） | CF Workers 方案（规模化备选） |
|---|---|---|
| 两站托管 | 2×$7 = $14 | $5/账号 |
| 域名（2 个 .com，CF Registrar $11.17/年） | $1.86 | $1.86 |
| Neon | $0（Free：1GB/项目、100 CU-hrs/月） | $0 |
| R2 | $0（10GB 免额） | $0 |
| Resend | $0（3,000 封/月） | $0 |
| Turnstile / 限流 | $0 | $0 |
| **合计** | **$15.86/月** | **$6.86/月** |
| 兼容改造 | 0 处 | 4 处（PPR/Prisma HTTP/无事务/Linux 构建） |

> 选 Render：**每月只贵 $9，但省掉 site-eng-deploy 里 4 处实测炸过的坑**。站数到 3 个再迁 CF。

### 4.2 单笔变动成本

| 产品 | 单笔 AI 成本 | 单笔支付费（Waffo 3.9%+$0.50） | 单笔总变动 |
|---|---|---|---|
| A：90 分钟订阅 | $0.42 | $0.695 | **$1.115** |
| A：200 分钟订阅 | $0.93 | $0.851 | **$1.781** |
| A：按量 60 分钟 | $0.28 | $0.695 | **$0.975** |
| B：40 张 | $2.01 | $1.865 | **$3.875** |
| B：60 张 | $3.02 | $2.255 | **$5.275** |
| B：100 张 | $5.03 | $3.425 | **$8.455** |

### 4.3 规模场景（A=订阅数，B=订单数；A 均 $6/单、B 均 $46/单）

| 月单量（A+B 各 N） | 收入 | AI 成本 | Waffo 费 | 固定+邮件+R2 | 贡献毛利 | 毛利率 |
|---|---|---|---|---|---|---|
| N=100 | $5,200 | $345 | $303 | $15.86 | **$4,536** | **87.2%** |
| N=500 | $26,000 | $1,725 | $1,514 | $15.86 | **$22,745** | **87.5%** |
| N=2,000 | $104,000 | $6,900 | $6,056 | $37 | **$91,007** | **87.5%** |

> 以上未扣广告/人力/退款；B 的退款按 8–12% 另计，A 的支付费按低客单实际比例已计入。

### 4.4 启动现金（到第一次收费）

| 项 | 金额 |
|---|---|
| 2 个域名（首年） | $22.34 |
| Render 首月（2 服务） | $14 |
| AI 测试额度（A 500 分钟 + B 20 单测试） | ≈$60 |
| Neon/R2/Resend/Turnstile | $0 |
| **合计** | **≈$96** |

---

## 5. 并行动工计划（用 Agent Teams）

### 5.1 仓库与写作用域（互不重叠）

| 任务 | Owner | 写作用域 | 交付 |
|---|---|---|---|
| 共享底座 | platform-builder | `paid-tools/packages/core`、`packages/ui` | R2 预签名、task 状态机、provider 客户端、Waffo webhook、邮件、限流、埋点 |
| A 站 | voice-builder | `paid-tools/apps/voice` | 上传/任务/下载/定价/付费 Trial/SEO 子页 |
| B 站 | headshot-builder | `paid-tools/apps/headshot` | 人脸质量门/订单/生成/交付/退款/SEO 子页 |
| 集成与验收 | Lead | `paid-tools/docs`、根配置、部署 | 骨架、环境变量、E2E、部署、GSC、成本日志 |

### 5.2 两周节奏

| 天 | 里程碑 |
|---|---|
| D1 | 建 monorepo、共享 core 骨架、两个 Next app、CI/build 通过 |
| D2–3 | R2 预签名、task 表、Replicate/fal 客户端、webhook 验签（两站共用） |
| D2–5 | A 站：上传→分离→下载全链路跑通（$2.90 Trial Pack 付费流程） |
| D3–7 | B 站：人脸质量门→40 张生成→face-swap→zip 交付跑通（内部测试单） |
| D5–7 | Waffo checkout + webhook + 额度扣减/开通；两站 E2E 真支付测试 |
| D8–10 | 定价页/年付/退款政策/隐私条款；A/B 长尾页面 + i18n + sitemap/hreflang |
| D11–12 | 压测并发/成本日志/错误告警；Cloudflare Workers 部署 + `/api/version` |
| D13–14 | GSC 验证 + sitemap 提交 + 假门页/小预算投放；开始收录 |

### 5.3 验收（每站）

- [ ] `npm run build` 0 error、`npx tsc --noEmit` 通过
- [ ] 真实上传→生成→下载闭环（非 mock）
- [ ] Waffo 测试支付→webhook→额度生效→退款路径
- [ ] `/api/version` 返回 commit；`/api/cost`（或日志）能查每单 AI 成本
- [ ] 首页唯一 H1、canonical、hreflang 三语、sitemap 条数 = 路由 × 语言
- [ ] Turnstile + IP 限流 + 试用包/订阅额度防刷（**无免费额度**）
- [ ] 隐私政策/服务条款/DMCA/退款页齐全
- [ ] 30 天 R2 生命周期；Replicate 产物转存成功（1 小时删除兜底）

---

## 6. 风险与待确认

| 优先级 | 风险 | 应对 |
|---|---|---|
| P0 | B 站人脸 license（InsightFace 系非商用） | 只用 fal flux-pulid + Replicate face-swap；检测用 MediaPipe；上线前再核一次页面条款 |
| P0 | 人脸/肖像合规（同意、删除、未成年人、公众人物） | 上传声明 + 禁止清单 + 30 天删除 + 人工举报通道；不做名人/换脸色情 |
| P0 | A 站版权/DMCA | 上传声明 + 举报下架 + 黑名单；不做“整专辑批量”营销 |
| P0 | Replicate 产物 1 小时删除 | webhook 立刻转存 + 重试 + 兜底轮询 + 失败告警 |
| P1 | Waffo 低客单固定费 | 主推年付/团队单；A 站月付只做入口 |
| P1 | 退款率（B 站人脸不像） | 质量门 + 1 次免费重做 + 8–12% 准备金 |
| P1 | 并发/延迟（fal 并发未公开） | 任务表 + 并发闸门（B 站 10 并发）+ 排队进度；压测后调 |
| P1 | SEO 见效 3–6 个月 | A/B 长尾页先上；假门页验证；不押注广告 |
| P2 | Waffo 实际合同费率未核实 | 上线前商户后台确认；按官网价做上限模型 |
| P2 | 价格变动 | 每月复核 provider 价格页；成本日志按 job 记录 |

**需要你确认/提供的**（不阻塞写代码，但阻塞上线）：
1. 两个域名（建议 A：`vocalremover.xxx` 类；B：`headshot.xxx` 类；不要买别人商标）；
2. Waffo 商户里新建 4–6 个产品（A 月付/年付/按量；B 40/60/100 张），拿 product ID；
3. R2 bucket + Resend 发件域 + Neon 两个项目；
4. 是否接受 **Render 两服务 $14/月**（而不是先上 CF Workers）。

---

## 7. 研究来源（全部 2026-11-11 实抓）

- 人声：[voice/tech-options.md](D:/ai-workspace/site-selection/2026-11-10-paid/research/voice/tech-options.md)、[voice/cost-model.json](D:/ai-workspace/site-selection/2026-11-10-paid/research/voice/cost-model.json)
- 头像：[headshot/tech-options.md](D:/ai-workspace/site-selection/2026-11-10-paid/research/headshot/tech-options.md)、[headshot/cost-model.json](D:/ai-workspace/site-selection/2026-11-10-paid/research/headshot/cost-model.json)
- 基础设施：[platform/stack-options.md](D:/ai-workspace/site-selection/2026-11-10-paid/research/platform/stack-options.md)、[platform/cost-model.json](D:/ai-workspace/site-selection/2026-11-10-paid/research/platform/cost-model.json)
- 竞品/定价：[unit-econ/pricing-map.md](D:/ai-workspace/site-selection/2026-11-10-paid/research/unit-econ/pricing-map.md)、[unit-econ/margin-model.md](D:/ai-workspace/site-selection/2026-11-10-paid/research/unit-econ/margin-model.md)
- 截图证据：`D:/ai-workspace/site-selection/2026-11-10-paid/research/evidence/`（60+ 张）
