"use client"

import { useMemo } from "react"
import { analyzeSeo, type SeoInput, type SeoCheck } from "@/lib/seo-score"

export default function SeoScorePanel({ input }: { input: SeoInput }) {
  const analysis = useMemo(() => analyzeSeo(input), [input])

  const ratingColor = {
    poor: "bg-red-500",
    ok: "bg-amber-500",
    good: "bg-green-500",
    excellent: "bg-green-600",
  }[analysis.rating]

  const ratingLabel = {
    poor: "Needs work",
    ok: "Could improve",
    good: "Good",
    excellent: "Excellent",
  }[analysis.rating]

  return (
    <div className="border border-line bg-bg-2 sticky top-20">
      <div className="px-5 py-3 border-b border-line bg-bg flex items-center justify-between">
        <h3 className="mono-label">SEO Score</h3>
        <span className="mono-pill text-ink-muted">live</span>
      </div>

      {/* Score visual */}
      <div className="p-5 border-b border-line">
        <div className="flex items-end gap-3 mb-2">
          <span className="font-display text-5xl font-medium leading-none italic-accent" style={{ fontVariationSettings: '"SOFT" 100, "opsz" 144' }}>
            <em>{analysis.score}</em>
          </span>
          <span className="font-display text-xl text-ink-muted mb-2">/ 100</span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-2.5 h-2.5 rounded-full ${ratingColor}`} />
          <span className="mono-pill text-ink">{ratingLabel}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-bg-3 h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${ratingColor}`}
            style={{ width: `${analysis.score}%` }}
          />
        </div>
      </div>

      {/* Checks list */}
      <div className="p-5">
        <ul className="space-y-2.5">
          {analysis.checks.map((check) => (
            <CheckItem key={check.id} check={check} />
          ))}
        </ul>
      </div>
    </div>
  )
}

function CheckItem({ check }: { check: SeoCheck }) {
  const dotColor = {
    good: "bg-green-500",
    ok: "bg-amber-500",
    bad: "bg-red-500",
  }[check.status]

  return (
    <li className="flex items-start gap-2.5">
      <span className={`w-2 h-2 rounded-full ${dotColor} mt-1.5 flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-ink uppercase tracking-wide font-mono">{check.label}</p>
        <p className="text-xs text-ink-2 leading-relaxed mt-0.5">{check.message}</p>
      </div>
    </li>
  )
}
