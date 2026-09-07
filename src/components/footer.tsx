export function Footer() {
  return (
    <footer className="contact-footer safe-bottom">
      <div className="contact-footer-inner">
        <div className="contact-footer-links">
          <a
            href="mailto:hussein.mufti01@gmail.com"
            className="contact-footer-link"
          >
            hussein.mufti01@gmail.com
          </a>
          <a
            href="https://github.com/seinmufti"
            target="_blank"
            rel="noreferrer"
            className="contact-footer-link"
          >
            GitHub
          </a>
        </div>
        <p className="contact-footer-copy">
          © {new Date().getFullYear()} Nordlys Solutions
        </p>
      </div>
    </footer>
  );
}
