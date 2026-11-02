import { auth } from "@/lib/auth"
import AccountForm from "@/components/admin/site/AccountForm"

export const dynamic = "force-dynamic"

export default async function AdminAccount() {
  const session = await auth()
  return (
    <div className="max-w-3xl">
      <header className="mb-6 sm:mb-10 pb-6 border-b border-line">
        <span className="section-label mb-4">Settings</span>
        <h1 className="h2-display italic-accent">Your <em>account.</em></h1>
        <p className="text-base text-ink-2 mt-2">
          Signed in as <b>{session?.user?.email ?? "admin"}</b>.
        </p>
      </header>
      <AccountForm />
    </div>
  )
}
