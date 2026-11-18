# B 站外链审计 — 2026-11-18

站点：`headshotsnap.com`（PortraitLab）
数据：Semrush Backlink Analytics / Referring Domains，2026-11-16 快照
结论：**存在大规模垃圾目录/PBN 外链；GSC 当前无人工处置，先审计、不要直接 disavow。**

## 1. 规模

| 指标 | 数值 |
|---|---:|
| Authority Score | 2 |
| 引荐域名 | 2,326（+19%） |
| 反向链接 | 2,673（+16%） |
| Semrush 网络图 | 可疑 |
| GSC 人工处置 | 未检测到任何问题（2026-11-18） |

## 2. 典型垃圾样本

Semrush 反向链接样本大量来自同模板目录页：

| 源 | 形态 |
|---|---|
| `australia-seo.info/dir/seo-growth-backlinks-90326` | 目录页 |
| `advanced-seo.com/dir/seo-growth-backlinks-90326` | 目录页 |
| `24rankings.info/dir/seo-growth-backlinks-90326` | 目录页 |
| `100ranking.link/dir/seo-growth-backlinks-90326` | 目录页 |
| `100ranking.info/dir/seo-growth-backlinks-90326` | 目录页 |
| `dapacheckerbulk.store` | 检查器/PBN |
| `dapacheckerpro.space` | 检查器/PBN |
| `domaindapachecker.store` | 检查器/PBN |
| `domainseochecker.website` | 检查器/PBN |
| `editorlinks.xyz` | 链接网络 |
| `goldbacklinks.info` / `goldbacklinks.link` | 链接网络 |
| `goodbacklinkchecker.store` | 检查器/PBN |

锚文本高度重复：`Premium headshotsnap.com Backlinks Designed to Increase Google Search Visibility`。

这不是自然品牌提及，更像：

1. 域名历史遗留（domain 可能曾属于其他项目/被自动化注册）；或
2. 自动垃圾外链 / 负 SEO 攻击。

## 3. 是否 disavow

**暂时不要直接 disavow 2,673 条链接。**

理由：

- GSC 当前没有人工处置；
- Google 通常会忽略大量低质量目录链接；直接 disavow 反而可能误伤；
- 需要先按域名级分类，确认是否为纯垃圾网络，并保留审计记录。

只有在以下情况才建议提交 disavow：

1. GSC 出现 manual action；或
2. 排名在垃圾外链暴增后明显异常；或
3. 确认某批域名与品牌无关且是自动生成的链接网络。

提交时按**域名级**（而非逐条 URL），保留 `disavow-YYYY-MM-DD.txt` 和提交记录。

## 4. 下一步

- [ ] 导出 Semrush referring domains 前 200，按「垃圾目录 / PBN / 真实媒体 / 品牌提及」分类；
- [ ] 检查域名历史（Wayback/WHOIS）确认是否为历史遗留；
- [ ] 每周看 GSC 人工处置和排名变化；
- [ ] 构建 3–5 条真实行业提及（设计/摄影/招聘/LinkedIn 相关），不要购买垃圾目录服务；
- [ ] 不把 B 站当短期 SEO 主战场：`ai headshot generator` 18.1K/KD59，新站先积累信任。

## 5. 证据

Semrush 截图/文本未入库，报告中的数据来自 2026-11-18 浏览器会话；如需要可补 `docs/evidence/semrush-backlinks-B.png`。
