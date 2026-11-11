# 站点建设审计：对照 skill + 访谈（2026-11-11）

> 审计对象：`D:\ai-workspace\paid-tools` 两站（A 人声分离 / B AI 头像）
> 审计人：Lead
> 来源：
> 1. 六个访谈派生核心 skill：`site-strategy` / `site-demand` / `site-build` / `site-growth` / `site-ops-monetize` / `site-portfolio`
> 2. `site-risk-compliance`、`site-eng-stack` / `deploy` / `accounts`
> 3. 41 篇公众号提炼 `wx-knit/batch2/EXTRACT.md`、`wx-knit/batch2/07-AI 工具站的订阅费…`、`29-20条血泪经验`、`25-工具网站流程`、`02-流量差要不要坚持`、`11-第一美元`
> 4. `contract-site/docs/interview-3-5-calibration-2026-11-10.md`（第三/第五篇校准）
>
> **关于「归档的那 6 篇访谈」**：我在工作区里没有找到单独命名的 6 份访谈转录文件（全盘搜 `*访谈*` 只找到 `interview-3-5-calibration`）。目前可用的访谈材料是上面 6 个访谈派生 skill + 41 篇提炼 + 第三/第五篇校准。如果这 6 篇在别的目录/格式（PDF/录音转写），告诉我路径，我再逐字对一遍。

---

## 0. 结论（先看）

**总评：工程骨架和页面质量达标，但「按访谈做生意」的环节有 3 个硬缺口；免费试用、B 主词已修，剩假门页验证。**

| 级别 | 问题 | 状态 |
|---|---|---|
| **P0** | ~~两站都在提供免费试用/免费预览~~ | ✅ **已修（2026-11-11 11:15）**：A 改 $2.90/15min Trial Pack、B 改 $9/5 张 Sample Pack；生产 API 402；页面无免费承诺（只剩对比/否定表述） |
| **P0** | **B 站主词 18,100 < 访谈硬门槛 2 万/月**；A 站 60,500 过线 | ✅ **已修（2026-11-11 12:40）**：B 首页主词 `professional headshots` **22,200/KD50**；`ai headshot generator` 18,100/KD41 降为 `/ai-headshot-generator` 子页（1730 词） |
| **P0** | **跳过「假门页 48 小时 <20 邮箱」验证**，直接建了完整站 | 上线前补预售/付费用例验证 |
| P1 | E-E-A-T 的 Experience / Authority 两段不足；内容 100% AI 生成 | ✅ 页面层已补（两站 /about、/contact、/authors、Last updated、作者署名；A 7 工具页补系统自带方法；B 补影棚/自拍/AI 对比） | 真实 before/after 样本、实测参数待 AI key 后补；不伪造 |
| P1 | 只有 en，没有 zh/es 三语（site-eng-stack 要求） | 上线后按语言逐页补，不要机翻堆词 |
| P1 | GSC / 统计 / Bing / 上线当天 5 步未做 | 付款+部署后执行 |
| P1 | 外链 SOP 未启动（每天 1–2 小时/20 条） | 上线即开始，按 site-growth |
| P2 | 年费 $39 相当于 7.8 个月月费，偏离访谈「年费=5 个月月费」 | 用真实 CAC/留存校准后再定 |
| P2 | 法律页是 demo 文案；隐私页提到 analytics 但尚未接入 | 上线前法务过一遍、删不一致句 |

**一句话**：代码和 SEO 骨架可以打 8 分；但「需求验证、付费墙、E-E-A-T、分发」这四件事还没按访谈做完，现在上线只能算「能打开的站」，不是「能卖的站」。

---

## 0.5 复核记录（2026-11-11 13:10，改造后）

| 项 | 结果 |
|---|---|
| 构建 | `npm run build:voice` 0 error；`npm run build:headshot` 0 error；`npm run typecheck` 0 error |
| 路由 | A 19/19、B 19/19（含 api/version/sitemap/robots）生产 200 |
| 免费处理 | A `POST /api/jobs` → **402**；B `POST /api/orders` → **402**；`ALLOW_MOCK=1` 保留 mock |
| 免费文案 | A 0 命中；B 0 命中（`free preview|free trial|free plan|free 3-minute` 全站渲染 HTML 正则） |
| 定价 | A Trial $2.90/15min、$5/90min、$9/200min、$39/yr；B Sample $9/5、$35/40、$45/60、$75/100；JSON-LD `isAccessibleForFree:false` |
| B 主词 | 首页 title/H1/OG/JSON-LD 以 `professional headshots` 为主；`/ai-headshot-generator` 18,100/KD41 子页 200 |
| E-E-A-T 页 | A `/about`、`/contact`、`/authors/stemsplit-audio-team`；B `/about`、`/contact`、`/authors/portraitlab-editorial` 均 200 |
| sitemap | A 16 URL、B 16 URL，均 200；robots 含 sitemap、无 host |
| 剩余 P0 | 假门页/预售价验证未做（见 §0/§3） |

---

## 1. 逐条对照（20 条关键规则）

### A. 选品 / 需求（site-demand / site-portfolio / site-strategy）

| # | 规则（来源） | 现状 / 证据 | 判定 | 修复 |
|---|---|---|---|---|
| 1 | 值得做 = 有人用 × 着急 × 愿付 ÷ 竞争（site-demand） | `FINAL-TOP3` 有量/KD/付费分析；缺「谁、什么场景、多着急、愿付多少」一句话 | ⚠️ | 上线前每个站写一句 ICP + 场景 + 价格锚点 |
| 2 | 主关键词 ≥ 2 万/月（第五篇访谈，硬条件） | A `vocal remover` 60,500 ✅；B 首页主词改 `professional headshots` **22,200/KD50**（2026-11-11 Semrush 复查），`ai headshot generator` 18,100/KD41 降为子页 | ✅（改造中） | task-17 上线后复核 title/H1 |
| 3 | KD 不是硬条件，看对手承接页与规模（Step 20） | A：lalal 2M、SERP 全是小站、无 AIO；B：Magic Studio/Canva/Adobe 在列、AIO 推 Magic Studio | ⚠️ A 优 / B 中 | A 可打；B 切 B2B/行业长尾，不正面打通用词 |
| 4 | 假门页 48 小时 <20 邮箱 = 换需求（site-demand） | **未做**，直接建站 | ❌ | 上线前跑 3 天预售价/early access，目标 ≥20 留资或 ≥3 付费 |
| 5 | 期望值按 25% 成功 / 3-of-4 失败（site-strategy） | 文档未写组合期望；单站投入按 2 周算 | ⚠️ | 写清「4 个站活 1 个」的预算与止损线 |
| 6 | 一页一个核心词、首页=支柱页（site-build） | 每页 H1 唯一；sitemap 13/12 URL；首页主词明确 | ✅ | 保持 |
| 7 | 不做免费试用 / 大胆收费（用户 + 访谈 29 条 #6） | ✅ **已改**：A $2.90/15min Trial Pack + $5/90min + $9/200min + $39/yr；B $9/5 张 Sample Pack + $35/40 + $45/60 + $75/100；生产 `POST /api/jobs`、`/api/orders` 均返回 **402 payment_required**；页面 free 匹配只剩「没有免费」的否定/对比表述 | ✅ | 支付接通后把 402 换成 checkout；免费重做/退款保留 |

### B. 建站 / 内容（site-build / site-risk-compliance）

| # | 规则（来源） | 现状 / 证据 | 判定 | 修复 |
|---|---|---|---|---|
| 8 | 工具首屏直接可用、表单 ≤2 步（site-build §19） | 两站表单都在 hero；A 单文件，B 多图+风格+套餐 3 项 | ✅ | 保持 |
| 9 | 工具页 8 模块：H1 / 工具 / 3 步 / 对比表 / 系统方法 / FAQ / 内链 / 页脚 | 有 H1/工具/步骤/对比/FAQ/内链/页脚；**「系统自带方法」段落缺失或不完整** | ⚠️ | 每个工具页补一段「Windows/Mac/手机自带方法」 |
| 10 | 内容 ≥800 字、无批量空页（site-build） | A 首页 1,578 字；工具页 1,357–1,643；B 869–1,872 | ✅ | 保持；每页加独占信息 |
| 11 | E-E-A-T：Experience / Expertise / Authority / Trust（site-build §20） | A：✅ 已补 `/about`、`/contact`、`/authors/stemsplit-audio-team`、7 工具页系统自带方法段、作者署名、Last updated；B：⏳ task-19 进行中（/about、/contact、/authors、更新日期） | ⚠️ 部分完成 | 真实 A/B 样本待有 API key 后补；不伪造数据 |
| 12 | AI 二次创作，不批量生成；不造数据（site-build §22） | 页面由 AI 生成；未发现假评论/假评分；有「trained on thousands of songs」这类不可验证表述 | ⚠️ | 删/软化为可验证表述；补真实测试数据 |
| 13 | 三语 en/zh/es + hreflang（site-eng-stack） | 只有 en；hreflang 仅 en/x-default | ❌ | 上线后按页补 zh/es，先补首页+pricing+3 工具页 || 14 | 技术 SEO：canonical/hreflang/sitemap/robots/JSON-LD（site-build §25） | 全部有；sitemap/robots 200；JSON-LD 覆盖 | ✅ | 域名上线后验 www→apex 301、尾斜杠 |
| 15 | URL 上线后不改、内容小批量改（访谈第三/第五篇） | 尚未上线，无历史 URL；改文案按 2–3 批 | ✅（预上线） | 上线后锁 URL，改内容分批 |
| 16 | 法律/合规：privacy/terms/refund/DMCA/版权（site-risk-compliance） | A 有 privacy/terms/refund + DMCA 条款；B 有 privacy/terms/refund；**B 缺独立 DMCA/版权投诉说明** | ⚠️ | B 补 DMCA/肖像权/上传者声明；法务过一遍 |
| 17 | 隐私与数据：音频/人脸数据、第三方 provider、删除（自定 + GDPR/CCPA） | A privacy 提到音频与第三方；B privacy 提到人脸；**都未写「不训练/30 天删除」的硬承诺与入口** | ⚠️ | 补数据保留期、删除入口、provider 列表、不训练声明 |
| 18 | 站群隔离：不互链、统计/模板/账号隔离（site-risk-compliance） | 两站无互链；视觉模板不同；**同一 Cloudflare 账号/同一 Neon 账号**（账号级隔离暂未做） | ⚠️ | 不互链保持；统计代码分开；以后多站再分账号 |

### C. 变现 / 分发（site-ops-monetize / site-growth）

| # | 规则（来源） | 现状 / 证据 | 判定 | 修复 |
|---|---|---|---|---|
| 19 | 定价覆盖 CAC：月费 ≥ 获客成本 ÷ 付费率 ÷ 付费月数（batch2 07） | A $5/月、B $35/单；**没有真实 CAC/付费率/留存数据**；A 年费 $39≈7.8 个月，偏离「5 个月月费」口径 | ⚠️ | 上线后 2 周拿真实数据重算；A 年费可改 $25–29 |
| 20 | 0–1 万 PV 不挂广告；先做产品闭环（site-ops-monetize） | 未接广告；先跑订阅/一次性付费 | ✅ | 保持 |
| 21 | 外链：每天 1–2 小时、20 条；先免费后付费（site-growth） | **未启动** | ❌ | 上线当天开始，按 site-growth §20 清单 |
| 22 | GSC 上线当天 5 步：验证/提交 sitemap/URL 检查/Bing/统计（runbook Step 18） | 全部未做（无域名/未部署） | ❌ | 付款+部署当天执行 |
| 23 | 免费分发：目录/社区/Product Hunt/Reddit（site-distribution） | 未做 | ❌ | 上线后按 24 渠道清单先做 5 个 |

---

## 2. 这次已经做对的部分（可以保留）

- ✅ 技术栈严格按 `site-eng-stack`：Next 16 App Router + TS + Tailwind v4 + Prisma 6 + Neon + R2 + Resend + Cloudflare Workers 配置。
- ✅ 两站 build/typecheck 0 error；31 个页面/端点生产 200；mock 上传→任务→下载闭环。
- ✅ 页面结构：一页一词、H1 唯一、800+ 字、工具首屏、对比表、FAQ、内链回首页、sitemap/robots/canonical/hreflang/JSON-LD。
- ✅ 定价有依据（4 个竞品实抓价），不是拍脑袋；A 有年付入口。
- ✅ 法律页/退款页/隐私页先有草稿（比没有强），并标注 demo 需法务审。
- ✅ 两站视觉区分（深紫 vs 暖色），不是同一套模板；无互链。

---

## 3. 上线前必须补的 8 件事（按顺序）

1. ~~**免费试用 → 付费试用包**~~ ✅ **已完成（2026-11-11 11:15）**：A $2.90/15min，B $9/5 张；生产 API 402；页面无免费承诺。下一步接 Waffo checkout 把 402 换成真实付款。
2. **B 站主词决策**：接受 18.1K 为付费实验（不硬拼通用词，切行业/团队长尾），或换一个 ≥2 万的主词。
3. **假门页/预售价验证**：3 天，目标 ≥20 留资或 ≥3 付费；不达标先别公开上线。
4. **E-E-A-T 素材**：每站 3–5 个真实样本、实测参数/耗时/成本、作者页、Updated 日期、官方社媒。
5. **三语**：至少 en + zh，es 后补；hreflang/sitemap 同步。
6. **支付闭环**：Waffo 产品 ID、checkout、webhook 幂等、额度扣减、退款/重做；生产 API 402 直到付款成功。
7. **上线当天 5 步 + 外链**：GSC 验证/提交/URL 检查/Bing/统计；每天 1–2 小时外链。
8. **法务/隐私**：补 B 站 DMCA/肖像权；补数据保留期/删除入口/不训练声明；法务审 terms/privacy/refund。

---

## 4. 与 6 个访谈派生 skill 的逐项映射（简表）

| 访谈主题 | 对应 skill | 本站落地 | 缺口 |
|---|---|---|---|
| 单站万刀三条路 / 站群矩阵 | site-strategy | 两站是矩阵第一步；按 25% 成功率预期 | 未写组合预算/止损 |
| 需求验证公式 / 假门页 | site-demand | 选品有量/KD/付费证据 | 假门页未做；ICP 一句话未写 |
| 半天建站流水线 / 页面模板 / E-E-A-T | site-build | 模板/结构/SEO 已落地 | E-E-A-T 两段、系统方法段 |
| 外链不能自动化 / 免费渠道 | site-growth | 未启动 | 全部 |
| 变现阶梯 / 6 种方式 / 不早挂广告 | site-ops-monetize | 订阅+一次性付费，无广告 | 未算真实 CAC/留存 |
| 站群管理 / 五个不能照抄的坑 | site-portfolio | 两站独立、不互链 | 缺域名台账/SOP/复盘节奏 |

---

## 5. 结论

- **能上线吗？** 工程上能；**生意上还不能**——免费墙、假门页、E-E-A-T、GSC/外链四件事没做完。
- **先做什么？** ~~免费试用改付费~~（已完成）→ B 主词决策 → 假门页验证 → 支付闭环 → 上线 + GSC/外链。
- **6 篇访谈**：如果指的是另外 6 份归档转录，请给路径；当前审计用的是 6 个访谈派生 skill + 41 篇提炼 + 批2 的定价/血泪/工具站流程原文。
