// Section: Client feedback. One client recording and three Google reviews
// shown as the original screenshots, in the Digital Vikingz layout. The tab
// switch and the video player live in Interactions.jsx and Overlays.jsx.
const videos = [
  { src: "/video/client-testimonial-1.mp4", poster: "/images/video/client-testimonial-1.jpg", width: 1280, height: 720, length: "1:12" },
];

const reviews = [
  { img: "/images/reviews/google-review-01.webp", w: 684, h: 165, alt: "Google review, 5 stars: Usman has been an absolute pleasure to work with. His skills, knowledge and attention to detail are exceptional. I highly recommend Usman and look forward to continuing to work with him." },
  { img: "/images/reviews/google-review-02.webp", w: 658, h: 138, alt: "Google review, 5 stars: Usman has been doing ongoing SEO and content work for our robotics site. Responsive, professional and easy to work with. Highly recommend for web development and SEO services." },
  { img: "/images/reviews/google-review-03.webp", w: 699, h: 362, alt: "Google review, 5 stars: I hired Usman to lead the SEO and AEO strategy for my website during a major redesign. He does not simply identify problems, he works collaboratively to resolve them. I highly recommend Usman to anyone looking for an SEO and AEO strategist." },
];

export default function Feedback() {
  return (
    <section className="feedback light" id="feedback">
      {" "}
      <div className="wrap">
        {" "}
        <div className="fb-head">
          {" "}
          <div>
            {" "}
            <span className="eyebrow rv">
              {"Client feedback"}
            </span>
            {" "}
            <h2 className="rv d1">
              {"What is it like to work with Usman Ishaq?"}
            </h2>
            {" "}
            <p className="lead rv d2">
              {"A client answers that question himself in the recording below. The written feedback sits beside it as the original Google review screenshots."}
            </p>
            {" "}
          </div>
          {" "}
          <div className="tabs rv d2" role="tablist" id="fbTabs" aria-label="Feedback format">
            <button type="button" className="tab" role="tab" aria-selected="true" data-fb="video">
              {"On camera"}
            </button>
            <button type="button" className="tab" role="tab" aria-selected="false" data-fb="written">
              {"Written"}
            </button>
          </div>
          {" "}
        </div>
        {" "}
        <div className="fb-panel" data-fb-panel="video">
          {" "}
          <div className="vgrid single">
            {videos.map((v, n) => (
              <button
                type="button"
                className={v.width > v.height ? "vcard wide" : "vcard"}
                key={v.src}
                data-src={v.src}
                data-poster={v.poster}
                data-shape={v.height > v.width ? "tall" : "wide"}
                aria-label={`Play client feedback ${n + 1}, ${v.length}`}
              >
                <img src={v.poster} width={v.width} height={v.height} loading="lazy" decoding="async" alt={`Client feedback video ${n + 1}, poster frame`} />
                <span className="len">
                  {v.length}
                </span>
                <span className="play" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M8 5.5v13l11-6.5z" />
                  </svg>
                </span>
                <span className="who">
                  <b>
                    {"Client Feedback"}
                  </b>
                </span>
              </button>
            ))}
          </div>
          {" "}
        </div>
        {" "}
        <div className="fb-panel" data-fb-panel="written" hidden>
          {" "}
          <div className="rgrid">
            {reviews.map((r) => (
              <figure className="rshot" key={r.img}>
                <img src={r.img} width={r.w} height={r.h} loading="lazy" decoding="async" alt={r.alt} />
              </figure>
            ))}
          </div>
          {" "}
          <p className="more">
            <a className="btn btn-ghost" href="https://digitalvikingz.com/feedback" target="_blank" rel="noopener">
              {"Read all reviews"}
            </a>
          </p>
          {" "}
        </div>
        {" "}
      </div>
      {" "}
    </section>
  );
}
