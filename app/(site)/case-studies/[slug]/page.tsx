import { OG_IMAGE } from "@/lib/og-image";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import SiteHeader from "@/components/sections/SiteHeader";
import SiteFooter from "@/components/sections/SiteFooter";
import Overlays from "@/components/sections/Overlays";
import Interactions from "@/components/Interactions";
import Article, { type FullPost } from "@/components/Article";
import { prisma } from "@/lib/db";
import { CASE_STUDIES, isCaseStudy } from "@/lib/case-studies";

// One case study: a CMS post in the "Case Studies" category, rendered with the
// article template under /case-studies. A post in another category found here
// redirects to its /blog address.
export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

async function fetchPost(slug: string): Promise<FullPost | null> {
  return prisma.post.findUnique({ where: { slug }, include: { category: true, postAuthor: true } });
}

export async function generateStaticParams() {
  try {
    const posts = await prisma.post.findMany({ where: { published: true, category: { is: { slug: CASE_STUDIES.slug } } }, select: { slug: true } });
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post || !post.published || !isCaseStudy(post)) return { title: "Case study not found", robots: { index: false, follow: false } };
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const image = post.ogImage || post.featuredImage || OG_IMAGE;
  const path = `${CASE_STUDIES.path}/${post.slug}`;
  return {
    title,
    description,
    robots: { index: !post.noindex, follow: !post.nofollow },
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      title: post.ogTitle ?? title,
      description: post.ogDescription ?? description,
      images: [image],
      publishedTime: (post.publishedAt ?? post.createdAt).toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
    },
    twitter: { card: "summary_large_image", title: post.twitterTitle ?? post.ogTitle ?? title, description: post.twitterDescription ?? post.ogDescription ?? description, images: [post.twitterImage ?? image] },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post || !post.published) notFound();
  if (!isCaseStudy(post)) permanentRedirect(`/blog/${post.slug}`);
  return (
    <>
      <SiteHeader light />
      <main>
        <Article post={post} section="case-studies" />
      </main>
      <SiteFooter />
      <Overlays />
      <Interactions />
    </>
  );
}
