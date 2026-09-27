import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import PageHero from '../components/layout/PageHero';
import { formatPrice } from '../data/utils';

const inputCls =
  'w-full border border-stone/40 bg-transparent px-3 py-2 text-sm outline-none transition focus:border-gold';
const TABS = [
  'stats',
  'watches',
  'orders',
  'customers',
  'subscribers',
  'templates',
  'messages',
  'chats',
  'settings',
];

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [watches, setWatches] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // {userId, name}
  const [chatThread, setChatThread] = useState([]);
  const [replyDraft, setReplyDraft] = useState('');
  const [subscribers, setSubscribers] = useState([]);
  const [settings, setSettings] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    slug: '',
    brandSlug: 'rolex',
    model: '',
    reference: '',
    price: 0,
    year: 2024,
    type: 'Dress',
    condition: 'Unworn',
    description: '',
    inventory: 1,
  });

  const isAdmin = user?.role === 'admin';

  const load = () => {
    Promise.all([
      api.adminStats(),
      api.adminWatches(),
      api.adminOrders(),
      api.adminCustomers(),
      api.adminTemplates(),
      api.adminMessages(),
      api.adminChats(),
      api.adminSubscribers(),
      api.adminSettings(),
    ])
      .then(([s, w, o, c, t, m, ch, sub, st]) => {
        setStats(s);
        setWatches(w);
        setOrders(o);
        setCustomers(c);
        setTemplates(t);
        setMessages(m);
        setChats(ch);
        setSubscribers(sub);
        setSettings(st);
      })
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  if (!isAdmin)
    return (
      <section className="py-32 text-center">
        <h1 className="heading-display text-4xl">Admin only.</h1>
        <p className="mt-4 text-sm text-graphite">Sign in with an administrator account.</p>
      </section>
    );

  const saveTemplate = (tpl) =>
    api
      .adminSaveTemplate(tpl.key, { subject: tpl.subject, html: tpl.html })
      .then(() => setNotice(`Template "${tpl.key}" saved`))
      .catch((e) => setError(e.message));

  const createWatch = async (e) => {
    e.preventDefault();
    try {
      const body = {
        ...form,
        price: Number(form.price),
        year: Number(form.year),
        inventory: Number(form.inventory),
        specs: {},
      };
      if (editingId) {
        await api.adminUpdateWatch(editingId, body);
        setNotice(`${form.model} updated`);
      } else {
        await api.adminCreateWatch(body);
        setNotice(`${form.model} created`);
      }
      setCreating(false);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message || 'Save failed');
    }
  };

  const uploadImage = async (watchId, file) => {
    const r = await api.adminUpload(file);
    if (r.url) setNotice(`Image uploaded: ${r.url}`);
  };

  return (
    <>
      <PageHero eyebrow="Back Office" title="Store Admin" />
      <section className="py-16">
        <div className="container-x">
          {error && (
            <p className="mb-6 border border-red-700/30 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
          {notice && (
            <p className="mb-6 border border-gold/40 bg-gold/5 px-4 py-3 text-sm text-goldDark">
              {notice}
            </p>
          )}
          <div className="mb-10 flex flex-wrap gap-6 text-xs uppercase tracking-[0.2em]">
            {TABS.map((t) => (
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
            <>
              <div className="mb-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCreating(!creating)}
                  className="btn-primary text-xs uppercase tracking-[0.2em]"
                >
                  {creating ? 'Cancel' : '+ New watch'}
                </button>
              </div>
              {creating && (
                <form
                  onSubmit={createWatch}
                  className="mb-8 grid gap-4 border border-stone/25 p-6 sm:grid-cols-3"
                >
                  {[
                    ['slug', 'Slug (rolex-xxx-123)'],
                    ['model', 'Model'],
                    ['reference', 'Reference'],
                  ].map(([k, label]) => (
                    <input
                      key={k}
                      required
                      placeholder={label}
                      value={form[k]}
                      onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                      className={inputCls}
                    />
                  ))}
                  <select
                    value={form.brandSlug}
                    onChange={(e) => setForm({ ...form, brandSlug: e.target.value })}
                    className={inputCls}
                  >
                    {[
                      'rolex',
                      'patek-philippe',
                      'audemars-piguet',
                      'omega',
                      'cartier',
                      'tudor',
                    ].map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    required
                    placeholder="Price"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className={inputCls}
                  />
                  <input
                    type="number"
                    required
                    placeholder="Year"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className={inputCls}
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Stock"
                    value={form.inventory}
                    onChange={(e) => setForm({ ...form, inventory: e.target.value })}
                    className={inputCls}
                  />
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className={inputCls}
                  >
                    {['Dress', 'Dive', 'Chronograph', 'GMT', 'Sport'].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  <select
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                    className={inputCls}
                  >
                    {['New', 'Unworn'].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <textarea
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className={`${inputCls} sm:col-span-3`}
                    rows={3}
                  />
                  <button type="submit" className="btn-primary sm:col-span-3">
                    {editingId ? 'Save changes' : 'Create watch'}
                  </button>
                </form>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-stone/30 text-xs uppercase tracking-[0.15em] text-graphite">
                      <th className="py-3">Watch</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Featured</th>
                      <th>Image</th>
                      <th />
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
                        <td>
                          <label className="cursor-pointer text-xs text-goldDark underline">
                            upload
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                e.target.files[0] && uploadImage(w.id, e.target.files[0])
                              }
                            />
                          </label>
                        </td>
                        <td className="space-x-3 whitespace-nowrap">
                          <button
                            type="button"
                            className="text-xs text-goldDark underline"
                            onClick={() => {
                              setCreating(true);
                              setEditingId(w.id);
                              setForm({
                                slug: w.slug,
                                brandSlug: w.brandSlug,
                                model: w.model,
                                reference: w.reference,
                                price: w.price,
                                year: w.year,
                                type: w.type,
                                condition: w.condition,
                                description: w.description || '',
                                inventory: w.inventory,
                              });
                            }}
                          >
                            edit
                          </button>
                          <button
                            type="button"
                            className="text-xs text-red-700"
                            onClick={() =>
                              window.confirm(`Delete ${w.model}?`) &&
                              api.adminDeleteWatch(w.id).then(load)
                            }
                          >
                            delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
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
                    <td className="space-y-2">
                      <select
                        defaultValue={o.status}
                        className="border border-stone/40 px-2 py-1"
                        onChange={(e) => api.adminUpdateOrder(o.id, { status: e.target.value })}
                      >
                        {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <input
                        placeholder="Tracking #"
                        defaultValue={o.trackingNumber || ''}
                        className="block w-36 border border-stone/40 px-2 py-1"
                        onBlur={(e) =>
                          e.target.value !== (o.trackingNumber || '') &&
                          api.adminUpdateOrder(o.id, { trackingNumber: e.target.value })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'customers' && (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone/30 text-xs uppercase tracking-[0.15em] text-graphite">
                  <th className="py-3">Name</th>
                  <th>Email</th>
                  <th>Orders</th>
                  <th>Verified</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-stone/20">
                    <td className="py-3">{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c._count.orders}</td>
                    <td>{c.emailVerifiedAt ? 'Yes' : 'No'}</td>
                    <td>
                      <select
                        defaultValue={c.role}
                        className="border border-stone/40 px-2 py-1"
                        onChange={(e) => api.adminSetUserRole(c.id, e.target.value).then(load)}
                      >
                        <option value="customer">customer</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'subscribers' && (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone/30 text-xs uppercase tracking-[0.15em] text-graphite">
                  <th className="py-3">Email</th>
                  <th>Subscribed</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.id} className="border-b border-stone/20">
                    <td className="py-3">{s.email}</td>
                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {subscribers.length === 0 && (
                  <tr>
                    <td className="py-4 text-graphite">No subscribers yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {tab === 'templates' && (
            <div className="space-y-10">
              {templates.map((t, i) => (
                <div key={t.key} className="border border-stone/25 p-6">
                  <p className="eyebrow mb-4">{t.key}</p>
                  <input
                    className={`${inputCls} mb-3`}
                    defaultValue={t.subject}
                    onChange={(e) =>
                      setTemplates(
                        templates.map((x, j) => (j === i ? { ...x, subject: e.target.value } : x))
                      )
                    }
                  />
                  <textarea
                    className={`${inputCls} font-mono`}
                    rows={5}
                    defaultValue={t.html}
                    onChange={(e) =>
                      setTemplates(
                        templates.map((x, j) => (j === i ? { ...x, html: e.target.value } : x))
                      )
                    }
                  />
                  <p className="mt-2 text-xs text-stone">
                    Variables: {'{{user.name}} {{order.number}} {{order.total}} {{link}}'}
                  </p>
                  <button
                    type="button"
                    onClick={() => saveTemplate(t)}
                    className="btn-outline mt-4 text-xs uppercase tracking-[0.2em]"
                  >
                    Save template
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === 'chats' && (
            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              <div className="space-y-2">
                {chats.length === 0 && (
                  <p className="text-sm text-graphite">No conversations yet.</p>
                )}
                {chats.map((c) => (
                  <button
                    key={c.userId}
                    type="button"
                    onClick={() =>
                      api.adminChatThread(c.userId).then((t) => {
                        setActiveChat(c);
                        setChatThread(t);
                      })
                    }
                    className={`w-full border p-3 text-left text-sm transition ${
                      activeChat?.userId === c.userId ? 'border-gold bg-gold/5' : 'border-stone/30'
                    }`}
                  >
                    <span className="block font-medium">{c.name}</span>
                    <span className="block truncate text-xs text-graphite">
                      {c.lastMessage?.body}
                    </span>
                    {c.unread > 0 && (
                      <span className="mt-1 inline-block rounded-full bg-gold px-2 py-0.5 text-[10px] text-ink">
                        {c.unread} new
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="border border-stone/25 p-4">
                {activeChat ? (
                  <>
                    <p className="eyebrow mb-3">
                      {activeChat.name} · {activeChat.email}
                    </p>
                    <div className="max-h-80 space-y-3 overflow-y-auto pb-3">
                      {chatThread.map((m) => (
                        <p
                          key={m.id}
                          className={`max-w-[80%] px-3 py-2 text-sm ${
                            m.from === 'concierge'
                              ? 'ml-auto bg-ink text-ivory'
                              : 'border border-stone/30 bg-sand'
                          }`}
                        >
                          {m.body}
                        </p>
                      ))}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <input
                        className={inputCls}
                        placeholder="Reply as concierge…"
                        value={replyDraft}
                        onChange={(e) => setReplyDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && replyDraft.trim()) {
                            api.adminChatReply(activeChat.userId, replyDraft.trim()).then((m) => {
                              setChatThread([...chatThread, m]);
                              setReplyDraft('');
                            });
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn-primary px-5"
                        onClick={() => {
                          if (!replyDraft.trim()) return;
                          api.adminChatReply(activeChat.userId, replyDraft.trim()).then((m) => {
                            setChatThread([...chatThread, m]);
                            setReplyDraft('');
                          });
                        }}
                      >
                        Send
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-graphite">Select a conversation to reply.</p>
                )}
              </div>
            </div>
          )}

          {tab === 'settings' && settings && (
            <form
              className="max-w-xl space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                api
                  .adminSaveSettings({
                    storeName: fd.get('storeName'),
                    contactEmail: fd.get('contactEmail'),
                    announcement: fd.get('announcement'),
                    shipping: settings.shipping || [
                      {
                        id: 'courier',
                        label: 'Insured Courier',
                        hint: '3–5 business days',
                        price: 0,
                      },
                      {
                        id: 'express',
                        label: 'Express Overnight',
                        hint: 'Order by 2pm ET',
                        price: 250,
                      },
                    ],
                  })
                  .then((r) => {
                    setSettings(r);
                    setNotice('Settings saved');
                  })
                  .catch((err) => setError(err.message));
              }}
            >
              <div>
                <label className="eyebrow mb-1 block">Store name</label>
                <input
                  name="storeName"
                  defaultValue={settings.storeName || 'Avelor Watches'}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="eyebrow mb-1 block">Contact email</label>
                <input
                  name="contactEmail"
                  defaultValue={settings.contactEmail || 'avelorwatches@gmail.com'}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="eyebrow mb-1 block">Announcement banner</label>
                <input
                  name="announcement"
                  placeholder="e.g. Complimentary insured shipping this week"
                  defaultValue={settings.announcement || ''}
                  className={inputCls}
                />
              </div>
              <button type="submit" className="btn-primary">
                Save settings
              </button>
            </form>
          )}

          {tab === 'messages' && (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone/30 text-xs uppercase tracking-[0.15em] text-graphite">
                  <th className="py-3">From</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Read</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m.id} className="border-b border-stone/20 align-top">
                    <td className="py-3">
                      {m.name}
                      <br />
                      <span className="text-xs text-graphite">{m.email}</span>
                    </td>
                    <td>{m.subject || '—'}</td>
                    <td className="max-w-md text-graphite">{m.message}</td>
                    <td className="whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleDateString()}
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
