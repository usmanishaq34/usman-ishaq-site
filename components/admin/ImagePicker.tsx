"use client"

import { useEffect, useRef, useState } from "react"
import MediaLibraryModal from "./MediaLibraryModal"
import { saveMediaMeta } from "@/lib/media-meta"

interface ImagePickerProps {
  value: string
  onChange: (url: string, meta?: { alt?: string; title?: string; caption?: string }) => void
  // Optional inline metadata fields
  altValue?: string
  onAltChange?: (alt: string) => void
  titleValue?: string
  onTitleChange?: (title: string) => void
  captionValue?: string
  onCaptionChange?: (caption: string) => void
  showInlineMeta?: boolean
}

/* Featured image picker. An image picked from the library brings its alt
   text, title and caption along; alt text, title and caption typed here are
   written back to the library record, so the two never drift apart. */
export default function ImagePicker({
  value,
  onChange,
  altValue,
  onAltChange,
  titleValue,
  onTitleChange,
  captionValue,
  onCaptionChange,
  showInlineMeta = false,
}: ImagePickerProps) {
  const [showLibrary, setShowLibrary] = useState(false)
  const [synced, setSynced] = useState<"idle" | "saving" | "ok" | "none">("idle")
  // Only values typed here are written back, never the ones loaded with the post.
  const touched = useRef(false)
  const timer = useRef<number | null>(null)

  function handlePick(url: string, meta?: { alt?: string; title?: string; caption?: string }) {
    touched.current = false
    onChange(url, meta)
    if (onAltChange) onAltChange(meta?.alt ?? "")
    if (onTitleChange) onTitleChange(meta?.title ?? "")
    if (onCaptionChange) onCaptionChange(meta?.caption ?? "")
    setShowLibrary(false)
  }

  function edit(fn: ((v: string) => void) | undefined, v: string) {
    touched.current = true
    fn?.(v)
  }

  useEffect(() => {
    if (!touched.current || !value) return
    if (timer.current) window.clearTimeout(timer.current)
    setSynced("saving")
    timer.current = window.setTimeout(async () => {
      const ok = await saveMediaMeta(value, { alt: altValue ?? "", title: titleValue ?? "", caption: captionValue ?? "" })
      setSynced(ok ? "ok" : "none")
    }, 900)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [value, altValue, titleValue, captionValue])

  return (
    <div className="space-y-3">
      {value ? (
        <div className="border border-line bg-bg p-3 flex gap-3 items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={altValue ?? ""}
            className="w-24 h-24 object-cover border border-line flex-shrink-0"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = "none"
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="mono-pill text-ink-muted mb-1">Current image</p>
            <p className="text-xs font-mono text-ink-2 break-all line-clamp-2">{value}</p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowLibrary(true)}
                className="text-xs font-mono uppercase tracking-widest text-accent hover:underline"
              >
                Change
              </button>
              <span className="text-ink-muted">·</span>
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-xs font-mono uppercase tracking-widest text-ink-muted hover:text-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-line-strong p-6 text-center bg-bg">
          <p className="text-sm text-ink-muted mb-3">No image selected</p>
          <button
            type="button"
            onClick={() => setShowLibrary(true)}
            className="btn-ghost"
          >
            Select from media library →
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">Or paste URL:</span>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="flex-1 px-3 py-2 border border-line-strong text-sm font-mono"
          style={{ borderRadius: 2 }}
        />
      </div>

      {/* Inline metadata fields (alt/title/caption) */}
      {showInlineMeta && value && (
        <div className="grid grid-cols-1 gap-3 pt-3 border-t border-line">
          <div>
            <label className="mono-pill block mb-1.5">Image alt text *</label>
            <input
              type="text"
              value={altValue ?? ""}
              onChange={(e) => edit(onAltChange, e.target.value)}
              placeholder="Describe the image for screen readers"
              className="w-full px-3 py-2 border border-line-strong text-sm"
              style={{ borderRadius: 2 }}
            />
          </div>
          <div>
            <label className="mono-pill block mb-1.5">Image title (tooltip)</label>
            <input
              type="text"
              value={titleValue ?? ""}
              onChange={(e) => edit(onTitleChange, e.target.value)}
              placeholder="Shown on hover"
              className="w-full px-3 py-2 border border-line-strong text-sm"
              style={{ borderRadius: 2 }}
            />
          </div>
          <div>
            <label className="mono-pill block mb-1.5">Caption</label>
            <textarea
              value={captionValue ?? ""}
              onChange={(e) => edit(onCaptionChange, e.target.value)}
              placeholder="Visible caption below image"
              className="w-full px-3 py-2 border border-line-strong text-sm min-h-[60px]"
              style={{ borderRadius: 2 }}
            />
          </div>
          <p className="text-[11px] text-ink-muted">
            {synced === "saving" && "Saving to the media library…"}
            {synced === "ok" && "Saved to the media library too, so the image keeps these next time."}
            {synced === "none" && "This URL is not in the media library, so these apply to this post only."}
            {synced === "idle" && "Changes here are also saved on the image in the media library."}
          </p>
        </div>
      )}

      {showLibrary && (
        <MediaLibraryModal
          onClose={() => setShowLibrary(false)}
          onSelect={handlePick}
        />
      )}
    </div>
  )
}
