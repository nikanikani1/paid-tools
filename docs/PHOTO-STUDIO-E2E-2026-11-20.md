# Photo Studio E2E — 2026-11-20

两个新站：

- **YardCanvas** — `https://paid-tools-landscape.wanghaotiannika.workers.dev`
- **HueMirror** — `https://paid-tools-haircolor.wanghaotiannika.workers.dev`

同一套 `apps/photo-studio` 代码，分别用 `NEXT_PUBLIC_SITE_KIND=landscape|haircolor` 构建并部署。

## 1. 支付

Waffo live 产品：

| 站 | 产品 | 价格 | Product ID |
|---|---|---:|---|
| YardCanvas | Landscape Pack - 4 concepts | $9.00 | `PROD_0yGrNn5v6gAqB4n2Tfubw0` |
| HueMirror | Hair Colour Pack - 4 looks | $4.90 | `PROD_0oGWMDHYVxWuN6LqsEZfO2` |

- `GET /api/checkout` 两站返回正确 pack；
- `POST /api/checkout` 两站返回真实 Waffo URL（test-mode=false，金额正确）；
- 新 worker webhook 已注册（`testMode:false`）：
  - landscape `95c1065f-5fe7-44c6-8ced-c79108009b31`
  - haircolor `e91a15e0-aedc-401a-be6f-5be76f369657`

## 2. 真实生成 E2E

测试订单（手动标记 paid，仅测试，验后删除）：

| 站 | order | job | 输入 | 输出 |
|---|---|---|---|---|
| YardCanvas | `ord_mwoosn8z_w1yi5bq` | `landscape_mwopgq0a_pgs8lv` | Unsplash house/yard photo | 4 concept PNG |
| HueMirror | `ord_mwoot63q_ua6ps9o` | `haircolor_mwophpj1_1t68iu` | `creative-woman.jpg` | 4 look PNG |

结果：

- 两站均 `status=done`、`files=4`、`r2Stored=4`；
- 订单 `unitsUsed=4`、`remaining=0`，与 4 张交付一致；
- 输出格式 **PNG**（之前错误命名 `.jpg`，已修复）；
- Landscape 输出 **1248×832（3:2）**，不再被 1:1 裁掉房屋；
- Hair 输出 **1024×1024**，blonde 提示加强后发色明显、脸部保持；
- 输出 R2 key：
  - `landscape/out/2026-11-20/<job>/concept-N.png`
  - `haircolor/out/2026-11-20/<job>/look-N.png`

## 3. 线上验证

- 两站首页 200，title 分别为：
  - `AI Landscape Design from a Photo — YardCanvas`
  - `AI Hair Color Changer — Try a Shade on Your Selfie | HueMirror`
- `/pricing`、`/privacy`、`/terms`、`/refund`、`/orders`、`/sitemap.xml`、`/robots.txt` 构建成功；
- `/api/orders/status` 返回 paid + 额度；
- 无未签名 webhook 不接受（生产 503/401 分支）。

## 4. 已知缺口

1. **临时 workers.dev 域名**：还没买/绑定品牌域名；canonical/sitemap 目前是 worker URL。
2. **OG 图片**：页面有 OG 标签，但还没有 1200×630 品牌图。
3. **R2 lifecycle**：现有规则只覆盖 `voice/out/`、`headshot/out/`；`landscape/out/`、`haircolor/out/` 需要补 30 天规则。
4. **Legal/退款**：页面是 plain-language 草稿，未过律师；支持邮箱暂时用 Gmail，域名到位后换成品牌邮箱。
5. **真实支付 E2E**：两站只验证到真实 Waffo checkout 页面和测试订单生成，未用真实卡再付一笔（避免重复扣款）；上线首单需盯 webhook 200。
6. **测试数据**：上述两个测试订单/4 个 job/输出需在验收后清理。

## 5. Demo gallery added (2026-11-21)

- Homepage now opens with a **Before / After demo** before the upload tool:
  - YardCanvas: stock yard photo → Modern landscape concept; label “Demo — not a customer result”.
  - HueMirror: AI demo selfie → Warm blonde; same label.
- Assets: `apps/photo-studio/public/samples/landscape/*.jpg`, `.../hair/*.jpg`, optimized to 800–900 px JPEG.
- Source/licence note: [SAMPLES.md](<D:/ai-workspace/paid-tools/docs/SAMPLES.md>).
- Verified live: both homepages 200 and contain “Demo — not a customer result”; all six demo images 200.
