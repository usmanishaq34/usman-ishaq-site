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
            {"Usman Ishaq · Semantic SEO Strategist"}
          </span>
          {" "}
          <h1 className="rv d1">
            {"I build websites Google "}
            <em>
              {"understands"}
            </em>
            {", so the phone rings."}
          </h1>
          {" "}
          <p className="lead rv d2">
            {"Topical maps, semantic content, schema and site structure, built as one system. For service and trade businesses that count calls, quote requests and booked jobs. Not ranking reports."}
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
              <img src="/images/usman-ishaq-portrait.webp" alt="Usman Ishaq, semantic SEO strategist" />
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
