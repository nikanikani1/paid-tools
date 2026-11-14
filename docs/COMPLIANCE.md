# 合规与产品真实性对齐（P0，2026-11-14）

> 任务：task-24（安全/合规收敛）。目标是把隐私/条款/退款/安全头与**真实交付**对齐，把做不到的事列成「阻塞 / 需用户操作」，不写“已通过法务”。
> **本文件不是法律意见**；以下为产品与工程侧的事实盘点，法务审查项见 §8。
> 站点事实基线（2026-11-14）：A 站 `stemextractor.com`（品牌 StemSplit.ai，Worker `paid-tools-voice`）、B 站 `headshotsnap.com`（品牌 PortraitLab，Worker `paid-tools-headshot`）。两站已部署并返回 200；本任务**未部署**。

---

## 0. 状态总览（三栏）

### A. 已完成（本任务内已做）

| 项 | 证据/位置 |
|---|---|
| A 站 privacy / terms / refund 与真实交付对齐 | 4 个 MP3 320kbps stems（vocals/drums/bass/other）、30 天保留、7 天签名下载链接、无 WAV/6-stem 承诺、不虚构订阅可购 |
| B 站 privacy / terms / refund 与真实交付对齐 | 30 天保留、$9 Sample Pack 5 张为当前唯一在售、48h redo / 14 天退款、肖像权/未成年人/公众人物、删除入口 |
| 删除不可兑现承诺 | A：WAV、独立 instrumental、6 stems、batch upload、priority queue、月付/年付可立即购买的表述；B：团队订单可开票、40/60/100 已可购买 |
| 子处理方口径统一 | Cloudflare（托管/R2/Turnstile）、Replicate（demucs/face-swap）、fal（flux-pulid）、Neon、Waffo（MoR）、Resend |
| 训练声明口径收敛 | 只声明「我们不用你的文件训练模型」；不再声明「子处理方不会用于训练」这类无法核实的话 |
| B 站人脸数据同意/权利声明 | 两处：terms §2「上传即确认本人或获授权」+ privacy §5 撤回方式 |
| A 站版权/DMCA | terms 保留 DMCA 条款 + 30 天保留与删除提示；移除虚构的 Delaware 管辖表述 |
| 安全响应头落到代码 | 两站 `next.config.ts`：X-Content-Type-Options / Referrer-Policy / Permissions-Policy / X-Frame-Options；CSP 仅 report-only |
| 线上现状核查 | 两站当前 200 但**无**安全头（代码未部署）→ 见 §5 |

### B. 阻塞（本任务不能完成，需部署/后台/其他任务）

| 项 | 原因 | 解除条件 |
|---|---|---|
| 安全 headers 线上生效 | 本任务禁止 deploy | Lead 走 Workers Builds/CI 部署后，`curl -I` 见 §6 头即通过 |
| A 站营销页仍有 WAV/6-stem/priority/batch/订阅可购文案 | 不在 task-24 写作用域（`apps/voice/app/pricing`、`lib/seo.ts`、`app/api/jobs` 等；见 §7） | voice 站任务按 `docs/ACCEPTANCE-P0-P1.md` 修完 |
| B 站真实生成仍是 1 张/单（不是套餐张数） | 多图 fan-out 未完成（`docs/PROGRESS.md`） | B 站 fan-out 任务完成，否则 privacy/terms 中「5 张 Sample Pack」交付不成立 |
| 30 天删除的**执行**未验证 | R2 lifecycle 规则是否已配置/生效未在本任务核实（`docs/LAUNCH-CHECKLIST.md` 仍为未勾选项） | R2 控制台确认 lifecycle（`in/` 早删、`out/` 30 天）并用测试对象验证过期 |
| 退款流程可执行性 | 依赖 Waffo 后台退款权限与 live 商户 review 状态 | 用户确认 Waffo 商户后台可发起退款 |
| DMCA 指定代理（美国 safe harbor） | 需在美国 Copyright Office 登记 designated agent（付费登记） | 用户/律师决定是否登记 |
| 隐私页/条款的“数据控制者实体” | 运营主体名称/注册地未确认 | 用户提供实体信息后由律师定稿 |

### C. 需用户操作（账号/法务/邮箱）

| # | 事项 | 说明 |
|---|---|---|
| 1 | 确认运营主体（公司/个人）、注册地、管辖法律 | 两站 terms 目前用中性表述「按运营主体注册地法律」；需补实体名与地址 |
| 2 | 找律师审 privacy / terms / refund / DMCA | 本任务只做产品事实对齐；不声称已通过法务 |
| 3 | 决定是否登记 DMCA designated agent | 否则不能主张 DMCA safe harbor |
| 4 | GDPR/CCPA：是否需要 EU/UK 代表、隐私政策 cookie 同意（如加分析） | 当前无广告/分析 cookie，但 GA4 等一上线就触发 |
| 5 | 与子处理方签 DPA / 核对 transfer 机制 | Cloudflare/Replicate/fal/Neon/Waffo/Resend 各自 DPA 页面签或接受 |
| 6 | 商标检索与注册（StemSplit / PortraitLab / 域名） | 避免侵权与 UDRP |
| 7 | 退款政策条款可执行性（14 天/未使用分钟） | 与 Waffo 争议流程对齐 |
| 8 | 年龄/未成年人控制（当前仅文案禁止） | 是否要年龄门/自拍质量门拦截未成年人 |
| 9 | 保险/责任上限确认 | terms 已有责任上限，需律师确认可执行 |
| 10 | 数据删除 SLA 与人工流程（谁执行、多久） | privacy 写 30 天响应；需要值班邮箱与操作手册 |

---

## 1. 产品真实基线（法律文案必须以此为准）

### A 站 — StemSplit.ai（人声/伴奏分离）

| 项 | 事实 | 来源 |
|---|---|---|
| 输出 | **4 个 MP3 stem（320 kbps）**：vocals / drums / bass / other；**没有 WAV、没有独立 instrumental 文件、没有 6-stem** | `packages/core/src/providers/replicate.ts`（`output_format:"mp3"`、`mp3_bitrate:320`）；`docs/REAL-E2E.md` 实测 4 stems |
| 输入 | MP3/WAV/M4A/FLAC，≤100 MB，单曲 ≤10 分钟（服务端校验项见 ACCEPTANCE 清单） | `apps/voice/app/api/jobs/route.ts`、`ToolDemo.tsx` |
| 价格 | 当前唯一在售：$2.90 一次性 Trial Pack（15 分钟）；Starter/Pro/Annual 为规划项，未开售 | `docs/ACCEPTANCE-P0-P1.md`、`docs/WAFFO-PRODUCTS.md` |
| 计费 | 无免费额度；失败任务不扣分钟；成功启动扣分钟 | `apps/voice/app/api/jobs/route.ts` |
| 保留 | 输入/输出文件 **30 天**内删除；下载链接签名 7 天，可凭订单重新签发 | `packages/core/src/r2.ts`（`r2DownloadUrl` 默认 7 天） |
| 支付 | Waffo Merchant of Record（MoR），代扣税；商户订单记录存 R2（`orders/<site>/<orderId>.json`） | `docs/PAYMENT-R2-2026-11-12.md` |
| 模型 | Replicate `cjwbw/demucs`（htdemucs，MIT） | `docs/TECH-SELECTION-v1.md` §2 |

### B 站 — PortraitLab（AI 职业头像）

| 项 | 事实 | 来源 |
|---|---|---|
| 输出 | JPG 头像；$9 Sample Pack = **5 张**（当前真实模式每单只生成 1 张，fan-out 待完成 → §0-B） | `docs/PROGRESS.md`、`docs/PAYMENT-R2-2026-11-12.md` |
| 输入 | 3–8 张自拍，人脸质量门（单人脸/清晰度/角度/尺寸） | B 站 how-it-works / 代码 |
| 价格 | 当前唯一在售：$9 Sample Pack（5 张，一次性）；40/60/100 张套餐展示但未开售 | `docs/ACCEPTANCE-P0-P1.md` |
| 售后 | 48 小时内 1 次免费重做；14 天内符合条件退款 | 两站 refund 页 |
| 保留 | 原图/生成图 **交付后 30 天**删除，可提前申请 | B privacy §5/§8 |
| 支付 | Waffo MoR | `docs/PAYMENT-R2-2026-11-12.md` |
| 模型/许可 | fal `flux-pulid` + Replicate `cdingram/face-swap`；商用条款见 TECH-SELECTION §3.2（上线前需再核一次页面条款） | `docs/TECH-SELECTION-v1.md` §3.2 |

---

## 2. 数据地图（隐私页口径）

| 数据 | 用途 | 存储 | 保留 | 可见的子处理方 |
|---|---|---|---|---|
| A 站上传音频 | 仅本次分离 | R2（私有桶） | ≤30 天（可提前删） | Cloudflare R2、Replicate（推理期间） |
| A 站输出 stems | 交付下载 | R2 | ≤30 天 | Cloudflare R2 |
| B 站自拍原图 | 仅本单生成 | R2 | ≤30 天 | Cloudflare R2、fal、Replicate |
| B 站生成图 | 交付下载 | R2 | ≤30 天 | Cloudflare R2 |
| 任务/订单记录 | 状态、计费、对账 | R2 JSON（当前无 Neon 依赖） | 会计/反滥用需要期限内 | Cloudflare R2 |
| 支付数据 | 收款、发票、税 | Waffo（MoR） | Waffo 合同/税法 | Waffo |
| 邮件地址 | 交付/收据 | Resend + 订单记录 | 退订或删除请求 | Resend |
| 技术日志 | 安全/排错 | Cloudflare | 短期滚动 | Cloudflare |
| 人机校验 | 防刷 | Cloudflare Turnstile | 会话期 | Cloudflare |

> 注：仓库里同时存在 Neon/Prisma schema（`packages/core/prisma`），但当前线上订单/任务实际落 R2 JSON（`docs/PAYMENT-R2-2026-11-12.md`）。若后续切 Neon，隐私页的「Neon 存 job/order 记录」才成立；切换时需同步更新 privacy + 本表。

**跨境**：子处理方主要在美国/欧盟；privacy 页已写 SCC/等效机制。**训练**：只声明我方不训练；子处理方的模型使用/保留按其条款，不代其做承诺（本轮已删掉原 B privacy 中「不允许子处理方用于自身训练」这类无法核实的表述）。

---

## 3. 页面改动记录（本任务写作用域内）

### A 站（`apps/voice/app/{privacy,terms,refund}/page.tsx`）

- 保留期 24–48 小时 → **30 天**（与 R2 生命周期口径一致，见 §0-B 执行验证）。
- 明确输出「四个 MP3 stem（320 kbps）」；删除 WAV、独立 instrumental、6-stem、batch upload、priority queue 表述。
- 删除「Starter/Pro/Annual 现在即可购买/自动续费」的承诺；改为「仅结账按钮可用的套餐可购买，目前是 $2.90 Trial Pack」。
- 删除虚构的 Delaware 管辖表述；改为运营主体注册地中性表述。
- DMCA 条款保留并补充「文件 30 天内删除，通知须及时」。
- 训练声明收敛为「我方不用于训练」。
- 页脚保留「product copy，上线前应由合格律师审阅」声明（不声称已通过法务）。

### B 站（`apps/headshot/app/{privacy,terms,refund}/page.tsx`）

- privacy：删除「子处理方不得用于自身训练」等无法核实表述；补上传人权利声明与撤回方式；补下载链接时效说明。
- terms：明确当前仅 $9 Sample Pack 在售、40/60/100 为展示；删除「团队订单可开票」承诺；补上传即确认本人/授权的声明；补匿名照片投诉/删除入口。
- refund：明确「仅启用结账的套餐在售」；团队订单条款改为未来时；保留 48h redo / 14 天退款 / 30 天保留口径。
- B 站原本已对齐 30 天保留，本轮主要修「子处理方训练承诺」和「套餐可购性」。

---

## 4. 人脸与肖像（B 站，P0）

| 要求 | 现行文案/实现 | 状态 |
|---|---|---|
| 上传前明确同意/权利声明 | terms §2 段落 + privacy §5「上传即确认本人或获授权」 | ✅ 文案已做；UI 勾选框未做（见 §8 #4） |
| 不得上传他人/公众人物/未成年人 | terms §2 明确禁止；privacy §5 说明拒绝并删除 | ✅ |
| 删除入口 | privacy/terms/refund 均给 support@headshotsnap.com + 订单 ID；30 天自动删除 + 提前请求 | ✅ 文案；人工流程待建（§8 #10） |
| 不做虚假“已通过法务” | 两页均为 product copy；未写“legal approved” | ✅ |
| 人脸数据不用于训练 | 仅写“我方不用于训练”，不代子处理方承诺 | ✅（口径收敛） |
| 真实交付 5 张/单 | 当前真实模式 1 张 → 与 $9 Sample Pack 文案不符 | ⛔ 阻塞（B fan-out 任务） |

---

## 5. 安全头与传输安全

| 项 | 状态 | 说明 |
|---|---|---|
| `X-Content-Type-Options: nosniff` | 已写代码，**未部署** | 防止上传/下载 MIME 嗅探 |
| `Referrer-Policy: strict-origin-when-cross-origin` | 同上 | 避免把订单/签名 URL 泄漏给外链 |
| `Permissions-Policy` | 同上 | camera/mic/geolocation/payment/usb 全禁（产品不使用） |
| `X-Frame-Options: DENY` | 同上 | 防点击劫持 |
| `Content-Security-Policy-Report-Only` | 同上 | 先观察不强制；无 report endpoint（仅控制台） |
| 强制 CSP | ⛔ 未做 | 需要 Next nonce + report 端点；见 §8 #4 |
| TLS/HSTS | Cloudflare 已启用 TLS；HSTS 是否开启未核实 | 建议 Cloudflare SSL/TLS → Edge Certificates 开 HSTS（需确认 www/apex 与预加载策略） |
| R2 私有桶 + 签名 URL | 已用（7 天签名） | `packages/core/src/r2.ts` |
| 上传大小/时长限制 | 100 MB / 10 分钟（前端拦截 + 服务端 413） | `api/jobs/route.ts` |

**线上现状（2026-11-14 18:0x 抓取）**：`stemextractor.com` 与 `headshotsnap.com` 均 200，但响应头**没有**上述安全头 → 代码未部署（本任务禁止 deploy）。部署后用 §6 命令验证。

---

## 6. 验证命令（可复制，无密钥）

```bash
# 安全头（部署后应出现 x-content-type-options / referrer-policy / permissions-policy / x-frame-options / content-security-policy-report-only）
curl -sS -I https://stemextractor.com | grep -iE "^(HTTP|x-content-type|referrer-policy|permissions-policy|x-frame|content-security)"
curl -sS -I https://headshotsnap.com  | grep -iE "^(HTTP|x-content-type|referrer-policy|permissions-policy|x-frame|content-security)"

# 付费闸门未回归（无订单应 402）
curl -sS -o /dev/null -w "%{http_code}\n" -X POST https://stemextractor.com/api/jobs

# 法律页可访问且没有旧口径（应输出 0：24–48 小时 / WAV / 6 stems 的残留）
for p in privacy terms refund; do
  curl -sS "https://stemextractor.com/$p" | grep -icE "24.?48|WAV|6 stems|six stems|priority queue|batch upload" || true
  curl -sS "https://headshotsnap.com/$p"  | grep -icE "24.?48|WAV|6 stems|permitted any processor" || true
done

# 代码侧验收（本任务已跑）
npm run typecheck          # 0 error
npm run build:voice        # 0 error
npm run build:headshot     # 0 error
```

---

## 7. 仍未对齐的文案（不在 task-24 写作用域；交给对应站点任务）

按 `docs/ACCEPTANCE-P0-P1.md`「A 站不再承诺 WAV / 独立 instrumental / 6 stems / batch upload / priority queue」逐项 grep 的结果（2026-11-14）：

| 文件 | 残留承诺 | 建议 |
|---|---|---|
| `apps/voice/lib/seo.ts` | Offer schema 里写 `WAV + MP3`、`4 + 6 stems, priority queue` | 改为 4 MP3 stems；套餐未开售前不要输出 Offer |
| `apps/voice/app/api/jobs/route.ts` | 402 文案仍写 `4 stems (WAV + MP3)` | 改为 `4 MP3 stems` |
| `apps/voice/app/pricing/page.tsx` | 标题/FAQ/对比表写 Starter/Pro/Annual 可购、WAV、6 stems、batch、priority | 按 ACCEPTANCE 只展示 Trial 可购，其余标“coming” |
| `apps/voice/app/{acapella-maker,ai-vocal-remover,free-vocal-eliminator,vocal-remover-online,page}.tsx` | WAV / 6 stems / priority queue / 订阅可购 | 同上 |
| `apps/headshot/app/pricing|how-it-works|…` | 40/60/100 以在售口吻描述 | 与「仅 Sample Pack 在售」对齐 |
| B 站真实生成 | 1 张/单（不是 5 张） | fan-out 完成前，refund/terms 的 5 张承诺不成立 |

> task-24 只改了 6 个法律页；上表文件属于 voice/headshot 站点任务写作用域，未越界修改。若在未修复前就上线，法律页与营销页口径不一致，属 P0 风险。

---

## 8. 仍需要律师/用户操作的事项（按优先级）

1. **运营主体与管辖**：公司/个人实体名称、注册地址、适用法律、争议解决地；terms 中的实体信息目前为中性占位。
2. **律师审阅** privacy / terms / refund / DMCA（本任务只做产品事实对齐，不是法律意见；未声称“已通过法务”）。
3. **DMCA designated agent 登记**（美国 Copyright Office）：若要在美国主张 safe harbor，需登记并支付费用。
4. **CSP 强制执行与同意管理**：需要 Next nonce、report 端点；若加 GA4/广告，需要 cookie consent 与隐私政策更新。
5. **DPA / 跨境**：与 Cloudflare、Replicate、fal、Neon、Waffo、Resend 核对 DPA/SCC；确认 Waffo MoR 的税务与退款责任边界。
6. **人脸与未成年人**：是否加年龄门/上传勾选同意（UI 层）；未成年人图片拦截与删除流程。
7. **数据删除 SLA**：谁在什么时限执行删除、如何留痕（privacy 写 30 天响应，需要人工流程）。
8. **refund 可执行性**：Waffo 后台退款权限、live 商户 review 状态、14 天窗口与“未使用分钟”判定口径。
9. **商标**：StemSplit / PortraitLab 名称与域名（`stemextractor.com`/`headshotsnap.com`）的商标检索与注册。
10. **保险/责任**：terms 责任上限（12 个月已付或 $50）需律师确认可执行。
11. **数据保留与版权保全冲突**：30 天删除 vs DMCA 投诉取证；法务决定是否对投诉单延长保留并告知。

---

## 9. 结论

- 本任务把**法律页与真实产品**对齐了（4 MP3 stems、30 天保留、仅 Trial/Sample 在售、子处理方与训练声明口径），并加了**可回滚的安全头**（CSP 仅 report-only）。
- 但**不能宣称合规完成**：密钥尚未轮换、旧 Worker version 未删、30 天删除的 R2 lifecycle 未验证、B 站 5 张/单未实现、营销页残留旧承诺、法律实体与 DMCA agent 未定。
- P0 上线门槛（与本任务相关）：部署安全头 → 密钥轮换 + 删旧版本 → R2 lifecycle 验证 → 修营销页旧承诺 → 律师审阅。
