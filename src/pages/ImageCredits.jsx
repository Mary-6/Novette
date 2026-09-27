import watches from '../data/watches';
import imageCredits from '../data/imageCredits.json';
import { brandBySlug } from '../data/utils';
import PageHero from '../components/layout/PageHero';
import WatchImage from '../components/watch/WatchImage';
import useReveal from '../hooks/useReveal';

export default function ImageCredits() {
  useReveal([]);
  const credited = watches.filter((w) => imageCredits[w.slug]?.length);
  return (
    <>
      <PageHero eyebrow="Attribution" title="Image Credits">
        <p>
          Product imagery is original Lumont Watches studio photography; licensed source
          photographs retained in the project are credited below, each image is credited to its
          author and linked to its file page.
        </p>
      </PageHero>
      <section className="py-16 lg:py-24">
        <div className="container-x grid gap-10 md:grid-cols-2 xl:grid-cols-3">
          {credited.map((w) => (
            <div key={w.slug} className="reveal border border-stone/25 p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 shrink-0 bg-sand">
                  <WatchImage watch={w} className="aspect-square w-full" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-stone">
                    {brandBySlug(w.brandSlug)?.name}
                  </p>
                  <p className="heading-display text-lg leading-snug">{w.model}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-1.5 text-xs text-graphite">
                {imageCredits[w.slug].map((c, i) => (
                  <li key={c.file}>
                    <a
                      href={c.pageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-goldDark underline underline-offset-2"
                    >
                      Photo {i + 1}: {c.title}
                    </a>
                    <span className="text-stone">
                      {' '}
                     , {c.author} · {c.license}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
