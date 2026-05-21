import { Routes, Route } from 'react-router-dom';

import Layout from '@/layout/Layout';

import Home from '@/pages/Home';
import Catalog from '@/pages/Catalog';
import Contact from '@/pages/Contact';
import NotFound from '@/pages/NotFound';
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";

import MusicPlayer from "@/components/MusicPlayer/MusicPlayer";

// Global retro overlay — sits on top of every page, pointer-events: none
// so it never blocks clicks. Two layers:
//   1. scanlines  — horizontal lines faking a CRT raster
//   2. vignette   — darkened edges like an old monitor
function RetroOverlay() {
  return (
    <div aria-hidden="true" style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      pointerEvents: "none",
    }}>
      {/* Scanlines */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `repeating-linear-gradient(
          to bottom,
          transparent 0px,
          transparent 3px,
          rgba(0, 0, 0, 0.18) 3px,
          rgba(0, 0, 0, 0.06) 4px
        )`,
      }} />
      {/* Vignette */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(
          ellipse at center,
          transparent 60%,
          rgba(0, 0, 0, 0.21) 100%
        )`,
      }} />
    </div>
  );
}

export default function App() {
  return (
    <>
      <RetroOverlay />
      <MusicPlayer />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="contact" element={<Contact />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}