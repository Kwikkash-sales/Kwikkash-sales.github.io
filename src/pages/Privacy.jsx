/**
 * Privacy.jsx
 *
 * Route: /privacy
 *
 * Option A (recommended): Keep privacy.md in /public/content/privacy.md
 *   → Vite serves it as a static asset, no plugin needed.
 *
 * Option B: Import as raw string with Vite's ?raw suffix
 *   import privacyRaw from "@/content/privacy.md?raw";
 *   <MarkdownPage raw={privacyRaw} title="Privacy Policy" />
 */

import MarkdownPage from "@/components/MarkdownConvert/MarkdownPage";

export default function Privacy() {
  return (
    <MarkdownPage
      src="/content/privacy.md"
      title="Privacy Policy"
    />
  );
}
