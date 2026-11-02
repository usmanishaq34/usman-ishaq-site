"use client"

import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react"
import { Node, mergeAttributes } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import { Placeholder } from "@tiptap/extensions"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

// ────────────────────────────────────────────────────────────────────────────
// Resizable Image Node — supports both preset sizes (data-size) and
// free-form drag-to-resize via mouse handle.
// ────────────────────────────────────────────────────────────────────────────
const ResizableImage = Node.create({
  name: "image",
  group: "block",
  inline: false,
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: {
        default: null,
        parseHTML: (el) => el.getAttribute("width"),
        renderHTML: (attrs) => (attrs.width ? { width: attrs.width } : {}),
      },
      "data-size": {
        default: "full",
        parseHTML: (el) => el.getAttribute("data-size") || "full",
        renderHTML: (attrs) =>
          attrs["data-size"] ? { "data-size": attrs["data-size"] } : {},
      },
    }
  },

  parseHTML() {
    return [{ tag: "img[src]" }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes, { class: "rte-image" })]
  },

  addCommands() {
    return {
      setImage:
        (options: { src: string; alt?: string; title?: string }) =>
        ({ commands }: any) => {
          return commands.insertContent({ type: this.name, attrs: options })
        },
    } as any
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView)
  },
})

function ImageNodeView({ node, updateAttributes, selected }: any) {
  const [resizing, setResizing] = useState(false)
  const containerRef = useRef<HTMLSpanElement>(null)
  const startX = useRef(0)
  const startWidth = useRef(0)

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const container = containerRef.current?.querySelector("img")
    if (!container) return
    setResizing(true)
    startX.current = e.clientX
    startWidth.current = container.offsetWidth

    const editorEl = containerRef.current?.closest(".ProseMirror") as HTMLElement | null
    const editorWidth = editorEl?.offsetWidth ?? 700

    function onMove(ev: MouseEvent) {
      const delta = ev.clientX - startX.current
      const newPx = Math.max(80, startWidth.current + delta)
      const pct = Math.min(100, Math.round((newPx / editorWidth) * 100))
      updateAttributes({ width: pct + "%", "data-size": "custom" })
    }
    function onUp() {
      setResizing(false)
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
    }
    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
  }

  const widthStyle = node.attrs.width
    ? { width: node.attrs.width as string }
    : {}

  return (
    <NodeViewWrapper as="span" className="rte-image-wrapper" ref={containerRef as any}>
      <span
        className="rte-image-inner"
        style={{
          position: "relative",
          display: "inline-block",
          ...widthStyle,
          outline: selected ? "3px solid #db4c23" : resizing ? "2px dashed #db4c23" : "none",
          outlineOffset: 2,
        }}
      >
        <img
          src={node.attrs.src}
          alt={node.attrs.alt || ""}
          title={node.attrs.title || ""}
          data-size={node.attrs["data-size"]}
          width={node.attrs.width || undefined}
          className="rte-image"
          style={{ display: "block", maxWidth: "100%", height: "auto" }}
          draggable={false}
        />
        {selected && (
          <span
            onMouseDown={onMouseDown}
            style={{
              position: "absolute",
              right: -6,
              bottom: -6,
              width: 14,
              height: 14,
              background: "#db4c23",
              border: "2px solid #fff",
              borderRadius: "50%",
              cursor: "nwse-resize",
              zIndex: 10,
              boxShadow: "0 0 0 1px rgba(0,0,0,0.2)",
            }}
            title="Drag to resize"
          />
        )}
      </span>
    </NodeViewWrapper>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Main editor
// ────────────────────────────────────────────────────────────────────────────
export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const [showSource, setShowSource] = useState(false)
  const [sourceHtml, setSourceHtml] = useState(value)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)

  const editor = useEditor({
    extensions: [
      // Tiptap 3 bundles Link inside StarterKit; it is switched off there so
      // the Link settings below are the ones in force.
      StarterKit.configure({ heading: { levels: [2, 3, 4, 5, 6] }, link: false }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      ResizableImage,
      TextStyle,
      Color,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: placeholder ?? "Start writing..." }),
    ],
    content: value || "",
    editorProps: {
      // Pasted HTML is cleaned before it enters the document.
      // The post title is already the page's <h1>, so an <h1> inside the body
      // is demoted to <h2> instead of being dropped. h2-h6 pass through as-is,
      // and tables are parsed by the Table extensions above.
      transformPastedHTML(html: string) {
        try {
          const doc = new DOMParser().parseFromString(html, "text/html")
          doc.querySelectorAll("h1").forEach((h1) => {
            const h2 = doc.createElement("h2")
            h2.innerHTML = h1.innerHTML
            h1.replaceWith(h2)
          })
          return doc.body.innerHTML
        } catch {
          return html
        }
      },
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[400px] p-5 focus:outline-none font-body text-ink",
      },
    },
    immediatelyRender: false,
    // Tiptap 3 stops re-rendering on every transaction by default; the toolbar
    // reads editor.isActive() on render, so the old behaviour is kept.
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Only sync external value when editor is NOT focused (avoids race condition
  // where every keystroke / button click triggers a reset)
  useEffect(() => {
    if (!editor) return
    if (editor.isFocused) return
    if (value === editor.getHTML()) return
    editor.commands.setContent(value || "", { emitUpdate: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor])

  function setLink() {
    if (!editor) return
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("Enter URL", previousUrl ?? "https://")
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  async function handleImageUpload(file: File) {
    if (!editor) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload failed")
      const { url, alt } = await res.json()
      editor
        .chain()
        .focus()
        .insertContent({
          type: "image",
          attrs: { src: url, alt: alt ?? file.name, "data-size": "full" },
        })
        .run()
      toast.success("Image inserted")
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  function applySource() {
    onChange(sourceHtml)
    editor?.commands.setContent(sourceHtml, { emitUpdate: false })
    setShowSource(false)
  }

  if (!editor) {
    return (
      <div className="border border-line-strong p-5 min-h-[400px] bg-bg text-ink-muted text-sm">
        Loading editor…
      </div>
    )
  }

  const COLORS = [
    { label: "Default", value: "" },
    { label: "Accent", value: "#db4c23" },
    { label: "Black", value: "#0a0a0a" },
    { label: "Gray", value: "#6b6b65" },
    { label: "Red", value: "#dc2626" },
    { label: "Green", value: "#16a34a" },
    { label: "Blue", value: "#2563eb" },
    { label: "Purple", value: "#9333ea" },
    { label: "Yellow", value: "#ca8a04" },
  ]

  return (
    <div className="border border-line-strong bg-bg rte-container" style={{ borderRadius: 2, position: "relative" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        /* Ensure no parent of the editor breaks position:sticky */
        .rte-container, .rte-container * { box-sizing: border-box; }
        .rte-toolbar {
          position: sticky;
          top: 0;
          z-index: 50;
          background: #faf9f6;
        }
        .rte-image-sub-toolbar {
          position: sticky;
          top: 52px;
          z-index: 49;
          background: rgba(219, 76, 35, 0.05);
        }
        .ProseMirror { outline: none; }
        .ProseMirror img.rte-image { display: block; max-width: 100%; height: auto; cursor: pointer; }
        .ProseMirror .rte-image-wrapper { display: block; margin: 1rem 0; }
        .ProseMirror .rte-image-inner { display: inline-block; vertical-align: top; }
        .ProseMirror h2 { font-family: var(--font-display, Fraunces, Georgia, serif); font-size: 1.75em; font-weight: 600; margin: 1em 0 0.4em; line-height: 1.2; color: #0a0a0a; }
        .ProseMirror h3 { font-family: var(--font-display, Fraunces, Georgia, serif); font-size: 1.4em; font-weight: 600; margin: 1em 0 0.4em; line-height: 1.25; color: #0a0a0a; }
        .ProseMirror h4 { font-family: var(--font-display, Fraunces, Georgia, serif); font-size: 1.15em; font-weight: 600; margin: 0.8em 0 0.4em; color: #0a0a0a; }
        .ProseMirror h5 { font-family: var(--mono, "JetBrains Mono", monospace); font-size: 0.85em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin: 0.9em 0 0.35em; color: #0a0a0a; }
        .ProseMirror h6 { font-family: var(--mono, "JetBrains Mono", monospace); font-size: 0.75em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; margin: 0.9em 0 0.3em; color: #db4c23; }
        .ProseMirror p { margin: 0.6em 0; line-height: 1.6; }

        /* CRITICAL OVERRIDES — globals.css forces strong=orange and em=Fraunces+orange,
           which leaks into the editor. Reset to normal behavior inside the editor. */
        .ProseMirror strong, .ProseMirror b {
          color: inherit !important;
          font-weight: 700 !important;
          font-family: inherit !important;
          font-variation-settings: normal !important;
          font-style: inherit !important;
        }
        .ProseMirror em, .ProseMirror i {
          color: inherit !important;
          font-style: italic !important;
          font-family: inherit !important;
          font-variation-settings: normal !important;
          font-weight: inherit !important;
        }
        /* Also reset for headings — bold inside h2 should stay heading color */
        .ProseMirror h2 strong, .ProseMirror h3 strong, .ProseMirror h4 strong,
        .ProseMirror h2 em, .ProseMirror h3 em, .ProseMirror h4 em {
          color: inherit !important;
          font-family: inherit !important;
        }
        /* TipTap inserts <em> when toggling italic — make sure it doesn't inherit global accent styles */
        .ProseMirror .italic-accent em,
        .italic-accent .ProseMirror em {
          color: inherit !important;
          font-family: inherit !important;
        }

        .ProseMirror ul { list-style: disc; padding-left: 1.4em; margin: 0.6em 0; }
        .ProseMirror ol { list-style: decimal; padding-left: 1.4em; margin: 0.6em 0; }
        .ProseMirror li { margin: 0.2em 0; }
        .ProseMirror blockquote { border-left: 3px solid #db4c23; padding-left: 1em; margin: 1em 0; font-style: italic; color: #6b6b65; }
        .ProseMirror code { background: #f3f1ec; padding: 0.1em 0.3em; font-family: var(--font-mono, monospace); font-size: 0.9em; border-radius: 2px; }
        .ProseMirror pre { background: #0a0a0a; color: #fff; padding: 1em; font-family: var(--font-mono, monospace); font-size: 0.85em; margin: 1em 0; border-radius: 2px; overflow-x: auto; }
        .ProseMirror pre code { background: none; padding: 0; color: inherit; }
        .ProseMirror hr { border: none; border-top: 1px solid rgba(10, 10, 10, 0.22); margin: 2em 0; }
        .ProseMirror a { color: #db4c23; text-decoration: underline; }
        .ProseMirror p.is-editor-empty:first-child::before { color: #9b9b95; content: attr(data-placeholder); float: left; height: 0; pointer-events: none; }

        /* Tables inside the editor */
        .ProseMirror table { border-collapse: collapse; width: 100%; margin: 1em 0; overflow: hidden; table-layout: fixed; }
        .ProseMirror table td, .ProseMirror table th { border: 1px solid #cbcbc5; padding: 8px 10px; vertical-align: top; position: relative; min-width: 1em; }
        .ProseMirror table th { background: #f3f1ec; font-family: var(--mono, "JetBrains Mono", monospace); font-size: 0.72em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; text-align: left; border-bottom: 2px solid #db4c23; }
        .ProseMirror table .selectedCell:after { content: ""; position: absolute; inset: 0; background: rgba(219,76,35,0.12); pointer-events: none; }
        .ProseMirror table .column-resize-handle { position: absolute; right: -2px; top: 0; bottom: 0; width: 4px; background: #db4c23; pointer-events: none; }
        .ProseMirror .tableWrapper { overflow-x: auto; }
      `}} />

      {/* Sticky toolbar */}
      <div
        className="flex flex-wrap items-center gap-1 px-2 py-2 border-b border-line shadow-sm rte-toolbar"
      >
        <ToolGroup>
          <ToolButton active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} label="H2" tip="Heading 2" />
          <ToolButton active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} label="H3" tip="Heading 3" />
          <ToolButton active={editor.isActive("heading", { level: 4 })} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} label="H4" tip="Heading 4" />
          <ToolButton active={editor.isActive("heading", { level: 5 })} onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()} label="H5" tip="Heading 5" />
          <ToolButton active={editor.isActive("heading", { level: 6 })} onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()} label="H6" tip="Heading 6" />
          <ToolButton active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()} label="P" tip="Paragraph" />
        </ToolGroup>

        <Divider />

        <ToolGroup>
          <ToolButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} label="B" tip="Bold" bold />
          <ToolButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} label="I" tip="Italic" italic />
          <ToolButton active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} label="S" tip="Strikethrough" strike />
          <ToolButton active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} label="<>" tip="Inline code" />
        </ToolGroup>

        <Divider />

        {/* Color picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Text color"
            className="min-w-[34px] h-8 px-2 text-sm font-mono transition-colors bg-transparent text-ink hover:bg-bg-3 flex items-center gap-1"
            style={{ borderRadius: 2 }}
          >
            <span style={{
              display: "inline-block",
              width: 14, height: 14,
              borderRadius: 2,
              background: editor.getAttributes("textStyle").color || "#0a0a0a",
              border: "1px solid #ccc",
            }} />
            <span style={{ fontSize: 10 }}>▾</span>
          </button>
          {showColorPicker && (
            <div
              className="absolute top-full left-0 mt-1 bg-bg border border-line p-2 shadow-lg z-40"
              style={{ borderRadius: 2, minWidth: 180 }}
            >
              <div className="grid grid-cols-3 gap-1">
                {COLORS.map((c) => (
                  <button
                    key={c.value || "default"}
                    type="button"
                    onClick={() => {
                      if (c.value) {
                        editor.chain().focus().setColor(c.value).run()
                      } else {
                        editor.chain().focus().unsetColor().run()
                      }
                      setShowColorPicker(false)
                    }}
                    className="flex items-center gap-1.5 p-1.5 hover:bg-bg-2 text-left"
                    style={{ borderRadius: 2 }}
                    title={c.label}
                  >
                    <span style={{
                      width: 14, height: 14,
                      background: c.value || "transparent",
                      border: c.value ? "1px solid rgba(0,0,0,0.2)" : "1px dashed #999",
                      borderRadius: 2,
                      flexShrink: 0,
                    }} />
                    <span className="text-xs">{c.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-line flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-ink-muted">Custom:</span>
                <input
                  type="color"
                  onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                  className="w-8 h-6 cursor-pointer"
                  style={{ borderRadius: 2 }}
                />
              </div>
            </div>
          )}
        </div>

        <Divider />

        <ToolGroup>
          <ToolButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} label="• ≡" tip="Bullet list" />
          <ToolButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} label="1. ≡" tip="Numbered list" />
          <ToolButton active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} label="❝" tip="Quote" />
          <ToolButton active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} label="{}" tip="Code block" />
          <ToolButton onClick={() => editor.chain().focus().setHorizontalRule().run()} label="―" tip="Horizontal rule" />
        </ToolGroup>

        <Divider />

        <ToolGroup>
          <ToolButton active={editor.isActive("link")} onClick={setLink} label="🔗" tip="Link" />
          <ToolButton onClick={() => fileInputRef.current?.click()} label={uploading ? "..." : "🖼"} tip="Insert image" disabled={uploading} />
          <ToolButton
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            label="⊞"
            tip="Insert table"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleImageUpload(f)
            }}
          />
        </ToolGroup>

        <Divider />

        <ToolGroup>
          <ToolButton onClick={() => editor.chain().focus().undo().run()} label="↶" tip="Undo" disabled={!editor.can().undo()} />
          <ToolButton onClick={() => editor.chain().focus().redo().run()} label="↷" tip="Redo" disabled={!editor.can().redo()} />
        </ToolGroup>

        <div className="ml-auto">
          <button
            type="button"
            onClick={() => {
              setSourceHtml(editor.getHTML())
              setShowSource(!showSource)
            }}
            className="mono-pill px-3 py-1.5 border border-line-strong text-ink hover:border-accent hover:text-accent transition-colors"
          >
            {showSource ? "← Editor" : "</> HTML"}
          </button>
        </div>
      </div>

      {/* Image size sub-toolbar — shown when image is selected */}
      {editor.isActive("image") && !showSource && (
        <div
          className="flex items-center gap-1 px-2 py-2 border-b border-line bg-accent-soft flex-wrap rte-image-sub-toolbar"
        >
          <span className="mono-pill text-accent mr-2">Image size:</span>
          {([
            { label: "S", value: "small", width: "25%" },
            { label: "M", value: "medium", width: "50%" },
            { label: "L", value: "large", width: "75%" },
            { label: "XL", value: "xlarge", width: "90%" },
            { label: "Full", value: "full", width: "100%" },
          ] as const).map((preset) => {
            const isActive = editor.getAttributes("image")["data-size"] === preset.value
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() =>
                  editor.chain().focus().updateAttributes("image", {
                    width: preset.width,
                    "data-size": preset.value,
                  }).run()
                }
                className={`mono-pill px-3 py-1.5 transition-colors ${
                  isActive
                    ? "bg-accent text-white"
                    : "bg-bg text-ink hover:bg-accent hover:text-white border border-line-strong"
                }`}
                style={{ borderRadius: 2 }}
              >
                {preset.label}
              </button>
            )
          })}
          <div className="ml-3 flex items-center gap-2">
            <span className="mono-pill text-ink-muted">Custom %:</span>
            <input
              type="number"
              min={10}
              max={100}
              placeholder="60"
              className="w-16 px-2 py-1.5 border border-line-strong text-sm font-mono"
              style={{ borderRadius: 2 }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  const v = parseInt((e.target as HTMLInputElement).value)
                  if (v >= 10 && v <= 100) {
                    editor.chain().focus().updateAttributes("image", {
                      width: v + "%",
                      "data-size": "custom",
                    }).run()
                  }
                }
              }}
            />
          </div>
          <span className="ml-3 text-[11px] text-ink-muted">
            💡 Tip: drag the orange dot in the bottom-right corner to resize the image
          </span>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteSelection().run()}
            className="ml-auto mono-pill px-3 py-1.5 text-red-600 hover:bg-red-50"
            style={{ borderRadius: 2 }}
          >
            ✕ Remove
          </button>
        </div>
      )}

      {/* Table controls sub-toolbar — shown when cursor is inside a table */}
      {editor.isActive("table") && !showSource && (
        <div
          className="flex items-center gap-1 px-2 py-2 border-b border-line bg-accent-soft flex-wrap rte-image-sub-toolbar"
        >
          <span className="mono-pill text-accent mr-2">Table:</span>
          <TableBtn onClick={() => editor.chain().focus().addColumnBefore().run()} label="+ Col ←" tip="Add column before" />
          <TableBtn onClick={() => editor.chain().focus().addColumnAfter().run()} label="+ Col →" tip="Add column after" />
          <TableBtn onClick={() => editor.chain().focus().deleteColumn().run()} label="✕ Col" tip="Delete column" />
          <span className="w-px h-5 bg-line mx-1" />
          <TableBtn onClick={() => editor.chain().focus().addRowBefore().run()} label="+ Row ↑" tip="Add row above" />
          <TableBtn onClick={() => editor.chain().focus().addRowAfter().run()} label="+ Row ↓" tip="Add row below" />
          <TableBtn onClick={() => editor.chain().focus().deleteRow().run()} label="✕ Row" tip="Delete row" />
          <span className="w-px h-5 bg-line mx-1" />
          <TableBtn onClick={() => editor.chain().focus().toggleHeaderRow().run()} label="Header" tip="Toggle header row" />
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="ml-auto mono-pill px-3 py-1.5 text-red-600 hover:bg-red-50"
            style={{ borderRadius: 2 }}
          >
            ✕ Delete table
          </button>
        </div>
      )}

      {showSource ? (
        <div>
          <textarea
            value={sourceHtml}
            onChange={(e) => setSourceHtml(e.target.value)}
            className="w-full p-5 font-mono text-xs text-ink min-h-[400px] focus:outline-none bg-bg-2"
            spellCheck={false}
          />
          <div className="px-3 py-2 border-t border-line bg-bg-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowSource(false)}
              className="mono-pill px-3 py-1.5 border border-line-strong text-ink-muted hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={applySource}
              className="mono-pill px-3 py-1.5 bg-accent text-white"
            >
              Apply HTML
            </button>
          </div>
        </div>
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  )
}

function ToolGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>
}

function Divider() {
  return <div className="w-px h-6 bg-line mx-1" />
}

function TableBtn({ onClick, label, tip }: { onClick: () => void; label: string; tip: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={tip}
      className="mono-pill px-3 py-1.5 bg-bg text-ink hover:bg-accent hover:text-white border border-line-strong transition-colors"
      style={{ borderRadius: 2 }}
    >
      {label}
    </button>
  )
}

function ToolButton({
  active,
  onClick,
  label,
  tip,
  disabled,
  bold,
  italic,
  strike,
}: {
  active?: boolean
  onClick: () => void
  label: string
  tip: string
  disabled?: boolean
  bold?: boolean
  italic?: boolean
  strike?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={tip}
      className={`
        min-w-[34px] h-8 px-2 text-sm font-mono transition-colors
        ${active ? "bg-accent text-white" : "bg-transparent text-ink hover:bg-bg-3"}
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        ${bold ? "font-bold" : ""}
        ${italic ? "italic" : ""}
        ${strike ? "line-through" : ""}
      `}
      style={{ borderRadius: 2 }}
    >
      {label}
    </button>
  )
}
