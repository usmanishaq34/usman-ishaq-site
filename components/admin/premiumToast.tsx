"use client"

import { toast } from "sonner"

type PublishKind = "post" | "service" | "page" | "category"
type Action = "published" | "scheduled" | "saved" | "created" | "deleted" | "updated"

/**
 * Premium themed toast for publish/schedule actions.
 * Uses the site's design system: accent color, mono-pill labels,
 * Fraunces italic accent on the headline.
 */
export function premiumToast(opts: {
  kind: PublishKind
  action: Action
  title?: string
  scheduledFor?: string | Date | null
  viewUrl?: string
}) {
  const { kind, action, title, scheduledFor, viewUrl } = opts

  const labelMap: Record<Action, string> = {
    published: "Published live",
    scheduled: "Scheduled",
    saved: "Saved",
    created: "Created",
    deleted: "Deleted",
    updated: "Updated",
  }

  const accentMap: Record<Action, string> = {
    published: "#16a34a", // green
    scheduled: "#db4c23", // accent orange
    saved: "#0a0a0a",
    created: "#0a0a0a",
    deleted: "#dc2626",
    updated: "#0a0a0a",
  }

  const icon: Record<Action, string> = {
    published: "●",
    scheduled: "◐",
    saved: "✓",
    created: "✓",
    deleted: "✕",
    updated: "✓",
  }

  const headline =
    action === "published"
      ? `${kind.charAt(0).toUpperCase() + kind.slice(1)} is live.`
      : action === "scheduled"
      ? `${kind.charAt(0).toUpperCase() + kind.slice(1)} scheduled.`
      : `${kind.charAt(0).toUpperCase() + kind.slice(1)} ${action}.`

  const subline = (() => {
    if (action === "scheduled" && scheduledFor) {
      return `Goes live ${new Date(scheduledFor).toLocaleString()}`
    }
    if (action === "published" && viewUrl) {
      return `Visible at ${viewUrl}`
    }
    if (title) return title
    return undefined
  })()

  toast.custom(
    (t) => (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid rgba(10,10,10,0.1)",
          borderLeft: `3px solid ${accentMap[action]}`,
          borderRadius: 2,
          boxShadow: "0 20px 40px -8px rgba(10,10,10,0.18), 0 8px 16px -4px rgba(10,10,10,0.08)",
          padding: "18px 22px",
          minWidth: 340,
          maxWidth: 460,
          fontFamily: "var(--body, Manrope, system-ui, sans-serif)",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: accentMap[action],
            }}
          >
            {icon[action]} {labelMap[action]}
          </span>
          <button
            onClick={() => toast.dismiss(t)}
            style={{
              marginLeft: "auto",
              background: "none",
              border: 0,
              cursor: "pointer",
              color: "#9b9b95",
              fontSize: 18,
              lineHeight: 1,
              padding: 0,
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div
          style={{
            fontFamily: "var(--display, Fraunces, Georgia, serif)",
            fontSize: 19,
            fontWeight: 500,
            lineHeight: 1.25,
            color: "#0a0a0a",
            fontVariationSettings: '"SOFT" 100, "opsz" 144',
          }}
        >
          {headline}
        </div>
        {subline && (
          <div
            style={{
              fontSize: 13,
              color: "#6b6b65",
              lineHeight: 1.5,
            }}
          >
            {subline}
          </div>
        )}
        {viewUrl && action === "published" && (
          <a
            href={viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
              fontSize: 11,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "#db4c23",
              textDecoration: "none",
              marginTop: 4,
              alignSelf: "flex-start",
            }}
          >
            View live →
          </a>
        )}
      </div>
    ),
    { duration: action === "published" ? 6000 : 4000 }
  )
}
