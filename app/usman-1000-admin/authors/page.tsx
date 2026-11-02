import Link from "next/link"
import { prisma } from "@/lib/db"

export default async function AuthorsAdminPage() {
  const authors = await prisma.author
    .findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: true } } },
    })
    .catch(() => [] as any[])

  return (
    <div className="max-w-5xl">
      <header className="mb-6 sm:mb-10 pb-6 border-b border-line flex items-end justify-between flex-wrap gap-4">
        <div>
          <span className="section-label mb-4">People</span>
          <h1 className="h2-display italic-accent">Authors</h1>
          <p className="text-base text-ink-2 mt-2">
            Byline authors shown on blog posts. Each has a name, photo, title and bio.
          </p>
        </div>
        <Link href="/usman-1000-admin/authors/new" className="btn-primary">
          + New Author
        </Link>
      </header>

      {authors.length === 0 ? (
        <div className="p-12 sm:p-20 border border-dashed border-line text-center">
          <p className="text-ink-muted mb-6">No authors yet.</p>
          <Link href="/usman-1000-admin/authors/new" className="btn-primary">
            Create your first author
          </Link>
        </div>
      ) : (
        <>
          {/* ============ DESKTOP / TABLET TABLE ============ */}
          <div className="hidden md:block border border-line bg-bg admin-table-wrap">
            <table className="w-full">
              <thead className="bg-bg-3 border-b border-line">
                <tr>
                  <th className="text-left px-6 py-3.5 mono-pill">Author</th>
                  <th className="text-left px-6 py-3.5 mono-pill">Title</th>
                  <th className="text-left px-6 py-3.5 mono-pill">Posts</th>
                  <th className="text-right px-6 py-3.5 mono-pill">Actions</th>
                </tr>
              </thead>
              <tbody>
                {authors.map((a: any) => (
                  <tr key={a.id} className="border-b border-line last:border-b-0 hover:bg-bg-2 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {a.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={a.photoUrl}
                            alt={a.name}
                            className="w-9 h-9 rounded-full object-cover border border-line flex-shrink-0"
                          />
                        ) : (
                          <span className="w-9 h-9 rounded-full bg-bg-3 border border-line flex items-center justify-center font-display italic text-accent flex-shrink-0">
                            {a.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                        <Link
                          href={`/usman-1000-admin/authors/${a.id}`}
                          className="font-display text-base font-medium text-ink hover:text-accent"
                        >
                          {a.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-muted">{a.title || "—"}</td>
                    <td className="px-6 py-4 text-sm text-ink-2">
                      <span className="mono-pill">{a._count.posts}</span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/usman-1000-admin/authors/${a.id}`}
                        className="font-mono text-xs uppercase tracking-widest font-bold text-accent hover:underline"
                      >
                        Edit →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ============ MOBILE CARDS ============ */}
          <ul className="md:hidden space-y-3">
            {authors.map((a: any) => (
              <li key={a.id} className="border border-line bg-bg p-4">
                <div className="flex items-center gap-3">
                  {a.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.photoUrl}
                      alt={a.name}
                      className="w-10 h-10 rounded-full object-cover border border-line flex-shrink-0"
                    />
                  ) : (
                    <span className="w-10 h-10 rounded-full bg-bg-3 border border-line flex items-center justify-center font-display italic text-accent flex-shrink-0">
                      {a.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <Link
                    href={`/usman-1000-admin/authors/${a.id}`}
                    className="font-display text-base font-medium text-ink hover:text-accent break-words"
                  >
                    {a.name}
                  </Link>
                </div>
                {a.title && <p className="text-xs text-ink-muted mt-2">{a.title}</p>}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-line">
                  <span className="mono-pill">{a._count.posts} posts</span>
                  <Link
                    href={`/usman-1000-admin/authors/${a.id}`}
                    className="font-mono text-xs uppercase tracking-widest font-bold text-accent hover:underline"
                  >
                    Edit →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
