import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { pingIndexNow } from "@/lib/indexnow"
import { z } from "zod"

const createSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  categoryId: z.string().nullable().optional(),
  postAuthorId: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
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
  published: z.boolean().default(false),
  publishedAt: z.string().nullable().optional(),
  status: z.enum(["draft", "scheduled", "published"]).default("draft"),
  scheduledFor: z.string().nullable().optional(),
})

export async function GET() {
  // Dashboard data (drafts, scheduled items, admin emails): logged-in admins only.
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: true, author: { select: { id: true, name: true, email: true } } },
  })
  return NextResponse.json(posts)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const post = await prisma.post.create({
    data: {
      ...parsed.data,
      authorId: (session.user as any).id,
      publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : null,
      scheduledFor: parsed.data.scheduledFor ? new Date(parsed.data.scheduledFor) : null,
    },
  })

  revalidatePath("/blog")
  revalidatePath("/")
  revalidatePath("/sitemap.xml")
  revalidatePath(`/blog/${post.slug}`)

  // A post created straight into published state is live immediately.
  if (post.published && !post.noindex) {
    await pingIndexNow([
      `https://usmanishaq.com/blog/${post.slug}`,
      "https://usmanishaq.com/blog",
    ])
  }

  return NextResponse.json(post, { status: 201 })
}
