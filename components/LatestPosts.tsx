import { prisma } from "@/lib/db";
import { CategoryFilters, FeaturedCard, PostCard, postCardSelect, type PostRow } from "@/components/PostCard";

/* The homepage blog section: the latest published posts from the dashboard,
   with the category filter built from their categories. The newest post is
   the featured card; the rest fill the grid. */
export default async function LatestPosts() {
  const posts: PostRow[] = await prisma.post
    .findMany({
      where: { published: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: postCardSelect,
      take: 10,
    })
    .catch(() => []);

  if (posts.length === 0) {
    return <p className="blog-soon">New articles are published here. Check back soon.</p>;
  }
  const [featured, ...rest] = posts;

  return (
    <>
      <CategoryFilters posts={posts} />
      <FeaturedCard post={featured} />
      {rest.length > 0 ? (
        <div className="bgrid" id="bgrid">
          {rest.map((p, i) => (
            <PostCard key={p.id} post={p} delay={i % 3} />
          ))}
        </div>
      ) : null}
    </>
  );
}
