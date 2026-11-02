"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import SignOutButton from "./SignOutButton"

const NAV_LINKS = [
  { href: "/usman-1000-admin", label: "Dashboard" },
  { href: "/usman-1000-admin/posts", label: "Posts" },
  { href: "/usman-1000-admin/categories", label: "Categories" },
  { href: "/usman-1000-admin/authors", label: "Authors" },
  { href: "/usman-1000-admin/media", label: "Media Library" },
  { href: "/usman-1000-admin/pages", label: "Homepage" },
  { href: "/usman-1000-admin/account", label: "Account" },
  { href: "/usman-1000-admin/settings", label: "Security" },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Lock body scroll when sidebar drawer is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [sidebarOpen])

  return (
    <>
      {/* Scoped CSS overrides — fix overflow:hidden on html/body that breaks sticky.
          Also adds responsive container styles. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html:has(.dv-admin-shell),
            body:has(.dv-admin-shell) {
              overflow-x: visible !important;
            }
            /* Make tables horizontally scrollable inside admin */
            .dv-admin-shell .admin-table-wrap {
              overflow-x: auto;
              -webkit-overflow-scrolling: touch;
            }
            .dv-admin-shell table {
              min-width: 300px;
            }
          `,
        }}
      />

      <div className="dv-admin-shell min-h-screen bg-bg-2">
        {/* ============ MOBILE/TABLET TOP BAR ============ */}
        <header className="lg:hidden sticky top-0 z-40 bg-ink text-white flex items-center justify-between px-4 h-14 border-b border-white/10">
          <Link href="/usman-1000-admin" className="flex items-center gap-2">
            <span className="w-8 h-8 bg-white rounded-sm flex items-center justify-center p-1 flex-shrink-0">
              <img
                src="/images/usman-ishaq-logo.webp"
                alt="Usman Ishaq"
                className="w-full h-full object-contain"
              />
            </span>
            <span className="font-display text-base font-semibold">Usman Ishaq</span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="p-2 -mr-2 text-white"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </header>

        {/* ============ MOBILE DRAWER OVERLAY ============ */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/60 z-40"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <div className="flex">
          {/* ============ SIDEBAR ============
              - Mobile: hidden by default, slides in as drawer when sidebarOpen
              - Desktop (lg): sticky full-height column that stays in view while
                main content scrolls — so View Site / Sign out are always visible. */}
          <aside
            className={`
              fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50
              h-screen lg:h-screen
              w-64 bg-ink text-white flex flex-col flex-shrink-0
              transform transition-transform duration-200
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
              <Link
                href="/usman-1000-admin"
                className="font-display text-xl font-semibold flex items-center gap-2.5"
              >
                <span className="w-9 h-9 bg-white rounded-sm flex items-center justify-center p-1 flex-shrink-0">
                  <img
                    src="/images/usman-ishaq-logo.webp"
                    alt="Usman Ishaq"
                    className="w-full h-full object-contain"
                  />
                </span>
                <span>Usman Ishaq</span>
              </Link>
              {/* Close button on mobile */}
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
                className="lg:hidden p-1 -mr-1 text-white/70 hover:text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 min-h-0 p-4 space-y-1 overflow-y-auto">
              {NAV_LINKS.map((link) => {
                const isActive =
                  link.href === "/usman-1000-admin"
                    ? pathname === link.href
                    : pathname.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-3 text-sm transition-colors ${
                      isActive
                        ? "bg-accent text-white"
                        : "text-white/80 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            <div className="relative z-10 p-4 border-t border-white/10 flex-shrink-0 select-none">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-white/70 hover:text-accent transition-colors mb-2"
              >
                ← View site
              </Link>
              <SignOutButton />
            </div>
          </aside>

          {/* ============ MAIN CONTENT ============ */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 lg:p-10">{children}</main>
        </div>
      </div>
    </>
  )
}