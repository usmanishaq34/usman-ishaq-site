/**
 * IndexNow — notify search engines the moment a post goes live.
 *
 * One POST to api.indexnow.org is forwarded to every participating engine:
 * Bing, Yandex, Naver and Seznam. Copilot and ChatGPT's retrieval both lean on
 * the Bing index, so this shortens the path to being cited there.
 *
 * GOOGLE DOES NOT PARTICIPATE. Google's own Indexing API only accepts
 * JobPosting and BroadcastEvent. For Google the working mechanism is a live
 * sitemap with an accurate lastmod — which app/sitemap.ts now provides.
 *
 * Ownership is proved by a plain text file at
 *   https://usmanishaq.com/${INDEXNOW_KEY}.txt
 * containing exactly the key. Without it every submission returns 403.
 */

const INDEXNOW_KEY = "4f1c6b2a9d8e47a3b5c0d1e2f3a4b5c6"
const HOST = "usmanishaq.com"
const ENDPOINT = "https://api.indexnow.org/IndexNow"
const TIMEOUT_MS = 4000

export async function pingIndexNow(urls: string[]): Promise<void> {
  const urlList = Array.from(new Set(urls.filter(Boolean)))
  if (urlList.length === 0) return

  // Publishing must never hang on an indexing ping.
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
      signal: controller.signal,
    })

    if (res.ok) {
      console.log("[indexnow] submitted:", urlList.join(", "))
    } else if (res.status === 403) {
      console.error(
        "[indexnow] 403 — key file not reachable at",
        `https://${HOST}/${INDEXNOW_KEY}.txt`
      )
    } else {
      console.error("[indexnow] rejected:", res.status, await res.text().catch(() => ""))
    }
  } catch (err) {
    console.error("[indexnow] failed:", err)
  } finally {
    clearTimeout(timer)
  }
}
