const OPTIONS = [
  { value: 'popular', label: 'Most popular' },
  { value: 'newest', label: 'Newest arrivals' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
];

export default function SortSelect({ value, onChange }) {
  return (
    <label className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-graphite">
      Sort
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-stone/40 bg-transparent px-3 py-2.5 text-xs uppercase tracking-[0.15em] outline-none focus:border-gold"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
