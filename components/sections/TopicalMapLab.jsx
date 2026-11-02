// Section: TopicalMapLab
export default function TopicalMapLab() {
  return (
    <section className="lab" id="lab">
      {" "}
      <div className="wrap">
        {" "}
        <span className="eyebrow rv">
          {"Topical authority, drawn out"}
        </span>
        {" "}
        <h2 className="rv d1">
          {"What does a topical map look like for your business?"}
        </h2>
        {" "}
        <p className="lead rv d2">
          {"Pick a business type. Each map starts from one central entity, then grows into the pages, questions and attributes Google expects to find. Hover any node to trace its links."}
        </p>
        {" "}
        <div className="tabs rv d2" id="labTabs">
          {" "}
          <button className="tab on" data-g="plumber">
            {"🔧 Plumbing business"}
          </button>
          {" "}
          <button className="tab" data-g="ecom">
            {"🛒 Ecommerce store"}
          </button>
          {" "}
          <button className="tab" data-g="schema">
            {"{ } Schema implementation"}
          </button>
          {" "}
          <button className="tab" data-g="local">
            {"📍 Multi-town contractor"}
          </button>
          {" "}
        </div>
        {" "}
        <div className="lab-grid rv d3">
          {" "}
          <div className="graph-card">
            {" "}
            <svg id="graph" viewBox="0 0 800 495"></svg>
            {" "}
            <div className="legend">
              {" "}
              <span>
                <i style={{background:"#db4c23"}}></i>
                {"Central entity"}
              </span>
              {" "}
              <span>
                <i style={{background:"#5b7cff"}}></i>
                {"Core section"}
              </span>
              {" "}
              <span>
                <i style={{background:"#2fbf8a"}}></i>
                {"Outer section"}
              </span>
              {" "}
              <span>
                <i style={{background:"#c7a6ff"}}></i>
                {"Attribute / question"}
              </span>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
          <div className="side-card" id="labSide"></div>
          {" "}
        </div>
        {" "}
      </div>
      {" "}
    </section>
  );
}
