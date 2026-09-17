import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import brands from '../../data/brands';
import { watchFacetValues } from '../../data/utils';

const PRICE_PRESETS = [
  { label: '$2,000 – $5,000', min: 2000, max: 5000 },
  { label: '$5,000 – $7,000', min: 5000, max: 7000 },
  { label: '$7,000 – $10,000', min: 7000, max: 10000 },
  { label: '$10,000 – $15,000', min: 10000, max: 15000 },
  { label: '$15,000 – $20,000', min: 15000, max: 20000 },
  { label: 'Over $20,000', min: 20000, max: null },
];

const PRICE_KEY = '__price__';

const GROUPS = [
  { key: 'brands', title: 'Brand', labelFor: (v) => brands.find((b) => b.slug === v)?.name || v },
  { key: 'genders', title: 'Gender' },
  { key: 'types', title: 'Type' },
  { key: 'families', title: 'Model' },
  { key: PRICE_KEY },
  { key: 'references', title: 'Model Number' },
  { key: 'sizes', title: 'Size', sortNumeric: true },
  { key: 'materials', title: 'Case Material' },
  { key: 'dials', title: 'Dial Color' },
  { key: 'decades', title: 'Age' },
  { key: 'boxPapers', title: 'Box & Papers' },
  { key: 'conditions', title: 'Condition' },
  { key: 'bandTypes', title: 'Band Type' },
  { key: 'bandMaterials', title: 'Band Material' },
  { key: 'nicknames', title: 'Nickname' },
  { key: 'bezels', title: 'Bezel Type' },
  { key: 'functions', title: 'Functions' },
  { key: 'markers', title: 'Hour Markers' },
  { key: 'warranty', title: 'Manufacturer Warranty' },
];

const COLLAPSED = 4;

function Group({ title, children }) {
  return (
    <div className="border-b border-stone/25 py-5">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em]">{title}</p>
      {children}
    </div>
  );
}

export default function FilterSidebar({ filters, onChange, source, lockBrand }) {
  const [expanded, setExpanded] = useState({});
  const facetValues = useMemo(
    () =>
      watchFacetValues(source, {
        search: filters.q,
        priceRange: [filters.min, filters.max],
        brands: filters.brands,
        families: filters.families,
        references: filters.references,
        sizes: filters.sizes,
        materials: filters.materials,
        dials: filters.dials,
        decades: filters.decades,
        boxPapers: filters.boxPapers,
        conditions: filters.conditions,
        bandTypes: filters.bandTypes,
        bandMaterials: filters.bandMaterials,
        nicknames: filters.nicknames,
        bezels: filters.bezels,
        functions: filters.functions,
        markers: filters.markers,
        warranty: filters.warranty,
        genders: filters.genders,
        types: filters.types,
      }),
    [source, filters]
  );

  const singleBrand = lockBrand || (filters.brands || []).length === 1;

  const toggle = (key, val) => {
    const cur = filters[key] || [];
    onChange({
      ...filters,
      [key]: cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val],
    });
  };

  const presetActive = (p) => filters.min === p.min && filters.max === p.max;

  return (
    <aside className="text-ink">
      <Group title="Search">
        <input
          type="text"
          value={filters.q || ''}
          onChange={(e) => onChange({ ...filters, q: e.target.value })}
          placeholder="Model or reference…"
          className="w-full border border-stone/40 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-gold"
        />
      </Group>
      {GROUPS.map((g) => {
        if (g.key === PRICE_KEY) {
          return (
            <Group key="price" title="Price">
              <div className="space-y-1.5">
                {PRICE_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => onChange({ ...filters, min: p.min, max: p.max })}
                    className={`block w-full text-left text-sm transition ${
                      presetActive(p) ? 'font-medium text-gold' : 'text-graphite hover:text-ink'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={filters.min ?? ''}
                  onChange={(e) =>
                    onChange({
                      ...filters,
                      min: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  className="w-full min-w-0 border border-stone/40 bg-transparent px-2 py-2 text-sm outline-none focus:border-gold"
                />
                <span className="text-stone">–</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={filters.max ?? ''}
                  onChange={(e) =>
                    onChange({
                      ...filters,
                      max: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  className="w-full min-w-0 border border-stone/40 bg-transparent px-2 py-2 text-sm outline-none focus:border-gold"
                />
              </div>
            </Group>
          );
        }
        if (lockBrand && g.key === 'brands') return null;
        if (g.key === 'references' && !singleBrand) return null;
        const selected = filters[g.key] || [];
        let options = (facetValues[g.key] || []).filter(
          (o) => o.count > 0 || selected.includes(o.label)
        );
        if (g.sortNumeric)
          options = [...options].sort((a, b) => parseFloat(a.label) - parseFloat(b.label));
        if (g.labelFor) options = options.map((o) => ({ ...o, display: g.labelFor(o.label) }));
        if (!options.length) return null;
        const isOpen = expanded[g.key];
        const shown = isOpen ? options : options.slice(0, COLLAPSED);
        return (
          <Group key={g.key} title={g.title}>
            <div className="space-y-0.5">
              {shown.map((o) => (
                <label
                  key={o.label}
                  className="flex cursor-pointer items-center justify-between gap-2 py-1 text-sm text-graphite"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(o.label)}
                      onChange={() => toggle(g.key, o.label)}
                      className="h-4 w-4 shrink-0 accent-gold"
                    />
                    <span className="truncate">{o.display || o.label}</span>
                  </span>
                  <span className="shrink-0 text-xs text-stone">({o.count})</span>
                </label>
              ))}
            </div>
            {options.length > COLLAPSED && (
              <button
                type="button"
                onClick={() => setExpanded((e) => ({ ...e, [g.key]: !isOpen }))}
                className="mt-2 flex items-center gap-1 text-xs uppercase tracking-[0.15em] text-goldDark transition hover:text-gold"
              >
                <Plus size={12} className={isOpen ? 'rotate-45 transition' : 'transition'} />
                {isOpen ? 'Less' : `More (${options.length - COLLAPSED})`}
              </button>
            )}
          </Group>
        );
      })}
      <button
        type="button"
        onClick={() =>
          onChange({
            q: '',
            brands: lockBrand ? filters.brands : [],
            min: null,
            max: null,
            genders: [],
            types: [],
            conditions: [],
            families: [],
            references: [],
            sizes: [],
            materials: [],
            dials: [],
            decades: [],
            boxPapers: [],
            bandTypes: [],
            bandMaterials: [],
            nicknames: [],
            bezels: [],
            functions: [],
            markers: [],
            warranty: [],
          })
        }
        className="mt-6 text-xs uppercase tracking-[0.2em] text-stone underline-offset-4 transition hover:text-gold hover:underline"
      >
        Clear all filters
      </button>
    </aside>
  );
}
