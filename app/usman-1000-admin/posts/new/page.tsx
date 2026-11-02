import Link from "next/link"
import { prisma } from "@/lib/db"
import PostEditorForm from "@/components/admin/PostEditorForm"

export default async function AdminNewPost() {
  const [categories, authors] = await Promise.all([
    prisma.category.findMany().catch(() => []),
    prisma.author.findMany({ orderBy: { name: "asc" } }).catch(() => []),
  ])

  const emptyPost = {
    id: "",
    slug: "",
    title: "",
    excerpt: "",
    content: "",
    featuredImage: null,
    featuredImageAlt: null,
    featuredImageTitle: null,
    featuredImageCaption: null,
    tags: [],
    categoryId: null,
    postAuthorId: null,
    authorId: "",
    seoTitle: null,
    seoDescription: null,
    focusKeyword: null,
    secondaryKeywords: [],
    canonicalUrl: null,
    noindex: false,
    nofollow: false,
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    twitterTitle: null,
    twitterDescription: null,
    twitterImage: null,
    schemaType: "Article",
    readingTimeMinutes: null,
    published: false,
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  return (
    <div className="max-w-7xl">
      <header className="mb-8 pb-6 border-b border-line">
        <Link href="/usman-1000-admin/posts" className="mono-pill text-ink-muted hover:text-accent mb-3 inline-block">
          ← Back to posts
        </Link>
        <h1 className="h2-display italic-accent">New <em>post.</em></h1>
        <p className="text-base text-ink-2 mt-2">Write a new blog post. Save as draft or publish immediately.</p>
      </header>

      <PostEditorForm post={emptyPost as any} categories={categories} authors={authors} isNew />
    </div>
  )
}
