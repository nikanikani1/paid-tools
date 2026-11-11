/**
 * OpenNext → Cloudflare Workers 配置（apps/headshot）
 *
 * 由 `npx opennextjs-cloudflare build` 读取；产物 `.open-next/` 交给 `wrangler deploy`。
 *
 * 注意（site-eng-deploy 2.3）：
 *   1. 不要开 cacheComponents / partialPrefetching（PPR 在 Workers 上请求 hang）；
 *   2. Prisma 用 PrismaNeonHttp + 懒创建；
 *   3. Linux 构建（Windows 产物 500）；
 *   4. Workers 免费档 10ms CPU 不够 Next SSR，必须 Paid $5/账号。
 */
// @opennextjs/cloudflare 由 Lead 统一 npm install（本任务不装依赖）。
// 它是 OpenNext CLI 的构建期依赖，不会被 Next/webpack 打进 runtime bundle；
// 安装前用 @ts-ignore 让 `next build` 的类型检查通过（安装后此行无害，可保留）。
// @ts-ignore -- 依赖未安装前的类型占位
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig();
