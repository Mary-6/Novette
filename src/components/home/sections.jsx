import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  LineChart,
  Star,
  Truck,
  Watch,
} from 'lucide-react';
import watches from '../../data/watches';
import brands from '../../data/brands';
import collections from '../../data/collections';
import rolexFamilies from '../../data/rolexFamilies';
import reviews from '../../data/reviews';
import articles from '../../data/journal';
import WatchImage from '../watch/WatchImage';
import WatchGrid from '../watch/WatchGrid';
import SectionHeading from '../ui/SectionHeading';
import Button from '../ui/Button';

const HERO_SLIDES = [
  {
    src: '/images/hero-1-speedmaster.jpg',
    brand: 'Omega',
    model: 'Speedmaster Moonwatch Professional',
    slug: 'omega-speedmaster-moonwatch-31030425001001',
  },
  {
    src: '/images/hero-2-submariner.jpg',
    brand: 'Rolex',
    model: 'Submariner Date',
    slug: 'rolex-submariner-date-126610ln',
  },
  {
    src: '/images/hero-3-nautilus.jpg',
    brand: 'Patek Philippe',
    model: 'Nautilus',
    slug: 'patek-philippe-nautilus-5711-1a',
  },
  {
    src: '/images/hero-4-royal-oak.jpg',
    brand: 'Audemars Piguet',
    model: 'Royal Oak Selfwinding',
    slug: 'audemars-piguet-royal-oak-15500st',
  },
  {
    src: '/images/hero-5-daytona-gold.jpg',
    brand: 'Rolex',
    model: 'Cosmograph Daytona',
    slug: 'rolex-daytona-two-tone-116503',
  },
  {
    src: '/images/hero-6-reverso.jpg',
    brand: 'Jaeger-LeCoultre',
    model: 'Reverso Tribute Small Seconds',
    slug: 'jaeger-lecoultre-reverso-tribute-3978480',
  },
];

function HeroControls({ index, go, step }) {
  return (
    <>
      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => step(-1)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/40 text-ivory/80 transition hover:border-gold hover:text-gold"
      >
        <ChevronLeft size={16} />
      </button>
      <div className="flex items-center gap-2">
        {HERO_SLIDES.map((s, i) => (
          <button
            key={s.slug}
            type="button"
            aria-label={`Show ${s.brand} ${s.model}`}
            onClick={() => go(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? 'w-6 bg-gold' : 'w-1.5 bg-ivory/40 hover:bg-ivory/70'
            }`}
          />
        ))}
      </div>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => step(1)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/40 text-ivory/80 transition hover:border-gold hover:text-gold"
      >
        <ChevronRight size={16} />
      </button>
    </>
  );
}

export function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = HERO_SLIDES[index];
  const go = (i) => setIndex(((i % HERO_SLIDES.length) + HERO_SLIDES.length) % HERO_SLIDES.length);
  const step = (d) => go(index + d);

  useEffect(() => {
    const t = setInterval(() => {
      if (!paused && !document.hidden) setIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section
      className="relative overflow-hidden bg-ink text-ivory"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[60vh] sm:h-[80vh]">
        {HERO_SLIDES.map((s, i) => (
          <div
            key={s.slug}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden={i !== index}
          >
            <img
              src={s.src}
              alt={`${s.brand} ${s.model}`}
              decoding="async"
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchpriority={i === 0 ? 'high' : undefined}
              className={`h-full w-full object-cover ${i === index ? 'kenburns' : ''}`}
            />
          </div>
        ))}
        <div className="absolute inset-0 hidden bg-gradient-to-r from-ink via-ink/60 to-transparent sm:block" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink to-transparent sm:hidden" />
        <div className="absolute bottom-8 right-8 hidden items-center gap-5 sm:flex">
          <Link
            key={slide.slug}
            to={`/watches/${slide.slug}`}
            className="group text-right transition-opacity duration-[1200ms]"
          >
            <span className="eyebrow block">Now showing</span>
            <span className="heading-display text-lg italic text-ivory/90 transition group-hover:text-gold">
              {slide.brand} {slide.model}
            </span>
          </Link>
          <HeroControls index={index} go={go} step={step} />
        </div>
      </div>
      <div className="container-x flex items-center justify-between gap-4 bg-ink py-4 sm:hidden">
        <Link to={`/watches/${slide.slug}`} className="group">
          <span className="eyebrow block">Now showing</span>
          <span className="heading-display text-base italic text-ivory/90 group-hover:text-gold">
            {slide.brand} {slide.model}
          </span>
        </Link>
        <HeroControls index={index} go={go} step={step} />
      </div>
      <div className="container-x relative flex flex-col pb-16 pt-6 sm:absolute sm:inset-0 sm:justify-center sm:py-0">
        <p className="eyebrow mb-5">Sterling Meridian · Est. 1987</p>
        <h1 className="heading-display max-w-2xl text-5xl font-medium leading-[1.05] sm:text-6xl lg:text-7xl">
          Timeless Luxury. <span className="italic text-gold">Iconic Timepieces.</span>
        </h1>
        <p className="mt-6 max-w-[560px] text-base leading-relaxed text-ivory/85">
          New and unworn watches from the world&apos;s great maisons — every piece inspected, timed
          and certified by our master horologists.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button to="/shop" variant="gold" className="rounded-full">
            Shop the Collection
          </Button>
          <Button
            to="/rolex"
            variant="outline"
            className="rounded-full border-ivory/40 text-ivory hover:bg-ivory hover:text-ink"
          >
            Explore Rolex
          </Button>
        </div>
        <div className="mt-14 flex flex-wrap gap-x-8 gap-y-2 text-[10px] uppercase tracking-[0.2em] text-ivory/55 sm:text-xs">
          <span>25,000+ Clients</span>
          <span>40-Point Authentication</span>
          <span>Est. 1987</span>
        </div>
      </div>
    </section>
  );
}

const INTRO_POINTS = [
  'Inspected, timed and verified in-house',
  'Free insured overnight delivery',
  'Access to rare, waitlist-only references',
  'Two-year warranty beyond manufacturer terms',
];

export function HeritageIntro() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container-x grid items-center gap-12 lg:grid-cols-2">
        <div className="reveal">
          <p className="eyebrow mb-3">The Meridian Standard</p>
          <h2 className="heading-display text-3xl font-medium sm:text-4xl lg:text-5xl">
            Where Heritage Meets Modern Elegance
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-graphite">
            <p>
              For nearly four decades Sterling Meridian has brought together the world&apos;s most
              legendary watches for collectors who value precision, heritage and lasting value —
              each reference chosen for the story it will carry onto the next wrist.
            </p>
            <p>
              Every watch undergoes a multi-point inspection by our certified horologists: serial
              numbers, movement and provenance verified against our records before listing. One
              hundred percent certified authentic — always.
            </p>
          </div>
          <ul className="mt-8 space-y-3">
            {INTRO_POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm text-graphite">
                <BadgeCheck size={16} className="mt-0.5 shrink-0 text-gold" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="reveal border border-gold/60 p-2">
          <img
            src="/images/watches/patek-philippe-nautilus-5711-1a/1.jpg"
            alt="Patek Philippe Nautilus"
            loading="lazy"
            className="aspect-[4/5] w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

export function BrandStrip() {
  return (
    <section className="border-b border-stone/25 py-10">
      <div className="container-x">
        <p className="eyebrow mb-6 text-center">Fifteen Maisons</p>
        <div className="-mx-4 flex gap-8 overflow-x-auto px-4 pb-4 sm:justify-normal">
          {brands.map((b) => {
            const sample = watches.find((w) => w.brandSlug === b.slug);
            return (
              <Link
                key={b.slug}
                to={`/brands/${b.slug}`}
                className="group flex w-24 shrink-0 flex-col items-center gap-2 text-center"
              >
                <div className="h-16 w-16 overflow-hidden rounded-full bg-sand">
                  {sample && <WatchImage watch={sample} view="detail" className="h-full w-full" />}
                </div>
                <span className="text-[10px] uppercase tracking-[0.15em] text-graphite transition group-hover:text-goldDark">
                  {b.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function RolexFamiliesSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="The Crown"
          title="Shop Rolex Watches"
          action={
            <Button to="/rolex" variant="outline" className="rounded-full">
              View All Models
            </Button>
          }
        />
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {rolexFamilies.slice(0, 6).map((f) => {
            const rep = watches.find((w) => w.family === f.name);
            return (
              <Link key={f.slug} to={`/rolex/${f.slug}`} className="group block text-center">
                <div className="overflow-hidden bg-sand">
                  {rep && (
                    <WatchImage
                      watch={rep}
                      view="angle"
                      className="aspect-[4/5] w-full transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="heading-display mt-4 text-lg group-hover:text-goldDark">{f.name}</p>
              </Link>
            );
          })}
        </div>
        <div className="mt-10 text-center sm:hidden">
          <Button to="/rolex" variant="outline" className="rounded-full">
            View All Models
          </Button>
        </div>
      </div>
    </section>
  );
}

export function NewArrivals() {
  const freshCount = watches.filter((w) => w.isNew).length;
  const list = [...watches].sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt)).slice(0, 6);
  return (
    <section className="bg-sand py-20 lg:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow={`${freshCount} added this week`}
          title="New Arrivals"
          action={
            <Button to="/shop?sort=newest" variant="outline" className="rounded-full">
              Shop New Arrivals
            </Button>
          }
        />
        <WatchGrid watches={list} className="lg:grid-cols-3 xl:grid-cols-6" />
      </div>
    </section>
  );
}

export function CollectionsCarousel() {
  const ref = useRef(null);
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  return (
    <section className="py-20 lg:py-28">
      <div className="container-x">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-3">Curated Edits</p>
            <h2 className="heading-display text-3xl font-medium sm:text-4xl lg:text-5xl">
              Shop Collections
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scroll(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone/40 transition hover:border-gold"
              aria-label="Previous"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone/40 transition hover:border-gold"
              aria-label="Next"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
      >
        {collections.map((c) => {
          const sample = watches.filter(c.filter)[0];
          return (
            <Link
              key={c.slug}
              to={`/collections/${c.slug}`}
              className="group w-64 shrink-0 snap-start"
            >
              <div className="overflow-hidden bg-sand">
                {sample && (
                  <WatchImage
                    watch={sample}
                    view="angle"
                    className="aspect-[4/5] w-full transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <p className="eyebrow mt-4">{c.eyebrow}</p>
              <p className="heading-display mt-1 text-xl">{c.name}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function MarketIndex() {
  return (
    <section className="bg-ink py-20 text-ivory lg:py-28">
      <div className="container-x grid items-center gap-10 lg:grid-cols-[auto_1fr_auto]">
        <LineChart size={56} className="text-gold" strokeWidth={1} />
        <div>
          <p className="eyebrow mb-3">Pricing Intelligence</p>
          <h2 className="heading-display text-3xl font-medium sm:text-4xl">
            The Meridian Market Index
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ivory/70">
            Each quarter our analysts publish an internal measure of the certified market for new
            and unworn watches — built from our completed sales, verified dealer transactions and
            observed auction results. It reads what watches actually change hands for, not what
            sellers ask.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ivory/70">
            It is why every price on this site is the same whether you call, visit, or check out at
            midnight — and why our listings move with the market rather than against it.
          </p>
        </div>
        <Button to="/journal/meridian-market-index" variant="gold" className="rounded-full">
          View Report
        </Button>
      </div>
    </section>
  );
}

export function JournalPreview() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="Editorial"
          title="From the Journal"
          action={
            <Button to="/journal" variant="outline" className="rounded-full">
              View All
            </Button>
          }
        />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {articles.slice(0, 6).map((a) => (
            <Link
              key={a.slug}
              to={`/journal/${a.slug}`}
              className="group block border border-stone/25 p-8 transition hover:border-gold"
            >
              <p className="eyebrow">{a.category}</p>
              <p className="heading-display mt-3 text-2xl leading-snug group-hover:text-goldDark">
                {a.title}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-graphite">{a.dek}</p>
              <p className="mt-5 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-goldDark">
                {a.readTime} <ArrowRight size={12} />
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PromiseSection() {
  const items = [
    {
      icon: LineChart,
      title: 'Pricing Transparency',
      text: 'Every price is set against the Meridian Market Index — measured, transparent and fair.',
    },
    {
      icon: Watch,
      title: 'Real-Time Inventory',
      text: 'Every listing is physically in our vault — inspected, timed and ready to ship today.',
    },
    {
      icon: Truck,
      title: 'Free Overnight Shipping',
      text: 'Insured, discreet and signature-required — complimentary overnight delivery on us.',
      to: '/shipping-info',
    },
    {
      icon: BadgeCheck,
      title: 'Authentication Pledge',
      text: 'A 40-point bench inspection and a signed certificate accompany every timepiece.',
      to: '/authenticity-pledge',
    },
  ];
  return (
    <section className="bg-sand py-20 lg:py-28">
      <div className="container-x">
        <SectionHeading eyebrow="Our Word" title="The Assurance of Excellence" />
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div key={it.title} className="reveal">
              <it.icon size={26} className="text-gold" strokeWidth={1.5} />
              <p className="mt-4 text-sm font-medium uppercase tracking-[0.2em]">{it.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-graphite">{it.text}</p>
              {it.to && (
                <Link
                  to={it.to}
                  className="mt-3 inline-block text-xs uppercase tracking-[0.2em] text-goldDark underline-offset-4 hover:underline"
                >
                  Learn more
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutBlock() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-2">
        <div className="reveal">
          <p className="eyebrow mb-3">About Sterling Meridian</p>
          <h2 className="heading-display text-3xl font-medium sm:text-4xl lg:text-5xl">
            Our Story
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-graphite">
            <p>
              Founded in 1987 as a Mayfair atelier restoring earlier Rolex references, Sterling
              Meridian grew from a two-bench workshop into a destination trusted by more than 25,000
              clients.
            </p>
            <p>
              We moved online in 2004 and opened our Madison Avenue boutique in 2015, but the rule
              has never changed: nothing is offered that our own watchmakers haven&apos;t opened,
              inspected and certified.
            </p>
            <p>
              Every listing is priced against the Meridian Market Index, shipped fully insured, and
              covered by a two-year warranty — because a fine watch should be the safest purchase
              you make all year.
            </p>
          </div>
          <Button to="/about-us" variant="outline" className="mt-8 rounded-full">
            Read our story
          </Button>
        </div>
        <blockquote className="reveal flex flex-col justify-center border border-stone/25 bg-sand p-10">
          <p className="heading-display text-2xl italic leading-relaxed text-graphite">
            “A watch outlives trends and owners alike. Our job is simply to deserve the trust of
            whoever wears it next.”
          </p>
          <footer className="mt-6 text-xs uppercase tracking-[0.25em]">
            Eleanor Whitcombe
            <span className="block mt-1 text-stone">Founder & Chairwoman</span>
          </footer>
        </blockquote>
      </div>
    </section>
  );
}

export function Reviews() {
  return (
    <section id="reviews" className="bg-ink py-20 text-ivory lg:py-28">
      <div className="container-x">
        <SectionHeading eyebrow="25,000+ Clients" title="What Clients Are Saying" light />
        <div className="grid gap-8 md:grid-cols-3">
          {reviews.slice(0, 3).map((r) => (
            <figure key={r.name} className="reveal border border-graphite p-8">
              <div className="flex gap-1 text-gold">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-ivory/80">
                “{r.text}”
              </blockquote>
              <figcaption className="mt-5 text-xs uppercase tracking-[0.2em]">
                {r.name} <span className="text-ivory/40">· {r.location}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyShop() {
  const points = [
    'Every watch authenticated by master watchmakers, in-house',
    'Pricing set by the Meridian Market Index — real transaction data',
    'Real-time inventory: listed means in our vault and ready',
    'Free insured overnight shipping, signature on delivery',
    'Two-year warranty serviced on our own benches',
    '14-day returns, prepaid insured label included',
  ];
  return (
    <section className="py-20 lg:py-28">
      <div className="container-x max-w-4xl">
        <SectionHeading eyebrow="The Difference" title="The Standard of Absolute Quality" />
        <ul className="grid gap-x-12 gap-y-5 sm:grid-cols-2">
          {points.map((p) => (
            <li key={p} className="reveal flex items-start gap-3 text-sm text-graphite">
              <Clock size={15} className="mt-0.5 shrink-0 text-gold" />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function PopularSearches() {
  const cols = [
    ['Rolex Submariner', 'Rolex Datejust 36', 'Rolex GMT-Master II'],
    ['Omega Speedmaster', 'Omega Seamaster 300M'],
    ['Cartier Santos', 'Cartier Tank', 'Cartier Panthère'],
    ['Patek Nautilus', 'Patek Aquanaut'],
    ['AP Royal Oak', 'Tudor Black Bay 58', 'Vacheron Overseas'],
  ];
  const [open, setOpen] = useState(false);
  return (
    <section className="border-t border-stone/25 py-16">
      <div className="container-x">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-graphite transition hover:text-gold"
        >
          Popular Searches <span className="text-gold">{open ? '–' : '+'}</span>
        </button>
        {open && (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {cols.map((col, i) => (
              <ul key={i} className="space-y-2 text-sm text-graphite">
                {col.map((s) => (
                  <li key={s}>
                    <Link
                      to={`/shop?q=${encodeURIComponent(s)}`}
                      className="transition hover:text-goldDark"
                    >
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  return (
    <section className="bg-ink py-20 text-ivory lg:py-28">
      <div className="container-x max-w-2xl text-center">
        <p className="eyebrow mb-4">The Meridian List</p>
        <h2 className="heading-display text-4xl font-medium sm:text-5xl">
          Timeless Style, Delivered.
        </h2>
        <p className="mt-4 text-sm text-ivory/60">
          New arrivals, private offerings and market notes — once a month, never more.
        </p>
        {done ? (
          <p className="mt-8 text-sm text-gold">Welcome aboard — check your inbox.</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email.includes('@')) setDone(true);
            }}
            className="mx-auto mt-8 flex max-w-md border border-graphite"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full bg-transparent px-4 py-3.5 text-sm outline-none placeholder:text-stone"
            />
            <button
              type="submit"
              className="bg-gold px-6 text-xs uppercase tracking-[0.2em] text-ink transition hover:bg-goldLight"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
