const collections = [
  {
    slug: 'luxury-watches',
    name: 'Luxury Watches',
    eyebrow: 'The Collection',
    description:
      'Our complete offering of fine timepieces — every watch authenticated, serviced and warranted by Veymont Watches.',
    filter: () => true,
  },
  {
    slug: 'mens-watches',
    name: "Men's Watches",
    eyebrow: 'For Him',
    description:
      "From boardroom dress pieces to professional divers — a curated edit of men's watches across every major maison.",
    filter: (w) => w.gender === 'Men' || w.gender === 'Unisex',
  },
  {
    slug: 'womens-watches',
    name: "Women's Watches",
    eyebrow: 'For Her',
    description:
      "Elegant proportions and jewellery-grade finishing — ladies' pieces from Cartier, Patek Philippe, Rolex and more.",
    filter: (w) => w.gender === 'Women' || w.gender === 'Unisex',
  },
  {
    slug: 'sport-watches',
    name: 'Sport Watches',
    eyebrow: 'Engineered for Motion',
    description:
      'Integrated bracelets, racing chronographs and travel-ready complications — the watches built to be worn hard.',
    filter: (w) => ['Sport', 'Chronograph', 'GMT', 'Pilot'].includes(w.type),
  },
  {
    slug: 'dress-watches',
    name: 'Dress Watches',
    eyebrow: 'Quiet Elegance',
    description:
      'Slim cases, refined dials and the restraint of true classicism — pieces that complete formal dressing.',
    filter: (w) => w.type === 'Dress',
  },
  {
    slug: 'vintage-watches',
    name: 'Heritage Watches',
    eyebrow: 'Pieces with Provenance',
    description:
      'Earlier references with history in their dials — heritage pieces presented unworn or fully serviced, selected for originality and character.',
    filter: (w) => w.year < 2010,
  },
  {
    slug: 'dive-watches',
    name: 'Dive Watches',
    eyebrow: 'Depth Rated',
    description:
      'Rotating bezels, luminous dials and serious water resistance — professional instruments for above and below the surface.',
    filter: (w) => w.type === 'Dive',
  },
  {
    slug: 'gold-watches',
    name: 'Gold Watches',
    eyebrow: 'Precious Metal',
    description:
      'Yellow, rose and proprietary gold alloys — watches where the case material is half the statement.',
    filter: (w) =>
      /gold/i.test(w.material) ||
      /gold/i.test(w.specs.caseMaterial) ||
      ['gold', 'rosegold'].includes(w.art.material),
  },
];

export default collections;
