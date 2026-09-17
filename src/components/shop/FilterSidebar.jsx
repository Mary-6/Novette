import brands from '../../data/brands';

const PRICE_PRESETS = [
  { label: 'Under $5,000', min: 0, max: 5000 },
  { label: '$5,000 – $15,000', min: 5000, max: 15000 },
  { label: '$15,000 – $50,000', min: 15000, max: 50000 },
  { label: 'Over $50,000', min: 50000, max: null },
];

const GENDERS = ['Men', 'Women', 'Unisex'];
const TYPES = ['Dress', 'Sport', 'Dive', 'Chronograph', 'Pilot', 'GMT'];
const CONDITIONS = ['New', 'Unworn', 'Pre-Owned', 'Vintage'];

function Group({ title, children }) {
  return (
    <div className="border-b border-stone/25 py-6">
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em]">{title}</p>
      {children}
    </div>
  );
}

function Check({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1 text-sm text-graphite">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-gold"
      />
      {label}
    </label>
  );
}

export default function FilterSidebar({ filters, onChange, lockBrand }) {
  const toggle = (key, val) => {
    const cur = filters[key] || [];
    onChange({
      ...filters,
      [key]: cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val],
    });
  };

  const setRange = (min, max) => onChange({ ...filters, min, max });
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
      {!lockBrand && (
        <Group title="Brand">
          <div className="max-h-56 space-y-0.5 overflow-y-auto pr-2">
            {brands.map((b) => (
              <Check
                key={b.slug}
                label={b.name}
                checked={(filters.brands || []).includes(b.slug)}
                onChange={() => toggle('brands', b.slug)}
              />
            ))}
          </div>
        </Group>
      )}
      <Group title="Price">
        <div className="space-y-1.5">
          {PRICE_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setRange(p.min, p.max)}
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
              onChange({ ...filters, min: e.target.value === '' ? null : Number(e.target.value) })
            }
            className="w-full border border-stone/40 bg-transparent px-2 py-2 text-sm outline-none focus:border-gold"
          />
          <span className="text-stone">–</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.max ?? ''}
            onChange={(e) =>
              onChange({ ...filters, max: e.target.value === '' ? null : Number(e.target.value) })
            }
            className="w-full border border-stone/40 bg-transparent px-2 py-2 text-sm outline-none focus:border-gold"
          />
        </div>
      </Group>
      <Group title="Gender">
        {GENDERS.map((g) => (
          <Check
            key={g}
            label={g}
            checked={(filters.genders || []).includes(g)}
            onChange={() => toggle('genders', g)}
          />
        ))}
      </Group>
      <Group title="Type">
        {TYPES.map((t) => (
          <Check
            key={t}
            label={t}
            checked={(filters.types || []).includes(t)}
            onChange={() => toggle('types', t)}
          />
        ))}
      </Group>
      <Group title="Condition">
        {CONDITIONS.map((c) => (
          <Check
            key={c}
            label={c}
            checked={(filters.conditions || []).includes(c)}
            onChange={() => toggle('conditions', c)}
          />
        ))}
      </Group>
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
          })
        }
        className="mt-6 text-xs uppercase tracking-[0.2em] text-stone underline-offset-4 transition hover:text-gold hover:underline"
      >
        Clear all filters
      </button>
    </aside>
  );
}
