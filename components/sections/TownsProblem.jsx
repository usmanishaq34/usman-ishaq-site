// Section: TownsProblem
export default function TownsProblem() {
  return (
    <section className="towns" id="problem">
      {" "}
      <div className="wrap two-col">
        {" "}
        <div>
          {" "}
          <span className="eyebrow rv">
            {"The problem I see most"}
          </span>
          {" "}
          <h2 className="rv d1">
            {"Why does your site list sixteen towns but ring from one?"}
          </h2>
          {" "}
          <p className="lead rv d2">
            {"Most service sites put every town they cover on one page. To Google, that is one page about everything. It can rank for one place. The other fifteen towns go to whoever gave Google a page for them."}
          </p>
          {" "}
          <ul className="bullets rv d3">
            <li>
              <span className="n">
                {"01"}
              </span>
              <div>
                <b>
                  {"One page, many places."}
                </b>
                {" A list of towns is not a reason to rank in any of them."}
              </div>
            </li>
            <li>
              <span className="n">
                {"02"}
              </span>
              <div>
                <b>
                  {"Each town needs its own page."}
                </b>
                {" Its own services, questions, proof and links."}
              </div>
            </li>
            <li>
              <span className="n">
                {"03"}
              </span>
              <div>
                <b>
                  {"Structure before content."}
                </b>
                {" More blog posts will not fix a site Google cannot read."}
              </div>
            </li>
          </ul>
          {" "}
        </div>
        {" "}
        <div className="viz-card rv d2">
          {" "}
          <div className="viz-top">
            {" "}
            <div className="toggle" role="tablist">
              {" "}
              <button className="on" id="tBefore">
                {"How Google sees it now"}
              </button>
              {" "}
              <button id="tAfter">
                {"After the rebuild"}
              </button>
              {" "}
            </div>
            {" "}
            <div className="counter-pill">
              {"Pages that can rank:"}
              <b id="pageCount">
                {"1"}
              </b>
            </div>
            {" "}
          </div>
          {" "}
          <svg id="townsSvg" viewBox="0 0 640 420" aria-label="Sixteen towns pointing to one page versus sixteen pages"></svg>
          {" "}
        </div>
        {" "}
      </div>
      {" "}
    </section>
  );
}
