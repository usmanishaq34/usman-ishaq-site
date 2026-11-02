import { createHash, randomInt, timingSafeEqual } from "node:crypto"
import nodemailer from "nodemailer"
import { prisma } from "./db"

// Second step of the dashboard sign-in: a six-digit code emailed to the
// account's address. The code lives in the SiteContent table under
// "2fa:<userId>" (hashed), expires after ten minutes, allows five attempts
// and is deleted the moment it is used. No schema change is needed.

const TTL_MS = 10 * 60 * 1000
const RESEND_MS = 45 * 1000
const MAX_ATTEMPTS = 5

type Row = { hash: string; expires: number; attempts: number; sentAt: number }

const key = (userId: string) => `2fa:${userId}`
const hash = (userId: string, code: string) =>
  createHash("sha256").update(`${userId}:${code}:${process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? ""}`).digest("hex")

async function read(userId: string): Promise<Row | null> {
  const row = await prisma.siteContent.findUnique({ where: { key: key(userId) } })
  return (row?.data as Row | undefined) ?? null
}

/** Creates a fresh code for the user, or refuses when one was sent moments ago. */
export async function issueCode(userId: string): Promise<{ code: string } | { wait: number }> {
  const current = await read(userId)
  if (current && Date.now() - current.sentAt < RESEND_MS) {
    return { wait: Math.ceil((RESEND_MS - (Date.now() - current.sentAt)) / 1000) }
  }
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0")
  const data: Row = { hash: hash(userId, code), expires: Date.now() + TTL_MS, attempts: 0, sentAt: Date.now() }
  await prisma.siteContent.upsert({
    where: { key: key(userId) },
    create: { key: key(userId), data },
    update: { data },
  })
  return { code }
}

/** Checks a code and consumes it on success. */
export async function verifyCode(userId: string, code: string): Promise<boolean> {
  const row = await read(userId)
  if (!row) return false
  if (Date.now() > row.expires || row.attempts >= MAX_ATTEMPTS) {
    await prisma.siteContent.delete({ where: { key: key(userId) } }).catch(() => null)
    return false
  }
  const a = Buffer.from(row.hash, "hex")
  const b = Buffer.from(hash(userId, code.trim()), "hex")
  const ok = a.length === b.length && timingSafeEqual(a, b)
  if (ok) {
    await prisma.siteContent.delete({ where: { key: key(userId) } }).catch(() => null)
    return true
  }
  await prisma.siteContent.update({ where: { key: key(userId) }, data: { data: { ...row, attempts: row.attempts + 1 } } }).catch(() => null)
  return false
}

/** Emails the code through the agency mailbox (same SMTP settings as the audit form). */
export async function sendCode(to: string, code: string): Promise<void> {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[2fa] SMTP not configured; code for ${to} is ${code}`)
      return
    }
    throw new Error("SMTP is not configured")
  }
  const port = Number(process.env.SMTP_PORT || 465)
  const transport = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } })
  const spaced = code.split("").join(" ")
  await transport.sendMail({
    from: { name: "Usman Ishaq", address: user },
    to,
    subject: `${code} is your Usman Ishaq sign-in code`,
    text: `Your sign-in code is ${code}. It expires in 10 minutes. If you did not try to sign in to the usmanishaq.com dashboard, ignore this email.`,
    html: `<!doctype html><html><body style="margin:0;background:#f6f6f7;font-family:Arial,Helvetica,sans-serif;color:#141416">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #e6e6e9;border-radius:10px"><tr><td style="padding:28px 28px 24px">
<p style="margin:0 0 6px 0;font-size:18px;font-weight:bold">Your sign-in code</p>
<p style="margin:0 0 18px 0;color:#6b6b70;font-size:14px">Enter this code on the dashboard sign-in screen. It expires in 10 minutes.</p>
<p style="margin:0 0 18px 0;font-size:32px;font-weight:bold;letter-spacing:6px;color:#db4c23">${spaced}</p>
<p style="margin:0;color:#6b6b70;font-size:13px">If you did not try to sign in to the usmanishaq.com dashboard, ignore this email. Nobody can sign in without this code.</p>
</td></tr></table></td></tr></table></body></html>`,
  })
}
