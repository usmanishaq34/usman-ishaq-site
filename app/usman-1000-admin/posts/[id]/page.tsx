import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/db"
import PostEditorForm from "@/components/admin/PostEditorForm"

export default async function AdminPostEditor({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise
  const [post, categories, authors] = await Promise.all([
    prisma.post.findUnique({ where: { id: params.id } }).catch(() => null),
    prisma.category.findMany().catch(() => []),
    prisma.author.findMany({ orderBy: { name: "asc" } }).catch(() => []),
  ])
  if (!post) notFound()

  return (
    <div className="max-w-7xl">
      <header className="mb-8 pb-6 border-b border-line">
        <Link href="/usman-1000-admin/posts" className="mono-pill text-ink-muted hover:text-accent mb-3 inline-block">
          ← Back to posts
        </Link>
        <h1 className="h2-display italic-accent">Edit <em>post.</em></h1>
      </header>

      <PostEditorForm post={post} categories={categories} authors={authors} />
    </div>
  )
}
