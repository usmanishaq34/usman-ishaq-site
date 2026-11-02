import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { byPath } from "@/lib/routes"
import { getOverride, getPageDefaults, type PageOverride } from "@/lib/site-content"

// Dashboard API for the new site's page content. Admins only.
//   GET    ?path=/services/x/        defaults + current override
//   PUT    { path, seo?, blocks? }   save the override (replaces it)
//   DELETE ?path=/services/x/        remove the override (back to defaults)

export const dynamic = "force-dynamic"

const blockSchema = z.object({
  id: z.string().min(1).max(64),
  label: z.string().max(200),
  html: z.string().max(400_000),
  hidden: z.boolean().optional(),
})

const bodySchema = z.object({
  path: z.string(),
  seo: z
    .object({
      title: z.string().max(300).optional(),
      description: z.string().max(1000).optional(),
      ogImage: z.string().max(1000).optional(),
      noindex: z.boolean().optional(),
      canonical: z.string().max(1000).optional(),
    })
    .optional(),
  blocks: z.array(blockSchema).max(200).optional(),
})

function knownPath(path: string | null): path is string {
  return !!path && byPath.has(path)
}

function refresh(path: string) {
  revalidatePath(path)
  revalidatePath("/sitemap.xml")
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const path = new URL(req.url).searchParams.get("path")
  if (!knownPath(path)) return NextResponse.json({ error: "Unknown page" }, { status: 404 })
  const [defaults, override] = await Promise.all([getPageDefaults(path), getOverride(path)])
  return NextResponse.json({ path, defaults, override })
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid data", issues: parsed.error.issues }, { status: 400 })
  const { path, seo, blocks } = parsed.data
  if (!knownPath(path)) return NextResponse.json({ error: "Unknown page" }, { status: 404 })

  // Block edits are only stored for pages that have block content.
  const defaults = await getPageDefaults(path)
  const data: PageOverride = {}
  if (seo) data.seo = seo
  if (blocks && defaults) data.blocks = blocks

  try {
    await prisma.siteContent.upsert({
      where: { key: path },
      create: { key: path, data, updatedBy: session.user?.email ?? null },
      update: { data, updatedBy: session.user?.email ?? null },
    })
  } catch (err) {
    const missingTable = err instanceof Error && /SiteContent|does not exist/i.test(err.message)
    const msg = missingTable
      ? "The SiteContent table does not exist yet. Run `npm run db:push` once against the database."
      : "Could not save to the database."
    return NextResponse.json({ error: msg }, { status: 500 })
  }
  refresh(path)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const path = new URL(req.url).searchParams.get("path")
  if (!knownPath(path)) return NextResponse.json({ error: "Unknown page" }, { status: 404 })
  await prisma.siteContent.deleteMany({ where: { key: path } }).catch(() => null)
  refresh(path)
  return NextResponse.json({ ok: true })
}
