// Pages the dashboard can edit. The homepage has editable sections and SEO;
// the blog index has editable SEO (its posts come from the dashboard).

export type RouteKind = "core";

export type Route = {
  path: string;
  label: string;
  title: string;
  description: string;
  kind: RouteKind;
  priority: number;
};

export const routes: Route[] = [
  {
    path: "/",
    label: "Homepage",
    title: "Usman Ishaq | Semantic SEO Strategist for Trade and Service Businesses",
    description:
      "Usman Ishaq is a semantic SEO strategist and founder of Digital Vikingz. Topical maps, semantic content, schema and websites built as systems for businesses in the USA, UK, Canada, Australia, UAE and Germany.",
    kind: "core",
    priority: 1,
  },
  {
    path: "/blog",
    label: "Blog",
    title: "Blog | Usman Ishaq, Semantic SEO Strategist",
    description: "Plain-language articles on semantic SEO, content networks and AI search. Written from real projects, not theory.",
    kind: "core",
    priority: 0.8,
  },
];

export const byPath = new Map(routes.map((r) => [r.path, r]));

export function route(path: string): Route {
  const r = byPath.get(path);
  if (!r) throw new Error(`Unknown route: ${path}`);
  return r;
}
