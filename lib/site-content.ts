import type { Metadata } from "next";
import { prisma } from "./db";
import { pageDefaultLoaders } from "@/content/pages";
import { OG_IMAGE } from "@/lib/og-image";

// Dashboard-editable content for the new site's pages.
//
//   defaults  content/pages/<page>.json, shipped with the code
//   override  SiteContent row (key = page path), written by the dashboard
//
// The override stores only what the dashboard changed: SEO fields field by
// field, and the full block list once any block was edited. If the table does
// not exist yet or the database is unreachable, the defaults render unchanged.

export type PageSeo = {
  title: string;
  description: string;
  ogImage: string;
  noindex: boolean;
  canonical: string;
};

export type PageBlock = { id: string; label: string; html: string; hidden?: boolean };

export type PageDoc = { path: string; seo: PageSeo; ld: string; blocks: PageBlock[] };

export type PageOverride = { seo?: Partial<PageSeo>; blocks?: PageBlock[] };

const EMPTY_SEO: PageSeo = { title: "", description: "", ogImage: "", noindex: false, canonical: "" };

export function isEditablePage(path: string): boolean {
  return path in pageDefaultLoaders;
}

export async function getPageDefaults(path: string): Promise<PageDoc | null> {
  const load = pageDefaultLoaders[path];
  if (!load) return null;
  const mod = await load();
  return mod.default as PageDoc;
}

export async function getOverride(path: string): Promise<PageOverride | null> {
  try {
    const row = await prisma.siteContent.findUnique({ where: { key: path } });
    return (row?.data as PageOverride | undefined) ?? null;
  } catch {
    return null;
  }
}

/** Defaults with the dashboard override applied. */
export async function getPageContent(path: string): Promise<PageDoc | null> {
  const defaults = await getPageDefaults(path);
  if (!defaults) return null;
  const o = await getOverride(path);
  return {
    ...defaults,
    seo: { ...EMPTY_SEO, ...defaults.seo, ...(o?.seo ?? {}) },
    blocks: o?.blocks && o.blocks.length > 0 ? o.blocks : defaults.blocks,
  };
}

/** Metadata for a fully editable page. */
export async function editablePageMetadata(path: string): Promise<Metadata> {
  const doc = await getPageContent(path);
  if (!doc) return {};
  const { seo } = doc;
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonical || path },
    robots: seo.noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: path,
      images: [seo.ogImage || OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title: seo.title, description: seo.description, images: [seo.ogImage || OG_IMAGE] },
  };
}

/**
 * Metadata for pages whose body still comes from code (homepage, about, team,
 * situation pages ...): the dashboard can override their SEO fields.
 */
export async function withSeoOverride(base: Metadata, path: string): Promise<Metadata> {
  const o = await getOverride(path);
  const s = o?.seo;
  if (!s) return base;
  const title = s.title || (base.title as string | undefined);
  const description = s.description || base.description || undefined;
  const og = (base.openGraph ?? {}) as NonNullable<Metadata["openGraph"]>;
  const tw = (base.twitter ?? {}) as NonNullable<Metadata["twitter"]>;
  return {
    ...base,
    title,
    description,
    alternates: { ...(base.alternates ?? {}), canonical: s.canonical || base.alternates?.canonical || path },
    robots: s.noindex ? { index: false, follow: true } : (base.robots ?? { index: true, follow: true }),
    openGraph: { ...og, title: title ?? undefined, description, ...(s.ogImage ? { images: [s.ogImage] } : {}) },
    twitter: { ...tw, title: title ?? undefined, description, ...(s.ogImage ? { images: [s.ogImage] } : {}) } as Metadata["twitter"],
  };
}
