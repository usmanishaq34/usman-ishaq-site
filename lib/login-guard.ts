import { prisma } from "./db"

// Dashboard sign-in protection.
//
// Every failed password attempt is counted per client IP. When the count
// reaches the threshold (3 by default, editable under Settings → Blocked IPs)
// the IP is blocked and stays blocked until an administrator removes it from
// that page. Records live in the SiteContent table under "login-block:<ip>",
// so they survive deploys and restarts and need no schema change, like the
// 2FA codes ("2fa:<userId>") and the audit leads ("lead:...").
//
// A second, lighter guard limits how fast one IP can hit the sign-in
// endpoints at all. It is in memory, so on serverless hosting it is per
// instance; the database block is the one that holds.

export type BlockRecord = {
  ip: string
  attempts: number
  emails: string[]
  firstFailedAt: string
  lastFailedAt: string
  blockedAt: string | null
  reason: string | null
  userAgent: string | null
}

export type GuardConfig = { threshold: number }

const KEY_PREFIX = "login-block:"
const CONFIG_KEY = "login-guard:config"
const DEFAULT_THRESHOLD = 3
const COUNT_WINDOW_MS = 24 * 60 * 60 * 1000 // failures older than this are forgotten
const MAX_EMAILS = 10

const key = (ip: string) => `${KEY_PREFIX}${ip}`

/** The client IP as the platform's proxy reports it.
 *  On Vercel, x-real-ip and x-forwarded-for are set by Vercel's edge from the
 *  TCP connection and replace anything the client sent, so they can be trusted
 *  there. Behind another proxy, set TRUSTED_PROXY_HEADER to the header that
 *  proxy guarantees (for example cf-connecting-ip). Without a proxy header the
 *  request has no usable address and is grouped under "unknown". */
export function getClientIp(headers: Headers): string {
  const custom = process.env.TRUSTED_PROXY_HEADER?.trim().toLowerCase()
  const candidates = [
    custom ? headers.get(custom) : null,
    headers.get("x-real-ip"),
    headers.get("x-vercel-forwarded-for"),
    headers.get("x-forwarded-for")?.split(",")[0],
  ]
  for (const c of candidates) {
    const ip = normaliseIp(c)
    if (ip) return ip
  }
  return "unknown"
}

function normaliseIp(raw: string | null | undefined): string | null {
  if (!raw) return null
  let ip = raw.trim()
  if (!ip) return null
  // "[::1]:1234" and "1.2.3.4:1234"
  if (ip.startsWith("[")) ip = ip.slice(1, ip.indexOf("]"))
  else if (/^\d+\.\d+\.\d+\.\d+:\d+$/.test(ip)) ip = ip.split(":")[0]
  if (ip.startsWith("::ffff:")) ip = ip.slice(7)
  if (!/^[0-9a-fA-F:.]{2,45}$/.test(ip)) return null
  return ip.toLowerCase()
}

/** IPs that are never blocked, from LOGIN_BLOCK_ALLOWLIST (comma separated).
 *  Meant for the office address, so a test or a typo can never lock the
 *  administrator out of the page that lifts blocks. */
function allowlisted(ip: string): boolean {
  const list = (process.env.LOGIN_BLOCK_ALLOWLIST ?? "")
    .split(",")
    .map((s) => normaliseIp(s))
    .filter(Boolean)
  return list.includes(ip)
}

export async function getConfig(): Promise<GuardConfig> {
  const row = await prisma.siteContent.findUnique({ where: { key: CONFIG_KEY } }).catch(() => null)
  const stored = (row?.data as Partial<GuardConfig> | undefined)?.threshold
  const env = Number(process.env.LOGIN_BLOCK_THRESHOLD)
  const threshold = Number.isInteger(stored) && (stored as number) > 0 ? (stored as number) : Number.isInteger(env) && env > 0 ? env : DEFAULT_THRESHOLD
  return { threshold }
}

export async function setConfig(config: GuardConfig, updatedBy?: string): Promise<GuardConfig> {
  const threshold = Math.min(50, Math.max(1, Math.floor(config.threshold)))
  await prisma.siteContent.upsert({
    where: { key: CONFIG_KEY },
    create: { key: CONFIG_KEY, data: { threshold }, updatedBy },
    update: { data: { threshold }, updatedBy },
  })
  return { threshold }
}

async function read(ip: string): Promise<BlockRecord | null> {
  const row = await prisma.siteContent.findUnique({ where: { key: key(ip) } }).catch(() => null)
  return (row?.data as BlockRecord | undefined) ?? null
}

/** True when sign-in from this IP is blocked. */
export async function isBlocked(ip: string): Promise<boolean> {
  if (allowlisted(ip)) return false
  const rec = await read(ip)
  return Boolean(rec?.blockedAt)
}

export type FailureResult = { blocked: boolean; attempts: number; remaining: number; threshold: number }

/** Counts one failed password attempt. Blocks the IP when the count reaches
 *  the threshold. Failures older than 24 hours are forgotten first, so a
 *  shared or rotating address does not accumulate strangers' mistakes. */
export async function recordFailure(ip: string, email: string | null, userAgent: string | null): Promise<FailureResult> {
  const { threshold } = await getConfig()
  const now = new Date()
  const prev = await read(ip)
  const stale = prev && !prev.blockedAt && now.getTime() - new Date(prev.lastFailedAt).getTime() > COUNT_WINDOW_MS
  const base: BlockRecord = prev && !stale ? prev : { ip, attempts: 0, emails: [], firstFailedAt: now.toISOString(), lastFailedAt: now.toISOString(), blockedAt: null, reason: null, userAgent: null }
  const emails = email && !base.emails.includes(email) ? [...base.emails, email].slice(-MAX_EMAILS) : base.emails
  const attempts = base.attempts + 1
  const shouldBlock = !allowlisted(ip) && !base.blockedAt && attempts >= threshold
  const next: BlockRecord = {
    ...base,
    attempts,
    emails,
    lastFailedAt: now.toISOString(),
    userAgent: userAgent ? userAgent.slice(0, 200) : base.userAgent,
    blockedAt: base.blockedAt ?? (shouldBlock ? now.toISOString() : null),
    reason: base.reason ?? (shouldBlock ? `${attempts} failed password attempts within 24 hours (threshold ${threshold})` : null),
  }
  await prisma.siteContent
    .upsert({ where: { key: key(ip) }, create: { key: key(ip), data: next }, update: { data: next } })
    .catch((err) => console.error("[login-guard] could not record attempt", err))
  if (shouldBlock) console.warn(`[login-guard] blocked ${ip}: ${next.reason}; emails tried: ${emails.join(", ") || "none"}`)
  return { blocked: Boolean(next.blockedAt), attempts, remaining: Math.max(0, threshold - attempts), threshold }
}

/** A correct password clears the counter for the IP unless it is already blocked. */
export async function recordSuccess(ip: string): Promise<void> {
  const rec = await read(ip)
  if (!rec || rec.blockedAt) return
  await prisma.siteContent.delete({ where: { key: key(ip) } }).catch(() => null)
}

/** Every IP with a block in force, newest block first. */
export async function listBlocked(): Promise<BlockRecord[]> {
  const rows = await prisma.siteContent.findMany({ where: { key: { startsWith: KEY_PREFIX } }, take: 1000 }).catch(() => [])
  return rows
    .map((r) => r.data as unknown as BlockRecord)
    .filter((r) => r && r.blockedAt)
    .sort((a, b) => (b.blockedAt as string).localeCompare(a.blockedAt as string))
}

/** Lifts the block and forgets the attempts. */
export async function unblock(ip: string): Promise<boolean> {
  const n = normaliseIp(ip) ?? ip
  const res = await prisma.siteContent.deleteMany({ where: { key: key(n) } }).catch(() => ({ count: 0 }))
  if (res.count > 0) console.warn(`[login-guard] unblocked ${n}`)
  return res.count > 0
}

// ── In-memory request limiter ────────────────────────────────────────────────
// Sliding window per key. Per process; see the note at the top.
const WINDOW_MS = 60 * 1000
const MAX_PER_WINDOW = 10
const hits = new Map<string, number[]>()

/** True when this key has made more than MAX_PER_WINDOW requests in the last minute. */
export function rateLimited(scope: string, ip: string): boolean {
  const k = `${scope}:${ip}`
  const now = Date.now()
  const recent = (hits.get(k) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(k, recent)
  if (hits.size > 5000) {
    for (const [hk, ts] of hits) if (!ts.some((t) => now - t < WINDOW_MS)) hits.delete(hk)
  }
  return recent.length > MAX_PER_WINDOW
}

export const BLOCKED_MESSAGE =
  "Sign-in from this network is blocked after repeated failed attempts. An administrator can lift the block under Settings → Blocked IPs."
export const RATE_LIMIT_MESSAGE = "Too many sign-in requests. Wait a minute and try again."
