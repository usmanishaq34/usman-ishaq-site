// Builds public/images/usman-ishaq-og.png, the 1200x630 preview image used
// when a page of the site is shared on WhatsApp, LinkedIn, X or Slack.
// Those crawlers need a PNG or JPG; the site's WebP files are skipped.
// The top-left lockup copies the site header: the logo on an orange tile,
// the name and the "Semantic SEO Strategist" line.
// Run from the site root: node scripts/make-og-image.mjs
import sharp from "sharp";

const W = 1200, H = 630;
const TILE = 118, TILE_X = 80, TILE_Y = 84;

const portrait = await sharp("public/images/usman-ishaq-portrait.webp").resize({ height: 560 }).png().toBuffer();
const pm = await sharp(portrait).metadata();

// Header mark: the logo cover-fitted on the orange gradient tile, rounded like .brand-mark
const tileBg = Buffer.from(`<svg width="${TILE}" height="${TILE}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#db4c23"/><stop offset="1" stop-color="#8f2a0f"/></linearGradient></defs>
  <rect width="${TILE}" height="${TILE}" rx="34" fill="url(#t)"/></svg>`);
const logo = await sharp("public/images/usman-ishaq-logo.webp").resize(TILE, TILE, { fit: "cover" }).png().toBuffer();
const tileMask = Buffer.from(`<svg width="${TILE}" height="${TILE}"><rect width="${TILE}" height="${TILE}" rx="34" fill="#fff"/></svg>`);
const mark = await sharp(tileBg).composite([{ input: logo }, { input: tileMask, blend: "dest-in" }]).png().toBuffer();

const bg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="82%" cy="50%" r="55%">
      <stop offset="0" stop-color="#db4c23" stop-opacity=".55"/>
      <stop offset="1" stop-color="#0e1a36" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#0e1a36"/>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect x="${W - pm.width - 60}" y="70" width="${pm.width}" height="${H - 70}" rx="28" fill="#db4c23"/>
  <g font-family="Georgia, 'Times New Roman', serif" fill="#ffffff">
    <text x="${TILE_X + TILE + 26}" y="${TILE_Y + 56}" font-size="50" font-weight="600">Usman Ishaq</text>
    <text x="80" y="320" font-size="52" font-weight="700">Semantic SEO</text>
    <text x="80" y="384" font-size="52" font-weight="700">Strategist &amp; Topical</text>
    <text x="80" y="448" font-size="52" font-weight="700">Content Consultant</text>
  </g>
  <g font-family="'Courier New', monospace">
    <text x="${TILE_X + TILE + 28}" y="${TILE_Y + 92}" font-size="19" fill="#9aa6c0" letter-spacing="3">SEMANTIC SEO STRATEGIST</text>
    <text x="80" y="556" font-size="22" fill="#ff6a3d" letter-spacing="3">USMANISHAQ.COM</text>
  </g>
</svg>`;

const pMask = Buffer.from(`<svg width="${pm.width}" height="${pm.height}"><rect width="${pm.width}" height="${pm.height}" rx="28" fill="#fff"/></svg>`);
const rounded = await sharp(portrait).composite([{ input: pMask, blend: "dest-in" }]).png().toBuffer();

await sharp(Buffer.from(bg))
  .composite([
    { input: mark, left: TILE_X, top: TILE_Y },
    { input: rounded, left: W - pm.width - 60, top: H - pm.height },
  ])
  .png({ compressionLevel: 9 })
  .toFile("public/images/usman-ishaq-og.png");
const { size } = await import("node:fs").then((fs) => fs.statSync("public/images/usman-ishaq-og.png"));
console.log(`wrote usman-ishaq-og.png ${W}x${H}, ${Math.round(size / 1024)} KB`);
