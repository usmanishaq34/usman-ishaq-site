// Builds content/services/<slug>.json from the Digital Vikingz service pages
// (the agency repo's content/pages/services--<slug>.json). The agency markup
// is flattened to plain headings, paragraphs, lists, tables and FAQ details,
// so the pages render in this site's article styles. Run from the site root:
//   node scripts/import-services.mjs
import fs from "node:fs";
import path from "node:path";

const AGENCY = process.env.AGENCY_DIR || path.resolve("..", "digital-vikingz-v2", "content", "pages");
const OUT = path.resolve("content", "services");
const CALENDLY = "https://calendly.com/usmanishaqsemanticseospecialist/30min";
const WHATSAPP = "https://wa.me/message/7CLDLUNQWRTTD1";

// Card title on the homepage -> agency slug
const services = [
  ["Semantic SEO Architecture", "semantic-seo-architecture"],
  ["Semantic Content Audit", "semantic-content-audit"],
  ["Website Design and Development", "website-development"],
  ["AI Search Visibility", "ai-search-visibility"],
  ["Semantic Content Production", "semantic-content-production"],
  ["Social Media Management", "social-media-management"],
  ["White-Label for Agencies", "white-label-semantic-seo"],
];

const decode = (s) => s.replace(/&#x27;/g, "'").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const text = (s) => decode(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());

// Removes every <div> except those whose class matches `keep`, together with
// the matching closing tags, by tracking nesting depth.
function unwrapDivs(html, keep) {
  const out = [];
  const stack = []; // true = kept div, false = removed div
  const re = /<div\b([^>]*)>|<\/div>/g;
  let last = 0;
  let m;
  while ((m = re.exec(html))) {
    out.push(html.slice(last, m.index));
    last = re.lastIndex;
    if (m[0] === "</div>") {
      if (stack.pop()) out.push("</div>");
      continue;
    }
    const cls = (m[1].match(/class="([^"]*)"/) || [])[1] || "";
    const kept = keep.test(cls.trim());
    stack.push(kept);
    if (kept) out.push(`<div class="${cls.trim()}">`);
  }
  out.push(html.slice(last));
  return out.join("");
}

function clean(html) {
  let h = html;
  h = h.replace(/<link[^>]*>/g, "");
  h = h.replace(/<svg[\s\S]*?<\/svg>/g, "");
  h = h.replace(/<figure[\s\S]*?<\/figure>/g, "");
  h = h.replace(/<img[^>]*>/g, "");
  h = h.replace(/<nav[\s\S]*?<\/nav>/g, "");
  h = h.replace(/<\/?section[^>]*>/g, "");
  // The self-check (checklist + count) keeps its three wrappers; every other
  // div is unwrapped. Closing tags are matched by walking the markup once.
  h = unwrapDivs(h, /^(selftest|stlist|stresult)$/);
  h = h.replace(/<article[^>]*>/g, '<div class="deliverable">').replace(/<\/article>/g, "</div>");
  // The agency pricing block ends with a results-page figure; without the
  // figure the heading and link make no sense here.
  h = h.replace(/<h3[^>]*>A client property from the results page<\/h3>\s*(<p>)?\s*<a href="\/results"[^>]*>All results<\/a>\s*(<\/p>)?/g, "");
  // Site data tokens
  h = h.replace(/\{\{contact\.calendly\}\}/g, CALENDLY).replace(/\{\{contact\.whatsapp\}\}/g, WHATSAPP).replace(/\{\{contact\.[a-zA-Z.]+\}\}/g, "https://digitalvikingz.com/");
  // Agency-internal links point at the agency site
  h = h.replace(/href="\/(?!\/)([^"]*)"/g, 'href="https://digitalvikingz.com/$1"');
  // Buttons in the site's own classes; every other class attribute goes
  h = h.replace(/class="btn ghost"/g, 'class="btn btn-ghost"').replace(/class="btn"/g, 'class="btn btn-primary"');
  h = h.replace(/ class="(?!btn|deliverable|selftest|stlist|stresult|stq)[^"]*"/g, "");
  h = h.replace(/ id="[^"]*"/g, "");
  return h.replace(/\s+/g, " ").replace(/> </g, "><").trim();
}

fs.mkdirSync(OUT, { recursive: true });
const index = [];
for (const [cardTitle, slug] of services) {
  const src = path.join(AGENCY, `services--${slug}.json`);
  const doc = JSON.parse(fs.readFileSync(src, "utf8"));
  const hero = doc.blocks.find((b) => /^Hero:/.test(b.label));
  const h1 = text((hero.html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || cardTitle);
  const standfirst = text((hero.html.match(/<p class="stand">([\s\S]*?)<\/p>/) || [])[1] || "");
  const sections = [];
  let cta = null;
  for (const b of doc.blocks) {
    if (b === hero) continue;
    if (/^Which industries and terms connect/.test(b.label)) continue;
    if (/^Talk through the scope/.test(b.label)) {
      const heading = text((b.html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [])[1] || "Talk through the scope");
      const p = text((b.html.match(/<p[^>]*>([\s\S]*?)<\/p>/) || [])[1] || "");
      cta = { heading, text: p };
      continue;
    }
    sections.push({ id: b.id, heading: b.label, html: clean(b.html) });
  }
  const out = {
    slug,
    cardTitle,
    title: doc.seo.title.replace(/\s*\|\s*Digital Vikingz\s*$/, ""),
    description: doc.seo.description,
    h1,
    standfirst,
    sections,
    cta,
    source: `https://digitalvikingz.com${doc.path}`,
  };
  fs.writeFileSync(path.join(OUT, `${slug}.json`), JSON.stringify(out, null, 1) + "\n");
  index.push({ slug, cardTitle, title: out.title, description: out.description });
  console.log(`${slug}: ${sections.length} sections, ${Math.round(JSON.stringify(out).length / 1024)} KB`);
}
fs.writeFileSync(
  path.join(OUT, "index.ts"),
  `// Generated by scripts/import-services.mjs. One entry per service page.\nexport type ServiceSummary = { slug: string; cardTitle: string; title: string; description: string };\nexport const serviceIndex: ServiceSummary[] = ${JSON.stringify(index, null, 2)};\nexport const serviceLoaders: Record<string, () => Promise<{ default: unknown }>> = {\n${index.map((s) => `  "${s.slug}": () => import("./${s.slug}.json"),`).join("\n")}\n};\n`,
);
console.log(`index: ${index.length} services`);
