// Case studies are CMS posts in one category, served under /case-studies
// instead of /blog. The owner adds new ones from the dashboard by choosing
// this category; the first tag on each post is its industry, used by the hub's
// filter. Client names never appear: business type, country and period only.
export const CASE_STUDIES = {
  slug: "case-studies",
  name: "Case Studies",
  path: "/case-studies",
  description:
    "Anonymised semantic SEO and AI search case studies: the work in the order it was done, and the Search Console and AI citation results it produced.",
} as const;

export type Section = "blog" | "case-studies";

export const sectionBase = (s: Section) => (s === "case-studies" ? CASE_STUDIES.path : "/blog");
export const sectionLabel = (s: Section) => (s === "case-studies" ? "Case studies" : "Blogs");

export const isCaseStudy = (p: { category?: { slug: string } | null }) => p.category?.slug === CASE_STUDIES.slug;

/** Prisma filter: posts that are not case studies (posts with no category stay in). */
export const notCaseStudy = { NOT: { category: { is: { slug: CASE_STUDIES.slug } } } };
/** Prisma filter: case studies only. */
export const onlyCaseStudies = { category: { is: { slug: CASE_STUDIES.slug } } };

export const industryOf = (tags: string[]) => tags[0] || "Case study";
export const industrySlug = (tags: string[]) =>
  industryOf(tags).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
