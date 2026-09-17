import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, ShieldCheck, Star, Truck, Watch } from 'lucide-react';
import watches from '../../data/watches';
import brands from '../../data/brands';
import collections from '../../data/collections';
import reviews from '../../data/reviews';
import WatchArt from '../watch/WatchArt';
import WatchGrid from '../watch/WatchGrid';
import SectionHeading from '../ui/SectionHeading';
import Button from '../ui/Button';

export function Hero() {
  const hero = watches.find((w) => w.slug === 'patek-philippe-nautilus-5711-1a');
  return (
    <section className="bg-ink text-ivory">
      <div className="container-x grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <p className="eyebrow mb-5">Fine Timepieces · Est. 1987 · London & New York</p>
          <h1 className="heading-display text-5xl font-medium leading-[1.05] sm:text-6xl lg:text-7xl">
            Time, <span className="italic text-gold">Curated.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ivory/70">
            Pre-owned and new watches from the world&apos;s great maisons — each authenticated,
            serviced and warranted by our master watchmakers.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button to="/shop" variant="gold">
              Shop the collection
            </Button>
            <Button
              to="/brands"
              variant="outline"
              className="border-ivory/40 text-ivory hover:bg-ivory hover:text-ink"
            >
              Explore brands
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-2 text-[10px] uppercase tracking-[0.2em] text-ivory/50 sm:text-xs">
            <span>40-Point Authentication</span>
            <span>2-Year Warranty</span>
            <span>Insured Delivery</span>
          </div>
        </div>
        <div className="mx-auto w-full max-w-md">
          <WatchArt art={hero.art} className="w-full" />
        </div>
      </div>
      <div className="container-x pb-10">
        <div className="h-px bg-gold/40" />
      </div>
    </section>
  );
}

export function FeaturedWatches() {
  const list = watches.filter((w) => w.isFeatured).slice(0, 4);
  return (
    <section className="py-20 lg:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="Handpicked"
          title="Featured Timepieces"
          action={
            <Button to="/shop" variant="outline">
              View all
            </Button>
          }
        />
        <WatchGrid watches={list} />
      </div>
    </section>
  );
}

export function NewArrivals() {
  const list = watches.filter((w) => w.isNew).slice(0, 4);
  return (
    <section className="bg-sand py-20 lg:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="Just In"
          title="New Arrivals"
          action={
            <Button to="/shop?sort=newest" variant="outline">
              View all
            </Button>
          }
        />
        <WatchGrid watches={list} />
      </div>
    </section>
  );
}

export function FeaturedBrands() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="The Houses"
          title="Featured Brands"
          action={
            <Button to="/brands" variant="outline">
              View all brands
            </Button>
          }
        />
        <div className="grid grid-cols-2 gap-px border border-stone/25 bg-stone/25 sm:grid-cols-3 lg:grid-cols-5">
          {brands.map((b) => (
            <Link
              key={b.slug}
              to={`/brands/${b.slug}`}
              className="group flex flex-col items-center justify-center gap-1 bg-ivory px-4 py-8 text-center transition hover:bg-sand"
            >
              <span className="heading-display text-lg leading-tight group-hover:text-goldDark sm:text-xl">
                {b.name}
              </span>
              <span className="text-[9px] uppercase tracking-[0.3em] text-stone">
                Est. {b.founded}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PopularWatches() {
  const list = [...watches].sort((a, b) => b.popularity - a.popularity).slice(0, 4);
  return (
    <section className="bg-ink py-20 text-ivory lg:py-28">
      <div className="container-x">
        <SectionHeading eyebrow="Most Coveted" title="Popular Right Now" light />
        <WatchGrid watches={list} />
      </div>
    </section>
  );
}

export function CollectionsShowcase() {
  const showcase = collections.filter((c) =>
    ['mens-watches', 'womens-watches', 'vintage-watches', 'dive-watches'].includes(c.slug)
  );
  return (
    <section className="py-20 lg:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="Curated Edits"
          title="Shop by Collection"
          action={
            <Button to="/collections" variant="outline">
              All collections
            </Button>
          }
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {showcase.map((c, i) => {
            const sample = watches.filter(c.filter)[
              i % Math.max(1, watches.filter(c.filter).length)
            ];
            return (
              <Link key={c.slug} to={`/collections/${c.slug}`} className="group block">
                <div className="overflow-hidden bg-sand">
                  {sample && (
                    <WatchArt
                      art={sample.art}
                      view="angle"
                      className="aspect-[3/4] w-full transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="eyebrow">{c.eyebrow}</p>
                    <p className="heading-display mt-1 text-xl">{c.name}</p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-gold transition group-hover:translate-x-1"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function TrustSection() {
  const items = [
    {
      icon: BadgeCheck,
      title: 'Master Authentication',
      text: 'Every timepiece passes a 40-point inspection by our master watchmakers before listing.',
    },
    {
      icon: ShieldCheck,
      title: 'Two-Year Warranty',
      text: 'Movement and functions are covered for a full two years — serviced in our own atelier.',
    },
    {
      icon: Truck,
      title: 'Insured Worldwide Shipping',
      text: 'Discreet packaging, full-value insurance and signature delivery, complimentary over $5,000.',
    },
    {
      icon: Watch,
      title: 'Concierge Service',
      text: 'Speak with a specialist in London or New York for sourcing, sizing and private viewings.',
    },
  ];
  return (
    <section className="bg-sand py-20 lg:py-28">
      <div className="container-x grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.title} className="reveal">
            <it.icon size={26} className="text-gold" strokeWidth={1.5} />
            <p className="mt-4 text-sm font-medium uppercase tracking-[0.2em]">{it.title}</p>
            <p className="mt-3 text-sm leading-relaxed text-graphite">{it.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Reviews() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container-x">
        <SectionHeading eyebrow="Client Voices" title="Trusted Worldwide" />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <figure key={r.name} className="reveal border border-stone/25 p-8">
              <div className="flex gap-1 text-gold">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-graphite">
                “{r.text}”
              </blockquote>
              <figcaption className="mt-5 text-xs uppercase tracking-[0.2em]">
                {r.name} <span className="text-stone">· {r.location}</span>
              </figcaption>
            </figure>
          ))}
        </div>
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
        <h2 className="heading-display text-4xl font-medium sm:text-5xl">First to know.</h2>
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
