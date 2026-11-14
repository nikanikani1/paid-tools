import { NextResponse } from "next/server";
import { isR2Configured } from "@paid/core";

/**
 * GET /api/health — 只读健康检查（task-27）。
 *
 * 与 /api/version 的区别：version 只报版本/部署信息；health 额外报依赖是否就绪（R2），
 * 供外部 uptime 探针（UptimeRobot / GitHub Actions monitor）一眼判断「能不能干活」。
 *
 * 约束：
 *  - 只读：不写 R2、不查数据库、不发起外部调用
 *  - 不返回任何密钥/内部路径，只返回布尔与版本号
 *  - 200 = 服务进程正常（即使 R2 未配置；R2 状态在 checks.r2 里如实体现）
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const proc = (globalThis as unknown as { process?: { version?: string } }).process;
  const r2 = isR2Configured();
  return NextResponse.json(
    {
      service: "headshot",
      status: "ok",
      commit: process.env.GIT_COMMIT ?? process.env.CF_PAGES_COMMIT_SHA ?? "dev",
      runtime: proc?.version ?? "edge",
      time: new Date().toISOString(),
      checks: {
        r2,
        eventsStore: r2 ? "r2" : "stdout-fallback",
      },
    },
    { headers: { "cache-control": "no-store" } },
  );
}
