import SitePagesTable, { type SitePageRow } from "@/components/admin/site/SitePagesTable"
import { prisma } from "@/lib/db"
import { routes } from "@/lib/routes"
import { isEditablePage } from "@/lib/site-content"

export const dynamic = "force-dynamic"

// Pages of the site. The homepage has editable sections and SEO; the blog
// index has editable SEO (its posts are managed under Posts).
export default async function AdminPagesList() {
  const edits = await prisma.siteContent
    .findMany({ where: { key: { in: routes.map((r) => r.path) } }, select: { key: true, updatedAt: true } })
    .catch(() => [] as { key: string; updatedAt: Date }[])
  const editedAt = new Map(edits.map((e) => [e.key, e.updatedAt]))
  const rows: SitePageRow[] = routes.map((route) => ({ route, editable: isEditablePage(route.path), edited: editedAt.get(route.path) ?? null }))

  return (
    <div className="max-w-6xl">
      <header className="mb-6 sm:mb-10 pb-6 border-b border-line">
        <span className="section-label mb-4">Content</span>
        <h1 className="h2-display italic-accent">Site <em>pages.</em></h1>
        <p className="text-base text-ink-2 mt-2 max-w-3xl">
          Open the homepage to edit its sections and SEO. Changes go live as soon as you save. Blog posts are under{" "}
          <a className="text-accent underline" href="/usman-1000-admin/posts">Posts</a>.
        </p>
      </header>
      <SitePagesTable title="Pages" rows={rows} />
    </div>
  )
}
