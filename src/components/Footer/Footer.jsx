import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import "./footer.css";

const NAV_LINKS = [
  { label: "Home",     to: "/" },
  { label: "Contact",  to: "/contact" },
  { label: "Terms",    to: "/terms" },
  { label: "Privacy",  to: "/privacy" },
];

// Your Google Sheet ID
const SHEET_ID = "1WPuz9RuVq32_vRJV3ti2EjPLCnlwDltrDqGXyIlKVV0";
// Tab name — must match exactly (spaces become %20)
const SHEET_TAB = "KwikKash Inquiry";

function useHeckYeaCount() {
  const [count, setCount] = useState(null); // null = loading

  useEffect(() => {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_TAB)}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Sheet fetch failed");
        return res.text();
      })
      .then((csv) => {
        // Split into rows, skip header row (index 0)
        const rows = csv.split("\n").slice(1);
        let heckYeaCount = 0;
        for (const row of rows) {
          if (!row.trim()) continue;
          // CSV-aware column split: handle quoted fields
          const cols = parseCSVRow(row);
          // Column H = index 7
          const colH = (cols[7] ?? "").replace(/^"|"$/g, "").trim();
          if (colH === "Heck Yea!") {
            heckYeaCount++;
          }
        }
        setCount(heckYeaCount);
      })
      .catch((err) => {
        console.warn("Could not load satisfied customer count:", err);
        setCount(-1); // signals error
      });
  }, []);

  return count;
}

// Minimal CSV row parser that respects double-quoted fields
function parseCSVRow(row) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function CustomerCounter() {
  const count = useHeckYeaCount();

  let display;
  if (count === null) {
    // Still loading — animate dots
    display = <span className="footer-counter">LOADING</span>;
  } else if (count === -1) {
    // Fetch error
    display = <span className="footer-counter">------</span>;
  } else {
    // Zero-pad to 6 digits
    display = (
      <span className="footer-counter">
        {String(count).padStart(6, "0")}
      </span>
    );
  }

  return (
    <p className="footer-counter-label">
      {display} satisfied customers
    </p>
  );
}

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
        {/* Live counter from Google Sheets */}
        <CustomerCounter />
      </div>
    </footer>
  );
}