/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import watches from '../data/watches';

const WishlistContext = createContext(null);
const KEY = 'sm-wishlist';

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(ids));
  }, [ids]);

  const value = useMemo(
    () => ({
      ids,
      count: ids.length,
      items: ids.map((id) => watches.find((w) => w.id === id)).filter(Boolean),
      has: (id) => ids.includes(id),
      toggle(id) {
        setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
      },
      remove(id) {
        setIds((prev) => prev.filter((x) => x !== id));
      },
    }),
    [ids]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  return useContext(WishlistContext);
}
