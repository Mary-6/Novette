import useReveal from '../hooks/useReveal';
import PageHero from '../components/layout/PageHero';
import SectionHeading from '../components/ui/SectionHeading';
import Button from '../components/ui/Button';

const values = [
  {
    title: 'Authenticity',
    text: 'No watch enters our stock without passing a 40-point inspection in our own workshop. If a dial has been refinished, we say so.',
  },
  {
    title: 'Craftsmanship',
    text: 'Our servicing is done by master watchmakers trained on the calibres they work on — never outsourced, never rushed.',
  },
  {
    title: 'Quality',
    text: 'We buy fewer watches than we are offered, on purpose. Condition and provenance come before margin.',
  },
  {
    title: 'Experience',
    text: 'From first enquiry to the clasp on your wrist, a specialist — not a sales queue — looks after you.',
  },
];

const timeline = [
  {
    year: '1987',
    text: 'Horologist Edward Sterling opens a two-bench repair atelier off Bond Street, London.',
  },
  {
    year: '1994',
    text: 'The first curated sales room opens — twelve watches, all serviced in-house.',
  },
  {
    year: '2003',
    text: 'Sterling Meridian launches its authentication certificate, now standard across our stock.',
  },
  {
    year: '2011',
    text: 'The New York boutique opens on Madison Avenue, joining the London flagship.',
  },
  {
    year: '2019',
    text: 'Our in-house service centre earns recognition from collectors on three continents.',
  },
  {
    year: 'Today',
    text: 'A team of watchmakers and specialists serving clients in more than forty countries.',
  },
];

export default function About() {
  useReveal([]);
  return (
    <>
      <PageHero eyebrow="Est. 1987 · London & New York" title="A life measured in calibres.">
        <p>
          Sterling Meridian began not as a shop but as a workbench — and the workbench still sits at
          the centre of everything we do.
        </p>
      </PageHero>
      <section className="py-20 lg:py-28">
        <div className="container-x grid gap-16 lg:grid-cols-2">
          <div className="reveal">
            <SectionHeading eyebrow="Our Story" title="From repair bench to maison of trust." />
            <div className="space-y-5 text-sm leading-relaxed text-graphite">
              <p>
                In 1987, horologist Edward Sterling rented a two-bench atelier off Bond Street to
                restore the complicated pocket watches auction houses wouldn&apos;t touch. Clients
                began asking him to find watches for them — and then to stand behind them.
              </p>
              <p>
                By 1994 the workshop had grown into a sales room built on a simple rule: we would
                only offer a watch our own watchmakers had opened, inspected and certified. That
                rule has never changed.
              </p>
              <p>
                Today, with a flagship in London and a boutique on Madison Avenue, Sterling Meridian
                serves collectors in more than forty countries — while every timepiece still passes
                through the same workshop, under the same loupe, as it did in 1987.
              </p>
            </div>
          </div>
          <div className="reveal">
            <SectionHeading eyebrow="By the Numbers" title="Thirty-eight years, one standard." />
            <dl className="grid grid-cols-2 gap-px border border-stone/25 bg-stone/25">
              {[
                ['38+', 'Years in the trade'],
                ['40', 'Point authentication process'],
                ['2yr', 'Warranty on every watch'],
                ['15', 'Maisons represented'],
              ].map(([n, l]) => (
                <div key={l} className="bg-ivory p-8 text-center">
                  <dt className="heading-display text-4xl text-goldDark">{n}</dt>
                  <dd className="mt-2 text-[10px] uppercase tracking-[0.25em] text-stone">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
      <section className="bg-sand py-20 lg:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="What We Stand For" title="Our Values" />
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="reveal">
                <div className="mb-4 h-px w-10 bg-gold" />
                <p className="text-sm font-medium uppercase tracking-[0.2em]">{v.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-graphite">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 lg:py-28">
        <div className="container-x max-w-3xl">
          <SectionHeading eyebrow="The Meridian Line" title="Our Timeline" />
          <ol className="border-l border-gold/50">
            {timeline.map((t) => (
              <li key={t.year} className="reveal relative pb-10 pl-8 last:pb-0">
                <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-gold" />
                <p className="eyebrow">{t.year}</p>
                <p className="mt-2 text-sm leading-relaxed text-graphite">{t.text}</p>
              </li>
            ))}
          </ol>
          <Button to="/shop" className="mt-12">
            Browse the collection
          </Button>
        </div>
      </section>
    </>
  );
}
