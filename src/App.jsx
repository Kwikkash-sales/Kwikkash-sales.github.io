import { Routes, Route } from 'react-router-dom';

import Layout from '@/layout/Layout';

import Home from '@/pages/Home';
import Catalog from '@/pages/Catalog';
import NotFound from '@/pages/NotFound';

import MusicPlayer from "@/components/MusicPlayer/MusicPlayer";

export default function App() {
  return (
    <>
      <MusicPlayer />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}