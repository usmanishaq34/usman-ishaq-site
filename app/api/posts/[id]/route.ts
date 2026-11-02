import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { pingIndexNow } from "@/lib/indexnow"
import { z } from "zod"

const updateSchema = z.object({
  title: z.string().optional(),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  categoryId: z.string().nullable().optional(),
  postAuthorId: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
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
  published: z.boolean().optional(),
  publishedAt: z.string().nullable().optional(),
  status: z.enum(["draft", "scheduled", "published"]).optional(),
  scheduledFor: z.string().nullable().optional(),
})

export async function GET(_req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise
  // Dashboard data (drafts, scheduled items, admin emails): logged-in admins only.
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { category: true },
  })
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(post)
}

export async function PATCH(req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const updated = await prisma.post.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      publishedAt:
        parsed.data.publishedAt !== undefined
          ? parsed.data.publishedAt
            ? new Date(parsed.data.publishedAt)
            : null
          : undefined,
      scheduledFor:
        parsed.data.scheduledFor !== undefined
          ? parsed.data.scheduledFor
            ? new Date(parsed.data.scheduledFor)
            : null
          : undefined,
    },
  })

  revalidatePath("/blog")
  revalidatePath("/")
  revalidatePath("/sitemap.xml")
  revalidatePath(`/blog/${updated.slug}`)

  // Fires on first publish and on every later edit of a live post, so search
  // engines are told the page changed. Posts marked noindex are skipped.
  if (updated.published && !updated.noindex) {
    await pingIndexNow([
      `https://usmanishaq.com/blog/${updated.slug}`,
      "https://usmanishaq.com/blog",
    ])
  }

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const post = await prisma.post.findUnique({ where: { id: params.id } })
  await prisma.post.delete({ where: { id: params.id } })

  if (post) {
    revalidatePath("/blog")
    revalidatePath(`/blog/${post.slug}`)
  }

  return new NextResponse(null, { status: 204 })
}
