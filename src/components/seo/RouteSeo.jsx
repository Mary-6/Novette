import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import brands from '../../data/brands';
import collections from '../../data/collections';
import watches from '../../data/watches';
import pages from '../../data/pages';

const BASE = 'Novette Watches';

export default function RouteSeo() {
  const { pathname } = useLocation();
  useEffect(() => {
    let title = '';
    let description =
      'New and unworn luxury watches, Rolex, Patek Philippe, Audemars Piguet and more, authenticated and shipped fully insured.';
    const parts = pathname.split('/').filter(Boolean);
    if (parts[0] === 'shop') title = 'Shop Watches';
    else if (parts[0] === 'watches' && parts[1]) {
      const w = watches.find((x) => x.slug === parts[1]);
      title = w ? `${w.model} ${w.reference}` : 'Watch';
      if (w)
        description = `${w.model} ${w.reference}, ${w.condition}, ${formatYear(w.year)}, ${w.price ? 'available now at Novette Watches' : ''} with insured overnight shipping.`;
    } else if (parts[0] === 'brands' && parts[1]) {
      const b = brands.find((x) => x.slug === parts[1]);
      title = b ? b.name : 'Brands';
      if (b) description = `Browse new and unworn ${b.name} watches at Novette Watches.`;
    } else if (parts[0] === 'brands') title = 'Brands';
    else if (parts[0] === 'rolex') title = 'Rolex Watches';
    else if (parts[0] === 'collections' && parts[1]) {
      const c = collections.find((x) => x.slug === parts[1]);
      title = c ? c.name : 'Collections';
    } else if (parts[0] === 'collections') title = 'Collections';
    else if (parts[0] === 'journal') title = 'Journal';
    else if (parts[0] === 'cart') title = 'Shopping Bag';
    else if (parts[0] === 'checkout') title = 'Checkout';
    else if (parts[0] === 'wishlist') title = 'Wishlist';
    else if (parts[0] === 'contact') title = 'Contact';
    else if (parts[0] === 'login' || parts[0] === 'signup') title = 'Your Account';
    else if (parts[0] === 'admin') title = 'Admin';
    else {
      const page = pages[parts[0]];
      if (page) title = page.title;
    }
    document.title = title ? `${title}, ${BASE}` : `${BASE}, Fine Timepieces`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description;
  }, [pathname]);
  return null;
}

function formatYear(y) {
  return y >= 2020 ? `${y}` : `ref. year ${y}`;
}
