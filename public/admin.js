/* Novette Admin Console — core: API client, router, layout, badges, UI helpers */
(() => {
  const A = (window.A = {
    user: window.ADMIN.user,
    sections: window.ADMIN.sections,
    pages: {},
    timers: [],
  });

  window.addEventListener('pageshow', (e) => { if (e.persisted) location.reload(); });

  /* ---------- helpers ---------- */
  A.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  A.money = (n) => '$' + Number(n || 0).toLocaleString('en-US');
  A.date = (d) => (d ? new Date(String(d).replace(' ', 'T')).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—');
  A.datetime = (d) => (d ? new Date(String(d).replace(' ', 'T')).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—');
  A.time = (d) => (d ? new Date(String(d).replace(' ', 'T')).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '');
  A.ago = (d) => {
    if (!d) return 'never';
    const s = (Date.now() - new Date(String(d).replace(' ', 'T')).getTime()) / 1000;
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    if (s < 604800) return Math.floor(s / 86400) + 'd ago';
    return A.date(d);
  };
  A.chip = (s, label) => `<span class="chip chip-${A.esc(s)}">${A.esc(label || s)}</span>`;
  A.stockLabel = { in: 'In Stock', low: 'Low Stock', out: 'Out of Stock' };
  A.can = (s) => A.sections.includes(s);
  A.avatar = (name, url, cls = '') => url
    ? `<img src="${A.esc(url)}" class="h-10 w-10 shrink-0 rounded-full object-cover ${cls}" alt="">`
    : `<span class="avatar-sq ${cls}">${A.esc((name || '?').trim().charAt(0).toUpperCase())}</span>`;
  A.stars = (n) => {
    const r = Math.round((Number(n) || 0) * 2) / 2, full = Math.floor(r), half = r - full === 0.5;
    return '<span class="star">' + '★'.repeat(full) + '</span>' + (half ? '<span class="star-half">★</span>' : '')
      + '<span class="text-graphite">' + '★'.repeat(5 - full - (half ? 1 : 0)) + '</span>';
  };
  A.qs = (o) => { const p = new URLSearchParams(); Object.entries(o).forEach(([k, v]) => { if (v !== '' && v != null) p.set(k, v); }); const s = p.toString(); return s ? '?' + s : ''; };
  A.params = () => Object.fromEntries(new URLSearchParams(location.search));
  A.debounce = (fn, ms = 300) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  A.api = async (path, opts = {}) => {
    const isForm = opts.body instanceof FormData;
    const r = await fetch('/api/admin' + path, {
      method: opts.method || 'GET',
      headers: Object.assign({ Accept: 'application/json' }, opts.body && !isForm ? { 'Content-Type': 'application/json' } : {}),
      body: opts.body ? (isForm ? opts.body : JSON.stringify(opts.body)) : undefined,
      credentials: 'same-origin',
    });
    if (r.status === 401) { location.href = '/admin/login'; throw new Error('Session expired'); }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      const err = new Error(j.error || j.message || 'Request failed (' + r.status + ')');
      err.errors = j.errors || {};
      err.status = r.status;
      throw err;
    }
    return j;
  };

  A.upload = async (files) => {
    const fd = new FormData();
    [...files].forEach((f) => fd.append('images[]', f));
    return A.api('/upload', { method: 'POST', body: fd });
  };

  /* ---------- toast / modal / confirm ---------- */
  A.toast = (msg, kind = 'ok', ms = 3500) => {
    const el = document.createElement('div');
    const color = kind === 'err' ? 'border-red-500/50 text-red-300' : kind === 'info' ? 'border-gold/60 text-ivory' : 'border-emerald-500/40 text-emerald-300';
    el.className = `max-w-sm rounded-lg border ${color} bg-charcoal px-4 py-3 text-sm shadow-2xl transition-all duration-300 translate-y-2 opacity-0`;
    el.innerHTML = msg;
    document.getElementById('toast-root').appendChild(el);
    requestAnimationFrame(() => el.classList.remove('translate-y-2', 'opacity-0'));
    setTimeout(() => { el.classList.add('opacity-0'); setTimeout(() => el.remove(), 300); }, ms);
  };
  A.fail = (e) => A.toast(A.esc(e.message || 'Something went wrong'), 'err');

  A.modal = (html, { size = '' } = {}) => {
    const bg = document.createElement('div');
    bg.className = 'modal-bg';
    bg.innerHTML = `<div class="modal ${size}" role="dialog">${html}</div>`;
    const close = () => { bg.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    bg.addEventListener('mousedown', (e) => { if (e.target === bg) close(); });
    bg.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(bg);
    return { el: bg.firstElementChild, close };
  };

  A.confirm = (title, text, { danger = true, ok = 'Confirm' } = {}) => new Promise((resolve) => {
    const m = A.modal(`<h3 class="heading-display text-2xl">${A.esc(title)}</h3><p class="mt-3 text-sm text-ivory/70">${text}</p>
      <div class="mt-7 flex justify-end gap-3"><button class="a-btn a-btn-o" data-close>Cancel</button><button class="a-btn ${danger ? 'a-btn-d' : ''}" data-ok>${A.esc(ok)}</button></div>`);
    m.el.querySelector('[data-ok]').addEventListener('click', () => { m.close(); resolve(true); });
    m.el.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => resolve(false)));
  });

  /* Display Laravel validation errors next to inputs named like the error keys */
  A.formErrors = (form, err) => {
    form.querySelectorAll('.f-err').forEach((e) => e.remove());
    form.querySelectorAll('.a-in,.a-sel,.a-ta').forEach((e) => e.classList.remove('border-red-500'));
    const errs = err.errors || {};
    let shown = 0;
    Object.entries(errs).forEach(([k, msgs]) => {
      const name = k.replace(/\.(\w+)/g, '[$1]');
      const inp = form.querySelector(`[name="${k}"]`) || form.querySelector(`[name="${name}"]`) || form.querySelector(`[data-field="${k.split('.')[0]}"]`);
      if (inp) {
        inp.classList.add('border-red-500');
        const p = document.createElement('p');
        p.className = 'f-err mt-1 text-xs text-red-400';
        p.textContent = msgs[0];
        inp.insertAdjacentElement('afterend', p);
        shown++;
      }
    });
    if (!shown) A.fail(err);
    else A.toast('Please fix the highlighted fields', 'err');
  };

  A.busy = (btn, on) => {
    if (!btn) return;
    if (on) { btn.dataset.label = btn.innerHTML; btn.disabled = true; btn.innerHTML = '<span class="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent align-middle"></span> Saving…'; }
    else { btn.disabled = false; if (btn.dataset.label) btn.innerHTML = btn.dataset.label; }
  };

  A.pager = (res, onPage) => {
    if (!res || res.pages <= 1) return `<p class="mt-4 text-xs text-stone">${res ? res.total : 0} result(s)</p>`;
    const id = 'pg' + Math.random().toString(36).slice(2, 8);
    const pages = [];
    for (let i = Math.max(1, res.page - 2); i <= Math.min(res.pages, res.page + 2); i++) pages.push(i);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', (e) => { const b = e.target.closest('[data-pg]'); if (b && !b.disabled) onPage(+b.dataset.pg); });
    });
    return `<div class="mt-5 flex flex-wrap items-center justify-between gap-3"><p class="text-xs text-stone">Showing ${(res.page - 1) * res.per + 1}–${Math.min(res.total, res.page * res.per)} of ${res.total}</p>
      <div class="pager" id="${id}"><button class="pg-btn" data-pg="${res.page - 1}" ${res.page <= 1 ? 'disabled' : ''}>‹</button>
      ${pages.map((p) => `<button class="pg-btn ${p === res.page ? 'on' : ''}" data-pg="${p}">${p}</button>`).join('')}
      <button class="pg-btn" data-pg="${res.page + 1}" ${res.page >= res.pages ? 'disabled' : ''}>›</button></div></div>`;
  };

  A.skeleton = (rows = 6) => `<div class="space-y-3"><div class="skel h-9 w-56"></div>${'<div class="skel h-12"></div>'.repeat(rows)}</div>`;
  A.empty = (msg, cta = '') => `<div class="empty"><svg class="mx-auto mb-3 opacity-40" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>${msg}${cta ? `<div class="mt-4">${cta}</div>` : ''}</div>`;
  A.header = (title, sub = '', actions = '') => `<div class="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p class="eyebrow mb-1">${A.esc(sub)}</p><h1 class="heading-display text-3xl font-medium sm:text-4xl">${A.esc(title)}</h1></div><div class="flex flex-wrap items-center gap-2">${actions}</div></div>`;

  /* ---------- SVG charts ---------- */
  A.barChart = (rows, { h = 220, color = '#C9A24C' } = {}) => {
    if (!rows.length) return A.empty('No data for this period');
    const max = Math.max(...rows.map((r) => r.v), 1);
    const w = Math.max(rows.length * 46, 300);
    const bw = Math.min(30, (w / rows.length) * 0.6);
    return `<div class="overflow-x-auto"><svg viewBox="0 0 ${w} ${h + 40}" style="min-width:${Math.min(w, 600)}px;width:100%;height:${h + 40}px" preserveAspectRatio="none">
      ${[0, 0.25, 0.5, 0.75, 1].map((f) => `<line x1="0" x2="${w}" y1="${10 + h * (1 - f)}" y2="${10 + h * (1 - f)}" stroke="#2c2a26" stroke-width="1"/>`).join('')}
      ${rows.map((r, i) => {
        const x = (i + 0.5) * (w / rows.length) - bw / 2, bh = (r.v / max) * h;
        return `<g><rect x="${x}" y="${10 + h - bh}" width="${bw}" height="${bh}" rx="3" fill="${color}" opacity=".9"><title>${A.esc(r.k)}: ${r.v}</title></rect>
        <text x="${x + bw / 2}" y="${h + 4 - bh}" text-anchor="middle" class="chart-tip">${r.v}</text>
        <text x="${x + bw / 2}" y="${h + 28}" text-anchor="middle" class="bar-label">${A.esc(String(r.k).slice(-5))}</text></g>`;
      }).join('')}</svg></div>`;
  };
  A.hbars = (rows, color = '#C9A24C') => {
    if (!rows.length) return A.empty('No data for this period');
    const max = Math.max(...rows.map((r) => r.v), 1);
    return `<div class="space-y-3">${rows.map((r) => `<div><div class="mb-1 flex justify-between text-xs"><span class="truncate pr-3">${A.esc(r.k)}</span><b>${r.v}</b></div>
      <div class="h-2 rounded-full bg-graphite"><div class="h-2 rounded-full" style="width:${(r.v / max) * 100}%;background:${color}"></div></div></div>`).join('')}</div>`;
  };
  A.donut = (rows) => {
    const total = rows.reduce((s, r) => s + r.v, 0);
    if (!total) return A.empty('No data for this period');
    const colors = { pending: '#facc15', confirmed: '#60a5fa', processing: '#c084fc', shipped: '#2dd4bf', delivered: '#4ade80', cancelled: '#f87171', in: '#4ade80', low: '#facc15', out: '#f87171' };
    let acc = 0;
    const segs = rows.map((r) => {
      const a0 = (acc / total) * Math.PI * 2; acc += r.v; const a1 = (acc / total) * Math.PI * 2;
      const large = a1 - a0 > Math.PI ? 1 : 0, R = 60, cx = 70, cy = 70;
      const p = (a) => [cx + R * Math.sin(a), cy - R * Math.cos(a)];
      const [x0, y0] = p(a0), [x1, y1] = p(a1 - 0.0001);
      return `<path d="M${x0} ${y0} A${R} ${R} 0 ${large} 1 ${x1} ${y1}" stroke="${colors[r.k] || '#C9A24C'}" stroke-width="18" fill="none"><title>${r.k}: ${r.v}</title></path>`;
    }).join('');
    return `<div class="flex flex-wrap items-center gap-6"><svg viewBox="0 0 140 140" width="140" height="140">${segs}<text x="70" y="76" text-anchor="middle" fill="#f4efe6" font-size="20" font-family="Georgia">${total}</text></svg>
      <div class="space-y-1.5 text-xs">${rows.map((r) => `<p class="flex items-center gap-2"><span class="dot" style="background:${colors[r.k] || '#C9A24C'}"></span><span class="capitalize">${A.esc(r.k)}</span><b class="ml-2">${r.v}</b></p>`).join('')}</div></div>`;
  };

  /* ---------- sidebar ---------- */
  const ICONS = {
    dashboard: '<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>',
    products: '<circle cx="12" cy="12" r="6"/><path d="M12 9v3l1.5 1.5M9 2h6l1 4M9 22h6l1-4M8 6 9 2M8 18l1 4"/>',
    categories: '<path d="M3 7h18M3 12h18M3 17h18"/>',
    brands: '<path d="M12 2 3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5"/>',
    orders: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/>',
    customers: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    inventory: '<path d="M21 8 12 3 3 8v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8"/>',
    reviews: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    promotions: '<path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5"/>',
    analytics: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
    content: '<path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>',
    users: '<path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3z"/><path d="m9 12 2 2 4-4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    notifications: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  };
  const NAV = [
    ['dashboard', 'Dashboard'], ['products', 'Products'], ['categories', 'Categories'], ['brands', 'Brands'], ['orders', 'Orders'],
    ['customers', 'Customers'], ['chat', 'Live Chat'], ['inventory', 'Inventory'], ['reviews', 'Reviews & Ratings'],
    ['promotions', 'Promotions'], ['analytics', 'Analytics / Reports'], ['content', 'Website Content'],
    ['users', 'Admin Users'], ['notifications', 'Notifications'], ['settings', 'Settings'],
  ];
  A.icon = (k, s = 17) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[k] || ''}</svg>`;
  const LIVECHAT_URL = window.ADMIN.liveChatUrl || '/admin/chat';
  A.liveChatUrl = LIVECHAT_URL;
  const nav = document.getElementById('side-nav');
  nav.innerHTML = NAV.filter(([k]) => A.can(k)).map(([k, l]) =>
    k === 'chat'
      ? `<a href="${LIVECHAT_URL}" target="_blank" rel="noopener" class="navitem" data-nav="${k}">${A.icon(k)}<span>${l}</span><span class="text-[9px] uppercase tracking-widest text-stone">Smartsupp</span></a>`
      : `<a href="/admin/${k}" class="navitem" data-nav="${k}">${A.icon(k)}<span>${l}</span><span class="navbadge hidden" data-badge="${k}"></span></a>`).join('');

  const sidebar = document.getElementById('sidebar'), backdrop = document.getElementById('backdrop');
  const closeDrawer = () => { sidebar.classList.add('-translate-x-full'); backdrop.classList.add('hidden'); };
  document.getElementById('nav-burger').addEventListener('click', () => { sidebar.classList.remove('-translate-x-full'); backdrop.classList.remove('hidden'); });
  backdrop.addEventListener('click', closeDrawer);

  const goBack = () => { if (window.__adminNav) history.back(); else A.go('/admin/dashboard'); };
  document.getElementById('back-btn')?.addEventListener('click', goBack);
  document.getElementById('back-btn-m')?.addEventListener('click', goBack);

  const userBtn = document.getElementById('top-user'), userMenu = document.getElementById('user-menu');
  userBtn.addEventListener('click', (e) => { e.stopPropagation(); userMenu.classList.toggle('hidden'); bellMenu.classList.add('hidden'); });
  const bellBtn = document.getElementById('top-bell'), bellMenu = document.getElementById('bell-menu');
  bellBtn.addEventListener('click', async (e) => { e.stopPropagation(); userMenu.classList.add('hidden'); bellMenu.classList.toggle('hidden'); if (!bellMenu.classList.contains('hidden')) loadBell(); });
  document.addEventListener('click', (e) => { if (!e.target.closest('#bell-menu')) bellMenu.classList.add('hidden'); userMenu.classList.add('hidden'); });
  if (!A.can('chat')) document.getElementById('top-chat').classList.add('hidden');

  A.notifIcon = { order: 'orders', customer: 'customers', chat: 'chat', low_stock: 'inventory', out_of_stock: 'inventory', review: 'reviews' };
  async function loadBell() {
    const list = document.getElementById('bell-list');
    list.innerHTML = '<div class="p-4"><div class="skel h-10"></div></div>';
    try {
      const r = await A.api('/notifications?per=8');
      list.innerHTML = r.data.length ? r.data.map((n) => `<a href="${A.esc(n.link || '/admin/notifications')}" data-nid="${n.id}" class="flex gap-3 px-5 py-3 transition hover:bg-graphite ${n.read ? 'opacity-60' : ''}">
        <span class="mt-0.5 text-gold">${A.icon(A.notifIcon[n.type] || 'notifications', 16)}</span>
        <span class="min-w-0 flex-1"><span class="block truncate text-sm">${A.esc(n.title)}</span><span class="block truncate text-xs text-stone">${A.esc(n.body || '')}</span></span>
        <span class="shrink-0 text-[10px] text-stone">${A.ago(n.createdAt)}</span></a>`).join('') : '<p class="p-6 text-center text-sm text-stone">You are all caught up.</p>';
    } catch (e) { list.innerHTML = `<p class="p-6 text-sm text-red-400">${A.esc(e.message)}</p>`; }
  }
  document.getElementById('bell-list').addEventListener('click', (e) => { const a = e.target.closest('[data-nid]'); if (a) A.api('/notifications/' + a.dataset.nid + '/read', { method: 'POST' }).then(refreshBadges); });
  document.getElementById('bell-read-all').addEventListener('click', async () => { await A.api('/notifications/read-all', { method: 'POST' }); loadBell(); refreshBadges(); });

  document.getElementById('top-search').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || !e.target.value.trim()) return;
    const q = encodeURIComponent(e.target.value.trim());
    const target = /^NV-|^AW-/i.test(e.target.value) && A.can('orders') ? 'orders' : A.can('products') ? 'products' : A.can('orders') ? 'orders' : A.can('chat') ? 'chat' : 'dashboard';
    A.go(`/admin/${target}?q=${q}`);
  });

  /* ---------- badges & realtime notifications ---------- */
  let last = { notifications: null, chats: null, latestId: null };
  const setBadge = (el, n) => { if (!el) return; el.textContent = n > 99 ? '99+' : n; el.classList.toggle('hidden', !n); };
  async function refreshBadges() {
    try {
      const b = await A.api('/badges');
      setBadge(document.getElementById('badge-bell'), b.notifications);
      setBadge(document.getElementById('badge-chat'), b.chats);
      setBadge(document.querySelector('[data-badge="chat"]'), b.chats);
      setBadge(document.querySelector('[data-badge="orders"]'), b.pendingOrders);
      setBadge(document.querySelector('[data-badge="notifications"]'), b.notifications);
      if (last.latestId !== null && b.latest && b.latest.id !== last.latestId && !b.latest.read) {
        A.toast(`<a href="${A.esc(b.latest.link || '/admin/notifications')}" class="block"><b class="text-gold">${A.esc(b.latest.title)}</b><br><span class="text-xs text-ivory/70">${A.esc(b.latest.body || '')}</span></a>`, 'info', 6000);
      } else if (last.chats !== null && b.chats > last.chats && A.section !== 'chat') {
        A.toast(`<b class="text-gold">New customer message</b><br><a href="${LIVECHAT_URL}" target="_blank" rel="noopener" class="text-xs underline">Open Live Chat</a>`, 'info', 6000);
      }
      if (b.chats > (last.chats ?? b.chats)) A.emit('chat:new');
      last = { notifications: b.notifications, chats: b.chats, latestId: b.latest ? b.latest.id : '' };
      document.title = (b.notifications + b.chats ? `(${b.notifications + b.chats}) ` : '') + 'Admin — Novette Watches';
    } catch (e) { /* ignore transient */ }
  }
  A.refreshBadges = refreshBadges;
  const listeners = {};
  A.on = (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); };
  A.emit = (ev) => (listeners[ev] || []).forEach((f) => f());
  setInterval(refreshBadges, 5000);

  /* ---------- router ---------- */
  A.every = (fn, ms) => { const t = setInterval(fn, ms); A.timers.push(t); return t; };
  A.go = (url, replace = false) => { window.__adminNav = true; history[replace ? 'replaceState' : 'pushState']({}, '', url); render(); };
  A.setQuery = (o) => { const p = Object.assign(A.params(), o); history.replaceState({}, '', location.pathname + A.qs(p)); };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="/admin/"]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || a.getAttribute('href') === '/admin/logout') return;
    const sec = a.getAttribute('href').split('?')[0].split('/')[2];
    if (!A.can(sec)) return;
    e.preventDefault();
    closeDrawer();
    A.go(a.getAttribute('href'));
  });
  window.addEventListener('popstate', render);

  async function render() {
    A.timers.forEach(clearInterval); A.timers = [];
    Object.keys(listeners).forEach((k) => { if (k !== 'keep') delete listeners[k]; });
    const parts = location.pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean);
    const section = parts[0] || 'dashboard';
    A.section = section;
    document.querySelectorAll('[data-nav]').forEach((n) => n.classList.toggle('on', n.dataset.nav === section));
    const old = document.getElementById('app');
    const app = old.cloneNode(false);
    old.replaceWith(app);
    if (!A.can(section)) { app.innerHTML = A.header('Access denied', '403') + A.empty('Your role does not have permission to view this section.'); return; }
    const page = A.pages[section];
    if (!page) { app.innerHTML = A.empty('Section not found.'); return; }
    app.innerHTML = A.skeleton();
    window.scrollTo(0, 0);
    try { await page(app, parts[1], A.params()); }
    catch (e) { app.innerHTML = A.header('Something went wrong', 'Error') + `<p class="text-sm text-red-400">${A.esc(e.message)}</p>`; }
  }
  A.render = render;

  document.addEventListener('DOMContentLoaded', () => { render(); refreshBadges(); });
})();
