# SEO 复盘与执行记录 — 2026-11-18

> 站点：StemSplit.ai（stemextractor.com） / PortraitLab（headshotsnap.com）
> 数据源：GSC（2026-11-11～11-15，延迟约 3.5 小时）+ Semrush（2026-11-16 快照；通过 Tools Share 浏览器会话读取，未批量抓取）
> 执行原则：按 `site-seo-review` 的 volume × KD × 当前排名选改动；本轮只改 A 站 3 个高价值页面，B 站先做外链审计/索引复核，不追高 KD 词。

## 1. GSC 现状

| 站点 | 点击 | 曝光 | CTR | 平均排名 | 查询数 |
|---|---:|---:|---:|---:|---:|
| A StemSplit | 0 | 82 | 0% | 67.4 | 33 |
| B PortraitLab | 0 | 6 | 0% | 61.0 | 3 |

GSC 数据从 11/11 开始，样本只有 5 天，不能做可靠周同比；当前是“有索引、无排名”，不是流量下跌。

### A 站 Top queries（全部 0 点击）

| 查询 | 曝光 |
|---|---:|
| acapella extractor | 8 |
| remove lead vocals from songs | 4 |
| stem extractor | 3 |
| extract acapella | 3 |
| remove vocals from song | 2 |
| remove vocals from a song | 2 |
| stem separation | 2 |
| stemsplit | 1 |
| ai instrumental extractor | 1 |
| isolate backing vocals online | 1 |

### B 站全部 queries

| 查询 | 曝光 |
|---|---:|
| doctor headshots | 2 |
| team photo ai | 1 |
| headsnap io | 1 |

## 2. Semrush 需求与竞争

### 域名概览

| 指标 | A stemextractor.com | B headshotsnap.com |
|---|---:|---:|
| Authority Score | 0 | 2 |
| 自然流量 | 0 | 不可用 |
| 自然关键词 | 3 | 前 100 无排名 |
| 引荐域名 | 9 | **2,326（+19%）** |
| 反向链接 | 12 | **2,673（+16%）** |

### 关键词需求（US，Semrush Keyword Overview）

| 关键词 | 月搜索量 | KD | 判断 |
|---|---:|---:|---|
| vocal remover | 60.5K | 71 | 太硬，新站不碰 |
| ai vocal remover | 6.6K | 26 | 已有页，继续观察 |
| remove vocals from a song | 5.4K | 11 | **A 可打，已优化对应页** |
| acapella extractor | 1.9K | 26 | **A 可打，已优化对应页** |
| stems separator | 590 | 10 | **A 低 KD，已优化对应页** |
| ai headshot generator | 18.1K | 59 | B 新站打不动，先不追 |
| headshot generator | 4.4K | 65 | B 新站打不动，先不追 |

### B 站外链风险（重要）

B 的 2,326 个引荐域名不是自然品牌增长；Semrush 反向链接样本大量是同一模板的垃圾目录：

- `australia-seo.info/dir/seo-growth-backlinks-90326`
- `advanced-seo.com/dir/seo-growth-backlinks-90326`
- `24rankings.info/dir/seo-growth-backlinks-90326`
- `100ranking.link/dir/seo-growth-backlinks-90326`
- `100ranking.info/dir/seo-growth-backlinks-90326`

锚文本高度重复为 `Premium headshotsnap.com Backlinks Designed to Increase Google Search Visibility`，网络图标记为「可疑」。这更像域名历史遗留或自动垃圾外链，不是真实媒体提及。

**先做 Backlink Audit 分类，不要直接 disavow 2.7K 条链接。** 只有在确认纯垃圾网络、且 GSC 出现人工处置或排名异常时，才按域名级 disavow。

## 3. 索引复核

GSC 覆盖报告（11/13 快照）显示：

| 站点 | 已编入索引 | 未编入索引 |
|---|---:|---:|
| A | 17 | 0 |
| B | 14 | 5 |

但 11/18 URL 检查显示 B 的首页和 `/ai-professional-headshot` **当前已收录**；覆盖报告是旧快照。B 的 3 个「已抓取未编入索引」示例为：

- `https://headshotsnap.com/`
- `https://headshotsnap.com/ai-professional-headshot`
- `https://headshotsnap.com/contact`

其中首页和 AI professional 当前已收录；`contact` 不是 SEO 重点。**不要按旧覆盖数字判断“5 页都没收录”**，以 URL 检查当前结果为准。

## 4. 本轮实际改动（A 站 3 页）

只改文案/标题/FAQ/内链，不改 URL、不改产品承诺：

1. `/acapella-maker`
   - Title/H1 改为 **Acapella Extractor — Make an Acapella from Any Song**
   - 首段覆盖 `acapella extractor`，新增 FAQ「Is an acapella extractor the same as an acapella maker?」
   - 增加 `/separate-stems` 内链
   - 目标词：`acapella extractor`（1.9K / KD26）

2. `/remove-vocals-from-song`
   - 保留 Title/H1 的 “How to Remove Vocals from a Song”；description 收短
   - H2 改为 “Remove vocals from a song: which method should you use?”
   - 新增 FAQ「Can I remove lead vocals from songs and keep the backing track?」
   - 增加 `/separate-stems` 内链
   - 目标词：`remove vocals from a song`（5.4K / KD11）、`remove lead vocals from songs`（1K / KD50）

3. `/separate-stems`
   - Title/H1 改为 **Stem Separation & Stems Separator — 4 Stems**
   - 首段覆盖 `stems separator`，新增 FAQ「Is this a stems separator or a stem extractor?」
   - 增加 `/remove-vocals-from-song` 内链
   - 目标词：`stems separator`（590 / KD10）、`stem separation`（1K / KD35）

已部署到 `stemextractor.com`，线上 200；live HTML 已核对 title/H1/description 和查询词。

### 为什么本轮不改 B 站内容

- `ai headshot generator` 18.1K / **KD59**；`headshot generator` 4.4K / **KD65**；
- B 当前 Authority Score 2、无前 100 自然关键词；
- 新站先拼内容只会浪费，优先外链审计 + 少量真实外链 + 索引复核。

## 5. 下一步

### P0

1. **B 站 Backlink Audit**：只读导出 top referring domains，按垃圾目录/真实媒体/品牌提及分类；不直接 disavow。
2. **B 索引复核**：以 URL 检查当前结果为准；`contact` 不强行收录；首页/AI professional 已收录，继续观察。
3. **GSC 验证 A 改动**：2 周后看 `acapella extractor`、`remove vocals from a song`、`stems separator` 的曝光/排名变化；不因 1 周波动改回。

### P1

4. Title/meta 继续收短（23/32 title 超 60、26/32 description 超 160），一次 1–2 页。
5. 真实外链：按 `docs/BACKLINK-EXECUTION.md`，指向 A 的 money pages，不指向首页。
6. B 站不要买垃圾外链/目录服务；B 先做 3–5 条真实行业提及。

### P2

7. A 站内容差异化：补真实分离样例、失败案例和限制。
8. 监控：每周记录 GSC 点击/曝光/CTR/均位 + Semrush 目标词排名。

## 6. 验收

- 线上 3 页 200；title/H1/description 与新文案一致；
- 内链可点击到 `/separate-stems` / `/remove-vocals-from-song`；
- 下一周同一时间复看 GSC/Semrush；目标词无改善再调整内容，不批量改全站。
