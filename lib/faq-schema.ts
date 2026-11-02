// Keeps FAQPage structured data in step with the visible FAQ after dashboard
// edits: the questions and answers are read from the page's own
//   <div class="qa"><button>Question <span class="pm">+</span></button><div class="ans">Answer</div></div>
// blocks (and from <details><summary> blocks, if a section uses those).

const strip = (s: string) =>
  s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();

export function faqFromHtml(html: string): { q: string; a: string }[] {
  const out: { q: string; a: string }[] = [];
  const qa = /<div class="qa[^"]*"[^>]*>\s*<button[^>]*>([\s\S]*?)<\/button>\s*<div class="ans"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
  let m: RegExpExecArray | null;
  while ((m = qa.exec(html))) {
    const q = strip(m[1]).replace(/\s*\+$/, "");
    const a = strip(m[2]);
    if (q && a) out.push({ q, a });
  }
  const details = /<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi;
  while ((m = details.exec(html))) {
    const q = strip(m[1]);
    const a = strip(m[2]);
    if (q && a) out.push({ q, a });
  }
  return out;
}

type Json = Record<string, unknown>;

/** Replaces the mainEntity of every FAQPage node in a JSON-LD string. */
export function syncFaqSchema(ld: string, html: string): string {
  if (!ld || !/FAQPage/.test(ld)) return ld;
  const faqs = faqFromHtml(html);
  let data: unknown;
  try {
    data = JSON.parse(ld);
  } catch {
    return ld;
  }
  const mainEntity = faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }));
  const visit = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(visit).filter((n) => n !== null);
    if (node && typeof node === "object") {
      const o = node as Json;
      if (o["@type"] === "FAQPage") return faqs.length ? { ...o, mainEntity } : null;
      const copy: Json = {};
      for (const [k, v] of Object.entries(o)) copy[k] = visit(v);
      return copy;
    }
    return node;
  };
  return JSON.stringify(visit(data));
}
