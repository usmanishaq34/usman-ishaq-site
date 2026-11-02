import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomBytes } from "crypto"
import { createClient } from "@supabase/supabase-js"

/**
 * Local development upload handler.
 * Saves to /public/uploads and records the URL.
 *
 * IN PRODUCTION: Swap this for UploadThing, S3, or Cloudinary.
 * Local file writes won't work on Vercel's read-only filesystem.
 */
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 })
    }

    // Validate
    const maxSize = 5 * 1024 * 1024 // 5 MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 })
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only images allowed" }, { status: 400 })
    }

    // Generate unique filename
    const ext = file.name.split(".").pop() || "bin"
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const uniqueId = randomBytes(6).toString("hex")
    const filename = `${Date.now()}-${uniqueId}-${safeName}`

    const buffer = Buffer.from(await file.arrayBuffer())

    let url: string

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const bucket = process.env.SUPABASE_STORAGE_BUCKET

    if (supabaseUrl && supabaseServiceRoleKey && bucket) {
      const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
      const storagePath = `uploads/${filename}`
      const { error } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

      if (error) throw error

      const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath)
      url = data.publicUrl
    } else {
      // Local development fallback. In production, set Supabase Storage env vars above.
      const uploadDir = join(process.cwd(), "public", "uploads")
      await mkdir(uploadDir, { recursive: true })
      const filePath = join(uploadDir, filename)
      await writeFile(filePath, buffer)
      url = `/uploads/${filename}`
    }

    // Record in DB
    const media = await prisma.media.create({
      data: {
        url,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        uploadedById: (session.user as any).id,
      },
    })

    return NextResponse.json(media, { status: 201 })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
