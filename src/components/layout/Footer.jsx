import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import Logo from '../ui/Logo';
import { api } from '../../lib/api';

const COLUMNS = [
  {
    title: 'About',
    links: [
      ['About Us', '/about-us'],
      ['Trust & Compliance', '/trust-and-compliance'],
      ['Locations', '/locations'],
      ['Journal', '/journal'],
      ['Press', '/journal'],
    ],
  },
  {
    title: 'Buying',
    links: [
      ['Why Buy From Us', '/why-buy-from-us'],
      ['Authenticity Pledge', '/authenticity-pledge'],
      ["Buyer's Protection Plan", '/buyers-protection-plan'],
      ['Payment Methods', '/payment-methods'],
      ['Reviews', '/#reviews'],
    ],
  },
  {
    title: 'Support',
    links: [
      ['FAQ', '/faqs'],
      ['U.S. Shipping', '/shipping-info'],
      ['International Shipping', '/international-shipping'],
      ['Returns', '/return-policy'],
      ['Warranty', '/warranty'],
      ['Contact Us', '/contact-us'],
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  return (
    <footer className="bg-ink text-ivory">
      <div className="container-x py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="eyebrow mb-4">{col.title}</p>
              <ul className="space-y-2.5 text-sm text-ivory/70">
                {col.links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="transition hover:text-gold">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="eyebrow mb-4">Need Help?</p>
            <ul className="space-y-3 text-sm text-ivory/70">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-gold" />
                <a href="tel:+442079460000" className="transition hover:text-gold">
                  +44 20 7946 0000
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-gold" />
                <a href="tel:+12125550148" className="transition hover:text-gold">
                  +1 212 555 0148
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-gold" />
                <a
                  href="mailto:concierge@aurelianwatches.com"
                  className="transition hover:text-gold"
                >
                  concierge@aurelianwatches.com
                </a>
              </li>
              <li className="text-ivory/50">Mon–Sat · 10:00–18:00 local</li>
            </ul>
            <p className="eyebrow mb-3 mt-8">Newsletter</p>
            {done ? (
              <p className="text-sm text-gold">Thank you — you are on the list.</p>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!email.includes('@')) return;
                  try {
                    await api.newsletter(email);
                  } catch {
                    /* offline */
                  }
                  setDone(true);
                }}
                className="flex border border-graphite"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-stone"
                />
                <button
                  type="submit"
                  className="bg-gold px-4 text-xs uppercase tracking-widest text-ink"
                >
                  Join
                </button>
              </form>
            )}
          </div>
          <div>
            <Logo size="lg" />
            <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-ivory/50">
              Fine Timepieces · Est. 1987
            </p>
            <p className="mt-5 text-sm leading-relaxed text-ivory/60">
              Serving clients across the United States, entirely online. New and unworn luxury
              watches, authenticated and warranted for two years.
            </p>
          </div>
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-graphite pt-8 text-xs text-ivory/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Aurelian Watches Ltd. All rights reserved.</p>
          <nav className="flex gap-6">
            <Link to="/privacy-policy" className="transition hover:text-gold">
              Privacy
            </Link>
            <Link to="/terms-and-conditions" className="transition hover:text-gold">
              Terms
            </Link>
            <Link to="/sitemap" className="transition hover:text-gold">
              Sitemap
            </Link>
            <Link to="/accessibility" className="transition hover:text-gold">
              Accessibility
            </Link>
            <Link to="/image-credits" className="transition hover:text-gold">
              Image Credits
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
