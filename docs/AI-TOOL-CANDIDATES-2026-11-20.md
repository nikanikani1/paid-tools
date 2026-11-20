# AI 工具站候选深挖 — 2026-11-20

> 方法：Semrush Keyword Overview（US）+ Toolify 分类目录（工具数/定价/竞品）。
> 目标：找“有真实付费需求 + KD 可打 + 能用现有 Replicate 图像/音频能力交付”的单功能 AI 工具站，不是再做泛 AI 聚合站。

## 1. 候选总表

| 候选 | 核心词 | 月搜索量 | KD | CPC | Toolify 工具数 | 价格锚 | 判断 |
|---|---|---:|---:|---:|---:|---|---|
| **AI Landscape Design** | ai landscape design | 2.9K | 32 | $1.30 | **63**（AI Landscape Generator） | mnml.ai $19/mo | **首选** |
| **AI Hair Color Changer** | ai hair color changer | 3.6K | 30 | $0.88 | **29** | Hairstyle AI $14.5/10 次 | **第二** |
| AI Tattoo Generator | ai tattoo generator | 14.8K | 62 | $1.14 | 64 | 多为订阅/点数 | 第三/可做子词 |
| AI Virtual Staging | virtual staging | 3.6K | 52 | **$4.71** | 260（AI Real Estate） | 按图/订阅 | 高客单但竞争重 |
| AI Interior Design | ai interior design | 6.6K | 54 | $1.81 | 257 | $19–49/mo | 竞争过重 |
| AI Passport Photo | passport photo | 49.5K | **90** | $0.92 | 41 | $2.90–6.90/张 | **不做**（KD90） |
| AI Noise Remover | noise remover | 720 | 67 | $0.67 | 69 | 订阅/点数 | 不做（低量高 KD） |
| AI Product Photo | ai product photography | — | — | — | 261 | $19+/mo | 红海，暂不做 |

> Toolify 分类数代表供给密度；Semrush 量/KD 代表需求与难度。两者一起看，避免“工具少但没人搜”或“搜得多但打不动”。

## 2. 首选：AI Landscape Design / Generator

### 需求

Semrush 词簇（US）：

| 关键词 | 月量 | KD |
|---|---:|---:|
| ai landscape design | 2.9K | 32 |
| ai landscape generator | 720 | 25 |
| free ai landscape generator from photo | 590 | 25 |
| generative ai landscape | 480 | 19 |
| ai landscape generator from photo | 320 | 25 |
| ai landscape design generator | 210 | 20 |

- 意图：商务/交易为主，CPC $1.30；
- KD 19–32，明显低于 virtual staging（52–68）和 passport（90）；
- Toolify 只有 **63** 个 Landscape Generator 工具，供给密度远低于 Interior Design（257）/ Product Photography（261）。

### 竞品与定价（Toolify）

- **mnml.ai**：$19/mo Basic（1,000 credits / 100 designs / 4K upscaling / commercial use），$39/mo Pro，$79/mo Expert；
- Neighborbrite、DreamzAR、Rescape AI、Landscape Design AI 等同赛道；
- 大多卖“上传院子照片 → 出改造效果图”，订阅/点数。

### 为什么适合我们

- 现有 B 站已有 Flux Kontext / image edit 管线，复用成本低；
- 输出是“院子改造概念图”，不是施工图，责任边界清晰；
- B2B/ homeowner 高客单：$9 一次 4 张概念图，或 $19/mo；
- 可用 before/after + 风格预设做差异化：现代、日式、沙漠、低维护、泳池、菜园。

### MVP 形态

```text
上传院子/门面照片
→ 选风格（Modern / Japanese / Desert / Cottage / Low-water / Pool）
→ 生成 4 张概念图（Flux Kontext image edit）
→ before/after 对比 + 下载
→ $9 单次 4 张 / $19 月度 30 张
```

技术：

- Replicate Flux Kontext（或同类 image edit）单张成本约几美分；
- 需要保留房屋结构：用原图作为参考 + 局部编辑提示，避免整图重绘；
- 失败退款/额度沿用现有 order/job 体系。

SEO 首页/工具页目标词：

- 主：`ai landscape design`、`ai landscape generator`
- 副：`ai landscape design generator`、`ai landscape generator from photo`、`landscape design ai`
- 内容：风格页 6 个、before/after 案例、成本对比、上传指南。

## 3. 第二：AI Hair Color Changer

### 需求

| 关键词 | 月量 | KD |
|---|---:|---:|
| ai hair color changer | 3.6K | 30 |

- Toolify 只有 **29** 个 Hair Color Changer 工具，供给很低；
- 竞品 Hairstyle AI：$14.5/10 次、$24.5/40 次、$45.5/100 次；
- 需求偏 consumer，付费意愿低于 landscape，但转化路径短、适合社交传播。

### 风险

- 人脸上传/隐私；需要明确同意、删除、非训练声明；
- 发色/发型改变容易“像本人但不像照片”，需要质量门槛；
- 消费者价格敏感，$4.9–9.9 更合理，$14.5 需要强卖点。

### 建议

如果做，定位不是“又一个滤镜”，而是：

```text
上传自拍 → 选目标发色（自然色/挑染/全头）
→ 4 张不同光线效果 → 沙龙沟通卡（给发型师看）
→ $4.9/4 张，或 $9.9/10 张
```

## 4. 第三：AI Tattoo Generator（只做子词）

- `ai tattoo generator` 14.8K / **KD62**，头词太硬；
- 但 `tattoo ai generator` 1.9K / **KD27**，`free ai tattoo generator` 2.4K / KD39，`adobe firefly ai tattoo generator` 3.6K / KD24（品牌词，不碰）；
- Toolify 64 个工具，竞品多；
- 若做，切“tattoo stencil / fine-line / minimalist”子风格，不要打头词。

## 5. 明确不做

| 候选 | 原因 |
|---|---|
| AI Passport Photo | 49.5K 但 KD90；PhotoGov/AiPassportPhotos 已占据，合规复杂 |
| AI Noise Remover | 720/KD67；LALAL/Krisp 强竞争，低量 |
| AI Product Photo | Toolify 261 个工具，红海；获客成本高 |
| AI Interior Design | 6.6K/KD54，257 个工具；视觉差异难做 |
| AI Virtual Staging | 3.6K/KD52，CPC $4.71 很好，但 260 个工具 + 房产 B2B 销售重；可作为 landscape 的 B2B 加购 |

## 6. 推荐顺序

1. **AI Landscape Design**：需求/难度/供给/客单最均衡，复用现有图像管线，先做 MVP；
2. **AI Hair Color Changer**：供给最少（29），量 3.6K，适合 consumer 第二站；
3. **AI Tattoo Generator**：只切 `tattoo ai generator` 子词，不作为头词主站；
4. Virtual Staging 作为 landscape 的 B2B 变体，不单独开站。

## 7. 下一步建议

- 先给 **AI Landscape Design** 做 1 页假门 + 3 个风格样片，验证上传→生成的付费意愿；
- 用 Semrush 对 `mnml.ai`、`Neighborbrite`、`DreamzAR` 做域名概览，确认竞品流量与关键词缺口；
- 若做，域名/品牌避开 “landscape design” 商标词，用 “Yard / Garden / Outdoor” 方向；
- 不批量生成城市页，先做一个可交付的单功能站。
