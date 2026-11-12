# 域名候选（2026-11-11 实查，RDAP Verisign）

> 规则（site-build §23）：只买 **.com**；短、可读、无连字符；不碰竞品商标；$10–12/年（Cloudflare Registrar at-cost 约 $11.17/年）。
> 查法：`https://rdap.verisign.com/com/v1/domain/<name>.com` → **404 = 可注册**，200 = 已注册。
> 以下全部是 404（可注册）；价格以 Cloudflare Registrar 结账为准。

## A 站（人声/伴奏分离）

| 域名 | 长度 | 含义 | 评价 |
|---|---|---|---|
| **stemextractor.com** | 13 | “stem extractor” 工具词 | ✅ **推荐**：词义最准，用户一眼懂；略超 12 字符 |
| separatevocals.com | 15 | “separate vocals” 意图词 | ✅ 备选：意图最准，但偏长 |
| vocalfork.com | 9 | 品牌词 | ⚠️ 短、好记，但不含工具词，需靠内容建立认知 |
| vocalsplit.com / removevocals.com / isolatevocals.com 等 | — | — | ❌ 已被注册（本次实查 200） |

**建议买**：`stemextractor.com`；如果周五前被抢，备选 `separatevocals.com`。

## B 站（AI 职业头像）

| 域名 | 长度 | 含义 | 评价 |
|---|---|---|---|
| **headshotsnap.com** | 12 | “headshot snap” | ✅ **推荐**：短、好记、含 headshot，和「自拍→头像」动作匹配 |
| headshotrise.com | 12 | “headshot rise” | ✅ 备选：正向品牌感 |
| headshotmuse.com | 12 | “headshot muse” | ✅ 备选：品牌感强，偏女性/创意 |
| headshotvibe.com | 12 | “headshot vibe” | ✅ 备选：年轻化 |
| headshotwave.com | 12 | “headshot wave” | ✅ 备选 |
| headshotbay.com | 10 | “headshot bay” | ✅ 备选：最短，但没有“snap/rise”那种动作感 |

> 注意：`headshotpro.com` / `aragon.ai` / `magicstudio.com` 等是竞品商标，**不要**注册近似域名（buyheadshotpro、headshotpro-xx 之类），有 UDRP/商标风险。

**建议买**：`headshotsnap.com`；备选 `headshotrise.com`。

## 购买与配置（周五）

1. Cloudflare Dashboard → Domain Registration → Register Domains，搜这两个名字，按 $11.17/年 左右结账（两张卡/一次结账均可）。
2. 买完自动托管 DNS（Cloudflare Registrar 自带）。
3. 打开 **Auto-Renew**（域名台账第一规则：忘续费 = 归零）。
4. 把域名告诉我，我配：
   - Worker Custom Domain（`paid-tools-voice` / `paid-tools-headshot`）
   - `NEXT_PUBLIC_SITE_URL_VOICE` / `NEXT_PUBLIC_SITE_URL_HEADSHOT`
   - canonical / sitemap / hreflang 的正式域名
   - GSC 网域资源（DNS TXT 验证）
5. 上线顺序：先 `stemextractor.com`（A 站），B 站等主词页面改完再挂。

## 备注

- 域名可用性会变，周五买之前我会再查一次 RDAP；如果推荐名被抢，直接换备选。
- 不要买 `.ai` / `.io` / `.app` 作为主域名（访谈只认 .com；`.app` 的 HSTS 还会增加配置麻烦）。
- 两个域名不要互链，也不要同一套模板/统计（站群隔离，site-risk-compliance §2）。

---

## 实际购买（2026-11-12）

- 注册商：**Dynadot**；订单 28127549；已注册：
  - `stemextractor.com`
  - `headshotsnap.com`
- Cloudflare zone 已添加（Free 计划），分配 NS：
  - `felipe.ns.cloudflare.com`
  - `marjory.ns.cloudflare.com`
- 待办：在 Dynadot 域名管理里把两个域名的 nameservers 改为上面两条（删除原 NS），保存后等 Cloudflare 激活。
