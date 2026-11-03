// Keeps the Media Library in step with the alt text, title and caption typed
// next to an image in the post editor: the library record for that URL is
// updated, so the next time the image is picked the fields come filled in.

export type MediaMeta = { alt?: string; title?: string; caption?: string }

type MediaItem = { id: string; url: string }

export async function findMediaByUrl(url: string): Promise<MediaItem | null> {
  if (!url) return null
  try {
    const res = await fetch("/api/media", { cache: "no-store" })
    const items = (await res.json()) as MediaItem[]
    return Array.isArray(items) ? (items.find((m) => m.url === url) ?? null) : null
  } catch {
    return null
  }
}

export async function saveMediaMeta(target: string | MediaItem, meta: MediaMeta): Promise<boolean> {
  const item = typeof target === "string" ? await findMediaByUrl(target) : target
  if (!item) return false
  const body: Record<string, string> = {}
  if (meta.alt !== undefined) body.altText = meta.alt
  if (meta.title !== undefined) body.title = meta.title
  if (meta.caption !== undefined) body.caption = meta.caption
  if (Object.keys(body).length === 0) return true
  try {
    const res = await fetch(`/api/media/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    return res.ok
  } catch {
    return false
  }
}
