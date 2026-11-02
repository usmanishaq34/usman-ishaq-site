"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { BlockRecord } from "@/lib/login-guard"

// Settings → Blocked IPs: the list of addresses blocked after repeated failed
// sign-ins, an Unblock button per row, and the threshold that triggers a block.

type Props = { blocked: BlockRecord[]; threshold: number; yourIp: string }

export default function BlockedIps({ blocked, threshold, yourIp }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [limit, setLimit] = useState(String(threshold))
  const [saving, setSaving] = useState(false)

  async function lift(ip: string) {
    setBusy(ip)
    try {
      const res = await fetch("/api/settings/blocked-ips", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not unblock")
      toast.success(`${ip} can sign in again`)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not unblock")
    } finally {
      setBusy(null)
    }
  }

  async function saveThreshold(e: React.FormEvent) {
    e.preventDefault()
    const n = Number(limit)
    if (!Number.isInteger(n) || n < 1 || n > 50) {
      toast.error("Enter a whole number from 1 to 50")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/settings/blocked-ips", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threshold: n }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not save")
      toast.success(`Blocking after ${n} failed attempts`)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={saveThreshold} className="bg-bg border border-line p-6 flex flex-wrap items-end gap-4">
        <label className="block">
          <span className="mono-pill block mb-2">Block after</span>
          <input
            type="number"
            min={1}
            max={50}
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="w-28 border border-line-strong px-3 py-2 font-body text-ink focus:outline-none focus:border-accent"
          />
        </label>
        <span className="text-sm text-ink-2 pb-2">failed password attempts from one IP address within 24 hours.</span>
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? "Saving..." : "Save"}
        </button>
      </form>

      <p className="text-sm text-ink-muted">
        Your current address is <span className="font-mono text-ink">{yourIp}</span>. A correct password clears the count for an address; a
        blocked address stays blocked until it is unblocked here.
      </p>

      {blocked.length === 0 ? (
        <div className="bg-bg border border-line p-10 text-center text-ink-muted">No IP address is blocked.</div>
      ) : (
        <div className="bg-bg border border-line overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-3 border-b border-line">
              <tr>
                <th className="text-left px-6 py-3.5 mono-pill">IP address</th>
                <th className="text-left px-6 py-3.5 mono-pill">Emails tried</th>
                <th className="text-left px-6 py-3.5 mono-pill">Failed attempts</th>
                <th className="text-left px-6 py-3.5 mono-pill">Blocked at</th>
                <th className="text-left px-6 py-3.5 mono-pill">Reason</th>
                <th className="text-left px-6 py-3.5 mono-pill">Action</th>
              </tr>
            </thead>
            <tbody>
              {blocked.map((b) => (
                <tr key={b.ip} className="border-b border-line last:border-b-0 align-top">
                  <td className="px-6 py-4 font-mono text-sm text-ink whitespace-nowrap">{b.ip}</td>
                  <td className="px-6 py-4 text-sm text-ink-2">{b.emails.length ? b.emails.join(", ") : "-"}</td>
                  <td className="px-6 py-4 text-sm text-ink-2">{b.attempts}</td>
                  <td className="px-6 py-4 text-sm text-ink-2 whitespace-nowrap">{b.blockedAt ? new Date(b.blockedAt).toLocaleString() : "-"}</td>
                  <td className="px-6 py-4 text-sm text-ink-2">{b.reason ?? "-"}</td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => lift(b.ip)}
                      disabled={busy === b.ip}
                      className="border border-line-strong px-4 py-2 text-sm font-semibold text-ink hover:border-accent hover:text-accent transition-colors disabled:opacity-60"
                    >
                      {busy === b.ip ? "Unblocking..." : "Unblock"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
