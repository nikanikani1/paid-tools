# SEO 复盘 — 2026-11-18

> 站点：StemSplit.ai（stemextractor.com）/ PortraitLab（headshotsnap.com）
> 数据源：Google Search Console（2026-11-11～11-15，延迟约 3.5 小时）+ Semrush Domain Overview / Organic Positions / Backlinks（2026-11-16 数据快照；通过 Tools Share 浏览器会话读取，未批量抓取）
> 结论先行：**A 站技术面健康但没有排名；B 站除了收录缺口，还存在明显的垃圾外链/可疑外链结构。当前优先级不是改技术架构，而是 B 站外链审计 + 补收录 + 查询词对齐。**

## 1. GSC 表现

| 站点 | 点击 | 曝光 | CTR | 平均排名 | 查询数 |
|---|---:|---:|---:|---:|---:|
| A StemSplit | 0 | 82 | 0% | 67.4 | 33 |
| B PortraitLab | 0 | 6 | 0% | 61.0 | 3 |

GSC 数据从 2026-11-11 开始，只有 5 天，不能做可靠的周同比；当前不是“流量下滑”，而是**还没有形成排名**。

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

## 2. Semrush 数据

### 域名概览

| 指标 | A stemextractor.com | B headshotsnap.com |
|---|---:|---:|
| Authority Score | 0 | 2 |
| 自然流量 | 0 | 不可用（无自然流量） |
| 自然关键词 | 3 | 不可用（前 100 无排名） |
| 引荐域名 | 9 | **2,326（+19%）** |
| 反向链接 | 12 | **2,673（+16%）** |
| AI 可见度 | 0 | 0 |

### A 站的 3 个自然关键词

| 关键词 | 排名 | KD | 月搜索量 | 落地页 |
|---|---:|---:|---:|---|
| ai instrument remover | 77 | 1 | 40 | `/ai-vocal-remover` |
| lead vocal separator | 68 | 54 | 40 | `/ai-vocal-remover` |
| ai voice splitter free | 94 | 61 | 40 | `/free-vocal-eliminator` |

这 3 个词流量都是 0；KD=1 的 `ai instrument remover` 是 A 站当前最明确的机会词，但排名 77，说明页面相关性和权威都不够。

### B 站外链风险（重要）

B 的 2.3K 引荐域名不是自然增长，也不是品牌提及；Semrush 反向链接样本里出现大量同一模板的垃圾目录页：

- `australia-seo.info/dir/seo-growth-backlinks-90326`
- `advanced-seo.com/dir/seo-growth-backlinks-90326`
- `24rankings.info/dir/seo-growth-backlinks-90326`
- `100ranking.link/dir/seo-growth-backlinks-90326`
- `100ranking.info/dir/seo-growth-backlinks-90326`

锚文本高度重复为 `Premium headshotsnap.com Backlinks Designed to Increase Google Search Visibility`，页面标题也是同一模板。Semrush 网络图标记为「可疑」。

这类外链**不会带来真实流量**，更像：

1. 域名历史遗留；或
2. 自动化垃圾外链/负 SEO 攻击。

**不要直接对 2.7K 外链做 disavow**。先做 Backlink Audit 分类；确认是纯垃圾网络、且 GSC 出现人工处置或排名异常，再考虑按域名级 disavow，并保留审计记录。当前没有证据要求马上 disavow。

## 3. 索引与抓取

| 站点 | 已编入索引 | 未编入索引 | 原因 |
|---|---:|---:|---|
| A | **17** | **0** | 无问题 |
| B | **14** | **5** | 2 个「备用网页（有适当的规范标记）」+ 3 个「已抓取 - 尚未编入索引」 |

- A/B sitemap 均提交成功，均 **16 个 URL**。
- A 索引覆盖反超 sitemap 1 个（正常）。
- **B 的 5 个未收录页面是明确的索引动作项**：GSC「网页索引编制 → 未编入索引」逐个看 URL；优先处理「已抓取但未编入索引」的 3 个（通常是内容价值不足、重复或内链弱），不要直接 noindex。

## 4. 技术/On-page 快照（32 个 sitemap 页面）

- 32/32 返回 200；
- 32/32 有 canonical；
- 32/32 只有一个 H1；
- 32/32 有 JSON-LD schema；
- 32/32 无缺失 alt；
- 32/32 正文 >250 词，没有明显 thin page；
- sitemap/robots/HTTPS 正常。

### 需要修的 On-page（低风险，等批准）

- **Title 过长**：23/32 超过 60 字符，重点：
  - A `/vocal-remover-online` 70、`/separate-stems` 69、`/pricing` 67、`/contact` 74、`/authors/stemsplit-audio-team` 78；
  - B `/pricing` 81、`/ai-headshot-generator` 74、`/free-ai-headshot-generator` 74、`/doctor-headshots` 76。
- **Meta description 过长**：26/32 超过 160 字符（多数 160–245）；影响 SERP 展示和 CTR，不是排名主因。
- 先不动，等索引/关键词方向确定后统一改，避免反复提交。

## 5. 诊断

1. **A 站不是技术问题**：17 页全收录，H1/schema/canonical 正常；33 个查询平均位置 67.4，3 个 Semrush 关键词排名 68–94，说明被索引但没竞争力。缺的是精准内容匹配 + 权威。
2. **B 站有两个独立问题**：5 个页面未收录；2.3K 垃圾/可疑外链可能稀释信任。先处理收录和外链审计，不要急着加新页面。
3. **查询与页面不完全对齐**：
   - A：`acapella extractor` 有 8 次曝光，对应 `/acapella-maker`；`stem extractor` 对应 `/separate-stems`；`remove lead vocals from songs` 对应 `/remove-vocals-from-song`；需要把查询原词自然放进 H2/FAQ/首段。
   - B：`doctor headshots` 对应 `/doctor-headshots`；`team photo ai` 对应 `/team-headshots`；先确认它们是否在 5 个未收录里。
4. **Semrush 的 A 站机会**：`ai instrument remover` KD=1、月量 40，是当前最值得先优化的低竞争词，但不要为 40 月量单独建页；在 `/ai-vocal-remover` 增加该语义和 FAQ 即可。
5. **B 站没有前 100 自然关键词**：需要先补收录 + 建立少量真实外链，而不是继续加营销页。

## 6. 下周执行清单

### P0（本周）

1. **B 站外链审计（先审不删）**
   - Semrush Backlink Audit 跑 `headshotsnap.com`；
   - 导出 top referring domains，按垃圾目录/真实媒体/品牌提及分类；
   - 检查 GSC「安全问题和人工处置措施」是否有 manual action；
   - 只有在确认纯垃圾网络且影响排名/出现人工处置时，才按域名级 disavow；保留变更记录。
2. **B 站补收录**
   - 找 5 个未收录 URL；对 3 个「已抓取未编入索引」页面补独特案例/FAQ + 2–3 条站内上下文链接；
   - 逐页请求编入索引；7 天后复查。
3. **查询词对齐（只改 4 个优先页）**
   - A：`/acapella-maker`（acapella extractor）、`/separate-stems`（stem extractor）、`/remove-vocals-from-song`（remove lead vocals from songs）、`/ai-vocal-remover`（ai instrument remover）。
   - B：`/doctor-headshots`（doctor headshots）、`/team-headshots`（team photo ai）；先确认收录状态。
   - 不改 URL，只改首段/H2/FAQ/内链。

### P1（2–4 周）

4. **Title/meta 收口**：优先首页、pricing、主工具页、B doctor/team；Title ≤60、description 140–160；一次提交。
5. **内链**：首页/工具页给 priority 页面固定入口；每篇工具页至少 2 条相关内链。
6. **真实外链**：按 `docs/BACKLINK-EXECUTION.md` 执行 10 条目录/社区/媒体动作；B 站不要用任何付费垃圾外链服务。
7. **内容差异化**：A 增加真实分离样例/失败案例；B 增加 doctor/team 真实工作流与边界。

### P2（监控）

8. 每周记录 GSC 点击/曝光/CTR/均位 + 索引数 + B 未收录数；连续 2 周无改善再调整，不每天改。

## 7. 本周不做

- 不批量改 title/meta；
- 不 direct disavow 2.7K 外链（先审计）；
- 不加大量新页面；
- 不用垃圾外链/自动目录提交冲 B 站。

## 8. 需要你决定

是否批准 P0：
1. B 站 5 个未收录页面的内容/内链调整；
2. A/B 四个优先页面的查询词对齐；
3. B 站 Backlink Audit 的只读导出（不直接改 disavow 文件）。

批准后我再改线上并逐页复验；Semrush 外链审计结果会并入下一次周报。
