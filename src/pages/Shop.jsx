import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import watches from '../data/watches';
import { filterWatches, sortWatches } from '../data/utils';
import { useShopFilters } from '../hooks/useShop';
import useReveal from '../hooks/useReveal';
import PageHero from '../components/layout/PageHero';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import WatchGrid from '../components/watch/WatchGrid';
import FilterSidebar from '../components/shop/FilterSidebar';
import SortSelect, { PerPageSelect } from '../components/shop/SortSelect';
import ActiveFilters from '../components/shop/ActiveFilters';
import Button from '../components/ui/Button';

const EMPTY_FACETS = {
  brands: [],
  families: [],
  references: [],
  sizes: [],
  materials: [],
  dials: [],
  decades: [],
  boxPapers: [],
  conditions: [],
  bandTypes: [],
  bandMaterials: [],
  nicknames: [],
  bezels: [],
  functions: [],
  markers: [],
  warranty: [],
  genders: [],
  types: [],
};

export function ShopLayout({
  eyebrow,
  title,
  intro,
  source,
  lockBrand = false,
  tone = 'dark',
  chips,
  afterHero,
  children,
}) {
  const { filters, setFilters, sort, setSort, perPage, setPerPage, page, setPage } =
    useShopFilters();
  const [drawer, setDrawer] = useState(false);
  useReveal([filters, sort, page]);

  const list = useMemo(
    () =>
      sortWatches(
        filterWatches(source, {
          search: filters.q,
          priceRange: [filters.min, filters.max],
          ...EMPTY_FACETS,
          ...Object.fromEntries(Object.entries(filters).filter(([k]) => k in EMPTY_FACETS)),
        }),
        sort
      ),
    [source, filters, sort]
  );

  const totalPages = Math.max(1, Math.ceil(list.length / perPage));
  const pageItems = list.slice((page - 1) * perPage, page * perPage);
  const sidebar = (
    <FilterSidebar filters={filters} onChange={setFilters} source={source} lockBrand={lockBrand} />
  );

  return (
    <>
      {title && (
        <PageHero eyebrow={eyebrow} title={title} tone={tone}>
          {intro}
        </PageHero>
      )}
      {afterHero}
      <section className="py-14 lg:py-20">
        <div className="container-x">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: title || 'Shop' }]} />
          {chips}
          <div className="grid gap-12 lg:grid-cols-[260px_1fr]">
            <div className="hidden lg:block">{sidebar}</div>
            <div>
              <div className="mb-6">
                <p className="mb-4 text-xs uppercase tracking-[0.2em] text-stone lg:mb-0">
                  {list.length} {list.length === 1 ? 'item' : 'items'}
                </p>
                <div className="flex items-center gap-3 lg:-mt-6 lg:justify-end">
                  <button
                    type="button"
                    onClick={() => setDrawer(true)}
                    className="flex items-center gap-2 border border-stone/40 px-4 py-2.5 text-xs uppercase tracking-[0.15em] lg:hidden"
                  >
                    <SlidersHorizontal size={14} /> Filters
                  </button>
                  <PerPageSelect value={perPage} onChange={setPerPage} />
                  <SortSelect
                    value={sort}
                    onChange={setSort}
                    className="flex-1 lg:flex-none"
                    selectClassName="w-full lg:w-auto"
                  />
                </div>
              </div>
              <ActiveFilters
                filters={filters}
                onChange={setFilters}
                hideKeys={lockBrand ? ['brands'] : []}
              />
              {list.length ? (
                <>
                  <WatchGrid watches={pageItems} />
                  {totalPages > 1 && (
                    <nav
                      className="mt-14 flex items-center justify-center gap-2"
                      aria-label="Pagination"
                    >
                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                        className="flex h-10 w-10 items-center justify-center border border-stone/40 transition enabled:hover:border-gold disabled:opacity-30"
                        aria-label="Previous page"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPage(i + 1)}
                          className={`h-10 w-10 border text-sm transition ${
                            page === i + 1
                              ? 'border-gold bg-ink text-gold'
                              : 'border-stone/40 hover:border-gold'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() => setPage(page + 1)}
                        className="flex h-10 w-10 items-center justify-center border border-stone/40 transition enabled:hover:border-gold disabled:opacity-30"
                        aria-label="Next page"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </nav>
                  )}
                </>
              ) : (
                <div className="py-20 text-center">
                  <p className="heading-display text-3xl">No timepieces match your criteria.</p>
                  <p className="mt-3 text-sm text-graphite">
                    Adjust the filters, or let our concierge source a piece for you.
                  </p>
                  <Button
                    className="mt-8"
                    variant="outline"
                    onClick={() =>
                      setFilters({
                        q: '',
                        min: null,
                        max: null,
                        ...EMPTY_FACETS,
                        brands: lockBrand ? filters.brands : [],
                      })
                    }
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      {children}
      {drawer && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-ink/60" onClick={() => setDrawer(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-ivory p-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.2em]">Filters</p>
              <button type="button" onClick={() => setDrawer(false)} aria-label="Close filters">
                <X size={20} />
              </button>
            </div>
            {sidebar}
            <button
              type="button"
              onClick={() => setDrawer(false)}
              className="btn-primary mt-4 w-full"
            >
              Show {list.length} results
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function Shop() {
  return (
    <ShopLayout
      eyebrow="The Collection"
      title="Shop Luxury Watches"
      intro="Every watch below has been authenticated, inspected and warranted by Sterling Meridian. Filter by maison, complication and condition."
      source={watches}
      tone="dark"
    />
  );
}
