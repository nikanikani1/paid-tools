# 真实 AI E2E 验证（2026-11-12）

> 目标：证明两站真实 provider 链路可用，不只是 mock。
> 环境：本地 Next dev + `ALLOW_REAL=1` + `REPLICATE_API_TOKEN`；输出 URL 为 Replicate 临时地址（约 1 小时），生产需转存 R2。

## A 站：人声分离（cjwbw/demucs）

| 项 | 结果 |
|---|---|
| 输入 | 3 秒测试 WAV（440Hz + 660Hz 合成，264,644 bytes） |
| 上传 | Replicate Files API → 201 |
| 模型版本 | `25a173108cff36ef9f80f854c162d01df9e6528be175794b81158fa03836d953`（cjwbw/demucs latest） |
| prediction | `q872rmtgt1rge0d1sqt9esaa60` |
| 结果 | **succeeded**，4 stems：vocals / drums / bass / other（guitar/piano 为 null） |
| 耗时 | create 15s（含上传/版本查询）；GET 首次轮询 1s 内 done；predict_time **3.22s**（另一次冷启动 6.86s） |
| App 层 | `POST /api/jobs` multipart → 201，job id `voice_mwd16u35_8kkcts`；`GET /api/jobs/{id}` → done，4 个文件 |
| 下载 | vocals.mp3 320kbps 44.1kHz stereo，121,208 bytes，HTTP 200 |
| 成本估算 | 3 秒约 $0.0008；3 分钟约 **$0.014**（与选型一致） |

## B 站：AI 头像（flux-kontext-pro + cdingram/face-swap）

| 项 | 结果 |
|---|---|
| 输入 | 3 张测试自拍（同一张 Unsplash 人像 ×3，用于满足 ≥3 张校验） |
| Stage 1 | `black-forest-labs/flux-kontext-pro` → 职业头像；predict_time **6.01s** |
| Stage 2 | `cdingram/face-swap`（target=Kontext 输出，swap=原自拍）→ 最终图；predict_time **7.97s** |
| 结果 | **succeeded**，1 张 1024×1024 JPEG，199,290 bytes，HTTP 200 |
| App 层 | `POST /api/orders` multipart → 201，order id `headshot_mwd1c2rl_r49mlv`；轮询 5 次 → done |
| 成本 | $0.04 + $0.013 = **$0.053/张**；40/60/100 张 = **$2.12 / $3.18 / $5.30** |
| 说明 | 本地 `testMode` 只生成 1 张（验证链路）；生产按套餐张数并发 fan-out |

## 数据库

- 复用现有 Neon 项目，在同一库创建两个 schema：**`paid_voice` / `paid_headshot`**。
- `prisma db push` 成功（两 schema 均 sync），表：Job / Order / Credit / WebhookEvent。
- 连接串已写入 `.env.local` 的 `DATABASE_URL_VOICE` / `DATABASE_URL_HEADSHOT`（不提交）。
- 如需严格独立项目，后续可迁到两个 Neon project；schema 结构不变。

## 还缺什么（阻塞上线，不阻塞开发）

| 缺项 | 用途 | 谁提供 |
|---|---|---|
| **域名** | Custom Domain / canonical / GSC | 用户：买了哪个？在哪个注册商/NS？ |
| **Cloudflare API Token** | Workers 部署 + R2 管理 | 用户：Workers Scripts:Edit + R2:Edit + Zone:Read/DNS:Edit |
| **R2 S3 keys + bucket** | 文件持久化（替换 Replicate 临时 URL） | 用户：R2 API Token（Access Key/Secret）+ bucket 名 |
| **Waffo 产品 ID** | 8 个套餐（A 4 + B 4）真实 checkout | 用户：Waffo 后台创建，或给 API 文档/权限 |
| **支付联调** | 402 → checkout → webhook → 发额度 | Lead（拿到产品 ID 后） |

## 代码状态

- 真实 provider：`packages/core/src/providers/replicate.ts`（version API + Files upload + 轮询）。
- A：`/api/jobs` 支持 multipart，`/api/jobs/[id]` 轮询 demucs，返回 stems。
- B：`/api/orders` 支持 multipart，`/api/orders/[id]` 两阶段（Kontext → face-swap）。
- 生产仍 402；`ALLOW_REAL`/`ALLOW_MOCK` 仅本地联调，**不能**在生产 Worker 常开。
- 2026-11-12 起 B 不再需要 fal；一个 Replicate token 跑两站。
