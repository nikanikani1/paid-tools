# SEO 周复盘 — 2026-11-22

站点：StemSplit.ai（stemextractor.com）/ PortraitLab（headshotsnap.com）
数据：GSC `2026-11-11～11-19`（VPN 恢复后重拉，更新于 3.5 小时前）；Semrush `2026-11-20` 快照。

## 1. GSC 当前（A/B）

| 指标 | A 11/18 旧 | A 11/22 当前 | B 11/18 旧 | B 11/22 当前 |
|---|---:|---:|---:|---:|
| 点击 | 0 | **0** | 0 | **0** |
| 曝光 | 82 | **270** | 6 | **49** |
| CTR | 0% | **0%** | 0% | **0%** |
| 平均排名 | 67.4 | **58.1** | 61.0 | **50.0** |
| 查询数 | 33 | **101** | 3 | **8** |

结论：**曝光和平均排名明显改善，但点击仍为 0**；内容开始进池，标题/意图/排名还不够拿到点击。

### A 热门查询（0 点击）

| 查询 | 曝光 |
|---|---:|
| acapella extractor | 14 |
| stem extractor | 9 |
| how to strip songs of vocals | 6 |
| how to remove vocals on a song | 6 |
| how to separate vocals from a song | 6 |
| vocal stem | 5 |

### A 热门页面（0 点击）

| 页面 | 曝光 |
|---|---:|
| `/remove-vocals-from-song` | 59 |
| `/ai-vocal-remover` | 50 |
| `/` | 35 |
| `/acapella-maker` | 35 |
| `/separate-stems` | 30 |
| `/vocal-remover-online` | 29 |
| `http://stemextractor.com/` | 14 |

### B 热门查询/页面

- 查询：`professional headshot ai` 8、`ai professional headshots` 7、`ai professional headshot` 5、`ai generated professional headshot` 4、`doctor headshots` 2；
- 页面：`/ai-professional-headshot` 37、`/about` 4、`http://headshotsnap.com/doctor-headshots` 4、`http://headshotsnap.com/` 3、`/linkedin-headshot` 2、`/how-it-works` 2、`/team-headshots` 2。

## 2. 索引（GSC 当前）

| 站点 | 已编入索引 | 未编入索引 | 未收录原因 |
|---|---:|---:|---|
| A | **18** | **6** | 404×2、重定向×2、备用规范页×1、已发现未收录×1 |
| B | **17** | **4** | 备用规范页×2、重定向×1、已发现未收录×1 |

人工处置：两站均 **未检测到任何问题**（2026-11-22 复核）。

## 3. Semrush 当前 vs 11/18

| 指标 | A 11/18 | A 11/20 | B 11/18 | B 11/20 |
|---|---:|---:|---:|---:|
| Authority Score | 0 | **0** | 2 | **2** |
| 自然流量 | 0 | **0** | 不可用 | 不可用 |
| 自然关键词 | 3 | **5** | 前100无 | **前100无** |
| 引荐域名 | 9 | **89（+80）** | 2,326 | **2.4K** |
| 反向链接 | 12 | **119（+107）** | 2,673 | **2.8K** |
| AI 可见度 | — | **0** | — | **0** |

### A 当前 5 个自然关键词

| 关键词 | 排名 | 量 | KD | 页面 |
|---|---:|---:|---:|---|
| vocal remover extension | 76 | 210 | 24 | `/vocal-remover-online` |
| ai instrument remover | 77 | 40 | 1 | `/ai-vocal-remover` |
| ai voice splitter free | 94 | 40 | 61 | `/free-vocal-eliminator` |
| how to strip vocals from a track | 61 | 590 | 72 | `/remove-vocals-from-song` |
| lead vocal separator | 68 | 40 | 54 | `/ai-vocal-remover` |

### A 外链异常（本周新风险）

A 从 **9 引荐域名 / 12 链接** 跳到 **89 / 119**；新增集中在这几天：

- `sitewiki.org`：30 条；
- `linkalchemy.xyz`：2 条 nofollow；
- `12235232.xyz`～`12235237.xyz` 等编号域名：每条 1 个 nofollow；
- 首次发现：2 天前～数十分钟前。

判断：更像自动目录/PBN 网络；**不确认是负 SEO 还是历史遗留，不直接 disavow**。GSC 人工处置目前仍无异常。

B 仍是 2.4K 引荐域名/2.8K 链接的已知垃圾网络，数量继续增长，但无人工处置。

## 4. 本轮已做（不涉及 A/B 正文改动）

- 恢复 GSC，完成 A/B 当前 Performance、Coverage、Manual Actions 数据；
- 新域名 GSC：`getyardcanvas.com` / `gethuemirror.com` 已用 HTML 标记验证，sitemap 已提交并读取成功（8 URL）；
- 新站把 6 个风格页（Japanese/Cottage/Low-water、Copper/Black/Pastel）上线，sitemap 各 8 URL；
- 新站 Analytics（`/api/events` 落 R2，已实测 accepted/r2=1）、OG 图、HEIC 提示修正、旧 workers.dev 301；
- R2 lifecycle 增加 `landscape-out-30d`、`haircolor-out-30d`；
- B 站团队未实现承诺：`/team-headshots` 改 noindex 预览页；导航/pricing/FAQ/contact/authors 的团队/按座/净账期承诺清除；
- 两站 A/B 页面正文、标题、URL 本轮未改。

## 5. 下一步行动（按影响）

### P0

1. **A 外链异常只读审计**：导出 89 个域名/锚文本，分类垃圾网络；查 GSC 人工处置；暂不 disavow。
2. **B 外链审计**：2.4K 继续只读分类，和 11/18 增量对比。
3. **A 当前 18 收录/6 未收录**：逐条看 404/重定向/备用规范页，决定修复或忽略；不改线上 URL。
4. **B 4 未收录**：备用规范页/重定向/已发现未收录，逐条确认；`http://` 版本优先做 301/规范确认。

### P1

5. **A 目标词等 14 天**：上轮 3 页（remove-vocals / acapella / separate-stems）已开始有曝光，不因 0 点击立刻改回。
6. **A 标题/意图优化**：当前 0 点击；优先 `remove-vocals-from-song`、`acapella-maker` 的标题/摘要，但每次 1–2 页，先给方案。
7. **B `team-headshots` 仍 noindex**：产品上线前不推广；上轮已清理站内承诺。
8. **B 医生/团队页暂无高意图词**：不抢跑，继续观察。
9. **新站风格页请求收录**：GSC URL Inspection 对 6 个 `/styles/*` 逐页请求；先首页+3 页各站。

### P2

10. 每周记录 A/B GSC 曝光/点击/均位 + Semrush 引荐域名/链接；A 外链若继续跳升升级 P0。
11. 不购买目录/PBN 外链；不无证据 disavow。
12. 等新域名有 GSC 数据后再做新站 SEO 判断。

## 6. 需要你决策

- A/B 的标题/摘要改动是否需要我下一步直接做（每次 1–2 页）。
- A/B 是否考虑域名级 disavow；目前证据不足，我建议继续观察。
- B 团队产品是否上线；上线前保持 noindex。
