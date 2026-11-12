// Service pages whose text is still the imported Digital Vikingz copy
// (scripts/import-services.mjs). Two domains publishing the same page split
// ranking signals, so each one points its canonical at the agency page it came
// from and stays out of the sitemap. When a page is rewritten in Usman Ishaq's
// own consultant voice, remove its slug here: it then canonicalises to itself
// and returns to the sitemap. Decision: map/usmanishaq/cross-domain-check-2026-11-11.md.
export const AGENCY_SERVICE_BASE = "https://digitalvikingz.com/services";

export const canonicalToAgency = new Set<string>([
  "semantic-seo-architecture",
  "semantic-content-audit",
  "website-development",
  "ai-search-visibility",
  "semantic-content-production",
  "social-media-management",
  "white-label-semantic-seo",
]);

export const agencyCanonical = (slug: string): string | null =>
  canonicalToAgency.has(slug) ? `${AGENCY_SERVICE_BASE}/${slug}` : null;
