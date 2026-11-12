import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { routes } from "@/lib/routes";
import { canonicalToAgency } from "@/content/services/canonical";
import { CASE_STUDIES } from "@/lib/case-studies";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://usmanishaq.com";

// The site's pages plus every published post. Rebuilt at most once an hour,
// and on demand when a post is saved in the dashboard.
export const revalidate = 3600;

// lastmod is given only where a real change date exists: the homepage's last
// dashboard edit, the newest post for the blog index, and each post's own
// update time. Service pages ship in code and carry no lastmod, so the sitemap
// never claims a change that did not happen.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await prisma.post
    .findMany({
      where: { published: true, noindex: false },
      select: { slug: true, updatedAt: true, category: { select: { slug: true } } },
      orderBy: { updatedAt: "desc" },
    })
    .catch(() => [] as { slug: string; updatedAt: Date; category: { slug: string } | null }[]);
  const home = await prisma.siteContent
    .findUnique({ where: { key: "/" }, select: { updatedAt: true } })
    .catch(() => null);

  const lastModifiedFor = (path: string): Date | undefined => {
    if (path === "/") return home?.updatedAt;
    if (path === "/blog") return posts.find((p) => p.category?.slug !== CASE_STUDIES.slug)?.updatedAt;
    if (path === CASE_STUDIES.path) return posts.find((p) => p.category?.slug === CASE_STUDIES.slug)?.updatedAt;
    return undefined;
  };

  return [
    // Service pages that canonicalise to digitalvikingz.com stay out until rewritten.
    ...routes.filter((r) => !(r.kind === "service" && canonicalToAgency.has(r.path.replace("/services/", "")))).map((r) => {
      const lastModified = lastModifiedFor(r.path);
      return {
        url: `${siteUrl}${r.path === "/" ? "/" : r.path}`,
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: "monthly" as const,
        priority: r.priority,
      };
    }),
    ...posts.map((p) => ({
      url: `${siteUrl}${p.category?.slug === CASE_STUDIES.slug ? CASE_STUDIES.path : "/blog"}/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
