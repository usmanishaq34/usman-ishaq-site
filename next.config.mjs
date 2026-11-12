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
      // Posts that existed on the old site but were not carried over, sent to
      // the closest guide on the same subject. Listed before the folder rules
      // so the folder rule does not send them to a missing post.
      { source: "/what-is-semantic-seo", destination: "/blog/semantic-seo-keywords-to-knowledge", permanent: true },
      { source: "/semantic-seo/what-is-semantic-seo", destination: "/blog/semantic-seo-keywords-to-knowledge", permanent: true },
      { source: "/blog/what-is-semantic-seo", destination: "/blog/semantic-seo-keywords-to-knowledge", permanent: true },
      { source: "/google-update-ranking-recovery", destination: "/blog/google-march-2025-core-update-guide", permanent: true },
      // Post slugs linked from the site root, as some older posts did.
      {
        source: "/:slug(geo-stack-vs-semantic-seo|query-deserves-page-content-structure|semantic-content-network-strategy-guide|semantic-copywriting-for-conversions|semantic-seo-strategy-for-service-businesses)",
        destination: "/blog/:slug",
        permanent: true,
      },
      { source: "/insights", destination: "/blog", permanent: true },
      { source: "/semantic-seo", destination: "/blog", permanent: true },
      { source: "/content-writing", destination: "/blog", permanent: true },
      { source: "/social-media-marketing", destination: "/blog", permanent: true },
      { source: "/copywriting", destination: "/blog", permanent: true },
      { source: "/google-update", destination: "/blog", permanent: true },
      // Old portfolio items. Search Console lists thirteen of them as 404. The new
      // site has no portfolio section, so every one goes to the homepage.
      {
        source: "/portfolio/:slug*",
        destination: "/",
        permanent: true,
      },
      // The old WordPress front page address.
      { source: "/home", destination: "/", permanent: true },
      { source: "/semantic-seo/:slug", destination: "/blog/:slug", permanent: true },
      { source: "/content-writing/:slug", destination: "/blog/:slug", permanent: true },
      { source: "/social-media-marketing/:slug", destination: "/blog/:slug", permanent: true },
      // Malformed links from the old site: a date, a feed or a second URL glued
      // onto a post address (Search Console lists ten as 404). The post slug is
      // the first segment, so the rest is dropped.
      { source: "/blog/:slug/:rest+", destination: "/blog/:slug", permanent: true },
      { source: "/semantic-seo/:slug/:rest+", destination: "/blog/:slug", permanent: true },
      { source: "/content-writing/:slug/:rest+", destination: "/blog/:slug", permanent: true },
      { source: "/social-media-marketing/:slug/:rest+", destination: "/blog/:slug", permanent: true },
      { source: "/google-update/:path+", destination: "/blog", permanent: true },
      { source: "/copywriting/:path+", destination: "/blog", permanent: true },
      { source: "/category/:path*", destination: "/blog", permanent: true },
      { source: "/feed", destination: "/blog", permanent: true },
      { source: "/wp-admin/:path*", destination: "/usman-1000-admin", permanent: false },
    ];
  },
};

export default nextConfig;
