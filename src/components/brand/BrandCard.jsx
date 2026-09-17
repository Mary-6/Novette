import { Link } from 'react-router-dom';
import watches from '../../data/watches';

export default function BrandCard({ brand, showCount = true }) {
  const count = watches.filter((w) => w.brandSlug === brand.slug).length;
  const dark = brand.heroTone === 'dark';
  return (
    <Link
      to={`/brands/${brand.slug}`}
      className={`group flex flex-col justify-between border p-8 transition hover:border-gold ${
        dark ? 'border-graphite bg-ink text-ivory' : 'border-stone/25 bg-sand text-ink'
      }`}
    >
      <div>
        <p className="heading-display text-2xl leading-tight sm:text-3xl">{brand.name}</p>
        <p
          className={`mt-1 text-[10px] uppercase tracking-[0.3em] ${dark ? 'text-ivory/50' : 'text-stone'}`}
        >
          {brand.country} · Est. {brand.founded}
        </p>
      </div>
      <div className="mt-10 flex items-end justify-between">
        <p className={`text-xs italic ${dark ? 'text-ivory/60' : 'text-graphite'}`}>
          {brand.tagline}
        </p>
        {showCount && (
          <span className="text-[10px] uppercase tracking-[0.25em] text-gold">
            {count} {count === 1 ? 'piece' : 'pieces'}
          </span>
        )}
      </div>
    </Link>
  );
}
