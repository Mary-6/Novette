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

const FACET_FIELDS = {
  brands: 'brandSlug',
  families: 'family',
  references: 'reference',
  sizes: 'sizeMm',
  materials: 'material',
  dials: 'dialColor',
  decades: 'decade',
  boxPapers: 'boxPapers',
  conditions: 'condition',
  bandTypes: 'bandType',
  bandMaterials: 'bandMaterial',
  nicknames: 'nickname',
  bezels: 'bezelType',
  functions: 'functions',
  markers: 'hourMarkers',
  warranty: 'warrantyActive',
  genders: 'gender',
  types: 'type',
};

function facetLabel(field, v) {
  if (field === 'sizeMm') return `${v}mm`;
  if (field === 'warrantyActive') return v ? 'Yes' : 'No';
  return String(v);
}

export function watchFacetValues(list) {
  const map = {};
  for (const [key, field] of Object.entries(FACET_FIELDS)) {
    const counts = new Map();
    for (const w of list) {
      const v = w[field];
      if (v == null) continue;
      const vals = Array.isArray(v) ? v : [v];
      for (const val of vals) {
        const label = facetLabel(field, val);
        counts.set(label, (counts.get(label) || 0) + 1);
      }
    }
    map[key] = [...counts.entries()].map(([label, count]) => ({ label, count }));
  }
  return map;
}

export function filterWatches(watches, { search, priceRange, ...facets } = {}) {
  const q = (search || '').trim().toLowerCase();
  return watches.filter((w) => {
    if (q) {
      const brand = brandBySlug(w.brandSlug)?.name || '';
      const haystack =
        `${brand} ${w.model} ${w.reference} ${w.family} ${w.nickname || ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (priceRange) {
      const [min, max] = priceRange;
      if (min != null && w.price < min) return false;
      if (max != null && w.price > max) return false;
    }
    for (const [key, field] of Object.entries(FACET_FIELDS)) {
      const selected = facets[key];
      if (!selected?.length) continue;
      const v = w[field];
      if (v == null) return false;
      const vals = (Array.isArray(v) ? v : [v]).map((val) => facetLabel(field, val));
      if (!selected.some((s) => vals.includes(s))) return false;
    }
    return true;
  });
}

export function sortWatches(list, sort = 'featured') {
  const arr = [...list];
  switch (sort) {
    case 'newest':
      return arr.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    case 'price-asc':
      return arr.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return arr.sort((a, b) => b.price - a.price);
    case 'featured':
    case 'popular':
    default:
      return arr.sort(
        (a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || b.popularity - a.popularity
      );
  }
}

export function getRelated(watches, watch, n = 4) {
  const others = watches.filter((w) => w.id !== watch.id);
  const byPopularity = (a, b) => b.popularity - a.popularity;
  const sameBrand = others.filter((w) => w.brandSlug === watch.brandSlug).sort(byPopularity);
  const sameType = others
    .filter((w) => w.brandSlug !== watch.brandSlug && w.type === watch.type)
    .sort(byPopularity);
  const rest = others
    .filter((w) => w.brandSlug !== watch.brandSlug && w.type !== watch.type)
    .sort(byPopularity);
  return [...sameBrand, ...sameType, ...rest].slice(0, n);
}
