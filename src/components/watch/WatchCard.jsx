import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import WatchImage from './WatchImage';
import Badge from '../ui/Badge';
import { brandBySlug, formatPrice } from '../../data/utils';
import { useWishlist } from '../../context/WishlistContext';

export default function WatchCard({ watch }) {
  const brand = brandBySlug(watch.brandSlug);
  const wishlist = useWishlist();
  const saved = wishlist?.has(watch.id);
  return (
    <div className="group relative">
      <Link to={`/watches/${watch.slug}`} className="block">
        <div className="relative overflow-hidden bg-sand">
          <WatchImage
            watch={watch}
            className="aspect-[4/5] w-full transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            <Badge>{watch.condition}</Badge>
            {watch.availability !== 'In Stock' && <Badge>{watch.availability}</Badge>}
          </div>
          <span className="absolute bottom-3 left-3 bg-ink/70 px-2 py-0.5 text-[9px] uppercase tracking-[0.15em] text-ivory/80">
            {watch.imageKinds?.[0] === 'visualization'
              ? 'Studio model visualization'
              : watch.images?.length
                ? 'Verified model photo'
                : 'Model illustration'}
          </span>
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
      <button
        type="button"
        aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
        onClick={() => wishlist?.toggle(watch.id)}
        className={`absolute right-3 top-3 rounded-full bg-ivory/90 p-2 transition hover:text-gold ${
          saved ? 'text-gold' : 'text-graphite'
        }`}
      >
        <Heart size={15} fill={saved ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}
