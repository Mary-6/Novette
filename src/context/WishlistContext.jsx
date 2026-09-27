/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import watches from '../data/watches';
import { api } from '../lib/api';

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

  const syncedRef = useRef(false);
  useEffect(() => {
    const sync = async () => {
      try {
        const { user } = await api.me();
        if (!user || user.demo) return;
        const remote = await api.wishlist();
        const merged = [...new Set([...remote.map((r) => r.watchId), ...ids])];
        setIds(merged);
        await api.syncWishlist(merged);
        syncedRef.current = true;
      } catch {
        syncedRef.current = false;
      }
    };
    sync();
    const onAuth = () => {
      syncedRef.current = false;
      sync();
    };
    window.addEventListener('aw-auth-changed', onAuth);
    return () => window.removeEventListener('aw-auth-changed', onAuth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!syncedRef.current) return;
    const t = setTimeout(() => {
      api.syncWishlist(ids).catch(() => {
        syncedRef.current = false;
      });
    }, 400);
    return () => clearTimeout(t);
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
