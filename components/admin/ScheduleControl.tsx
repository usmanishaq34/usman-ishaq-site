"use client"

import { useEffect, useState } from "react"

export type PublishStatus = "draft" | "scheduled" | "published"

interface ScheduleControlProps {
  status: PublishStatus
  scheduledFor: string | null // ISO string or null
  onStatusChange: (s: PublishStatus) => void
  onScheduledForChange: (iso: string | null) => void
  saveLabel?: string
}

/**
 * Status picker + datetime input.
 * - Datetime input uses the browser's local timezone (datetime-local).
 * - When "scheduled" is picked, defaults to +1 hour from now if no value set.
 * - Renders a small live indicator showing detected timezone.
 */
export default function ScheduleControl({
  status,
  scheduledFor,
  onStatusChange,
  onScheduledForChange,
}: ScheduleControlProps) {
  const [tz, setTz] = useState<string>("")

  useEffect(() => {
    try {
      setTz(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC")
    } catch {
      setTz("UTC")
    }
  }, [])

  // Convert ISO -> "YYYY-MM-DDTHH:mm" for datetime-local input
  const toLocalInput = (iso: string | null): string => {
    if (!iso) return ""
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ""
    const pad = (n: number) => String(n).padStart(2, "0")
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const fromLocalInput = (local: string): string | null => {
    if (!local) return null
    const d = new Date(local) // browser parses as local time
    if (isNaN(d.getTime())) return null
    return d.toISOString()
  }

  function handleStatus(next: PublishStatus) {
    onStatusChange(next)
    if (next === "scheduled" && !scheduledFor) {
      // default to +1 hour
      const d = new Date(Date.now() + 60 * 60 * 1000)
      onScheduledForChange(d.toISOString())
    }
    if (next !== "scheduled") {
      // clear scheduledFor when leaving scheduled state
      if (scheduledFor) onScheduledForChange(null)
    }
  }

  const futureCheck = (() => {
    if (status !== "scheduled" || !scheduledFor) return null
    const target = new Date(scheduledFor).getTime()
    if (target <= Date.now()) {
      return "Time is in the past — it will publish on next save."
    }
    return null
  })()

  return (
    <div className="border border-line p-4 space-y-3 bg-bg">
      <div className="mono-pill text-ink">Publish status</div>

      <div className="flex gap-2 flex-wrap">
        {(["draft", "scheduled", "published"] as PublishStatus[]).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleStatus(opt)}
            className={`mono-pill px-3 py-2 border transition-colors ${
              status === opt
                ? "border-accent bg-accent text-white"
                : "border-line-strong text-ink hover:border-accent hover:text-accent"
            }`}
          >
            {opt === "draft" ? "○ Draft" : opt === "scheduled" ? "◐ Scheduled" : "● Published"}
          </button>
        ))}
      </div>

      {status === "scheduled" && (
        <div className="space-y-2 pt-2 border-t border-dashed border-line">
          <label className="mono-pill text-ink block">Publish on</label>
          <input
            type="datetime-local"
            value={toLocalInput(scheduledFor)}
            onChange={(e) => onScheduledForChange(fromLocalInput(e.target.value))}
            className="w-full px-3.5 py-3 border border-line-strong font-body text-ink bg-bg focus:outline-none focus:border-accent transition-colors text-sm"
            style={{ borderRadius: "2px" }}
            min={toLocalInput(new Date().toISOString())}
          />
          <p className="text-[11px] text-ink-muted leading-relaxed">
            Times shown in <strong>{tz}</strong>. The post auto-publishes when this time arrives (checked every minute by the database).
          </p>
          {futureCheck && (
            <p className="text-[11px] text-accent">⚠ {futureCheck}</p>
          )}
        </div>
      )}
    </div>
  )
}
