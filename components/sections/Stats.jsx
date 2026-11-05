// Section: Stats
export default function Stats() {
  return (
    <section className="stats" aria-label="Numbers">
      {" "}
      <div className="wrap stats-grid">
        {" "}
        <div className="stat rv">
          <div className="num">
            <span className="cnt" data-to="2019">
              {"2019"}
            </span>
          </div>
          <p>
            {"Doing SEO and web work since"}
          </p>
        </div>
        {" "}
        <div className="stat rv d1">
          <div className="num">
            <span className="cnt" data-to="40">
              {"0"}
            </span>
            <span>
              {"+"}
            </span>
          </div>
          <p>
            {"Industries served"}
          </p>
        </div>
        {" "}
        <div className="stat rv d2">
          <div className="num">
            <span className="cnt" data-to="6">
              {"0"}
            </span>
          </div>
          <p>
            {"Core markets: USA, UK, Canada, Australia, UAE, Germany"}
          </p>
        </div>
        {" "}
        <div className="stat rv d3">
          <div className="num">
            <span className="cnt" data-to="3000">
              {"0"}
            </span>
            <span>
              {"+"}
            </span>
          </div>
          <p>
            {"People following my SEO notes on "}
            <a href="https://www.linkedin.com/in/usmanishaqseo/" target="_blank" rel="noopener">
              {"LinkedIn"}
            </a>
          </p>
        </div>
        {" "}
      </div>
      {" "}
    </section>
  );
}
