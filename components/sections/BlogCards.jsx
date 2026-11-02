// The original homepage blog cards. Shown until the first post is published
// from the dashboard; after that components/LatestPosts.tsx renders the real
// posts in this same markup.
export default function BlogCards() {
  return (
    <>
      <div className="bfilters rv" id="bfilters">
        <button className="bfilter on" data-f="all">{"All"}</button>
        <button className="bfilter" data-f="seo">{"Semantic SEO"}</button>
        <button className="bfilter" data-f="content">{"Content"}</button>
        <button className="bfilter" data-f="ai">{"AI search"}</button>
        <button className="bfilter" data-f="convert">{"Conversion"}</button>
      </div>
      <a className="bfeat rv" href="https://usmanishaq.com/semantic-seo/semantic-seo-strategy-for-service-businesses/" data-c="seo">
        <div className="art in" data-seed="1">
          <span className="lab">{"FEATURED · SERVICE BUSINESSES"}</span>
        </div>
        <div className="body">
          <span className="cat">{"Featured article"}</span>
          <h3>{"A Semantic SEO Strategy for Service Businesses"}</h3>
          <p>{"How a plumber, roofer or dock builder turns services, towns and customer questions into a site Google understands. The same method this page describes, written out in full."}</p>
          <span className="readm">{"Read the article "}<span className="arrow">{"→"}</span></span>
        </div>
      </a>
      <div className="bgrid" id="bgrid">
        <Card c="seo" seed="3" lab="SEMANTIC SEO" cat="Semantic SEO" href="https://usmanishaq.com/semantic-seo/semantic-seo-vs-traditional-seo/" title="Semantic SEO vs Traditional SEO" text="Why a keyword list and an entity map produce two different websites, and which one Google reads better." />
        <Card c="seo" seed="4" lab="SEMANTIC SEO" cat="Semantic SEO" href="https://usmanishaq.com/semantic-seo/what-is-semantic-content/" title="What Is Semantic Content?" text="Content written around entities, attributes and how they connect, not around a keyword repeated ten times." d="d1" />
        <Card c="seo" seed="5" lab="SEMANTIC SEO" cat="Semantic SEO" href="https://usmanishaq.com/semantic-seo/semantic-seo-keywords-to-knowledge/" title="From Keywords to Knowledge" text="How search moved from matching words to understanding things, and what that changes for your pages." d="d2" />
        <Card c="content" seed="6" lab="CONTENT NETWORKS" cat="Content networks" href="https://usmanishaq.com/semantic-seo/seo-content-network/" title="The SEO Content Network" text="How pages link into one network so each new article lifts the ones around it." />
        <Card c="content" seed="7" lab="CONTENT NETWORKS" cat="Content networks" href="https://usmanishaq.com/semantic-seo/semantic-content-network-strategy-guide/" title="Semantic Content Network Strategy Guide" text="Planning a content network from the topical map down to the anchor text." d="d1" />
        <Card c="content" seed="8" lab="CONTENT WRITING" cat="Content writing" href="https://usmanishaq.com/content-writing/query-deserves-page-content-structure/" title="When a Query Deserves Its Own Page" text="How to decide if a search gets a new page or a section on an existing one." d="d2" />
        <Card c="convert" seed="9" lab="CONVERSION" cat="Conversion" href="https://usmanishaq.com/semantic-seo/semantic-copywriting-for-conversions/" title="Semantic Copywriting for Conversions" text="Writing pages that rank and still get the visitor to call, book or buy." />
        <Card c="ai" seed="10" lab="AI SEARCH" cat="AI search" href="https://usmanishaq.com/semantic-seo/geo-stack-vs-semantic-seo/" title="The GEO Stack vs Semantic SEO" text="What generative engine optimisation adds, and what it is only renaming." d="d1" />
        <Card c="content" seed="11" lab="CONTENT NETWORKS" cat="Content networks" href="https://usmanishaq.com/content-writing/semantic-content-networks-ben-stace/" title="Ben Stace on Semantic Content Networks" text="Notes on another practitioner's approach to building content networks." d="d2" />
      </div>
    </>
  );
}

function Card({ c, seed, lab, cat, href, title, text, d }) {
  return (
    <a className={`post rv${d ? ` ${d}` : ""}`} data-c={c} href={href}>
      <div className="art" data-seed={seed}>
        <span className="lab">{lab}</span>
      </div>
      <div className="body">
        <span className="cat">{cat}</span>
        <h4>{title}</h4>
        <p>{text}</p>
        <span className="readm">{"Read the article "}<span className="arrow">{"→"}</span></span>
      </div>
    </a>
  );
}
