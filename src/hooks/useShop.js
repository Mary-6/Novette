import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

const parseList = (v) => (v ? v.split(',').filter(Boolean) : []);
const num = (v) => (v === null || v === '' ? null : Number(v));

const LIST_KEYS = [
  ['brand', 'brands'],
  ['family', 'families'],
  ['ref', 'references'],
  ['size', 'sizes'],
  ['material', 'materials'],
  ['dial', 'dials'],
  ['decade', 'decades'],
  ['box', 'boxPapers'],
  ['condition', 'conditions'],
  ['band', 'bandTypes'],
  ['bandmat', 'bandMaterials'],
  ['nickname', 'nicknames'],
  ['bezel', 'bezels'],
  ['func', 'functions'],
  ['markers', 'markers'],
  ['warranty', 'warranty'],
  ['gender', 'genders'],
  ['type', 'types'],
];

export function useShopFilters() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo(() => {
    const f = {
      q: params.get('q') || '',
      min: num(params.get('min')),
      max: num(params.get('max')),
    };
    for (const [param, key] of LIST_KEYS) f[key] = parseList(params.get(param));
    return f;
  }, [params]);

  const sort = params.get('sort') || 'featured';
  const perPage = num(params.get('perPage')) || 24;
  const page = num(params.get('page')) || 1;

  const setFilters = useCallback(
    (f, s = sort, pp = perPage) => {
      const p = new URLSearchParams();
      if (f.q) p.set('q', f.q);
      for (const [param, key] of LIST_KEYS) if (f[key]?.length) p.set(param, f[key].join(','));
      if (f.min != null) p.set('min', f.min);
      if (f.max != null) p.set('max', f.max);
      if (s && s !== 'featured') p.set('sort', s);
      if (pp && pp !== 24) p.set('perPage', pp);
      setParams(p, { replace: true });
    },
    [sort, perPage, setParams]
  );

  const setSort = useCallback((s) => setFilters(filters, s), [filters, setFilters]);
  const setPerPage = useCallback(
    (pp) => setFilters(filters, sort, pp),
    [filters, sort, setFilters]
  );
  const setPage = useCallback(
    (pg) => {
      const p = new URLSearchParams(params);
      if (pg <= 1) p.delete('page');
      else p.set('page', pg);
      setParams(p, { replace: true });
      window.scrollTo({ top: 0 });
    },
    [params, setParams]
  );

  return { filters, setFilters, sort, setSort, perPage, setPerPage, page, setPage };
}
