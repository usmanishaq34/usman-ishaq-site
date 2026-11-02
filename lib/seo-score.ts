/**
 * SEO Scoring Engine — Yoast-style analysis.
 * Runs 12 checks against a content piece + focus keyword and returns
 * a score (0-100) plus a list of suggestions.
 */

export type SeoCheckStatus = "good" | "ok" | "bad"

export interface SeoCheck {
  id: string
  label: string
  status: SeoCheckStatus
  message: string
}

export interface SeoAnalysis {
  score: number // 0-100
  rating: "poor" | "ok" | "good" | "excellent"
  checks: SeoCheck[]
}

export interface SeoInput {
  title: string
  seoTitle?: string
  seoDescription?: string
  content?: string // plain text or HTML
  slug?: string
  focusKeyword?: string
  secondaryKeywords?: string[]
  featuredImage?: string
  featuredImageAlt?: string
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function countOccurrences(text: string, keyword: string): number {
  if (!keyword) return 0
  const re = new RegExp(`\\b${keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi")
  return (text.toLowerCase().match(re) || []).length
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

export function analyzeSeo(input: SeoInput): SeoAnalysis {
  const checks: SeoCheck[] = []
  const content = input.content ? stripHtml(input.content) : ""
  const words = wordCount(content)
  const seoTitle = input.seoTitle || input.title || ""
  const seoDesc = input.seoDescription || ""
  const focusKw = (input.focusKeyword || "").trim().toLowerCase()

  // -------- 1. Focus keyword set --------
  if (!focusKw) {
    checks.push({
      id: "focus-keyword",
      label: "Focus keyword",
      status: "bad",
      message: "No focus keyword set. Add one to enable full analysis.",
    })
  } else {
    checks.push({
      id: "focus-keyword",
      label: "Focus keyword",
      status: "good",
      message: `Focus keyword: "${focusKw}"`,
    })
  }

  // -------- 2. SEO title length --------
  const titleLen = seoTitle.length
  if (titleLen === 0) {
    checks.push({ id: "title-length", label: "Title length", status: "bad", message: "Title is empty." })
  } else if (titleLen < 30) {
    checks.push({ id: "title-length", label: "Title length", status: "ok", message: `Title is ${titleLen} chars — try 50-60 for best results.` })
  } else if (titleLen > 60) {
    checks.push({ id: "title-length", label: "Title length", status: "ok", message: `Title is ${titleLen} chars — over 60 will get truncated in search results.` })
  } else {
    checks.push({ id: "title-length", label: "Title length", status: "good", message: `Title is ${titleLen} chars — good length.` })
  }

  // -------- 3. Focus keyword in title --------
  if (focusKw) {
    if (seoTitle.toLowerCase().includes(focusKw)) {
      checks.push({ id: "kw-in-title", label: "Keyword in title", status: "good", message: "Focus keyword appears in title." })
    } else {
      checks.push({ id: "kw-in-title", label: "Keyword in title", status: "bad", message: "Focus keyword not in title. Add it for better ranking." })
    }
  }

  // -------- 4. SEO description length --------
  const descLen = seoDesc.length
  if (descLen === 0) {
    checks.push({ id: "desc-length", label: "Meta description", status: "bad", message: "Description is empty." })
  } else if (descLen < 120) {
    checks.push({ id: "desc-length", label: "Meta description", status: "ok", message: `Description is ${descLen} chars — aim for 150-160.` })
  } else if (descLen > 160) {
    checks.push({ id: "desc-length", label: "Meta description", status: "ok", message: `Description is ${descLen} chars — over 160 will be truncated.` })
  } else {
    checks.push({ id: "desc-length", label: "Meta description", status: "good", message: `Description is ${descLen} chars — good length.` })
  }

  // -------- 5. Focus keyword in description --------
  if (focusKw) {
    if (seoDesc.toLowerCase().includes(focusKw)) {
      checks.push({ id: "kw-in-desc", label: "Keyword in description", status: "good", message: "Focus keyword appears in meta description." })
    } else {
      checks.push({ id: "kw-in-desc", label: "Keyword in description", status: "bad", message: "Focus keyword missing from meta description." })
    }
  }

  // -------- 6. Focus keyword in slug --------
  if (focusKw && input.slug) {
    const slugKw = focusKw.replace(/\s+/g, "-")
    if (input.slug.includes(slugKw) || input.slug.replace(/-/g, " ").includes(focusKw)) {
      checks.push({ id: "kw-in-slug", label: "Keyword in URL slug", status: "good", message: "Focus keyword appears in URL slug." })
    } else {
      checks.push({ id: "kw-in-slug", label: "Keyword in URL slug", status: "ok", message: "Focus keyword not in URL slug." })
    }
  }

  // -------- 7. Content length --------
  if (content) {
    if (words < 300) {
      checks.push({ id: "content-length", label: "Content length", status: "bad", message: `Only ${words} words — aim for at least 600 for blog posts.` })
    } else if (words < 600) {
      checks.push({ id: "content-length", label: "Content length", status: "ok", message: `${words} words — could be longer for stronger ranking.` })
    } else {
      checks.push({ id: "content-length", label: "Content length", status: "good", message: `${words} words — solid length.` })
    }
  }

  // -------- 8. Focus keyword density --------
  if (focusKw && content && words > 0) {
    const occurrences = countOccurrences(content, focusKw)
    const density = (occurrences / words) * 100
    if (occurrences === 0) {
      checks.push({ id: "kw-density", label: "Keyword in content", status: "bad", message: "Focus keyword not found in body content." })
    } else if (density < 0.5) {
      checks.push({ id: "kw-density", label: "Keyword density", status: "ok", message: `Keyword appears ${occurrences}x (${density.toFixed(1)}%) — slightly low, aim for 0.5-2.5%.` })
    } else if (density > 2.5) {
      checks.push({ id: "kw-density", label: "Keyword density", status: "ok", message: `Keyword appears ${occurrences}x (${density.toFixed(1)}%) — possible over-optimization.` })
    } else {
      checks.push({ id: "kw-density", label: "Keyword density", status: "good", message: `Keyword density ${density.toFixed(1)}% — natural usage.` })
    }
  }

  // -------- 9. Focus keyword in first 100 words --------
  if (focusKw && content) {
    const first100 = content.split(/\s+/).slice(0, 100).join(" ").toLowerCase()
    if (first100.includes(focusKw)) {
      checks.push({ id: "kw-in-intro", label: "Keyword in intro", status: "good", message: "Focus keyword appears in first 100 words." })
    } else {
      checks.push({ id: "kw-in-intro", label: "Keyword in intro", status: "ok", message: "Add focus keyword to the introduction." })
    }
  }

  // -------- 10. Featured image --------
  if (input.featuredImage) {
    if (input.featuredImageAlt && input.featuredImageAlt.length > 5) {
      checks.push({ id: "image-alt", label: "Image alt text", status: "good", message: "Featured image has alt text." })
    } else {
      checks.push({ id: "image-alt", label: "Image alt text", status: "bad", message: "Featured image missing alt text." })
    }
  } else {
    checks.push({ id: "featured-image", label: "Featured image", status: "ok", message: "No featured image set. Add one for better social sharing." })
  }

  // -------- 11. Headings (h2/h3 in content) --------
  if (input.content) {
    const h2Count = (input.content.match(/<h2/gi) || []).length
    const h3Count = (input.content.match(/<h3/gi) || []).length
    if (h2Count >= 2) {
      checks.push({ id: "headings", label: "Subheadings", status: "good", message: `${h2Count} H2s and ${h3Count} H3s — good structure.` })
    } else if (h2Count === 1) {
      checks.push({ id: "headings", label: "Subheadings", status: "ok", message: "Only 1 H2. Add more for scannable structure." })
    } else if (words > 300) {
      checks.push({ id: "headings", label: "Subheadings", status: "bad", message: "No H2 subheadings. Break content into sections." })
    }
  }

  // -------- 12. Internal links --------
  if (input.content) {
    const internalLinks = (input.content.match(/<a\s+[^>]*href=["']\/[^"']*["']/gi) || []).length
    if (internalLinks >= 1) {
      checks.push({ id: "internal-links", label: "Internal links", status: "good", message: `${internalLinks} internal link(s) — good.` })
    } else if (words > 500) {
      checks.push({ id: "internal-links", label: "Internal links", status: "ok", message: "No internal links. Add 1-3 to related content." })
    }
  }

  // -------- Score --------
  const goodCount = checks.filter((c) => c.status === "good").length
  const okCount = checks.filter((c) => c.status === "ok").length
  const score = Math.round(((goodCount * 100 + okCount * 50) / (checks.length * 100)) * 100)

  let rating: SeoAnalysis["rating"] = "poor"
  if (score >= 85) rating = "excellent"
  else if (score >= 70) rating = "good"
  else if (score >= 50) rating = "ok"

  return { score, rating, checks }
}
