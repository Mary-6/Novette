import PageHero from '../components/layout/PageHero';
import WatchGrid from '../components/watch/WatchGrid';
import Button from '../components/ui/Button';
import { useWishlist } from '../context/WishlistContext';
import useReveal from '../hooks/useReveal';

export default function Wishlist() {
  useReveal([]);
  const wishlist = useWishlist();
  const items = wishlist?.items ?? [];
  return (
    <>
      <PageHero eyebrow="Saved" title="Your Wishlist">
        <p>
          {items.length
            ? `${items.length} ${items.length === 1 ? 'piece' : 'pieces'} saved for later.`
            : 'Pieces you save will wait here.'}
        </p>
      </PageHero>
      <section className="py-16 lg:py-24">
        <div className="container-x">
          {items.length ? (
            <WatchGrid watches={items} />
          ) : (
            <div className="py-16 text-center">
              <p className="text-sm text-graphite">Your wishlist is empty.</p>
              <Button to="/shop" className="mt-6">
                Browse the collection
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
