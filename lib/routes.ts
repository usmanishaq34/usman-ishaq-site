// Pages the dashboard can edit. The homepage has editable sections and SEO;
// the blog index and the service pages have editable SEO (their body comes
// from the dashboard's posts and from content/services respectively).

import { serviceIndex } from "@/content/services";

export type RouteKind = "core" | "service";

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
      "Usman Ishaq is a semantic SEO strategist and consultant. Semantic SEO and AI search visibility that get businesses found on Google and recommended by ChatGPT.",
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
  {
    path: "/case-studies",
    label: "Case studies",
    title: "Semantic SEO Case Studies | Usman Ishaq",
    description:
      "Anonymised semantic SEO and AI search case studies: the work in order, with Search Console and AI citation results, by business type.",
    kind: "core",
    priority: 0.8,
  },
  ...serviceIndex.map(
    (s): Route => ({
      path: `/services/${s.slug}`,
      label: s.cardTitle,
      title: `${s.title} | Usman Ishaq`,
      description: s.description,
      kind: "service",
      priority: 0.8,
    }),
  ),
];

export const byPath = new Map(routes.map((r) => [r.path, r]));

export function route(path: string): Route {
  const r = byPath.get(path);
  if (!r) throw new Error(`Unknown route: ${path}`);
  return r;
}
