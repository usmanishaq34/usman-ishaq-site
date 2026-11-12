import { OG_IMAGE } from "@/lib/og-image";
import type { Metadata } from "next";
import SiteHeader from "@/components/sections/SiteHeader";
import SiteFooter from "@/components/sections/SiteFooter";
import Overlays from "@/components/sections/Overlays";
import Interactions from "@/components/Interactions";
import BlogCategoryFilter from "@/components/BlogCategoryFilter";
import { shortDate } from "@/components/PostCard";
import { prisma } from "@/lib/db";
import { route } from "@/lib/routes";
import { withSeoOverride } from "@/lib/site-content";
import { CASE_STUDIES, industryOf, industrySlug, onlyCaseStudies } from "@/lib/case-studies";
import { caseStudiesHubGraph } from "@/lib/structured-data";

// The case-studies hub. Every published post in the "Case Studies" category,
// newest first, filterable by industry (each post's first tag). The owner adds
// a case study from the dashboard by choosing that category.
export const revalidate = 60;

const r = route(CASE_STUDIES.path);

export function generateMetadata(): Promise<Metadata> {
  return withSeoOverride(
    {
      title: r.title,
      description: r.description,
      alternates: { canonical: CASE_STUDIES.path },
      openGraph: { title: r.title, description: r.description, url: CASE_STUDIES.path, type: "website", images: [OG_IMAGE] },
    },
    CASE_STUDIES.path,
  );
}

export default async function CaseStudiesPage() {
  const items = await prisma.post
    .findMany({
      where: { published: true, ...onlyCaseStudies },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: { id: true, slug: true, title: true, excerpt: true, featuredImage: true, featuredImageAlt: true, tags: true, publishedAt: true, createdAt: true },
    })
    .catch(() => []);
  const industries = [...new Map(items.map((p) => [industrySlug(p.tags), industryOf(p.tags)])).entries()];

  return (
    <>
      <SiteHeader light />
      <main className="dv-blog">
        <div className="dv-blog-wrap">
          <div className="dv-blog-hero">
            <span className="dv-blog-label">Case studies</span>
            <h1 className="dv-blog-h1">
              The work, in order, <em>and what it moved.</em>
            </h1>
            <p className="dv-blog-intro">
              Semantic SEO and AI search projects, step by step, with the Search Console and AI citation numbers behind them.{" "}
              <strong>Clients stay anonymous: business type, country and period only.</strong>
            </p>
            {industries.length > 1 ? (
              <div className="dv-blog-categories">
                <button className="dv-blog-cat-pill active" data-cat="all">All</button>
                {industries.map(([slug, name]) => (
                  <button key={slug} className="dv-blog-cat-pill" data-cat={slug}>{name}</button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="dv-blog-grid" id="blogGrid">
            {items.length === 0 ? (
              <div className="dv-blog-empty">
                <p className="dv-blog-empty-title">Case studies are on the way.</p>
                <p>New ones are published here as each project report is finished.</p>
              </div>
            ) : (
              items.map((p) => (
                <a key={p.id} className="dv-blog-card" href={`${CASE_STUDIES.path}/${p.slug}`} data-cat={industrySlug(p.tags)}>
                  <div className={`dv-blog-card-image${p.featuredImage ? " has-img" : ""}`}>
                    {p.featuredImage ? (
                      <img src={p.featuredImage} alt={p.featuredImageAlt || p.title} loading="lazy" />
                    ) : (
                      <div className="dv-blog-card-image-placeholder">
                        <span className="dv-blog-card-image-initial">{p.title.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="dv-blog-card-body">
                    <div className="dv-blog-card-meta">
                      <span className="dv-blog-card-cat">{industryOf(p.tags)}</span>
                      <span className="dv-blog-card-meta-sep"></span>
                      <span>{shortDate(p.publishedAt ?? p.createdAt)}</span>
                    </div>
                    <h2>{p.title}</h2>
                    <p className="dv-blog-card-excerpt">{p.excerpt}</p>
                    <span className="dv-blog-card-readmore">Read the case study</span>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
      <Overlays />
      <Interactions />
      <BlogCategoryFilter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: caseStudiesHubGraph({
            title: r.title,
            description: r.description,
            items: items.map((p) => ({ slug: p.slug, title: p.title, excerpt: p.excerpt, industry: industryOf(p.tags) })),
          }),
        }}
      />
    </>
  );
}
