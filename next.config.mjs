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
};

export default nextConfig;
