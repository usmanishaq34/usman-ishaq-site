import { notFound } from "next/navigation"
import { byPath } from "@/lib/routes"
import { getOverride, getPageDefaults } from "@/lib/site-content"
import SitePageEditor from "@/components/admin/site/SitePageEditor"

export const dynamic = "force-dynamic"

export default async function AdminSitePageEdit({ searchParams }: { searchParams: Promise<{ path?: string }> }) {
  const { path } = await searchParams
  const route = path ? byPath.get(path) : undefined
  if (!path || !route) notFound()
  const [defaults, override] = await Promise.all([getPageDefaults(path), getOverride(path)])
  return (
    <SitePageEditor
      path={path}
      label={route.label}
      kind={route.kind}
      routeSeo={{ title: route.title, description: route.description }}
      defaults={defaults}
      override={override}
    />
  )
}
