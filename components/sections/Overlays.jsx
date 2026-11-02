// Floating WhatsApp button and image lightbox
export default function Overlays() {
  return (
    <>
    <a className="wa" href="https://wa.me/message/7CLDLUNQWRTTD1" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff">
        <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm5.4 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.8-1.1-4.6-4-4.8-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.4.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.4z"></path>
      </svg>
    </a>
    <div className="lightbox" id="lightbox">
      <button className="lb-close" id="lbClose" aria-label="Close">
        {"×"}
      </button>
      <img id="lbImg" alt="" />
    </div>
    </>
  );
}
