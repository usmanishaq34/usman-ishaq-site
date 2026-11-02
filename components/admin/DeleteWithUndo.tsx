"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface DeleteWithUndoProps {
  itemId: string
  itemLabel: string // e.g. "post" or "service"
  itemName: string // e.g. the title shown to user
  apiPath: string // e.g. "/api/posts" or "/api/services"
}

/**
 * Click "Delete" → confirm dialog → INSTANT delete (no 10s wait).
 * Toast confirms deletion. Page refreshes immediately.
 */
export default function DeleteWithUndo({
  itemId,
  itemLabel,
  itemName,
  apiPath,
}: DeleteWithUndoProps) {
  const router = useRouter()
  const [hidden, setHidden] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Delete "${itemName}"? This cannot be undone.`)) return

    setHidden(true)
    setDeleting(true)

    try {
      const res = await fetch(`${apiPath}/${itemId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      toast.success(
        `${itemLabel.charAt(0).toUpperCase() + itemLabel.slice(1)} deleted.`
      )
      router.refresh()
    } catch {
      toast.error("Delete failed. Restoring item.")
      setHidden(false)
    } finally {
      setDeleting(false)
    }
  }

  if (hidden) return null

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="font-mono text-xs uppercase tracking-widest font-bold text-red-600 hover:text-red-800 hover:underline ml-3 disabled:opacity-50"
      title={`Delete ${itemLabel}`}
    >
      {deleting ? "Deleting..." : "Delete"}
    </button>
  )
}

/**
 * Wrapper for an entire <tr> — INSTANT delete on click.
 * Row hides immediately, API call fires, page refreshes.
 */
export function DeletableRow({
  itemId,
  itemLabel,
  itemName,
  apiPath,
  editHref,
  children,
}: DeleteWithUndoProps & { editHref: string; children: React.ReactNode }) {
  const router = useRouter()
  const [hidden, setHidden] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Delete "${itemName}"? This cannot be undone.`)) return

    setHidden(true)
    setDeleting(true)

    try {
      const res = await fetch(`${apiPath}/${itemId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      toast.success(
        `${itemLabel.charAt(0).toUpperCase() + itemLabel.slice(1)} deleted.`
      )
      router.refresh()
    } catch {
      toast.error("Delete failed. Restoring.")
      setHidden(false)
    } finally {
      setDeleting(false)
    }
  }

  if (hidden) return null

  return (
    <tr className="border-b border-line last:border-b-0 hover:bg-bg-2 transition-colors group">
      {children}
      <td className="py-4 px-4 text-right whitespace-nowrap">
        <a
          href={editHref}
          className="font-mono text-xs uppercase tracking-widest font-bold text-accent hover:underline"
        >
          Edit →
        </a>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="font-mono text-xs uppercase tracking-widest font-bold text-red-600 hover:text-red-800 hover:underline ml-4 disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </td>
    </tr>
  )
}
