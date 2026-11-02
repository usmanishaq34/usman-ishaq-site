import Link from "next/link"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getClientIp, getConfig, listBlocked } from "@/lib/login-guard"
import BlockedIps from "@/components/admin/BlockedIps"

export const dynamic = "force-dynamic"

// Settings. The previous site's contact and social settings moved to Site
// data; this page holds the sign-in protection: the IP addresses blocked
// after repeated failed password attempts, and the threshold.
export default async function AdminSettings() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  const [blocked, config, hdrs] = await Promise.all([listBlocked(), getConfig(), headers()])
  const yourIp = getClientIp(hdrs)

  return (
    <div className="max-w-6xl">
      <header className="mb-6 sm:mb-10 pb-6 border-b border-line">
        <span className="section-label mb-4">Settings</span>
        <h1 className="h2-display italic-accent">Blocked <em>IPs.</em></h1>
        <p className="text-base text-ink-2 mt-2 max-w-3xl">
          An address that enters a wrong dashboard password {config.threshold} times within 24 hours is blocked from signing in until it is
          unblocked here. Blocks are stored in the database, so a refresh, a new browser or a redeploy does not lift them. Signed-in
          sessions are not affected.
        </p>
        <p className="text-sm text-ink-muted mt-3">
          Contact details, Calendly and social links are edited under{" "}
          <Link href="/usman-1000-admin/site-data/contact" className="text-accent underline">
            Site data → Contact details
          </Link>
          .
        </p>
      </header>
      {role === "ADMIN" ? (
        <BlockedIps blocked={blocked} threshold={config.threshold} yourIp={yourIp} />
      ) : (
        <div className="bg-bg border border-line p-10 text-center text-ink-muted">Only administrators can view and lift blocks.</div>
      )}
    </div>
  )
}
