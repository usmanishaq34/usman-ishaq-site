import { prisma } from "@/lib/db";
import { CategoryFilters, FeaturedCard, PostCard, catSlug, postCardSelect, type PostRow } from "@/components/PostCard";

const PER_TAB = 6;

/* The homepage blog section. The newest post is the featured card. The grid
   holds the newest six posts overall plus the newest six of every category,
   so each filter tab has up to six posts to show; the page script shows at
   most six at a time (components/Interactions.jsx). */
export default async function LatestPosts() {
  const all: PostRow[] = await prisma.post
    .findMany({
      where: { published: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: postCardSelect,
    })
    .catch(() => []);

  if (all.length === 0) {
    return <p className="blog-soon">New articles are published here. Check back soon.</p>;
  }
  const [featured, ...rest] = all;

  const perCategory = new Map<string, number>();
  const grid: PostRow[] = [];
  rest.forEach((p, i) => {
    const key = catSlug(p);
    const n = perCategory.get(key) ?? 0;
    if (i < PER_TAB || n < PER_TAB) {
      grid.push(p);
      perCategory.set(key, n + 1);
    }
  });

  return (
    <>
      <CategoryFilters posts={all} />
      <FeaturedCard post={featured} />
      {grid.length > 0 ? (
        <div className="bgrid" id="bgrid">
          {grid.map((p, i) => (
            <PostCard key={p.id} post={p} delay={i % 3} hidden={i >= PER_TAB} />
          ))}
        </div>
      ) : null}
    </>
  );
}
