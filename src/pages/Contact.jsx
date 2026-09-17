import { useState } from 'react';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import faqs from '../data/faq';
import PageHero from '../components/layout/PageHero';
import SectionHeading from '../components/ui/SectionHeading';
import Accordion from '../components/ui/Accordion';
import useReveal from '../hooks/useReveal';

const inputCls =
  'w-full border border-stone/40 bg-transparent px-3 py-3 text-sm outline-none transition focus:border-gold';

export default function Contact() {
  useReveal([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: 'General enquiry',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (!/.+@.+\..+/.test(form.email)) errs.email = 'Enter a valid email';
    if (form.message.trim().length < 10)
      errs.message = 'Please tell us a little more (10+ characters)';
    setErrors(errs);
    if (!Object.keys(errs).length) setSent(true);
  };

  return (
    <>
      <PageHero eyebrow="Concierge" title="Speak With Us">
        <p>
          Sourcing a reference, valuing an heirloom or arranging a private viewing — our specialists
          reply within one business day.
        </p>
      </PageHero>
      <section className="py-20 lg:py-28">
        <div className="container-x grid gap-16 lg:grid-cols-[1fr_380px]">
          <div className="reveal">
            <SectionHeading eyebrow="Enquiry" title="Send a Message" />
            {sent ? (
              <div className="border border-gold/40 bg-gold/5 p-8">
                <p className="heading-display text-2xl">Message received.</p>
                <p className="mt-3 text-sm text-graphite">
                  Thank you, {form.name.split(' ')[0]}. A specialist will reply to {form.email}{' '}
                  within one business day.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2" noValidate>
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-graphite">
                    Name
                  </label>
                  <input
                    className={inputCls}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-700">{errors.name}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-graphite">
                    Email
                  </label>
                  <input
                    type="email"
                    className={inputCls}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-graphite">
                    Subject
                  </label>
                  <select
                    className={inputCls}
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  >
                    {[
                      'General enquiry',
                      'Watch sourcing',
                      'Order support',
                      'Warranty & service',
                      'Private viewing',
                    ].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-graphite">
                    Message
                  </label>
                  <textarea
                    rows={6}
                    className={inputCls}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                  {errors.message && <p className="mt-1 text-xs text-red-700">{errors.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="btn-primary">
                    Send message
                  </button>
                </div>
              </form>
            )}
          </div>
          <aside className="reveal space-y-8">
            <div>
              <p className="eyebrow mb-4">Support</p>
              <ul className="space-y-4 text-sm text-graphite">
                <li className="flex items-start gap-3">
                  <Phone size={16} className="mt-0.5 text-gold" />
                  <span>+44 20 7946 0958 · +1 212 555 0187</span>
                </li>
                <li className="flex items-start gap-3">
                  <Mail size={16} className="mt-0.5 text-gold" />
                  <span>concierge@sterlingmeridian.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock size={16} className="mt-0.5 text-gold" />
                  <span>Monday–Saturday, 10:00–18:00 local</span>
                </li>
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-4">Boutiques</p>
              <ul className="space-y-4 text-sm text-graphite">
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="mt-0.5 text-gold" />
                  <span>
                    14 Old Bond Street
                    <br />
                    Mayfair, London W1S 4PP
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="mt-0.5 text-gold" />
                  <span>
                    712 Madison Avenue
                    <br />
                    New York, NY 10065
                  </span>
                </li>
              </ul>
            </div>
            <div id="shipping">
              <p className="eyebrow mb-4">Shipping</p>
              <p className="text-sm leading-relaxed text-graphite">
                Fully insured, discreet worldwide delivery — complimentary over $5,000, express
                overnight available. Signature required on every parcel.
              </p>
            </div>
            <div id="returns">
              <p className="eyebrow mb-4">Returns</p>
              <p className="text-sm leading-relaxed text-graphite">
                Fourteen days from delivery for a full refund, provided the watch is returned in the
                condition received. Refunds are issued within five business days of inspection.
              </p>
            </div>
          </aside>
        </div>
      </section>
      <section id="faq" className="bg-sand py-20 lg:py-28">
        <div className="container-x max-w-3xl">
          <SectionHeading eyebrow="Answers" title="Frequently Asked" />
          <Accordion items={faqs} />
        </div>
      </section>
    </>
  );
}
