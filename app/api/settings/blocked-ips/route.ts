import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { getConfig, listBlocked, setConfig, unblock } from "@/lib/login-guard"

// Settings → Blocked IPs. Reading the list, lifting a block and changing the
// threshold all need a signed-in administrator; editors cannot use this.

export const runtime = "nodejs"

async function admin() {
  const session = await auth()
  const user = session?.user as { email?: string | null; role?: string } | undefined
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  if (user.role !== "ADMIN") return { error: NextResponse.json({ error: "Administrators only" }, { status: 403 }) }
  return { user }
}

export async function GET() {
  const gate = await admin()
  if ("error" in gate) return gate.error
  const [blocked, config] = await Promise.all([listBlocked(), getConfig()])
  return NextResponse.json({ blocked, config })
}

const unblockSchema = z.object({ ip: z.string().min(2).max(45) })

export async function DELETE(req: Request) {
  const gate = await admin()
  if ("error" in gate) return gate.error
  const parsed = unblockSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Send the IP to unblock." }, { status: 400 })
  const removed = await unblock(parsed.data.ip)
  console.warn(`[login-guard] ${gate.user.email ?? "an administrator"} unblocked ${parsed.data.ip}`)
  return NextResponse.json({ ok: true, removed })
}

const configSchema = z.object({ threshold: z.number().int().min(1).max(50) })

export async function PATCH(req: Request) {
  const gate = await admin()
  if ("error" in gate) return gate.error
  const parsed = configSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "The threshold is a whole number from 1 to 50." }, { status: 400 })
  const config = await setConfig(parsed.data, gate.user.email ?? undefined)
  return NextResponse.json({ ok: true, config })
}
