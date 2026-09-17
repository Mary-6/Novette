import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import brands from '../../data/brands';
import collections from '../../data/collections';
import { useCart } from '../../context/CartContext';

export default function Header() {
  const [drawer, setDrawer] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');
  const { count } = useCart();
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/shop?q=${encodeURIComponent(q.trim())}`);
    setSearchOpen(false);
    setDrawer(false);
  };

  const linkCls = ({ isActive }) =>
    `text-xs uppercase tracking-[0.2em] transition hover:text-gold ${isActive ? 'text-gold' : ''}`;

  return (
    <header className="sticky top-0 z-50 bg-ink text-ivory">
      <div className="bg-charcoal py-2 text-center text-[10px] uppercase tracking-[0.25em] text-ivory/70">
        Complimentary insured shipping · 2-year warranty · Authenticated by our master watchmakers
      </div>
      <div className="container-x flex h-16 items-center justify-between">
        <button
          className="lg:hidden"
          onClick={() => setDrawer(true)}
          aria-label="Open menu"
          type="button"
        >
          <Menu size={22} />
        </button>
        <Link to="/" className="flex items-baseline gap-2">
          <span className="heading-display text-xl tracking-wide sm:text-2xl">
            Sterling <span className="text-gold">Meridian</span>
          </span>
          <span className="hidden text-[9px] uppercase tracking-[0.3em] text-ivory/50 md:block">
            Est. 1987
          </span>
        </Link>
        <nav className="hidden items-center gap-8 lg:flex">
          <NavLink to="/shop" className={linkCls}>
            Shop
          </NavLink>
          <div className="group relative">
            <NavLink to="/brands" className={linkCls}>
              Brands
            </NavLink>
            <div className="invisible absolute left-1/2 top-full z-50 mt-4 w-[540px] -translate-x-1/2 bg-charcoal p-6 opacity-0 shadow-2xl transition group-hover:visible group-hover:opacity-100">
              <div className="grid grid-cols-3 gap-x-6 gap-y-3">
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
          </div>
          <div className="group relative">
            <NavLink to="/collections" className={linkCls}>
              Collections
            </NavLink>
            <div className="invisible absolute left-1/2 top-full z-50 mt-4 w-56 -translate-x-1/2 bg-charcoal p-5 opacity-0 shadow-2xl transition group-hover:visible group-hover:opacity-100">
              <div className="flex flex-col gap-3">
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
          <NavLink to="/about" className={linkCls}>
            About
          </NavLink>
          <NavLink to="/contact" className={linkCls}>
            Contact
          </NavLink>
        </nav>
        <div className="flex items-center gap-5">
          <button
            onClick={() => setSearchOpen((o) => !o)}
            aria-label="Search"
            type="button"
            className="transition hover:text-gold"
          >
            <Search size={19} />
          </button>
          <Link to="/cart" aria-label="Cart" className="relative transition hover:text-gold">
            <ShoppingBag size={19} />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-semibold text-ink">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
      {searchOpen && (
        <form onSubmit={submit} className="border-t border-graphite bg-charcoal py-3">
          <div className="container-x flex items-center gap-3">
            <Search size={16} className="text-stone" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search brand, model or reference…"
              className="w-full bg-transparent text-sm text-ivory outline-none placeholder:text-stone"
            />
          </div>
        </form>
      )}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/70" onClick={() => setDrawer(false)} />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-charcoal p-6">
            <div className="mb-8 flex items-center justify-between">
              <span className="heading-display text-lg">
                Sterling <span className="text-gold">Meridian</span>
              </span>
              <button onClick={() => setDrawer(false)} aria-label="Close menu" type="button">
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={submit}
              className="mb-6 flex items-center gap-2 border-b border-graphite pb-3"
            >
              <Search size={16} className="text-stone" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search watches…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-stone"
              />
            </form>
            <nav className="flex flex-col gap-4 text-sm uppercase tracking-[0.2em]">
              <Link to="/shop" onClick={() => setDrawer(false)}>
                Shop
              </Link>
              <Link to="/brands" onClick={() => setDrawer(false)}>
                Brands
              </Link>
              <Link to="/collections" onClick={() => setDrawer(false)}>
                Collections
              </Link>
              <Link to="/about" onClick={() => setDrawer(false)}>
                About
              </Link>
              <Link to="/contact" onClick={() => setDrawer(false)}>
                Contact
              </Link>
              <Link to="/cart" onClick={() => setDrawer(false)}>
                Cart
              </Link>
            </nav>
            <p className="eyebrow mb-3 mt-8">Brands</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-ivory/75">
              {brands.map((b) => (
                <Link key={b.slug} to={`/brands/${b.slug}`} onClick={() => setDrawer(false)}>
                  {b.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
