import Link from "next/link"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  const [published, drafts, media, homeEdited] = await Promise.all([
    prisma.post.count({ where: { published: true } }).catch(() => 0),
    prisma.post.count({ where: { published: false } }).catch(() => 0),
    prisma.media.count().catch(() => 0),
    prisma.siteContent.findUnique({ where: { key: "/" }, select: { updatedAt: true } }).catch(() => null),
  ])

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-5xl">
      <header className="mb-8 sm:mb-12 pb-6 sm:pb-8 border-b border-line">
        <h1 className="h2-display italic-accent">
          Welcome <em>back.</em>
        </h1>
        <p className="text-base text-ink-2 mt-2">Blog posts and the homepage of usmanishaq.com, edited from here.</p>
      </header>

      <section className="mb-12">
        <h2 className="mono-label mb-5">At a glance</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line">
          <StatCard label="Published posts" count={published} href="/usman-1000-admin/posts" />
          <StatCard label="Drafts" count={drafts} href="/usman-1000-admin/posts" />
          <StatCard label="Media files" count={media} href="/usman-1000-admin/media" />
          <StatCard label={homeEdited ? `Homepage edited ${homeEdited.updatedAt.toLocaleDateString()}` : "Homepage: original content"} count={homeEdited ? 1 : 0} href={`/usman-1000-admin/pages/site?path=${encodeURIComponent("/")}`} />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mono-label mb-5">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/usman-1000-admin/posts/new" className="btn-primary">+ New Post</Link>
          <Link href={`/usman-1000-admin/pages/site?path=${encodeURIComponent("/")}`} className="btn-ghost">Edit homepage</Link>
          <Link href="/usman-1000-admin/media" className="btn-ghost">Media library</Link>
        </div>
      </section>

      <section>
        <h2 className="mono-label mb-5">Where to edit</h2>
        <div className="bg-bg border border-line p-6 space-y-3 text-sm text-ink-2">
          <Help what="Blog posts: write, edit, schedule, publish" where="Posts" />
          <Help what="Post categories and byline authors" where="Categories, Authors" />
          <Help what="Images for posts and the homepage" where="Media Library" />
          <Help what="Homepage text, sections and SEO" where="Homepage → Visual edit, Sections or SEO" />
          <Help what="Your password" where="Account" />
          <Help what="Addresses blocked after failed sign-ins" where="Security" />
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, count, href }: { label: string; count: number; href: string }) {
  return (
    <Link href={href} className="bg-bg p-6 hover:bg-bg-2 transition-colors group block">
      <span className="mono-pill text-ink-muted block mb-2">{label}</span>
      <span className="font-display text-4xl sm:text-5xl font-medium text-ink group-hover:text-accent transition-colors block">{count}</span>
    </Link>
  )
}

function Help({ what, where }: { what: string; where: string }) {
  return (
    <p>
      <span className="text-accent font-medium">{what}</span> → {where}
    </p>
  )
}
