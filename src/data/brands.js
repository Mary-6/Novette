import brandContent from './brandContent';

const brands = [
  {
    slug: 'rolex',
    name: 'Rolex',
    country: 'Switzerland',
    founded: 1905,
    tagline: 'A crown for every achievement.',
    intro:
      'Founded in London before finding its permanent home in Geneva, Rolex defined the modern wristwatch with waterproof cases and perpetual movements. Its tool watches — the Submariner, GMT-Master and Daytona among them — have become the reference points against which all luxury sport watches are measured.',
    heroTone: 'dark',
  },
  {
    slug: 'patek-philippe',
    name: 'Patek Philippe',
    country: 'Switzerland',
    founded: 1839,
    tagline: 'You never actually own one.',
    intro:
      'Independent and family-owned since 1839, Patek Philippe stands at the summit of haute horlogerie. From the elegant Calatrava to the coveted Nautilus, each reference is finished to a standard that has made the Geneva manufacture the most collected name in watchmaking.',
    heroTone: 'light',
  },
  {
    slug: 'audemars-piguet',
    name: 'Audemars Piguet',
    country: 'Switzerland',
    founded: 1875,
    tagline: 'To break the rules, you must first master them.',
    intro:
      'Still owned by the founding families, Audemars Piguet has pushed high watchmaking forward from the Vallée de Joux for nearly 150 years. The Royal Oak, designed in 1972, remains the definitive luxury steel sports watch and a pillar of any serious collection.',
    heroTone: 'dark',
  },
  {
    slug: 'richard-mille',
    name: 'Richard Mille',
    country: 'Switzerland',
    founded: 2001,
    tagline: 'A racing machine on the wrist.',
    intro:
      'Richard Mille arrived in 2001 with a single idea: apply the materials and engineering of Formula 1 to watchmaking. Tonneau cases, skeletonised movements and extreme lightness have made the marque the most recognisable — and most exclusive — of the modern era.',
    heroTone: 'dark',
  },
  {
    slug: 'omega',
    name: 'Omega',
    country: 'Switzerland',
    founded: 1848,
    tagline: 'Exact time for life.',
    intro:
      'Omega supplied watches to Olympic timers, combat divers and NASA astronauts — the Speedmaster remains the only watch worn on the Moon. Today the Biel manufacture pairs that heritage with industry-leading Master Chronometer movements.',
    heroTone: 'dark',
  },
  {
    slug: 'cartier',
    name: 'Cartier',
    country: 'France',
    founded: 1847,
    tagline: 'The jeweller of kings.',
    intro:
      'Cartier shaped the wristwatch as an object of design: the Santos of 1904 was among the first purpose-built wristwatches, and the Tank has been a style icon for over a century. Few maisons bridge jewellery and watchmaking with such effortless grace.',
    heroTone: 'light',
  },
  {
    slug: 'breitling',
    name: 'Breitling',
    country: 'Switzerland',
    founded: 1884,
    tagline: 'Instruments for professionals.',
    intro:
      "Breitling built its reputation on the chronograph and on aviation — the Navitimer's circular slide rule made it the pilot's companion of the jet age. Robust, legible and unapologetically technical, the manufacture's watches are built to be used.",
    heroTone: 'dark',
  },
  {
    slug: 'tag-heuer',
    name: 'TAG Heuer',
    country: 'Switzerland',
    founded: 1860,
    tagline: 'Swiss avant-garde since 1860.',
    intro:
      "From timing motor races to the wrist of champions, TAG Heuer is chronograph royalty. The Carrera and the square-cased Monaco carry the DNA of motorsport's golden era into thoroughly modern executions.",
    heroTone: 'dark',
  },
  {
    slug: 'tudor',
    name: 'Tudor',
    country: 'Switzerland',
    founded: 1926,
    tagline: 'Born to dare.',
    intro:
      'Created by Rolex founder Hans Wilsdorf, Tudor offered professional-grade tool watches at an attainable price — and the French and US navies took notice. The modern Black Bay line distils that heritage into some of the best value in Swiss watchmaking.',
    heroTone: 'dark',
  },
  {
    slug: 'hublot',
    name: 'Hublot',
    country: 'Switzerland',
    founded: 1980,
    tagline: 'The art of fusion.',
    intro:
      "Hublot made its name pairing a gold case with a rubber strap — a scandal in 1980, a signature ever since. The Big Bang's bold construction and exotic materials embody the manufacture's philosophy of fusion between tradition and innovation.",
    heroTone: 'dark',
  },
  {
    slug: 'iwc',
    name: 'IWC Schaffhausen',
    country: 'Switzerland',
    founded: 1868,
    tagline: 'Engineering for men.',
    intro:
      "The only great Swiss manufacture east of the Rhine, IWC builds watches with an engineer's clarity. The Portugieser's marine-chronometer elegance and the Pilot's instrument-like legibility have defined the brand since the 1930s.",
    heroTone: 'light',
  },
  {
    slug: 'panerai',
    name: 'Panerai',
    country: 'Italy',
    founded: 1860,
    tagline: 'Laboratorio di idee.',
    intro:
      "Born in Florence as instrument-maker to the Italian Navy's combat divers, Panerai turned oversized cushion cases and luminous dials into an unmistakable design language. The Luminor's crown-protecting bridge is among the most recognisable silhouettes in watchmaking.",
    heroTone: 'dark',
  },
  {
    slug: 'jaeger-lecoultre',
    name: 'Jaeger-LeCoultre',
    country: 'Switzerland',
    founded: 1833,
    tagline: 'The watchmaker of watchmakers.',
    intro:
      "The Vallée de Joux's great movement factory has produced over a thousand calibres and supplied many of the finest maisons. Its own creations — the reversible Reverso and the elegant Master line — marry technical depth with quiet refinement.",
    heroTone: 'light',
  },
  {
    slug: 'vacheron-constantin',
    name: 'Vacheron Constantin',
    country: 'Switzerland',
    founded: 1755,
    tagline: 'The oldest name in watchmaking.',
    intro:
      'In continuous operation since 1755, Vacheron Constantin is the longest-running watch manufacture in the world. The Overseas and Patrimony collections express an unbroken tradition of Genevan haute horlogerie at its most refined.',
    heroTone: 'light',
  },
  {
    slug: 'grand-seiko',
    name: 'Grand Seiko',
    country: 'Japan',
    founded: 1960,
    tagline: 'The nature of time.',
    intro:
      'Grand Seiko pursues a Japanese ideal of precision, legibility and quiet beauty. Its Spring Drive movements and hand-finished cases — exemplified by the celebrated Snowflake — rival anything produced in Switzerland.',
    heroTone: 'light',
  },
];

const merged = brands.map((b) => ({ ...b, ...(brandContent[b.slug] || {}) }));

export default merged;
