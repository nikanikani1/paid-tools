import fs from "node:fs";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
const repo = "D:/ai-workspace/paid-tools";
const env = {};
for (const line of fs.readFileSync(`${repo}/.env.local`, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2];
}
const merchantId = env.WAFFO_MERCHANT_ID;
const privateKey = Buffer.from(env.WAFFO_PRIVATE_KEY, "base64").toString("utf8");
function headers(path, body) {
  const ts = Math.floor(Date.now() / 1000).toString();
  const bh = crypto.createHash("sha256").update(body).digest("base64");
  const canonical = `POST\n${path}\n${ts}\n${bh}`;
  return [
    "-H", `X-Merchant-Id: ${merchantId}`,
    "-H", `X-Timestamp: ${ts}`,
    "-H", `X-Signature: ${crypto.sign("RSA-SHA256", Buffer.from(canonical), privateKey).toString("base64")}`,
    "-H", "Content-Type: application/json",
  ];
}
function post(path, body) {
  const args = ["-s", "-x", "http://127.0.0.1:7897", "-X", "POST", `https://api.waffo.ai${path}`, ...headers(path, body), "--data-binary", "@-"];
  const r = spawnSync("curl", args, { input: body, encoding: "utf8" });
  if (r.status !== 0) throw new Error(r.stderr || "curl failed");
  return r.stdout;
}
async function create(body) {
  const path = "/v1/actions/onetime-product/create-product";
  const raw = JSON.stringify(body);
  const text = post(path, raw);
  let json;
  try { json = JSON.parse(text); } catch { throw new Error(text.slice(0, 800)); }
  if (json.errors) throw new Error(JSON.stringify(json.errors).slice(0, 800));
  return json.data.product;
}
const products = [
  {
    key: "WAFFO_PRODUCT_ID_LANDSCAPE_PACK",
    name: "YardCanvas Landscape Pack - 4 concepts",
    site: "landscape",
    planId: "landscape-pack",
    amount: "9.00",
    successUrl: "https://paid-tools-landscape.wanghaotiannika.workers.dev/success",
  },
  {
    key: "WAFFO_PRODUCT_ID_HAIR_PACK",
    name: "HueMirror Hair Colour Pack - 4 looks",
    site: "haircolor",
    planId: "hair-pack",
    amount: "4.90",
    successUrl: "https://paid-tools-haircolor.wanghaotiannika.workers.dev/success",
  },
];
const out = {};
for (const p of products) {
  const product = await create({
    storeId: env.WAFFO_STORE_ID,
    name: p.name,
    description: `${p.name}. One-time payment, no subscription.`,
    prices: { USD: { amount: p.amount, taxIncluded: false, taxCategory: "digital_goods" } },
    successUrl: p.successUrl,
    metadata: { site: p.site, planId: p.planId },
  });
  out[p.key] = product.id;
  console.log("created", p.planId, product.id);
  await new Promise((r) => setTimeout(r, 500));
}
fs.writeFileSync(`${repo}/.tmp/photo-product-ids.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
