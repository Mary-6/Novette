const HERO_BACKDROPS = [
  '/images/hero-1-speedmaster.jpg',
  '/images/hero-2-submariner.jpg',
  '/images/hero-3-nautilus.jpg',
  '/images/hero-4-royal-oak.jpg',
  '/images/hero-5-daytona-gold.jpg',
  '/images/hero-6-reverso.jpg',
];

function pickBackdrop(seed) {
  let h = 0;
  for (const ch of String(seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return HERO_BACKDROPS[h % HERO_BACKDROPS.length];
}

export default function PageHero({ eyebrow, title, children, image }) {
  const src = image || pickBackdrop(title);
  return (
    <section className="relative isolate overflow-hidden bg-ink py-20 text-ivory lg:py-28">
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-[70%_center] sm:object-center"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/70 to-ink/15" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/70 via-transparent to-ink/20" />
      <div className="container-x">
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h1 className="heading-display max-w-3xl text-4xl font-medium sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {children && (
          <div className="mt-6 max-w-2xl text-base leading-relaxed text-ivory/75">{children}</div>
        )}
      </div>
      <div className="container-x mt-12">
        <div className="h-px bg-gold/40" />
      </div>
    </section>
  );
}
