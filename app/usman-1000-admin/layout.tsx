import type { Metadata } from "next"
import "@/styles/legacy/legacy-tailwind.css"
import "@/styles/legacy/legacy-site.css"
import "@/styles/legacy/legacy-overrides.css"
import { auth } from "@/lib/auth"
import AdminLoginForm from "@/components/admin/AdminLoginForm"
import AdminShell from "@/components/admin/AdminShell"
import { LegacyFonts } from "@/components/legacy/Legacy"

// The dashboard is the previous site's admin, unchanged. It renders inside
// <div class="dv-legacy"> with the old stylesheet and Tailwind, and never
// loads the public site's CSS, header or footer.
export const metadata: Metadata = {
  title: "Dashboard | Usman Ishaq",
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <>
      <LegacyFonts />
      <div className="dv-legacy dv-legacy-admin">
        {session ? <AdminShell>{children}</AdminShell> : <AdminLoginForm />}
      </div>
    </>
  )
}
