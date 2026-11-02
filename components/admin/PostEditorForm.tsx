"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Post, Category, Author } from "@prisma/client"
import { slugify } from "@/lib/slugify"
import FormField from "./FormField"
import SeoFieldsPanel, { type SeoFields } from "./SeoFieldsPanel"
import SeoScorePanel from "./SeoScorePanel"
import ImagePicker from "./ImagePicker"
import ScheduleControl, { type PublishStatus } from "./ScheduleControl"
import RichTextEditor from "./RichTextEditor"
import { premiumToast } from "./premiumToast"

export default function PostEditorForm({
  post,
  categories,
  authors = [],
  isNew = false,
}: {
  post: Post
  categories: Category[]
  authors?: Author[]
  isNew?: boolean
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  // Track if user has manually edited the slug. If not, slug auto-syncs with title.
  // Same pattern as ServiceEditorForm — reliable, doesn't break on any edit.
  const slugManuallyEditedRef = useRef<boolean>(!isNew && post.slug !== slugify(post.title))

  const [form, setForm] = useState({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    categoryId: post.categoryId,
    postAuthorId: (post as any).postAuthorId ?? "",
    tags: post.tags.join(", "),
    featuredImage: post.featuredImage ?? "",
    featuredImageAlt: post.featuredImageAlt ?? "",
    featuredImageTitle: post.featuredImageTitle ?? "",
    featuredImageCaption: post.featuredImageCaption ?? "",
    seoTitle: post.seoTitle ?? "",
    seoDescription: post.seoDescription ?? "",
    focusKeyword: post.focusKeyword ?? "",
    secondaryKeywords: post.secondaryKeywords ?? [],
    canonicalUrl: post.canonicalUrl ?? "",
    noindex: post.noindex,
    nofollow: post.nofollow,
    ogTitle: post.ogTitle ?? "",
    ogDescription: post.ogDescription ?? "",
    ogImage: post.ogImage ?? "",
    twitterTitle: post.twitterTitle ?? "",
    twitterDescription: post.twitterDescription ?? "",
    twitterImage: post.twitterImage ?? "",
    schemaType: post.schemaType ?? "Article",
    published: post.published,
    status: ((post as any).status ?? (post.published ? "published" : "draft")) as PublishStatus,
    scheduledFor: ((post as any).scheduledFor as Date | null)
      ? new Date((post as any).scheduledFor).toISOString()
      : (null as string | null),
  })

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm({ ...form, [key]: value })
  }

  function handleTitleChange(newTitle: string) {
    setForm((prev) => ({
      ...prev,
      title: newTitle,
      // Auto-sync slug with title unless user has manually edited it
      slug: slugManuallyEditedRef.current ? prev.slug : slugify(newTitle),
    }))
  }

  function handleSlugChange(newSlug: string) {
    slugManuallyEditedRef.current = true
    // Always sanitize — no spaces, no special chars
    set("slug", slugify(newSlug))
  }

  function updateSeoFields(seo: SeoFields) {
    setForm({ ...form, ...(seo as unknown as Partial<typeof form>) })
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (form.status === "scheduled" && !form.scheduledFor) {
      toast.error("Pick a date/time for scheduled publish.")
      return
    }
    setSaving(true)
    try {
      const isPublished = form.status === "published"
      const payload = {
        ...form,
        postAuthorId: form.postAuthorId || null,
        published: isPublished,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        publishedAt:
          isPublished && !post.publishedAt ? new Date().toISOString() : post.publishedAt,
        scheduledFor: form.status === "scheduled" ? form.scheduledFor : null,
      }
      const endpoint = isNew ? "/api/posts" : `/api/posts/${post.id}`
      const method = isNew ? "POST" : "PATCH"
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        let errMsg = "Save failed."
        if (errBody?.error) {
          if (typeof errBody.error === "string") {
            errMsg = errBody.error
          } else if (errBody.error?.fieldErrors) {
            const fields = Object.keys(errBody.error.fieldErrors)
            errMsg = `Invalid fields: ${fields.join(", ")}`
          }
        }
        if (res.status === 500) {
          errMsg =
            "Database error. If you just added Schedule/Categories features, run the SQL migration in Supabase."
        }
        throw new Error(errMsg)
      }
      const saved = await res.json()

      const action: "published" | "scheduled" | "saved" | "created" =
        form.status === "published"
          ? "published"
          : form.status === "scheduled"
          ? "scheduled"
          : isNew
          ? "created"
          : "saved"

      premiumToast({
        kind: "post",
        action,
        title: form.title,
        scheduledFor: form.status === "scheduled" ? form.scheduledFor : null,
        viewUrl:
          action === "published"
            ? `${typeof window !== "undefined" ? window.location.origin : ""}/blog/${form.slug}`
            : undefined,
      })

      if (isNew) {
        router.push(`/usman-1000-admin/posts/${saved.id}`)
      } else {
        router.refresh()
      }
    } catch (err: any) {
      toast.error(typeof err?.message === "string" ? err.message : "Save failed. Try again.")
    } finally {
      setSaving(false)
    }
  }

  const seoValues: SeoFields = {
    seoTitle: form.seoTitle,
    seoDescription: form.seoDescription,
    focusKeyword: form.focusKeyword,
    secondaryKeywords: form.secondaryKeywords,
    canonicalUrl: form.canonicalUrl,
    noindex: form.noindex,
    nofollow: form.nofollow,
    ogTitle: form.ogTitle,
    ogDescription: form.ogDescription,
    ogImage: form.ogImage,
    twitterTitle: form.twitterTitle,
    twitterDescription: form.twitterDescription,
    twitterImage: form.twitterImage,
    schemaType: form.schemaType,
  }

  return (
    <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
      {/* Main column */}
      <div className="space-y-7">
        {/* Title + Slug — side by side starting at md breakpoint */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField label="Title" required>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="form-input"
              required
            />
          </FormField>

          <FormField label="URL slug" required hint="Auto-generated from title. Edit if needed.">
            <input
              type="text"
              value={form.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className="form-input font-mono text-sm"
              required
            />
            <p className="text-[11px] text-ink-muted mt-1">
              Live URL: /blog/{form.slug || "..."}
            </p>
          </FormField>
        </div>

        <FormField label="Excerpt" required hint="Shown in blog index. 1-2 sentences.">
          <textarea
            value={form.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            className="form-input min-h-[100px]"
            required
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FormField label="Category">
            <select
              value={form.categoryId ?? ""}
              onChange={(e) => set("categoryId", e.target.value || null)}
              className="form-input"
            >
              <option value="">— No category —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Author" hint="Byline shown on the post.">
            <select
              value={form.postAuthorId ?? ""}
              onChange={(e) => set("postAuthorId", e.target.value)}
              className="form-input"
            >
              <option value="">— No author —</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Tags" hint="Comma-separated.">
            <input
              type="text"
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              className="form-input"
              placeholder="methodology, entity, audit"
            />
          </FormField>
        </div>

        {/* Featured image with metadata */}
        <div className="border border-line bg-bg-2">
          <div className="px-5 py-3 border-b border-line bg-bg">
            <h3 className="mono-label">Featured Image</h3>
          </div>
          <div className="p-5">
            <ImagePicker
              value={form.featuredImage}
              onChange={(url, meta) => {
                set("featuredImage", url)
                if (meta?.alt) set("featuredImageAlt", meta.alt)
                if (meta?.title) set("featuredImageTitle", meta.title)
                if (meta?.caption) set("featuredImageCaption", meta.caption)
              }}
              altValue={form.featuredImageAlt}
              onAltChange={(v) => set("featuredImageAlt", v)}
              titleValue={form.featuredImageTitle}
              onTitleChange={(v) => set("featuredImageTitle", v)}
              captionValue={form.featuredImageCaption}
              onCaptionChange={(v) => set("featuredImageCaption", v)}
              showInlineMeta={true}
            />
          </div>
        </div>

        <FormField
          label="Content"
          required
          hint="Use the toolbar — H2/H3/H4, lists, links, images, tables, undo. Click </> HTML to edit raw."
        >
          <RichTextEditor
            value={form.content}
            onChange={(html) => set("content", html)}
            placeholder="Write the post..."
          />
        </FormField>

        {/* SEO Panel */}
        <SeoFieldsPanel
          values={seoValues}
          onChange={updateSeoFields}
          baseUrl={`https://usmanishaq.com/blog/${form.slug}`}
        />

        {/* Schedule + status control */}
        <ScheduleControl
          status={form.status}
          scheduledFor={form.scheduledFor}
          onStatusChange={(s) => set("status", s)}
          onScheduledForChange={(iso) => set("scheduledFor", iso)}
        />

        {/* Save bar */}
        <div className="sticky bottom-4 z-10 bg-bg border border-line p-4 flex items-center justify-between shadow-lg">
          <span className="mono-pill text-ink-muted">
            {form.status === "draft" && "Will not appear on site"}
            {form.status === "scheduled" && form.scheduledFor &&
              `Goes live ${new Date(form.scheduledFor).toLocaleString()}`}
            {form.status === "published" && "Visible on site"}
          </span>
          <div className="flex items-center gap-3">
            {!isNew && post.id && (
              <button
                type="button"
                onClick={() => window.open(`/preview/${post.id}`, "_blank")}
                className="btn-ghost"
                title="Open a live preview of the current saved version in a new tab"
              >
                👁 Preview
              </button>
            )}
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving
                ? "Saving..."
                : form.status === "scheduled"
                ? "Schedule post →"
                : form.status === "published"
                ? (isNew ? "Publish post →" : "Update post →")
                : "Save draft →"}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="space-y-6">
        <SeoScorePanel
          input={{
            title: form.title,
            seoTitle: form.seoTitle,
            seoDescription: form.seoDescription,
            content: form.content,
            slug: form.slug,
            focusKeyword: form.focusKeyword,
            secondaryKeywords: form.secondaryKeywords,
            featuredImage: form.featuredImage,
            featuredImageAlt: form.featuredImageAlt,
          }}
        />
      </aside>

      <style>{`
        .form-input {
          width: 100%;
          padding: 11px 14px;
          border: 1px solid var(--line-strong);
          font-family: var(--font-body);
          color: var(--text);
          background: var(--bg);
          border-radius: 2px;
          transition: border-color 0.2s;
          font-size: 14px;
        }
        .form-input:focus { outline: none; border-color: var(--accent); }
      `}</style>
    </form>
  )
}
