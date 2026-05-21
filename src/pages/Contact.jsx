import "@/styles/pages/contact.css";
import { useEffect } from "react";

export default function Contact() {
  // Inject Tally embed script once
  useEffect(() => {
    const w = "https://tally.so/widgets/embed.js";
    if (!document.querySelector(`script[src="${w}"]`)) {
      const s = document.createElement("script");
      s.src = w;
      s.onload = s.onerror = () => {
        if (typeof window.Tally !== "undefined") window.Tally.loadEmbeds();
        else
          document
            .querySelectorAll("iframe[data-tally-src]:not([src])")
            .forEach((el) => (el.src = el.dataset.tallySrc));
      };
      document.body.appendChild(s);
    } else if (typeof window.Tally !== "undefined") {
      window.Tally.loadEmbeds();
    }
  }, []);

  return (
    <main className="contact-main">
      <div className="contact-header">
        <h1 className="contact-title">Contact Us</h1>
        <p className="contact-subtitle">
          Questions about an order? Want to collab? Drop us a message below and
          we'll get back to you within 24–48 hours.
        </p>
      </div>

      <div className="contact-form-wrapper">
        <iframe
          data-tally-src="https://tally.so/embed/zxGpWk?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
          loading="lazy"
          width="100%"
          height="655"
          frameBorder="0"
          marginHeight="0"
          marginWidth="0"
          title="KwikKash Inquiry"
        />
      </div>
    </main>
  );
}