import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
})

export async function GET() {
  // Dashboard data (drafts, scheduled items, admin emails): logged-in admins only.
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const authors = await prisma.author.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  })
  return NextResponse.json(authors)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // Check duplicate slug
  const existing = await prisma.author.findFirst({
    where: { slug: parsed.data.slug },
  })
  if (existing) {
    return NextResponse.json(
      { error: "An author with this slug already exists." },
      { status: 409 }
    )
  }

  const author = await prisma.author.create({ data: parsed.data })

  revalidatePath("/blog")
  return NextResponse.json(author, { status: 201 })
}
