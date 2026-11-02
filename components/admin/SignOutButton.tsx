"use client"

import { signOut } from "next-auth/react"

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm text-white/70 hover:text-accent transition-colors"
    >
      Sign out
    </button>
  )
}