import type { Metadata } from "next";
import { OG_IMAGE } from "@/lib/og-image";

// Root shell shared by the public site and the dashboard: fonts only. The
// public site's stylesheet is loaded by app/(site)/layout.tsx, the
// dashboard's by app/usman-1000-admin/layout.tsx, so the two never mix.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://usmanishaq.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Usman Ishaq | Semantic SEO Strategist for Trade and Service Businesses",
  description:
    "Usman Ishaq is a semantic SEO strategist and founder of Digital Vikingz. Topical maps, semantic content, schema and websites built as systems for businesses in the USA, UK, Canada, Australia, UAE and Germany.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Usman Ishaq | Semantic SEO Strategist",
    description: "Semantic SEO strategist and topical content consultant. Topical maps, structured content briefs and semantic site architecture that rank in Google and get cited by AI.",
    url: `${siteUrl}/`,
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image", images: [OG_IMAGE] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
