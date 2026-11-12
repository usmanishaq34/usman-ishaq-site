import { OG_IMAGE } from "@/lib/og-image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/sections/SiteHeader";
import SiteFooter from "@/components/sections/SiteFooter";
import Overlays from "@/components/sections/Overlays";
import Interactions from "@/components/Interactions";
import SelfTest from "@/components/SelfTest";
import { serviceIndex, serviceLoaders } from "@/content/services";
import { agencyCanonical } from "@/content/services/canonical";
import { withSeoOverride } from "@/lib/site-content";
import { prisma } from "@/lib/db";
import { faqFromHtml } from "@/lib/faq-schema";
import { serviceGraph, serviceRelations, type PostRef } from "@/lib/structured-data";

// Single service pages. Content ships in content/services/<slug>.json
// (built from the Digital Vikingz service pages by scripts/import-services.mjs);
// the SEO fields can be overridden from the dashboard.
export const revalidate = 3600;

const CALENDLY = "https://calendly.com/usmanishaqsemanticseospecialist/digital-vikingz";
const WHATSAPP = "https://wa.me/message/7CLDLUNQWRTTD1";

type ServiceDoc = {
  slug: string;
  cardTitle: string;
  title: string;
  description: string;
  h1: string;
  standfirst: string;
  sections: { id: string; heading: string; html: string }[];
  cta: { heading: string; text: string } | null;
};

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string): Promise<ServiceDoc | null> {
  const loader = serviceLoaders[slug];
  if (!loader) return null;
  return (await loader()).default as ServiceDoc;
}

// Published articles named in serviceRelations, in that order. A post that is
// unpublished or renamed simply drops out of the block and the schema.
async function guidesFor(slug: string): Promise<PostRef[]> {
  const wanted = serviceRelations[slug]?.guides ?? [];
  if (!wanted.length) return [];
  const rows = await prisma.post
    .findMany({ where: { slug: { in: wanted }, published: true, noindex: false }, select: { slug: true, title: true } })
    .catch(() => [] as PostRef[]);
  return wanted.map((w) => rows.find((r) => r.slug === w)).filter(Boolean) as PostRef[];
}

export function generateStaticParams() {
  return serviceIndex.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = await load(slug);
  if (!doc) return { title: "Service not found", robots: { index: false, follow: false } };
  const path = `/services/${slug}`;
  return withSeoOverride(
    {
      title: `${doc.title} | Usman Ishaq`,
      description: doc.description,
      alternates: { canonical: agencyCanonical(slug) ?? path },
      openGraph: { title: doc.title, description: doc.description, url: path, type: "website", images: [OG_IMAGE] },
    },
    path,
  );
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const doc = await load(slug);
  if (!doc) notFound();
  const rel = serviceRelations[slug] ?? { guides: [] };
  const linked = [...(rel.related ?? []), ...(rel.similar ?? [])]
    .map((s) => serviceIndex.find((x) => x.slug === s))
    .filter((s): s is (typeof serviceIndex)[number] => Boolean(s));
  const guides = await guidesFor(slug);
  const ld = serviceGraph({
    doc,
    title: `${doc.title} | Usman Ishaq`,
    faqs: faqFromHtml(doc.sections.map((s) => s.html).join("")),
    services: serviceIndex,
    guides,
  });
  return (
    <>
      <SiteHeader light />
      <main className="dv-post svc-page">
        <div className="dv-post-wrap">
          <nav className="dv-post-crumbs" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span>/</span>
            <a href="/#services">Services</a>
            <span>/</span>
            <span>{doc.cardTitle}</span>
          </nav>
          <span className="dv-blog-label">Service</span>
          <h1 className="dv-post-title">{doc.h1}</h1>
          {doc.standfirst ? <p className="post-excerpt">{doc.standfirst}</p> : null}
          <div className="svc-cta">
            <a className="btn btn-primary" href={CALENDLY}>Book a 30-minute call <span className="arrow">→</span></a>
            <a className="btn btn-ghost" href={WHATSAPP} target="_blank" rel="noopener">WhatsApp</a>
          </div>
          <div className="post-content svc-content">
            {doc.sections.map((s) => (
              <section key={s.id} dangerouslySetInnerHTML={{ __html: s.html }} />
            ))}
          </div>
          {linked.length || guides.length ? (
            <aside className="svc-related" aria-label="Related services and guides">
              {linked.length ? (
                <div>
                  <p className="svc-related-label">Related services</p>
                  <ul>
                    {linked.map((s) => (
                      <li key={s.slug}>
                        <a href={`/services/${s.slug}`}>{s.cardTitle}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {guides.length ? (
                <div>
                  <p className="svc-related-label">Guides on this topic</p>
                  <ul>
                    {guides.map((g) => (
                      <li key={g.slug}>
                        <a href={`/blog/${g.slug}`}>{g.title}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </aside>
          ) : null}
          {doc.cta ? (
            <div className="svc-foot">
              <h2>{doc.cta.heading}</h2>
              <p>{doc.cta.text}</p>
              <div className="svc-cta">
                <a className="btn btn-primary" href={CALENDLY}>Book a 30-minute call <span className="arrow">→</span></a>
                <a className="btn btn-ghost" href="/#contact">Send my details</a>
              </div>
            </div>
          ) : null}
          <p className="dv-post-back">
            <a href="/#services">← All services</a>
          </p>
        </div>
      </main>
      <SiteFooter />
      <Overlays />
      <Interactions />
      <SelfTest />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />
    </>
  );
}
