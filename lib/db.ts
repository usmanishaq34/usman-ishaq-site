import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/* The pooled Supabase URL in the environment allows one connection and a
   10 second wait. Next pre-renders every blog post at build time on several
   workers at once, so a single connection times out and a post comes out as
   a 404. The client therefore runs with a small pool and a longer wait,
   whatever the URL says, unless the URL sets a higher limit itself. */
function pooledUrl(): string | undefined {
  const raw = process.env.DATABASE_URL
  if (!raw) return undefined
  try {
    const url = new URL(raw)
    const limit = Number(url.searchParams.get("connection_limit") || 0)
    if (limit < 5) url.searchParams.set("connection_limit", "5")
    const wait = Number(url.searchParams.get("pool_timeout") || 0)
    if (wait < 30) url.searchParams.set("pool_timeout", "30")
    return url.toString()
  } catch {
    return raw
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: pooledUrl() } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
