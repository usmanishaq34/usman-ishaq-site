/**
 * Writes content/pages/core--home.json: the homepage's default sections,
 * rendered from components/sections/*.jsx. Run after changing a section
 * component so the dashboard's "original content" matches the code:
 *   npm run content:export
 */
import fs from "node:fs"
import path from "node:path"
import { renderToStaticMarkup } from "react-dom/server"
import Hero from "../components/sections/Hero"
import Logos from "../components/sections/Logos"
import Stats from "../components/sections/Stats"
import Results from "../components/sections/Results"
import TownsProblem from "../components/sections/TownsProblem"
import Method from "../components/sections/Method"
import LiveBuild from "../components/sections/LiveBuild"
import GoogleReads from "../components/sections/GoogleReads"
import TopicalMapLab from "../components/sections/TopicalMapLab"
import Services from "../components/sections/Services"
import WebsiteDesign from "../components/sections/WebsiteDesign"
import Industries from "../components/sections/Industries"
import Portfolio from "../components/sections/Portfolio"
import Process from "../components/sections/Process"
import About from "../components/sections/About"
import Activities from "../components/sections/Activities"
import Fit from "../components/sections/Fit"
import Blog from "../components/sections/Blog"
import Faq from "../components/sections/Faq"
import Contact from "../components/sections/Contact"
import { siteGraph, faqPage } from "../lib/schema"
import { route } from "../lib/routes"

const sections: [string, string, () => React.ReactElement][] = [
  ["hero", "Hero", Hero],
  ["logos", "Logo strip", Logos],
  ["stats", "Numbers", Stats],
  ["results", "Search Console results", Results],
  ["problem", "The sixteen towns problem", TownsProblem],
  ["method", "Method", Method],
  ["build", "Live build", LiveBuild],
  ["google", "What Google reads", GoogleReads],
  ["lab", "Topical map lab", TopicalMapLab],
  ["services", "Services", Services],
  ["websites", "Website design", WebsiteDesign],
  ["industries", "Industries and markets", Industries],
  ["work", "Portfolio", Portfolio],
  ["process", "Process", Process],
  ["about", "About", About],
  ["activities", "Activities", Activities],
  ["fit", "Who this is for", Fit],
  ["blog", "Blog", Blog],
  ["faq", "FAQ", Faq],
  ["contact", "Contact", Contact],
]

const home = route("/")
const { "@context": _ctx, ...faq } = faqPage as Record<string, unknown>
const ld = JSON.stringify({ "@context": "https://schema.org", "@graph": [...(siteGraph as { "@graph": unknown[] })["@graph"], faq] })

const doc = {
  path: "/",
  seo: { title: home.title, description: home.description, ogImage: "/images/usman-ishaq-portrait.webp", noindex: false, canonical: "" },
  ld,
  blocks: sections.map(([id, label, C]) => ({ id, label, html: renderToStaticMarkup(<C />) })),
}

const out = path.join(process.cwd(), "content", "pages", "core--home.json")
fs.writeFileSync(out, JSON.stringify(doc, null, 1) + "\n")
console.log(`Wrote ${out}: ${doc.blocks.length} sections, ${Math.round(fs.statSync(out).size / 1024)} KB`)
