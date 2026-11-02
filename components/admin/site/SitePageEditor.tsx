"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import type { PageBlock, PageDoc, PageOverride, PageSeo } from "@/lib/site-content"

type Props = {
  path: string
  label: string
  kind: string
  routeSeo: { title: string; description: string }
  defaults: PageDoc | null
  override: PageOverride | null
}

type Status = { kind: "idle" | "saving" | "ok" | "error"; text?: string }

const newId = () => `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

/* Dashboard editor for one page of the new site.
   - SEO: title, description, OG image, canonical, noindex (every page)
   - Sections: every block of a service, industry or knowledge page, edited
     visually on the live design or as HTML, with reorder, hide, duplicate,
     delete and reset-to-default. */
export default function SitePageEditor({ path, label, kind, routeSeo, defaults, override }: Props) {
  const baseSeo: PageSeo = {
    title: defaults?.seo.title || routeSeo.title,
    description: defaults?.seo.description || routeSeo.description,
    ogImage: defaults?.seo.ogImage || "",
    noindex: false,
    canonical: "",
  }
  const [seo, setSeo] = useState<PageSeo>({ ...baseSeo, ...(override?.seo ?? {}) })
  const [blocks, setBlocks] = useState<PageBlock[]>(
    override?.blocks && override.blocks.length > 0 ? override.blocks : defaults?.blocks ?? [],
  )
  const [open, setOpen] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: "idle" })
  const [tab, setTab] = useState<"sections" | "visual" | "seo">(defaults ? "visual" : "seo")
  const [frameKey, setFrameKey] = useState(0)
  const frameRef = useRef<HTMLIFrameElement>(null)
  // Blocks typed into in the visual editor. Only these are written back, so
  // untouched sections keep their exact original markup.
  const touchedBlocks = useRef<Set<string>>(new Set())

  const defaultById = useMemo(() => new Map((defaults?.blocks ?? []).map((b) => [b.id, b])), [defaults])

  function touch<T>(fn: (v: T) => void) {
    return (v: T) => {
      fn(v)
      setDirty(true)
      setStatus({ kind: "idle" })
    }
  }
  const updateSeo = touch((patch: Partial<PageSeo>) => setSeo((s) => ({ ...s, ...patch })))
  const updateBlocks = touch((next: PageBlock[]) => setBlocks(next))

  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= blocks.length) return
    const next = blocks.slice()
    ;[next[i], next[j]] = [next[j], next[i]]
    updateBlocks(next)
  }
  function patchBlock(i: number, patch: Partial<PageBlock>) {
    updateBlocks(blocks.map((b, k) => (k === i ? { ...b, ...patch } : b)))
  }

  async function save(nextBlocks: PageBlock[] = blocks) {
    setStatus({ kind: "saving" })
    const seoDiff: Partial<PageSeo> = {}
    ;(Object.keys(seo) as (keyof PageSeo)[]).forEach((k) => {
      if (seo[k] !== baseSeo[k]) (seoDiff as Record<string, unknown>)[k] = seo[k]
    })
    const blocksChanged = defaults ? JSON.stringify(nextBlocks) !== JSON.stringify(defaults.blocks) : false
    const res = await fetch("/api/site-content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, seo: seoDiff, ...(blocksChanged ? { blocks: nextBlocks } : {}) }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setStatus({ kind: "error", text: data.error || "Save failed." })
      return false
    }
    setDirty(false)
    setStatus({ kind: "ok", text: "Saved. The live page is updated." })
    setFrameKey((k) => k + 1)
    return true
  }

  async function resetPage() {
    if (!confirm("Reset this page to its original content and SEO? Your edits on this page will be removed.")) return
    const res = await fetch(`/api/site-content/?path=${encodeURIComponent(path)}`, { method: "DELETE" })
    if (!res.ok) return setStatus({ kind: "error", text: "Reset failed." })
    setSeo(baseSeo)
    setBlocks(defaults?.blocks ?? [])
    setDirty(false)
    setFrameKey((k) => k + 1)
    setStatus({ kind: "ok", text: "Page reset to its original content." })
  }

  // ---------- visual editing on the live design ----------
  // The preview shows the saved page, so pending section changes are saved first.
  async function openVisual() {
    if (tab === "visual") return
    if (dirty) {
      if (!confirm("Save your changes before opening the visual editor?")) return
      if (!(await save())) return
    }
    setTab("visual")
    setFrameKey((k) => k + 1)
  }
  // Elements of each block in the live page, found between the
  // <!--dv-block:id--> and <!--/dv-block--> markers EditablePage writes.
  function frameBlocks(): { id: string; nodes: Node[] }[] {
    const doc = frameRef.current?.contentDocument
    const host = doc?.querySelector<HTMLElement>("[data-dv-page]")
    if (!host) return []
    // Pages with interactive parts wrap each block in <div data-dv-block="id">.
    const wrappers = Array.from(host.querySelectorAll<HTMLElement>(":scope > [data-dv-block]"))
    if (wrappers.length) return wrappers.map((w) => ({ id: w.dataset.dvBlock!, nodes: Array.from(w.childNodes) }))
    // Service, industry and knowledge pages mark blocks with HTML comments.
    const out: { id: string; nodes: Node[] }[] = []
    let current: { id: string; nodes: Node[] } | null = null
    host.childNodes.forEach((n) => {
      if (n.nodeType === Node.COMMENT_NODE) {
        const text = (n as Comment).data
        if (text.startsWith("dv-block:")) current = { id: text.slice(9), nodes: [] }
        else if (text === "/dv-block" && current) { out.push(current); current = null }
        return
      }
      if (current) current.nodes.push(n)
    })
    return out
  }
  function enableVisual() {
    const doc = frameRef.current?.contentDocument
    if (!doc || !doc.querySelector("[data-dv-page]") || doc.body.dataset.dvEditing) return
    doc.body.dataset.dvEditing = "1"
    const style = doc.createElement("style")
    style.textContent =
      "[data-dv-edit]{outline:2px dashed rgba(219,76,35,.45);outline-offset:-2px}[data-dv-edit]:focus{outline:2px solid #db4c23}" +
      "header#top,footer,.mobile-menu,.wa,#progress{pointer-events:none;opacity:.5}"
    doc.head.appendChild(style)
    touchedBlocks.current = new Set()
    frameBlocks().forEach(({ id, nodes }) =>
      nodes.forEach((n) => {
        if (n.nodeType !== Node.ELEMENT_NODE) return
        const el = n as HTMLElement
        // Interactive parts are edited in the Sections tab and Site data.
        if (el.hasAttribute("data-dv-island")) return
        el.querySelectorAll("[data-dv-island]").forEach((i) => i.setAttribute("contenteditable", "false"))
        el.setAttribute("contenteditable", "true")
        el.setAttribute("data-dv-edit", "1")
        el.addEventListener("input", () => {
          touchedBlocks.current.add(id)
          setDirty(true)
        })
      }),
    )
    // Links must not navigate while editing.
    doc.addEventListener("click", (e) => {
      if ((e.target as Element).closest("a")) e.preventDefault()
    }, true)
  }
  // The iframe can finish loading before React attaches onLoad (it is part of
  // the server-rendered HTML), so the editor also checks once it is mounted.
  useEffect(() => {
    if (tab !== "visual") return
    const frame = frameRef.current
    if (!frame) return
    const tryEnable = () => {
      if (frame.contentDocument?.readyState === "complete") enableVisual()
    }
    tryEnable()
    frame.addEventListener("load", tryEnable)
    const timer = window.setInterval(tryEnable, 500)
    const stop = window.setTimeout(() => window.clearInterval(timer), 15000)
    return () => {
      frame.removeEventListener("load", tryEnable)
      window.clearInterval(timer)
      window.clearTimeout(stop)
    }
  }, [tab, frameKey])

  async function saveVisual() {
    const found = frameBlocks()
    if (found.length === 0) {
      setStatus({ kind: "error", text: "The preview has not loaded yet. Wait a moment and save again." })
      return
    }
    const htmlById = new Map<string, string>()
    found.forEach(({ id, nodes }) => {
      if (!touchedBlocks.current.has(id)) return
      const html = nodes
        .map((n) => {
          if (n.nodeType === Node.ELEMENT_NODE) {
            const clone = (n as HTMLElement).cloneNode(true) as HTMLElement
            clone.removeAttribute("contenteditable")
            clone.removeAttribute("data-dv-edit")
            // Islands go back to empty placeholders; their content is live.
            const islands = [clone, ...Array.from(clone.querySelectorAll<HTMLElement>("[data-dv-island]"))].filter((e) => e.hasAttribute("data-dv-island"))
            islands.forEach((i) => {
              i.innerHTML = ""
              i.removeAttribute("contenteditable")
            })
            return clone.outerHTML
          }
          return n.nodeType === Node.TEXT_NODE ? (n.textContent ?? "") : ""
        })
        .join("")
      htmlById.set(id, html)
    })
    const next = blocks.map((b) => (htmlById.has(b.id) ? { ...b, html: htmlById.get(b.id)! } : b))
    setBlocks(next)
    if (await save(next)) touchedBlocks.current = new Set()
  }

  const statusColor = status.kind === "error" ? "text-red-700" : status.kind === "ok" ? "text-green-700" : "text-ink-muted"

  return (
    <div className="max-w-6xl">
      <header className="mb-6 pb-6 border-b border-line flex items-end justify-between gap-4 flex-wrap">
        <div>
          <Link href="/usman-1000-admin/pages" className="mono-pill text-ink-muted hover:text-accent">
            ← All pages
          </Link>
          <h1 className="h2-display italic-accent mt-3">{label}</h1>
          <p className="font-mono text-sm text-ink-muted mt-1">{path}</p>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <span className={`mono-pill ${statusColor}`}>
            {status.kind === "saving" ? "Saving…" : status.text ?? (dirty ? "Unsaved changes" : "")}
          </span>
          <a href={path} target="_blank" rel="noopener noreferrer" className="btn-ghost">View page</a>
          <button type="button" onClick={resetPage} className="btn-ghost">Reset page</button>
          {tab === "visual" ? (
            <button type="button" onClick={saveVisual} className="btn-primary" disabled={status.kind === "saving"}>Save changes</button>
          ) : (
            <button type="button" onClick={() => save()} className="btn-primary" disabled={status.kind === "saving"}>Save changes</button>
          )}
        </div>
      </header>

      <nav className="flex gap-2 mb-6 flex-wrap">
        {defaults && (
          <>
            <TabButton active={tab === "visual"} onClick={openVisual}>Visual edit</TabButton>
            <TabButton active={tab === "sections"} onClick={() => setTab("sections")}>Sections</TabButton>
          </>
        )}
        <TabButton active={tab === "seo"} onClick={() => setTab("seo")}>SEO</TabButton>
      </nav>

      {tab === "visual" && defaults && (
        <div>
          <p className="text-sm text-ink-2 mb-3">
            Click any text on the page below and type. Every section has a dashed outline. Press <b>Save changes</b> when done.
            To add, remove, reorder or hide sections, or to change images and links, use the <b>Sections</b> tab.
          </p>
          <iframe
            key={frameKey}
            ref={frameRef}
            src={`${path}?dv-edit=1&v=${frameKey}`}
            className="w-full border border-line bg-white"
            style={{ height: "75vh" }}
            title={`Visual editor for ${label}`}
          />
        </div>
      )}

      {tab === "sections" && defaults && (
        <div className="space-y-3">
          <p className="text-sm text-ink-2 mb-2">
            Sections appear on the page in this order. Hidden sections stay saved but do not show on the site.
          </p>
          {blocks.map((b, i) => {
            const isOpen = open === b.id
            const original = defaultById.get(b.id)
            const changed = original ? original.html !== b.html : true
            return (
              <div key={b.id} className={`bg-bg border ${b.hidden ? "border-dashed border-line opacity-60" : "border-line"}`}>
                <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
                  <span className="font-mono text-xs text-ink-muted w-6">{i + 1}</span>
                  <input
                    className="form-input flex-1 min-w-[200px]"
                    value={b.label}
                    onChange={(e) => patchBlock(i, { label: e.target.value })}
                    aria-label="Section name (dashboard only)"
                  />
                  {changed && <span className="mono-pill text-accent">Edited</span>}
                  {b.hidden && <span className="mono-pill text-ink-muted">Hidden</span>}
                  <div className="flex gap-1 flex-wrap">
                    <SmallBtn onClick={() => move(i, -1)} disabled={i === 0}>↑</SmallBtn>
                    <SmallBtn onClick={() => move(i, 1)} disabled={i === blocks.length - 1}>↓</SmallBtn>
                    <SmallBtn onClick={() => setOpen(isOpen ? null : b.id)}>{isOpen ? "Close" : "Edit HTML"}</SmallBtn>
                    <SmallBtn onClick={() => patchBlock(i, { hidden: !b.hidden })}>{b.hidden ? "Show" : "Hide"}</SmallBtn>
                    <SmallBtn onClick={() => updateBlocks([...blocks.slice(0, i + 1), { ...b, id: newId(), label: `${b.label} (copy)` }, ...blocks.slice(i + 1)])}>Duplicate</SmallBtn>
                    {original && changed && (
                      <SmallBtn onClick={() => confirm("Put this section back to its original content?") && patchBlock(i, { html: original.html })}>Reset</SmallBtn>
                    )}
                    <SmallBtn danger onClick={() => confirm(`Delete section "${b.label}"?`) && updateBlocks(blocks.filter((_, k) => k !== i))}>Delete</SmallBtn>
                  </div>
                </div>
                {islandOf(b.html) && !isOpen && (
                  <IslandFields html={b.html} onChange={(html) => patchBlock(i, { html })} />
                )}
                {isOpen && (
                  <div className="px-4 pb-4">
                    <textarea
                      className="w-full font-mono text-xs border border-line-strong p-3 bg-bg-2"
                      style={{ minHeight: 360, lineHeight: 1.5 }}
                      spellCheck={false}
                      value={b.html}
                      onChange={(e) => patchBlock(i, { html: e.target.value })}
                    />
                  </div>
                )}
              </div>
            )
          })}
          <button
            type="button"
            className="btn-ghost"
            onClick={() => updateBlocks([...blocks, { id: newId(), label: "New section", html: '<section><div class="wrap"><h2>New section</h2><p>Text</p></div></section>' }])}
          >
            + Add section
          </button>
        </div>
      )}

      {tab === "seo" && (
        <div className="bg-bg border border-line p-6 space-y-5 max-w-3xl">
          {!defaults && (
            <p className="text-sm text-ink-2">
              This page&apos;s sections come from the site code. Its SEO fields are editable here.
            </p>
          )}
          <Field label={`SEO title (${seo.title.length} characters, aim for under 60)`}>
            <input className="form-input" value={seo.title} onChange={(e) => updateSeo({ title: e.target.value })} />
          </Field>
          <Field label={`Meta description (${seo.description.length} characters, aim for 140 to 160)`}>
            <textarea className="form-input" rows={3} value={seo.description} onChange={(e) => updateSeo({ description: e.target.value })} />
          </Field>
          <Field label="Social share image URL (Open Graph)">
            <input className="form-input" value={seo.ogImage} placeholder="/img/gfx/og-image.jpg" onChange={(e) => updateSeo({ ogImage: e.target.value })} />
          </Field>
          <Field label="Canonical URL (leave empty to use this page's own URL)">
            <input className="form-input" value={seo.canonical} placeholder={path} onChange={(e) => updateSeo({ canonical: e.target.value })} />
          </Field>
          <label className="flex items-center gap-3 text-sm text-ink-2">
            <input type="checkbox" checked={seo.noindex} onChange={(e) => updateSeo({ noindex: e.target.checked })} />
            Hide this page from search engines (noindex)
          </label>
        </div>
      )}
    </div>
  )
}

const ISLAND_DATA: Record<string, { text: boolean; data: string[] }> = {
  "latest-posts": { text: false, data: [] },
}

/** Name of the island when the block is only an interactive placeholder. */
function islandOf(html: string): string | null {
  const m = html.trim().match(/^<div[^>]*data-dv-island="([a-z-]+)"[^>]*>\s*<\/div>$/)
  return m ? m[1] : null
}

const attrOf = (html: string, name: string) => {
  const m = html.match(new RegExp(`${name}="([^"]*)"`))
  return m ? m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&") : ""
}

function IslandFields({ html, onChange }: { html: string; onChange: (html: string) => void }) {
  const name = islandOf(html)!
  const info = ISLAND_DATA[name] ?? { text: false, data: [] }
  const set = (attr: string, value: string) => {
    const enc = value.replace(/&/g, "&amp;").replace(/"/g, "&quot;")
    let next = html.replace(new RegExp(`\\s${attr}="[^"]*"`), "")
    if (value.trim()) next = next.replace(`data-dv-island="${name}"`, `data-dv-island="${name}" ${attr}="${enc}"`)
    onChange(next)
  }
  const isMarquee = name.endsWith("marquee")
  return (
    <div className="px-4 pb-4 grid gap-3">
      <p className="text-sm text-ink-2">
        Interactive section. Its items come from{" "}
        {info.data.length ? (
          info.data.map((d, k) => (
            <span key={d}>
              {k > 0 ? " and " : ""}
              <a className="text-accent underline" href={`/usman-1000-admin/site-data/${d}`}>Site data → {d}</a>
            </span>
          ))
        ) : (
          <a className="text-accent underline" href="/usman-1000-admin/posts">Posts</a>
        )}
        . Leave a field empty to keep the original text.
      </p>
      {info.text && (
        <>
          <input className="form-input" placeholder={isMarquee ? "Strip label (original text if empty)" : "Heading (original text if empty)"} value={attrOf(html, "data-heading")} onChange={(e) => set("data-heading", e.target.value)} />
          {!isMarquee && (
            <textarea className="form-input" rows={2} placeholder="Intro text (original text if empty)" value={attrOf(html, "data-intro")} onChange={(e) => set("data-intro", e.target.value)} />
          )}
        </>
      )}
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`font-mono text-xs uppercase tracking-widest font-bold px-4 py-2 border transition-colors ${active ? "border-accent bg-accent text-white" : "border-line-strong text-ink hover:border-accent"}`}>
      {children}
    </button>
  )
}

function SmallBtn({ onClick, disabled, danger, children }: { onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`font-mono text-[11px] uppercase tracking-wider px-2.5 py-1.5 border ${danger ? "border-red-300 text-red-700 hover:bg-red-50" : "border-line-strong text-ink hover:border-accent"} disabled:opacity-30`}>
      {children}
    </button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block mono-pill text-ink-muted mb-2">{label}</span>
      {children}
    </label>
  )
}
