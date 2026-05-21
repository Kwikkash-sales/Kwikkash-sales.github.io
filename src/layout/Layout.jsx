import { Outlet, Link } from 'react-router-dom';

// Components
import Nav from '@/components/Navigation/Nav';

export default function Layout() {
  return (
    <>
      <Nav />

      <main>
        <Outlet />
      </main>
    </>
  );
}