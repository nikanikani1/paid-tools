# Homepage design research — 2026-11-21

对比站点（仅参考结构，不复制文案/资产）：

- **mnml.ai** — hero 大标题 + “Get started free” + 2.5M 注册/高校/公司 logo 社会证明；把 “single room → whole site” 的场景铺开。
- **Neighborbrite** — 首屏 “Transform your yard with AI”，下方直接是上传/风格/结果三步；4.8/5、567 ratings、850K+ community、20M+ designs；社区案例横向画廊。
- **DreamzAR** — “AI transformed in 30 seconds”、38+ styles、4.8 rating、10,000+ yards；上传/风格/生成/chat refine 四步。
- **Hairstyle AI** — 首屏就是上传框 + 性别/发型选择，工具优先，没有长营销页。
- **RightHair** — “Upload Image / or Drop your Image here” 在首屏，200+ hairstyles、50K+ users、24h 删除隐私承诺。

## 可借鉴的共同点

1. **第一屏必须有结果画面**，不是纯文字。
2. **上传动作尽量靠前**，或至少有一个明确的 “Try with your photo” 按钮。
3. **Before/After 或社区画廊** 比抽象功能列表更有说服力。
4. **3 步流程** 降低理解成本。
5. **价格/信任信息紧贴 CTA**（free/one-time、隐私、无订阅）。
6. **移动端固定 CTA**，避免用户滚到下面找不到入口。
7. 社会证明（用户数/评分/logo）有效，但**没有真实数据不能编**。

## 我们实际改了什么

- 首页 Demo 从静态两张图改为 **可拖拽 Before/After 对比**（range input，键盘/触摸可用）。
- Demo 左侧加入主 CTA：`Try with your photo — $9 / $4.90`，次 CTA `What's included`。
- 加信任行：`One-time payment` / `4 results` / `No subscription`（全部真实）。
- 移动端加固定底部 CTA，滚动时仍能回到工具。
- 保持明确免责声明：`Demo — not a customer result`，不伪造客户案例/评分/用户数。
- 保留 Demo 缩略图与 “4 per run”，让用户知道一次会得到四张，而不是一张。

## 没采用

- 假评分 / 假用户数 / 假 logo：没有真实数据，不能上。
- “Free trial”：产品是付费生成，不能为了转化写免费。
- 复杂社区/登录：当前 MVP 不提供账号体系，先不假装有。

## 老站同步（2026-11-21）

- **StemSplit.ai**：首屏新增 “Hear a real 4-stem separation” 跳转；移动端固定 `$2.90 Trial Pack` CTA。音频演示仍由 StemPlayer/StemGrid 承担（不是图片 before/after）。
- **PortraitLab**：首屏表单下方新增 3 张 AI sample 缩略图 + “See gallery”；移动端固定 `$9 Sample Pack` CTA；示例区加 `#samples` 锚点。
- 两站继续保留 “AI sample / not customer photos” 标注。
