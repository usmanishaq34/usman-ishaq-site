import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://usmanishaq.com"),
  title: "Usman Ishaq | Semantic SEO Strategist for Trade and Service Businesses",
  description:
    "Usman Ishaq is a semantic SEO strategist and founder of Digital Vikingz. Topical maps, semantic content, schema and websites built as systems for businesses in the USA, UK, Canada, Australia, UAE and Germany.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Usman Ishaq | Semantic SEO Strategist",
    description: "Websites Google understands, so the phone rings. Topical maps, semantic content, schema and site architecture.",
    url: "https://usmanishaq.com/",
    type: "website",
    images: ["/images/usman-ishaq-portrait.webp"],
  },
};

export default function RootLayout({ children }) {
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
