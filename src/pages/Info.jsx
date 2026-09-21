import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, ShieldCheck, Truck, BadgeCheck, LineChart } from 'lucide-react';
import pages from '../data/pages';
import faq from '../data/faq';
import brands from '../data/brands';
import rolexFamilies from '../data/rolexFamilies';
import collections from '../data/collections';
import PageHero from '../components/layout/PageHero';
import SectionHeading from '../components/ui/SectionHeading';
import Button from '../components/ui/Button';
import Accordion from '../components/ui/Accordion';
import useReveal from '../hooks/useReveal';

const LEADERSHIP = [
  {
    name: 'Eleanor Whitcombe',
    role: 'Founder & Chairwoman',
    bio: 'Founded the Mayfair atelier in 1987; still chooses every master watchmaker personally.',
  },
  {
    name: 'Marcus Feld',
    role: 'Chief Executive',
    bio: 'Led the 2004 move online and opened the New York boutique; keeps pricing tied to the Index.',
  },
  {
    name: 'Dr. Ingrid Laurent',
    role: 'Director of Watchmaking',
    bio: 'Twenty-five years on the bench; signs every certificate of authenticity herself.',
  },
  {
    name: 'Tomas Reyes',
    role: 'Head of Acquisitions',
    bio: 'Sources and vets every watch we offer; declines more than half of what is brought to him.',
  },
  {
    name: 'Priya Nair',
    role: 'Head of Client Services',
    bio: 'Runs the concierge desk across London and New York — one specialist per client.',
  },
  {
    name: 'Daniel Osei',
    role: 'Director of Trust & Compliance',
    bio: 'Oversees provenance verification, registry checks and AML/KYC across every transaction.',
  },
];

const PROMISE = [
  {
    icon: BadgeCheck,
    title: '100% Authentic',
    text: 'Certified by our own bench — never photographed proxies.',
  },
  {
    icon: LineChart,
    title: 'Full Transparency',
    text: 'Index-priced, with condition and provenance disclosed.',
  },
  {
    icon: ShieldCheck,
    title: 'Real-Time Inventory',
    text: 'Listed means physically in our vault, ready to ship.',
  },
  {
    icon: Truck,
    title: 'Free Shipping',
    text: 'Insured overnight delivery, signature required, on us.',
  },
];

const LOCATIONS = [
  {
    city: 'London',
    name: 'Mayfair Atelier & Salon',
    address: '14 Mount Street, Mayfair, London W1K 2RJ',
    hours: 'Mon–Sat 10:00–18:00 · by appointment',
  },
  {
    city: 'New York',
    name: 'Madison Avenue Boutique',
    address: '745 Madison Avenue, New York, NY 10065',
    hours: 'Mon–Sat 11:00–19:00 · Sun 12:00–17:00',
  },
];

function AboutBody() {
  return (
    <>
      <section className="py-20 lg:py-28">
        <div className="container-x grid gap-16 lg:grid-cols-2">
          <div className="reveal">
            <SectionHeading eyebrow="Our Story" title="From a Mayfair bench to two cities." />
            <div className="space-y-5 text-sm leading-relaxed text-graphite">
              <p>
                Aurelian Watches was founded in 1987 as a two-bench atelier in Mayfair restoring
                earlier Rolex references — the watches dealers had written off. Clients began asking
                the workshop to find pieces for them, and then to stand behind them.
              </p>
              <p>
                In 2004 the atelier moved online, carrying its rule with it: nothing is offered that
                our own watchmakers have not opened, inspected and certified. In 2015 we opened the
                Madison Avenue boutique, and today more than 25,000 clients buy from the same
                benches that started it all.
              </p>
            </div>
          </div>
          <div className="reveal">
            <SectionHeading eyebrow="Mission" title="Mission Statement & Service Culture" />
            <div className="space-y-5 text-sm leading-relaxed text-graphite">
              <p>
                Our mission is to make buying a fine watch as trustworthy as the watch itself —
                honest pricing, verified inventory, and a specialist who knows your name.
              </p>
              <p>
                Service here is not a queue. Every client is assigned a dedicated specialist for
                sourcing, sizing, aftercare and private viewings, for as long as they own the watch.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-sand py-20 lg:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Our Word" title="Our Promise" />
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {PROMISE.map((p) => (
              <div key={p.title} className="reveal">
                <p.icon size={26} className="text-gold" strokeWidth={1.5} />
                <p className="mt-4 text-sm font-medium uppercase tracking-[0.2em]">{p.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-graphite">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 lg:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="The People" title="The Leadership" />
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {LEADERSHIP.map((p) => (
              <div key={p.name} className="reveal flex gap-5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink font-display text-lg text-gold">
                  {p.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </span>
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="eyebrow mt-0.5">{p.role}</p>
                  <p className="mt-2 text-sm leading-relaxed text-graphite">{p.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-ink py-20 text-ivory lg:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Visit Us" title="Locations" light />
          <div className="grid gap-10 md:grid-cols-2">
            {LOCATIONS.map((l) => (
              <div key={l.city} className="reveal border border-graphite p-8">
                <p className="eyebrow">{l.city}</p>
                <p className="heading-display mt-2 text-2xl">{l.name}</p>
                <p className="mt-4 flex items-start gap-2 text-sm text-ivory/70">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-gold" /> {l.address}
                </p>
                <p className="mt-2 flex items-start gap-2 text-sm text-ivory/70">
                  <Phone size={15} className="mt-0.5 shrink-0 text-gold" /> {l.hours}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button to="/contact-us" variant="gold" className="rounded-full">
              Email Us
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function LocationsBody() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container-x grid gap-10 md:grid-cols-2">
        {LOCATIONS.map((l) => (
          <div key={l.city} className="reveal border border-stone/25 p-10">
            <p className="eyebrow">{l.city}</p>
            <p className="heading-display mt-2 text-3xl">{l.name}</p>
            <p className="mt-4 flex items-start gap-2 text-sm text-graphite">
              <MapPin size={15} className="mt-0.5 shrink-0 text-gold" /> {l.address}
            </p>
            <p className="mt-2 flex items-start gap-2 text-sm text-graphite">
              <Phone size={15} className="mt-0.5 shrink-0 text-gold" /> {l.hours}
            </p>
          </div>
        ))}
      </div>
      <div className="container-x mt-12 text-center">
        <Button to="/contact-us" className="rounded-full">
          Contact the concierge
        </Button>
      </div>
    </section>
  );
}

const GUIDE = [
  [
    'Define the wrist',
    'Case size and lug-to-lug matter more than the name on the dial. For most wrists, 34–40mm wears classically; sport watches run larger.',
  ],
  [
    'Choose the metal',
    'Steel is versatile and holds value; gold dresses up and wears warmer; two-tone splits the difference — and prices follow.',
  ],
  [
    'Box and papers',
    'A full set adds value and resale confidence. Our listings state exactly what accompanies each piece.',
  ],
  [
    'Check provenance',
    'Every Aurelian Watches listing is registry-checked and provenance-verified before it reaches the site.',
  ],
  [
    'Wear it first',
    'The best watch is the one that suits your week — not the one that sits in a safe.',
  ],
];

const CARE = [
  [
    'Winding',
    'Hand-wound pieces enjoy a gentle daily wind; automatics wind with wear. Stop when you feel resistance — never force the crown.',
  ],
  [
    'Water',
    'Water resistance is a lab rating, not a promise. Have seals checked annually and always screw the crown fully down.',
  ],
  [
    'Storage',
    'Store away from magnets and sunlight. A watch winder suits complicated automatics; manual pieces prefer rest.',
  ],
  [
    'Service',
    'A mechanical movement wants servicing every five to seven years — ours are done in-house and covered under warranty.',
  ],
];

function GuideBody({ steps }) {
  return (
    <section className="py-20 lg:py-28">
      <div className="container-x max-w-3xl">
        <ol className="space-y-10">
          {steps.map(([t, b], i) => (
            <li key={t} className="reveal flex gap-6">
              <span className="heading-display text-4xl text-gold">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em]">{t}</p>
                <p className="mt-2 text-sm leading-relaxed text-graphite">{b}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function SitemapBody() {
  const sections = [
    {
      title: 'Shop',
      links: [
        ['All Watches', '/shop'],
        ['New Arrivals', '/shop?sort=newest'],
        ['Rolex', '/rolex'],
        ...collections.map((c) => [c.name, `/collections/${c.slug}`]),
      ],
    },
    {
      title: 'Brands',
      links: [['All Brands', '/brands'], ...brands.map((b) => [b.name, `/brands/${b.slug}`])],
    },
    {
      title: 'Rolex Models',
      links: rolexFamilies.map((f) => [f.name, `/rolex/${f.slug}`]),
    },
    {
      title: 'Company',
      links: [
        ['About Us', '/about-us'],
        ['Why Buy From Us', '/why-buy-from-us'],
        ['Trust & Compliance', '/trust-and-compliance'],
        ['Locations', '/locations'],
        ['Journal', '/journal'],
        ['Contact Us', '/contact-us'],
      ],
    },
    {
      title: 'Support',
      links: [
        ['FAQ', '/faqs'],
        ['Authenticity Pledge', '/authenticity-pledge'],
        ["Buyer's Protection Plan", '/buyers-protection-plan'],
        ['U.S. Shipping', '/shipping-info'],
        ['International Shipping', '/international-shipping'],
        ['Returns', '/return-policy'],
        ['Warranty', '/warranty'],
        ['Payment Methods', '/payment-methods'],
        ['Buying Guide', '/buying-guide'],
        ['Watch Care', '/watch-care'],
        ['Wishlist', '/wishlist'],
        ['Privacy Policy', '/privacy-policy'],
        ['Terms & Conditions', '/terms-and-conditions'],
        ['Accessibility', '/accessibility'],
        ['Image Credits', '/image-credits'],
      ],
    },
  ];
  return (
    <section className="py-20 lg:py-28">
      <div className="container-x grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((s) => (
          <div key={s.title}>
            <p className="eyebrow mb-5">{s.title}</p>
            <ul className="space-y-2 text-sm text-graphite">
              {s.links.map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="transition hover:text-goldDark">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function InfoPage({ slug }) {
  useReveal([slug]);
  const page = pages[slug];
  if (!page) return null;

  const intro = {
    'why-buy-from-us': 'Four principles that separate a trustworthy exchange from a listing board.',
    'authenticity-pledge':
      'What it means, precisely, when we say a watch is Aurelian Watches certified.',
    'buyers-protection-plan':
      'Every order is covered from payment to the first day on your wrist — and beyond.',
    'shipping-info': 'Discreet, insured and fast — how every watch reaches its wrist.',
    'international-shipping': 'We deliver fully insured to more than forty countries.',
    'return-policy': 'Fourteen days to be sure — with a prepaid insured label and a fast refund.',
    warranty: 'Two years of coverage, serviced by the same watchmakers who certified the piece.',
    'payment-methods': 'Cards, wire and twelve-month plans — the terms in plain language.',
    'trust-and-compliance': 'Provenance verification, registry checks and compliance, in writing.',
    'privacy-policy': 'What we collect, why, and how to reach us about your data.',
    'terms-and-conditions': 'The terms of every sale, in plain language.',
    accessibility: 'Fine watches are for everyone — so is this website.',
  }[slug];

  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title}>
        {intro && <p>{intro}</p>}
      </PageHero>
      {page.sections && (
        <section className="py-20 lg:py-28">
          <div className="container-x max-w-3xl space-y-12">
            {page.sections.map((s) => (
              <div key={s.heading} className="reveal">
                <div className="mb-4 h-px w-10 bg-gold" />
                <h2 className="heading-display text-2xl sm:text-3xl">{s.heading}</h2>
                <p className="mt-4 text-sm leading-relaxed text-graphite">{s.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      {page.type === 'about' && <AboutBody />}
      {page.type === 'locations' && <LocationsBody />}
      {page.type === 'faq' && (
        <section className="py-20 lg:py-28">
          <div className="container-x max-w-3xl">
            <Accordion items={faq} />
          </div>
        </section>
      )}
      {page.type === 'guide' && <GuideBody steps={GUIDE} />}
      {page.type === 'care' && <GuideBody steps={CARE} />}
      {page.type === 'sitemap' && <SitemapBody />}
      {page.type === 'journal' && null}
    </>
  );
}
