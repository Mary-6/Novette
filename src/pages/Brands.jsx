import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import brands from '../data/brands';
import watches from '../data/watches';
import collections from '../data/collections';
import rolexFamilies from '../data/rolexFamilies';
import reviews from '../data/reviews';
import PageHero from '../components/layout/PageHero';
import BrandCard from '../components/brand/BrandCard';
import Button from '../components/ui/Button';
import Accordion from '../components/ui/Accordion';
import SectionHeading from '../components/ui/SectionHeading';
import WatchImage from '../components/watch/WatchImage';
import { ShopLayout } from './Shop';
import visualizationImages from '../data/visualizationImages';
import { useShopFilters } from '../hooks/useShop';
import useReveal from '../hooks/useReveal';

export function BrandsIndex() {
  useReveal([]);
  return (
    <>
      <PageHero eyebrow="The Houses" title="Our Brands">
        <p>
          Fifteen maisons, from Geneva&apos;s grande maisons to Japan&apos;s quiet masters — each
          piece authenticated by Avelor Watches&apos;s watchmakers.
        </p>
      </PageHero>
      <section className="py-20 lg:py-28">
        <div className="container-x grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => (
            <BrandCard key={b.slug} brand={b} />
          ))}
        </div>
      </section>
    </>
  );
}

function FeatureChips({ brand }) {
  const chips = [
    { label: 'Gold', to: `/shop?brand=${brand.slug}&material=Yellow gold&material=Rose gold` },
    { label: 'Two-Tone', to: `/shop?brand=${brand.slug}&bandmat=Two-Tone` },
    { label: 'Steel', to: `/shop?brand=${brand.slug}&bandmat=Steel` },
    { label: 'Heritage', to: `/shop?brand=${brand.slug}&decade=1960s,1970s,1980s,1990s,2000s` },
    { label: 'Chronograph', to: `/shop?brand=${brand.slug}&func=Chronograph` },
    { label: 'Date', to: `/shop?brand=${brand.slug}&func=Date` },
  ];
  return (
    <div className="flex flex-wrap gap-3">
      {chips.map((c) => (
        <Link
          key={c.label}
          to={c.to}
          className="border border-stone/40 px-5 py-2.5 text-xs uppercase tracking-[0.2em] transition hover:border-gold hover:text-goldDark"
        >
          {c.label}
        </Link>
      ))}
    </div>
  );
}

function FamilyChips({ brand }) {
  const { filters, setFilters } = useShopFilters();
  const quick = [
    { label: "Men's", genders: ['Men', 'Unisex'] },
    { label: "Women's", genders: ['Women'] },
    { label: 'Heritage', decades: ['1960s', '1970s', '1980s', '1990s', '2000s'] },
  ];
  const families =
    brand.slug === 'rolex'
      ? rolexFamilies.map((f) => f.name)
      : [...new Set(watches.filter((w) => w.brandSlug === brand.slug).map((w) => w.family))];

  const apply = (patch) => setFilters({ ...filters, ...patch });
  const chipCls = (on) =>
    `shrink-0 rounded-full border px-5 py-2 text-xs uppercase tracking-[0.15em] transition ${
      on ? 'border-gold bg-ink text-gold' : 'border-stone/40 hover:border-gold'
    }`;

  return (
    <div className="-mt-4 mb-2 overflow-x-auto pb-4">
      <div className="flex gap-3">
        {quick.map((c) => {
          const on =
            (c.genders && JSON.stringify(filters.genders) === JSON.stringify(c.genders)) ||
            (c.decades && JSON.stringify(filters.decades) === JSON.stringify(c.decades));
          return (
            <button
              key={c.label}
              type="button"
              className={chipCls(on)}
              onClick={() =>
                apply(
                  on
                    ? { genders: [], decades: [] }
                    : { genders: c.genders || [], decades: c.decades || [] }
                )
              }
            >
              {c.label}
            </button>
          );
        })}
        {families.map((f) => {
          const on = (filters.families || []).includes(f);
          return (
            <button
              key={f}
              type="button"
              className={chipCls(on)}
              onClick={() =>
                apply({ families: on ? filters.families.filter((x) => x !== f) : [f] })
              }
            >
              {f}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BrandLongForm({ brand }) {
  const source = watches.filter((w) => w.brandSlug === brand.slug);
  const brandReviews = reviews.slice(0, 3);
  const models =
    brand.slug === 'rolex'
      ? rolexFamilies.map((f) => ({
          name: f.name,
          to: `/rolex/${f.slug}`,
          watch: watches.find((w) => w.brandSlug === 'rolex' && w.family === f.name),
          count: source.filter((w) => w.family === f.name).length,
        }))
      : [...new Set(source.map((w) => w.model))].map((m) => ({
          name: m,
          to: `/shop?brand=${brand.slug}&q=${encodeURIComponent(m)}`,
          watch: source.find((w) => w.model === m),
          count: source.filter((w) => w.model === m).length,
        }));

  return (
    <>
      <section className="border-t border-stone/25 py-20">
        <div className="container-x">
          <SectionHeading eyebrow="The Avelor Watches Standard" title="Why Choose Us" />
          <div className="grid gap-8 md:grid-cols-3">
            {brand.whyChoose?.map((w) => (
              <div key={w.title} className="reveal border border-stone/25 p-8">
                <div className="mb-4 h-px w-10 bg-gold" />
                <p className="text-sm font-medium uppercase tracking-[0.2em]">{w.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-graphite">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-sand py-20">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <div className="reveal">
            <SectionHeading eyebrow="Heritage" title={`${brand.name}: A Brief History`} />
            <div className="space-y-4 text-sm leading-relaxed text-graphite">
              {brand.history?.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
          <div className="reveal">
            <SectionHeading eyebrow="Glossary" title={`Guide to ${brand.name} Key Terms`} />
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {brand.keyTerms?.map((t) => (
                <div key={t.term} className="border-b border-stone/25 pb-3">
                  <dt className="text-sm font-medium">{t.term}</dt>
                  <dd className="mt-1 text-sm text-graphite">{t.def}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Client Voices" title="Testimonials" />
          <div className="grid gap-8 md:grid-cols-3">
            {brandReviews.map((r) => (
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
      <section className="border-t border-stone/25 py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Catalogue" title={`${brand.name} Models`} />
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {models.map((m) => (
              <Link key={m.name} to={m.to} className="group block">
                <div className="overflow-hidden bg-sand">
                  {m.watch && (
                    <WatchImage
                      watch={m.watch}
                      view="angle"
                      className="aspect-[4/5] w-full transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="heading-display mt-3 text-lg">{m.name}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-stone">
                  {m.count} {m.count === 1 ? 'piece' : 'pieces'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-sand py-20">
        <div className="container-x max-w-3xl">
          <SectionHeading eyebrow="Answers" title="Frequently Asked Questions" />
          <Accordion items={brand.faq || []} />
        </div>
      </section>
      <section className="py-16">
        <div className="container-x">
          <p className="eyebrow mb-6">Shop {brand.name} by Feature</p>
          <FeatureChips brand={brand} />
        </div>
      </section>
    </>
  );
}

export function BrandPage() {
  const { slug } = useParams();
  const brand = brands.find((b) => b.slug === slug);
  useReveal([slug]);

  if (!brand) {
    return (
      <section className="py-32 text-center">
        <p className="eyebrow mb-4">Not Found</p>
        <h1 className="heading-display text-4xl">We don&apos;t carry that house.</h1>
        <Button to="/brands" className="mt-8">
          View all brands
        </Button>
      </section>
    );
  }

  return <BrandView brand={brand} />;
}

function BrandView({ brand, family }) {
  const [expanded, setExpanded] = useState(false);
  useReveal([brand.slug, family?.slug]);
  const source = watches.filter(
    (w) => w.brandSlug === brand.slug && (!family || w.family === family.name)
  );
  const intro = family ? family.blurb : brand.intro;
  const relatedCollections = family ? [] : collections.filter((c) => source.some(c.filter));

  return (
    <ShopLayout
      eyebrow={`${brand.country} · Est. ${brand.founded}`}
      title={family ? `Rolex ${family.name}` : `${brand.name} Watches`}
      heroImage={visualizationImages[source[0]?.slug]?.[7]}
      intro={
        <div>
          <p className="italic">{family ? '' : brand.tagline}</p>
          <p className={family ? '' : 'mt-4'}>
            {expanded || !family ? intro : `${intro.slice(0, 160)}…`}
          </p>
          {!expanded && intro.length > 160 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-2 text-xs uppercase tracking-[0.2em] text-gold underline-offset-4 hover:underline"
            >
              Read more
            </button>
          )}
        </div>
      }
      source={source}
      lockBrand
      chips={<FamilyChips brand={brand} />}
    >
      {relatedCollections.length > 0 && (
        <section className="border-t border-stone/25 py-16">
          <div className="container-x">
            <p className="eyebrow mb-6">Related Collections</p>
            <div className="flex flex-wrap gap-3">
              {relatedCollections.map((c) => (
                <Link
                  key={c.slug}
                  to={`/collections/${c.slug}`}
                  className="border border-stone/40 px-5 py-2.5 text-xs uppercase tracking-[0.2em] transition hover:border-gold hover:text-goldDark"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      <BrandLongForm brand={brand} />
    </ShopLayout>
  );
}

export function RolexHub() {
  const brand = brands.find((b) => b.slug === 'rolex');
  return <BrandView brand={brand} />;
}

export function RolexFamilyPage() {
  const { family: familySlug } = useParams();
  const brand = brands.find((b) => b.slug === 'rolex');
  const family = rolexFamilies.find((f) => f.slug === familySlug);

  if (!family) {
    return (
      <section className="py-32 text-center">
        <p className="eyebrow mb-4">Not Found</p>
        <h1 className="heading-display text-4xl">That Rolex family doesn&apos;t exist.</h1>
        <Button to="/rolex" className="mt-8">
          View all Rolex
        </Button>
      </section>
    );
  }
  return <BrandView brand={brand} family={family} />;
}
