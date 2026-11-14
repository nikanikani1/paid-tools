# GSC-BING — 搜索后台操作记录（A: stemextractor.com / B: headshotsnap.com）

> 最后更新：2026-11-15（task-27：B 站首页复检 → **已编入索引**；A/B sitemap 状态复检）。
> 上一版：2026-11-14（task-23，ego-browser 登录态来自本机 Chrome 导入的 Google 账号）。
> 原则：只记录**这次真实看到/点到**的结果；错误原样引用；没权限/没登录的写「阻塞」。

## 1. 属性与账号状态

| 站点 | Search Console 属性 | 状态 |
| --- | --- | --- |
| A | `sc-domain:stemextractor.com` | ✅ 已登录可访问（左侧菜单完整） |
| B | `sc-domain:headshotsnap.com` | ✅ 已登录可访问 |
| 账号默认属性 | `sc-domain:base64kit.com` | 打开 GSC 默认落到这个老站，不影响操作 |

- 验证方式：DNS TXT 域级验证（见 docs/PROGRESS.md「2026-11-12 GSC + IndexNow」）。
- 浏览器：ego-browser（本机默认浏览器，已登录态）；**未使用 computer-use**。

## 2. GSC：sitemap 状态（2026-11-15 复检）

| 站点 | Sitemap | 状态 | 已发现网页 | 上次读取 | 结论 |
| --- | --- | --- | --- | --- | --- |
| A | `https://stemextractor.com/sitemap.xml` | **成功** | **16** | 2026-11-14（2026-11-15 复检确认） | ✅ A 站 sitemap 已恢复成功（此前「无法获取」已消失） |
| B | `https://headshotsnap.com/sitemap.xml` | **成功** | **16** | 2026-11-12 | ✅ 与既有记录一致 |

> task-23 要求「GSC A 站 sitemap 重试」——复检时 A 站状态已是「成功 / 16 个已发现网页」，**无需再重试提交**；若后续再出现「无法获取」，操作路径：GSC → 站点地图 → 删除该条 → 「添加新的站点地图」输入 `sitemap.xml` → 提交。
> 证据：`docs/evidence/gsc-sitemaps-A.png|json`、`gsc-sitemaps-B.png|json`。

## 3. GSC：URL 检查（首页）

| 站点 | URL | 结果 | 请求编入索引 | 证据 |
| --- | --- | --- | --- | --- |
| A | `https://stemextractor.com/` | **网页已编入索引** | 已点击「请求编入索引」（按钮存在且可点） | `gsc-inspect-A-final.png|json`、`gsc-inspect-A-requested.png` |
| B | `https://headshotsnap.com/` | **网页已编入索引**（2026-11-15 00:08 CST 复检；11-14 曾显示「Google 无法识别此网址」） | 无需再点（已收录） | 2026-11-15 复检记录见 §3.1；历史证据 `gsc-inspect-B-final.png|json`、`gsc-inspect-B-requested.png` |

详细观察：
- 两个 URL 检查页都一直显示「正在测试实际网址可否编入索引」——GSC 的实时测试在本次会话里**没有等到完成态**（等待 15s+ 仍显示测试中）。A 的索引状态是已编入索引，B 是未编入索引。
- B 的「Google 无法识别此网址」= 该 URL 还没被 Google 发现/抓取过（sitemap 里已包含 `https://headshotsnap.com` 作为第 1 条，sitemap 状态成功，说明是**抓取/发现延迟或近期重新部署导致**，不是 sitemap 错误）。
- 处置建议（24–72h 后复检）：
  1. GSC → B 站 → 网址检查 → `https://headshotsnap.com/` → 等实时测试出结果 → 若「可以编入索引」再点「请求编入索引」；
  2. GSC → 编制索引 → 网页 → 看「已发现但尚未编入索引」理由；
  3. 确认线上首页 canonical 与 sitemap 首条一致（`curl -s https://headshotsnap.com/ | grep -o '<link rel="canonical" href="[^"]*"'`）；
  4. 若有内链/外链新页面，同步提交 IndexNow（见 §4）。

### 3.1 2026-11-15 00:08 CST B 站首页复检（task-27）—— **已编入索引**

- 方法：ego-browser（本机默认浏览器，登录态来自 Chrome 导入的 Google 账号）；打开 GSC → B 属性 → 网址检查 → 输入 `https://headshotsnap.com/` → Enter。
  ⚠️ **深链坑**：`https://search.google.com/search-console/inspect?resource_id=sc-domain%3Aheadshotsnap.com&id=https%3A%2F%2Fheadshotsnap.com%2F`（以及 resource_id 不编码的变体）在 2026-11-15 都返回 Google 自家 **404「Error 404 (找不到)!!1」**；必须走「GSC → 网址检查 → 输入框」的 UI 路径，不要用这个深链。
- 复检结果（页面原文）：
  - 顶部状态：**「网址已收录到 Google」**
  - 「网页索引编制」：**「网页已编入索引」**
  - 增强项：「HTTPS — 网页采用 HTTPS 协议」；「产品摘要 / 路径 — 检测到了 1 项有效内容」
- 结论：11-14 的「Google 无法识别此网址」已消失，B 首页**已完成收录**，不再需要点「请求编入索引」；sitemap 状态仍为「成功 / 16 个已发现网页」。
- 证据形式：本次为 **ego-browser 文本证据**（未新增 PNG；上一轮截图 `gsc-inspect-B-final.png` 仍保留历史对照）。复现方法：按上面的 UI 路径手动走一遍即可。

## 4. IndexNow（Bing/Yandex/Seznam 索引加速）

| 项 | A 站 | B 站 |
| --- | --- | --- |
| key | `2043e4748f5158e13da6f94f301a795f` | `b484acedb3587c1727f9d59ca2bcda33` |
| key 文件 URL | `https://stemextractor.com/<key>.txt` → **200** | `https://headshotsnap.com/<key>.txt` → **200** |
| 本次提交时间 | 2026-11-14 | 2026-11-14 |
| 提交 URL 数 | 16（sitemap 全量） | 16（sitemap 全量） |
| `POST https://api.indexnow.org/indexnow` HTTP 状态 | **200** | **200** |

复现命令（把 `$KEY` 换成上表 key）：

```bash
KEY=2043e4748f5158e13da6f94f301a795f; HOST=stemextractor.com
URLS=$(curl -s https://$HOST/sitemap.xml | grep -oE '<loc>[^<]+</loc>' | sed 's/<[^>]*>//g')
node -e 'const urls=process.argv[1].split("\n").filter(Boolean);console.log(JSON.stringify({host:process.argv[2],key:process.argv[3],keyLocation:`https://${process.argv[2]}/${process.argv[3]}.txt`,urlList:urls}))' "$URLS" "$HOST" "$KEY" > /tmp/indexnow.json
curl -s -o /dev/null -w "indexnow=%{http_code}\n" -X POST https://api.indexnow.org/indexnow \
  -H 'Content-Type: application/json; charset=utf-8' --data @/tmp/indexnow.json
```

> 2026-11-12 首次提交记录为 202；2026-11-14 复提返回 200（两者都表示已接收）。IndexNow 只是「通知」，不保证收录。

## 5. Bing Webmaster Tools —— **阻塞（未登录）**

- 打开 `https://www.bing.com/webmasters/` 落到 `https://www.bing.com/webmasters/about`，页面右侧显示 **Sign In**（未登录）。
- 本机没有 Bing/Microsoft 账号登录态，也没有用户授权的凭据；**Bing Webmaster 的「从 GSC 导入」「提交 sitemap」都无法执行**。
- 需要人工完成的步骤（有账号后 5 分钟）：
  1. 用 Microsoft 账号登录 <https://www.bing.com/webmasters/>；
  2. 选 **Import from Google Search Console**，OAuth 授权后导入 `stemextractor.com` 与 `headshotsnap.com`（或手动添加站点，用 DNS TXT/CNAME 验证）；
  3. Sitemaps → 提交 `https://stemextractor.com/sitemap.xml`、`https://headshotsnap.com/sitemap.xml`；
  4. 确认 IndexNow 自动启用（Bing 会显示 “IndexNow: enabled”）。
- 证据：`docs/evidence/bing-webmasters.png|json`（截图里可见 Sign In 链接）。
- 影响：Bing/Yandex 收录目前只能靠 sitemap + IndexNow 被动推进，缺少后台的抓取错误报告；**不阻塞其他任务**。

## 6. 证据文件清单（docs/evidence/）

| 文件 | 内容 |
| --- | --- |
| `gsc-sitemaps-A.png/.json` | A 站 sitemap 页（成功 / 16） |
| `gsc-sitemaps-B.png/.json` | B 站 sitemap 页（成功 / 16） |
| `gsc-inspect-A*.png/.json` | A 首页 URL 检查（已编入索引；请求编入索引已点） |
| `gsc-inspect-B*.png/.json` | B 首页 URL 检查（未编入索引：无法识别此网址；请求编入索引进度未确认） |
| `bing-webmasters.png/.json` | Bing Webmaster 未登录（Sign In） |
| `browser-round1..4.log` | ego-browser 每一轮的导航结果/错误，复现用 |
| `gsc-home.png/.json` | GSC 概况（默认属性 base64kit.com，仅作登录态证据） |
| `events-api-evidence.txt` | `/api/events` 本地 curl 证据（200、PII 过滤、R2 `stored.r2=1`） |

## 7. 下次进 GSC 的 5 分钟复检清单

1. A/B 站点地图状态是否仍为「成功」；
2. B 首页 URL 检查：**已收录（2026-11-15 确认）**，后续只需在「网页」报告确认索引数增长，不需要再点请求编入索引；
3. 两站「网页」报告：已编入索引数（当前 A/B sitemap 各 16 URL）是否增长；
4. 「效果」报告：28 天点击/展示是否 >0（新站前 2–3 个月数据少属正常）；
5. 若仍无法识别 B 首页：检查线上响应头/canonical，并在 GSC 用「测试实际网址」看抓取是否被 robot 拦。
