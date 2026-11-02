import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const updateSchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  title: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
})

export async function GET(_req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise
  // Dashboard data (drafts, scheduled items, admin emails): logged-in admins only.
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const author = await prisma.author.findUnique({
    where: { id: params.id },
    include: { _count: { select: { posts: true } } },
  })
  if (!author) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(author)
}

export async function PATCH(req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // Check duplicate slug (excluding current)
  if (parsed.data.slug) {
    const existing = await prisma.author.findFirst({
      where: { id: { not: params.id }, slug: parsed.data.slug },
    })
    if (existing) {
      return NextResponse.json(
        { error: "Another author with this slug already exists." },
        { status: 409 }
      )
    }
  }

  const updated = await prisma.author.update({
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

  // Posts keep working even if author is deleted — postAuthorId is set to NULL
  // automatically by the database (ON DELETE SET NULL).
  await prisma.author.delete({ where: { id: params.id } })
  revalidatePath("/blog")
  return new NextResponse(null, { status: 204 })
}
