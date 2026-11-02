import Link from "next/link"
import { prisma } from "@/lib/db"
import DeleteWithUndo from "@/components/admin/DeleteWithUndo"

export default async function PostsAdminPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  }).catch(() => [])

  // Format helpers — force Asia/Karachi timezone (PKT) so Vercel UTC servers
  // don't render times 5 hours behind for our team in Pakistan.
  const fmtDateTime = (d: Date | string) =>
    new Date(d).toLocaleString("en-US", {
      timeZone: "Asia/Karachi",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

  const fmtDate = (d: Date | string) =>
    new Date(d).toLocaleDateString("en-US", {
      timeZone: "Asia/Karachi",
      year: "numeric",
      month: "short",
      day: "numeric",
    })

  // Shared helpers so table and mobile cards stay consistent
  const renderStatus = (post: any) => {
    const status = post.status as string | undefined
    const scheduledFor = post.scheduledFor as Date | null | undefined
    if (status === "scheduled" && scheduledFor) {
      return (
        <span className="mono-pill text-accent" title={fmtDateTime(scheduledFor)}>
          ◐ Scheduled
        </span>
      )
    }
    if (status === "published" || post.published) {
      return <span className="mono-pill text-green-700">● Published</span>
    }
    return <span className="mono-pill text-ink-muted">○ Draft</span>
  }

  const renderDate = (post: any) => {
    const status = post.status as string | undefined
    const scheduledFor = post.scheduledFor as Date | null | undefined
    if (status === "scheduled" && scheduledFor) {
      return fmtDateTime(scheduledFor)
    }
    return fmtDate(post.createdAt)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl">
      <header className="mb-6 sm:mb-10 pb-6 sm:pb-8 border-b border-line flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="h2-display italic-accent">Blog <em>posts</em></h1>
          <p className="text-base text-ink-2 mt-2">{posts.length} post{posts.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/usman-1000-admin/posts/new" className="btn-primary">+ New Post</Link>
      </header>

      {posts.length === 0 ? (
        <div className="p-12 sm:p-20 border border-dashed border-line text-center">
          <p className="text-ink-muted mb-6">No posts yet.</p>
          <Link href="/usman-1000-admin/posts/new" className="btn-primary">Create your first post</Link>
        </div>
      ) : (
        <>
          {/* ============ DESKTOP / TABLET TABLE (hidden on mobile) ============ */}
          <div className="hidden md:block border border-line admin-table-wrap">
            <table className="w-full">
              <thead className="bg-bg-2 border-b border-line">
                <tr>
                  <th className="text-left mono-pill text-ink-muted py-3 px-4">Title</th>
                  <th className="text-left mono-pill text-ink-muted py-3 px-4">Category</th>
                  <th className="text-left mono-pill text-ink-muted py-3 px-4">Status</th>
                  <th className="text-left mono-pill text-ink-muted py-3 px-4">Date</th>
                  <th className="text-right mono-pill text-ink-muted py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-line last:border-b-0 hover:bg-bg-2 transition-colors">
                    <td className="py-4 px-4 font-display text-base font-medium text-ink">{post.title}</td>
                    <td className="py-4 px-4 text-sm text-ink-2">{post.category?.name ?? "Uncategorized"}</td>
                    <td className="py-4 px-4">{renderStatus(post)}</td>
                    <td className="py-4 px-4 text-sm text-ink-muted">{renderDate(post)}</td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <Link href={`/usman-1000-admin/posts/${post.id}`} className="font-mono text-xs uppercase tracking-widest font-bold text-accent hover:underline">
                        Edit →
                      </Link>
                      <DeleteWithUndo
                        itemId={post.id}
                        itemLabel="post"
                        itemName={post.title}
                        apiPath="/api/posts"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ============ MOBILE CARDS (hidden on tablet+) ============ */}
          <ul className="md:hidden space-y-3">
            {posts.map((post) => (
              <li key={post.id} className="border border-line p-4">
                <div className="font-display text-base font-medium text-ink mb-2 break-words">
                  {post.title}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-2 mb-3">
                  <span>{post.category?.name ?? "Uncategorized"}</span>
                  <span className="text-ink-muted">·</span>
                  <span>{renderStatus(post)}</span>
                </div>

                <div className="text-xs text-ink-muted mb-4">{renderDate(post)}</div>

                <div className="flex items-center justify-between border-t border-line pt-3">
                  <Link
                    href={`/usman-1000-admin/posts/${post.id}`}
                    className="font-mono text-xs uppercase tracking-widest font-bold text-accent hover:underline"
                  >
                    Edit →
                  </Link>
                  <DeleteWithUndo
                    itemId={post.id}
                    itemLabel="post"
                    itemName={post.title}
                    apiPath="/api/posts"
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}