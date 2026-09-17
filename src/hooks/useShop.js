import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

const parseList = (v) => (v ? v.split(',').filter(Boolean) : []);
const num = (v) => (v === null || v === '' ? null : Number(v));

export function useShopFilters() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo(
    () => ({
      q: params.get('q') || '',
      brands: parseList(params.get('brand')),
      genders: parseList(params.get('gender')),
      types: parseList(params.get('type')),
      conditions: parseList(params.get('condition')),
      min: num(params.get('min')),
      max: num(params.get('max')),
    }),
    [params]
  );

  const sort = params.get('sort') || 'popular';

  const setFilters = useCallback(
    (f, s = sort) => {
      const p = new URLSearchParams();
      if (f.q) p.set('q', f.q);
      if (f.brands?.length) p.set('brand', f.brands.join(','));
      if (f.genders?.length) p.set('gender', f.genders.join(','));
      if (f.types?.length) p.set('type', f.types.join(','));
      if (f.conditions?.length) p.set('condition', f.conditions.join(','));
      if (f.min != null) p.set('min', f.min);
      if (f.max != null) p.set('max', f.max);
      if (s && s !== 'popular') p.set('sort', s);
      setParams(p, { replace: true });
    },
    [sort, setParams]
  );

  const setSort = useCallback((s) => setFilters(filters, s), [filters, setFilters]);

  return { filters, setFilters, sort, setSort };
}
