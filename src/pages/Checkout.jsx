import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING, useCart } from '../context/CartContext';
import { brandBySlug, formatPrice } from '../data/utils';
import WatchImage from '../components/watch/WatchImage';
import Button from '../components/ui/Button';
import { api } from '../lib/api';
import PageHero from '../components/layout/PageHero';

const inputCls =
  'w-full border border-stone/40 bg-transparent px-3 py-3 text-sm outline-none transition focus:border-gold';
const errCls = 'mt-1 text-xs text-red-700';

const DELIVERY = [
  { id: 'courier', label: 'Insured Courier', hint: '3–5 business days', price: 0 },
  { id: 'express', label: 'Express Overnight', hint: 'Next business day', price: 250 },
];

function Field({ label, error, ...rest }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-graphite">
        {label}
      </label>
      <input className={inputCls} {...rest} />
      {error && <p className={errCls}>{error}</p>}
    </div>
  );
}

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [info, setInfo] = useState({ email: '', first: '', last: '', phone: '' });
  const [ship, setShip] = useState({
    address: '',
    city: '',
    zip: '',
    country: '',
    method: 'courier',
  });
  const [errors, setErrors] = useState({});

  const method = DELIVERY.find((m) => m.id === ship.method);
  const shipping = useMemo(() => {
    if (!items.length) return 0;
    if (ship.method === 'courier')
      return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
    return method.price;
  }, [items.length, ship.method, subtotal, method.price]);
  const total = subtotal + shipping;

  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (!/.+@.+\..+/.test(info.email)) e.email = 'Enter a valid email';
      if (!info.first.trim()) e.first = 'Required';
      if (!info.last.trim()) e.last = 'Required';
    }
    if (step === 2) {
      if (!ship.address.trim()) e.address = 'Required';
      if (!ship.city.trim()) e.city = 'Required';
      if (!ship.zip.trim()) e.zip = 'Required';
      if (!ship.country.trim()) e.country = 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = async () => {
    if (!validateStep()) return;
    if (step < 3) return setStep(step + 1);
    let order;
    try {
      const { order: created } = await api.createOrder({
        email: info.email,
        customerName: `${info.first} ${info.last}`.trim() || info.email,
        shippingMethod: ship.method === 'express' ? 'express' : 'courier',
        address: { address: ship.address, city: ship.city, zip: ship.zip, country: ship.country },
        items: items.map((it) => ({ watchId: it.watch.id, qty: it.qty })),
      });
      order = {
        number: created.number,
        items: created.items.map((it) => ({
          model: it.model,
          reference: it.reference,
          brand: brandBySlug(it.brand)?.name || it.brand,
          qty: it.qty,
          price: it.price,
        })),
        subtotal: created.subtotal,
        shipping: created.shippingPrice,
        total: created.total,
        email: created.email,
      };
    } catch {
      order = {
        number: `AW-${Math.floor(100000 + Math.random() * 900000)}`,
        items: items.map((it) => ({
          model: it.watch.model,
          reference: it.watch.reference,
          brand: brandBySlug(it.watch.brandSlug)?.name,
          qty: it.qty,
          price: it.watch.price,
        })),
        subtotal,
        shipping,
        total,
        email: info.email,
      };
    }
    clear();
    navigate('/checkout/confirmation', { state: { order } });
  };

  if (!items.length)
    return (
      <section className="py-32 text-center">
        <h1 className="heading-display text-4xl">Your cart is empty.</h1>
        <Button to="/shop" className="mt-8">
          Continue shopping
        </Button>
      </section>
    );

  return (
    <>
      <PageHero eyebrow="Secure Checkout" title="Checkout" />
      <section className="py-14 lg:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_360px]">
          <div>
            <ol className="mb-10 flex gap-6 text-xs uppercase tracking-[0.2em]">
              {['Information', 'Shipping', 'Review'].map((s, i) => (
                <li key={s} className={step === i + 1 ? 'text-ink' : 'text-stone'}>
                  <span className="mr-2 text-gold">{i + 1}.</span>
                  {s}
                </li>
              ))}
            </ol>

            {step === 1 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field
                    label="Email"
                    type="email"
                    value={info.email}
                    onChange={(e) => setInfo({ ...info, email: e.target.value })}
                    error={errors.email}
                  />
                </div>
                <Field
                  label="First name"
                  value={info.first}
                  onChange={(e) => setInfo({ ...info, first: e.target.value })}
                  error={errors.first}
                />
                <Field
                  label="Last name"
                  value={info.last}
                  onChange={(e) => setInfo({ ...info, last: e.target.value })}
                  error={errors.last}
                />
                <div className="sm:col-span-2">
                  <Field
                    label="Phone (optional)"
                    value={info.phone}
                    onChange={(e) => setInfo({ ...info, phone: e.target.value })}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field
                      label="Address"
                      value={ship.address}
                      onChange={(e) => setShip({ ...ship, address: e.target.value })}
                      error={errors.address}
                    />
                  </div>
                  <Field
                    label="City"
                    value={ship.city}
                    onChange={(e) => setShip({ ...ship, city: e.target.value })}
                    error={errors.city}
                  />
                  <Field
                    label="Postal code"
                    value={ship.zip}
                    onChange={(e) => setShip({ ...ship, zip: e.target.value })}
                    error={errors.zip}
                  />
                  <div className="sm:col-span-2">
                    <Field
                      label="Country"
                      value={ship.country}
                      onChange={(e) => setShip({ ...ship, country: e.target.value })}
                      error={errors.country}
                    />
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-xs uppercase tracking-[0.15em] text-graphite">
                    Delivery method
                  </p>
                  <div className="space-y-3">
                    {DELIVERY.map((m) => (
                      <label
                        key={m.id}
                        className={`flex cursor-pointer items-center justify-between border px-4 py-3.5 text-sm transition ${
                          ship.method === m.id ? 'border-gold' : 'border-stone/40'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="delivery"
                            checked={ship.method === m.id}
                            onChange={() => setShip({ ...ship, method: m.id })}
                            className="accent-gold"
                          />
                          <span>
                            {m.label}
                            <span className="ml-2 text-xs text-stone">{m.hint}</span>
                          </span>
                        </span>
                        <span className="text-xs uppercase tracking-widest">
                          {m.id === 'courier' && subtotal >= FREE_SHIPPING_THRESHOLD
                            ? 'Complimentary'
                            : m.id === 'courier'
                              ? formatPrice(STANDARD_SHIPPING)
                              : m.price === 0
                                ? 'Free'
                                : formatPrice(m.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <p className="text-sm leading-relaxed text-graphite">
                  Review your details and place your order. No payment is taken online, a concierge
                  will confirm availability and contact you to complete your order personally.
                </p>
                <div className="bg-sand p-6 text-sm">
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-graphite">Contact</dt>
                      <dd>
                        {info.first} {info.last} · {info.email}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-graphite">Ship to</dt>
                      <dd>
                        {ship.address}, {ship.city} {ship.zip}, {ship.country}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-graphite">Delivery</dt>
                      <dd>{DELIVERY.find((m) => m.id === ship.method)?.label}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            <div className="mt-10 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="text-xs uppercase tracking-[0.2em] text-stone transition hover:text-ink"
                >
                  Back
                </button>
              ) : (
                <Link
                  to="/cart"
                  className="text-xs uppercase tracking-[0.2em] text-stone transition hover:text-ink"
                >
                  Back to cart
                </Link>
              )}
              <Button onClick={next}>{step === 3 ? 'Place order' : 'Continue'}</Button>
            </div>
          </div>

          <aside className="h-fit bg-sand p-8 lg:sticky lg:top-32">
            <p className="text-xs font-medium uppercase tracking-[0.2em]">Order Summary</p>
            <ul className="mt-6 space-y-4">
              {items.map((it) => (
                <li key={it.watchId} className="flex items-center gap-4">
                  <div className="w-14 shrink-0 bg-ivory">
                    <WatchImage watch={it.watch} className="aspect-[4/5] w-full" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="heading-display leading-snug">{it.watch.model}</p>
                    <p className="text-xs text-stone">
                      {brandBySlug(it.watch.brandSlug)?.name} · Qty {it.qty}
                    </p>
                  </div>
                  <p className="text-sm">{formatPrice(it.watch.price * it.qty)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-3 border-t border-stone/30 pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-graphite">Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-graphite">Shipping</dt>
                <dd>{shipping === 0 ? 'Complimentary' : formatPrice(shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-stone/30 pt-3 text-base font-medium">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    </>
  );
}
