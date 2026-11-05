// Builds public/images/usman-ishaq-og.png, the 1200x630 preview image shown
// when a page of the site is shared on WhatsApp, LinkedIn, X or Slack.
// The card is the site header's lockup (the full logo illustration, the name
// and "Semantic SEO Strategist") rendered with the site's own fonts, Fraunces and JetBrains
// Mono, fetched from Google Fonts at run time. Rendered by the image engine
// Next ships for Open Graph images. Run from the site root:
//   node scripts/make-og-image.mjs
import fs from "node:fs";
import sharp from "sharp";
import { ImageResponse } from "next/dist/compiled/@vercel/og/index.node.js";

const W = 1200, H = 630, S = 4; // S: header lockup scale (header tile is 42px)

async function font(family) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}`, { headers: { "User-Agent": "Mozilla/4.0" } })).text();
  const url = css.match(/url\(([^)]+\.ttf)\)/)?.[1];
  if (!url) throw new Error(`No TTF for ${family}`);
  return (await fetch(url)).arrayBuffer();
}
const [fraunces, mono] = await Promise.all([font("Fraunces:wght@600"), font("JetBrains+Mono:wght@400")]);
const LOGO_H = 52 * S, LOGO_W = Math.round(LOGO_H * 160 / 179); // the whole illustration, nothing cropped
const logo = `data:image/png;base64,${(await sharp("public/images/usman-ishaq-logo.webp").png().toBuffer()).toString("base64")}`;

const h = (type, props, ...children) => ({ type, props: { ...props, children: children.length === 1 ? children[0] : children } });
const tree = h("div", { style: { width: W, height: H, display: "flex", alignItems: "center", justifyContent: "center", background: "#0e1a36" } },
  h("div", { style: { display: "flex", alignItems: "center", gap: 12 * S } },
    h("img", { src: logo, width: LOGO_W, height: LOGO_H, style: { width: LOGO_W, height: LOGO_H } }),
    h("div", { style: { display: "flex", flexDirection: "column" } },
      h("div", { style: { fontFamily: "Fraunces", fontSize: 21 * S, fontWeight: 600, lineHeight: 1, color: "#e9edf6" } }, "Usman Ishaq"),
      h("div", { style: { fontFamily: "JetBrains Mono", fontSize: 10.5 * S, letterSpacing: 10.5 * S * 0.12, textTransform: "uppercase", color: "#9aa6c0", marginTop: 5 * S } }, "SEMANTIC SEO STRATEGIST"),
    ),
  ),
);

const res = new ImageResponse(tree, {
  width: W, height: H,
  fonts: [
    { name: "Fraunces", data: fraunces, weight: 600, style: "normal" },
    { name: "JetBrains Mono", data: mono, weight: 400, style: "normal" },
  ],
});
fs.writeFileSync("public/images/usman-ishaq-og.png", Buffer.from(await res.arrayBuffer()));
const m = await sharp("public/images/usman-ishaq-og.png").metadata();
console.log(`wrote usman-ishaq-og.png ${m.width}x${m.height}, ${Math.round(fs.statSync("public/images/usman-ishaq-og.png").size / 1024)} KB`);
