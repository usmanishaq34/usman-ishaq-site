"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { saveMediaMeta } from "@/lib/media-meta"

interface MediaItem {
  id: string
  url: string
  filename: string
  altText: string | null
  title: string | null
  caption: string | null
  width: number | null
  height: number | null
}

interface Props {
  onClose: () => void
  onSelect: (url: string, meta?: { alt?: string; title?: string; caption?: string }) => void
}

/* Media library picker. A fresh upload first asks for its alt text and title,
   which are saved on the library record, so every later use of the image
   (featured image, editor, another post) comes with them filled in. */
export default function MediaLibraryModal({ onClose, onSelect }: Props) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [fresh, setFresh] = useState<MediaItem | null>(null)
  const [freshAlt, setFreshAlt] = useState("")
  const [freshTitle, setFreshTitle] = useState("")
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // cache:"no-store" makes sure the picker always shows the CURRENT library,
  // including anything uploaded seconds ago. Without it the browser serves a
  // stale copy and a fresh upload looks like it is missing.
  async function loadMedia() {
    try {
      const res = await fetch("/api/media", { cache: "no-store" })
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch {
      // keep whatever is already on screen
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMedia()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  async function handleUpload(file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload failed")
      const newItem = (await res.json()) as MediaItem
      setItems((prev) => [newItem, ...prev])
      setFresh(newItem)
      setFreshAlt("")
      setFreshTitle(file.name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " "))
      toast.success("Uploaded. Add the alt text and title.")
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  // Saves the alt text and title of the fresh upload to the library, then
  // hands the image to the caller with those values.
  async function useFresh(e: React.FormEvent) {
    e.preventDefault()
    if (!fresh) return
    setSaving(true)
    const ok = await saveMediaMeta(fresh, { alt: freshAlt.trim(), title: freshTitle.trim() })
    setSaving(false)
    if (!ok) toast.error("The alt text could not be saved to the library")
    const updated = { ...fresh, altText: freshAlt.trim(), title: freshTitle.trim() }
    setItems((prev) => prev.map((m) => (m.id === fresh.id ? updated : m)))
    setFresh(null)
    onSelect(updated.url, { alt: updated.altText || undefined, title: updated.title || undefined, caption: updated.caption ?? undefined })
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-bg w-full max-w-5xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <div>
            <h2 className="font-display text-xl font-semibold">Media Library</h2>
            <p className="text-xs text-ink-muted mt-0.5">Pick an image or upload a new one.</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUpload(file)
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-primary text-xs"
            >
              {uploading ? "Uploading..." : "Upload new"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-ink-muted hover:text-ink text-xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Fresh upload: alt text and title before it is used */}
        {fresh && (
          <form onSubmit={useFresh} className="px-6 py-4 border-b border-line bg-bg-2 flex gap-4 items-start flex-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fresh.url} alt="" className="w-20 h-20 object-cover border border-line flex-shrink-0" />
            <div className="flex-1 min-w-[240px] grid gap-2">
              <p className="mono-pill text-accent">New upload: {fresh.filename}</p>
              <input
                type="text"
                value={freshAlt}
                onChange={(e) => setFreshAlt(e.target.value)}
                placeholder="Alt text: what the image shows, for search engines and screen readers"
                className="w-full px-3 py-2 border border-line-strong text-sm"
                style={{ borderRadius: 2 }}
                autoFocus
                required
              />
              <input
                type="text"
                value={freshTitle}
                onChange={(e) => setFreshTitle(e.target.value)}
                placeholder="Title (shown on hover)"
                className="w-full px-3 py-2 border border-line-strong text-sm"
                style={{ borderRadius: 2 }}
              />
              <div className="flex gap-2 items-center">
                <button type="submit" className="btn-primary text-xs" disabled={saving}>
                  {saving ? "Saving..." : "Save and use this image"}
                </button>
                <button type="button" className="text-xs font-mono uppercase tracking-widest text-ink-muted hover:text-ink" onClick={() => setFresh(null)}>
                  Later
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-20 text-ink-muted">Loading library...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-ink-muted mb-3">No images yet.</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-ghost"
              >
                Upload your first image →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    onSelect(item.url, {
                      alt: item.altText ?? undefined,
                      title: item.title ?? undefined,
                      caption: item.caption ?? undefined,
                    })
                  }
                  className="group text-left border border-line hover:border-accent transition-colors overflow-hidden"
                >
                  <div className="aspect-square bg-bg-3 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={item.altText ?? item.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2 bg-bg">
                    <p className="text-xs font-mono text-ink truncate">{item.filename}</p>
                    {item.altText ? (
                      <p className="text-[10px] text-ink-muted truncate mt-0.5">alt: {item.altText}</p>
                    ) : (
                      <p className="text-[10px] text-amber-600 truncate mt-0.5">⚠ no alt text</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
