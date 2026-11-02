import LatestPosts from "@/components/LatestPosts";

// The interactive parts of the dashboard-editable homepage. Page content
// stores <div data-dv-island="name"></div>; the matching component below is
// rendered in its place, server-side, with live data.

export type IslandAttrs = { heading?: string; intro?: string };

export const islandNames = ["latest-posts"] as const;

export async function renderIsland(name: string, _a: IslandAttrs): Promise<React.ReactNode> {
  switch (name) {
    case "latest-posts":
      return <LatestPosts />;
    default:
      return null;
  }
}
