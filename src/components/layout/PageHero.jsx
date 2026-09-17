export default function PageHero({ eyebrow, title, children, tone = 'dark' }) {
  const dark = tone === 'dark';
  return (
    <section className={`${dark ? 'bg-ink text-ivory' : 'bg-sand text-ink'} py-20 lg:py-28`}>
      <div className="container-x">
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h1 className="heading-display max-w-3xl text-4xl font-medium sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {children && (
          <div
            className={`mt-6 max-w-2xl text-base leading-relaxed ${dark ? 'text-ivory/70' : 'text-graphite'}`}
          >
            {children}
          </div>
        )}
      </div>
      <div className="container-x mt-12">
        <div className="h-px bg-gold/40" />
      </div>
    </section>
  );
}
