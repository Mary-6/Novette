import { Link } from 'react-router-dom';

export default function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-xs uppercase tracking-[0.18em] text-stone">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-stone/50">/</span>}
            {it.to ? (
              <Link to={it.to} className="transition hover:text-gold">
                {it.label}
              </Link>
            ) : (
              <span className="text-graphite">{it.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
