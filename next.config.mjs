/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  // Images uploaded through the dashboard live in Supabase Storage.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "usmanishaq.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  async headers() {
    // The dashboard's visual editor shows the homepage inside an iframe on the
    // same origin, so framing is allowed from this site only.
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  async redirects() {
    // The previous WordPress site's addresses. Every post keeps its slug, so
    // the old category folders map straight onto /blog/<slug>. Next.js strips
    // a trailing slash before matching, so each pattern is written without one.
    return [
      { source: "/insights", destination: "/blog", permanent: true },
      { source: "/semantic-seo", destination: "/blog", permanent: true },
      { source: "/content-writing", destination: "/blog", permanent: true },
      { source: "/social-media-marketing", destination: "/blog", permanent: true },
      { source: "/semantic-seo/:slug", destination: "/blog/:slug", permanent: true },
      { source: "/content-writing/:slug", destination: "/blog/:slug", permanent: true },
      { source: "/social-media-marketing/:slug", destination: "/blog/:slug", permanent: true },
      { source: "/category/:path*", destination: "/blog", permanent: true },
      { source: "/feed", destination: "/blog", permanent: true },
      { source: "/wp-admin/:path*", destination: "/usman-1000-admin", permanent: false },
    ];
  },
};

export default nextConfig;
