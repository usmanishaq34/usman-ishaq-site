import Link from "next/link"
import { notFound } from "next/navigation"
import CategoryEditorForm from "@/components/admin/CategoryEditorForm"
import { prisma } from "@/lib/db"

export default async function AdminCategoryEdit({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise
  const category = await prisma.category
    .findUnique({
      where: { id: params.id },
      include: { _count: { select: { posts: true } } },
    })
    .catch(() => null)

  if (!category) notFound()

  return (
    <div className="max-w-5xl">
      <header className="mb-8 pb-6 border-b border-line">
        <Link href="/usman-1000-admin/categories" className="mono-pill text-ink-muted hover:text-accent mb-3 inline-block">
          ← Back to categories
        </Link>
        <h1 className="h2-display italic-accent">
          Edit <em>{category.name}</em>
        </h1>
        <p className="text-base text-ink-2 mt-2">
          Used by {category._count.posts} post(s).
        </p>
      </header>

      <CategoryEditorForm
        category={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          seoTitle: category.seoTitle,
          seoDescription: category.seoDescription,
        }}
        postCount={category._count.posts}
        serviceCount={0}
      />
    </div>
  )
}
