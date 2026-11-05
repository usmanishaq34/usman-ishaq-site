// Section: Contact
export default function Contact() {
  return (
    <section className="contact" id="contact">
      {" "}
      <div className="wrap contact-grid">
        {" "}
        <div>
          {" "}
          <span className="eyebrow rv">
            {"Start here"}
          </span>
          {" "}
          <h2 className="rv d1">
            {"Ready to see how Google reads your site?"}
          </h2>
          {" "}
          <p className="lead rv d2">
            {"Book thirty minutes, or send a few details and I will reply with what I see. Pick whatever channel suits you."}
          </p>
          {" "}
          <div className="channels">
            {" "}
            <a className="channel rv" href="https://calendly.com/usmanishaqsemanticseospecialist/digital-vikingz" target="_blank" rel="noopener">
              <div className="ci">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="5" width="18" height="16" rx="2"></rect>
                  <path d="M3 10h18M8 3v4M16 3v4"></path>
                </svg>
              </div>
              <div>
                <b>
                  {"Book a 30-minute call"}
                </b>
                <span>
                  {"Pick a time on Calendly"}
                </span>
              </div>
            </a>
            {" "}
            <a className="channel rv d1" href="https://wa.me/message/7CLDLUNQWRTTD1" target="_blank" rel="noopener">
              <div className="ci">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm5.4 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.8-1.1-4.6-4-4.8-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.4.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.4z"></path>
                </svg>
              </div>
              <div>
                <b>
                  {"WhatsApp"}
                </b>
                <span>
                  {"+1 (608) 360-1290"}
                </span>
              </div>
            </a>
            {" "}
            <a className="channel rv d2" href="mailto:workwithus@digitalvikingz.com">
              <div className="ci">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                  <path d="M3 7l9 6 9-6"></path>
                </svg>
              </div>
              <div>
                <b>
                  {"Email"}
                </b>
                <span>
                  {"workwithus@digitalvikingz.com"}
                </span>
              </div>
            </a>
            {" "}
            <a className="channel rv d3" href="https://www.upwork.com/freelancers/usmanishaq" target="_blank" rel="noopener">
              <div className="ci">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3 7h7l-5.5 4.5 2 7.5L12 16.5 5.5 21l2-7.5L2 9h7z"></path>
                </svg>
              </div>
              <div>
                <b>
                  {"Read my Upwork reviews"}
                </b>
                <span>
                  {"Client feedback, verified by Upwork"}
                </span>
              </div>
            </a>
            {" "}
          </div>
          {" "}
        </div>
        {" "}
        <form className="lead rv d1" id="leadForm" noValidate>
          {" "}
          <h3>
            {"Tell me about your business"}
          </h3>
          {" "}
          <p className="muted">
            {"Four short answers. I read every one myself."}
          </p>
          {" "}
          <div className="f-row">
            {" "}
            <div className="field">
              <label htmlFor="fName">
                {"Your name"}
              </label>
              <input id="fName" name="name" required autoComplete="name" />
            </div>
            {" "}
            <div className="field">
              <label htmlFor="fEmail">
                {"Email"}
              </label>
              <input id="fEmail" name="email" type="email" required autoComplete="email" />
            </div>
            {" "}
          </div>
          {" "}
          <div className="f-row">
            {" "}
            <div className="field">
              <label htmlFor="fSite">
                {"Website"}
              </label>
              <input id="fSite" name="website" placeholder="yourbusiness.com" />
            </div>
            {" "}
            <div className="field">
              <label htmlFor="fType">
                {"Business type"}
              </label>
              {" "}
              <select id="fType" name="type">
                <option>
                  {"Trade or home service"}
                </option>
                <option>
                  {"Local professional firm"}
                </option>
                <option>
                  {"Ecommerce store"}
                </option>
                <option>
                  {"SaaS"}
                </option>
                <option>
                  {"Agency (white-label)"}
                </option>
                <option>
                  {"Other"}
                </option>
              </select>
            </div>
            {" "}
          </div>
          {" "}
          <div className="field">
            <label>
              {"What do you count as a win?"}
            </label>
            {" "}
            <div className="pills">
              {" "}
              <label>
                <input type="checkbox" name="win" value="Calls" />
                <span>
                  {"Calls"}
                </span>
              </label>
              {" "}
              <label>
                <input type="checkbox" name="win" value="Quote requests" />
                <span>
                  {"Quote requests"}
                </span>
              </label>
              {" "}
              <label>
                <input type="checkbox" name="win" value="Booked jobs" />
                <span>
                  {"Booked jobs"}
                </span>
              </label>
              {" "}
              <label>
                <input type="checkbox" name="win" value="Online sales" />
                <span>
                  {"Online sales"}
                </span>
              </label>
              {" "}
              <label>
                <input type="checkbox" name="win" value="Demo signups" />
                <span>
                  {"Demo signups"}
                </span>
              </label>
              {" "}
            </div>
            {" "}
          </div>
          {" "}
          <div className="field">
            <label htmlFor="fTowns">
              {"Which towns or markets do you serve?"}
            </label>
            <input id="fTowns" name="towns" placeholder="For example: 12 towns around Tampa" />
          </div>
          {" "}
          <div className="field">
            <label htmlFor="fMsg">
              {"Anything else I should know?"}
            </label>
            <textarea id="fMsg" name="message" placeholder="What have you tried before? What happened?"></textarea>
          </div>
          {" "}
          <div className="field hp" aria-hidden="true">
            <label htmlFor="fCompany">
              {"Company"}
            </label>
            <input id="fCompany" name="company" tabIndex={-1} autoComplete="off" />
          </div>
          {" "}
          <button className="btn btn-primary" type="submit" style={{width:"100%",justifyContent:"center"}}>
            {"Send my details "}
            <span className="arrow">
              {"→"}
            </span>
          </button>
          {" "}
          <div className="form-ok" id="formOk">
            {"Thank you. Your details are in my inbox and I reply myself. Prefer to talk? "}
            <a href="https://calendly.com/usmanishaqsemanticseospecialist/digital-vikingz" target="_blank" rel="noopener" style={{textDecoration:"underline",fontWeight:"700"}}>
              {"Book a time here"}
            </a>
            {"."}
          </div>
          {" "}
          <div className="form-err" id="formErr" role="alert">
            {"The message did not send. "}
            <a href="mailto:workwithus@digitalvikingz.com" style={{textDecoration:"underline",fontWeight:"700"}}>
              {"Email me directly"}
            </a>
            {" or "}
            <a href="https://calendly.com/usmanishaqsemanticseospecialist/digital-vikingz" target="_blank" rel="noopener" style={{textDecoration:"underline",fontWeight:"700"}}>
              {"book a time"}
            </a>
            {"."}
          </div>
          {" "}
        </form>
        {" "}
      </div>
      {" "}
    </section>
  );
}
