// Keeps the Media Library in step with the alt text, title and caption typed
// next to an image in the post editor: the library record for that URL is
// updated, so the next time the image is picked the fields come filled in.
// The reverse also works: a URL pasted into a picker is looked up here.

export type MediaMeta = { alt?: string; title?: string; caption?: string }

export type MediaRecord = { id: string; url: string; altText: string | null; title: string | null; caption: string | null }

export async function findMediaByUrl(url: string): Promise<MediaRecord | null> {
  if (!url) return null
  try {
    const res = await fetch("/api/media", { cache: "no-store" })
    const items = (await res.json()) as MediaRecord[]
    if (!Array.isArray(items)) return null
    const wanted = url.trim()
    return items.find((m) => m.url === wanted) ?? null
  } catch {
    return null
  }
}

export async function saveMediaMeta(target: string | { id: string }, meta: MediaMeta): Promise<boolean> {
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
