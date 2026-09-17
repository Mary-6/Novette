import { useState } from 'react';
import { Link } from 'react-router-dom';
import brands from '../../data/brands';
import collections from '../../data/collections';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  return (
    <footer className="bg-ink text-ivory">
      <div className="container-x py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <p className="heading-display text-2xl">
              Sterling <span className="text-gold">Meridian</span>
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-ivory/50">
              Fine Timepieces · Est. 1987
            </p>
            <p className="mt-5 text-sm leading-relaxed text-ivory/60">
              London & New York. Authenticated pre-owned and new watches, warranted for two years.
            </p>
          </div>
          <div>
            <p className="eyebrow mb-4">Shop</p>
            <ul className="space-y-2.5 text-sm text-ivory/70">
              {collections.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link to={`/collections/${c.slug}`} className="transition hover:text-gold">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-4">Brands</p>
            <ul className="grid grid-cols-1 gap-y-2.5 text-sm text-ivory/70">
              {brands.slice(0, 7).map((b) => (
                <li key={b.slug}>
                  <Link to={`/brands/${b.slug}`} className="transition hover:text-gold">
                    {b.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/brands" className="text-gold transition hover:text-goldLight">
                  View all brands
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-4">Company</p>
            <ul className="space-y-2.5 text-sm text-ivory/70">
              <li>
                <Link to="/about" className="transition hover:text-gold">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition hover:text-gold">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/contact#faq" className="transition hover:text-gold">
                  FAQ
                </Link>
              </li>
            </ul>
            <p className="eyebrow mb-4 mt-8">Support</p>
            <ul className="space-y-2.5 text-sm text-ivory/70">
              <li>
                <Link to="/contact#shipping" className="transition hover:text-gold">
                  Shipping
                </Link>
              </li>
              <li>
                <Link to="/contact#returns" className="transition hover:text-gold">
                  Returns
                </Link>
              </li>
              <li>
                <Link to="/cart" className="transition hover:text-gold">
                  Cart
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-4">Newsletter</p>
            <p className="mb-4 text-sm text-ivory/60">
              New arrivals and private offerings, monthly.
            </p>
            {done ? (
              <p className="text-sm text-gold">Thank you — you are on the list.</p>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email.includes('@')) setDone(true);
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
            <p className="mt-8 text-[10px] uppercase tracking-[0.25em] text-ivory/40">
              Visa · Mastercard · Amex · Bank Wire
            </p>
          </div>
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-graphite pt-8 text-xs text-ivory/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Sterling Meridian Ltd. All rights reserved.</p>
          <p>London · New York</p>
        </div>
      </div>
    </footer>
  );
}
