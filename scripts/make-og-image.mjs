// Builds public/images/usman-ishaq-og.png, the 1200x630 preview image used
// when a page of the site is shared on WhatsApp, LinkedIn, X or Slack.
// Those crawlers need a PNG or JPG; the site's WebP files are skipped.
// Run from the site root: node scripts/make-og-image.mjs
import sharp from "sharp";

const W = 1200, H = 630;
const portrait = await sharp("public/images/usman-ishaq-portrait.webp").resize({ height: 560 }).png().toBuffer();
const pm = await sharp(portrait).metadata();
const logo = await sharp("public/images/usman-ishaq-logo.webp").resize({ height: 92 }).png().toBuffer();

const bg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="82%" cy="50%" r="55%">
      <stop offset="0" stop-color="#db4c23" stop-opacity=".55"/>
      <stop offset="1" stop-color="#0e1a36" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="c"><rect x="${W - pm.width - 60}" y="${H - pm.height}" width="${pm.width}" height="${pm.height}" rx="28"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="#0e1a36"/>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect x="${W - pm.width - 60}" y="70" width="${pm.width}" height="${H - 70}" rx="28" fill="#db4c23"/>
  <g font-family="Georgia, 'Times New Roman', serif" fill="#ffffff">
    <text x="80" y="300" font-size="78" font-weight="700">Usman Ishaq</text>
  </g>
  <g font-family="Arial, Helvetica, sans-serif">
    <text x="80" y="362" font-size="31" fill="#e9edf6">Semantic SEO Strategist &amp;</text>
    <text x="80" y="404" font-size="31" fill="#e9edf6">Topical Content Consultant</text>
    <text x="80" y="520" font-size="24" fill="#ff6a3d" letter-spacing="3">USMANISHAQ.COM</text>
  </g>
</svg>`;

// Rounded corners on the portrait
const mask = Buffer.from(`<svg width="${pm.width}" height="${pm.height}"><rect width="${pm.width}" height="${pm.height}" rx="28" fill="#fff"/></svg>`);
const rounded = await sharp(portrait).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();

await sharp(Buffer.from(bg))
  .composite([
    { input: logo, left: 80, top: 110 },
    { input: rounded, left: W - pm.width - 60, top: H - pm.height },
  ])
  .png({ compressionLevel: 9 })
  .toFile("public/images/usman-ishaq-og.png");
const out = await sharp("public/images/usman-ishaq-og.png").metadata();
console.log(`wrote usman-ishaq-og.png ${out.width}x${out.height}, ${Math.round(out.size / 1024)} KB`);
