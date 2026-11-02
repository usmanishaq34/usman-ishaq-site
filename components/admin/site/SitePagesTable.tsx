import Link from "next/link"
import type { Route } from "@/lib/routes"

export type SitePageRow = { route: Route; editable: boolean; edited: Date | null }

/* The dashboard's list of site pages. "Full content" pages have every section
   editable; "SEO" pages have editable title, description, OG image, canonical
   and noindex (their body still comes from code). */
export default function SitePagesTable({ title, rows }: { title: string; rows: SitePageRow[] }) {
  if (rows.length === 0) return null
  return (
    <section className="mb-10">
      <h2 className="font-display text-xl font-medium text-ink mb-3">{title}</h2>
      <div className="bg-bg border border-line admin-table-wrap overflow-x-auto">
        <table className="w-full">
          <thead className="bg-bg-3 border-b border-line">
            <tr>
              <th className="text-left px-6 py-3.5 mono-pill">Page</th>
              <th className="text-left px-6 py-3.5 mono-pill">URL</th>
              <th className="text-left px-6 py-3.5 mono-pill">Editable</th>
              <th className="text-left px-6 py-3.5 mono-pill">Status</th>
              <th className="text-right px-6 py-3.5 mono-pill">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ route, editable, edited }) => {
              const editHref = `/usman-1000-admin/pages/site?path=${encodeURIComponent(route.path)}`
              return (
                <tr key={route.path} className="border-b border-line last:border-b-0 hover:bg-bg-2 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={editHref} className="font-display text-lg font-medium text-ink hover:text-accent">
                      {route.label}
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-ink-muted">{route.path}</td>
                  <td className="px-6 py-4">
                    <span className="mono-pill text-ink-2">{editable ? "Full content" : "SEO"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`mono-pill ${edited ? "text-accent" : "text-ink-muted"}`}>
                      {edited ? `● Edited ${edited.toLocaleDateString()}` : "○ Default"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <Link href={editHref} className="mono-pill text-accent hover:underline mr-4">Edit →</Link>
                    <a href={route.path} target="_blank" rel="noopener noreferrer" className="mono-pill text-ink-muted hover:text-accent">View</a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
