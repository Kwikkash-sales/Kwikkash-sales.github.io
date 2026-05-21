/**
 * MarkdownPage.jsx
 *
 * A reusable component that fetches a markdown file (from /public or a passed-in
 * raw import) and renders it as HTML using the lightweight `marked` library.
 *
 * Usage:
 *   import MarkdownPage from "@/components/MarkdownPage";
 *
 *   // Option A — pass a public URL string (Vite serves /public as root)
 *   <MarkdownPage src="/content/terms.md" title="Terms of Service" />
 *
 *   // Option B — import the .md file directly (requires vite plugin or ?raw)
 *   import termsRaw from "@/content/terms.md?raw";
 *   <MarkdownPage raw={termsRaw} title="Terms of Service" />
 *
 * Install dependency:
 *   npm install marked
 */

import { useState, useEffect } from "react";
import { marked } from "marked";
import "./markdownpage.css";

// Configure marked for safe, clean output
marked.setOptions({
  gfm: true,        // GitHub Flavored Markdown
  breaks: true,     // \n → <br>
});

export default function MarkdownPage({ src, raw, title }) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If raw markdown string is passed directly, use it immediately
    if (raw) {
      setHtml(marked.parse(raw));
      setLoading(false);
      return;
    }

    // Otherwise fetch from a URL
    if (!src) {
      setError("No markdown source provided.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error(`Could not load ${src} (${res.status})`);
        const text = await res.text();
        if (!cancelled) {
          setHtml(marked.parse(text));
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message);
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [src, raw]);

  return (
    <main className="md-page-main">
      {/* Page header banner */}
      {title && (
        <div className="md-page-header">
          <h1 className="md-page-title">{title}</h1>
        </div>
      )}

      <div className="md-page-body">
        {loading && (
          <div className="md-page-status">
            <div className="md-page-loader" />
            <p>Loading document...</p>
          </div>
        )}

        {error && (
          <div className="md-page-status md-page-error">
            <p>⚠ Could not load document: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <article
            className="md-page-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </main>
  );
}