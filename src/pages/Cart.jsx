import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING, useCart } from '../context/CartContext';
import { brandBySlug, formatPrice } from '../data/utils';
import WatchArt from '../components/watch/WatchArt';
import Button from '../components/ui/Button';
import PageHero from '../components/layout/PageHero';

export default function Cart() {
  const { items, setQty, remove, subtotal } = useCart();
  const shipping =
    items.length === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const total = subtotal + shipping;

  if (!items.length) {
    return (
      <section className="py-32 text-center">
        <p className="eyebrow mb-4">Your Cart</p>
        <h1 className="heading-display text-4xl sm:text-5xl">Your cart is empty.</h1>
        <p className="mt-4 text-sm text-graphite">
          Sixty authenticated timepieces are waiting for a wrist.
        </p>
        <Button to="/shop" className="mt-8">
          Continue shopping
        </Button>
      </section>
    );
  }

  return (
    <>
      <PageHero eyebrow="Your Selection" title="Shopping Cart" />
      <section className="py-14 lg:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_360px]">
          <div className="divide-y divide-stone/25">
            {items.map((it) => {
              const brand = brandBySlug(it.watch.brandSlug);
              return (
                <div key={it.watchId} className="flex gap-6 py-6">
                  <Link to={`/watches/${it.watch.slug}`} className="w-24 shrink-0 bg-sand sm:w-28">
                    <WatchArt art={it.watch.art} className="aspect-[3/4] w-full" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-stone">
                      {brand?.name}
                    </p>
                    <Link
                      to={`/watches/${it.watch.slug}`}
                      className="heading-display mt-1 text-xl leading-snug transition hover:text-goldDark"
                    >
                      {it.watch.model}
                    </Link>
                    <p className="mt-0.5 text-xs text-stone">Ref. {it.watch.reference}</p>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="flex items-center border border-stone/40">
                        <button
                          type="button"
                          className="px-3 py-2"
                          onClick={() => setQty(it.watchId, it.qty - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm">{it.qty}</span>
                        <button
                          type="button"
                          className="px-3 py-2"
                          onClick={() => setQty(it.watchId, it.qty + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="text-sm font-medium">{formatPrice(it.watch.price * it.qty)}</p>
                      <button
                        type="button"
                        onClick={() => remove(it.watchId)}
                        aria-label="Remove item"
                        className="text-stone transition hover:text-ink"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <aside className="h-fit bg-sand p-8">
            <p className="text-xs font-medium uppercase tracking-[0.2em]">Order Summary</p>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-graphite">Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-graphite">Insured shipping</dt>
                <dd>{shipping === 0 ? 'Complimentary' : formatPrice(shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-stone/30 pt-3 text-base font-medium">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>
            <Button to="/checkout" className="mt-8 w-full">
              Proceed to checkout
            </Button>
            <Link
              to="/shop"
              className="mt-4 block text-center text-xs uppercase tracking-[0.2em] text-stone transition hover:text-gold"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}
