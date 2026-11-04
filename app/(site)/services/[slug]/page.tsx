import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/sections/SiteHeader";
import SiteFooter from "@/components/sections/SiteFooter";
import Overlays from "@/components/sections/Overlays";
import Interactions from "@/components/Interactions";
import { serviceIndex, serviceLoaders } from "@/content/services";
import { withSeoOverride } from "@/lib/site-content";

// Single service pages. Content ships in content/services/<slug>.json
// (built from the Digital Vikingz service pages by scripts/import-services.mjs);
// the SEO fields can be overridden from the dashboard.
export const revalidate = 3600;

const CALENDLY = "https://calendly.com/usmanishaqsemanticseospecialist/30min";
const WHATSAPP = "https://wa.me/message/7CLDLUNQWRTTD1";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://usmanishaq.com";

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
      alternates: { canonical: path },
      openGraph: { title: doc.title, description: doc.description, url: path, type: "website", images: ["/images/usman-ishaq-portrait.webp"] },
    },
    path,
  );
}

function serviceJsonLd(doc: ServiceDoc): string {
  const url = `${siteUrl}/services/${doc.slug}`;
  const faqs = [...doc.sections.flatMap((s) => [...s.html.matchAll(/<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)])].map((m) => ({
    "@type": "Question",
    name: m[1].replace(/<[^>]+>/g, "").trim(),
    acceptedAnswer: { "@type": "Answer", text: m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() },
  }));
  const graph: unknown[] = [
    {
      "@type": "Service",
      "@id": `${url}#service`,
      name: doc.cardTitle,
      description: doc.description,
      url,
      serviceType: doc.cardTitle,
      provider: { "@id": "https://digitalvikingz.com/#organization" },
      areaServed: ["United States", "United Kingdom", "Canada", "Australia", "United Arab Emirates", "Germany"],
    },
  ];
  if (faqs.length) graph.push({ "@type": "FAQPage", "@id": `${url}#faq`, mainEntity: faqs });
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/<\/script/gi, "<\\/script");
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const doc = await load(slug);
  if (!doc) notFound();
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serviceJsonLd(doc) }} />
    </>
  );
}
