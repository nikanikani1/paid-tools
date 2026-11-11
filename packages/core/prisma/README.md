# packages/core/prisma — 共享 schema 与迁移说明

两站共用 `schema.prisma` 的表结构，但**各自一个 Neon 项目（库）**：
`voice` 库、`headshot` 库分别跑同一份迁移，数据隔离，Neon 免费额度按项目算。

表：`Job`（AI 任务状态机 + 成本）、`Order`（Waffo 支付单）、`Credit`（额度流水）、`WebhookEvent`（webhook 幂等收件箱）。

---

## 0. 前置（Lead 统一装依赖，本任务未执行 npm install）

```bash
# 仓库根目录
npm i -w @paid/core @prisma/client@6.19.3 @prisma/adapter-neon@6.19.3
npm i -D -w @paid/core prisma@6.19.3
```

> 版本锁 6.x 是 `site-eng-stack` 基线（Prisma 6 + Neon）。2026-11 的 npm `latest` 已经是 Prisma 7/8-rc，**不要**装 latest。

## 1. 生成 client（两站共用一份生成物，或每 app 各生成一份）

```bash
npx prisma generate --schema packages/core/prisma/schema.prisma
```

`generator client` 带 `previewFeatures = ["driverAdapters"]`（Workers 必须用 driver adapter）。
如果安装的 Prisma 6.19 已把 driver adapters 转正、generate 提示可删除时，删掉该行即可。

## 2. 建库 / 迁移

Windows PowerShell 先设连接串（**必须 Neon pooler**，`site-eng-accounts` 要求）：

```powershell
$env:DATABASE_URL = "postgresql://USER:PASS@ep-xxxx-pooler.c-14.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connection_limit=1"
```

```bash
# 开发期（会生成 migration 文件，提交到仓库）
npx prisma migrate dev --schema packages/core/prisma/schema.prisma --name init

# 生产 / CI / Workers Builds（只应用已有 migration，不生成）
npx prisma migrate deploy --schema packages/core/prisma/schema.prisma

# 仅临时联调（不产生 migration，会直接改库；不要用于生产）
npx prisma db push --schema packages/core/prisma/schema.prisma

# 查看/回滚辅助
npx prisma migrate status --schema packages/core/prisma/schema.prisma
```

**每站各跑一次 `migrate deploy`**：`DATABASE_URL` 换成 voice 库 → 部署；再换 headshot 库 → 部署。
两个库 schema 版本保持一致，升级时同时 deploy。

> Neon 免费档 100 CU-hrs/月 + 1GB/项目；用 `migrate dev` 在 Neon 上建 shadow database 可能受额度影响，
> 建议开发期用 Neon 免费分支（branch）或本地 Postgres，生产只跑 `migrate deploy`。

## 3. Workers 运行时接入（PrismaNeonHttp，必须懒创建）

`site-eng-stack` 3.2/3.3 实测结论，照抄：

```ts
// packages/core/src/db.ts（TODO：待依赖装好后新增并导出；当前任务未包含运行时 client）
import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

let client: PrismaClient | undefined;

export function getPrisma(): PrismaClient {
  if (client) return client;
  const url = process.env.DATABASE_URL ?? "";
  if (!url) throw new Error("DATABASE_URL missing");
  client = new PrismaClient({ adapter: new PrismaNeonHttp(url, {}) });
  return client;
}
```

- **不能用** `PrismaNeon`（WebSocket Pool）→ Workers 请求会挂住；
- **不能**在模块顶层建 client → 请求挂住；
- **没有事务**（HTTP 模式）：`upsert` 会报 `Transactions are not supported in HTTP mode`，
  所有写操作改成「唯一键 + 先查后建 / catch 冲突」的幂等写：

```ts
// webhook 幂等示例（对应 WebhookEvent.idempotencyKey 唯一键）
const key = `waffo:${eventId}`;
const hit = await prisma.webhookEvent.findUnique({ where: { idempotencyKey: key } });
if (hit) return { duplicate: true };
await prisma.webhookEvent.create({ data: { ... } }).catch(() => {});
```

## 4. 本地开发（可选）

`site-eng-stack` 建议本地用 SQLite 第二 schema（`schema.sqlite.prisma`）。
注意 SQLite 不支持 `Json`/`Decimal` 的完全等价语义（Prisma 可用 `String`/`Float` 近似），
本仓库暂未建 sqlite schema；本地联调优先连 Neon 免费分支，真要走 sqlite 时按 skill 再补一份并对齐字段。

## 5. 与 core 代码的约定

- `Job.providerCostUsd` = `cost.ts` 里 `recordJobCost()` 的累加值；明细写 `Job.meta.costRecords`。
- `Credit` 是 append-only 流水：余额 = `SUM(delta)`；`balance` 只是快照。
- `Order.providerOrderId` 唯一；webhook 用 `metadata.orderId` 或它回查订单。
- 所有金额用**美分整数**（`amountCents`），成本用 `Decimal(12,6)` 美元。
