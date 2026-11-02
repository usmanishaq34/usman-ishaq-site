/* Blog post card in the homepage's card markup (.post / .bfeat with an .art
   panel). A post with a featured image shows it; without one the page script
   draws the node graph into .art, as it does for the original cards. */

export type PostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  category: { name: string; slug: string } | null;
};

export const postCardSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  featuredImage: true,
  featuredImageAlt: true,
  category: { select: { name: true, slug: true } },
} as const;

export const catName = (p: PostRow) => p.category?.name ?? "Article";
export const catSlug = (p: PostRow) => p.category?.slug ?? "article";

export function seedOf(s: string): number {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000;
  return h + 1;
}

export function Art({ post, label, lit }: { post: PostRow; label: string; lit?: boolean }) {
  const img = post.featuredImage;
  return (
    <div className={`art${img ? " has-img" : ""}${lit ? " in" : ""}`} data-seed={seedOf(post.slug)}>
      {img ? <img src={img} alt={post.featuredImageAlt || post.title} loading="lazy" /> : null}
      <span className="lab">{label}</span>
    </div>
  );
}

export function PostCard({ post, delay }: { post: PostRow; delay?: number }) {
  const d = delay ? ` d${delay}` : "";
  return (
    <a className={`post rv${d}`} data-c={catSlug(post)} href={`/blog/${post.slug}`}>
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

export function CategoryFilters({ posts }: { posts: PostRow[] }) {
  const cats = new Map<string, string>();
  for (const p of posts) if (p.category) cats.set(p.category.slug, p.category.name);
  return (
    <div className="bfilters rv" id="bfilters">
      <button className="bfilter on" data-f="all">All</button>
      {[...cats].map(([slug, name]) => (
        <button key={slug} className="bfilter" data-f={slug}>{name}</button>
      ))}
    </div>
  );
}
