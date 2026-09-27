import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import articles from '../data/journal';
import PageHero from '../components/layout/PageHero';
import Button from '../components/ui/Button';
import useReveal from '../hooks/useReveal';

export function JournalIndex() {
  useReveal([]);
  return (
    <>
      <PageHero eyebrow="Editorial" title="The Journal">
        <p>
          Original essays and market notes from our specialists, written for people who wear what
          they collect.
        </p>
      </PageHero>
      <section className="py-20 lg:py-28">
        <div className="container-x grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <Link
              key={a.slug}
              to={`/journal/${a.slug}`}
              className="group block border border-stone/25 p-8 transition hover:border-gold"
            >
              <p className="eyebrow">{a.category}</p>
              <h2 className="heading-display mt-3 text-2xl leading-snug group-hover:text-goldDark">
                {a.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-graphite">{a.dek}</p>
              <p className="mt-5 text-xs uppercase tracking-[0.2em] text-stone">
                {a.date} · {a.readTime}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

export function JournalArticle() {
  const { slug } = useParams();
  useReveal([slug]);
  const article = articles.find((a) => a.slug === slug);
  if (!article) {
    return (
      <section className="py-32 text-center">
        <p className="eyebrow mb-4">Not Found</p>
        <h1 className="heading-display text-4xl">That article doesn&apos;t exist.</h1>
        <Button to="/journal" className="mt-8">
          Back to the Journal
        </Button>
      </section>
    );
  }
  const idx = articles.indexOf(article);
  const next = articles[(idx + 1) % articles.length];
  return (
    <>
      <article className="py-20 lg:py-28">
        <div className="container-x max-w-2xl">
          <Link
            to="/journal"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-stone transition hover:text-gold"
          >
            <ArrowLeft size={12} /> Journal
          </Link>
          <p className="eyebrow mt-8">{article.category}</p>
          <h1 className="heading-display mt-3 text-4xl font-medium leading-tight sm:text-5xl">
            {article.title}
          </h1>
          <p className="mt-4 text-sm text-stone">
            {article.date} · {article.readTime}
          </p>
          <p className="mt-8 heading-display text-xl italic leading-relaxed text-graphite">
            {article.dek}
          </p>
          <div className="mt-8 space-y-6 border-t border-stone/25 pt-8">
            {article.body.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-graphite sm:text-base">
                {p}
              </p>
            ))}
          </div>
        </div>
      </article>
      <section className="border-t border-stone/25 py-16">
        <div className="container-x max-w-2xl">
          <Link to={`/journal/${next.slug}`} className="group block">
            <p className="eyebrow">Next in the Journal</p>
            <p className="heading-display mt-3 flex items-center gap-3 text-2xl group-hover:text-goldDark">
              {next.title} <ArrowRight size={18} />
            </p>
          </Link>
        </div>
      </section>
    </>
  );
}
