"use client"

import { useState, useRef } from "react"
import { toast } from "sonner"

interface MediaItem {
  id: string
  url: string
  filename: string
  mimeType?: string | null
  width?: number | null
  height?: number | null
  size: number
  title?: string | null
  altText?: string | null
  caption?: string | null
  description?: string | null
  createdAt: string | Date
}

export default function MediaLibraryView({ initialItems }: { initialItems: MediaItem[] }) {
  const [items, setItems] = useState<MediaItem[]>(initialItems)
  const [editing, setEditing] = useState<MediaItem | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function upload(files: FileList | File[]) {
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append("file", file)
        const res = await fetch("/api/upload", { method: "POST", body: fd })
        if (!res.ok) throw new Error("Upload failed")
        const newItem = await res.json()
        setItems((prev) => [newItem, ...prev])
      }
      toast.success(`Uploaded ${files.length} file(s)`)
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this image? This cannot be undone.")) return
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success("Deleted")
      if (editing?.id === id) setEditing(null)
    } catch {
      toast.error("Delete failed")
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) upload(e.dataTransfer.files)
  }

  return (
    <>
      {/* Upload zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed p-8 text-center mb-8 transition-colors ${
          dragOver ? "border-accent bg-accent-soft" : "border-line-strong bg-bg"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) upload(e.target.files)
          }}
        />
        <p className="text-sm text-ink-2 mb-3">
          {dragOver ? "Drop to upload" : "Drag images here, or click below to browse"}
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="btn-primary"
        >
          {uploading ? "Uploading..." : "Choose files →"}
        </button>
        <p className="text-xs text-ink-muted mt-3">JPG, PNG, WebP, SVG · Max 5MB each</p>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="bg-bg border border-line p-12 text-center">
          <p className="text-ink-muted">No images uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setEditing(item)}
              className="text-left bg-bg border border-line hover:border-accent transition-colors group"
            >
              <div className="aspect-square bg-bg-3 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.altText ?? item.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-3">
                <p className="text-xs font-mono text-ink truncate">{item.filename}</p>
                <p className="text-[10px] text-ink-muted mt-0.5">
                  {item.altText ? (
                    <span className="text-green-700">✓ alt set</span>
                  ) : (
                    <span className="text-amber-600">⚠ no alt</span>
                  )}
                  {" · "}
                  {(item.size / 1024).toFixed(0)} KB
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <MediaEditModal
          item={editing}
          onClose={() => setEditing(null)}
          onUpdate={(updated) => {
            setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
            setEditing(updated)
          }}
          onDelete={() => deleteItem(editing.id)}
        />
      )}
    </>
  )
}

function MediaEditModal({
  item,
  onClose,
  onUpdate,
  onDelete,
}: {
  item: MediaItem
  onClose: () => void
  onUpdate: (item: MediaItem) => void
  onDelete: () => void
}) {
  const [form, setForm] = useState({
    title: item.title ?? "",
    altText: item.altText ?? "",
    caption: item.caption ?? "",
    description: item.description ?? "",
  })
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      const res = await fetch(`/api/media/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      onUpdate(updated)
      toast.success("Saved")
    } catch {
      toast.error("Save failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-bg w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="font-display text-xl font-semibold">Edit media</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink text-2xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-0">
            {/* Preview */}
            <div className="bg-bg-3 p-6 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={form.altText}
                className="max-w-full max-h-[400px] object-contain border border-line"
              />
            </div>

            {/* Metadata form */}
            <div className="p-6 space-y-5">
              <div>
                <label className="mono-pill block mb-1.5">Filename</label>
                <p className="text-sm font-mono text-ink-2 break-all">{item.filename}</p>
              </div>

              <div>
                <label className="mono-pill block mb-1.5">URL</label>
                <p className="text-xs font-mono text-ink-muted break-all">{item.url}</p>
              </div>

              <div>
                <label className="mono-pill block mb-1.5">File details</label>
                <p className="text-xs text-ink-muted">
                  {(item.size / 1024).toFixed(0)} KB · {item.mimeType}
                  {item.width && item.height ? ` · ${item.width}×${item.height}` : ""}
                </p>
              </div>

              <div className="pt-3 border-t border-line space-y-4">
                <div>
                  <label className="mono-pill block mb-1.5">Image title</label>
                  <p className="text-xs text-ink-muted mb-1.5">Shown on hover. Optional.</p>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="mono-pill block mb-1.5">
                    Alt text <span className="text-accent">*</span>
                  </label>
                  <p className="text-xs text-ink-muted mb-1.5">
                    Critical for accessibility and SEO. Describe what the image shows.
                  </p>
                  <input
                    type="text"
                    value={form.altText}
                    onChange={(e) => setForm({ ...form, altText: e.target.value })}
                    className="form-input"
                    placeholder="Founder portrait of Usman Ishaq at desk reviewing semantic SEO methodology document"
                  />
                </div>

                <div>
                  <label className="mono-pill block mb-1.5">Caption</label>
                  <p className="text-xs text-ink-muted mb-1.5">Visible caption shown below the image when used in content.</p>
                  <textarea
                    value={form.caption}
                    onChange={(e) => setForm({ ...form, caption: e.target.value })}
                    className="form-input min-h-[70px]"
                  />
                </div>

                <div>
                  <label className="mono-pill block mb-1.5">Description</label>
                  <p className="text-xs text-ink-muted mb-1.5">Longer context. Used in image schema markup.</p>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="form-input min-h-[90px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-line p-4 flex items-center justify-between bg-bg-2">
          <button
            type="button"
            onClick={onDelete}
            className="text-xs font-mono uppercase tracking-widest text-red-600 hover:text-red-700"
          >
            Delete image
          </button>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="btn-ghost text-xs">Cancel</button>
            <button type="button" onClick={save} disabled={saving} className="btn-primary text-xs disabled:opacity-60">
              {saving ? "Saving..." : "Save metadata →"}
            </button>
          </div>
        </div>

        <style>{`
          .form-input {
            width: 100%;
            padding: 10px 12px;
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
      </div>
    </div>
  )
}
