import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, Heart, MapPin, Menu, Phone, Search, ShoppingBag, X } from 'lucide-react';
import brands from '../../data/brands';
import collections from '../../data/collections';
import rolexFamilies from '../../data/rolexFamilies';
import watches from '../../data/watches';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import WatchImage from '../watch/WatchImage';

const RESOURCES = [
  { label: 'Journal', to: '/journal' },
  { label: 'Buying Guide', to: '/buying-guide' },
  { label: 'Authenticity Pledge', to: '/authenticity-pledge' },
  { label: "Buyer's Protection Plan", to: '/buyers-protection-plan' },
  { label: 'Watch Care', to: '/watch-care' },
  { label: 'FAQ', to: '/faqs' },
];

export default function Header() {
  const [drawer, setDrawer] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const [q, setQ] = useState('');
  const { count } = useCart();
  const wishlist = useWishlist();
  const navigate = useNavigate();
  const featuredRolex = watches.find((w) => w.slug === 'rolex-submariner-date-126610ln');

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/shop?q=${encodeURIComponent(q.trim())}`);
    setDrawer(false);
  };

  const linkCls = ({ isActive }) =>
    `text-xs uppercase tracking-[0.18em] transition hover:text-gold ${isActive ? 'text-gold' : ''}`;

  const searchInput = (
    <form
      onSubmit={submit}
      className="flex items-center gap-2 rounded-full border border-graphite bg-charcoal px-4 py-2"
    >
      <Search size={15} className="shrink-0 text-stone" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by brand or model"
        className="w-full min-w-0 bg-transparent text-sm text-ivory outline-none placeholder:text-stone"
      />
    </form>
  );

  return (
    <header className="sticky top-0 z-50 bg-ink text-ivory">
      <div className="border-b border-graphite bg-charcoal">
        <div className="container-x flex h-8 items-center justify-between text-[10px] uppercase tracking-[0.22em] text-ivory/60">
          <p className="truncate">
            Trusted by 25,000+ Clients · Free Overnight Shipping · 100% Certified Authentic
          </p>
          <nav className="hidden items-center gap-5 sm:flex">
            <Link to="/contact-us" className="transition hover:text-gold">
              Contact Us
            </Link>
            <Link to="/locations" className="flex items-center gap-1 transition hover:text-gold">
              <MapPin size={10} /> Locations
            </Link>
            <Link to="/signup" className="transition hover:text-gold">
              Sign Up
            </Link>
            <Link to="/login" className="transition hover:text-gold">
              Login
            </Link>
          </nav>
        </div>
      </div>
      <div className="container-x flex h-16 items-center gap-6">
        <button
          className="lg:hidden"
          onClick={() => setDrawer(true)}
          aria-label="Open menu"
          type="button"
        >
          <Menu size={22} />
        </button>
        <Link to="/" className="flex shrink-0 items-baseline gap-2">
          <span className="heading-display text-xl tracking-wide sm:text-2xl">
            Aurelian <span className="text-gold">Watches</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 lg:flex">
          <div className="group relative">
            <NavLink to="/rolex" className={linkCls}>
              Rolex
            </NavLink>
            <div className="invisible absolute left-0 top-full z-50 mt-4 w-[560px] bg-charcoal p-6 opacity-0 shadow-2xl transition group-hover:visible group-hover:opacity-100">
              <div className="grid grid-cols-[1fr_1fr_150px] gap-6">
                <div>
                  <p className="eyebrow mb-3">Model Families</p>
                  <div className="grid grid-cols-1 gap-2">
                    {rolexFamilies.map((f) => (
                      <Link
                        key={f.slug}
                        to={`/rolex/${f.slug}`}
                        className="text-sm text-ivory/80 transition hover:text-gold"
                      >
                        {f.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="eyebrow mb-3">Shop Rolex</p>
                  <div className="flex flex-col gap-2 text-sm text-ivory/80">
                    <Link to="/shop?brand=rolex&gender=Men" className="transition hover:text-gold">
                      Shop Men's Rolex
                    </Link>
                    <Link
                      to="/shop?brand=rolex&gender=Women"
                      className="transition hover:text-gold"
                    >
                      Shop Women's Rolex
                    </Link>
                    <Link
                      to="/shop?brand=rolex&decade=1960s,1970s,1980s,1990s,2000s"
                      className="transition hover:text-gold"
                    >
                      Shop Heritage Rolex
                    </Link>
                    <Link to="/rolex" className="mt-2 text-gold transition hover:text-goldLight">
                      View All Rolex
                    </Link>
                  </div>
                </div>
                {featuredRolex && (
                  <Link to={`/watches/${featuredRolex.slug}`} className="block">
                    <WatchImage watch={featuredRolex} className="w-full" />
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="group relative">
            <NavLink to="/shop" className={linkCls}>
              Luxury Watches
            </NavLink>
            <div className="invisible absolute left-0 top-full z-50 mt-4 w-[560px] bg-charcoal p-6 opacity-0 shadow-2xl transition group-hover:visible group-hover:opacity-100">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="eyebrow mb-3">Brands</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {brands.map((b) => (
                      <Link
                        key={b.slug}
                        to={`/brands/${b.slug}`}
                        className="text-sm text-ivory/80 transition hover:text-gold"
                      >
                        {b.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="eyebrow mb-3">Collections</p>
                  <div className="flex flex-col gap-2">
                    {collections.map((c) => (
                      <Link
                        key={c.slug}
                        to={`/collections/${c.slug}`}
                        className="text-sm text-ivory/80 transition hover:text-gold"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <NavLink to="/shop?sort=newest" className={linkCls}>
            New Arrivals
          </NavLink>
          <div className="group relative">
            <span
              className={`flex cursor-default items-center gap-1 text-xs uppercase tracking-[0.18em] transition group-hover:text-gold`}
            >
              Resources <ChevronDown size={12} />
            </span>
            <div className="invisible absolute left-0 top-full z-50 mt-4 w-56 bg-charcoal p-5 opacity-0 shadow-2xl transition group-hover:visible group-hover:opacity-100">
              <div className="flex flex-col gap-3">
                {RESOURCES.map((r) => (
                  <Link
                    key={r.to}
                    to={r.to}
                    className="text-sm text-ivory/80 transition hover:text-gold"
                  >
                    {r.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>
        <div className="ml-auto hidden w-56 lg:block">{searchInput}</div>
        <div className="flex items-center gap-4">
          <a
            href="tel:+442079460000"
            aria-label="Call us"
            className="hidden transition hover:text-gold sm:block"
          >
            <Phone size={18} />
          </a>
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative transition hover:text-gold"
          >
            <Heart size={18} />
            {wishlist.count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-semibold text-ink">
                {wishlist.count}
              </span>
            )}
          </Link>
          <Link to="/cart" aria-label="Cart" className="relative transition hover:text-gold">
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-semibold text-ink">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/70" onClick={() => setDrawer(false)} />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-charcoal p-6">
            <div className="mb-6 flex items-center justify-between">
              <span className="heading-display text-lg">
                Aurelian <span className="text-gold">Watches</span>
              </span>
              <button onClick={() => setDrawer(false)} aria-label="Close menu" type="button">
                <X size={20} />
              </button>
            </div>
            <div className="mb-6">{searchInput}</div>
            {[
              {
                label: 'Shop',
                links: [
                  { label: 'All Watches', to: '/shop' },
                  ...collections.map((c) => ({ label: c.name, to: `/collections/${c.slug}` })),
                ],
              },
              {
                label: 'Rolex',
                links: [
                  { label: 'All Rolex', to: '/rolex' },
                  ...rolexFamilies.map((f) => ({ label: f.name, to: `/rolex/${f.slug}` })),
                ],
              },
              {
                label: 'Brands',
                links: [
                  { label: 'All Brands', to: '/brands' },
                  ...brands.map((b) => ({ label: b.name, to: `/brands/${b.slug}` })),
                ],
              },
              { label: 'Resources', links: RESOURCES },
            ].map((g) => (
              <div key={g.label} className="border-b border-graphite">
                <button
                  type="button"
                  className="flex w-full items-center justify-between py-4 text-sm uppercase tracking-[0.2em]"
                  onClick={() => setOpenGroup(openGroup === g.label ? null : g.label)}
                >
                  {g.label}
                  <ChevronDown
                    size={16}
                    className={`transition ${openGroup === g.label ? 'rotate-180' : ''}`}
                  />
                </button>
                {openGroup === g.label && (
                  <div className="flex flex-col gap-3 pb-4 text-sm text-ivory/75">
                    {g.links.map((l) => (
                      <Link key={l.to} to={l.to} onClick={() => setDrawer(false)}>
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="mt-6 flex flex-col gap-3 text-sm uppercase tracking-[0.2em]">
              <Link to="/shop?sort=newest" onClick={() => setDrawer(false)}>
                New Arrivals
              </Link>
              <Link to="/wishlist" onClick={() => setDrawer(false)}>
                Wishlist
              </Link>
              <Link to="/cart" onClick={() => setDrawer(false)}>
                Cart
              </Link>
              <Link to="/contact-us" onClick={() => setDrawer(false)}>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
