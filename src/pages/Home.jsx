// Base imports
import { Link } from 'react-router';
import { useState, useEffect } from 'react';

// CSS
import "@/styles/pages/home.css";

const SHEET_ID = "1WPuz9RuVq32_vRJV3ti2EjPLCnlwDltrDqGXyIlKVV0";

const SHEETS = [
  { name: "CLOTHING", label: "Clothing" },
  { name: "PINS / CASSETTES", label: "Pins / Cassettes" },
  { name: "CARS", label: "Cars" },
];

function sheetCsvUrl(sheetName) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

function parseCsv(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const parseRow = (line) => {
    const cols = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === "," && !inQ) {
        cols.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    cols.push(cur.trim());
    return cols;
  };

  const headers = parseRow(lines[0]);
  return lines.slice(1).map((line) => {
    const vals = parseRow(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
    return obj;
  });
}

function formatPrice(price) {
  if (!price || price === "$0.00" || price === "0") return "Price TBD";
  return price;
}

function isFeatured(row) {
  const val = (row["Featured"] ?? row["featured"] ?? "").toString().toLowerCase();
  return val === "true" || val === "1" || val === "yes" || val === "✓";
}

function ItemCard({ item, sheetLabel }) {
  const name = item["Item Name"] || item["Item Name "] || "Unknown Item";
  const price = formatPrice(item["Item Price"]);
  const picture = item["Item Picture"] || "";
  const type = item["Item Type"] || "";
  const amount = item["Item Amount"] ?? "";

  return (
    <article className="item-card">
      <div className="item-card-image">
        {picture ? (
          <img src={picture} alt={name} loading="lazy" />
        ) : (
          <div className="item-card-placeholder">
            <span>NO IMG</span>
          </div>
        )}
      </div>
      <div className="item-card-body">
        <span className="item-card-category">{sheetLabel}</span>
        <h3 className="item-card-name">{name}</h3>
        {type && type !== "-" && <p className="item-card-type">{type}</p>}
        <p className="item-card-price">{price}</p>
        {amount && amount !== "0" && (
          <p className="item-card-stock">In stock: {amount}</p>
        )}
      </div>
    </article>
  );
}

// Build a /catalog URL with the right filter params pre-applied
function catalogLink({ sheet, type, featured } = {}) {
  const params = new URLSearchParams();
  if (sheet) params.set("sheet", sheet);
  if (type) params.set("type", type);
  if (featured) params.set("featured", "true");
  const qs = params.toString();
  return `/catalog${qs ? `?${qs}` : ""}`;
}

// Clothing nav items — each maps to an Item Type value in the spreadsheet
const clothingLinks = [
  { label: "Hat",                  type: "Hat" },
  { label: "Glasses",              type: "Glasses" },
  { label: "Shoulder Slot",        type: "Shoulder Slot" },
  { label: "Primary Accessory",    type: "Primary Accessory" },
  { label: "Secondary Accessory",  type: "Secondary Accessory" },
  { label: "Inventory Accessory",  type: "Inventory Accessory" },
  { label: "Rings",                type: "Rings" },
  { label: "Watch",                type: "Watch" },
  { label: "Outfit",               type: "Outfit" },
  { label: "Shirt",                type: "Shirt" },
  { label: "Pants",                type: "Pants" },
  { label: "Shoes",                type: "Shoes" },
];

// Misc nav items — each maps to a sheet
const miscLinks = [
  { label: "Pins",       sheet: "PINS / CASSETTES", type: "Pin" },
  { label: "Cassettes",  sheet: "PINS / CASSETTES", type: "Cassette" },
  { label: "Cars",       sheet: "CARS" },
];

export default function Home() {
  const [allItems, setAllItems] = useState({ CLOTHING: [], "PINS / CASSETTES": [], CARS: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      try {
        const results = await Promise.all(
          SHEETS.map(async ({ name }) => {
            const res = await fetch(sheetCsvUrl(name));
            if (!res.ok) throw new Error(`Failed to load ${name}`);
            const text = await res.text();
            return { name, rows: parseCsv(text) };
          })
        );
        if (!cancelled) {
          const map = {};
          results.forEach(({ name, rows }) => { map[name] = rows; });
          setAllItems(map);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message);
          setLoading(false);
        }
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  const featuredItems = SHEETS.flatMap(({ name, label }) =>
    (allItems[name] || [])
      .filter((row) => isFeatured(row))
      .map((row) => ({ ...row, _sheet: name, _label: label }))
  );

  return (
    <main className="home-main-container">
      {/* Mobile hamburger toggle */}
      <button
        className={`nav-toggle${menuOpen ? " open" : ""}`}
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Toggle navigation"
      >
        <span /><span /><span />
      </button>

      <aside className={`content-navigation${menuOpen ? " nav-open" : ""}`}>
        <nav className="category-container">
          <h2>Clothing:</h2>
          <div className="button-holder">
            {clothingLinks.map(({ label, type }) => (
              <Link
                key={label}
                className="category-button"
                to={catalogLink({ sheet: "CLOTHING", type })}
                onClick={() => setMenuOpen(false)}
              >
                ⭐{label}
              </Link>
            ))}
          </div>
        </nav>
        <nav className="category-container">
          <h2>Misc:</h2>
          <div className="button-holder">
            {miscLinks.map(({ label, sheet, type }) => (
              <Link
                key={label}
                className="category-button"
                to={catalogLink({ sheet, type })}
                onClick={() => setMenuOpen(false)}
              >
                ⭐{label}
              </Link>
            ))}
          </div>
        </nav>
      </aside>

      <section className="featured-content">
        <div className="content-description">
          <h3 className="content-title">
            Welcome to Kwik Kash Clothing!
          </h3>
          <p className="content-desc">
            Your #1 source for the hottest styles at the lowest prices. Whether you're looking for
            fresh denim, fly kicks, or the latest streetwear — <b>Kwik Kash</b> has got you covered.
            New shipments arrive every Tuesday &amp; Friday. Don't miss out!
          </p>
        </div>

        <div className="featured-box">
          <h4>⭐ FEATURED ITEMS ⭐</h4>
        </div>

        <div className="featured-items-container">
          {loading && (
            <div className="shop-status">
              <div className="shop-loader" />
              <p>Loading inventory...</p>
            </div>
          )}

          {error && (
            <div className="shop-status shop-error">
              <p>⚠ Could not load inventory: {error}</p>
              <p className="shop-error-hint">
                Make sure the spreadsheet is set to "Anyone with link can view".
              </p>
            </div>
          )}

          {!loading && !error && featuredItems.length === 0 && (
            <div className="shop-status">
              <p>No featured items yet. Check a "Featured" box in the spreadsheet to display items here.</p>
            </div>
          )}

          {!loading && !error && featuredItems.length > 0 &&
            featuredItems.map((item, idx) => (
              <ItemCard key={`${item._sheet}-${item["ID"]}-${idx}`} item={item} sheetLabel={item._label} />
            ))
          }
        </div>
      </section>
    </main>
  );
}