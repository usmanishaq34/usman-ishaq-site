"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { slugify } from "@/lib/slugify"
import ImagePicker from "./ImagePicker"

type AuthorInput = {
  id?: string
  name: string
  slug: string
  title: string | null
  bio: string | null
  photoUrl: string | null
}

export default function AuthorEditorForm({
  author,
  isNew = false,
  postCount = 0,
}: {
  author: AuthorInput
  isNew?: boolean
  postCount?: number
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!isNew)

  const [form, setForm] = useState({
    name: author.name ?? "",
    slug: author.slug ?? "",
    title: author.title ?? "",
    bio: author.bio ?? "",
    photoUrl: author.photoUrl ?? "",
  })

  function setName(name: string) {
    setForm((f) => ({
      ...f,
      name,
      slug: slugManuallyEdited ? f.slug : slugify(name),
    }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Name and slug are required.")
      return
    }
    setSaving(true)
    try {
      const endpoint = isNew ? "/api/authors" : `/api/authors/${author.id}`
      const method = isNew ? "POST" : "PATCH"
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          title: form.title || null,
          bio: form.bio || null,
          photoUrl: form.photoUrl || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(typeof err.error === "string" ? err.error : "Save failed")
      }
      const saved = await res.json()
      toast.success(isNew ? "Author created." : "Author updated.")
      if (isNew) {
        router.push(`/usman-1000-admin/authors/${saved.id}`)
      } else {
        router.refresh()
      }
    } catch (err: any) {
      toast.error(typeof err?.message === "string" ? err.message : "Save failed.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!author.id) return
    if (!confirm(`Delete author "${author.name}"? Posts by this author will keep working but lose the byline.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/authors/${author.id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Delete failed")
      }
      toast.success("Author deleted.")
      router.push("/usman-1000-admin/authors")
    } catch (err: any) {
      toast.error(typeof err?.message === "string" ? err.message : "Delete failed.")
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="max-w-3xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="mono-pill block mb-2">Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-3 border border-line-strong font-body text-ink bg-bg focus:outline-none focus:border-accent transition-colors text-sm"
            style={{ borderRadius: 2 }}
            placeholder="Usman Ishaq"
          />
        </div>
        <div>
          <label className="mono-pill block mb-2">Slug *</label>
          <input
            type="text"
            required
            value={form.slug}
            onChange={(e) => {
              setSlugManuallyEdited(true)
              setForm({ ...form, slug: slugify(e.target.value) })
            }}
            className="w-full px-3.5 py-3 border border-line-strong font-mono text-ink bg-bg focus:outline-none focus:border-accent transition-colors text-sm"
            style={{ borderRadius: 2 }}
            placeholder="usman-ishaq"
          />
          <p className="text-[11px] text-ink-muted mt-1">Unique ID for this author.</p>
        </div>
      </div>

      <div>
        <label className="mono-pill block mb-2">Title / Role</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-3.5 py-3 border border-line-strong font-body text-ink bg-bg focus:outline-none focus:border-accent transition-colors text-sm"
          style={{ borderRadius: 2 }}
          placeholder="Semantic SEO Strategist and Consultant"
        />
      </div>

      <div>
        <label className="mono-pill block mb-2">Short Bio</label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          rows={4}
          className="w-full px-3.5 py-3 border border-line-strong font-body text-ink bg-bg focus:outline-none focus:border-accent transition-colors text-sm"
          style={{ borderRadius: 2 }}
          placeholder="A short bio shown under the author's posts."
        />
      </div>

      <div>
        <label className="mono-pill block mb-2">Photo</label>
        <ImagePicker
          value={form.photoUrl}
          onChange={(url) => setForm({ ...form, photoUrl: url })}
        />
      </div>

      {!isNew && (
        <div className="text-xs text-ink-muted border-t border-dashed border-line pt-4">
          Byline on <strong>{postCount}</strong> post(s).
        </div>
      )}

      {/* Save bar */}
      <div className="sticky bottom-4 z-10 bg-bg border border-line p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Link href="/usman-1000-admin/authors" className="btn-ghost">
            ← Cancel
          </Link>
          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="mono-pill text-red-600 hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
              title="Delete author"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? "Saving..." : isNew ? "Create author →" : "Save author →"}
        </button>
      </div>
    </form>
  )
}
