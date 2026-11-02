import { prisma } from "@/lib/db";
import BlogCards from "@/components/sections/BlogCards";
import { CategoryFilters, FeaturedCard, PostCard, postCardSelect, type PostRow } from "@/components/PostCard";

/* The homepage blog cards: the latest published posts from the dashboard,
   with the category filter built from their categories. Until the first post
   is published (or when the database is unreachable) the original static
   cards from components/sections/BlogCards.jsx show instead. */
export default async function LatestPosts() {
  const posts: PostRow[] = await prisma.post
    .findMany({
      where: { published: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: postCardSelect,
      take: 10,
    })
    .catch(() => []);

  if (posts.length === 0) return <BlogCards />;
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
