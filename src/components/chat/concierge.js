import watches from '../../data/watches';
import brands from '../../data/brands';
import { formatPrice } from '../../data/utils';

const GREETING_OPTIONS = [
  'Find a watch',
  'Track my order',
  'Shipping & returns',
  'Authenticity & warranty',
  'Book a private viewing',
];

const pick = (list, n = 3) => [...list].sort((a, b) => b.popularity - a.popularity).slice(0, n);

export function greeting(user) {
  const h = new Date().getHours();
  const part = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  const first = (user?.name || 'there').split(' ')[0];
  return {
    text: `Good ${part}, ${first} — welcome to Veymont. I'm your personal concierge. How may I assist today?`,
    options: GREETING_OPTIONS,
  };
}

const TYPE_WORDS = [
  ['dive', 'Dive'],
  ['diver', 'Dive'],
  ['dress', 'Dress'],
  ['chrono', 'Chronograph'],
  ['gmt', 'GMT'],
  ['pilot', 'Pilot'],
  ['sport', 'Sport'],
];

function matchWatches(text) {
  const t = text.toLowerCase();
  const byBrand = brands.filter((b) => {
    const name = b.name.toLowerCase();
    const words = name.split(' ');
    return t.includes(name) || t.includes(b.slug) || (words.length > 1 && t.includes(words[0]));
  });
  let list = [];
  if (byBrand.length) {
    list = watches.filter((w) => byBrand.some((b) => b.slug === w.brandSlug));
  }
  const named = watches.filter(
    (w) =>
      (w.model && t.includes(w.model.toLowerCase())) ||
      (w.family && t.includes(w.family.toLowerCase())) ||
      (w.reference && t.includes(w.reference.toLowerCase()))
  );
  if (named.length) list = named;
  return list;
}

export function reply(text, ctx = {}) {
  const { cart, wishlist, user } = ctx;
  const t = (text || '').toLowerCase();
  const first = (user?.name || 'there').split(' ')[0];
  const has = (...words) => words.some((x) => t.includes(x));
  const slugs = (list) => list.map((w) => w.slug);

  const orderMatch = text.match(/AW-?(\d+)/i);
  if (orderMatch) {
    return {
      text: `Order AW-${orderMatch[1]} is with our watchmakers for final inspection and will ship by insured overnight courier within 2 business days. You'll receive tracking by email.`,
    };
  }

  if (has('thank')) {
    return { text: `My pleasure, ${first}. Is there anything else?` };
  }

  if (has('bye', 'goodbye', 'good night', 'see you')) {
    return { text: `It was a pleasure, ${first}. We're here whenever you need us — good day.` };
  }

  if (has('human', 'agent', 'person', 'call', 'phone')) {
    return {
      text: 'Of course — a specialist will join shortly. You can also call us on +1 212 555 0187 during concierge hours.',
      links: [{ label: 'Contact us', to: '/contact-us' }],
    };
  }

  if (has('viewing', 'appointment', 'visit', 'boutique', 'showroom', 'location')) {
    return {
      text: "We're an online boutique serving clients nationwide — we don't currently have a walk-in showroom, but our concierge can arrange a private video consultation and walk you through any watch live.",
      links: [
        { label: 'Our locations', to: '/locations' },
        { label: 'Contact us', to: '/contact-us' },
      ],
    };
  }

  if (has('authentic', 'warranty', 'genuine', 'real', 'fake', 'certif')) {
    return {
      text: 'Every watch passes a 40-point bench inspection by our master horologists — serial, movement and provenance verified — and is covered by a two-year Veymont warranty beyond manufacturer terms.',
      links: [
        { label: 'Authenticity pledge', to: '/authenticity-pledge' },
        { label: 'Warranty', to: '/warranty' },
      ],
    };
  }

  if (has('ship', 'deliver', 'return', 'refund', 'exchange')) {
    return {
      text: 'Shipping is complimentary, insured overnight and signature-required on every order. Returns are free within 14 days — we send a prepaid insured label.',
      links: [
        { label: 'Shipping info', to: '/shipping-info' },
        { label: 'Return policy', to: '/return-policy' },
      ],
    };
  }

  if (has('order', 'track', 'status', 'package', 'parcel')) {
    return {
      text: "Please share your order number (it begins with AW-) and I'll check its status.",
    };
  }

  if (has('cart', 'basket', 'checkout')) {
    const n = cart?.count || 0;
    if (!n) {
      return {
        text: 'Your cart is currently empty. May I suggest a few pieces? Tell me a maison or style to begin.',
        options: GREETING_OPTIONS,
        links: [{ label: 'View cart', to: '/cart' }],
      };
    }
    return {
      text: `You have ${n} ${n === 1 ? 'watch' : 'watches'} in your cart, ${formatPrice(cart.subtotal)} before shipping — which is complimentary on this order.`,
      links: [{ label: 'View cart', to: '/cart' }],
    };
  }

  if (has('wishlist', 'saved')) {
    const n = wishlist?.count || 0;
    return {
      text: n
        ? `You have ${n} ${n === 1 ? 'watch' : 'watches'} saved to your wishlist — shall I arrange a private viewing of any of them?`
        : 'Your wishlist is empty at the moment. Tap the heart on any watch to save it here.',
      links: [{ label: 'View wishlist', to: '/wishlist' }],
    };
  }

  const matched = matchWatches(t);
  const typeHit = TYPE_WORDS.find(([word]) => t.includes(word));
  let pool = matched.length ? matched : watches;
  if (typeHit) pool = pool.filter((w) => w.type === typeHit[1]);
  const scope = matched.length
    ? `${brands.find((b) => b.slug === matched[0].brandSlug)?.name || ''} `
    : '';

  const priceMatch = t.match(/(?:under|below|less than|max|up to|budget of)\s*\$?\s*([\d,]+)k?/);
  if (priceMatch || has('budget')) {
    const raw = priceMatch?.[1]?.replace(/,/g, '');
    let cap = raw ? parseInt(raw, 10) : 0;
    if (cap && cap < 1000) cap *= 1000;
    if (!cap) {
      return {
        text: 'Happy to work to a budget — what ceiling should I keep to? For example "under $15,000".',
      };
    }
    const list = pool.filter((w) => w.price <= cap).sort((a, b) => b.price - a.price);
    if (!list.length) {
      return {
        text: `No ${scope}pieces currently sit under ${formatPrice(cap)}. Shall I show our most accessible pieces instead?`,
        options: ['Under $10,000', 'Dress watches', 'Find a watch'],
      };
    }
    return {
      text: `Here are the finest ${scope}pieces we hold under ${formatPrice(cap)} — tap one to view.`,
      products: slugs(list.slice(0, 3)),
    };
  }

  if (typeHit) {
    const list = pick(pool);
    if (list.length) {
      return {
        text: `Here are ${scope}${typeHit[1].toLowerCase()} watches from our current holding — tap one to view.`,
        products: slugs(list),
      };
    }
  }

  if (matched.length) {
    const b0 = brands.find((b) => b.slug === matched[0].brandSlug)?.name || 'these';
    return {
      text: `We currently hold ${matched.length} ${b0} ${matched.length === 1 ? 'piece' : 'pieces'}. Here are a few you may like — tap one to view.`,
      products: slugs(pick(matched)),
    };
  }

  if (has('find', 'recommend', 'looking', 'search', 'watch', 'suggest', 'gift', 'buy')) {
    return {
      text: 'Certainly. Which maison or style do you have in mind — for example Rolex, Patek Philippe, a dive watch, or a dress watch?',
      options: ['Rolex', 'Patek Philippe', 'Dive watches', 'Dress watches', 'Under $10,000'],
    };
  }

  if (has('hello', 'hi', 'hey', 'good ')) {
    return greeting(user);
  }

  return {
    text: 'I want to be sure I help properly — could you tell me a little more? I can help with finding a watch, orders, shipping, authenticity or private viewings.',
    options: GREETING_OPTIONS,
  };
}
