import MediaLibraryView from "@/components/admin/MediaLibraryView"
import { prisma } from "@/lib/db"

export default async function AdminMediaPage() {
  const items = await prisma.media.findMany({ orderBy: { createdAt: "desc" } }).catch(() => [])

  return (
    <div className="max-w-7xl">
      <header className="mb-10 pb-6 border-b border-line">
        <span className="section-label mb-4">Library</span>
        <h1 className="h2-display italic-accent">Media <em>library.</em></h1>
        <p className="text-base text-ink-2 mt-2">Upload, organize, and manage all images. Click any image to edit alt text, title, caption, and description.</p>
      </header>

      <MediaLibraryView initialItems={items as any} />
    </div>
  )
}
