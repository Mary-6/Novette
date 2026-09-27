import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import PageHero from '../components/layout/PageHero';
import { formatPrice } from '../data/utils';

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [watches, setWatches] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    Promise.all([api.adminStats(), api.adminWatches(), api.adminOrders()])
      .then(([s, w, o]) => {
        setStats(s);
        setWatches(w);
        setOrders(o);
      })
      .catch((e) => setError(e.message));
  }, [user]);

  if (user?.role !== 'admin')
    return (
      <section className="py-32 text-center">
        <h1 className="heading-display text-4xl">Admin only.</h1>
        <p className="mt-4 text-sm text-graphite">Sign in with an administrator account.</p>
      </section>
    );

  return (
    <>
      <PageHero eyebrow="Back Office" title="Store Admin" />
      <section className="py-16">
        <div className="container-x">
          {error && <p className="mb-6 text-sm text-red-700">{error}</p>}
          <div className="mb-10 flex gap-6 text-xs uppercase tracking-[0.2em]">
            {['stats', 'watches', 'orders'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={tab === t ? 'text-gold' : 'text-graphite hover:text-ink'}
              >
                {t}
              </button>
            ))}
          </div>
          {tab === 'stats' && stats && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {Object.entries(stats).map(([k, v]) => (
                <div key={k} className="border border-stone/25 p-6">
                  <p className="eyebrow">{k}</p>
                  <p className="heading-display mt-2 text-3xl">{v}</p>
                </div>
              ))}
            </div>
          )}
          {tab === 'watches' && (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone/30 text-xs uppercase tracking-[0.15em] text-graphite">
                  <th className="py-3">Watch</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Featured</th>
                </tr>
              </thead>
              <tbody>
                {watches.map((w) => (
                  <tr key={w.id} className="border-b border-stone/20">
                    <td className="py-3">
                      {w.model} · <span className="text-graphite">{w.reference}</span>
                    </td>
                    <td>
                      <input
                        type="number"
                        defaultValue={w.price}
                        className="w-24 border border-stone/40 px-2 py-1"
                        onBlur={(e) =>
                          Number(e.target.value) !== w.price &&
                          api.adminUpdateWatch(w.id, { price: Number(e.target.value) })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        defaultValue={w.inventory}
                        className="w-16 border border-stone/40 px-2 py-1"
                        onBlur={(e) =>
                          Number(e.target.value) !== w.inventory &&
                          api.adminUpdateWatch(w.id, { inventory: Number(e.target.value) })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        defaultChecked={w.isFeatured}
                        onChange={(e) =>
                          api.adminUpdateWatch(w.id, { isFeatured: e.target.checked })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === 'orders' && (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone/30 text-xs uppercase tracking-[0.15em] text-graphite">
                  <th className="py-3">Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-stone/20">
                    <td className="py-3">{o.number}</td>
                    <td>{o.customerName}</td>
                    <td>{formatPrice(o.total)}</td>
                    <td>
                      <select
                        defaultValue={o.status}
                        className="border border-stone/40 px-2 py-1"
                        onChange={(e) => api.adminUpdateOrder(o.id, e.target.value)}
                      >
                        {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  );
}
