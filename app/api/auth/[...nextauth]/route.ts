import { NextRequest } from "next/server"
import { handlers } from "@/lib/auth"

// Older links and clients still call /api/auth/session/ with a trailing
// slash. Auth.js reads the action from the path and expects no
// trailing slash, so the slash is stripped before the request reaches it.
async function withoutTrailingSlash(req: NextRequest): Promise<NextRequest> {
  const url = new URL(req.url)
  if (url.pathname.length <= 1 || !url.pathname.endsWith("/")) return req
  url.pathname = url.pathname.replace(/\/+$/, "")
  const hasBody = req.method !== "GET" && req.method !== "HEAD"
  return new NextRequest(url, {
    method: req.method,
    headers: req.headers,
    body: hasBody ? await req.text() : undefined,
  })
}

export async function GET(req: NextRequest) {
  return handlers.GET(await withoutTrailingSlash(req))
}

export async function POST(req: NextRequest) {
  return handlers.POST(await withoutTrailingSlash(req))
}
