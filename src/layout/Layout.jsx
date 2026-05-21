import { Outlet, Link } from 'react-router-dom';

// Components
import Nav from '@/components/Navigation/Nav';
import Footer from '@/components/Footer/Footer';

export default function Layout() {
  return (
    <>
      <Nav />

      <main>
        <Outlet />
      </main>

      <Footer />
    </>
  );
}