import { fetch as undiciFetch, ProxyAgent } from "undici";

const dispatcher = new ProxyAgent("http://127.0.0.1:7897");
const SITES = ["https://stemextractor.com", "https://headshotsnap.com"];
const issues = [];
const notes = [];

async function get(url, opts = {}) {
  const res = await undiciFetch(url, { ...opts, dispatcher, redirect: "follow" });
  const text = await res.text();
  return { res, text };
}

function attr(html, re) {
  const m = html.match(re);
  return m ? m[1] : null;
}

for (const base of SITES) {
  console.log("\n=====", base);
  const { res: smRes, text: sm } = await get(`${base}/sitemap.xml`);
  if (smRes.status !== 200) issues.push(`${base}/sitemap.xml -> ${smRes.status}`);
  const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  console.log("sitemap", smRes.status, "urls", urls.length);
  const allLinks = new Set();

  for (const url of urls) {
    const { res, text } = await get(url);
    const path = url.replace(base, "") || "/";
    const h1 = (text.match(/<h1[\s>]/g) || []).length;
    const title = attr(text, /<title>([^<]*)<\/title>/);
    const canonical = attr(text, /<link rel="canonical" href="([^"]+)"/);
    const imgs = [...text.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]);
    const audios = [...text.matchAll(/<audio[^>]+src="([^"]+)"/g)].map((m) => m[1]);
    const hrefs = [...text.matchAll(/<a[^>]+href="([^"]+)"/g)].map((m) => m[1]);
    hrefs.filter((h) => h.startsWith("/")).forEach((h) => allLinks.add(h));
    if (res.status !== 200) issues.push(`${url} -> ${res.status}`);
    if (h1 !== 1) issues.push(`${url} H1 count=${h1}`);
    if (!title) issues.push(`${url} missing title`);
    if (!canonical) issues.push(`${url} missing canonical`);
    else if (!canonical.startsWith(base)) issues.push(`${url} canonical=${canonical}`);
    for (const src of [...imgs, ...audios]) {
      const abs = new URL(src, base).href;
      const r = await get(abs, { method: "GET" });
      if (r.res.status !== 200) issues.push(`${url} asset ${abs} -> ${r.res.status}`);
      if (imgs.includes(src) && !/^https?:/.test(src) && r.res.headers.get("content-type")?.includes("image") === false) {
        issues.push(`${url} image content-type=${r.res.headers.get("content-type")} ${src}`);
      }
    }
    console.log("page", path, res.status, "h1", h1, "imgs", imgs.length, "audio", audios.length);
  }

  for (const path of allLinks) {
    const u = new URL(path, base).href;
    const r = await get(u, { method: "GET" });
    if (r.res.status >= 400) issues.push(`broken internal link ${u} -> ${r.res.status}`);
  }
  for (const path of ["/robots.txt", "/nonexistent-page-xyz", "/api/version"]) {
    const r = await get(`${base}${path}`);
    notes.push(`${base}${path} -> ${r.res.status}`);
    if (path === "/robots.txt" && r.res.status !== 200) issues.push(`${base}/robots.txt -> ${r.res.status}`);
    if (path === "/api/version" && r.res.status !== 200) issues.push(`${base}/api/version -> ${r.res.status}`);
  }
  // www redirect
  const www = await get(`https://www.${new URL(base).hostname}/`);
  notes.push(`www ${base} -> ${www.res.status} ${www.res.url}`);
  if (www.res.status !== 200 || !www.res.url.startsWith(base)) issues.push(`www redirect wrong ${www.res.status} ${www.res.url}`);
}

console.log("\nISSUES", issues.length);
issues.forEach((i) => console.log(" -", i));
console.log("\nNOTES");
notes.forEach((n) => console.log(" -", n));
