import Link from "next/link"
import { prisma } from "@/lib/db"
import DeleteWithUndo from "@/components/admin/DeleteWithUndo"

export default async function CategoriesAdminPage() {
  const categories = await prisma.category
    .findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: true } } },
    })
    .catch(() => [] as any[])

  return (
    <div className="max-w-5xl">
      <header className="mb-6 sm:mb-10 pb-6 border-b border-line flex items-end justify-between flex-wrap gap-4">
        <div>
          <span className="section-label mb-4">Taxonomy</span>
          <h1 className="h2-display italic-accent">
            Categories
          </h1>
          <p className="text-base text-ink-2 mt-2">
            Group posts into topics. Each category has its own SEO meta.
          </p>
        </div>
        <Link href="/usman-1000-admin/categories/new" className="btn-primary">
          + New Category
        </Link>
      </header>

      {categories.length === 0 ? (
        <div className="p-12 sm:p-20 border border-dashed border-line text-center">
          <p className="text-ink-muted mb-6">No categories yet.</p>
          <Link href="/usman-1000-admin/categories/new" className="btn-primary">
            Create your first category
          </Link>
        </div>
      ) : (
        <>
          {/* ============ DESKTOP / TABLET TABLE ============ */}
          <div className="hidden md:block border border-line bg-bg admin-table-wrap">
            <table className="w-full">
              <thead className="bg-bg-3 border-b border-line">
                <tr>
                  <th className="text-left px-6 py-3.5 mono-pill">Name</th>
                  <th className="text-left px-6 py-3.5 mono-pill">Slug</th>
                  <th className="text-left px-6 py-3.5 mono-pill">Posts</th>
                  <th className="text-right px-6 py-3.5 mono-pill">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat: any) => (
                  <tr key={cat.id} className="border-b border-line last:border-b-0 hover:bg-bg-2 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/usman-1000-admin/categories/${cat.id}`}
                        className="font-display text-base font-medium text-ink hover:text-accent"
                      >
                        {cat.name}
                      </Link>
                      {cat.description && (
                        <p className="text-xs text-ink-muted mt-1 line-clamp-1">{cat.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-ink-muted">/{cat.slug}</td>
                    <td className="px-6 py-4 text-sm text-ink-2">
                      <span className="mono-pill">{cat._count.posts}</span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/usman-1000-admin/categories/${cat.id}`}
                        className="font-mono text-xs uppercase tracking-widest font-bold text-accent hover:underline"
                      >
                        Edit →
                      </Link>
                      {cat._count.posts === 0 ? (
                        <DeleteWithUndo
                          itemId={cat.id}
                          itemLabel="category"
                          itemName={cat.name}
                          apiPath="/api/categories"
                        />
                      ) : (
                        <span
                          className="font-mono text-xs uppercase tracking-widest font-bold text-ink-muted ml-3"
                          title={`In use by ${cat._count.posts} post(s)`}
                        >
                          In use
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ============ MOBILE CARDS ============ */}
          <ul className="md:hidden space-y-3">
            {categories.map((cat: any) => (
              <li key={cat.id} className="border border-line bg-bg p-4">
                <Link
                  href={`/usman-1000-admin/categories/${cat.id}`}
                  className="font-display text-base font-medium text-ink hover:text-accent break-words"
                >
                  {cat.name}
                </Link>
                {cat.description && (
                  <p className="text-xs text-ink-muted mt-1 line-clamp-2">{cat.description}</p>
                )}

                <div className="font-mono text-sm text-ink-muted mt-1 break-all">/{cat.slug}</div>

                <div className="flex items-center gap-3 mt-3 text-sm text-ink-2">
                  <span className="mono-pill">{cat._count.posts} posts</span>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-line">
                  <Link
                    href={`/usman-1000-admin/categories/${cat.id}`}
                    className="font-mono text-xs uppercase tracking-widest font-bold text-accent hover:underline"
                  >
                    Edit →
                  </Link>
                  {cat._count.posts === 0 ? (
                    <DeleteWithUndo
                      itemId={cat.id}
                      itemLabel="category"
                      itemName={cat.name}
                      apiPath="/api/categories"
                    />
                  ) : (
                    <span
                      className="font-mono text-xs uppercase tracking-widest font-bold text-ink-muted"
                      title={`In use by ${cat._count.posts} post(s)`}
                    >
                      In use
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}