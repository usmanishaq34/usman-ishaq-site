import Link from "next/link"
import CategoryEditorForm from "@/components/admin/CategoryEditorForm"

export default function AdminCategoryNew() {
  return (
    <div className="max-w-5xl">
      <header className="mb-8 pb-6 border-b border-line">
        <Link href="/usman-1000-admin/categories" className="mono-pill text-ink-muted hover:text-accent mb-3 inline-block">
          ← Back to categories
        </Link>
        <h1 className="h2-display italic-accent">
          New <em>category.</em>
        </h1>
        <p className="text-base text-ink-2 mt-2">Create a category for posts.</p>
      </header>

      <CategoryEditorForm
        category={{
          name: "",
          slug: "",
          description: null,
          seoTitle: null,
          seoDescription: null,
        }}
        isNew
      />
    </div>
  )
}
