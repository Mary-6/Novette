# Sterling Meridian

A luxury watch exchange storefront for a fictional established retailer — "Fine Timepieces,
Est. 1987, London & New York" — offering new, unworn, pre-owned and vintage watches from 15
maisons, structured around a Rolex-centric hub. Buying only; all copy and imagery are original,
with product imagery rendered by a parameterized SVG illustration component (no external image
dependencies).

## Stack

- Vite + React 18 (JavaScript)
- React Router v6
- Tailwind CSS v3.4 (PostCSS + Autoprefixer)
- ESLint (flat config) + Prettier
- lucide-react for icons

## Commands

```bash
npm install        # install dependencies
npm run dev        # start the Vite dev server
npm run build      # production build to dist/
npm run preview    # preview the production build
npm run lint       # ESLint
npm run format     # Prettier --write
npm run format:check  # Prettier --check
```

## Routes

- `/` — home (hero, brand strip, Rolex families, new arrivals, collections carousel,
  market index, journal preview, promise, about, reviews, popular searches, newsletter)
- `/shop` — full catalogue with faceted sidebar, per-page, sort and pagination
- `/rolex`, `/rolex/:family` — Rolex hub and model-family pages (faceted, long-form content)
- `/brands`, `/brands/:slug` — brand index and brand pages with history, key terms, FAQ
- `/collections`, `/collections/:slug` — curated edits
- `/watches/:slug` — product detail (gallery, specs, tabs, ask-a-question, wishlist, related)
- `/journal`, `/journal/:slug` — editorial index and articles
- `/cart`, `/checkout`, `/checkout/confirmation` — cart and three-step demo checkout
- `/wishlist` — saved watches
- `/login`, `/signup` — mock account forms (demo notice)
- `/contact-us` — contact form and support info
- Info pages: `/about-us`, `/why-buy-from-us`, `/authenticity-pledge`,
  `/buyers-protection-plan`, `/shipping-info`, `/international-shipping`, `/return-policy`,
  `/warranty`, `/payment-methods`, `/faqs`, `/locations`, `/trust-and-compliance`,
  `/privacy-policy`, `/terms-and-conditions`, `/buying-guide`, `/watch-care`, `/sitemap`,
  `/accessibility`
- Redirects: `/about` → `/about-us`, `/contact` → `/contact-us`,
  `/new-arrivals` → `/shop?sort=newest`

## Folder structure

```
src/
  data/          watches (80 pieces + derived facets), brands + brandContent, rolexFamilies,
                 collections, journal, pages (info-page copy), reviews, faq, navigation, utils
  context/       CartContext, WishlistContext (localStorage 'sm-cart' / 'sm-wishlist')
  hooks/         useReveal (scroll animations), useShop (URL-synced filters/sort/pagination)
  components/
    layout/      Header (utility bar + mega menus), Footer, PageHero, Breadcrumbs
    ui/          Button, Badge, SectionHeading, Accordion, ScrollToTop
    watch/       WatchArt (parameterized SVG renderer), WatchCard, WatchGrid, ProductGallery
    shop/        FilterSidebar (scoped facet counts), SortSelect, ActiveFilters
    home/        home page sections
    brand/       BrandCard
  pages/         Home, Shop(+ShopLayout), ProductDetail, Brands(+RolexHub/RolexFamilyPage),
                 Collections, Cart, Checkout, Confirmation, Contact, Info, Journal, Account,
                 Wishlist, NotFound
```
