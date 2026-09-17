import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { formatPrice } from '../data/utils';
import Button from '../components/ui/Button';

export default function Confirmation() {
  const { state } = useLocation();
  const order = state?.order;

  if (!order) {
    return (
      <section className="py-32 text-center">
        <h1 className="heading-display text-4xl">No order found.</h1>
        <p className="mt-4 text-sm text-graphite">
          If you just placed an order, your confirmation email is on its way.
        </p>
        <Button to="/shop" className="mt-8">
          Continue shopping
        </Button>
      </section>
    );
  }

  return (
    <section className="py-20 lg:py-28">
      <div className="container-x max-w-2xl text-center">
        <CheckCircle2 size={44} className="mx-auto text-gold" strokeWidth={1.5} />
        <p className="eyebrow mt-6">Order confirmed</p>
        <h1 className="heading-display mt-2 text-4xl font-medium sm:text-5xl">Thank you.</h1>
        <p className="mt-4 text-sm text-graphite">
          Order <span className="font-medium text-ink">{order.number}</span> — a confirmation has
          been sent to {order.email}. Your timepiece will be prepared by our atelier and shipped
          fully insured.
        </p>
        <div className="mt-10 bg-sand p-8 text-left">
          <ul className="space-y-3 text-sm">
            {order.items.map((it, i) => (
              <li key={i} className="flex justify-between gap-4">
                <span>
                  {it.brand} {it.model}
                  <span className="text-stone">
                    {' '}
                    · Ref. {it.reference} · Qty {it.qty}
                  </span>
                </span>
                <span>{formatPrice(it.price * it.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-stone/30 pt-4 text-sm">
            <div className="flex justify-between text-graphite">
              <dt>Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-graphite">
              <dt>Shipping</dt>
              <dd>{order.shipping === 0 ? 'Complimentary' : formatPrice(order.shipping)}</dd>
            </div>
            <div className="flex justify-between pt-2 text-base font-medium">
              <dt>Total</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </div>
        <Link to="/shop" className="btn-outline mt-10 inline-block">
          Continue browsing
        </Link>
      </div>
    </section>
  );
}
