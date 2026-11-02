import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { auth, hashPassword } from "@/lib/auth"
import { prisma } from "@/lib/db"

// Change the password of the logged-in admin. The current password is
// required, so an unattended open browser cannot be used to lock you out.
// Passwords are stored only as a bcrypt hash; nobody (including this code)
// can read a stored password back.

export const dynamic = "force-dynamic"

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "The new password needs at least 8 characters.").max(200),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data." }, { status: 400 })
  }
  const { currentPassword, newPassword } = parsed.data
  if (currentPassword === newPassword) {
    return NextResponse.json({ error: "The new password must be different from the current one." }, { status: 400 })
  }

  const id = (session.user as { id?: string }).id
  const email = session.user.email ?? undefined
  const user = await prisma.user
    .findFirst({ where: id ? { id } : { email } })
    .catch(() => null)
  if (!user?.hashedPassword) return NextResponse.json({ error: "Account not found." }, { status: 404 })

  const ok = await bcrypt.compare(currentPassword, user.hashedPassword)
  if (!ok) return NextResponse.json({ error: "The current password is not correct." }, { status: 400 })

  await prisma.user.update({ where: { id: user.id }, data: { hashedPassword: await hashPassword(newPassword) } })
  return NextResponse.json({ ok: true })
}
