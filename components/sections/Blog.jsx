// Section: Blog. The heading is editable page content; the cards are an
// island (components/LatestPosts.tsx) fed by the dashboard's posts.
export default function Blog() {
  return (
    <section className="blog" id="blog">
      {" "}
      <div className="wrap">
        {" "}
        <div className="blog-top">
          {" "}
          <div>
            {" "}
            <span className="eyebrow rv">
              {"The blog"}
            </span>
            {" "}
            <h2 className="rv d1">
              {"Want to see how I think before we talk?"}
            </h2>
            {" "}
            <p className="lead rv d2">
              {"Plain-language articles on semantic SEO, content networks and AI search. Written from real projects, not theory."}
            </p>
            {" "}
          </div>
          {" "}
          <a className="btn btn-ghost rv d2" href="/blog">
            {"See all articles "}
            <span className="arrow">
              {"→"}
            </span>
          </a>
          {" "}
        </div>
        {" "}
        <div data-dv-island="latest-posts"></div>
        {" "}
      </div>
      {" "}
    </section>
  );
}
