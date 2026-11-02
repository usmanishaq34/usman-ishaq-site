import Link from "next/link";
import type { Author, Category, Post } from "@prisma/client";
import TableScrollArrows from "@/components/blog/TableScrollArrows";

export type FullPost = Post & { category: Category | null; postAuthor: Author | null };

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://usmanishaq.com";

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

export function articleJsonLd(post: FullPost): string {
  const url = `${siteUrl}/blog/${post.slug}`;
  const data = {
    "@context": "https://schema.org",
    "@type": post.schemaType === "BlogPosting" || !post.schemaType ? "BlogPosting" : post.schemaType,
    "@id": `${url}#article`,
    headline: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    url,
    mainEntityOfPage: url,
    datePublished: (post.publishedAt ?? post.createdAt).toISOString(),
    dateModified: post.updatedAt.toISOString(),
    image: post.featuredImage ? [post.featuredImage.startsWith("http") ? post.featuredImage : `${siteUrl}${post.featuredImage}`] : undefined,
    author: post.postAuthor
      ? { "@type": "Person", name: post.postAuthor.name, jobTitle: post.postAuthor.title ?? undefined }
      : { "@id": `${siteUrl}/#person` },
    publisher: { "@id": `${siteUrl}/#person` },
    articleSection: post.category?.name ?? undefined,
    keywords: post.tags.length ? post.tags.join(", ") : undefined,
    isPartOf: { "@id": `${siteUrl}/#website` },
  };
  return JSON.stringify(data).replace(/<\/script/gi, "<\\/script");
}

/* One blog post: dark header band (breadcrumb, meta, title) then the article
   on the site's light "paper" background. Used by /blog/[slug] and, with
   `preview`, by the dashboard's draft preview. */
export default function Article({ post, preview }: { post: FullPost; preview?: boolean }) {
  const author = post.postAuthor;
  const status = post.status === "published" || post.published ? "published" : post.status === "scheduled" ? "scheduled" : "draft";
  return (
    <>
      {preview ? (
        <div className="preview-bar">
          <span>Preview · status: {status} · not indexed by search engines</span>
          <Link href={`/usman-1000-admin/posts/${post.id}`}>← Back to editor</Link>
        </div>
      ) : null}
      <section className="page-hero">
        <div className="wrap article-wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span>/</span>
            <a href="/blog">Blog</a>
          </nav>
          <div className="article-meta">
            <span className="cat">{post.category?.name ?? "Article"}</span>
            <span className="dot" />
            <time dateTime={(post.publishedAt ?? post.createdAt).toISOString()}>{formatDate(post.publishedAt ?? post.createdAt)}</time>
            {post.readingTimeMinutes ? (
              <>
                <span className="dot" />
                <span>{post.readingTimeMinutes} min read</span>
              </>
            ) : null}
          </div>
          <h1>{post.title}</h1>
          {post.excerpt ? <p className="lead article-excerpt">{post.excerpt}</p> : null}
        </div>
      </section>
      <section className="light article">
        <div className="wrap article-wrap">
          {post.featuredImage ? (
            <figure className="article-hero">
              <img src={post.featuredImage} alt={post.featuredImageAlt || post.title} title={post.featuredImageTitle ?? undefined} />
              {post.featuredImageCaption ? <figcaption>{post.featuredImageCaption}</figcaption> : null}
            </figure>
          ) : null}
          <div className="article-body" dangerouslySetInnerHTML={{ __html: withScrollableTables(post.content) }} />
          <TableScrollArrows />
          {post.tags.length > 0 ? (
            <div className="tags">
              {post.tags.map((t) => (
                <span key={t}>#{t}</span>
              ))}
            </div>
          ) : null}
          {author && author.bio ? (
            <div className="author-box">
              {author.photoUrl ? <img src={author.photoUrl} alt={author.name} /> : <span className="initial">{author.name.charAt(0).toUpperCase()}</span>}
              <div>
                <div className="by">Written by</div>
                <div className="name">{author.name}</div>
                {author.title ? <div className="role">{author.title}</div> : null}
                <p>{author.bio}</p>
              </div>
            </div>
          ) : null}
          <p className="article-back">
            <a className="btn btn-ghost" href="/blog">← All articles</a>
          </p>
        </div>
      </section>
      {!preview ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: articleJsonLd(post) }} /> : null}
    </>
  );
}
