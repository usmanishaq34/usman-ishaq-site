import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { issueCode, sendCode } from "@/lib/two-factor"
import { BLOCKED_MESSAGE, RATE_LIMIT_MESSAGE, getClientIp, isBlocked, rateLimited, recordFailure, recordSuccess } from "@/lib/login-guard"

// Step one of the dashboard sign-in. The email and password are checked here,
// and on success a six-digit code is emailed to the account. Step two is the
// normal credentials sign-in, which also requires that code (lib/auth.ts).
// Every failure returns the same message, so the response never reveals
// which accounts exist. Failed passwords are counted per IP and the IP is
// blocked at the threshold (lib/login-guard.ts).

export const runtime = "nodejs"

// The code always goes to this mailbox, whichever account signs in.
const CODE_INBOX = process.env.TWO_FACTOR_EMAIL || "usmanishaqupwork@gmail.com"

const schema = z.object({ email: z.string().email(), password: z.string().min(8) })
const FAIL = { ok: false, message: "Invalid email or password" }

export async function POST(req: Request) {
  const ip = getClientIp(req.headers)
  if (rateLimited("2fa", ip)) return NextResponse.json({ ok: false, message: RATE_LIMIT_MESSAGE }, { status: 429 })
  if (await isBlocked(ip)) return NextResponse.json({ ok: false, blocked: true, message: BLOCKED_MESSAGE }, { status: 429 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(FAIL, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json(FAIL, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  const valid = user?.hashedPassword ? await bcrypt.compare(parsed.data.password, user.hashedPassword) : false
  if (!user?.hashedPassword || !valid) {
    const result = await recordFailure(ip, parsed.data.email, req.headers.get("user-agent"))
    if (result.blocked) return NextResponse.json({ ok: false, blocked: true, message: BLOCKED_MESSAGE }, { status: 429 })
    const left = result.remaining === 1 ? "1 attempt left" : `${result.remaining} attempts left`
    return NextResponse.json({ ok: false, message: `${FAIL.message}. ${left} before this network is blocked.` }, { status: 401 })
  }
  await recordSuccess(ip)

  const issued = await issueCode(user.id)
  if ("wait" in issued) {
    return NextResponse.json({ ok: true, resent: false, wait: issued.wait, sentTo: CODE_INBOX, message: `A code was sent a moment ago. Check ${CODE_INBOX}, or try again in ${issued.wait} seconds.` })
  }
  try {
    await sendCode(CODE_INBOX, issued.code)
  } catch (err) {
    console.error("[2fa] code email failed", err)
    return NextResponse.json({ ok: false, message: "The code could not be emailed. Try again in a minute." }, { status: 503 })
  }
  return NextResponse.json({ ok: true, resent: true, sentTo: CODE_INBOX, message: `A six-digit code was sent to ${CODE_INBOX}.` })
}
