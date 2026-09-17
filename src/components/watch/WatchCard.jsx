import { Link } from 'react-router-dom';
import WatchArt from './WatchArt';
import Badge from '../ui/Badge';
import { brandBySlug, formatPrice } from '../../data/utils';

export default function WatchCard({ watch }) {
  const brand = brandBySlug(watch.brandSlug);
  return (
    <Link to={`/watches/${watch.slug}`} className="group block">
      <div className="relative overflow-hidden bg-sand">
        <WatchArt
          art={watch.art}
          className="aspect-[3/4] w-full transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          <Badge>{watch.condition}</Badge>
          {watch.availability !== 'In Stock' && <Badge>{watch.availability}</Badge>}
        </div>
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-ink/90 px-4 py-3 text-center text-[11px] uppercase tracking-[0.25em] text-ivory transition-transform duration-300 group-hover:translate-y-0">
          View details
        </div>
      </div>
      <div className="pt-4 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-stone">{brand?.name}</p>
        <p className="heading-display mt-1 text-lg leading-snug">{watch.model}</p>
        <p className="mt-0.5 text-xs text-stone">Ref. {watch.reference}</p>
        <p className="mt-2 text-sm font-medium tracking-wide">{formatPrice(watch.price)}</p>
      </div>
    </Link>
  );
}
