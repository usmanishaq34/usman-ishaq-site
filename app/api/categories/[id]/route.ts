import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const updateSchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
})

export async function GET(_req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise
  // Dashboard data (drafts, scheduled items, admin emails): logged-in admins only.
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const cat = await prisma.category.findUnique({
    where: { id: params.id },
    include: { _count: { select: { posts: true } } },
  })
  if (!cat) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(cat)
}

export async function PATCH(req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // Check duplicate slug/name (excluding current)
  if (parsed.data.slug || parsed.data.name) {
    const existing = await prisma.category.findFirst({
      where: {
        id: { not: params.id },
        OR: [
          ...(parsed.data.slug ? [{ slug: parsed.data.slug }] : []),
          ...(parsed.data.name ? [{ name: parsed.data.name }] : []),
        ],
      },
    })
    if (existing) {
      return NextResponse.json(
        { error: "Another category with this name or slug already exists." },
        { status: 409 }
      )
    }
  }

  const updated = await prisma.category.update({
    where: { id: params.id },
    data: parsed.data,
  })

  revalidatePath("/blog")
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Check if category has posts or services
  const counts = await prisma.category.findUnique({
    where: { id: params.id },
    include: { _count: { select: { posts: true } } },
  })

  if (counts && (counts._count.posts > 0)) {
    return NextResponse.json(
      {
        error: `Cannot delete category — it is used by ${counts._count.posts} post(s). Reassign or delete those first.`,
      },
      { status: 409 }
    )
  }

  await prisma.category.delete({ where: { id: params.id } })
  revalidatePath("/blog")
  return new NextResponse(null, { status: 204 })
}
