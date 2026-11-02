// Section: GoogleReads
export default function GoogleReads() {
  return (
    <section className="gpat" id="google">
      {" "}
      <div className="wrap">
        {" "}
        <span className="eyebrow rv">
          {"Why the layout matters"}
        </span>
        {" "}
        <h2 className="rv d1">
          {"What has Google said about how it reads a page?"}
        </h2>
        {" "}
        <p className="lead rv d2">
          {"We build to what Google has patented and said in public. We don't sell any of it as a guaranteed ranking factor. We use it to make pages cheaper for Google to read and easier for owners' customers to use."}
        </p>
        {" "}
        <div className="pat-grid">
          {" "}
          <article className="pat rv">
            <div className="src">
              {"US Patent 12393768"}
            </div>
            <h4>
              {"Layout-aware multimodal document understanding"}
            </h4>
            <p>
              {"Google describes reading a page as blocks of text, image, table and layout, then how those blocks relate."}
            </p>
            <div className="so">
              {"So block order and structure carry meaning."}
            </div>
          </article>
          {" "}
          <article className="pat rv d1">
            <div className="src">
              {"US 10824630 · US 11238058"}
            </div>
            <h4>
              {"Structured information cards"}
            </h4>
            <p>
              {"Repeated cards with labels, values and an entity can trigger a card template in search."}
            </p>
            <div className="so">
              {"So service and price cards get the same structure every time."}
            </div>
          </article>
          {" "}
          <article className="pat rv d2">
            <div className="src">
              {"Martin Splitt, Google, 2021"}
            </div>
            <h4>
              {"Centerpiece annotation"}
            </h4>
            <p>
              {"Google finds the main content block of a page and gives boilerplate around it less weight."}
            </p>
            <div className="so">
              {"So the answer goes first, before badges and banners."}
            </div>
          </article>
          {" "}
          <article className="pat rv d3">
            <div className="src">
              {"Pandu Nayak, DOJ trial testimony"}
            </div>
            <h4>
              {"Cheap signals first"}
            </h4>
            <p>
              {"Google runs fast topicality checks before its expensive ranking systems look at a shortlist."}
            </p>
            <div className="so">
              {"So a page that is hard to read can drop out early."}
            </div>
          </article>
          {" "}
        </div>
        {" "}
        <div className="formula rv" id="formula">
          {" "}
          <div className="fx">
            {"(("}
            <span>
              {"Historical data"}
            </span>
            {" × "}
            <span>
              {"Topical coverage"}
            </span>
            {") ÷ "}
            <span>
              {"Cost of retrieval"}
            </span>
            {") × "}
            <span>
              {"Right visual annotations"}
            </span>
          </div>
          {" "}
          <p>
            <b>
              {"Koray Tuğberk Gübür's topical authority formula."}
            </b>
            {" Visual annotations are a multiplier. Get the layout wrong and everything above it is multiplied by close to zero. That is why we plan SEO and design as one job."}
          </p>
          {" "}
        </div>
        {" "}
      </div>
      {" "}
    </section>
  );
}
