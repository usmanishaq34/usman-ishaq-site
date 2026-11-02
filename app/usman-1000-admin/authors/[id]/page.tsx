import Link from "next/link"
import { notFound } from "next/navigation"
import AuthorEditorForm from "@/components/admin/AuthorEditorForm"
import { prisma } from "@/lib/db"

export default async function AdminAuthorEdit({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise
  const author = await prisma.author
    .findUnique({
      where: { id: params.id },
      include: { _count: { select: { posts: true } } },
    })
    .catch(() => null)

  if (!author) notFound()

  return (
    <div className="max-w-5xl">
      <header className="mb-8 pb-6 border-b border-line">
        <Link href="/usman-1000-admin/authors" className="mono-pill text-ink-muted hover:text-accent mb-3 inline-block">
          ← Back to authors
        </Link>
        <h1 className="h2-display italic-accent">
          Edit <em>{author.name}</em>
        </h1>
        <p className="text-base text-ink-2 mt-2">
          Byline on {author._count.posts} post(s).
        </p>
      </header>

      <AuthorEditorForm
        author={{
          id: author.id,
          name: author.name,
          slug: author.slug,
          title: author.title,
          bio: author.bio,
          photoUrl: author.photoUrl,
        }}
        postCount={author._count.posts}
      />
    </div>
  )
}
