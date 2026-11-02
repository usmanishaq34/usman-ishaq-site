"use client"

import { useEffect } from "react"

/**
 * Adds left/right scroll buttons to every table in the article body.
 *
 * The two wrapper divs (.dv-table-shell > .dv-table-scroll) are produced on the
 * server, so this component never restructures the DOM — it only appends two
 * buttons and keeps their state in sync. If the script fails or is blocked the
 * table still scrolls by swipe or scrollbar exactly as before.
 */
export default function TableScrollArrows() {
  useEffect(() => {
    const shells = Array.from(
      document.querySelectorAll<HTMLElement>(".dv-table-shell")
    )
    const cleanups: Array<() => void> = []

    shells.forEach((shell) => {
      // Guard against double-mounting (React strict mode runs effects twice).
      if (shell.dataset.dvArrows === "1") return
      const box = shell.querySelector<HTMLElement>(".dv-table-scroll")
      if (!box) return
      shell.dataset.dvArrows = "1"

      const makeButton = (dir: "prev" | "next") => {
        const btn = document.createElement("button")
        btn.type = "button"
        btn.className = `dv-arrow dv-arrow-${dir}`
        btn.setAttribute(
          "aria-label",
          dir === "prev" ? "Scroll table left" : "Scroll table right"
        )
        btn.textContent = dir === "prev" ? "\u2190" : "\u2192"
        btn.addEventListener("click", () => {
          const step = Math.max(160, box.clientWidth * 0.7)
          box.scrollBy({
            left: dir === "prev" ? -step : step,
            behavior: "smooth",
          })
        })
        shell.appendChild(btn)
        return btn
      }

      const prev = makeButton("prev")
      const next = makeButton("next")

      const update = () => {
        const max = box.scrollWidth - box.clientWidth
        const scrollable = max > 4
        shell.classList.toggle("dv-scrollable", scrollable)
        prev.disabled = !scrollable || box.scrollLeft <= 2
        next.disabled = !scrollable || box.scrollLeft >= max - 2
      }

      update()
      box.addEventListener("scroll", update, { passive: true })
      window.addEventListener("resize", update)

      let ro: ResizeObserver | null = null
      if (typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(update)
        ro.observe(box)
      }

      cleanups.push(() => {
        box.removeEventListener("scroll", update)
        window.removeEventListener("resize", update)
        ro?.disconnect()
        prev.remove()
        next.remove()
        delete shell.dataset.dvArrows
      })
    })

    return () => cleanups.forEach((fn) => fn())
  }, [])

  return null
}
