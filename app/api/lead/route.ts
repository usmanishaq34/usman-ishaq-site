import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { z } from "zod"
import { RATE_LIMIT_MESSAGE, getClientIp, rateLimited } from "@/lib/login-guard"

// The homepage enquiry form posts here. The answers are emailed to the
// agency inbox from the same SMTP mailbox that sends the sign-in codes, so
// the visitor stays on the page and no mail app opens.

export const runtime = "nodejs"

const LEAD_INBOX = process.env.LEAD_EMAIL || "workwithus@digitalvikingz.com"

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  website: z.string().trim().max(200).optional().default(""),
  type: z.string().trim().max(120).optional().default(""),
  wins: z.array(z.string().trim().max(80)).max(10).optional().default([]),
  towns: z.string().trim().max(300).optional().default(""),
  message: z.string().trim().max(4000).optional().default(""),
  // Honeypot. People never see the field, so it stays empty.
  company: z.string().max(0).optional().default(""),
})

const FAIL = { ok: false, message: "The message did not send. Check the name and email, then try again." }
const LATER = { ok: false, message: "The message did not send. Try again in a minute." }

export async function POST(req: Request) {
  const ip = getClientIp(req.headers)
  if (rateLimited("lead", ip)) return NextResponse.json({ ok: false, message: RATE_LIMIT_MESSAGE }, { status: 429 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(FAIL, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json(FAIL, { status: 400 })
  const d = parsed.data

  const text = [
    `Name: ${d.name}`,
    `Email: ${d.email}`,
    `Website: ${d.website || "Not given"}`,
    `Business type: ${d.type || "Not given"}`,
    `Counts as a win: ${d.wins.length ? d.wins.join(", ") : "Not given"}`,
    `Towns or markets: ${d.towns || "Not given"}`,
    "",
    d.message || "(no message)",
  ].join("\n")

  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[lead] SMTP not configured; enquiry from ${d.email}:\n${text}`)
      return NextResponse.json({ ok: true })
    }
    console.error("[lead] SMTP is not configured")
    return NextResponse.json(LATER, { status: 503 })
  }

  const port = Number(process.env.SMTP_PORT || 465)
  const transport = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } })
  try {
    await transport.sendMail({
      from: { name: "usmanishaq.com enquiry form", address: user },
      to: LEAD_INBOX,
      replyTo: { name: d.name, address: d.email },
      subject: `Website enquiry from ${d.name}`,
      text,
    })
  } catch (err) {
    console.error("[lead] enquiry email failed", err)
    return NextResponse.json(LATER, { status: 503 })
  }
  return NextResponse.json({ ok: true })
}
