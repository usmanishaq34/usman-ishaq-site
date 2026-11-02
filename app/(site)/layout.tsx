import "./globals.css";

// Public site: every page under app/(site) loads the site's stylesheet.
// The dashboard (app/usman-1000-admin) is outside this group and never does.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
