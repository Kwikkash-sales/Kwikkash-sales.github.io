/**
 * Terms.jsx
 *
 * Route: /terms
 *
 * Option A (recommended): Keep terms.md in /public/content/terms.md
 *   → Vite serves it as a static asset, no plugin needed.
 *
 * Option B: Import as raw string with Vite's ?raw suffix
 *   import termsRaw from "@/content/terms.md?raw";
 *   <MarkdownPage raw={termsRaw} title="Terms of Service" />
 */

import MarkdownPage from "@/components/MarkdownConvert/MarkdownPage";

export default function Terms() {
  return (
    <MarkdownPage
      src="/content/terms.md"
      title="Terms of Service"
    />
  );
}
