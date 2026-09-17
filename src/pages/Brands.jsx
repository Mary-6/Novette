import { useParams } from 'react-router-dom';
import brands from '../data/brands';
import watches from '../data/watches';
import collections from '../data/collections';
import PageHero from '../components/layout/PageHero';
import BrandCard from '../components/brand/BrandCard';
import Button from '../components/ui/Button';
import { ShopLayout } from './Shop';
import { Link } from 'react-router-dom';
import useReveal from '../hooks/useReveal';

export function BrandsIndex() {
  useReveal([]);
  return (
    <>
      <PageHero eyebrow="The Houses" title="Our Brands">
        <p>
          Fifteen maisons, from Geneva&apos;s grande maisons to Japan&apos;s quiet masters — each
          piece authenticated by Sterling Meridian&apos;s watchmakers.
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

  const source = watches.filter((w) => w.brandSlug === brand.slug);
  const relatedCollections = collections.filter((c) => source.some(c.filter));

  return (
    <>
      <PageHero
        eyebrow={`${brand.country} · Est. ${brand.founded}`}
        title={brand.name}
        tone={brand.heroTone}
      >
        <p className="italic">{brand.tagline}</p>
        <p className="mt-4">{brand.intro}</p>
      </PageHero>
      <ShopLayout source={source} lockBrand title={null} />
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
    </>
  );
}
