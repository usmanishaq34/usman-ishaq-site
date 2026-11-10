/**
 * POST /api/ingest/media — machine image upload for seo-engine.
 *
 * Auth: `Authorization: Bearer <CONTENT_API_TOKEN>`, the same token as /api/ingest/posts.
 * Body: multipart form with `file` (image, max 5 MB) and optional `altText`, `title`, `caption`.
 * Stores the file in Supabase Storage under ingest/<name> and records it in the Media Library.
 * A file sent again under the same name replaces the stored file and updates its record.
 */
import { NextResponse } from "next/server"
import { timingSafeEqual } from "crypto"
import { createClient } from "@supabase/supabase-js"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_BYTES = 5 * 1024 * 1024

function authorized(req: Request): boolean {
  const expected = process.env.CONTENT_API_TOKEN
  const header = req.headers.get("authorization") || ""
  const got = header.startsWith("Bearer ") ? header.slice(7).trim() : ""
  if (!expected || !got) return false
  const a = Buffer.from(got)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

async function systemUser() {
  const email = process.env.CONTENT_API_USER_EMAIL
  if (email) return prisma.user.findUnique({ where: { email } })
  return prisma.user.findFirst({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" } })
}

function text(form: FormData, key: string): string | null {
  const v = form.get(key)
  return typeof v === "string" && v.trim() ? v.trim() : null
}

export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const bucket = process.env.SUPABASE_STORAGE_BUCKET
  if (!supabaseUrl || !serviceKey || !bucket) {
    return NextResponse.json({ error: "Storage is not configured" }, { status: 500 })
  }

  let form: FormData
  try { form = await req.formData() } catch { return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 }) }
  const file = form.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 })
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only images allowed" }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 })

  const user = await systemUser()
  if (!user) return NextResponse.json({ error: "No admin user to attribute the upload to" }, { status: 500 })

  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
  if (!/\.(png|jpe?g|webp|gif|avif|svg)$/.test(safeName)) return NextResponse.json({ error: "Unsupported file extension" }, { status: 400 })
  const storagePath = `ingest/${safeName}`

  const supabase = createClient(supabaseUrl, serviceKey)
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error } = await supabase.storage.from(bucket).upload(storagePath, buffer, { contentType: file.type, upsert: true })
  if (error) return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 })
  const url = supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl

  const meta = { altText: text(form, "altText"), title: text(form, "title"), caption: text(form, "caption") }
  const existing = await prisma.media.findFirst({ where: { url }, select: { id: true } })
  const media = existing
    ? await prisma.media.update({ where: { id: existing.id }, data: { mimeType: file.type, size: file.size, ...meta } })
    : await prisma.media.create({ data: { url, filename: file.name, mimeType: file.type, size: file.size, uploadedById: user.id, ...meta } })

  return NextResponse.json({ id: media.id, url, replaced: Boolean(existing) }, { status: existing ? 200 : 201 })
}
