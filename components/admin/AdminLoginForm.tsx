"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { toast } from "sonner"

// Two-step sign-in. Step one checks the email and password and emails a
// six-digit code (/api/auth/2fa). Step two sends email, password and code to
// the credentials provider, which creates the session only when all three
// check out.

const inputClass =
  "w-full border border-line-strong px-4 py-3 font-body text-ink focus:outline-none focus:border-accent transition-colors"

export default function AdminLoginForm() {
  const router = useRouter()
  const [step, setStep] = useState<"credentials" | "code">("credentials")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string>("")

  async function requestCode(): Promise<boolean> {
    const res = await fetch("/api/auth/2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; sentTo?: string }
    if (!res.ok || !data.ok) {
      setError(data.message ?? "Invalid email or password")
      return false
    }
    if (data.sentTo) setSentTo(data.sentTo)
    setNotice(data.message ?? "A six-digit code was sent to the sign-in mailbox.")
    return true
  }

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setNotice(null)
    try {
      if (await requestCode()) {
        setStep("code")
        setCode("")
      } else {
        toast.error("Sign-in failed")
      }
    } catch {
      setError("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const result = await signIn("credentials", { email, password, code: code.trim(), redirect: false })
      if (result?.error) {
        setError("That code is wrong or has expired. Check the email and try again, or request a new code.")
        toast.error("Sign-in failed")
      } else {
        toast.success("Signed in")
        router.push("/usman-1000-admin")
        router.refresh()
      }
    } catch {
      setError("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setLoading(true)
    setError(null)
    setNotice(null)
    try {
      await requestCode()
    } catch {
      setError("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  function backToCredentials() {
    setStep("credentials")
    setCode("")
    setError(null)
    setNotice(null)
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-12">
          <span className="w-11 h-11 bg-ink rounded-sm flex items-center justify-center p-1.5">
            <img src="/images/usman-ishaq-logo.webp" alt="Usman Ishaq" className="w-full h-full object-contain" />
          </span>
          <span className="font-display font-semibold text-[22px] tracking-tight text-ink">Usman Ishaq</span>
        </Link>

        <div className="bg-bg border border-line p-8">
          <span className="section-label mb-5">Admin Access</span>

          {step === "credentials" ? (
            <>
              <h1 className="font-display text-3xl font-medium mb-2 italic-accent">
                Sign in to <em>continue.</em>
              </h1>
              <p className="text-sm text-ink-2 mb-7">Editor access only. A sign-in code is emailed after the password check.</p>

              <form onSubmit={handleCredentials} className="space-y-5">
                <div>
                  <label className="mono-pill block mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    style={{ borderRadius: "2px" }}
                    placeholder="you@usmanishaq.com"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="mono-pill block mb-2">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    style={{ borderRadius: "2px" }}
                    autoComplete="current-password"
                  />
                </div>

                {error && <div className="border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</div>}

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? "Checking..." : "Continue →"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl font-medium mb-2 italic-accent">
                Enter your <em>sign-in code.</em>
              </h1>
              <p className="text-sm text-ink-2 mb-7">
                A six-digit code was emailed to <b className="text-ink">{sentTo || "the sign-in mailbox"}</b>. It expires in 10 minutes.
              </p>

              <form onSubmit={handleCode} className="space-y-5">
                <div>
                  <label className="mono-pill block mb-2">Sign-in code</label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className={`${inputClass} text-2xl tracking-[0.4em] text-center`}
                    style={{ borderRadius: "2px" }}
                    placeholder="000000"
                    autoComplete="one-time-code"
                    autoFocus
                  />
                </div>

                {notice && <div className="border-l-2 border-accent bg-bg-2 px-4 py-3 text-sm text-ink-2">{notice}</div>}
                {error && <div className="border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</div>}

                <button type="submit" disabled={loading || code.length !== 6} className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? "Signing in..." : "Sign in →"}
                </button>

                <div className="flex items-center justify-between text-sm text-ink-muted">
                  <button type="button" onClick={handleResend} disabled={loading} className="hover:text-accent transition-colors disabled:opacity-60">
                    Resend the code
                  </button>
                  <button type="button" onClick={backToCredentials} disabled={loading} className="hover:text-accent transition-colors disabled:opacity-60">
                    Use a different account
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        <p className="text-center mt-6 text-sm text-ink-muted">
          <Link href="/" className="hover:text-accent transition-colors">← Back to site</Link>
        </p>
      </div>
    </div>
  )
}
