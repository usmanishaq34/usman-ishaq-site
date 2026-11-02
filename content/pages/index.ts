// Editable page defaults (content/pages/*.json). The homepage ships its
// default sections with the code (generated from components/sections by
// `npm run content:export`); dashboard edits are stored in the SiteContent
// table and layered on top (lib/site-content.ts).

export const pageDefaultLoaders: Record<string, () => Promise<{ default: unknown }>> = {
  "/": () => import("./core--home.json"),
};

/** Pages rendered by EditableSections (they contain interactive islands). */
export const sectionPages = new Set<string>(["/"]);
