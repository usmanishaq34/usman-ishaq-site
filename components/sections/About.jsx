// Section: About
export default function About() {
  return (
    <section className="about" id="about">
      {" "}
      <div className="wrap about-grid">
        {" "}
        <div className="about-photo rv">
          {" "}
          <img src="/images/usman-ishaq-at-his-desk.webp" alt="Usman Ishaq at his desk" />
          {" "}
          <div className="badge">
            <b>
              {"Usman Ishaq"}
            </b>
            {" · Founder, Digital Vikingz · Mechanical engineer turned semantic SEO strategist"}
          </div>
          {" "}
        </div>
        {" "}
        <div>
          {" "}
          <span className="eyebrow rv">
            {"About Usman"}
          </span>
          {" "}
          <h2 className="rv d1">
            {"Who is behind the work?"}
          </h2>
          {" "}
          <p className="lead rv d2">
            {"I studied mechanical engineering. Then I started building websites and doing SEO in 2019, and I never stopped thinking in systems. A site is a machine. If one part is wired wrong, the whole thing stalls."}
          </p>
          {" "}
          <p className="quote rv d2">
            {"\"Most owners have paid for SEO and got a PDF of rankings. I would rather show you the calls.\""}
          </p>
          {" "}
          <p className="muted rv d3">
            {"Today I run Digital Vikingz, a semantic SEO and website team. I follow Koray Tuğberk Gübür's holistic SEO framework on every project and hold his Semantic SEO certification. Most new clients come to me through referrals from the ones I already work with."}
          </p>
          {" "}
          <div className="facts rv d3">
            {" "}
            <div className="fact">
              <b>
                {"Mechanical Engineering"}
              </b>
              <span>
                {"UET Taxila"}
              </span>
            </div>
            {" "}
            <div className="fact">
              <b>
                {"Semantic SEO certified"}
              </b>
              <span>
                {"Koray Tuğberk Gübür course"}
              </span>
            </div>
            {" "}
            <div className="fact">
              <b>
                {"Founder"}
              </b>
              <span>
                {"Digital Vikingz, registered in the USA"}
              </span>
            </div>
            {" "}
            <div className="fact">
              <b>
                {"Upwork"}
              </b>
              <span>
                {"SEO, WordPress and content work"}
              </span>
            </div>
            {" "}
          </div>
          {" "}
          <div className="hero-ctas rv d3" style={{marginTop:"30px"}}>
            {" "}
            <a className="btn btn-primary" href="https://www.linkedin.com/in/usmanishaqseo/" target="_blank" rel="noopener">
              {"Connect on LinkedIn "}
              <span className="arrow">
                {"→"}
              </span>
            </a>
            {" "}
            <a className="btn btn-ghost" href="https://digitalvikingz.com" target="_blank" rel="noopener">
              {"Visit Digital Vikingz"}
            </a>
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
