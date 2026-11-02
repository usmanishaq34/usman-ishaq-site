"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { slugify } from "@/lib/slugify"

type CategoryInput = {
  id?: string
  name: string
  slug: string
  description: string | null
  seoTitle: string | null
  seoDescription: string | null
}

export default function CategoryEditorForm({
  category,
  isNew = false,
  postCount = 0,
  serviceCount = 0,
}: {
  category: CategoryInput
  isNew?: boolean
  postCount?: number
  serviceCount?: number
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!isNew)

  const [form, setForm] = useState({
    name: category.name ?? "",
    slug: category.slug ?? "",
    description: category.description ?? "",
    seoTitle: category.seoTitle ?? "",
    seoDescription: category.seoDescription ?? "",
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
      const endpoint = isNew ? "/api/categories" : `/api/categories/${category.id}`
      const method = isNew ? "POST" : "PATCH"
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          description: form.description || null,
          seoTitle: form.seoTitle || null,
          seoDescription: form.seoDescription || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Save failed")
      }
      const saved = await res.json()
      toast.success(isNew ? "Category created." : "Category updated.")
      if (isNew) {
        router.push(`/usman-1000-admin/categories/${saved.id}`)
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
    if (!category.id) return
    if (postCount > 0 || serviceCount > 0) {
      toast.error(`Cannot delete — used by ${postCount} post(s) and ${serviceCount} service(s).`)
      return
    }
    if (!confirm(`Delete category "${category.name}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/categories/${category.id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Delete failed")
      }
      toast.success("Category deleted.")
      router.push("/usman-1000-admin/categories")
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
            placeholder="Methodology"
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
            placeholder="methodology"
          />
          <p className="text-[11px] text-ink-muted mt-1">Used in URLs: /blog/category/{form.slug || "..."}</p>
        </div>
      </div>

      <div>
        <label className="mono-pill block mb-2">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full px-3.5 py-3 border border-line-strong font-body text-ink bg-bg focus:outline-none focus:border-accent transition-colors text-sm"
          style={{ borderRadius: 2 }}
          placeholder="A short description shown on the category archive page."
        />
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="mono-pill text-ink mb-4">SEO</h3>
        <div className="space-y-4">
          <div>
            <label className="mono-pill block mb-2">SEO Title</label>
            <input
              type="text"
              value={form.seoTitle}
              onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
              className="w-full px-3.5 py-3 border border-line-strong font-body text-ink bg-bg focus:outline-none focus:border-accent transition-colors text-sm"
              style={{ borderRadius: 2 }}
              placeholder="Semantic SEO articles | Usman Ishaq"
            />
            <p className="text-[11px] text-ink-muted mt-1">{form.seoTitle.length} / 60 chars</p>
          </div>
          <div>
            <label className="mono-pill block mb-2">SEO Description</label>
            <textarea
              value={form.seoDescription}
              onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
              rows={2}
              className="w-full px-3.5 py-3 border border-line-strong font-body text-ink bg-bg focus:outline-none focus:border-accent transition-colors text-sm"
              style={{ borderRadius: 2 }}
              placeholder="Long-form essays on Semantic SEO methodology."
            />
            <p className="text-[11px] text-ink-muted mt-1">{form.seoDescription.length} / 160 chars</p>
          </div>
        </div>
      </div>

      {!isNew && (
        <div className="text-xs text-ink-muted border-t border-dashed border-line pt-4">
          Used by <strong>{postCount}</strong> post(s) and <strong>{serviceCount}</strong> service(s).
        </div>
      )}

      {/* Save bar */}
      <div className="sticky bottom-4 z-10 bg-bg border border-line p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Link href="/usman-1000-admin/categories" className="btn-ghost">
            ← Cancel
          </Link>
          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || postCount > 0 || serviceCount > 0}
              className="mono-pill text-red-600 hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
              title={postCount > 0 || serviceCount > 0 ? "Reassign items before deleting" : "Delete category"}
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? "Saving..." : isNew ? "Create category →" : "Save category →"}
        </button>
      </div>
    </form>
  )
}
