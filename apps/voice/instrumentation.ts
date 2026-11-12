/**
 * Local network hardening: some Windows/Node setups resolve api.replicate.com
 * to IPv6 first and fail the connection (UND_ERR_CONNECT_TIMEOUT).
 * Force IPv4-first for the Node server only; Cloudflare Workers use fetch directly.
 *
 * `eval("require")` keeps the Node builtin out of the Edge bundle (instrumentation
 * is compiled for both runtimes).
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
