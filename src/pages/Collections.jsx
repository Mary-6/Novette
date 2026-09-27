import { Link, useParams } from 'react-router-dom';
import collections from '../data/collections';
import watches from '../data/watches';
import PageHero from '../components/layout/PageHero';
import Button from '../components/ui/Button';
import WatchImage from '../components/watch/WatchImage';
import { ShopLayout } from './Shop';
import useReveal from '../hooks/useReveal';
import visualizationImages from '../data/visualizationImages';

export function CollectionsIndex() {
  useReveal([]);
  return (
    <>
      <PageHero eyebrow="Curated Edits" title="Collections">
        <p>
          Eight edits of the collection, by style, by wrist, by metal, each one a different way
          into the catalogue.
        </p>
      </PageHero>
      <section className="py-20 lg:py-28">
        <div className="container-x grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((c) => {
            const list = watches.filter(c.filter);
            const sample = list[0];
            return (
              <Link key={c.slug} to={`/collections/${c.slug}`} className="group block">
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
                <p className="heading-display mt-1 text-2xl">{c.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-stone">
                  {list.length} {list.length === 1 ? 'piece' : 'pieces'}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}

export function CollectionPage() {
  const { slug } = useParams();
  const collection = collections.find((c) => c.slug === slug);
  useReveal([slug]);

  if (!collection) {
    return (
      <section className="py-32 text-center">
        <p className="eyebrow mb-4">Not Found</p>
        <h1 className="heading-display text-4xl">That collection doesn&apos;t exist.</h1>
        <Button to="/collections" className="mt-8">
          View all collections
        </Button>
      </section>
    );
  }

  const source = watches.filter(collection.filter);
  return (
    <ShopLayout
      eyebrow={collection.eyebrow}
      title={collection.name}
      intro={<p>{collection.description}</p>}
      source={source}
      heroImage={visualizationImages[source[0]?.slug]?.[7]}
    />
  );
}
