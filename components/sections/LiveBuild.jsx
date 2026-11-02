// Section: LiveBuild
export default function LiveBuild() {
  return (
    <section className="build" id="build">
      {" "}
      <div className="wrap">
        {" "}
        <span className="eyebrow rv">
          {"Visual semantics, step by step"}
        </span>
        {" "}
        <h2 className="rv d1">
          {"How does one search turn into one page?"}
        </h2>
        {" "}
        <p className="lead rv d2">
          {"Here is the real workflow, run on an example plumbing business. The topical map decides which page exists. The brief decides every block. The layout decides what Google reads first."}
        </p>
        {" "}
        <div className="snavs rv d2" id="snavs">
          {" "}
          <button className="snav on" data-p="0">
            <i>
              {"1"}
            </i>
            {"Topical map"}
            <span className="pbar"></span>
          </button>
          {" "}
          <button className="snav" data-p="1">
            <i>
              {"2"}
            </i>
            {"Content brief"}
            <span className="pbar"></span>
          </button>
          {" "}
          <button className="snav" data-p="2">
            <i>
              {"3"}
            </i>
            {"Page layout"}
            <span className="pbar"></span>
          </button>
          {" "}
        </div>
        {" "}
        <div className="stage rv d3">
          {" "}
          <div className="panel on">
            {" "}
            <div className="panel-head">
              <div>
                <h3>
                  {"The topical map"}
                </h3>
                <p>
                  {"Every service, question and town becomes a node. Each node gets one owning query, one intent and one URL. No two pages chase the same search."}
                </p>
              </div>
            </div>
            {" "}
            <div className="sheet-wrap">
              <table className="sheet">
                <thead>
                  <tr>
                    <th>
                      {"Cluster"}
                    </th>
                    <th>
                      {"Node"}
                    </th>
                    <th>
                      {"Level"}
                    </th>
                    <th>
                      {"Owning query"}
                    </th>
                    <th>
                      {"Intent"}
                    </th>
                    <th>
                      {"Proposed URL"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="row">
                    <td>
                      {"Repiping"}
                    </td>
                    <td>
                      <b>
                        {"Whole-house repiping"}
                      </b>
                    </td>
                    <td>
                      <span className="lvl hub">
                        {"Hub"}
                      </span>
                    </td>
                    <td className="mono">
                      {"whole house repipe"}
                    </td>
                    <td>
                      {"Commercial"}
                    </td>
                    <td className="mono">
                      {"/repiping/"}
                    </td>
                  </tr>
                  <tr className="row">
                    <td>
                      {"Repiping"}
                    </td>
                    <td>
                      <b>
                        {"PEX vs copper repipe"}
                      </b>
                    </td>
                    <td>
                      <span className="lvl">
                        {"Chapter"}
                      </span>
                    </td>
                    <td className="mono">
                      {"pex vs copper repipe"}
                    </td>
                    <td>
                      {"Informational"}
                    </td>
                    <td className="mono">
                      {"/repiping/pex-vs-copper/"}
                    </td>
                  </tr>
                  <tr className="row">
                    <td>
                      {"Repiping"}
                    </td>
                    <td>
                      <b>
                        {"Repipe cost"}
                      </b>
                    </td>
                    <td>
                      <span className="lvl">
                        {"Chapter"}
                      </span>
                    </td>
                    <td className="mono">
                      {"how much does it cost to repipe a house"}
                    </td>
                    <td>
                      {"Commercial"}
                    </td>
                    <td className="mono">
                      {"/repiping/cost/"}
                    </td>
                  </tr>
                  <tr className="row">
                    <td>
                      {"Repiping"}
                    </td>
                    <td>
                      <b>
                        {"Signs you need a repipe"}
                      </b>
                    </td>
                    <td>
                      <span className="lvl">
                        {"Leaf"}
                      </span>
                    </td>
                    <td className="mono">
                      {"signs you need to repipe"}
                    </td>
                    <td>
                      {"Informational"}
                    </td>
                    <td className="mono">
                      {"/repiping/signs/"}
                    </td>
                  </tr>
                  <tr className="row" data-hot="">
                    <td>
                      {"Service areas"}
                    </td>
                    <td>
                      <b>
                        {"Repiping in Springfield"}
                      </b>
                    </td>
                    <td>
                      <span className="lvl town">
                        {"Town"}
                      </span>
                    </td>
                    <td className="mono">
                      {"repiping springfield"}
                    </td>
                    <td>
                      {"Transactional"}
                    </td>
                    <td className="mono">
                      {"/springfield/repiping/"}
                    </td>
                  </tr>
                  <tr className="row">
                    <td>
                      {"Service areas"}
                    </td>
                    <td>
                      <b>
                        {"Repiping in Franklin"}
                      </b>
                    </td>
                    <td>
                      <span className="lvl town">
                        {"Town"}
                      </span>
                    </td>
                    <td className="mono">
                      {"repiping franklin"}
                    </td>
                    <td>
                      {"Transactional"}
                    </td>
                    <td className="mono">
                      {"/franklin/repiping/"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {" "}
            <div className="nextp">
              {"→ The \"Repiping in Springfield\" node becomes a brief"}
            </div>
            {" "}
          </div>
          {" "}
          <div className="panel">
            {" "}
            <div className="panel-head">
              <div>
                <h3>
                  {"The content brief"}
                </h3>
                <p>
                  {"One row per heading. What each block must say, how it is shaped, and which page it links to. Same four columns on every brief."}
                </p>
              </div>
            </div>
            {" "}
            <div className="sheet-wrap">
              <table className="sheet brief">
                <thead>
                  <tr>
                    <th style={{width:"28%"}}>
                      {"Contextual Vectors"}
                    </th>
                    <th style={{width:"9%"}}>
                      {"Contextual Hierarchy"}
                    </th>
                    <th>
                      {"Contextual Structure"}
                    </th>
                    <th style={{width:"22%"}}>
                      {"Contextual Connection"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="row" data-hot="">
                    <td>
                      <b>
                        {"Repiping in Springfield: Cost, Pipe Materials and What to Expect"}
                      </b>
                    </td>
                    <td>
                      <b>
                        {"H1"}
                      </b>
                    </td>
                    <td>
                      {"Central entity in the H1, the standfirst and the first block. The first 400 characters say who repipes homes in Springfield, with which pipe, and how to get a quote."}
                    </td>
                    <td className="mono">
                      {"none"}
                    </td>
                  </tr>
                  <tr className="row">
                    <td>
                      <b>
                        {"How Much Does a Repipe Cost in Springfield?"}
                      </b>
                    </td>
                    <td>
                      <b>
                        {"H2"}
                      </b>
                    </td>
                    <td>
                      {"Cost card first. Ranges by home size and pipe material. Attribute and value, no adjectives."}
                    </td>
                    <td className="mono">
                      {"repipe cost → /repiping/cost/"}
                    </td>
                  </tr>
                  <tr className="row">
                    <td>
                      <b>
                        {"PEX or Copper for a Springfield Home?"}
                      </b>
                    </td>
                    <td>
                      <b>
                        {"H2"}
                      </b>
                    </td>
                    <td>
                      {"Comparison as a real table. Lifespan, cost per foot, freeze tolerance."}
                    </td>
                    <td className="mono">
                      {"PEX vs copper → /repiping/pex-vs-copper/"}
                    </td>
                  </tr>
                  <tr className="row">
                    <td>
                      <b>
                        {"What Happens on Repipe Day?"}
                      </b>
                    </td>
                    <td>
                      <b>
                        {"H2"}
                      </b>
                    </td>
                    <td>
                      {"Ordered steps in an ol list. One action per step."}
                    </td>
                    <td className="mono">
                      {"none"}
                    </td>
                  </tr>
                  <tr className="row">
                    <td>
                      <b>
                        {"Repiping Questions Springfield Owners Ask"}
                      </b>
                    </td>
                    <td>
                      <b>
                        {"H2"}
                      </b>
                    </td>
                    <td>
                      {"Micro context. Only questions the page has not answered above."}
                    </td>
                    <td className="mono">
                      {"signs you need a repipe → /repiping/signs/"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {" "}
            <div className="nextp">
              {"→ Each row becomes a block on the page"}
            </div>
            {" "}
          </div>
          {" "}
          <div className="panel">
            {" "}
            <div className="panel-head">
              <div>
                <h3>
                  {"The page layout"}
                </h3>
                <p>
                  {"The brief becomes blocks in a set order. The answer goes first. Proof sits beside the action. Links and FAQs go below the fold."}
                </p>
              </div>
            </div>
            {" "}
            <div className="lay">
              {" "}
              <div className="browser">
                {" "}
                <div className="bar3">
                  <i></i>
                  <i></i>
                  <i></i>
                  <span>
                    {"example.com/springfield/repiping/"}
                  </span>
                </div>
                {" "}
                <div className="canvas">
                  {" "}
                  <div className="blk" data-n="1">
                    <span className="pin">
                      {"1"}
                    </span>
                    <div className="k">
                      {"H1 + standfirst"}
                    </div>
                    <div className="t">
                      {"Repiping in Springfield: Cost, Pipe Materials and What to Expect"}
                    </div>
                    <div className="ln" style={{width:"92%"}}></div>
                    <div className="ln" style={{width:"70%"}}></div>
                  </div>
                  {" "}
                  <div className="blk" data-n="2">
                    <span className="pin">
                      {"2"}
                    </span>
                    <div className="k">
                      {"Centerpiece"}
                    </div>
                    <div className="row2">
                      <div className="mini-form">
                        <div className="ln"></div>
                        <div className="ln"></div>
                        <div className="mini-btn"></div>
                      </div>
                      <div className="cost">
                        {"Cost card"}
                        <br />
                        {"by home size and pipe"}
                      </div>
                    </div>
                  </div>
                  {" "}
                  <div className="blk" data-n="3">
                    <span className="pin">
                      {"3"}
                    </span>
                    <div className="k">
                      {"Proof"}
                    </div>
                    <div className="chips">
                      <span>
                        {"Licensed"}
                      </span>
                      <span>
                        {"Google reviews"}
                      </span>
                      <span>
                        {"Years in business"}
                      </span>
                    </div>
                  </div>
                  {" "}
                  <div className="fold">
                    <span>
                      {"THE FOLD · macro above, micro below"}
                    </span>
                  </div>
                  {" "}
                  <div className="blk" data-n="4">
                    <span className="pin">
                      {"4"}
                    </span>
                    <div className="k">
                      {"Comparison table"}
                    </div>
                    <div className="tbl">
                      <span className="h">
                        {"Attribute"}
                      </span>
                      <span className="h">
                        {"PEX"}
                      </span>
                      <span className="h">
                        {"Copper"}
                      </span>
                      <span>
                        {"Lifespan"}
                      </span>
                      <span>
                        {"value"}
                      </span>
                      <span>
                        {"value"}
                      </span>
                      <span>
                        {"Cost per foot"}
                      </span>
                      <span>
                        {"value"}
                      </span>
                      <span>
                        {"value"}
                      </span>
                    </div>
                  </div>
                  {" "}
                  <div className="blk" data-n="5">
                    <span className="pin">
                      {"5"}
                    </span>
                    <div className="k">
                      {"Steps"}
                    </div>
                    <div className="ln" style={{width:"80%"}}></div>
                    <div className="ln" style={{width:"65%"}}></div>
                    <div className="ln" style={{width:"72%"}}></div>
                  </div>
                  {" "}
                  <div className="blk" data-n="6">
                    <span className="pin">
                      {"6"}
                    </span>
                    <div className="k">
                      {"FAQ + internal links"}
                    </div>
                    <div className="chips">
                      <span>
                        {"Repipe cost"}
                      </span>
                      <span>
                        {"PEX vs copper"}
                      </span>
                      <span>
                        {"Signs you need a repipe"}
                      </span>
                    </div>
                  </div>
                  {" "}
                  <div className="blk" data-n="7">
                    <span className="pin">
                      {"7"}
                    </span>
                    <div className="k">
                      {"Schema (JSON-LD)"}
                    </div>
                    <div className="s" style={{fontFamily:"var(--mono)"}}>
                      {"Plumber → Service → areaServed: Springfield"}
                    </div>
                  </div>
                  {" "}
                </div>
                {" "}
              </div>
              {" "}
              <div className="notes">
                <div className="note" data-n="1">
                  <span className="n">
                    {"1"}
                  </span>
                  <div>
                    <b>
                      {"H1 and standfirst"}
                    </b>
                    <span className="d">
                      {"Central entity and main predicate inside the first 400 characters."}
                    </span>
                  </div>
                </div>
                <div className="note" data-n="2">
                  <span className="n">
                    {"2"}
                  </span>
                  <div>
                    <b>
                      {"Centerpiece"}
                    </b>
                    <span className="d">
                      {"The quote form and cost card. The block that does the job of the search, first in the HTML after the H1."}
                    </span>
                  </div>
                </div>
                <div className="note" data-n="3">
                  <span className="n">
                    {"3"}
                  </span>
                  <div>
                    <b>
                      {"Proof below the action"}
                    </b>
                    <span className="d">
                      {"Licence, reviews and years. Close to the form, never between the H1 and the answer."}
                    </span>
                  </div>
                </div>
                <div className="note" data-n="4">
                  <span className="n">
                    {"4"}
                  </span>
                  <div>
                    <b>
                      {"Comparison table"}
                    </b>
                    <span className="d">
                      {"Real table markup. Repeated labels and values Google can read as structured information."}
                    </span>
                  </div>
                </div>
                <div className="note" data-n="5">
                  <span className="n">
                    {"5"}
                  </span>
                  <div>
                    <b>
                      {"Steps"}
                    </b>
                    <span className="d">
                      {"An ordered list, one action per step."}
                    </span>
                  </div>
                </div>
                <div className="note" data-n="6">
                  <span className="n">
                    {"6"}
                  </span>
                  <div>
                    <b>
                      {"FAQ and internal links"}
                    </b>
                    <span className="d">
                      {"Micro context. Most internal links live here, below the fold."}
                    </span>
                  </div>
                </div>
                <div className="note" data-n="7">
                  <span className="n">
                    {"7"}
                  </span>
                  <div>
                    <b>
                      {"Schema"}
                    </b>
                    <span className="d">
                      {"Plumber, Service and areaServed. Only what the page actually shows."}
                    </span>
                  </div>
                </div>
              </div>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
        </div>
        {" "}
        <div className="realfiles">
          {" "}
          <figure className="rf rv">
            <div className="im">
              <img loading="lazy" src="/images/topical-map-example.webp" alt="A real topical map spreadsheet with clusters, nodes, levels, owning queries, intent and proposed URLs" />
            </div>
            <figcaption className="c">
              <b>
                {"A real topical map"}
              </b>
              <span>
                {"Clusters, nodes, owning queries, intent and URL for every page. Client details blurred."}
              </span>
            </figcaption>
          </figure>
          {" "}
          <figure className="rf rv d1">
            <div className="im">
              <img loading="lazy" src="/images/content-brief-example.webp" alt="A real content brief spreadsheet with Contextual Vectors, Hierarchy and Structure columns" />
            </div>
            <figcaption className="c">
              <b>
                {"A real content brief"}
              </b>
              <span>
                {"One row per heading, the same four columns on every brief. Client details blurred."}
              </span>
            </figcaption>
          </figure>
          {" "}
        </div>
        {" "}
      </div>
      {" "}
    </section>
  );
}
