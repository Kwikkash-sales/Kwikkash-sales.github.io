// Base imports
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

// CSS
import "@/styles/pages/home.css";

const SHEET_ID = "1WPuz9RuVq32_vRJV3ti2EjPLCnlwDltrDqGXyIlKVV0";

const SHEETS = [
  { name: "Clothing-list", label: "Clothing" },
  { name: "Pins-list",     label: "Pins"     },
  { name: "Cars-list",     label: "Cars"     },
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

// Stock only exists on Clothing-list and Pins-list
// Returns: number | null (null = sheet has no stock column)
function parseStock(row) {
  // Cars-list has no Stock column — treat as always available (null = no badge shown)
  if (row._sheet === "Cars-list") return null;

  const raw = (row["Stock"] ?? "").toString().trim();
  if (raw === "") return null;
  const lower = raw.toLowerCase();
  if (lower === "true")  return 99;
  if (lower === "false") return 0;
  const num = parseInt(raw, 10);
  return isNaN(num) ? null : num;
}

// Parse date added for sorting
function parseDateAdded(row) {
  const raw = (row["Date Added"] ?? "").toString().trim();
  if (!raw) return 0;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

// ── Highlight matching text ────────────────────────────────────────────────────
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

// ── Stock badge ────────────────────────────────────────────────────────────────
function StockBadge({ stock }) {
  if (stock === null || stock === 0) return null;
  if (stock === 1) return <p className="catalog-card-stock catalog-card-stock--low">● {stock} LEFT</p>;
  return <p className="catalog-card-stock catalog-card-stock--in">● {stock} IN STOCK</p>;
}

// ── Hashtag pills — sheet-aware ────────────────────────────────────────────────
// Clothing: sheet label + Type + Gender
// Pins:     sheet label only
// Cars:     sheet label only
function HashtagPills({ item }) {
  const tags = [];
  const label = (item._label ?? "").trim();

  // Always show the sheet category
  if (label) tags.push(label);

  // Clothing-specific extras
  if (item._sheet === "Clothing-list") {
    const type   = (item["Type"]   ?? "").trim();
    const gender = (item["Gender"] ?? "").trim();
    if (type   && type   !== "-") tags.push(type);
    if (gender && gender !== "-") tags.push(gender);
  }

  if (tags.length === 0) return null;
  return (
    <div className="catalog-card-tags">
      {tags.map((t, i) => (
        <span key={i} className="catalog-card-tag">#{t}</span>
      ))}
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────
function ItemModal({ item, onClose }) {
  const stock    = parseStock(item);
  const price    = formatPrice(item["Price"]);
  const picture  = (item["Image"] ?? "").trim();
  const name     = item["Item Name"] || "Unknown Item";
  const wlOwner  = (item["WL Owner"] ?? "").trim();
  const dateAdded = (item["Date Added"] ?? "").trim();
  const featured  = isFeatured(item);
  const soldOut   = stock === 0;

  // Clothing extras for modal tags
  const type   = item._sheet === "Clothing-list" ? (item["Type"]   ?? "").trim() : "";
  const gender = item._sheet === "Clothing-list" ? (item["Gender"] ?? "").trim() : "";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  function openImageInNewTab() {
    if (picture) window.open(picture, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-card">
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        {featured && <div className="modal-featured-banner">⭐ FEATURED</div>}

        {/* Image */}
        <div className={`modal-image-wrap${soldOut ? " modal-image-wrap--soldout" : ""}`}>
          {picture ? (
            <>
              <img
                src={picture}
                alt={name}
                className="modal-image"
                onClick={openImageInNewTab}
                title="Click to open full image"
              />
              <button className="modal-image-expand" onClick={openImageInNewTab} aria-label="Open image">
                ⤢ OPEN IMAGE
              </button>
            </>
          ) : (
            <div className="catalog-card-placeholder"><span>NO IMG</span></div>
          )}
          {soldOut && (
            <div className="modal-soldout-overlay">
              <span className="modal-soldout-text">SOLD OUT</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="modal-body">
          <h2 className="modal-name">{name}</h2>
          <p className="modal-price">{price}</p>

          {/* Hashtags */}
          <div className="modal-tags">
            {item._label && <span className="catalog-card-tag">#{item._label}</span>}
            {type   && type   !== "-" && <span className="catalog-card-tag">#{type}</span>}
            {gender && gender !== "-" && <span className="catalog-card-tag">#{gender}</span>}
          </div>

          {/* Stock */}
          <div className="modal-stock-row">
            {stock === null ? null : stock === 0 ? (
              <span className="modal-stock modal-stock--out">OUT OF STOCK</span>
            ) : stock === 1 ? (
              <span className="modal-stock modal-stock--low">● {stock} LEFT — ACT FAST</span>
            ) : (
              <span className="modal-stock modal-stock--in">● {stock} IN STOCK</span>
            )}
          </div>

          {/* WL Owner */}
          {wlOwner && (
            <div className="modal-meta-row">
              <span className="modal-meta-label">WL OWNER</span>
              <span className="modal-meta-value">{wlOwner}</span>
            </div>
          )}

          {/* Date Added */}
          {dateAdded && (
            <div className="modal-meta-row">
              <span className="modal-meta-label">DATE ADDED</span>
              <span className="modal-meta-value">{dateAdded}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────────
function CatalogItemCard({ item, query, onClick }) {
  const name     = item["Item Name"] || "Unknown Item";
  const price    = formatPrice(item["Price"]);
  const picture  = (item["Image"] ?? "").trim();
  const featured = isFeatured(item);
  const stock    = parseStock(item);
  const soldOut  = stock === 0;

  return (
    <article
      className={`catalog-card${featured ? " catalog-card--featured" : ""}${soldOut ? " catalog-card--soldout" : ""}`}
      onClick={() => onClick(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(item); }}
    >
      {/* Sold-out overlay */}
      {soldOut && (
        <div className="card-soldout-overlay">
          <span className="card-soldout-text">SOLD OUT</span>
        </div>
      )}

      {featured && <div className="catalog-card-star">⭐ FEATURED</div>}

      {/* 1. Image */}
      <div className="catalog-card-image">
        {picture ? (
          <img src={picture} alt={name} loading="lazy" />
        ) : (
          <div className="catalog-card-placeholder"><span>NO IMG</span></div>
        )}
      </div>

      <div className="catalog-card-body">
        {/* 2. Title */}
        <h3 className="catalog-card-name">
          <Highlight text={name} query={query} />
        </h3>

        {/* 3. Price */}
        <p className="catalog-card-price">{price}</p>

        {/* 4. Hashtags */}
        <HashtagPills item={item} />

        {/* 5. Stock */}
        {!soldOut && <StockBadge stock={stock} />}
      </div>
    </article>
  );
}

// ── Sort ───────────────────────────────────────────────────────────────────────
// Featured first → date desc → sold out always last
function sortItems(items, sortMode) {
  const soldOut = items.filter((i) => parseStock(i) === 0);
  const active  = items.filter((i) => parseStock(i) !== 0);

  function applySort(arr) {
    const sorted = [...arr];
    if (sortMode === "price-asc") {
      sorted.sort((a, b) => parsePrice(a["Price"]) - parsePrice(b["Price"]));
    } else if (sortMode === "price-desc") {
      sorted.sort((a, b) => parsePrice(b["Price"]) - parsePrice(a["Price"]));
    } else if (sortMode === "name-asc") {
      sorted.sort((a, b) => (a["Item Name"] || "").localeCompare(b["Item Name"] || ""));
    } else if (sortMode === "name-desc") {
      sorted.sort((a, b) => (b["Item Name"] || "").localeCompare(a["Item Name"] || ""));
    } else {
      // Default: featured first, then most recently added
      sorted.sort((a, b) => {
        const af = isFeatured(a) ? 1 : 0;
        const bf = isFeatured(b) ? 1 : 0;
        if (bf !== af) return bf - af;
        return parseDateAdded(b) - parseDateAdded(a);
      });
    }
    return sorted;
  }

  return [...applySort(active), ...applySort(soldOut)];
}

const SORT_OPTIONS = [
  { value: "default",    label: "Default Order"        },
  { value: "price-asc",  label: "Price: Low → High"    },
  { value: "price-desc", label: "Price: High → Low"    },
  { value: "name-asc",   label: "Name: A → Z"          },
  { value: "name-desc",  label: "Name: Z → A"          },
];

// Clothing item types (only relevant for Clothing-list)
const CLOTHING_TYPES = [
  "Hat","Glasses","Shoulder Slot","Primary Accessory","Secondary Accessory",
  "Inventory Accessory","Rings","Watch","Outfit","Shirt","Pants","Shoes",
  "Pin","Cassette",
];

// ── Main export ────────────────────────────────────────────────────────────────
export default function Catalog() {
  const [searchParams] = useSearchParams();
  const [allItems,     setAllItems]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Filters
  const [search,       setSearch]       = useState(searchParams.get("search")  || "");
  const [suggestions,  setSuggestions]  = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSheet,  setActiveSheet]  = useState(searchParams.get("sheet")   || "ALL");
  const [activeType,   setActiveType]   = useState(searchParams.get("type")    || "ALL");
  const [activeGender, setActiveGender] = useState(searchParams.get("gender")  || "ALL");
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get("featured") === "true");
  const [sort,         setSort]         = useState(searchParams.get("sort")    || "default");
  const [filtersOpen,  setFiltersOpen]  = useState(
    !!(searchParams.get("sheet") || searchParams.get("type") || searchParams.get("gender"))
  );

  const searchRef  = useRef(null);
  const suggestRef = useRef(null);

  // ── Fetch all sheets ─────────────────────────────────────────────────────────
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

  // ── Derived filter options ───────────────────────────────────────────────────
  // Item Type filter: only meaningful for Clothing-list
  const availableTypes = useMemo(() => {
    const clothingItems = allItems.filter((i) => i._sheet === "Clothing-list");
    const present = new Set(
      clothingItems.map((i) => i["Type"]).filter((t) => t && t !== "-" && t !== "")
    );
    return ["ALL", ...CLOTHING_TYPES.filter((t) => present.has(t))];
  }, [allItems]);

  // Gender filter: only meaningful for Clothing-list
  const availableGenders = useMemo(() => {
    const genders = new Set();
    allItems
      .filter((i) => i._sheet === "Clothing-list")
      .forEach((i) => {
        const g = i["Gender"];
        if (g && g !== "-" && g !== "") genders.add(g);
      });
    return ["ALL", ...Array.from(genders).sort()];
  }, [allItems]);

  // Show type/gender filters only when Clothing is selected (or ALL)
  const showTypeFilter   = activeSheet === "ALL" || activeSheet === "Clothing-list";
  const showGenderFilter = activeSheet === "ALL" || activeSheet === "Clothing-list";

  // ── Search suggestions ───────────────────────────────────────────────────────
  useEffect(() => {
    if (search.trim().length < 2) { setSuggestions([]); return; }
    const q = search.toLowerCase();
    const matches = allItems
      .filter((item) => (item["Item Name"] || "").toLowerCase().includes(q))
      .slice(0, 8)
      .map((item) => ({ name: item["Item Name"], label: item._label }));
    const seen = new Set();
    setSuggestions(matches.filter(({ name }) => {
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    }));
  }, [search, allItems]);

  // Close suggestions on outside click
  useEffect(() => {
    function handle(e) {
      if (
        suggestRef.current && !suggestRef.current.contains(e.target) &&
        searchRef.current  && !searchRef.current.contains(e.target)
      ) setShowSuggestions(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // ── Filtered + sorted items ──────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    let items = allItems;

    if (activeSheet !== "ALL") items = items.filter((i) => i._sheet === activeSheet);

    // Type & gender filters only apply to Clothing-list rows
    if (activeType !== "ALL") {
      items = items.filter((i) => i._sheet !== "Clothing-list" || i["Type"] === activeType);
    }
    if (activeGender !== "ALL") {
      items = items.filter((i) => i._sheet !== "Clothing-list" || i["Gender"] === activeGender);
    }

    if (featuredOnly) items = items.filter((i) => isFeatured(i));

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((i) => (i["Item Name"] || "").toLowerCase().includes(q));
    }

    return sortItems(items, sort);
  }, [allItems, activeSheet, activeType, activeGender, featuredOnly, search, sort]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function clearFilters() {
    setSearch(""); setActiveSheet("ALL"); setActiveType("ALL");
    setActiveGender("ALL"); setFeaturedOnly(false); setSort("default");
  }

  const hasActiveFilters =
    activeSheet !== "ALL" || activeType !== "ALL" || activeGender !== "ALL" ||
    featuredOnly || search.trim() || sort !== "default";

  const handleCardClick  = useCallback((item) => setSelectedItem(item), []);
  const handleModalClose = useCallback(() => setSelectedItem(null), []);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <main className="catalog-main">

      {selectedItem && <ItemModal item={selectedItem} onClose={handleModalClose} />}

      {/* ── Search ── */}
      <div className="catalog-search-wrapper">
        <div className="catalog-search-box">
          <span className="catalog-search-icon">🔍</span>
          <input
            ref={searchRef}
            className="catalog-search-input"
            type="text"
            placeholder="Search items..."
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

        {showSuggestions && suggestions.length > 0 && (
          <ul className="catalog-suggestions" ref={suggestRef}>
            {suggestions.map(({ name, label }, i) => (
              <li
                key={i}
                className="catalog-suggestion-item"
                onMouseDown={() => { setSearch(name); setShowSuggestions(false); setSuggestions([]); }}
              >
                <span className="suggestion-name"><Highlight text={name} query={search} /></span>
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

          {/* Category tabs */}
          <div className="filter-group">
            <label className="filter-label">CATEGORY</label>
            <div className="filter-pills">
              {["ALL", ...SHEETS.map((s) => s.name)].map((sheet) => (
                <button
                  key={sheet}
                  className={`filter-pill${activeSheet === sheet ? " pill-active" : ""}`}
                  onClick={() => {
                    setActiveSheet(sheet);
                    setActiveType("ALL");
                    setActiveGender("ALL");
                  }}
                >
                  {sheet === "ALL" ? "All" : SHEETS.find((s) => s.name === sheet)?.label ?? sheet}
                </button>
              ))}
            </div>
          </div>

          {/* Item Type — Clothing only */}
          {showTypeFilter && availableTypes.length > 1 && (
            <div className="filter-group">
              <label className="filter-label">TYPE</label>
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

          {/* Gender — Clothing only */}
          {showGenderFilter && availableGenders.length > 1 && (
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
            <select className="filter-select" value={sort} onChange={(e) => setSort(e.target.value)}>
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
            <span className="active-tag">{activeType}<button onClick={() => setActiveType("ALL")}>✕</button></span>
          )}
          {activeGender !== "ALL" && (
            <span className="active-tag">{activeGender}<button onClick={() => setActiveGender("ALL")}>✕</button></span>
          )}
          {featuredOnly && (
            <span className="active-tag">⭐ Featured<button onClick={() => setFeaturedOnly(false)}>✕</button></span>
          )}
          {search.trim() && (
            <span className="active-tag">"{search}"<button onClick={() => setSearch("")}>✕</button></span>
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
                onClick={handleCardClick}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}