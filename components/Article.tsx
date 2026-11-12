import Link from "next/link";
import type { Author, Category, Post } from "@prisma/client";
import TableScrollArrows from "@/components/blog/TableScrollArrows";
import { articleGraph, normalizeInternalLinks } from "@/lib/structured-data";
import { sectionBase, sectionLabel, type Section } from "@/lib/case-studies";

export type FullPost = Post & { category: Category | null; postAuthor: Author | null };

export function formatDate(d: Date | string | null | undefined) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// Tables are often wider than the article column on phones. Each one is
// wrapped in a scroll container so the layout stays intact. The content
// itself is never modified.
function withScrollableTables(html: string): string {
  if (!html) return "";
  return html
    .replace(/<table(?=[\s>])/gi, '<div class="dv-table-shell"><div class="dv-table-scroll"><table')
    .replace(/<\/table\s*>/gi, "</table></div></div>");
}

// The page's JSON-LD @graph (lib/structured-data.ts): WebPage, BlogPosting,
// Blog, breadcrumb and the site identity nodes, with the body's internal links
// mirrored as significantLink / relatedLink.
export function articleJsonLd(post: FullPost, section: Section = "blog"): string {
  return articleGraph({ ...post, content: normalizeInternalLinks(post.content) }, section);
}

/* One blog post in the agency blog's design: breadcrumb, meta line, display
   title, featured image, excerpt, article body, tags and author box. Used by
   /blog/[slug] and, with `preview`, by the dashboard's draft preview. */
export default function Article({ post, preview, section = "blog" }: { post: FullPost; preview?: boolean; section?: Section }) {
  const author = post.postAuthor;
  const status = post.status === "published" || post.published ? "published" : post.status === "scheduled" ? "scheduled" : "draft";
  return (
    <>
      {preview ? (
        <div className="dv-preview-bar">
          <span>Preview · status: {status} · not indexed by search engines</span>
          <Link href={`/usman-1000-admin/posts/${post.id}`}>← Back to editor</Link>
        </div>
      ) : null}
      <article className="dv-post">
        <div className="dv-post-wrap">
          <nav className="dv-post-crumbs" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span>/</span>
            <a href={sectionBase(section)}>{sectionLabel(section)}</a>
            <span>/</span>
            <span>{post.title.length > 40 ? `${post.title.slice(0, 40)}…` : post.title}</span>
          </nav>

          <div className="dv-post-meta">
            <span className="dv-post-cat">{post.category?.name ?? "Article"}</span>
            <span className="dv-post-dot" />
            <time dateTime={(post.publishedAt ?? post.createdAt).toISOString()}>{formatDate(post.publishedAt ?? post.createdAt)}</time>
            {post.readingTimeMinutes ? (
              <>
                <span className="dv-post-dot" />
                <span>{post.readingTimeMinutes} min read</span>
              </>
            ) : null}
          </div>

          <h1 className="dv-post-title">{post.title}</h1>

          {post.featuredImage ? (
            <figure className="dv-post-figure">
              <img src={post.featuredImage} alt={post.featuredImageAlt || post.title} title={post.featuredImageTitle ?? undefined} />
              {post.featuredImageCaption ? <figcaption>{post.featuredImageCaption}</figcaption> : null}
            </figure>
          ) : null}

          {post.excerpt ? <p className="post-excerpt">{post.excerpt}</p> : null}

          <div className="post-content" dangerouslySetInnerHTML={{ __html: withScrollableTables(normalizeInternalLinks(post.content)) }} />
          <TableScrollArrows />

          {post.tags.length > 0 ? (
            <div className="dv-post-tags">
              {post.tags.map((t) => (
                <span key={t}>#{t}</span>
              ))}
            </div>
          ) : null}

          {author && author.bio ? (
            <div className="dv-author">
              {author.photoUrl ? <img src={author.photoUrl} alt={author.name} /> : <span className="dv-author-initial">{author.name.charAt(0).toUpperCase()}</span>}
              <div>
                <div className="dv-author-by">Written by</div>
                <div className="dv-author-name">{author.name}</div>
                {author.title ? <div className="dv-author-role">{author.title}</div> : null}
                <p>{author.bio}</p>
              </div>
            </div>
          ) : null}

          <p className="dv-post-back">
            <a href={sectionBase(section)}>{section === "case-studies" ? "← All case studies" : "← All articles"}</a>
          </p>
        </div>
      </article>
      {!preview ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: articleJsonLd(post, section) }} /> : null}
    </>
  );
}
