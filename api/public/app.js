/* Novette storefront JS — vanilla, calls the Laravel /api on same origin */
(function () {
  const api = async (path, opts = {}) => {
    const r = await fetch('/api' + path, {
      credentials: 'same-origin',
      headers: opts.body ? { 'Content-Type': 'application/json' } : {},
      ...opts,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(data.error || r.statusText); e.status = r.status; throw e; }
    return data;
  };
  window.NV = { api };

  /* ---------- local cart/wishlist (guest) ---------- */
  const lsGet = (k) => JSON.parse(localStorage.getItem(k) || '[]');
  const lsSet = (k, v) => { localStorage.setItem(k, JSON.stringify(v)); updateBadges(); };
  window.NV.cart = {
    get: lsGet.bind(null, 'nv_cart'),
    set: (v) => lsSet('nv_cart', v),
    add: (id, qty = 1) => {
      const c = lsGet('nv_cart'); const i = c.findIndex((x) => x.watchId === id);
      if (i >= 0) c[i].qty = Math.min(10, c[i].qty + qty); else c.push({ watchId: id, qty });
      lsSet('nv_cart', c);
    },
  };
  window.NV.wishlist = {
    get: lsGet.bind(null, 'nv_wishlist'),
    set: (v) => lsSet('nv_wishlist', v),
    toggle: (id) => {
      const w = lsGet('nv_wishlist');
      const i = w.indexOf(id);
      if (i >= 0) w.splice(i, 1); else w.push(id);
      lsSet('nv_wishlist', w); return i < 0;
    },
    has: (id) => lsGet('nv_wishlist').includes(id),
  };

  /* ---------- auth ---------- */
  window.NV.user = null;
  const syncServerLists = async () => {
    if (!window.NV.user) return;
    try {
      const cart = lsGet('nv_cart');
      if (cart.length) await api('/cart', { method: 'PUT', body: { items: cart } });
      const wl = lsGet('nv_wishlist');
      if (wl.length) await api('/wishlist', { method: 'PUT', body: { watchIds: wl } });
      localStorage.removeItem('nv_cart'); localStorage.removeItem('nv_wishlist');
    } catch (e) {}
  };
  window.NV.login = async (email, password, remember = true) => {
    const r = await api('/auth/login', { method: 'POST', body: { email, password, remember } });
    window.NV.user = r.user; await syncServerLists(); renderAuth(); updateBadges(); return r.user;
  };
  window.NV.signup = async (name, email, password, remember = true) => {
    const r = await api('/auth/signup', { method: 'POST', body: { name, email, password, remember } });
    window.NV.user = r.user; await syncServerLists(); renderAuth(); updateBadges(); return r.user;
  };
  window.NV.logout = async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    window.NV.user = null; renderAuth(); updateBadges();
    if (window.smartsupp) window.smartsupp('name', '');
    if (location.pathname.startsWith('/account') || location.pathname.startsWith('/admin')) location.href = '/';
  };

  function renderAuth() {
    const el = document.getElementById('auth-links');
    if (!el) return;
    const u = window.NV.user;
    el.innerHTML = u
      ? `<span class="text-ivory/80">Hi, ${(u.name || '').split(' ')[0]}</span>` +
        `<a href="/account" class="transition hover:text-gold">Account</a>` +
        (u.role === 'admin' ? `<a href="/admin" class="transition hover:text-gold">Admin</a>` : '') +
        `<button type="button" onclick="NV.logout()" class="uppercase tracking-[0.22em] transition hover:text-gold">Log out</button>`
      : `<a href="/signup" class="transition hover:text-gold">Sign Up</a><a href="/login" class="transition hover:text-gold">Login</a>`;
  }

  async function updateBadges() {
    let cart = [], wl = [];
    if (window.NV.user) {
      try { cart = await api('/cart'); } catch (e) {}
      try { wl = await api('/wishlist'); } catch (e) {}
      cart = cart.map((i) => i.watchId);
      wl = wl.map((i) => i.watchId);
    } else {
      cart = lsGet('nv_cart').map((i) => i.watchId);
      wl = lsGet('nv_wishlist');
    }
    const cc = document.getElementById('cart-count');
    const wc = document.getElementById('wish-count');
    if (cc) { cc.textContent = cart.length; cc.classList.toggle('hidden', !cart.length); cc.classList.toggle('flex', !!cart.length); }
    if (wc) { wc.textContent = wl.length; wc.classList.toggle('hidden', !wl.length); wc.classList.toggle('flex', !!wl.length); }
  }
  window.NV.updateBadges = updateBadges;

  /* ---------- dropdown nav ---------- */
  document.querySelectorAll('.nav-toggle').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const name = btn.dataset.menu;
      const panel = document.querySelector(`[data-panel="${name}"]`);
      const open = !panel.classList.contains('invisible');
      closeMenus();
      if (!open) { panel.classList.remove('invisible', 'opacity-0'); }
    });
  });
  document.addEventListener('click', closeMenus);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenus(); });
  function closeMenus() {
    document.querySelectorAll('.nav-panel').forEach((p) => p.classList.add('invisible', 'opacity-0'));
  }

  /* ---------- newsletter ---------- */
  const nf = document.getElementById('newsletter-form');
  if (nf) nf.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = nf.querySelector('input').value;
    try { await api('/newsletter', { method: 'POST', body: { email } }); } catch (err) {}
    nf.classList.add('hidden');
    document.getElementById('newsletter-done').classList.remove('hidden');
  });

  /* ---------- support phone ---------- */
  fetch('/api/site-settings').then((r) => r.json()).then((s) => {
    if (s.supportPhone) {
      const p = document.getElementById('support-phone');
      if (p) { p.textContent = s.supportPhone; p.href = 'tel:' + s.supportPhone.replace(/[^+0-9]/g, ''); }
    }
    if (s.announcement) {
      const b = document.createElement('div');
      b.className = 'bg-gold text-ink text-center text-xs uppercase tracking-[0.2em] py-2';
      b.textContent = s.announcement;
      document.querySelector('header').prepend(b);
    }
  }).catch(() => {});

  /* ---------- add-to-cart / wishlist buttons ---------- */
  document.addEventListener('click', async (e) => {
    const add = e.target.closest('[data-add-cart]');
    if (add) {
      const id = add.dataset.addCart;
      if (window.NV.user) { /* merge into server cart */ const items = (await api('/cart').catch(() => [])).map((i) => ({ watchId: i.watchId, qty: i.qty })); const ex = items.find((i) => i.watchId === id); if (ex) ex.qty = Math.min(10, ex.qty + 1); else items.push({ watchId: id, qty: 1 }); await api('/cart', { method: 'PUT', body: { items } }).catch(() => {}); }
      else window.NV.cart.add(id);
      add.textContent = 'Added to Cart';
      updateBadges();
      return;
    }
    const wbtn = e.target.closest('[data-wish]');
    if (wbtn) {
      const id = wbtn.dataset.wish;
      if (window.NV.user) { const items = await api('/wishlist').catch(() => []); const ids = items.map((i) => i.watchId); const i = ids.indexOf(id); if (i >= 0) ids.splice(i, 1); else ids.push(id); await api('/wishlist', { method: 'PUT', body: { watchIds: ids } }).catch(() => {}); }
      else window.NV.wishlist.toggle(id);
      wbtn.classList.toggle('text-gold');
      updateBadges();
    }
  });


  /* ---------- boot ---------- */
  window.NV.ready = (async () => {
    try { const r = await api('/auth/me'); window.NV.user = r.user; } catch (e) {}
    renderAuth(); updateBadges();
  })();

  /* ---------- Smartsupp live chat ---------- */
  window.NV.ready.then(() => {
    if (!window.smartsupp) return;
    const u = window.NV.user;
    if (u) {
      window.smartsupp('name', u.name || '');
      window.smartsupp('email', u.email || '');
      window.smartsupp('variables', { Customer_ID: 'novette-' + u.id });
    }
    if (new URLSearchParams(location.search).get('chat')) window.smartsupp('chat:open');
  });
})();
