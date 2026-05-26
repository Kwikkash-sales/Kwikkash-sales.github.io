// Base imports
import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

// CSS
import "@/styles/pages/catalog.css";

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

function parsePrice(str) {
  if (!str) return 0;
  return parseFloat(str.replace(/[$,]/g, "")) || 0;
}

function formatPrice(price) {
  if (!price || price === "$0.00" || price === "0") return "Price TBD";
  return price;
}

function isFeatured(row) {
  const val = (row["Featured"] ?? "").toString().toLowerCase();
  return val === "true" || val === "1" || val === "yes" || val === "✓";
}

// Highlight matching substring in text
function Highlight({ text, query }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="search-highlight">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function CatalogItemCard({ item, query }) {
  const name = item["Item Name"] || "Unknown Item";
  const price = formatPrice(item["Item Price"]);
  const picture = item["Item Picture"] || "";
  const type = item["Item Type"] || "";
  const gender = item["Item Gender"] || "";
  const featured = isFeatured(item);
  const stockedRaw = (item["Stocked?"] ?? "").toString().toLowerCase();
  const hasStockField = stockedRaw === "true" || stockedRaw === "false";
  const isInStock = stockedRaw === "true";

  return (
    <article className={`catalog-card${featured ? " catalog-card--featured" : ""}`}>
      {featured && <div className="catalog-card-star">⭐ FEATURED</div>}
      <div className="catalog-card-image">
        {picture ? (
          <img src={picture} alt={name} loading="lazy" />
        ) : (
          <div className="catalog-card-placeholder">
            <span>NO IMG</span>
          </div>
        )}
      </div>
      <div className="catalog-card-body">
        <span className="catalog-card-category">{item._label}</span>
        <h3 className="catalog-card-name">
          <Highlight text={name} query={query} />
        </h3>
        {type && type !== "-" && <p className="catalog-card-type">{type}{gender && gender !== "-" ? ` · ${gender}` : ""}</p>}
        <p className="catalog-card-price">{price}</p>
        {hasStockField && (
          <p className={`catalog-card-stock${isInStock ? " catalog-card-stock--in" : " catalog-card-stock--out"}`}>
            {isInStock ? "IN STOCK" : "OUT OF STOCK"}
          </p>
        )}
      </div>
    </article>
  );
}

const SORT_OPTIONS = [
  { value: "default", label: "Default Order" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "name-asc", label: "Name: A → Z" },
  { value: "name-desc", label: "Name: Z → A" },
];

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters — seeded from URL search params so links from Home work
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSheet, setActiveSheet] = useState(searchParams.get("sheet") || "ALL");
  const [activeType, setActiveType] = useState(searchParams.get("type") || "ALL");
  const [activeGender, setActiveGender] = useState(searchParams.get("gender") || "ALL");
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get("featured") === "true");
  const [sort, setSort] = useState(searchParams.get("sort") || "default");
  const [filtersOpen, setFiltersOpen] = useState(
    !!(searchParams.get("sheet") || searchParams.get("type") || searchParams.get("gender"))
  );

  const searchRef = useRef(null);
  const suggestRef = useRef(null);

  // Fetch all sheets
  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      try {
        const results = await Promise.all(
          SHEETS.map(async ({ name, label }) => {
            const res = await fetch(sheetCsvUrl(name));
            if (!res.ok) throw new Error(`Failed to load ${name}`);
            const text = await res.text();
            return parseCsv(text).map((row) => ({ ...row, _sheet: name, _label: label }));
          })
        );
        if (!cancelled) {
          setAllItems(results.flat());
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) { setError(e.message); setLoading(false); }
      }
    }
    fetchAll();
    return () => { cancelled = true; };
  }, []);

  // Derived filter options from loaded data
  const ITEM_TYPES = [
    "Hat",
    "Glasses",
    "Shoulder Slot",
    "Primary Accessory",
    "Secondary Accessory",
    "Inventory Accessory",
    "Rings",
    "Watch",
    "Outfit",
    "Shirt",
    "Pants",
    "Shoes",
    "Pin",
    "Cassette",
  ];

  const availableTypes = useMemo(() => {
    // Always show the known types, but only include ones that actually
    // appear in the current sheet's data so the filter isn't useless.
    const presentTypes = new Set(
      allItems
        .filter((i) => activeSheet === "ALL" || i._sheet === activeSheet)
        .map((i) => i["Item Type"])
        .filter((t) => t && t !== "-" && t !== "")
    );
    return ["ALL", ...ITEM_TYPES.filter((t) => presentTypes.has(t))];
  }, [allItems, activeSheet]);

  const availableGenders = useMemo(() => {
    const genders = new Set();
    allItems.forEach((item) => {
      const g = item["Item Gender"];
      if (g && g !== "-" && g !== "") genders.add(g);
    });
    return ["ALL", ...Array.from(genders).sort()];
  }, [allItems]);

  // Search suggestions
  useEffect(() => {
    if (search.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const q = search.toLowerCase();
    const matches = allItems
      .filter((item) => (item["Item Name"] || "").toLowerCase().includes(q))
      .slice(0, 8)
      .map((item) => ({ name: item["Item Name"], label: item._label }));
    // Dedupe by name
    const seen = new Set();
    const deduped = matches.filter(({ name }) => {
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
    setSuggestions(deduped);
  }, [search, allItems]);

  // Close suggestions on outside click
  useEffect(() => {
    function handle(e) {
      if (
        suggestRef.current && !suggestRef.current.contains(e.target) &&
        searchRef.current && !searchRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Filtered + sorted items
  const filteredItems = useMemo(() => {
    let items = allItems;

    if (activeSheet !== "ALL") items = items.filter((i) => i._sheet === activeSheet);
    if (activeType !== "ALL") items = items.filter((i) => i["Item Type"] === activeType);
    if (activeGender !== "ALL") items = items.filter((i) => i["Item Gender"] === activeGender);
    if (featuredOnly) items = items.filter((i) => isFeatured(i));

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((i) => (i["Item Name"] || "").toLowerCase().includes(q));
    }

    items = [...items];
    if (sort === "price-asc") items.sort((a, b) => parsePrice(a["Item Price"]) - parsePrice(b["Item Price"]));
    else if (sort === "price-desc") items.sort((a, b) => parsePrice(b["Item Price"]) - parsePrice(a["Item Price"]));
    else if (sort === "name-asc") items.sort((a, b) => (a["Item Name"] || "").localeCompare(b["Item Name"] || ""));
    else if (sort === "name-desc") items.sort((a, b) => (b["Item Name"] || "").localeCompare(a["Item Name"] || ""));

    return items;
  }, [allItems, activeSheet, activeType, activeGender, featuredOnly, search, sort]);

  function clearFilters() {
    setSearch("");
    setActiveSheet("ALL");
    setActiveType("ALL");
    setActiveGender("ALL");
    setFeaturedOnly(false);
    setSort("default");
  }

  const hasActiveFilters = activeSheet !== "ALL" || activeType !== "ALL" || activeGender !== "ALL" || featuredOnly || search.trim() || sort !== "default";

  return (
    <main className="catalog-main">

      {/* ── Search bar ── */}
      <div className="catalog-search-wrapper">
        <div className="catalog-search-box">
          <span className="catalog-search-icon">🔍</span>
          <input
            ref={searchRef}
            className="catalog-search-input"
            type="text"
            placeholder="Search items... (e.g. Widow, Gucci, Hat)"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            autoComplete="off"
            spellCheck="false"
          />
          {search && (
            <button className="catalog-search-clear" onClick={() => { setSearch(""); setSuggestions([]); }}>✕</button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="catalog-suggestions" ref={suggestRef}>
            {suggestions.map(({ name, label }, i) => (
              <li
                key={i}
                className="catalog-suggestion-item"
                onMouseDown={() => {
                  setSearch(name);
                  setShowSuggestions(false);
                  setSuggestions([]);
                }}
              >
                <span className="suggestion-name">
                  <Highlight text={name} query={search} />
                </span>
                <span className="suggestion-label">{label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Filter bar ── */}
      <div className="catalog-filters-bar">
        <button
          className={`filter-toggle-btn${filtersOpen ? " active" : ""}`}
          onClick={() => setFiltersOpen((v) => !v)}
        >
          ⚙ FILTERS {filtersOpen ? "▲" : "▼"}
        </button>

        <div className="catalog-result-count">
          {loading ? "Loading..." : `${filteredItems.length} item${filteredItems.length !== 1 ? "s" : ""} found`}
        </div>

        {hasActiveFilters && (
          <button className="filter-clear-btn" onClick={clearFilters}>✕ Clear All</button>
        )}
      </div>

      {/* ── Filter panel ── */}
      <div className={`catalog-filter-panel${filtersOpen ? " panel-open" : ""}`}>
        <div className="filter-grid">

          {/* Category / Sheet */}
          <div className="filter-group">
            <label className="filter-label">CATEGORY</label>
            <div className="filter-pills">
              {["ALL", ...SHEETS.map((s) => s.name)].map((sheet) => (
                <button
                  key={sheet}
                  className={`filter-pill${activeSheet === sheet ? " pill-active" : ""}`}
                  onClick={() => { setActiveSheet(sheet); setActiveType("ALL"); setActiveGender("ALL"); }}
                >
                  {sheet === "ALL" ? "All" : SHEETS.find((s) => s.name === sheet)?.label ?? sheet}
                </button>
              ))}
            </div>
          </div>

          {/* Item Type — only show if types exist */}
          {availableTypes.length > 1 && (
            <div className="filter-group">
              <label className="filter-label">ITEM TYPE</label>
              <div className="filter-pills">
                {availableTypes.map((t) => (
                  <button
                    key={t}
                    className={`filter-pill${activeType === t ? " pill-active" : ""}`}
                    onClick={() => setActiveType(t)}
                  >
                    {t === "ALL" ? "All Types" : t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Gender — only show if genders exist */}
          {availableGenders.length > 1 && (
            <div className="filter-group">
              <label className="filter-label">GENDER</label>
              <div className="filter-pills">
                {availableGenders.map((g) => (
                  <button
                    key={g}
                    className={`filter-pill${activeGender === g ? " pill-active" : ""}`}
                    onClick={() => setActiveGender(g)}
                  >
                    {g === "ALL" ? "All" : g}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Featured toggle */}
          <div className="filter-group">
            <label className="filter-label">SPECIAL</label>
            <div className="filter-pills">
              <button
                className={`filter-pill${featuredOnly ? " pill-active" : ""}`}
                onClick={() => setFeaturedOnly((v) => !v)}
              >
                ⭐ Featured Only
              </button>
            </div>
          </div>

          {/* Sort */}
          <div className="filter-group filter-group--sort">
            <label className="filter-label">SORT BY</label>
            <select
              className="filter-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* ── Active filter tags ── */}
      {hasActiveFilters && (
        <div className="active-filters">
          {activeSheet !== "ALL" && (
            <span className="active-tag">
              {SHEETS.find((s) => s.name === activeSheet)?.label}
              <button onClick={() => setActiveSheet("ALL")}>✕</button>
            </span>
          )}
          {activeType !== "ALL" && (
            <span className="active-tag">
              {activeType}
              <button onClick={() => setActiveType("ALL")}>✕</button>
            </span>
          )}
          {activeGender !== "ALL" && (
            <span className="active-tag">
              {activeGender}
              <button onClick={() => setActiveGender("ALL")}>✕</button>
            </span>
          )}
          {featuredOnly && (
            <span className="active-tag">
              ⭐ Featured
              <button onClick={() => setFeaturedOnly(false)}>✕</button>
            </span>
          )}
          {search.trim() && (
            <span className="active-tag">
              "{search}"
              <button onClick={() => setSearch("")}>✕</button>
            </span>
          )}
          {sort !== "default" && (
            <span className="active-tag">
              {SORT_OPTIONS.find((o) => o.value === sort)?.label}
              <button onClick={() => setSort("default")}>✕</button>
            </span>
          )}
        </div>
      )}

      {/* ── Grid ── */}
      <section className="catalog-grid-section">
        {loading && (
          <div className="catalog-status">
            <div className="catalog-loader" />
            <p>Loading inventory...</p>
          </div>
        )}

        {error && (
          <div className="catalog-status catalog-error">
            <p>⚠ Could not load inventory: {error}</p>
            <p className="catalog-error-hint">Make sure the spreadsheet is set to "Anyone with the link can view".</p>
          </div>
        )}

        {!loading && !error && filteredItems.length === 0 && (
          <div className="catalog-status catalog-empty">
            <p className="catalog-empty-title">NO RESULTS FOUND</p>
            <p>Try adjusting your filters or search term.</p>
            <button className="catalog-reset-btn" onClick={clearFilters}>Reset Filters</button>
          </div>
        )}

        {!loading && !error && filteredItems.length > 0 && (
          <div className="catalog-grid">
            {filteredItems.map((item, idx) => (
              <CatalogItemCard
                key={`${item._sheet}-${item["ID"]}-${idx}`}
                item={item}
                query={search}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
