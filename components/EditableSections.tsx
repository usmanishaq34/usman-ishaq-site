import parse, { type DOMNode, Element } from "html-react-parser";
import { notFound } from "next/navigation";
import Island from "@/components/Island";
import { renderIsland, type IslandAttrs } from "@/components/islands";
import { faqFromHtml, syncFaqSchema } from "@/lib/faq-schema";
import { prisma } from "@/lib/db";
import { serviceIndex } from "@/content/services";
import { homeGraph } from "@/lib/structured-data";
import { getPageContent } from "@/lib/site-content";

/* Renders a dashboard-editable page. Each section is stored as HTML;
   placeholders <div data-dv-island="…"> are replaced by live, server-rendered
   React components (components/islands.tsx). Every section sits in a
   display:contents wrapper so the visual editor can map it back, without any
   effect on layout. */
export default async function EditableSections({ path }: { path: string }) {
  const doc = await getPageContent(path);
  if (!doc) notFound();
  const visible = doc.blocks.filter((b) => !b.hidden);

  // Render every island first (some read the database), then parse the HTML.
  const islandRe = /<div[^>]*data-dv-island="([a-z-]+)"[^>]*>/g;
  const jobs: Promise<[string, React.ReactNode]>[] = [];
  for (const b of visible) {
    for (const m of b.html.matchAll(islandRe)) {
      const tag = m[0];
      const attr = (n: string) => {
        const v = tag.match(new RegExp(`${n}="([^"]*)"`));
        return v ? decode(v[1]) : undefined;
      };
      const attrs: IslandAttrs = { heading: attr("data-heading"), intro: attr("data-intro") };
      const keyOf = `${b.id}:${m.index}`;
      jobs.push(renderIsland(m[1], attrs).then((node) => [keyOf, node]));
    }
  }
  const rendered = new Map(await Promise.all(jobs));

  const allHtml = visible.map((b) => b.html).join("");
  // The homepage graph is built in code (lib/structured-data.ts) so it always
  // matches the visible FAQ, the service list and the newest posts.
  const ld =
    path === "/"
      ? homeGraph({
          title: doc.seo.title,
          description: doc.seo.description,
          html: allHtml,
          faqs: faqFromHtml(allHtml),
          services: serviceIndex,
          latestPosts: await prisma.post
            .findMany({
              where: { published: true, noindex: false },
              orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
              take: 4,
              select: { slug: true, title: true },
            })
            .catch(() => []),
        })
      : doc.ld
        ? syncFaqSchema(doc.ld, allHtml)
        : "";

  return (
    <div data-dv-page={path} style={{ display: "contents" }}>
      {visible.map((b) => {
        let offset = 0;
        const positions = [...b.html.matchAll(islandRe)].map((m) => m.index ?? 0);
        return (
          <div key={b.id} data-dv-block={b.id} style={{ display: "contents" }}>
            {parse(b.html, {
              replace(node: DOMNode) {
                if (node instanceof Element && node.attribs["data-dv-island"]) {
                  const name = node.attribs["data-dv-island"];
                  const key = `${b.id}:${positions[offset++]}`;
                  const extra: Record<string, string> = {};
                  if (node.attribs["data-heading"]) extra["data-heading"] = node.attribs["data-heading"];
                  if (node.attribs["data-intro"]) extra["data-intro"] = node.attribs["data-intro"];
                  return (
                    <Island name={name} attrs={extra}>
                      {rendered.get(key) ?? null}
                    </Island>
                  );
                }
                return undefined;
              },
            })}
          </div>
        );
      })}
      {ld ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld.replace(/<\/script/gi, "<\\/script") }} /> : null}
    </div>
  );
}

function decode(s: string): string {
  return s.replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}
