import SiteHeader from "../components/sections/SiteHeader";
import Hero from "../components/sections/Hero";
import Logos from "../components/sections/Logos";
import Stats from "../components/sections/Stats";
import Results from "../components/sections/Results";
import TownsProblem from "../components/sections/TownsProblem";
import Method from "../components/sections/Method";
import LiveBuild from "../components/sections/LiveBuild";
import GoogleReads from "../components/sections/GoogleReads";
import TopicalMapLab from "../components/sections/TopicalMapLab";
import Services from "../components/sections/Services";
import WebsiteDesign from "../components/sections/WebsiteDesign";
import Industries from "../components/sections/Industries";
import Portfolio from "../components/sections/Portfolio";
import Process from "../components/sections/Process";
import About from "../components/sections/About";
import Activities from "../components/sections/Activities";
import Fit from "../components/sections/Fit";
import Blog from "../components/sections/Blog";
import Faq from "../components/sections/Faq";
import Contact from "../components/sections/Contact";
import SiteFooter from "../components/sections/SiteFooter";
import Overlays from "../components/sections/Overlays";
import Interactions from "../components/Interactions";
import { siteGraph, faqPage } from "../lib/schema";

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteGraph) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }} />
      <SiteHeader />
      <main>
        <Hero />
        <Logos />
        <Stats />
        <Results />
        <TownsProblem />
        <Method />
        <LiveBuild />
        <GoogleReads />
        <TopicalMapLab />
        <Services />
        <WebsiteDesign />
        <Industries />
        <Portfolio />
        <Process />
        <About />
        <Activities />
        <Fit />
        <Blog />
        <Faq />
        <Contact />
      </main>
      <SiteFooter />
      <Overlays />
      <Interactions />
    </>
  );
}
