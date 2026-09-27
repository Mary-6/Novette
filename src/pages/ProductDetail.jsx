import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FileBadge, Heart, MessageCircle, ShieldCheck, Truck, X } from 'lucide-react';
import watches from '../data/watches';
import { brandBySlug, formatPrice, getRelated } from '../data/utils';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import ProductGallery from '../components/watch/ProductGallery';
import WatchGrid from '../components/watch/WatchGrid';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { AccordionItem } from '../components/ui/Accordion';
import SectionHeading from '../components/ui/SectionHeading';

const inputCls =
  'w-full border border-stone/40 bg-transparent px-3 py-3 text-sm outline-none transition focus:border-gold';

function AskModal({ watch, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', question: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (!/.+@.+\..+/.test(form.email)) errs.email = 'Enter a valid email';
    if (form.question.trim().length < 5) errs.question = 'Please write your question';
    setErrors(errs);
    if (!Object.keys(errs).length) setSent(true);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/70" onClick={onClose} />
      <div className="relative w-full max-w-md bg-ivory p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4"
        >
          <X size={18} />
        </button>
        <p className="eyebrow mb-2">Concierge</p>
        <h3 className="heading-display text-2xl">Ask about this watch</h3>
        <p className="mt-1 text-xs text-stone">
          {watch.model} · Ref. {watch.reference} · Item {watch.itemNumber}
        </p>
        {sent ? (
          <p className="mt-6 text-sm text-graphite">
            Thank you, a specialist will reply to {form.email} within one business day.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            <input
              className={inputCls}
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <p className="text-xs text-red-700">{errors.name}</p>}
            <input
              className={inputCls}
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <p className="text-xs text-red-700">{errors.email}</p>}
            <textarea
              className={inputCls}
              rows={4}
              placeholder="Your question…"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
            />
            {errors.question && <p className="text-xs text-red-700">{errors.question}</p>}
            <button type="submit" className="btn-primary w-full">
              Send question
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const wishlist = useWishlist();
  const [askOpen, setAskOpen] = useState(false);
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
  const monthly = formatPrice(watch.price / 12);
  const saved = wishlist?.has(watch.id);

  const specRows = [
    ['Item Number', watch.itemNumber],
    ['Reference', watch.reference],
    ['Year', watch.year],
    ['Decade', watch.decade],
    ['Condition', watch.condition],
    ['Case Diameter', watch.specs.caseDiameter],
    ['Case Material', watch.specs.caseMaterial],
    ['Bezel', watch.bezelType],
    ['Dial', watch.dialColor],
    ['Hour Markers', watch.hourMarkers],
    ['Movement', `${watch.specs.movement} · ${watch.specs.caliber}`],
    ['Power Reserve', watch.specs.powerReserve],
    ['Water Resistance', watch.specs.waterResistance],
    ['Crystal', watch.specs.crystal],
    ['Band', `${watch.bandType} · ${watch.bandMaterial}`],
    ['Functions', watch.functions.join(', ')],
    ['Box & Papers', watch.boxPapers],
    ...(watch.nickname ? [['Nickname', watch.nickname]] : []),
  ];

  return (
    <>
      <section className="py-12 lg:py-16">
        <div className="container-x">
          <Breadcrumbs
            items={[
              { label: 'Home', to: '/' },
              { label: brand.name, to: `/brands/${brand.slug}` },
              ...(watch.family
                ? [
                    {
                      label: watch.family,
                      to: `/shop?brand=${brand.slug}&q=${encodeURIComponent(watch.family)}`,
                    },
                  ]
                : []),
              { label: watch.reference },
            ]}
          />
          <div className="grid gap-12 lg:grid-cols-2">
            <ProductGallery
              watch={watch}
              art={watch.art}
              engraving={`${brand.name.toUpperCase()} · ${watch.reference}`}
            />
            <div>
              <div className="flex items-center gap-2">
                <Badge>{watch.condition}</Badge>
                <Badge>{watch.availability}</Badge>
                {watch.nickname && <Badge>{watch.nickname}</Badge>}
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
                Reference {watch.reference} · {watch.year} · Item {watch.itemNumber}
              </p>
              <p className="mt-6 text-3xl font-medium tracking-wide">{formatPrice(watch.price)}</p>
              <p className="mt-1 text-xs text-stone">
                Or from {monthly}/mo with a 12-month plan —{' '}
                <Link to="/payment-methods" className="underline underline-offset-2">
                  details
                </Link>
              </p>
              <div className="mt-6 flex items-center gap-3 text-sm text-graphite">
                <FileBadge size={16} className="text-gold" />
                {watch.boxPapers === 'Box Only'
                  ? 'Complete with original box'
                  : watch.boxPapers === 'Papers Only'
                    ? 'Complete with original papers'
                    : `Complete with ${watch.boxPapers.toLowerCase()}`}
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
              <div className="mt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setAskOpen(true)}
                  className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-goldDark underline-offset-4 hover:underline"
                >
                  <MessageCircle size={14} /> Ask a Question
                </button>
                <button
                  type="button"
                  onClick={() => wishlist?.toggle(watch.id)}
                  className={`flex items-center gap-2 text-xs uppercase tracking-[0.2em] transition ${
                    saved ? 'text-gold' : 'text-stone hover:text-gold'
                  }`}
                >
                  <Heart size={14} fill={saved ? 'currentColor' : 'none'} />
                  {saved ? 'Saved' : 'Wishlist'}
                </button>
              </div>
              {!canBuy && (
                <p className="mt-3 text-xs text-stone">
                  This piece is currently reserved, contact our concierge to join the waitlist.
                </p>
              )}
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-y border-stone/25 py-4 text-[11px] uppercase tracking-[0.18em] text-graphite">
                <Link
                  to="/buyers-protection-plan"
                  className="flex items-center gap-2 hover:text-goldDark"
                >
                  <ShieldCheck size={14} className="text-gold" /> Buyer&apos;s Protection Plan
                </Link>
                <Link to="/shipping-info" className="flex items-center gap-2 hover:text-goldDark">
                  <Truck size={14} className="text-gold" /> Free Overnight Shipping
                </Link>
                <Link to="/warranty" className="flex items-center gap-2 hover:text-goldDark">
                  <FileBadge size={14} className="text-gold" /> 2-Year Warranty
                </Link>
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
                    {specRows.map(([k, v]) => (
                      <div
                        key={k}
                        className="flex justify-between gap-4 border-b border-stone/15 pb-2"
                      >
                        <dt className="text-stone">{k}</dt>
                        <dd className="text-right">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </AccordionItem>
                <AccordionItem title="Authentication">
                  <p>
                    Every timepiece passes a 40-point inspection by our master watchmakers,                     movement, dial, case geometry and bracelet verified against factory records,                     and ships with a signed Novette Watches Certificate of Authenticity.{' '}
                    <Link to="/authenticity-pledge" className="text-goldDark underline">
                      Read our pledge
                    </Link>
                    .
                  </p>
                </AccordionItem>
                <AccordionItem title="Shipping & Returns">
                  <p>
                    Fully insured, discreet packaging with signature delivery, complimentary
                    overnight on every order. Fourteen-day returns for a full refund;{' '}
                    <Link to="/return-policy" className="text-goldDark underline">
                      read the policy
                    </Link>
                    .
                  </p>
                </AccordionItem>
                <AccordionItem title="Warranty">
                  <p>
                    Two-year coverage on the movement and its functions, serviced in our own
                    workshop.{' '}
                    <Link to="/warranty" className="text-goldDark underline">
                      Warranty details
                    </Link>
                    .
                  </p>
                </AccordionItem>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="border-t border-stone/25 py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Complete the Look" title="You May Also Like" />
          <WatchGrid watches={related} />
        </div>
      </section>
      <div className="sticky bottom-0 z-40 border-t border-graphite bg-ink px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-ivory/60">{brand.name}</p>
            <p className="text-sm font-medium text-ivory">{formatPrice(watch.price)}</p>
          </div>
          <button
            type="button"
            disabled={!canBuy}
            onClick={() => add(watch.id)}
            className="btn-gold px-6 py-3 text-xs"
          >
            Add to Cart
          </button>
        </div>
      </div>
      {askOpen && <AskModal watch={watch} onClose={() => setAskOpen(false)} />}
    </>
  );
}
