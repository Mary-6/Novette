# Sterling Meridian

A luxury watch e-commerce storefront for a fictional established retailer — "Fine Timepieces,
Est. 1987, London & New York" — offering new, unworn, pre-owned and vintage watches from 15
maisons. The catalogue is browsable by shop, brand and curated collections, with filtering,
sorting, cart persistence and a three-step demo checkout. All product imagery is rendered by an
original parameterized SVG illustration component — there are no external image dependencies.

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

## Folder structure

```
src/
  data/          static catalogue data (brands, 60 watches, collections, reviews, FAQ) + utils
  context/       CartContext (items, subtotal, localStorage persistence, toast)
  hooks/         useReveal (scroll animations), useShop (URL-synced filters)
  components/
    layout/      Header, Footer, PageHero, Breadcrumbs
    ui/          Button, Badge, SectionHeading, Accordion, ScrollToTop
    watch/       WatchArt (parameterized SVG renderer), WatchCard, WatchGrid, ProductGallery
    shop/        FilterSidebar, SortSelect, ActiveFilters
    home/        home page sections
    brand/       BrandCard
  pages/         route pages (Home, Shop, ProductDetail, Brands, Collections, Cart,
               Checkout, Confirmation, About, Contact, NotFound)
```
