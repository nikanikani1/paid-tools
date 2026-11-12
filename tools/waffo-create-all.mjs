import fs from "node:fs";
import crypto from "node:crypto";
import { fetch as undiciFetch } from "undici";

const env = {};
for (const line of fs.readFileSync("D:/ai-workspace/waffo-env.txt", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}
const merchantId = env.WAFFO_MERCHANT_ID;
const storeId = env.WAFFO_STORE_ID;
const privateKey = Buffer.from(env.WAFFO_PRIVATE_KEY, "base64").toString("utf8");

function sign(path, bodyJson) {
  const ts = Math.floor(Date.now() / 1000).toString();
  const bodyHash = crypto.createHash("sha256").update(bodyJson).digest("base64");
  const canonical = `POST\n${path}\n${ts}\n${bodyHash}`;
  const signature = crypto.sign("RSA-SHA256", Buffer.from(canonical), privateKey).toString("base64");
  return {
    "X-Merchant-Id": merchantId,
    "X-Timestamp": ts,
    "X-Signature": signature,
    "Content-Type": "application/json",
  };
}

async function create(path, body) {
  const bodyJson = JSON.stringify(body);
  const res = await undiciFetch(`https://api.waffo.ai${path}`, {
    method: "POST",
    headers: sign(path, bodyJson),
    body: bodyJson,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${path} ${res.status}: ${JSON.stringify(json).slice(0, 400)}`);
  return json.data.product;
}

const oneTimePath = "/v1/actions/onetime-product/create-product";
const subPath = "/v1/actions/subscription-product/create-product";
const success = "https://stemextractor.com/success";

const oneTime = [
  ["headshot-trial", "PortraitLab Sample Pack - 5 headshots", "9.00", "headshot", "5"],
  ["headshot-40", "PortraitLab Starter - 40 headshots", "35.00", "headshot", "40"],
  ["headshot-60", "PortraitLab Professional - 60 headshots", "45.00", "headshot", "60"],
  ["headshot-100", "PortraitLab Executive - 100 headshots", "75.00", "headshot", "100"],
];
const subs = [
  ["voice-starter", "StemSplit Starter - 90 min/month", "5.00", "monthly", "90"],
  ["voice-pro", "StemSplit Pro - 200 min/month", "9.00", "monthly", "200"],
  ["voice-annual", "StemSplit Starter Annual - 90 min/month", "39.00", "yearly", "90"],
];

const out = {};
for (const [planId, name, amount, site, images] of oneTime) {
  const p = await create(oneTimePath, {
    storeId,
    name,
    description: `${name}. One-time payment, no subscription.`,
    prices: { USD: { amount, taxIncluded: false, taxCategory: "digital_goods" } },
    successUrl: success,
    metadata: { site, planId, images },
  });
  out[planId] = p.id;
  console.log("created", planId, p.id);
  await new Promise((r) => setTimeout(r, 500));
}
for (const [planId, name, amount, period, minutes] of subs) {
  const p = await create(subPath, {
    storeId,
    name,
    billingPeriod: period,
    description: `${name}. Cancel anytime.`,
    prices: { USD: { amount, taxIncluded: false, taxCategory: "saas" } },
    successUrl: success,
    metadata: { site: "voice", planId, minutes },
  });
  out[planId] = p.id;
  console.log("created", planId, p.id);
  await new Promise((r) => setTimeout(r, 500));
}
fs.writeFileSync("tools/waffo-product-ids.json", JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
