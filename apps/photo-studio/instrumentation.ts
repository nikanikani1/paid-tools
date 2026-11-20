/**
 * Local network hardening: see apps/voice/instrumentation.ts.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const req = eval("require") as (id: string) => { setDefaultResultOrder?: (order: string) => void };
    req("node:dns").setDefaultResultOrder?.("ipv4first");
  } catch {
    // ignore — runtime without node:dns
  }
}
