/* Blog post cards.
   - PostCard / FeaturedCard / CategoryFilters: the homepage blog section, in
     the homepage's own card markup (.post / .bfeat with an .art panel).
   - BlogCard: the /blog index, in the agency blog's card design. */

export type PostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  category: { name: string; slug: string } | null;
};

export const postCardSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  featuredImage: true,
  featuredImageAlt: true,
  publishedAt: true,
  createdAt: true,
  category: { select: { name: true, slug: true } },
} as const;

export const catName = (p: PostRow) => p.category?.name ?? "Article";
export const catSlug = (p: PostRow) => p.category?.slug ?? "article";

export function shortDate(d: Date | string | null | undefined) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function seedOf(s: string): number {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000;
  return h + 1;
}

/* The category is printed under the image, so the image carries no label. */
export function Art({ post, lit }: { post: PostRow; label?: string; lit?: boolean }) {
  const img = post.featuredImage;
  return (
    <div className={`art${img ? " has-img" : ""}${lit ? " in" : ""}`} data-seed={seedOf(post.slug)}>
      {img ? <img src={img} alt={post.featuredImageAlt || post.title} loading="lazy" /> : null}
    </div>
  );
}

export function PostCard({ post, delay, hidden }: { post: PostRow; delay?: number; hidden?: boolean }) {
  const d = delay ? ` d${delay}` : "";
  return (
    <a className={`post rv${d}${hidden ? " hide" : ""}`} data-c={catSlug(post)} href={`/blog/${post.slug}`}>
      <Art post={post} label={catName(post).toUpperCase()} />
      <div className="body">
        <span className="cat">{catName(post)}</span>
        <h4>{post.title}</h4>
        <p>{post.excerpt}</p>
        <span className="readm">Read the article <span className="arrow">→</span></span>
      </div>
    </a>
  );
}

export function FeaturedCard({ post }: { post: PostRow }) {
  return (
    <a className="bfeat rv" href={`/blog/${post.slug}`} data-c={catSlug(post)}>
      <Art post={post} label={`FEATURED · ${catName(post).toUpperCase()}`} lit />
      <div className="body">
        <span className="cat">Featured article</span>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <span className="readm">Read the article <span className="arrow">→</span></span>
      </div>
    </a>
  );
}

export function categoriesOf(posts: PostRow[]): [string, string][] {
  const cats = new Map<string, string>();
  for (const p of posts) if (p.category) cats.set(p.category.slug, p.category.name);
  return [...cats];
}

export function CategoryFilters({ posts }: { posts: PostRow[] }) {
  return (
    <div className="bfilters rv" id="bfilters">
      <button className="bfilter on" data-f="all">All</button>
      {categoriesOf(posts).map(([slug, name]) => (
        <button key={slug} className="bfilter" data-f={slug}>{name}</button>
      ))}
    </div>
  );
}

/* /blog index card, after the agency blog: 16:9 image or an initial letter,
   category and date, title, excerpt, "Read article". */
export function BlogCard({ post }: { post: PostRow }) {
  return (
    <a className="dv-blog-card" href={`/blog/${post.slug}`} data-cat={catSlug(post)}>
      <div className="dv-blog-card-image">
        {post.featuredImage ? (
          <img src={post.featuredImage} alt={post.featuredImageAlt || post.title} loading="lazy" />
        ) : (
          <div className="dv-blog-card-image-placeholder">
            <span className="dv-blog-card-image-initial">{post.title.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>
      <div className="dv-blog-card-body">
        <div className="dv-blog-card-meta">
          <span className="dv-blog-card-cat">{catName(post)}</span>
          <span className="dv-blog-card-meta-sep"></span>
          <span>{shortDate(post.publishedAt ?? post.createdAt)}</span>
        </div>
        <h2>{post.title}</h2>
        <p className="dv-blog-card-excerpt">{post.excerpt}</p>
        <span className="dv-blog-card-readmore">Read article</span>
      </div>
    </a>
  );
}
