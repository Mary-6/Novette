const pages = {
  'about-us': {
    eyebrow: 'Est. 1987 · Serving Nationwide',
    title: 'Our Story',
    type: 'about',
  },
  'why-buy-from-us': {
    eyebrow: 'The Difference',
    title: 'Why Buy From Us',
    sections: [
      {
        heading: 'Prices set by data, not theatre',
        body: 'Every listing is priced against the Lumont Market Index, our internal measure of real, completed transactions. The same watch carries the same price for every client, everywhere in the country.',
      },
      {
        heading: 'Real-time inventory',
        body: 'Every watch on this site is physically in our vault, photographed, authenticated and ready to ship today. We do not list stock we have not inspected, and we never sell what we have not seen.',
      },
      {
        heading: 'A warranty that means something',
        body: 'Every purchase carries a two-year warranty serviced in our own workshop, the same benches that authenticated the watch in the first place.',
      },
      {
        heading: 'People, not queues',
        body: 'A dedicated specialist answers every enquiry personally, sourcing, sizing, aftercare and consultation are all part of the service.',
      },
    ],
  },
  'authenticity-pledge': {
    eyebrow: 'Our Pledge',
    title: 'The Authenticity Pledge',
    sections: [
      {
        heading: 'Opened, inspected, certified',
        body: 'Every watch is opened on the bench and checked across forty points: serial and case numbers against factory records, movement calibre, dial and hand originality, case geometry, and bracelet integrity. Nothing is authenticated from photographs.',
      },
      {
        heading: 'Disclosure, always',
        body: 'If a dial has been refinished, a bezel insert replaced, or a part is service-era rather than factory-original, it is stated on the certificate and on the listing. Honesty about restoration is the entire point of a certificate.',
      },
      {
        heading: 'Backed for two years',
        body: 'Every certified watch ships with a signed Lumont Watches Certificate of Authenticity and a two-year warranty on the movement and its functions, serviced in-house, not outsourced.',
      },
    ],
  },
  'buyers-protection-plan': {
    eyebrow: 'Peace of Mind',
    title: "Buyer's Protection Plan",
    sections: [
      {
        heading: 'What is covered',
        body: 'Every order is covered from confirmation to delivery: full-value transit insurance, signature delivery, and a 14-day return window with a full refund once the watch clears inspection.',
      },
      {
        heading: 'Authentication guarantee',
        body: 'If any watch we sell is ever shown not to be genuine, at any point, forever, we will refund the full purchase price. That pledge has held since 1987 and is part of your certificate.',
      },
      {
        heading: 'If something goes wrong',
        body: 'Contact your specialist first. Warranty work is prioritised and we cover insured shipping both ways for valid claims within the warranty period.',
      },
    ],
  },
  'shipping-info': {
    eyebrow: 'Delivery',
    title: 'Shipping Information',
    sections: [
      {
        heading: 'How we ship',
        body: 'Every order travels in discreet, unmarked packaging with full-value insurance and a signature requirement. Insured courier (3–5 business days) is complimentary over $5,000; express overnight is available at checkout for $250.',
      },
      {
        heading: 'Timing',
        body: 'Orders confirmed before 2pm ET ship the same business day. You receive a tracking number and insurance certificate by email the moment the parcel leaves the vault.',
      },
      {
        heading: 'Delivery',
        body: 'We ship to all 50 states and internationally. Every parcel is covered from our vault to your door; nothing leaves us without a tracking number and an insurance certificate.',
      },
    ],
  },
  'international-shipping': {
    eyebrow: 'Worldwide',
    title: 'International Shipping',
    sections: [
      {
        heading: 'Where we ship',
        body: 'We ship fully insured to more than forty countries. Transit is by premium courier with door-to-door tracking and signature delivery.',
      },
      {
        heading: 'Duties & taxes',
        body: 'Import duties and local taxes are the responsibility of the recipient. Our concierge will estimate landed costs before you commit, and handles all export paperwork.',
      },
      {
        heading: 'Remote locations',
        body: 'For destinations outside standard courier coverage we arrange specialist high-value transport, ask your specialist for a quote.',
      },
    ],
  },
  'return-policy': {
    eyebrow: '14 Days',
    title: 'Return Policy',
    sections: [
      {
        heading: 'The window',
        body: 'You have 14 days from delivery to return a watch for a full refund, provided it comes back in the condition it left, unworn beyond reasonable inspection, with all links, accessories, certificates and packaging.',
      },
      {
        heading: 'How to return',
        body: 'Contact your specialist for an insured, prepaid return label. Once the watch clears bench inspection, typically within two business days, the refund is issued within five business days.',
      },
      {
        heading: 'Exclusions',
        body: 'Watches that have been worn, sized, or had protective films removed cannot be returned; pieces showing signs of tampering or opening by a third party are excluded.',
      },
    ],
  },
  warranty: {
    eyebrow: 'Two Years',
    title: 'Lumont Watches Warranty',
    sections: [
      {
        heading: 'Coverage',
        body: 'Every watch carries a two-year warranty covering the movement and its functions, accuracy, winding, and complication operation under normal use.',
      },
      {
        heading: 'What is not covered',
        body: 'Water damage from an unsecured crown, cosmetic wear, straps and crystals damaged after delivery, and any work performed by third parties are excluded from coverage.',
      },
      {
        heading: 'How warranty service works',
        body: 'Our own watchmakers perform all warranty work. Contact your specialist, ship with our insured label, and most services return within ten business days, never outsourced.',
      },
    ],
  },
  faqs: {
    eyebrow: 'Answers',
    title: 'Frequently Asked Questions',
    type: 'faq',
  },
  locations: {
    eyebrow: 'Visit Us',
    title: 'Locations',
    type: 'locations',
  },
  'trust-and-compliance': {
    eyebrow: 'Governance',
    title: 'Trust & Compliance',
    sections: [
      {
        heading: 'Verification of everything we sell',
        body: 'We verify the provenance of every piece we acquire, purchase history, service records and registry checks against global stolen-watch databases. Pieces with gaps in provenance are declined.',
      },
      {
        heading: 'AML & KYC',
        body: 'Lumont Watches complies with anti-money-laundering regulations in every jurisdiction we serve. High-value transactions may require identity verification before release.',
      },
      {
        heading: 'Data & privacy',
        body: 'Client records are encrypted, never sold, and retained only as required by law. See our Privacy Policy for full detail.',
      },
    ],
  },
  'privacy-policy': {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    sections: [
      {
        heading: 'What we collect',
        body: 'We collect contact details, order history and communication records necessary to serve you. Browsing data is collected anonymously for site improvement.',
      },
      {
        heading: 'How we use it',
        body: 'Your information is used to fulfil orders, provide concierge service, and, only with consent, send the Lumont List newsletter. We never sell client data.',
      },
      {
        heading: 'Your rights',
        body: 'You may request a copy, correction, or deletion of your personal data at any time by writing to privacy@lumontwatches.com.',
      },
    ],
  },
  'terms-and-conditions': {
    eyebrow: 'Legal',
    title: 'Terms & Conditions',
    sections: [
      {
        heading: 'Sales terms',
        body: 'All watches are offered subject to prior sale. Prices are confirmed at order; typographical errors do not create a binding offer.',
      },
      {
        heading: 'Grading & description',
        body: 'Condition grades reflect our bench assessment at the time of listing. Heritage pieces are presented unworn or freshly serviced; era-appropriate originality is assessed and disclosed on every certificate.',
      },
      {
        heading: 'Liability',
        body: 'Our liability is limited to the purchase price of the item. Nothing in these terms limits your statutory rights.',
      },
    ],
  },
  journal: {
    eyebrow: 'Editorial',
    title: 'The Journal',
    type: 'journal',
  },
  'buying-guide': {
    eyebrow: 'Resources',
    title: 'The Buying Guide',
    type: 'guide',
  },
  'watch-care': {
    eyebrow: 'Resources',
    title: 'Watch Care',
    type: 'care',
  },
  sitemap: {
    eyebrow: 'Directory',
    title: 'Sitemap',
    type: 'sitemap',
  },
  accessibility: {
    eyebrow: 'Our Commitment',
    title: 'Accessibility',
    sections: [
      {
        heading: 'Standards',
        body: 'We aim to meet WCAG 2.1 AA across this site, sufficient contrast, keyboard navigability, focus visibility and text alternatives for non-text content.',
      },
      {
        heading: 'Continuous work',
        body: 'Accessibility is reviewed with every release. Watch imagery is generated inline with descriptive text, and all forms carry labels and clear error states.',
      },
      {
        heading: 'Feedback',
        body: 'If you encounter a barrier, write to accessibility@lumontwatches.com or call the concierge, we will respond within two business days and offer an accessible alternative.',
      },
    ],
  },
};

export default pages;
