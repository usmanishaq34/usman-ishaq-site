/* One JSON-LD @graph per page, built from the same identity block everywhere.

   The site's entity chain (the "car → offer → manufacturer" model):
     WebSite ─ about → Semantic SEO (central entity)
     WebPage ─ about / mainEntity → the page's one primary entity
     Person (#person) ─ worksFor → Digital Vikingz, hasOfferCatalog → Services
     Service ─ provider → Person, hasOfferCatalog → deliverables, isRelatedTo → sibling services
     BlogPosting ─ author / publisher → Person, isPartOf → Blog

   Every node a page references is declared on that page, so each graph is a
   closed loop. Internal links are mirrored on the WebPage node with one rule
   site-wide: links to service pages are `significantLink`, links to articles
   are `relatedLink`. Schema states only what the page states. */

export const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://usmanishaq.com";

export const ID = {
  person: `${SITE}/#person`,
  website: `${SITE}/#website`,
  entity: `${SITE}/#semantic-seo`,
  org: "https://digitalvikingz.com/#organization",
  blog: `${SITE}/blog#blog`,
  services: `${SITE}/#services`,
};

type Node = Record<string, unknown>;

const COUNTRIES = ["United States", "United Kingdom", "Canada", "Australia", "United Arab Emirates", "Germany"];
export const areaServed = COUNTRIES.map((name) => ({ "@type": "Country", name }));

const wiki = (title: string, qid: string) => [`https://en.wikipedia.org/wiki/${title}`, `https://www.wikidata.org/wiki/${qid}`];
const topic = (name: string, sameAs: string[], alternateName?: string): Node => ({ "@type": "Thing", name, ...(alternateName ? { alternateName } : {}), sameAs });

/* The constant definition. The words after "is" never change (brand guidelines §1). */
const PERSON_DESCRIPTION = "Usman Ishaq is a semantic SEO strategist and consultant, and the founder of Digital Vikingz.";

export function entityNode(): Node {
  return { "@type": "Thing", "@id": ID.entity, name: "Semantic SEO", alternateName: ["Entity SEO", "Entity-based SEO"] };
}

export function personNode(): Node {
  return {
    "@type": "Person",
    "@id": ID.person,
    name: "Usman Ishaq",
    url: `${SITE}/`,
    image: { "@type": "ImageObject", "@id": `${SITE}/#person-image`, url: `${SITE}/images/usman-ishaq-portrait.webp`, caption: "Usman Ishaq" },
    description: PERSON_DESCRIPTION,
    jobTitle: "Semantic SEO Strategist and Consultant",
    email: "contact@usmanishaq.com",
    telephone: "+1-608-360-1290",
    worksFor: { "@id": ID.org },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "University of Engineering and Technology, Taxila",
      sameAs: wiki("University_of_Engineering_and_Technology,_Taxila", "Q7895379"),
    },
    knowsAbout: [
      { "@id": ID.entity },
      "Topical maps",
      "Semantic content",
      "Topical authority",
      topic("Search engine optimization", wiki("Search_engine_optimization", "Q180711")),
      topic("Semantic search", wiki("Semantic_search", "Q1891170")),
      topic("Knowledge graph", wiki("Knowledge_graph", "Q33002955")),
      topic("Schema.org", wiki("Schema.org", "Q3475322")),
      topic("Information architecture", wiki("Information_architecture", "Q845921")),
      topic("Content strategy", wiki("Content_strategy", "Q4353935")),
      topic("AI search visibility", wiki("Generative_engine_optimization", "Q134083964"), "Generative engine optimization"),
      topic("Local search engine optimisation", wiki("Local_search_engine_optimisation", "Q30324357")),
      topic("Google Business Profile", ["https://www.wikidata.org/wiki/Q21235252"]),
      topic("Web development", wiki("Web_development", "Q386275")),
    ],
    sameAs: [
      "https://www.linkedin.com/in/usmanishaqseo/",
      "https://www.youtube.com/@UsmanSemanticSEOStrategist",
      "https://medium.com/@usmanishaq",
      "https://www.upwork.com/freelancers/usmanishaq",
      "https://www.facebook.com/usmanishaq9380/",
      "https://www.instagram.com/usmanishaqsemanticseo/",
      "https://ka.gravatar.com/usmanishaqsemanticseospecialist",
      "https://digitalvikingz.com/team#usman-ishaq",
    ],
  };
}

/* Same @id and type as the node on digitalvikingz.com, so both domains describe one organisation. */
export function orgNode(): Node {
  return {
    "@type": "ProfessionalService",
    "@id": ID.org,
    name: "Digital Vikingz",
    url: "https://digitalvikingz.com/",
    logo: "https://digitalvikingz.com/img/logo.png",
    founder: { "@id": ID.person },
    areaServed,
    sameAs: [
      "https://www.linkedin.com/company/digital-vikingz",
      "https://www.instagram.com/digitalvikingzofficial/",
      "https://www.facebook.com/DigitalVikingz/",
    ],
  };
}

export function websiteNode(): Node {
  return {
    "@type": "WebSite",
    "@id": ID.website,
    url: `${SITE}/`,
    name: "Usman Ishaq",
    inLanguage: "en",
    publisher: { "@id": ID.person },
    about: { "@id": ID.entity },
  };
}

/** Site-wide nodes every page declares, so every @id a page uses resolves on that page. */
export const identityNodes = (): Node[] => [personNode(), orgNode(), websiteNode(), entityNode()];

export function breadcrumbNode(pageUrl: string, trail: { name: string; url: string }[]): Node {
  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: t.url })),
  };
}

export function faqNode(pageUrl: string, faqs: { q: string; a: string }[]): Node | null {
  if (!faqs.length) return null;
  return {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    isPartOf: { "@id": `${pageUrl}#webpage` },
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

/* ---------- internal links ---------- */

const LEGACY_SECTIONS = /^\/(?:semantic-seo|content-writing|social-media-marketing)\/([^/?#]+)\/?$/;
const LEGACY_SPECIAL: Record<string, string> = {
  "/semantic-seo/what-is-semantic-seo": "/blog/semantic-seo-keywords-to-knowledge",
  "/blog/what-is-semantic-seo": "/blog/semantic-seo-keywords-to-knowledge",
  "/what-is-semantic-seo": "/blog/semantic-seo-keywords-to-knowledge",
};

/** Maps one href to the live, slashless URL of this site; other hosts pass through. */
export function normalizeHref(href: string): string {
  let h = href.trim();
  const abs = h.match(/^https?:\/\/(?:www\.)?usmanishaq\.com(\/[^\s]*)?$/i);
  if (abs) h = abs[1] || "/";
  if (!h.startsWith("/") || h.startsWith("//")) return href;
  const hashAt = h.search(/[?#]/);
  let path = hashAt >= 0 ? h.slice(0, hashAt) : h;
  const rest = hashAt >= 0 ? h.slice(hashAt) : "";
  if (path.length > 1) path = path.replace(/\/+$/, "");
  if (LEGACY_SPECIAL[path]) path = LEGACY_SPECIAL[path];
  else {
    const m = `${path}/`.match(LEGACY_SECTIONS);
    if (m) path = `/blog/${m[1]}`;
  }
  return path + rest;
}

/** Rewrites legacy WordPress paths, absolute self-links and trailing slashes in body links. */
export function normalizeInternalLinks(html: string): string {
  if (!html) return "";
  return html.replace(/(<a\b[^>]*?\bhref=")([^"]+)(")/gi, (_, a, href, z) => a + normalizeHref(href) + z);
}

/** Unique internal links in a block of HTML, split by the site-wide rule. */
export function linksIn(html: string, self?: string): { significantLink: string[]; relatedLink: string[] } {
  const seen = new Set<string>();
  const significantLink: string[] = [];
  const relatedLink: string[] = [];
  for (const m of (html || "").matchAll(/<a\b[^>]*?\bhref="([^"]+)"/gi)) {
    const path = normalizeHref(m[1]).replace(/[?#].*$/, "");
    if (!path.startsWith("/") || path === self || seen.has(path)) continue;
    seen.add(path);
    if (/^\/services\/[a-z0-9-]+$/.test(path)) significantLink.push(`${SITE}${path}`);
    else if (/^\/blog\/[a-z0-9-]+$/.test(path)) relatedLink.push(`${SITE}${path}`);
  }
  return { significantLink, relatedLink };
}

export function serialize(graph: (Node | null)[]): string {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph.filter(Boolean) }).replace(/<\/script/gi, "<\\/script");
}

const strip = (s: string) =>
  s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();

/* ---------- homepage ---------- */

export type ServiceRef = { slug: string; cardTitle: string; description: string };
export type PostRef = { slug: string; title: string };

export const serviceUrl = (slug: string) => `${SITE}/services/${slug}`;
export const postUrl = (slug: string) => `${SITE}/blog/${slug}`;

export function serviceStub(s: ServiceRef): Node {
  return {
    "@type": "Service",
    "@id": `${serviceUrl(s.slug)}#service`,
    name: s.cardTitle,
    url: serviceUrl(s.slug),
    description: s.description,
    provider: { "@id": serviceProvider(s.slug) },
  };
}

/* The homepage is about the person: Person is "the car", the services are the offer,
   Digital Vikingz is the delivery team. */
export function homeGraph(opts: {
  title: string;
  description: string;
  html: string;
  faqs: { q: string; a: string }[];
  services: ServiceRef[];
  latestPosts: PostRef[];
}): string {
  const url = `${SITE}/`;
  const links = linksIn(opts.html, "/");
  const person = personNode();
  person.mainEntityOfPage = { "@id": `${url}#webpage` };
  person.hasOfferCatalog = {
    "@type": "OfferCatalog",
    "@id": ID.services,
    name: "Semantic SEO services",
    itemListElement: opts.services.map(serviceStub),
  };
  const faq = faqNode(url, opts.faqs);
  const page: Node = {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: opts.title,
    description: opts.description,
    inLanguage: "en",
    isPartOf: { "@id": ID.website },
    about: { "@id": ID.person },
    mainEntity: { "@id": ID.person },
    primaryImageOfPage: { "@id": `${SITE}/#person-image` },
    significantLink: dedupe([...links.significantLink, ...opts.services.map((s) => serviceUrl(s.slug))]),
    relatedLink: dedupe([...links.relatedLink, ...opts.latestPosts.map((p) => postUrl(p.slug))]),
    ...(faq ? { hasPart: { "@id": `${url}#faq` } } : {}),
  };
  return serialize([page, person, orgNode(), websiteNode(), entityNode(), faq]);
}

/* ---------- service pages ---------- */

type Relation = { related?: string[]; similar?: string[]; guides: string[]; byOrg?: boolean };

/* Which services and articles each service page links to (visible block and schema).
   Relations follow the method order: architecture → audit → production → build → AI visibility.
   White-label resells the same deliverables, so those services are isSimilarTo, not isRelatedTo. */
export const serviceRelations: Record<string, Relation> = {
  "semantic-seo-architecture": {
    related: ["semantic-content-audit", "semantic-content-production", "website-development"],
    guides: ["topical-map-business-website", "source-context-central-entity", "query-deserves-page-content-structure"],
  },
  "semantic-content-audit": {
    related: ["semantic-seo-architecture", "semantic-content-production", "ai-search-visibility"],
    guides: ["query-deserves-page-content-structure", "what-is-semantic-content", "visual-semantics-seo"],
  },
  "semantic-content-production": {
    related: ["semantic-seo-architecture", "semantic-content-audit", "ai-search-visibility"],
    guides: ["what-is-semantic-content", "semantic-content-network-strategy-guide", "semantic-copywriting-for-conversions"],
  },
  "website-development": {
    related: ["semantic-seo-architecture", "semantic-content-production", "ai-search-visibility"],
    guides: ["visual-semantics-seo", "semantic-seo-strategy-for-service-businesses"],
  },
  "ai-search-visibility": {
    related: ["semantic-content-audit", "semantic-content-production", "semantic-seo-architecture"],
    guides: ["claim-your-business-in-chatgpt", "source-context-central-entity", "what-is-semantic-content"],
  },
  "social-media-management": { related: ["ai-search-visibility"], guides: [], byOrg: true },
  "white-label-semantic-seo": {
    similar: ["semantic-seo-architecture", "semantic-content-audit", "semantic-content-production", "ai-search-visibility"],
    guides: ["topical-map-business-website", "semantic-content-network-strategy-guide"],
  },
};

/* Usman Ishaq sells and leads the strategy services; the social service is sold as Digital Vikingz. */
export function serviceProvider(slug: string): string {
  return serviceRelations[slug]?.byOrg ? ID.org : ID.person;
}

export type ServiceDocLike = {
  slug: string;
  cardTitle: string;
  title: string;
  description: string;
  h1: string;
  standfirst: string;
  sections: { id: string; heading: string; html: string }[];
};

function deliverablesOf(doc: ServiceDocLike) {
  for (const s of doc.sections) {
    const items = [...s.html.matchAll(/<div class="deliverable">\s*<h3>([\s\S]*?)<\/h3>[\s\S]*?<dd>([\s\S]*?)<\/dd>/g)].map((m) => ({
      name: strip(m[1]),
      description: strip(m[2]),
    }));
    if (items.length) return { heading: s.heading, items };
  }
  return null;
}

function processOf(doc: ServiceDocLike) {
  for (const s of doc.sections) {
    if (!/^How (?:does|is)\b.*\b(?:run|built)\b.*\?$/.test(s.heading)) continue;
    const ol = s.html.match(/<ol[\s\S]*?<\/ol>/);
    if (!ol) continue;
    const steps = [...ol[0].matchAll(/<li>\s*<b>([\s\S]*?)<\/b>\s*<span>([\s\S]*?)<\/span>\s*<\/li>/g)].map((m) => ({ name: strip(m[1]), text: strip(m[2]) }));
    if (steps.length >= 2) return { heading: s.heading, steps };
  }
  return null;
}

export function serviceGraph(opts: {
  doc: ServiceDocLike;
  title: string;
  faqs: { q: string; a: string }[];
  services: ServiceRef[];
  guides: PostRef[];
}): string {
  const { doc } = opts;
  const url = serviceUrl(doc.slug);
  const rel = serviceRelations[doc.slug] ?? { guides: [] };
  const bySlug = new Map(opts.services.map((s) => [s.slug, s]));
  const relatedServices = (rel.related ?? []).map((s) => bySlug.get(s)).filter(Boolean) as ServiceRef[];
  const similarServices = (rel.similar ?? []).map((s) => bySlug.get(s)).filter(Boolean) as ServiceRef[];
  const bodyLinks = linksIn(doc.sections.map((s) => s.html).join(""), `/services/${doc.slug}`);

  const deliverables = deliverablesOf(doc);
  const process = processOf(doc);
  const faq = faqNode(url, opts.faqs);

  const service: Node = {
    "@type": "Service",
    "@id": `${url}#service`,
    name: doc.cardTitle,
    alternateName: doc.h1.split(":")[0] !== doc.cardTitle ? doc.h1.split(":")[0] : undefined,
    serviceType: doc.cardTitle,
    description: doc.standfirst || doc.description,
    url,
    mainEntityOfPage: { "@id": `${url}#webpage` },
    provider: { "@id": serviceProvider(doc.slug) },
    areaServed,
    about: { "@id": ID.entity },
    ...(deliverables
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            "@id": `${url}#catalog`,
            name: `${doc.cardTitle} deliverables`,
            itemListElement: deliverables.items.map((d, i) => ({
              "@type": "Offer",
              "@id": `${url}#deliverable-${i + 1}`,
              name: d.name,
              description: d.description,
              itemOffered: { "@type": "Service", name: d.name },
              offeredBy: { "@id": serviceProvider(doc.slug) },
            })),
          },
        }
      : {}),
    ...(relatedServices.length ? { isRelatedTo: relatedServices.map((s) => ({ "@id": `${serviceUrl(s.slug)}#service` })) } : {}),
    ...(similarServices.length ? { isSimilarTo: similarServices.map((s) => ({ "@id": `${serviceUrl(s.slug)}#service` })) } : {}),
  };

  const howTo: Node | null = process
    ? {
        "@type": "HowTo",
        "@id": `${url}#process`,
        name: process.heading.replace(/\?$/, ""),
        about: { "@id": `${url}#service` },
        step: process.steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.name, text: s.text })),
      }
    : null;

  const page: Node = {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: opts.title,
    description: doc.description,
    inLanguage: "en",
    isPartOf: { "@id": ID.website },
    about: { "@id": `${url}#service` },
    mainEntity: { "@id": `${url}#service` },
    breadcrumb: { "@id": `${url}#breadcrumb` },
    significantLink: dedupe([...bodyLinks.significantLink, ...[...relatedServices, ...similarServices].map((s) => serviceUrl(s.slug))]),
    relatedLink: dedupe([...bodyLinks.relatedLink, ...opts.guides.map((g) => postUrl(g.slug))]),
    hasPart: [howTo ? { "@id": `${url}#process` } : null, faq ? { "@id": `${url}#faq` } : null].filter(Boolean),
  };

  return serialize([
    page,
    service,
    howTo,
    faq,
    breadcrumbNode(url, [
      { name: "Home", url: `${SITE}/` },
      { name: "Services", url: ID.services },
      { name: doc.cardTitle, url },
    ]),
    ...[...relatedServices, ...similarServices].map(serviceStub),
    ...identityNodes(),
  ]);
}

/* ---------- articles ---------- */

export type ArticleLike = {
  slug: string;
  title: string;
  seoTitle: string | null;
  seoDescription: string | null;
  excerpt: string | null;
  content: string;
  schemaType: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  featuredImage: string | null;
  tags: string[];
  focusKeyword?: string | null;
  category: { name: string } | null;
  postAuthor: { name: string; slug: string; title: string | null } | null;
};

const isOwner = (a: ArticleLike["postAuthor"]) => !a || a.name.trim().toLowerCase() === "usman ishaq";

export function articleGraph(post: ArticleLike): string {
  const url = postUrl(post.slug);
  const links = linksIn(post.content, `/blog/${post.slug}`);
  const image = post.featuredImage ? (post.featuredImage.startsWith("http") ? post.featuredImage : `${SITE}${post.featuredImage}`) : undefined;
  const words = strip(post.content).split(" ").filter(Boolean).length;
  const authorNode: Node | null = isOwner(post.postAuthor)
    ? null
    : {
        "@type": "Person",
        "@id": `${SITE}/blog#author-${post.postAuthor!.slug}`,
        name: post.postAuthor!.name,
        ...(post.postAuthor!.title ? { jobTitle: post.postAuthor!.title } : {}),
      };

  const article: Node = {
    "@type": post.schemaType === "BlogPosting" || !post.schemaType ? "BlogPosting" : post.schemaType,
    "@id": `${url}#article`,
    headline: post.title,
    alternativeHeadline: post.seoTitle && post.seoTitle !== post.title ? post.seoTitle : undefined,
    description: post.seoDescription || post.excerpt || undefined,
    url,
    mainEntityOfPage: { "@id": `${url}#webpage` },
    isPartOf: { "@id": ID.blog },
    datePublished: (post.publishedAt ?? post.createdAt).toISOString(),
    dateModified: post.updatedAt.toISOString(),
    image: image ? [image] : undefined,
    author: { "@id": authorNode ? (authorNode["@id"] as string) : ID.person },
    publisher: { "@id": ID.person },
    inLanguage: "en",
    wordCount: words || undefined,
    articleSection: post.category?.name ?? undefined,
    keywords: post.tags.length ? post.tags.join(", ") : undefined,
    about: post.focusKeyword ? { "@type": "Thing", name: post.focusKeyword } : undefined,
  };

  const page: Node = {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || undefined,
    inLanguage: "en",
    isPartOf: { "@id": ID.website },
    mainEntity: { "@id": `${url}#article` },
    breadcrumb: { "@id": `${url}#breadcrumb` },
    primaryImageOfPage: image ? { "@type": "ImageObject", url: image } : undefined,
    significantLink: links.significantLink.length ? links.significantLink : undefined,
    relatedLink: links.relatedLink.length ? links.relatedLink : undefined,
  };

  return serialize([
    page,
    article,
    breadcrumbNode(url, [
      { name: "Home", url: `${SITE}/` },
      { name: "Blogs", url: `${SITE}/blog` },
      { name: post.title, url },
    ]),
    { "@type": "Blog", "@id": ID.blog, name: "Usman Ishaq blog", url: `${SITE}/blog`, publisher: { "@id": ID.person } },
    authorNode,
    ...identityNodes(),
  ]);
}

/* ---------- blog index ---------- */

export function blogIndexGraph(opts: {
  title: string;
  description: string;
  posts: { slug: string; title: string; publishedAt: Date | null; createdAt: Date }[];
}): string {
  const url = `${SITE}/blog`;
  return serialize([
    {
      "@type": "CollectionPage",
      "@id": `${url}#webpage`,
      url,
      name: opts.title,
      description: opts.description,
      inLanguage: "en",
      isPartOf: { "@id": ID.website },
      about: { "@id": ID.entity },
      mainEntity: { "@id": ID.blog },
      breadcrumb: { "@id": `${url}#breadcrumb` },
      relatedLink: opts.posts.map((p) => postUrl(p.slug)),
    },
    {
      "@type": "Blog",
      "@id": ID.blog,
      name: "Usman Ishaq blog",
      url,
      inLanguage: "en",
      about: { "@id": ID.entity },
      author: { "@id": ID.person },
      publisher: { "@id": ID.person },
      blogPost: opts.posts.map((p) => ({
        "@type": "BlogPosting",
        "@id": `${postUrl(p.slug)}#article`,
        headline: p.title,
        url: postUrl(p.slug),
        datePublished: (p.publishedAt ?? p.createdAt).toISOString(),
      })),
    },
    breadcrumbNode(url, [
      { name: "Home", url: `${SITE}/` },
      { name: "Blogs", url },
    ]),
    ...identityNodes(),
  ]);
}

function dedupe(list: string[]): string[] {
  return [...new Set(list)];
}
