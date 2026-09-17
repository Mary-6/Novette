import { X } from 'lucide-react';
import brands from '../../data/brands';
import { formatPrice } from '../../data/utils';

const DISPLAY = {
  brands: (v) => brands.find((b) => b.slug === v)?.name || v,
};

export default function ActiveFilters({ filters, onChange, hideKeys = [] }) {
  const chips = [];
  if (filters.q)
    chips.push({ label: `"${filters.q}"`, clear: () => onChange({ ...filters, q: '' }) });
  if (filters.min != null || filters.max != null)
    chips.push({
      label: `${filters.min != null ? formatPrice(filters.min) : 'Up to'} – ${
        filters.max != null ? formatPrice(filters.max) : 'any'
      }`,
      clear: () => onChange({ ...filters, min: null, max: null }),
    });
  Object.keys(filters).forEach((key) => {
    if (['q', 'min', 'max', 'brands'].includes(key) || hideKeys.includes(key)) return;
    const vals = filters[key];
    if (!Array.isArray(vals)) return;
    vals.forEach((v) =>
      chips.push({
        label: DISPLAY[key]?.(v) || v,
        clear: () => onChange({ ...filters, [key]: vals.filter((x) => x !== v) }),
      })
    );
  });
  if (!hideKeys.includes('brands'))
    (filters.brands || []).forEach((b) =>
      chips.push({
        label: brands.find((x) => x.slug === b)?.name || b,
        clear: () => onChange({ ...filters, brands: filters.brands.filter((x) => x !== b) }),
      })
    );

  if (!chips.length) return null;
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {chips.map((c, i) => (
        <button
          key={i}
          type="button"
          onClick={c.clear}
          className="flex items-center gap-2 border border-stone/40 px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-graphite transition hover:border-gold hover:text-ink"
        >
          {c.label}
          <X size={12} />
        </button>
      ))}
    </div>
  );
}
