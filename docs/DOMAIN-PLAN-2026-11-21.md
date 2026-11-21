# 域名购买方案 — 2026-11-21

> 只针对两个新站。老站已有 `stemextractor.com` / `headshotsnap.com`，不动。
> 可用性用 RDAP 在 2026-11-21 查过；**下单页最终确认**，RDAP 404 不等于 100% 可注册。

## 1. 推荐方案（优先买）

| 品牌 | 主域名 | 防御/跳转 | 状态 |
|---|---|---|---|
| YardCanvas | `yardcanvas.ai` | `yardcanvas.co` | 两个 RDAP 均 404（可注册） |
| HueMirror | `huemirror.ai` | `huemirror.co` | 两个 RDAP 均 404（可注册） |

原因：

- `.com` 精确品牌都已被注册：`yardcanvas.com`、`huemirror.com`，不走 aftermarket 溢价；
- `.ai` 精确匹配品牌，适合 AI 产品，用户一眼知道是 AI 工具；
- `.co` 作为防御/短域名，可 301 到 `.ai`，防止别人抢注/混淆；
- 两个品牌都短、可读、可拼写。

## 2. 预算方案

| 方案 | 买什么 | 首年大致 |
|---|---|---|
| 标准 | 2 × `.ai` + 2 × `.co` | **约 $200–280** |
| 省钱 | 2 × `.co`（主域名） | **约 $60–80** |
| 极简 | 2 × `.ai` | **约 $150–200** |

价格随注册商/首年促销波动，以结账页为准。

如果 `.ai` 结账时显示溢价/被保留，退而买：

- `getyardcanvas.com`（RDAP 404，可注册）
- `gethuemirror.com`（RDAP 404，可注册）

这两个 `.com` 已确认未被注册，但品牌前缀不如 `.ai` 干净。

## 3. 不要买

- `yardcanvas.com` / `huemirror.com`：已被注册，除非 aftermarket 价格很低，否则不值得；
- 拼写变体（`yardcanvass.com`、`huemirorr.com`）：容易被判仿冒，SEO 也差；
- 带连字符的 `.com`：口头传播差。

## 4. 注册商建议

- **Porkbun**：支持 `.ai`/`.co`，价格透明，免费 WHOIS 隐私，适合一次买齐；
- **Namecheap**：备选，界面成熟；
- **Cloudflare Registrar**：`.co`/`.com` 可考虑（按成本价），但 `.ai` 支持情况以页面为准；
- 避开首年极低价、续费翻倍的注册商。

## 5. 买完后的接入步骤

1. 域名 NS 改到 Cloudflare（两个站已在 Cloudflare）；
2. Workers 自定义域：
   - `yardcanvas.ai` → `paid-tools-landscape`
   - `huemirror.ai` → `paid-tools-haircolor`
3. `.co` / `get...com` 用 Cloudflare Redirect Rule 301 到主域；
4. 更新构建变量并重新部署：
   - `NEXT_PUBLIC_SITE_URL=https://yardcanvas.ai` / `https://huemirror.ai`
   - `SITE=landscape` / `SITE=haircolor`
5. 更新 Waffo：
   - product success URL
   - webhook URL（从 workers.dev 换成自定义域）
6. 开 Cloudflare Email Routing：
   - `support@yardcanvas.ai`、`support@huemirror.ai`
   - 替换当前 Gmail 支持邮箱
7. GSC 新增两个域名资源，提交 sitemap，观察 2 周。

## 6. 买前 5 分钟检查

- 注册商结账页确认 **非溢价**；
- 快速搜一下 `YardCanvas` / `HueMirror` 是否已有同类商标（USPTO/EUIPO/Google）；
- 确认续费价格，不只首年；
- 打开 WHOIS 隐私；
- 两个域名用同一个注册商/账号，方便管理。

## 实际落地（2026-11-21）

- 用户在 Dynadot 购买了 `getyardcanvas.com`、`gethuemirror.com`；
- Cloudflare zones 均已 active，NS：`felipe.ns.cloudflare.com`、`marjory.ns.cloudflare.com`；
- 已删除 Dynadot 导入的 3 条停放 A 记录；
- 已绑定 Workers 自定义域：
  - `getyardcanvas.com` / `www.getyardcanvas.com` → `paid-tools-landscape`
  - `gethuemirror.com` / `www.gethuemirror.com` → `paid-tools-haircolor`
- 两站 HTTPS 200；`www` 301 到主域；
- canonical 已指向新域名；
- Waffo product success URL 已改为 `/success`；
- Waffo webhook 已注册新域名：
  - `https://getyardcanvas.com/api/webhooks/waffo`
  - `https://gethuemirror.com/api/webhooks/waffo`
- `NEXT_PUBLIC_SITE_URL` Worker secrets 已更新为新域名；
- 仍待办：Cloudflare Email Routing（branded support 邮箱）、GSC 域名资源、R2 lifecycle 新前缀。
