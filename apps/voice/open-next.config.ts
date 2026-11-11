/**
 * OpenNext → Cloudflare Workers 配置（apps/voice）
 *
 * 由 `npx opennextjs-cloudflare build` 读取；产物写到 `.open-next/`，
 * 再由 `wrangler deploy`（读 wrangler.jsonc）部署。
 *
 * 注意（site-eng-deploy 2.3，Workers 上实测炸过）：
 *   1. next.config.ts 里不能开 cacheComponents / partialPrefetching（PPR 会让请求 hang）；
 *   2. Prisma 必须用 PrismaNeonHttp + 懒创建（packages/core/prisma/README.md §3）；
 *   3. 必须在 Linux 构建（Windows 本地产物能上传但全 500），见 docs/CLOUDFLARE-DEPLOY.md；
 *   4. 免费档 10ms CPU 不够 Next SSR（官方：SSR 类 10–20ms），必须 Workers Paid $5/账号。
 *
 * 可选增强（付款后按需开）：R2 增量缓存
 *   import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
 *   export default defineCloudflareConfig({ incrementalCache: r2IncrementalCache });
 *   开了之后要在 wrangler.jsonc 里给 R2 binding（NEXT_INC_CACHE_R2_BUCKET）。
 */
// @opennextjs/cloudflare 由 Lead 统一 npm install（本任务不装依赖）。
// 它是 OpenNext CLI 的构建期依赖，不会被 Next/webpack 打进 runtime bundle；
// 安装前用 @ts-ignore 让 `next build` 的类型检查通过（安装后此行无害，可保留）。
// @ts-ignore -- 依赖未安装前的类型占位
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig();
