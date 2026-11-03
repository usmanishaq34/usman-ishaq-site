// Progress bar, header and mobile menu
export default function SiteHeader({ light = false } = {}) {
  return (
    <>
    <div id="progress"></div>
    <header id="top" className={light ? "on-light" : undefined}>
      {" "}
      <div className="wrap nav">
        {" "}
        <a href="/" className="brand" aria-label="Usman Ishaq home">
          {" "}
          <div className="brand-mark">
            <img src="/images/usman-ishaq-logo.webp" alt="Usman Ishaq logo" />
          </div>
          {" "}
          <div className="brand-name">
            {"Usman Ishaq"}
            <small>
              {"Semantic SEO Strategist"}
            </small>
          </div>
          {" "}
        </a>
        {" "}
        <ul>
          <li>
            <a href="/#results">
              {"Results"}
            </a>
          </li>
          <li>
            <a href="/#build">
              {"Method"}
            </a>
          </li>
          <li>
            <a href="/#services">
              {"Services"}
            </a>
          </li>
          <li>
            <a href="/#websites">
              {"Websites"}
            </a>
          </li>
          <li>
            <a href="/#about">
              {"About"}
            </a>
          </li>
          <li>
            <a href="/blog">
              {"Blog"}
            </a>
          </li>
          <li>
            <a href="/#faq">
              {"FAQ"}
            </a>
          </li>
        </ul>
        {" "}
        <a className="btn btn-primary nav-cta" href="https://calendly.com/usmanishaqsemanticseospecialist/30min" target="_blank" rel="noopener">
          {"Book a call "}
          <span className="arrow">
            {"→"}
          </span>
        </a>
        {" "}
        <button className="burger" aria-label="Open menu" id="burger">
          <span></span>
          <span></span>
          <span></span>
        </button>
        {" "}
      </div>
      {" "}
    </header>
    <nav className="mobile-menu" id="mobileMenu">
      {" "}
      <a href="/#results">
        {"Results"}
      </a>
      <a href="/#build">
        {"Method"}
      </a>
      <a href="/#lab">
        {"Topical Maps"}
      </a>
      <a href="/#websites">
        {"Websites"}
      </a>
      <a href="/#services">
        {"Services"}
      </a>
      <a href="/#work">
        {"Work"}
      </a>
      <a href="/#about">
        {"About"}
      </a>
      <a href="/blog">
        {"Blog"}
      </a>
      <a href="/#faq">
        {"FAQ"}
      </a>
      <a href="/#contact">
        {"Contact"}
      </a>
      {" "}
    </nav>
    </>
  );
}
