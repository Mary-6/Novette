import { Link, useNavigate, useParams } from 'react-router-dom';
import { FileBadge, ShieldCheck, Truck } from 'lucide-react';
import watches from '../data/watches';
import { brandBySlug, formatPrice, getRelated } from '../data/utils';
import { useCart } from '../context/CartContext';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import ProductGallery from '../components/watch/ProductGallery';
import WatchGrid from '../components/watch/WatchGrid';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Accordion, { AccordionItem } from '../components/ui/Accordion';
import SectionHeading from '../components/ui/SectionHeading';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const watch = watches.find((w) => w.slug === slug);

  if (!watch) {
    return (
      <section className="py-32 text-center">
        <p className="eyebrow mb-4">Not Found</p>
        <h1 className="heading-display text-4xl">This timepiece has moved on.</h1>
        <Button to="/shop" className="mt-8">
          Browse the collection
        </Button>
      </section>
    );
  }

  const brand = brandBySlug(watch.brandSlug);
  const related = getRelated(watches, watch, 4);
  const canBuy = watch.availability !== 'Reserved';

  return (
    <>
      <section className="py-12 lg:py-16">
        <div className="container-x">
          <Breadcrumbs
            items={[
              { label: 'Home', to: '/' },
              { label: 'Shop', to: '/shop' },
              { label: brand.name, to: `/brands/${brand.slug}` },
              { label: watch.model },
            ]}
          />
          <div className="grid gap-12 lg:grid-cols-2">
            <ProductGallery
              art={watch.art}
              engraving={`${brand.name.toUpperCase()} · ${watch.reference}`}
            />
            <div>
              <div className="flex items-center gap-2">
                <Badge>{watch.condition}</Badge>
                <Badge>{watch.availability}</Badge>
              </div>
              <Link
                to={`/brands/${brand.slug}`}
                className="eyebrow mt-6 block transition hover:text-goldDark"
              >
                {brand.name}
              </Link>
              <h1 className="heading-display mt-2 text-4xl font-medium sm:text-5xl">
                {watch.model}
              </h1>
              <p className="mt-2 text-sm text-stone">
                Reference {watch.reference} · {watch.year}
              </p>
              <p className="mt-6 text-3xl font-medium tracking-wide">{formatPrice(watch.price)}</p>
              <div className="mt-6 flex items-center gap-3 text-sm text-graphite">
                <FileBadge size={16} className="text-gold" />
                {watch.boxPapers
                  ? 'Complete with original box and papers'
                  : 'Watch only — priced accordingly'}
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  className="flex-1"
                  disabled={!canBuy}
                  onClick={() => add(watch.id)}
                  style={!canBuy ? { opacity: 0.4, pointerEvents: 'none' } : undefined}
                >
                  Add to cart
                </Button>
                <Button
                  variant="gold"
                  className="flex-1"
                  disabled={!canBuy}
                  onClick={() => {
                    add(watch.id);
                    navigate('/checkout');
                  }}
                  style={!canBuy ? { opacity: 0.4, pointerEvents: 'none' } : undefined}
                >
                  Buy now
                </Button>
              </div>
              {!canBuy && (
                <p className="mt-3 text-xs text-stone">
                  This piece is currently reserved — contact our concierge to join the waitlist.
                </p>
              )}
              <div className="mt-10 space-y-3 border-t border-stone/25 pt-8 text-sm text-graphite">
                <p className="flex items-center gap-3">
                  <ShieldCheck size={16} className="text-gold" /> Two-year warranty included
                </p>
                <p className="flex items-center gap-3">
                  <Truck size={16} className="text-gold" /> Complimentary insured shipping over
                  $5,000
                </p>
              </div>
              <div className="mt-10">
                <AccordionItem title="Description" defaultOpen>
                  {watch.description.split('\n').map((p, i) => (
                    <p key={i} className={i > 0 ? 'mt-3' : ''}>
                      {p}
                    </p>
                  ))}
                </AccordionItem>
                <AccordionItem title="Specifications">
                  <dl className="grid grid-cols-1 gap-y-2.5">
                    {Object.entries(watch.specs).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex justify-between gap-4 border-b border-stone/15 pb-2"
                      >
                        <dt className="text-stone">
                          {k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}
                        </dt>
                        <dd className="text-right">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </AccordionItem>
                <AccordionItem title="Authentication">
                  <p>
                    Every timepiece passes a 40-point inspection by our master watchmakers —
                    movement, dial, case geometry and bracelet verified against factory records —
                    and ships with a signed Sterling Meridian Certificate of Authenticity and a
                    two-year warranty.
                  </p>
                </AccordionItem>
                <AccordionItem title="Shipping & Returns">
                  <p>
                    Fully insured, discreet packaging with signature delivery — complimentary over
                    $5,000. Fourteen-day returns for a full refund; see our policy on the contact
                    page for details.
                  </p>
                </AccordionItem>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="border-t border-stone/25 py-20">
        <div className="container-x">
          <SectionHeading eyebrow="You May Also Like" title="Related Timepieces" />
          <WatchGrid watches={related} />
        </div>
      </section>
    </>
  );
}
