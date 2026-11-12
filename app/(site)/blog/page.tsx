import { OG_IMAGE } from "@/lib/og-image";
import type { Metadata } from "next";
import SiteHeader from "@/components/sections/SiteHeader";
import SiteFooter from "@/components/sections/SiteFooter";
import Overlays from "@/components/sections/Overlays";
import Interactions from "@/components/Interactions";
import BlogCategoryFilter from "@/components/BlogCategoryFilter";
import { BlogCard, categoriesOf, postCardSelect, type PostRow } from "@/components/PostCard";
import { prisma } from "@/lib/db";
import { route } from "@/lib/routes";
import { withSeoOverride } from "@/lib/site-content";
import { blogIndexGraph } from "@/lib/structured-data";
import { notCaseStudy } from "@/lib/case-studies";

// Blog index in the agency blog's design. Posts come from the dashboard;
// refreshed on publish and every 30 seconds.
export const revalidate = 30;

const r = route("/blog");

export function generateMetadata(): Promise<Metadata> {
  return withSeoOverride(
    {
      title: r.title,
      description: r.description,
      alternates: { canonical: "/blog" },
      openGraph: { title: r.title, description: r.description, url: "/blog", type: "website", images: [OG_IMAGE] },
    },
    "/blog",
  );
}

export default async function BlogPage() {
  const posts: PostRow[] = await prisma.post
    .findMany({
      where: { published: true, ...notCaseStudy },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: postCardSelect,
    })
    .catch(() => []);
  const cats = categoriesOf(posts);

  return (
    <>
      <SiteHeader light />
      <main className="dv-blog">
        <div className="dv-blog-wrap">
          <div className="dv-blog-hero">
            <span className="dv-blog-label">Blogs</span>
            <h1 className="dv-blog-h1">
              Plain language, <em>real projects.</em>
            </h1>
            <p className="dv-blog-intro">
              Articles on semantic SEO, content networks and AI search, written from the sites I build for trade and service businesses.{" "}
              <strong>Every post names the method, the example and what changed.</strong>
            </p>
            {cats.length > 0 ? (
              <div className="dv-blog-categories">
                <button className="dv-blog-cat-pill active" data-cat="all">All</button>
                {cats.map(([slug, name]) => (
                  <button key={slug} className="dv-blog-cat-pill" data-cat={slug}>{name}</button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="dv-blog-grid" id="blogGrid">
            {posts.length === 0 ? (
              <div className="dv-blog-empty">
                <p className="dv-blog-empty-title">No posts yet.</p>
                <p>Articles published from the dashboard appear here.</p>
              </div>
            ) : (
              posts.map((p) => <BlogCard key={p.id} post={p} />)
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
      <Overlays />
      <Interactions />
      <BlogCategoryFilter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: blogIndexGraph({ title: r.title, description: r.description, posts }) }}
      />
    </>
  );
}
