"use client"

import { useState } from "react"
import FormField from "./FormField"
import ImagePicker from "./ImagePicker"

export interface SeoFields {
  seoTitle?: string | null
  seoDescription?: string | null
  focusKeyword?: string | null
  secondaryKeywords?: string[]
  canonicalUrl?: string | null
  noindex?: boolean
  nofollow?: boolean
  ogTitle?: string | null
  ogDescription?: string | null
  ogImage?: string | null
  twitterTitle?: string | null
  twitterDescription?: string | null
  twitterImage?: string | null
  schemaType?: string | null
}

interface Props {
  values: SeoFields
  onChange: (next: SeoFields) => void
  baseUrl?: string  // For canonical URL hint
  showSecondaryKeywords?: boolean
  showSchema?: boolean
}

export default function SeoFieldsPanel({
  values,
  onChange,
  baseUrl = "https://usmanishaq.com",
  showSecondaryKeywords = true,
  showSchema = true,
}: Props) {
  const [tab, setTab] = useState<"basic" | "og" | "twitter" | "advanced">("basic")

  function set<K extends keyof SeoFields>(key: K, value: SeoFields[K]) {
    onChange({ ...values, [key]: value })
  }

  const tabs = [
    { id: "basic" as const, label: "Basic SEO" },
    { id: "og" as const, label: "Open Graph" },
    { id: "twitter" as const, label: "Twitter" },
    { id: "advanced" as const, label: "Advanced" },
  ]

  return (
    <div className="border border-line bg-bg-2">
      <div className="px-5 py-3 border-b border-line bg-bg flex items-center justify-between">
        <h3 className="mono-label">SEO & Social</h3>
        <span className="mono-pill text-ink-muted">Yoast-style</span>
      </div>

      {/* Tab switcher */}
      <div className="flex border-b border-line bg-bg overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-xs font-mono uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${
              tab === t.id
                ? "border-accent text-accent"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-5">
        {/* ====== BASIC SEO ====== */}
        {tab === "basic" && (
          <>
            <FormField label="Focus keyword" hint="The single keyword phrase you want this page to rank for.">
              <input
                type="text"
                value={values.focusKeyword ?? ""}
                onChange={(e) => set("focusKeyword", e.target.value)}
                className="form-input"
                placeholder="semantic seo audit"
              />
            </FormField>

            {showSecondaryKeywords && (
              <FormField label="Secondary keywords" hint="Comma-separated. Supporting/related keywords.">
                <input
                  type="text"
                  value={(values.secondaryKeywords ?? []).join(", ")}
                  onChange={(e) =>
                    set(
                      "secondaryKeywords",
                      e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                    )
                  }
                  className="form-input"
                  placeholder="topical authority, entity audit, content audit"
                />
              </FormField>
            )}

            <FormField label="SEO title" hint="Appears in browser tab and Google results. Aim for 50-60 characters.">
              <input
                type="text"
                value={values.seoTitle ?? ""}
                onChange={(e) => set("seoTitle", e.target.value)}
                className="form-input"
                maxLength={80}
              />
              <CharCount value={values.seoTitle ?? ""} min={30} max={60} />
            </FormField>

            <FormField label="Meta description" hint="The 1-2 sentence snippet shown in search results. Aim for 150-160 characters.">
              <textarea
                value={values.seoDescription ?? ""}
                onChange={(e) => set("seoDescription", e.target.value)}
                className="form-input min-h-[90px]"
                maxLength={200}
              />
              <CharCount value={values.seoDescription ?? ""} min={120} max={160} />
            </FormField>

            {/* Search Result Preview */}
            <div className="border border-line bg-bg p-4">
              <p className="mono-pill text-ink-muted mb-2">Google preview</p>
              <p className="text-sm text-blue-700 truncate">
                {values.seoTitle || "Your title will appear here"}
              </p>
              <p className="text-xs text-green-700 mt-0.5">{baseUrl}/...</p>
              <p className="text-xs text-ink-2 mt-1 leading-relaxed line-clamp-2">
                {values.seoDescription || "Your meta description will appear here."}
              </p>
            </div>
          </>
        )}

        {/* ====== OPEN GRAPH ====== */}
        {tab === "og" && (
          <>
            <p className="text-xs text-ink-muted leading-relaxed mb-3">
              Open Graph fields control how your page appears when shared on Facebook, LinkedIn, WhatsApp, and most social platforms. Defaults to SEO title/description if blank.
            </p>

            <FormField label="OG title" hint="Defaults to SEO title if blank.">
              <input
                type="text"
                value={values.ogTitle ?? ""}
                onChange={(e) => set("ogTitle", e.target.value)}
                className="form-input"
                placeholder={values.seoTitle ?? "Custom Facebook/LinkedIn title"}
              />
            </FormField>

            <FormField label="OG description">
              <textarea
                value={values.ogDescription ?? ""}
                onChange={(e) => set("ogDescription", e.target.value)}
                className="form-input min-h-[80px]"
                placeholder={values.seoDescription ?? "Custom social description"}
              />
            </FormField>

            <FormField label="OG image" hint="1200×630px recommended. Shown when shared on Facebook/LinkedIn.">
              <ImagePicker
                value={values.ogImage ?? ""}
                onChange={(url) => set("ogImage", url)}
              />
            </FormField>
          </>
        )}

        {/* ====== TWITTER ====== */}
        {tab === "twitter" && (
          <>
            <p className="text-xs text-ink-muted leading-relaxed mb-3">
              Twitter Card fields. Defaults to Open Graph values if blank.
            </p>

            <FormField label="Twitter title">
              <input
                type="text"
                value={values.twitterTitle ?? ""}
                onChange={(e) => set("twitterTitle", e.target.value)}
                className="form-input"
                placeholder={values.ogTitle ?? values.seoTitle ?? "Twitter-specific title"}
              />
            </FormField>

            <FormField label="Twitter description">
              <textarea
                value={values.twitterDescription ?? ""}
                onChange={(e) => set("twitterDescription", e.target.value)}
                className="form-input min-h-[80px]"
              />
            </FormField>

            <FormField label="Twitter image" hint="1200×675px for summary_large_image card.">
              <ImagePicker
                value={values.twitterImage ?? ""}
                onChange={(url) => set("twitterImage", url)}
              />
            </FormField>
          </>
        )}

        {/* ====== ADVANCED ====== */}
        {tab === "advanced" && (
          <>
            <FormField label="Canonical URL" hint="Set if this page should canonicalize to a different URL. Leave blank to use the page's own URL.">
              <input
                type="url"
                value={values.canonicalUrl ?? ""}
                onChange={(e) => set("canonicalUrl", e.target.value)}
                className="form-input"
                placeholder={`${baseUrl}/...`}
              />
            </FormField>

            {showSchema && (
              <FormField label="Schema type" hint="Structured data type for this page.">
                <select
                  value={values.schemaType ?? ""}
                  onChange={(e) => set("schemaType", e.target.value)}
                  className="form-input"
                >
                  <option value="WebPage">WebPage</option>
                  <option value="Article">Article (blog post)</option>
                  <option value="AboutPage">AboutPage</option>
                  <option value="ContactPage">ContactPage</option>
                  <option value="Service">Service</option>
                  <option value="FAQPage">FAQPage</option>
                  <option value="HowTo">HowTo</option>
                  <option value="Product">Product</option>
                </select>
              </FormField>
            )}

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={values.noindex ?? false}
                  onChange={(e) => set("noindex", e.target.checked)}
                  className="w-4 h-4 accent-accent mt-0.5"
                />
                <div>
                  <span className="mono-pill text-ink">noindex</span>
                  <p className="text-xs text-ink-muted">Hide this page from search engines.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={values.nofollow ?? false}
                  onChange={(e) => set("nofollow", e.target.checked)}
                  className="w-4 h-4 accent-accent mt-0.5"
                />
                <div>
                  <span className="mono-pill text-ink">nofollow</span>
                  <p className="text-xs text-ink-muted">Don&apos;t pass link equity to outgoing links.</p>
                </div>
              </label>
            </div>
          </>
        )}
      </div>

      <style>{`
        .form-input {
          width: 100%;
          padding: 11px 14px;
          border: 1px solid var(--line-strong);
          font-family: var(--font-body);
          color: var(--text);
          background: var(--bg);
          border-radius: 2px;
          transition: border-color 0.2s;
          font-size: 14px;
        }
        .form-input:focus { outline: none; border-color: var(--accent); }
      `}</style>
    </div>
  )
}

function CharCount({ value, min, max }: { value: string; min: number; max: number }) {
  const len = value.length
  let color = "text-ink-muted"
  if (len > 0 && len < min) color = "text-amber-600"
  else if (len >= min && len <= max) color = "text-green-700"
  else if (len > max) color = "text-red-600"
  return (
    <p className={`text-[10px] font-mono mt-1 ${color}`}>
      {len} / {max} chars (optimal {min}–{max})
    </p>
  )
}
