import { OG_IMAGE } from "@/lib/og-image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/sections/SiteHeader";
import SiteFooter from "@/components/sections/SiteFooter";
import Overlays from "@/components/sections/Overlays";
import Interactions from "@/components/Interactions";
import Article, { type FullPost } from "@/components/Article";
import { prisma } from "@/lib/db";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

// A database error is thrown, not turned into "not found": a thrown error
// keeps the previously cached page (or fails the build), while a null here
// would be cached as a 404 for the whole revalidation window.
async function fetchPost(slug: string): Promise<FullPost | null> {
  return prisma.post.findUnique({ where: { slug }, include: { category: true, postAuthor: true } });
}

export async function generateStaticParams() {
  try {
    const posts = await prisma.post.findMany({ where: { published: true }, select: { slug: true } });
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post || !post.published) return { title: "Post not found", robots: { index: false, follow: false } };
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const image = post.ogImage || post.featuredImage || OG_IMAGE;
  return {
    title,
    description,
    robots: { index: !post.noindex, follow: !post.nofollow },
    alternates: { canonical: post.canonicalUrl || `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url: `/blog/${post.slug}`,
      title: post.ogTitle ?? title,
      description: post.ogDescription ?? description,
      images: [image],
      publishedTime: (post.publishedAt ?? post.createdAt).toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: post.twitterTitle ?? post.ogTitle ?? title,
      description: post.twitterDescription ?? post.ogDescription ?? description,
      images: [post.twitterImage ?? image],
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post || !post.published) notFound();
  return (
    <>
      <SiteHeader light />
      <main>
        <Article post={post} />
      </main>
      <SiteFooter />
      <Overlays />
      <Interactions />
    </>
  );
}
