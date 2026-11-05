/**
 * POST /api/ingest/posts — machine publishing endpoint for seo-engine.
 *
 * Drop this file into app/api/ingest/posts/route.ts in digital-vikingz and usman-ishaq-site.
 * Both repos share lib/db, lib/indexnow, zod and the same Post model, so the file is identical.
 *
 * Auth: `Authorization: Bearer <CONTENT_API_TOKEN>` (env var, set in Vercel). No session, no cookie.
 * Author: the User whose email is CONTENT_API_USER_EMAIL, else the first ADMIN user.
 * Behaviour: upsert by slug. A new slug returns 201, an existing one is updated and returns 200.
 * Side effects match the dashboard: path revalidation, IndexNow ping when published and indexable.
 */
import { NextResponse } from "next/server"
import { timingSafeEqual } from "crypto"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { pingIndexNow } from "@/lib/indexnow"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase kebab-case"),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  tags: z.array(z.string()).default([]),
  categorySlug: z.string().nullable().optional(),
  authorSlug: z.string().nullable().optional(),
  featuredImage: z.string().nullable().optional(),
  featuredImageAlt: z.string().nullable().optional(),
  featuredImageTitle: z.string().nullable().optional(),
  featuredImageCaption: z.string().nullable().optional(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  focusKeyword: z.string().nullable().optional(),
  secondaryKeywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().nullable().optional(),
  noindex: z.boolean().optional(),
  nofollow: z.boolean().optional(),
  ogTitle: z.string().nullable().optional(),
  ogDescription: z.string().nullable().optional(),
  ogImage: z.string().nullable().optional(),
  twitterTitle: z.string().nullable().optional(),
  twitterDescription: z.string().nullable().optional(),
  twitterImage: z.string().nullable().optional(),
  schemaType: z.string().nullable().optional(),
  readingTimeMinutes: z.number().int().positive().nullable().optional(),
  status: z.enum(["draft", "scheduled", "published"]).default("draft"),
  published: z.boolean().optional(),
  publishedAt: z.string().nullable().optional(),
  scheduledFor: z.string().nullable().optional(),
  source: z.record(z.string(), z.any()).optional(), // provenance from the pipeline; not stored
})

function authorized(req: Request): boolean {
  const expected = process.env.CONTENT_API_TOKEN
  const header = req.headers.get("authorization") || ""
  const got = header.startsWith("Bearer ") ? header.slice(7).trim() : ""
  if (!expected || !got) return false
  const a = Buffer.from(got)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "")
}

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const user = await systemUser()
  return NextResponse.json({ ok: true, site: siteUrl(), author: user ? user.email : null })
}

async function systemUser() {
  const email = process.env.CONTENT_API_USER_EMAIL
  if (email) return prisma.user.findUnique({ where: { email } })
  return prisma.user.findFirst({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" } })
}

export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }) }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const input = parsed.data

  const user = await systemUser()
  if (!user) return NextResponse.json({ error: "No admin user to attribute the post to" }, { status: 500 })

  let categoryId: string | null = null
  if (input.categorySlug) {
    const cat = await prisma.category.findUnique({ where: { slug: input.categorySlug } })
    if (!cat) return NextResponse.json({ error: `Unknown category slug "${input.categorySlug}"` }, { status: 400 })
    categoryId = cat.id
  }
  let postAuthorId: string | null = null
  if (input.authorSlug) {
    const a = await prisma.author.findUnique({ where: { slug: input.authorSlug } })
    if (!a) return NextResponse.json({ error: `Unknown author slug "${input.authorSlug}"` }, { status: 400 })
    postAuthorId = a.id
  }

  const published = input.published ?? input.status === "published"
  const { categorySlug, authorSlug, source, status, publishedAt, scheduledFor, ...rest } = input
  const data = {
    ...rest,
    status,
    published,
    publishedAt: published ? new Date(publishedAt || Date.now()) : null,
    scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
    categoryId,
    postAuthorId,
  }

  const existing = await prisma.post.findUnique({ where: { slug: input.slug }, select: { id: true } })
  const post = existing
    ? await prisma.post.update({ where: { id: existing.id }, data })
    : await prisma.post.create({ data: { ...data, authorId: user.id } })

  for (const p of ["/", "/blog", `/blog/${post.slug}`, "/sitemap.xml"]) {
    try { revalidatePath(p) } catch {}
  }
  if (post.published && !post.noindex) {
    await pingIndexNow([`${siteUrl()}/blog/${post.slug}`, `${siteUrl()}/blog`])
  }

  return NextResponse.json(
    { id: post.id, slug: post.slug, status: post.status, published: post.published, url: post.published ? `${siteUrl()}/blog/${post.slug}` : null, previewUrl: `${siteUrl()}/preview/${post.id}` },
    { status: existing ? 200 : 201 },
  )
}
