# 两站页面地图与内容规格（v1，2026-11-11）

> 依据 `site-build` / `site-demand`：**一页一个核心词（H1）**，次要词放 H2；首页=支柱页；子页=长尾工具/场景页；每页 800+ 字真实内容；内链全部回首页/支柱页。
> URL 结构：`/[lang]/...`（en 默认、zh、es 三语）；canonical 指向正式域名；hreflang 三条 + x-default；sitemap = 路由 × 语言。
> 关键词数据来源：`research/voice`、`research/headshot`（2026-11-11 Semrush 美国库）；「量待补」= 策略构建器主题词，尚无单独量/KD，上线前补。

---

## A 站：人声/伴奏分离（voice）

### A.1 首页（支柱页）

| 项 | 内容 |
|---|---|
| URL | `/`（en）/ `/zh` / `/es` |
| 核心词 | `vocal remover` — **60,500 / KD71 / CPC $0.04** |
| H1 | **Vocal Remover — Separate Vocals & Instrumental Online**（按意图重写，不照抄关键词） |
| H2 | ① How it works（3 步）② 4-stem output（vocals/bass/drums/other）③ AI vocal remover（KD26 软入口）④ Free vs Pro ⑤ Use cases（karaoke/acapella/remix/podcast）⑥ FAQ ⑦ Pricing |
| 转化 | 首屏拖拽上传 + 免费 3 分钟；上传即用，无需注册；付费墙在“下载 4-stem/超过 3 分钟/高音质” |
| 内链 | → `/ai-vocal-remover`、`/free-vocal-eliminator`、`/remove-vocals-from-song`、`/acapella-maker`、`/pricing` |
| 结构化 | WebApplication + FAQPage + BreadcrumbList；`inLanguage` 跟随语言 |

### A.2 子页（按优先顺序）

| # | URL | 核心词 | 量 / KD | H1 | 页面类型 / 说明 |
|---|---|---|---|---|---|
| 1 | `/ai-vocal-remover` | `ai vocal remover` | **6,600 / KD26** | AI Vocal Remover — Isolate Vocals with AI | 工具页；强调 AI 模型/质量对比；链首页 |
| 2 | `/free-vocal-eliminator` | `free vocal eliminator` | **2,900 / KD18** | Free Vocal Eliminator — Remove Vocals from Any Song | 免费工具页；免费额度/水印/时长限制说明；升级 CTA |
| 3 | `/vocal-remover-online` | `vocal remover online` | **2,400 / KD31** | Vocal Remover Online — No Install, No Signup | 工具页；浏览器/免安装卖点 |
| 4 | `/remove-vocals-from-song` | `remove vocals from song`（量待补，词簇内） | 待补 | How to Remove Vocals from a Song (3 Ways) | 工具+教程；嵌上传组件；FAQ |
| 5 | `/acapella-maker` | `acapella extractor`（builder 主题 23 词） | 待补 | Acapella Maker — Extract Acapella from Any Track | 工具页；对卡拉 OK/翻唱人群 |
| 6 | `/karaoke-maker` | `karaoke maker`（builder 主题） | 待补 | Karaoke Maker — Remove Vocals, Keep the Music | 工具页；输出伴奏+歌词提示（后续） |
| 7 | `/separate-stems` | `stem separation`（量待补） | 待补 | Stem Separation — 4 Stems (Vocals, Drums, Bass, Other) | 工具页；音乐制作人/Remix |
| 8 | `/remove-background-music` | `remove background music from video`（builder 主题 30 词） | 待补 | Remove Background Music from Video | 工具+教程；先做音频，视频后续 |
| 9 | `/pricing` | 品牌/方案词 | — | Pricing — Free 3 Minutes, Pro from $5/mo | 定价页；月付/年付/按量；FAQ/退款 |
| 10 | `/how-it-works` | 品牌辅助 | — | How Our AI Vocal Remover Works | 信任页；模型/隐私/版权声明 |

### A.3 内容与合规

- 每页至少：工具区（上传/示例音频）+ 800 字说明 + 3–5 个 FAQ + 相关工具内链。
- 示例音频：用自有/CC0 音乐，不碰版权曲；页脚声明「仅处理你有权使用的内容」+ DMCA/举报入口。
- 免费额度：3 分钟/首、1 次/天、2-stem、MP3 320 以下；Pro 才给 4-stem/WAV/批量/长音频。
- 多语言：en 先上线；zh/es 用同一结构翻译（不要机翻堆词），hreflang 全量。

---

## B 站：AI 职业头像（headshot）

### B.1 首页（支柱页）

| 项 | 内容 |
|---|---|
| URL | `/`（en）/ `/zh` / `/es` |
| 核心词 | `ai headshot generator` — **18,100 / KD59 / CPC $2.93** |
| H1 | **AI Headshot Generator — Professional Headshots from Your Selfies** |
| H2 | ① See examples（before/after）② How it works（上传 5 张 → 2 分钟 → 40–100 张）③ Styles（LinkedIn/Corporate/Creative/Team）④ Pricing ⑤ Why ours（重做保障/隐私）⑥ Use cases（LinkedIn/Resume/Team）⑦ FAQ |
| 转化 | 首屏「Upload selfies」+ 免费 1 张预览（收邮箱）→ 选套餐（$35/40 张起）；失败重做承诺 |
| 内链 | → `/linkedin-headshot`、`/professional-headshot`、`/team-headshots`、`/real-estate-agent-headshots`、`/pricing` |
| 结构化 | WebApplication + FAQPage + Product/Offer（套餐）+ BreadcrumbList |

### B.2 子页（按优先顺序）

| # | URL | 核心词 | 量 / KD | H1 | 页面类型 / 说明 |
|---|---|---|---|---|---|
| 1 | `/free-ai-headshot-generator` | `free ai headshot generator` | **6,600 / KD59** | Free AI Headshot Generator — 1 Free Preview | 免费钩子页；1 张免费预览换邮箱；付费解锁全部 |
| 2 | `/ai-professional-headshot` | `ai professional headshot` | 2,400 / KD74（用 `ai professional headshot generator` 1,000/KD62 做软入口） | AI Professional Headshot — Business-Ready in Minutes | 工具页；商务场景 |
| 3 | `/linkedin-headshot` | `linkedin headshot`（量待补；builder 主题 `best ai linkedin profile generator` 21 词） | 待补 | LinkedIn Headshot Generator — Stand Out to Recruiters | 场景页；LinkedIn 尺寸/背景建议 |
| 4 | `/team-headshots` | `team headshots`（B2B） | 待补 | AI Team Headshots — Consistent Brand Portraits | B2B 团队页；$25–29/人；发票/管理后台卖点 |
| 5 | `/real-estate-agent-headshots` | `real estate agent headshots` | 待补 | Real Estate Agent Headshots — Trust-Building Portraits | 行业页；MLS/名片/网站尺寸 |
| 6 | `/doctor-headshots` | `doctor headshots` / `physician headshot` | 待补 | Doctor & Clinic Headshots — Professional Medical Portraits | 行业页；白大褂/诊所背景 |
| 7 | `/actor-headshots` | `actress headshots`（builder 主题 12 词） | 待补 | Actor Headshots — Natural, Casting-Ready Portraits | 行业页；casting 风格 |
| 8 | `/dating-profile-pictures` | `dating profile pictures`（builder 主题 9 词） | 待补 | Dating Profile Pictures — Better Photos, More Matches | 场景页；注意合规/真实性声明 |
| 9 | `/resume-photo` | `pictures of resumes`（builder 主题 18 词） | 待补 | Resume Photo — Professional Headshot for Your CV | 场景页；ATS/简历尺寸 |
| 10 | `/pricing` | 品牌/套餐 | — | Pricing — $35/40, $45/60, $75/100 | 定价页；一次性、无订阅、重做政策 |
| 11 | `/how-it-works` | 品牌辅助 | — | How Our AI Headshot Generator Works | 信任页；样本/隐私/退款 |

### B.3 内容与合规

- 每页：示例图（自有/授权模特，不用名人）+ 工具区 + 800 字 + 3–5 FAQ + 内链。
- 人脸数据：上传即同意「仅用于本次生成、不训练、30 天删除」；未成年人/公众人物禁止；欧盟/美国州法披露。
- 退款/重做：48 小时内 1 次免费重做；不像本人可退（条款写清）；8–12% 退款准备金。
- 团队页：Admin 批量邀请/统一风格/发票；先手动（邮件收集）后做后台。

---

## 两站共用页面（信任/合规）

| URL | 内容 |
|---|---|
| `/pricing` | 套餐/年付/按量/退款政策/FAQ |
| `/how-it-works` | 3 步流程 + 模型/隐私说明 |
| `/privacy` | 数据收集、人脸/音频数据、删除、第三方 provider（Replicate/fal）、Cookie |
| `/terms` | 服务条款、可接受使用、版权/DMCA、禁止内容 |
| `/refund` | 退款/重做政策 |
| `/contact` | 邮箱/工单；举报入口 |
| `/blog`（后期） | 长尾内容：怎么拍头像、怎么去人声、卡拉 OK 制作等 |

---

## 上线顺序（两周）

1. 两站首页 + 定价 + how-it-works + 隐私/条款/退款（D1–D7）
2. A 站前 3 个子页 + B 站前 3 个子页（D8–D10）
3. 其余子页按 GSC 曝光/排名逐步加（D11+，每周 2–3 页）
4. 每页上线当天：GSC 网址检查、sitemap 提交、内链回首页
5. 4 周后看 GSC：曝光多点击少 → 改 title；排名 5–15 → 补内容/内链；新词 → 开页

---

## 关键词缺口（上线前补）

- A：`remove vocals from song`、`acapella maker`、`karaoke maker`、`stem separation`、`remove background music from video` 的单独量/KD（策略构建器主题词，需 Semrush 单查）。
- B：`linkedin headshot`、`team headshots`、`real estate agent headshots`、`doctor headshots`、`actor headshots`、`dating profile pictures`、`resume photo` 的单独量/KD。
- 补法：Semrush 关键词魔法逐词查，量 ≥1,000 且 KD ≤60 才单独开页；<1,000 的合并进相邻页 H2。
