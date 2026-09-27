/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import watches from '../data/watches';
import { api } from '../lib/api';

const CartContext = createContext(null);
const KEY = 'sm-cart';
export const FREE_SHIPPING_THRESHOLD = 5000;
export const STANDARD_SHIPPING = 150;

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  // Merge server cart when a real session is active; push local changes back up.
  const syncedRef = useRef(false);
  useEffect(() => {
    const sync = async () => {
      try {
        const { user } = await api.me();
        if (!user || user.demo) return;
        const remote = await api.cart();
        const merged = new Map();
        remote.forEach((r) => merged.set(r.watchId, r.qty));
        items.forEach((i) => merged.set(i.watchId, Math.max(merged.get(i.watchId) || 0, i.qty)));
        const mergedItems = [...merged.entries()].map(([watchId, qty]) => ({ watchId, qty }));
        setItems(mergedItems);
        await api.syncCart(mergedItems);
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
      api.syncCart(items.map((i) => ({ watchId: i.watchId, qty: i.qty }))).catch(() => {
        syncedRef.current = false;
      });
    }, 400);
    return () => clearTimeout(t);
  }, [items]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const value = useMemo(() => {
    const detailed = items
      .map((it) => ({ ...it, watch: watches.find((w) => w.id === it.watchId) }))
      .filter((it) => it.watch);
    const subtotal = detailed.reduce((s, it) => s + it.watch.price * it.qty, 0);
    const count = detailed.reduce((s, it) => s + it.qty, 0);
    return {
      items: detailed,
      count,
      subtotal,
      toast,
      add(watchId, qty = 1) {
        setItems((prev) => {
          const found = prev.find((i) => i.watchId === watchId);
          if (found)
            return prev.map((i) => (i.watchId === watchId ? { ...i, qty: i.qty + qty } : i));
          return [...prev, { watchId, qty }];
        });
        const w = watches.find((x) => x.id === watchId);
        setToast(w ? `${w.model} added to cart` : 'Added to cart');
      },
      remove(watchId) {
        setItems((prev) => prev.filter((i) => i.watchId !== watchId));
      },
      setQty(watchId, qty) {
        setItems((prev) =>
          qty <= 0
            ? prev.filter((i) => i.watchId !== watchId)
            : prev.map((i) => (i.watchId === watchId ? { ...i, qty } : i))
        );
      },
      clear() {
        setItems([]);
      },
    };
  }, [items, toast]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
