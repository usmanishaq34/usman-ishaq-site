// Copies every image the site still loads from the old WordPress install
// (https://usmanishaq.com/wp-content/uploads/...) into public/images/legacy
// and rewrites the references in the section components to the local path.
// Needed before the domain moves: once usmanishaq.com points at Vercel the
// WordPress files are no longer reachable at that address. Run once:
//   node scripts/migrate-legacy-images.mjs
import fs from "node:fs";
import path from "node:path";

const FILES = ["components/sections/Logos.jsx", "components/sections/Portfolio.jsx"];
const OUT = path.resolve("public", "images", "legacy");
const RE = /https:\/\/usmanishaq\.com\/wp-content\/uploads\/([^"' )]+)/g;

fs.mkdirSync(OUT, { recursive: true });

const sources = new Map(); // remote URL as written -> local public path
for (const f of FILES) {
  const text = fs.readFileSync(f, "utf8");
  for (const m of text.matchAll(RE)) {
    const rel = m[1]; // e.g. 2025/01/image12.png, may contain %E2%80%93 or – escapes
    const decoded = decodeURIComponent(rel.replace(/\\u2013/g, "–"));
    const name = decoded.replace(/\//g, "-").replace(/[^\w.-]+/g, "-").replace(/-+/g, "-");
    sources.set(m[0], { fetchUrl: "https://usmanishaq.com/wp-content/uploads/" + encodeURI(decoded), local: `/images/legacy/${name}` });
  }
}

let ok = 0, failed = [];
for (const [, s] of sources) {
  const dest = path.join(OUT, path.basename(s.local));
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) { ok++; continue; }
  const res = await fetch(s.fetchUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) { failed.push(`${res.status} ${s.fetchUrl}`); continue; }
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  ok++;
}

for (const f of FILES) {
  let text = fs.readFileSync(f, "utf8");
  for (const [remote, s] of sources) text = text.split(remote).join(s.local);
  fs.writeFileSync(f, text);
}

const total = [...fs.readdirSync(OUT)].reduce((n, x) => n + fs.statSync(path.join(OUT, x)).size, 0);
console.log(`images: ${sources.size} referenced, ${ok} saved, ${failed.length} failed; folder ${Math.round(total / 1024 / 1024 * 10) / 10} MB`);
failed.forEach((x) => console.log("  FAILED", x));
