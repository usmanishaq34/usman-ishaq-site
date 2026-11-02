"use client"

import { useState } from "react"

/* Change the admin password. Each field has a show/hide button so the typed
   password can be checked before saving. */
export default function AccountForm() {
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "ok" | "error"; text?: string }>({ kind: "idle" })

  const mismatch = confirm.length > 0 && next !== confirm
  const tooShort = next.length > 0 && next.length < 8

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (next !== confirm) return setStatus({ kind: "error", text: "The two new passwords do not match." })
    setStatus({ kind: "saving" })
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    })
    const out = await res.json().catch(() => ({}))
    if (!res.ok) return setStatus({ kind: "error", text: out.error || "The password was not changed." })
    setCurrent("")
    setNext("")
    setConfirm("")
    setStatus({ kind: "ok", text: "Password changed. Use the new password next time you sign in." })
  }

  return (
    <form onSubmit={submit} className="bg-bg border border-line p-6 space-y-5">
      <h2 className="font-display text-xl font-medium text-ink">Change password</h2>
      <PasswordField label="Current password" value={current} onChange={setCurrent} autoComplete="current-password" />
      <PasswordField label="New password (at least 8 characters)" value={next} onChange={setNext} autoComplete="new-password" />
      {tooShort && <p className="text-sm text-red-700 -mt-3">At least 8 characters.</p>}
      <PasswordField label="Repeat new password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
      {mismatch && <p className="text-sm text-red-700 -mt-3">The two new passwords do not match.</p>}
      <div className="flex items-center gap-4 flex-wrap">
        <button type="submit" className="btn-primary" disabled={status.kind === "saving" || !current || !next || mismatch || tooShort}>
          {status.kind === "saving" ? "Saving…" : "Change password"}
        </button>
        {status.text && (
          <span className={`text-sm ${status.kind === "error" ? "text-red-700" : "text-green-700"}`}>{status.text}</span>
        )}
      </div>
      <p className="text-xs text-ink-muted border-t border-line pt-4">
        For security, the saved password is stored only in encrypted form and cannot be shown. If it is forgotten, set a new one here while signed in.
      </p>
    </form>
  )
}

function PasswordField({ label, value, onChange, autoComplete }: { label: string; value: string; onChange: (v: string) => void; autoComplete: string }) {
  const [show, setShow] = useState(false)
  return (
    <label className="block">
      <span className="block mono-pill text-ink-muted mb-2">{label}</span>
      <span className="flex gap-2">
        <input
          type={show ? "text" : "password"}
          className="form-input flex-1"
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
        />
        <button type="button" onClick={() => setShow((s) => !s)} className="font-mono text-[11px] uppercase tracking-wider px-3 border border-line-strong text-ink hover:border-accent" aria-label={show ? "Hide password" : "Show password"}>
          {show ? "Hide" : "Show"}
        </button>
      </span>
    </label>
  )
}
