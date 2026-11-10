// Section: Hero
export default function Hero() {
  return (
    <section className="hero">
      {" "}
      <div className="grid-bg"></div>
      {" "}
      <div className="wrap hero-grid">
        {" "}
        <div>
          {" "}
          <span className="eyebrow rv">
            {"Usman Ishaq · Rank in Google. Get cited by AI."}
          </span>
          {" "}
          <h1 className="rv d1">
            {"Semantic SEO Strategist and Consultant"}
          </h1>
          {" "}
          <p className="lead rv d2">
            {"Websites underperform when search engines fail to read their meaning. I fix that with topical maps, structured content briefs and semantic site architecture built around entities and search intent. The result is content that ranks in Google, gets cited in ChatGPT, Claude and AI Overviews, and converts the visitors who arrive."}
          </p>
          {" "}
          <div className="hero-ctas rv d3">
            {" "}
            <a className="btn btn-primary" href="https://calendly.com/usmanishaqsemanticseospecialist/digital-vikingz" target="_blank" rel="noopener">
              {"Book a 30-minute call "}
              <span className="arrow">
                {"→"}
              </span>
            </a>
            {" "}
            <a className="btn btn-ghost" href="#work">
              {"See the work"}
            </a>
            {" "}
          </div>
          {" "}
          <div className="hero-meta rv d3">
            {" "}
            <div>
              <span className="dot-live"></span>
              {"Taking new projects"}
            </div>
            {" "}
            <div>
              {"Founder of "}
              <a href="https://digitalvikingz.com/" target="_blank" rel="noopener">
                <b>
                  {"Digital Vikingz"}
                </b>
              </a>
            </div>
            {" "}
            <div>
              {"Koray Tuğberk Gübür framework"}
            </div>
            {" "}
          </div>
          {" "}
        </div>
        {" "}
        <div className="rv d2">
          {" "}
          <div className="portrait-wrap">
            {" "}
            <div className="orbit"></div>
            {" "}
            <div className="portrait">
              {" "}
              {" "}
              <img src="/images/usman-ishaq-portrait.webp" alt="Usman Ishaq, semantic SEO strategist and consultant" />
              {" "}
            </div>
            {" "}
            <div className="float-card fc1">
              <b>
                {"Central entity"}
              </b>
              {"Plumbing company"}
              <div className="chip-row">
                <i></i>
                <i></i>
                <i></i>
              </div>
            </div>
            {" "}
            <div className="float-card fc2">
              <b>
                {"Search Console"}
              </b>
              {"672K clicks · 16 months"}
            </div>
            {" "}
            <div className="float-card fc3">
              <b>
                {"Schema graph"}
              </b>
              {"LocalBusiness → Service → areaServed"}
            </div>
            {" "}
          </div>
          {" "}
        </div>
        {" "}
      </div>
      {" "}
    </section>
  );
}
