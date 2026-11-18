# SEO 复盘 — 2026-11-18

> 站点：StemSplit.ai（stemextractor.com）/ PortraitLab（headshotsnap.com）
> 数据源：Google Search Console（2026-11-11～11-15，GSC 显示数据延迟约 3.5 小时）
> Semrush：**blocked**——共享账号 Tools Share 首页明确禁止自动化工具访问 Semrush/Similarweb；未绕过，未编造数据。
> 结论先行：**收录基础健康，问题不在“能不能抓”，而在“新站没有排名/点击”。当前最值得做的是 B 站补收录、关键词页面对齐、内链和外链，而不是大改技术架构。**

## 1. GSC 表现（28 天窗口实际只有 5 天数据）

| 站点 | 点击 | 曝光 | CTR | 平均排名 | 查询数 |
|---|---:|---:|---:|---:|---:|
| A StemSplit | 0 | 82 | 0% | 67.4 | 33 |
| B PortraitLab | 0 | 6 | 0% | 61.0 | 3 |

数据从 2026-11-11 开始，说明 GSC 里这两个域名的数据刚起步，不能算“本周下跌”；也还不足以做周同比。当前不是流量下滑，是**还没有形成排名**。

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

## 2. 索引与抓取

| 站点 | 已编入索引 | 未编入索引 | 原因 |
|---|---:|---:|---|
| A | **17** | **0** | 无问题 |
| B | **14** | **5** | 2 个「备用网页（有适当的规范标记）」+ 3 个「已抓取 - 尚未编入索引」 |

- A/B sitemap 均提交成功，均 **16 个 URL**。
- A 索引覆盖反超 sitemap 1 个（正常，可能有首页/别名）。
- **B 的 5 个未收录页面是本周唯一明确的索引动作项**：先到 GSC「网页索引编制 → 未编入索引」逐个看 URL；优先处理「已抓取但未编入索引」的 3 个，通常是内容价值不足/重复/内链弱，不要直接 noindex。

## 3. 技术/On-page 快照（32 个 sitemap 页面）

逐页抓取 32 个 sitemap URL，检查 title/meta/H1/canonical/schema/图片 alt/字数：

- 32/32 返回 200；
- 32/32 有 canonical；
- 32/32 只有一个 H1；
- 32/32 有 JSON-LD schema；
- 32/32 无缺失 alt；
- 32/32 正文 >250 词，没有明显 thin page；
- sitemap/robots 正常，HTTPS 正常。

### 需要修的 On-page（低风险，等批准）

- **Title 过长**：23/32 超过 60 字符，Google 可能截断/重写。重点：
  - `/vocal-remover-online` 70
  - `/separate-stems` 69
  - `/pricing` 67
  - `/contact` 74
  - `/authors/stemsplit-audio-team` 78
  - B 站 `/pricing` 81、`/ai-headshot-generator` 74、`/free-ai-headshot-generator` 74、`/doctor-headshots` 76
- **Meta description 过长**：26/32 超过 160 字符，多数在 160–245；不是排名因素，但影响 SERP 展示和 CTR。
- 这些先不动，等索引/关键词方向确定后统一改，避免反复提交。

## 4. 诊断：现在真正的问题是什么

1. **A 站技术基础过关，但没有排名**：17 页全收录、H1/schema/canonical 正常；33 个查询平均位置 67.4，说明页面被索引但不在前 5 页。新站缺权威和精准内容匹配，不是“再改 title 就能到首页”。
2. **B 站有 5 页没收录**：先补这 5 页，否则再多外链也浪费；其中 3 个「已抓取未编入索引」是内容价值/内链信号问题。
3. **查询与页面不完全对齐**：
   - A：`acapella extractor` 有 8 次曝光，但对应页是 `/acapella-maker`；标题/H1/首段应自然覆盖 “extractor”。
   - A：`stem extractor` 对应 `/separate-stems`；`remove lead vocals from songs` 对应 `/remove-vocals-from-song`；需要把查询原词放进 H2/FAQ，而不是只改 title。
   - B：`doctor headshots` 对应 `/doctor-headshots`；`team photo ai` 对应 `/team-headshots`；先确认这两个页面是否在那 5 个未收录里。
4. **Semrush 缺口无法量化**：没有竞品关键词、外链、SERP 难度数据，所以本轮不假装给出“关键词机会分”。需要你导出 Semrush CSV 或给独立账号/API，再把竞品差距并进下周复盘。

## 5. 下周执行清单（按优先级）

### P0（本周先做，不改大结构）

1. **B 站补收录**
   - GSC → 索引编制 → 未编入索引，导出 5 个 URL；
   - 对「已抓取未编入索引」的 3 个页面：补 1 个独特案例/对比/FAQ，增加 2–3 条站内上下文链接；
   - 用 URL 检查逐个请求编入索引；
   - 7 天后复查，不重复提交未变化的页面。
2. **查询词对齐（A/B 各 2–3 页）**
   - A：`/acapella-maker` 增加 “acapella extractor” 语义；`/separate-stems` 增加 “stem extractor”；`/remove-vocals-from-song` 增加 “remove lead vocals from songs”。
   - B：`/doctor-headshots`、`/team-headshots` 检查是否未收录；补对应查询的首段/H2/FAQ。
   - 只改文案结构与内链，不改 URL。
3. **B 站 5 个未收录页的 canonical 检查**
   - 2 个「备用网页」确认是否重复 URL（尾斜杠、大小写、参数）；保留 canonical，不要 noindex。

### P1（2–4 周）

4. **Title/meta 统一收口**
   - 优先首页、pricing、两个主工具页、B 的 doctor/team 页；
   - Title ≤60，description 140–160，保留主关键词在前半句；
   - 一次提交，不反复改。
5. **内链**
   - 首页/工具页给 priority 页面固定入口；避免只靠 footer；
   - 每篇工具页至少链到 2 个相关工具页/对比页。
6. **权威/外链**
   - 按 `docs/BACKLINK-EXECUTION.md` 做 10 条可执行目录/社区动作；
   - 用 Semrush 导出竞品外链后，再做定向外联，不要盲发。

### P2（内容与验证）

7. **内容差异化**
   - A：补 1 个真实分离样例的 before/after 说明、失败案例和限制；
   - B：补 doctor/team 场景的真实工作流和边界，不要只写营销文案。
8. **监控**
   - 每周记录 GSC 点击/曝光/CTR/均位 + 已收录数 + B 未收录数；
   - 连续 2 周无改善，再调整关键词/内容，不要每天改。

## 6. 本周不做

- 不改 URL、不加大量新页面、不批量改 title/meta；
- 不自动抓取 Semrush；
- 不在没有竞品数据时编造“关键词机会”。

## 7. 需要你提供/决定

1. **Semrush 数据**：从共享账号导出 Domain Overview、Organic Keywords、Competitors、Backlinks 的 CSV，或给独立 API 权限；否则我只能做 GSC + 技术面。
2. 是否批准 P0 的 B 站补收录 + 5 个页面的文案/内链调整；批准后我再改线上并逐页验证。
