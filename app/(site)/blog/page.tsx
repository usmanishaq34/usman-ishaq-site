import type { Metadata } from "next";
import SiteHeader from "@/components/sections/SiteHeader";
import SiteFooter from "@/components/sections/SiteFooter";
import Overlays from "@/components/sections/Overlays";
import Interactions from "@/components/Interactions";
import { CategoryFilters, PostCard, postCardSelect, type PostRow } from "@/components/PostCard";
import { prisma } from "@/lib/db";
import { route } from "@/lib/routes";
import { withSeoOverride } from "@/lib/site-content";

// Posts come from the dashboard. Refreshed on publish and every 30 seconds.
export const revalidate = 30;

const r = route("/blog");

export function generateMetadata(): Promise<Metadata> {
  return withSeoOverride(
    {
      title: r.title,
      description: r.description,
      alternates: { canonical: "/blog" },
      openGraph: { title: r.title, description: r.description, url: "/blog", type: "website", images: ["/images/usman-ishaq-portrait.webp"] },
    },
    "/blog",
  );
}

export default async function BlogPage() {
  const posts: PostRow[] = await prisma.post
    .findMany({
      where: { published: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: postCardSelect,
    })
    .catch(() => []);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-hero">
          <div className="wrap">
            <span className="eyebrow">The blog</span>
            <h1>Articles on semantic SEO, content networks and AI search</h1>
            <p className="lead">Plain-language articles written from real projects, not theory. Every post names the method, the example and what changed.</p>
          </div>
        </section>
        <section className="blog blog-list">
          <div className="wrap">
            {posts.length === 0 ? (
              <div className="blog-empty">
                <p>No articles yet. Posts published from the dashboard appear here.</p>
              </div>
            ) : (
              <>
                <CategoryFilters posts={posts} />
                <div className="bgrid" id="bgrid">
                  {posts.map((p, i) => (
                    <PostCard key={p.id} post={p} delay={i % 3} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
      <Overlays />
      <Interactions />
    </>
  );
}
