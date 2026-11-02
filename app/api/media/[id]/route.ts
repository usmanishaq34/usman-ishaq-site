import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { unlink } from "fs/promises"
import { join } from "path"
import { z } from "zod"

const updateSchema = z.object({
  title: z.string().nullable().optional(),
  altText: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
})

export async function GET(_req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise
  // Dashboard data (drafts, scheduled items, admin emails): logged-in admins only.
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const m = await prisma.media.findUnique({ where: { id: params.id } })
  if (!m) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(m)
}

export async function PATCH(req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const updated = await prisma.media.update({
    where: { id: params.id },
    data: parsed.data,
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const media = await prisma.media.findUnique({ where: { id: params.id } })
  if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Delete local file (if local upload)
  if (media.url.startsWith("/uploads/")) {
    try {
      await unlink(join(process.cwd(), "public", media.url))
    } catch {
      // File may not exist, that's fine
    }
  }

  await prisma.media.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}
