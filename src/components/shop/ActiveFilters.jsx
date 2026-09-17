import { X } from 'lucide-react';
import { brandBySlug, formatPrice } from '../../data/utils';

export default function ActiveFilters({ filters, onChange }) {
  const chips = [];
  if (filters.q)
    chips.push({ label: `“${filters.q}”`, clear: () => onChange({ ...filters, q: '' }) });
  (filters.brands || []).forEach((b) =>
    chips.push({
      label: brandBySlug(b)?.name || b,
      clear: () => onChange({ ...filters, brands: filters.brands.filter((x) => x !== b) }),
    })
  );
  if (filters.min != null || filters.max != null)
    chips.push({
      label: `${filters.min != null ? formatPrice(filters.min) : 'Up to'} – ${
        filters.max != null ? formatPrice(filters.max) : 'any'
      }`,
      clear: () => onChange({ ...filters, min: null, max: null }),
    });
  ['genders', 'types', 'conditions'].forEach((key) =>
    (filters[key] || []).forEach((v) =>
      chips.push({
        label: v,
        clear: () => onChange({ ...filters, [key]: filters[key].filter((x) => x !== v) }),
      })
    )
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
