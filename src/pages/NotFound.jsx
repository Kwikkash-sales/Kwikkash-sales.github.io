// Base imports
import { Link } from 'react-router';

// CSS
import "@/styles/pages/notfound.css";

export default function NotFound() {
  return (
    <main className="nf-main">

      {/* Marquee tape strip */}
      <div className="nf-marquee-wrap" aria-hidden="true">
        <div className="nf-marquee-track">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="nf-marquee-item">
              ⚠ PAGE NOT FOUND &nbsp;★&nbsp; ERROR 404 &nbsp;★&nbsp;
            </span>
          ))}
        </div>
      </div>

      <section className="nf-body">

        {/* Big glitchy 404 */}
        <div className="nf-code-wrap" aria-label="404">
          <span className="nf-code-shadow" aria-hidden="true">404</span>
          <span className="nf-code">404</span>
        </div>

        {/* Receipt-style error card */}
        <div className="nf-receipt">
          <div className="nf-receipt-header">
            <p className="nf-receipt-store">★ KWIK KASH CLOTHING ★</p>
            <p className="nf-receipt-sub">ERROR RECEIPT</p>
            <div className="nf-dashes" aria-hidden="true">- - - - - - - - - - - - - - - - - - - -</div>
          </div>

          <table className="nf-receipt-table">
            <tbody>
              <tr>
                <td className="nf-rt-label">ITEM REQUESTED</td>
                <td className="nf-rt-value">Unknown Page</td>
              </tr>
              <tr>
                <td className="nf-rt-label">STATUS</td>
                <td className="nf-rt-value nf-rt-error">NOT FOUND</td>
              </tr>
              <tr>
                <td className="nf-rt-label">ERROR CODE</td>
                <td className="nf-rt-value">404</td>
              </tr>
              <tr>
                <td className="nf-rt-label">CASHIER</td>
                <td className="nf-rt-value">Kwik Kash Bot™</td>
              </tr>
            </tbody>
          </table>

          <div className="nf-dashes" aria-hidden="true">- - - - - - - - - - - - - - - - - - - -</div>

          <p className="nf-receipt-msg">
            Yo, looks like that page got jacked. It ain't in our inventory, never was, or got moved. Check the URL or head back to the store.
          </p>

          <div className="nf-dashes" aria-hidden="true">- - - - - - - - - - - - - - - - - - - -</div>

          <div className="nf-receipt-actions">
            <Link to="/" className="nf-btn nf-btn--primary">⬅ BACK TO STORE</Link>
            <Link to="/catalog" className="nf-btn nf-btn--secondary">📦 VIEW CATALOG</Link>
          </div>

          <p className="nf-receipt-footer">
            NO REFUNDS &nbsp;·&nbsp; NO EXCHANGES &nbsp;·&nbsp; FINAL SALE
          </p>

          {/* Barcode decoration */}
          <div className="nf-barcode" aria-hidden="true">
            {Array.from({ length: 38 }).map((_, i) => (
              <span
                key={i}
                className="nf-bar"
                style={{ width: `${[1, 2, 1, 3, 1, 2, 1, 1, 3, 2][i % 10]}px` }}
              />
            ))}
          </div>
          <p className="nf-barcode-num">0000-0000-404</p>
        </div>

      </section>

      {/* Bottom marquee */}
      <div className="nf-marquee-wrap nf-marquee-wrap--bottom" aria-hidden="true">
        <div className="nf-marquee-track nf-marquee-track--rtl">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="nf-marquee-item">
              COME BACK SOON &nbsp;★&nbsp; CHECK THE CATALOG &nbsp;★&nbsp; KWIK KASH &nbsp;★&nbsp;
            </span>
          ))}
        </div>
      </div>

    </main>
  );
}