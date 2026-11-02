import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

// A GET-only route handler with no dynamic input is pre-rendered ONCE at
// build time and served frozen, which is why images uploaded after a deploy
// never appeared in the picker. This forces it to read Supabase per request.
export const dynamic = "force-dynamic"

export async function GET() {
  // Dashboard data (drafts, scheduled items, admin emails): logged-in admins only.
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(media)
}
