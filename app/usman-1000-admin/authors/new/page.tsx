import Link from "next/link"
import AuthorEditorForm from "@/components/admin/AuthorEditorForm"

export default function AdminAuthorNew() {
  return (
    <div className="max-w-5xl">
      <header className="mb-8 pb-6 border-b border-line">
        <Link href="/usman-1000-admin/authors" className="mono-pill text-ink-muted hover:text-accent mb-3 inline-block">
          ← Back to authors
        </Link>
        <h1 className="h2-display italic-accent">
          New <em>author.</em>
        </h1>
        <p className="text-base text-ink-2 mt-2">Add a byline author for blog posts.</p>
      </header>

      <AuthorEditorForm
        author={{
          name: "",
          slug: "",
          title: null,
          bio: null,
          photoUrl: null,
        }}
        isNew
      />
    </div>
  )
}
