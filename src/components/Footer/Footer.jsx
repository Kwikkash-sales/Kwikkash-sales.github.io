import { Link } from 'react-router';
import "./footer.css";

const NAV_LINKS = [
  { label: "Home",     to: "/" },
  { label: "Catalog",  to: "/catalog" },
  { label: "Contact",  to: "/contact" },
  { label: "Terms",    to: "/terms" },
  { label: "Privacy",  to: "/privacy" },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      

      {/* Main footer body */}
      <div className="footer-body">
        {/* Logo / brand block */}
        <div className="footer-brand">
          <p className="footer-logo">KWIK<br />KASH</p>
          <p className="footer-tagline">Street Style. Fast Cash. No Compromise.</p>
          {/* Classic 90s "Best viewed in" badge vibe */}
          <div className="footer-badge">
            <span>✔ 100%</span>
            <span>AUTHENTIC</span>
            <span>GEAR</span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="footer-nav" aria-label="Footer navigation">
          <p className="footer-nav-heading">NAVIGATE</p>
          <ul className="footer-nav-list">
            {NAV_LINKS.map(({ label, to }) => (
              <li key={label}>
                <Link className="footer-nav-link" to={to}>
                  ► {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Hours / info block */}
        <div className="footer-info">
          <p className="footer-nav-heading">STORE INFO</p>
          <p className="footer-info-line">📦 CLOTHING IS FRESH</p>
          <p className="footer-info-line">📧 <a href="mailto:sales@kwikkash.com" className="footer-email">sales@kwikkash.store</a></p>
          <p className="footer-info-line">🕙 Mon–Sat: 10am – 8pm</p>
          <p className="footer-info-line">🕑 Sun: 12pm – 6pm</p>
        </div>
      </div>

      {/* Divider */}
      <div className="footer-divider" />

      {/* Copyright bar */}
      <div className="footer-copyright">
        <p>
          ©&nbsp;2026&nbsp;Kwik Kash &nbsp; All Rights Reserved.
          &nbsp;|&nbsp;
          <Link to="/terms" className="footer-legal-link">Terms</Link>
          &nbsp;|&nbsp;
          <Link to="/privacy" className="footer-legal-link">Privacy</Link>
        </p>
        {/* Classic "visitor counter" aesthetic */}
        <p className="footer-counter-label">
          <span className="footer-counter">001990</span> satisfied customers
        </p>
      </div>
    </footer>
  );
}