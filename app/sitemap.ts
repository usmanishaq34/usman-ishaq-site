import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { routes } from "@/lib/routes";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://usmanishaq.com";

// The site's pages plus every published post. Rebuilt at most once an hour,
// and on demand when a post is saved in the dashboard.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await prisma.post
    .findMany({ where: { published: true, noindex: false }, select: { slug: true, updatedAt: true } })
    .catch(() => [] as { slug: string; updatedAt: Date }[]);
  return [
    ...routes.map((r) => ({
      url: `${siteUrl}${r.path === "/" ? "/" : r.path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: r.priority,
    })),
    ...posts.map((p) => ({
      url: `${siteUrl}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
