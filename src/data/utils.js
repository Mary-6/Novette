import brands from './brands';

export function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function brandBySlug(slug) {
  return brands.find((b) => b.slug === slug);
}

export function filterWatches(
  watches,
  { search, brands: bs, priceRange, genders, types, conditions } = {}
) {
  const q = (search || '').trim().toLowerCase();
  return watches.filter((w) => {
    if (q) {
      const brand = brandBySlug(w.brandSlug)?.name || '';
      const haystack = `${brand} ${w.model} ${w.reference}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (bs?.length && !bs.includes(w.brandSlug)) return false;
    if (priceRange) {
      const [min, max] = priceRange;
      if (min != null && w.price < min) return false;
      if (max != null && w.price > max) return false;
    }
    if (genders?.length && !genders.includes(w.gender)) return false;
    if (types?.length && !types.includes(w.type)) return false;
    if (conditions?.length && !conditions.includes(w.condition)) return false;
    return true;
  });
}

export function sortWatches(list, sort = 'popular') {
  const arr = [...list];
  switch (sort) {
    case 'newest':
      return arr.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    case 'price-asc':
      return arr.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return arr.sort((a, b) => b.price - a.price);
    case 'popular':
    default:
      return arr.sort((a, b) => b.popularity - a.popularity);
  }
}

export function getRelated(watches, watch, n = 4) {
  const others = watches.filter((w) => w.id !== watch.id);
  const sameBrand = others.filter((w) => w.brandSlug === watch.brandSlug);
  const sameType = others.filter((w) => w.brandSlug !== watch.brandSlug && w.type === watch.type);
  const rest = others.filter((w) => w.brandSlug !== watch.brandSlug && w.type !== watch.type);
  return [...sameBrand, ...sameType, ...rest]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, n);
}
