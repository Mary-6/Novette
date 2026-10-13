/* Novette Admin — Promotions, Analytics, Website Content, Admin Users, Settings, Notifications */
(() => {
  const { esc, money, chip } = A;

  /* ===================== Promotions ===================== */
  A.pages.promotions = async (app, _id, params) => {
    let kind = params.kind || '';
    const kinds = [['', 'All'], ['promo_code', 'Promo Codes'], ['discount', 'Discounts'], ['product', 'Product Promotions'], ['seasonal', 'Seasonal']];
    app.innerHTML = A.header('Promotions', 'Marketing', `<button class="a-btn" id="pr-new">+ New Promotion</button>`) +
      `<div class="mb-5 flex flex-wrap gap-2" id="pr-tabs">${kinds.map(([k, l]) => `<button class="pill ${kind === k ? 'on' : ''}" data-k="${k}">${l}</button>`).join('')}</div><div id="pr-list">${A.skeleton()}</div>`;
    const load = async () => {
      const list = await A.api('/promotions' + (kind ? '?kind=' + kind : ''));
      document.getElementById('pr-list').innerHTML = list.length ? `<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">${list.map((p) => `<div class="a-card flex flex-col rounded-xl p-5">
        <div class="mb-3 flex items-start justify-between gap-3"><div><p class="heading-display text-xl">${esc(p.name)}</p><p class="text-xs uppercase tracking-[0.15em] text-stone">${p.kind.replace('_', ' ')}</p></div>${chip(p.state)}</div>
        <p class="heading-display text-3xl">${p.type === 'percent' ? p.value + '%' : money(p.value)} <span class="text-sm font-normal text-stone">off</span>${p.code ? `<span class="ml-2 rounded border border-dashed border-gold px-2 py-0.5 font-mono text-sm text-gold">${esc(p.code)}</span>` : ''}</p>
        ${p.description ? `<p class="mt-2 text-sm text-ivory/70">${esc(p.description)}</p>` : ''}
        <dl class="mt-3 space-y-1.5 text-xs text-stone"><p>Runs: ${p.startDate ? A.date(p.startDate) : 'now'} → ${p.endDate ? A.date(p.endDate) : 'open-ended'}</p>
        <p>Applies to: ${p.appliesTo.length ? p.appliesTo.length + ' specific watch(es)' : 'entire catalogue'}${p.uses !== null ? ` · used ${p.uses}×` : ''}</p></dl>
        <div class="mt-4 flex gap-2 pt-2"><button class="a-btn a-btn-o !py-1.5 !text-xs" data-edit="${p.id}">Edit</button>
          <button class="a-btn a-btn-o !py-1.5 !text-xs" data-tog="${p.id}" data-to="${p.status === 'active' ? 'inactive' : 'active'}">${p.status === 'active' ? 'Deactivate' : 'Activate'}</button>
          <button class="a-btn a-btn-o !py-1.5 !text-xs !border-red-500/40 !text-red-400" data-del="${p.id}">Delete</button></div></div>`).join('')}</div>` : A.empty('No promotions yet — create one to offer codes and discounts.', '<button class="a-btn" id="pr-new2">+ New Promotion</button>');
      app.dataset.list = JSON.stringify(list);
    };
    const edit = async (p) => {
      const prods = p ? null : null;
      const m = A.modal(`<h3 class="heading-display mb-5 text-2xl">${p ? 'Edit' : 'New'} Promotion</h3><form class="grid gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2"><label class="a-lbl">Name *</label><input class="a-in" name="name" required value="${esc(p ? p.name : '')}" placeholder="e.g. Summer Collectors Offer"></div>
        <div><label class="a-lbl">Kind *</label><select class="a-sel" name="kind">${[['promo_code', 'Promo code'], ['discount', 'Site-wide discount'], ['product', 'Product promotion'], ['seasonal', 'Seasonal promotion']].map(([v, l]) => `<option value="${v}" ${p && p.kind === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        <div><label class="a-lbl">Code (required for promo codes)</label><input class="a-in font-mono uppercase" name="code" value="${esc(p ? p.code || '' : '')}" placeholder="NOVETTE10"></div>
        <div><label class="a-lbl">Discount type *</label><select class="a-sel" name="type"><option value="percent" ${p && p.type === 'fixed' ? '' : 'selected'}>Percent off</option><option value="fixed" ${p && p.type === 'fixed' ? 'selected' : ''}>Fixed amount off</option></select></div>
        <div><label class="a-lbl">Value *</label><input class="a-in" name="value" type="number" min="1" required value="${p ? p.value : ''}" placeholder="10 or 500"></div>
        <div><label class="a-lbl">Start date</label><input class="a-in" type="date" name="startDate" value="${p && p.startDate ? p.startDate.slice(0, 10) : ''}"></div>
        <div><label class="a-lbl">End date</label><input class="a-in" type="date" name="endDate" value="${p && p.endDate ? p.endDate.slice(0, 10) : ''}"></div>
        <div class="sm:col-span-2"><label class="a-lbl">Description</label><textarea class="a-ta" name="description" rows="2">${esc(p ? p.description || '' : '')}</textarea></div>
        <div class="sm:col-span-2"><label class="a-lbl">Applicable products</label><input class="a-in" id="pp-q" placeholder="Search watches to limit scope — leave empty for the whole catalogue">
          <div id="pp-list" class="mt-2 max-h-36 space-y-1 overflow-y-auto"></div><div id="pp-chosen" class="mt-2 flex flex-wrap gap-2" data-field="appliesTo"></div></div>
        <div class="sm:col-span-2"><label class="flex items-center justify-between text-sm"><span>Active</span><input type="checkbox" class="a-chk" name="status" ${!p || p.status === 'active' ? 'checked' : ''}></label></div>
        <div class="flex justify-end gap-3 sm:col-span-2"><button type="button" class="a-btn a-btn-o" data-close>Cancel</button><button class="a-btn">Save promotion</button></div></form>`, { size: 'lg' });
      const chosen = new Map((p ? p.appliesTo : []).map((id) => [id, null]));
      const drawChosen = () => {
        const el = m.el.querySelector('#pp-chosen');
        el.innerHTML = [...chosen.entries()].map(([id, name]) => `<span class="chip chip-confirmed">${esc(name || id)} <button type="button" class="ml-1" data-un="${id}">✕</button></span>`).join('');
      };
      const fill = async (q) => {
        const el = m.el.querySelector('#pp-list');
        if (!q.trim()) { el.innerHTML = ''; return; }
        const r = await A.api('/products' + A.qs({ q, per: 6 }));
        el.innerHTML = r.data.length ? r.data.map((w) => `<button type="button" class="flex w-full items-center gap-3 rounded p-2 text-left hover:bg-graphite" data-add="${w.id}" data-name="${esc(w.model)}">
          <img src="${esc(w.image || '')}" class="h-8 w-8 rounded bg-sand object-cover" alt=""><span class="truncate text-sm">${esc(w.model)}</span></button>`).join('') : '<p class="p-2 text-xs text-stone">No matches.</p>';
      };
      m.el.querySelector('#pp-q').addEventListener('input', A.debounce((e) => fill(e.target.value).catch(() => {}), 300));
      m.el.addEventListener('click', (e) => {
        const a = e.target.closest('[data-add]'), u = e.target.closest('[data-un]');
        if (a) { chosen.set(a.dataset.add, a.dataset.name); drawChosen(); }
        if (u) { chosen.delete(u.dataset.un); drawChosen(); }
      });
      drawChosen();
      if (p && p.appliesTo.length) { /* fetch names lazily */
        A.api('/products' + A.qs({ per: 100 })).then((r) => { p.appliesTo.forEach((id) => { const w = r.data.find((x) => x.id === id); if (w) chosen.set(id, w.model); }); drawChosen(); }).catch(() => {});
      }
      m.el.querySelector('form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const body = { name: fd.get('name'), kind: fd.get('kind'), code: (fd.get('code') || '').trim() || null, description: fd.get('description') || null,
          type: fd.get('type'), value: parseInt(fd.get('value'), 10) || null, startDate: fd.get('startDate') || null, endDate: fd.get('endDate') || null,
          appliesTo: [...chosen.keys()], status: fd.has('status') ? 'active' : 'inactive' };
        try { await A.api(p ? '/promotions/' + p.id : '/promotions', { method: p ? 'PATCH' : 'POST', body }); m.close(); A.toast('Promotion saved'); load(); } catch (err) { A.formErrors(e.target, err); }
      });
    };
    document.getElementById('pr-tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (b) { kind = b.dataset.k; A.setQuery({ kind }); document.querySelectorAll('#pr-tabs .pill').forEach((p) => p.classList.toggle('on', p === b)); load(); } });
    app.addEventListener('click', async (e) => {
      const list = JSON.parse(app.dataset.list || '[]');
      const ed = e.target.closest('[data-edit]'), tg = e.target.closest('[data-tog]'), dl = e.target.closest('[data-del]'), nw = e.target.closest('#pr-new,#pr-new2');
      try {
        if (nw) edit(null);
        if (ed) edit(list.find((p) => p.id === ed.dataset.edit));
        if (tg) { const p = list.find((x) => x.id === tg.dataset.tog); await A.api('/promotions/' + tg.dataset.tog, { method: 'PATCH', body: { name: p.name, kind: p.kind, code: p.code, description: p.description, type: p.type, value: p.value, startDate: p.startDate, endDate: p.endDate, appliesTo: p.appliesTo, status: tg.dataset.to } }); load(); }
        if (dl && await A.confirm('Delete promotion?', 'This promotion will be permanently removed.', { ok: 'Delete' })) { await A.api('/promotions/' + dl.dataset.del, { method: 'DELETE' }); A.toast('Promotion deleted'); load(); }
      } catch (err) { A.fail(err); }
    });
    await load();
  };

  /* ===================== Analytics ===================== */
  A.pages.analytics = async (app, _id, params) => {
    const st = Object.assign({ range: 'month', from: '', to: '' }, params);
    const ranges = [['today', 'Today'], ['week', 'This Week'], ['month', 'This Month'], ['year', 'This Year'], ['all', 'All Time'], ['custom', 'Custom']];
    app.innerHTML = A.header('Analytics & Reports', 'Performance') + `
      <div class="a-card mb-6 flex flex-wrap items-center gap-3 rounded-xl p-4">
        <div id="an-tabs" class="flex flex-wrap gap-2">${ranges.map(([k, l]) => `<button class="pill ${st.range === k ? 'on' : ''}" data-r="${k}">${l}</button>`).join('')}</div>
        <span id="an-custom" class="${st.range === 'custom' ? '' : 'hidden'} flex items-center gap-2"><input type="date" class="a-in !w-40" id="an-from" value="${esc(st.from)}"><span class="text-stone">→</span><input type="date" class="a-in !w-40" id="an-to" value="${esc(st.to)}"><button class="a-btn a-btn-o !py-2" id="an-apply">Apply</button></span>
        <span id="an-range" class="ml-auto text-xs text-stone"></span></div>
      <div id="an-body">${A.skeleton()}</div>`;
    const series = (obj) => Object.entries(obj || {}).map(([k, v]) => ({ k, v: +v }));
    const load = async () => {
      A.setQuery(st);
      const d = await A.api('/analytics' + A.qs({ range: st.range, from: st.from, to: st.to }));
      const t = d.totals;
      document.getElementById('an-range').textContent = `${d.range.from} — ${d.range.to}`;
      const tot = (l, v, sub = '') => `<div class="stat-card"><p class="eyebrow">${l}</p><p class="num">${v}</p>${sub ? `<p class="mt-1 text-xs text-stone">${sub}</p>` : ''}</div>`;
      document.getElementById('an-body').innerHTML = `
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          ${tot('Orders', t.orders, `${t.unitsOrdered} watches ordered`)}
          ${tot('New customers', t.newCustomers, `${t.customers} total`)}
          ${tot('Active products', t.activeProducts, `${t.products} total`)}
          ${tot('Chat messages', t.chatMessages, `${t.conversations} conversations`)}
        </div>
        <div class="mt-6 grid gap-6 xl:grid-cols-2">
          <section class="a-card rounded-xl p-5"><h2 class="heading-display mb-4 text-xl">Orders over time</h2>${A.barChart(series(d.ordersSeries))}</section>
          <section class="a-card rounded-xl p-5"><h2 class="heading-display mb-4 text-xl">Customer growth</h2>${A.barChart(series(d.customerGrowth), { color: '#4ade80' })}</section>
          <section class="a-card rounded-xl p-5"><h2 class="heading-display mb-4 text-xl">Order status</h2>${A.donut(Object.entries(d.statusStats || {}).map(([k, v]) => ({ k, v })))}</section>
          <section class="a-card rounded-xl p-5"><h2 class="heading-display mb-4 text-xl">Live-chat activity</h2>${A.barChart(series(d.chatSeries), { color: '#60a5fa' })}</section>
        </div>
        <div class="mt-6 grid gap-6 xl:grid-cols-3">
          <section class="a-card rounded-xl p-5"><h2 class="heading-display mb-4 text-xl">Most ordered watches</h2>
            ${d.topWatches.length ? `<table class="a-table"><tr><th>Watch</th><th class="text-right">Units</th><th class="text-right">Orders</th></tr>${d.topWatches.map((w) => `<tr class="a-row"><td class="text-sm">${esc(w.model)}</td><td class="text-right">${w.units}</td><td class="text-right text-stone">${w.orders}</td></tr>`).join('')}</table>` : A.empty('No orders in this period.')}</section>
          <section class="a-card rounded-xl p-5"><h2 class="heading-display mb-4 text-xl">Best-selling brands</h2>${A.hbars(d.topBrands.map((b) => ({ k: b.name, v: b.units })))}</section>
          <section class="a-card rounded-xl p-5"><h2 class="heading-display mb-4 text-xl">Popular categories</h2>${A.hbars(d.topCategories.map((c) => ({ k: c.name, v: +c.units })), '#8ea7ff')}</section>
        </div>
        <div class="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
          <section class="a-card overflow-x-auto rounded-xl p-5"><h2 class="heading-display mb-4 text-xl">Product performance</h2>
            ${d.productPerformance.length ? `<table class="a-table"><tr><th>Watch</th><th class="text-right">Units sold</th><th class="text-right">Wishlists</th><th class="text-right">Rating</th><th class="text-right">Stock</th></tr>
            ${d.productPerformance.map((w) => `<tr class="a-row"><td class="text-sm">${esc(w.model)}</td><td class="text-right">${w.units}</td><td class="text-right">${w.wishlists}</td><td class="text-right">${w.rating ? w.rating + ' ★' : '—'}</td><td class="text-right">${w.inventory}</td></tr>`).join('')}</table>` : A.empty('No product activity yet.')}</section>
          <section class="a-card rounded-xl p-5"><h2 class="heading-display mb-4 text-xl">Inventory</h2>${A.donut([{ k: 'in', v: d.inventory.in }, { k: 'low', v: d.inventory.low }, { k: 'out', v: d.inventory.out }])}
            <p class="mt-4 text-center text-xs text-stone">${d.inventory.units} units on hand</p>
            ${A.can('inventory') ? '<a href="/admin/inventory" class="a-btn a-btn-o mt-4 w-full">Manage inventory</a>' : ''}</section>
        </div>`;
    };
    document.getElementById('an-tabs').addEventListener('click', (e) => {
      const b = e.target.closest('[data-r]'); if (!b) return;
      st.range = b.dataset.r; st.page = 1;
      document.querySelectorAll('#an-tabs .pill').forEach((p) => p.classList.toggle('on', p === b));
      document.getElementById('an-custom').classList.toggle('hidden', st.range !== 'custom');
      if (st.range !== 'custom') load(); else if (st.from && st.to) load();
    });
    document.getElementById('an-apply').addEventListener('click', () => {
      st.from = document.getElementById('an-from').value; st.to = document.getElementById('an-to').value;
      if (st.from && st.to) load();
    });
    await load();
  };

  /* ===================== Website content ===================== */
  A.pages.content = async (app) => {
    const c = await A.api('/content');
    const tabs = [['home', 'Homepage'], ['about', 'About Us'], ['contact', 'Contact & Socials'], ['faq', 'FAQ'], ['lists', 'Featured Lists']];
    let tab = 'home';
    app.innerHTML = A.header('Website Content', 'Storefront') +
      `<div class="mb-6 flex flex-wrap gap-2" id="ct-tabs">${tabs.map(([k, l]) => `<button class="pill ${k === 'home' ? 'on' : ''}" data-t="${k}">${l}</button>`).join('')}</div><div id="ct-body"></div>`;
    const body = document.getElementById('ct-body');
    const showTab = () => {
      document.querySelectorAll('#ct-tabs .pill').forEach((p) => p.classList.toggle('on', p.dataset.t === tab));
      if (tab === 'home') drawHome();
      else if (tab === 'about') drawAbout();
      else if (tab === 'contact') drawContact();
      else if (tab === 'faq') drawFaq();
      else drawLists();
    };
    document.getElementById('ct-tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-t]'); if (b) { tab = b.dataset.t; showTab(); } });

    const field = (label, name, val, type = 'input') => `<div><label class="a-lbl">${label}</label>${type === 'ta' ? `<textarea class="a-ta" name="${name}" rows="4">${esc(val)}</textarea>` : `<input class="a-in" name="${name}" value="${esc(val)}">`}</div>`;

    let heroImgs = [...(c.hero.images || [])];
    function drawHome() {
      body.innerHTML = `<form id="ct-home" class="grid gap-6 lg:grid-cols-2">
        <section class="a-card space-y-4 rounded-xl p-6"><h2 class="heading-display text-xl">Hero</h2>
          ${field('Title', 'hero[title]', c.hero.title)}${field('Highlight (italic gold phrase)', 'hero[highlight]', c.hero.highlight)}
          ${field('Subtitle', 'hero[subtitle]', c.hero.subtitle, 'ta')}
          <div class="grid grid-cols-2 gap-3">${field('Button label', 'hero[ctaLabel]', c.hero.ctaLabel)}${field('Button link', 'hero[ctaLink]', c.hero.ctaLink)}</div>
          <div><div class="mb-2 flex items-center justify-between"><label class="a-lbl !mb-0">Hero images</label><label class="a-btn a-btn-o cursor-pointer !py-1.5 !text-xs">Upload<input type="file" id="hh-file" multiple accept="image/*" class="hidden"></label></div>
          <div id="hh-imgs" class="grid grid-cols-4 gap-2" data-field="hero.images"></div><p class="mt-2 text-xs text-stone">Up to 8 images; they rotate every 5s on the homepage. Leave empty to keep the default slideshow and film.</p></div></section>
        <section class="a-card space-y-4 rounded-xl p-6"><h2 class="heading-display text-xl">Promotional section</h2>
          <label class="flex items-center justify-between text-sm"><span>Show promotional band on homepage</span><input type="checkbox" class="a-chk" name="promo[enabled]" ${c.promo.enabled ? 'checked' : ''}></label>
          ${field('Eyebrow', 'promo[eyebrow]', c.promo.eyebrow)}${field('Title', 'promo[title]', c.promo.title)}${field('Text', 'promo[text]', c.promo.text, 'ta')}
          <div class="grid grid-cols-2 gap-3">${field('Button label', 'promo[ctaLabel]', c.promo.ctaLabel)}${field('Button link', 'promo[ctaLink]', c.promo.ctaLink)}</div></section>
        <button class="a-btn lg:col-span-2 lg:w-56">Save homepage content</button></form>`;
      const imgsEl = document.getElementById('hh-imgs');
      const draw = () => { imgsEl.innerHTML = heroImgs.map((u, i) => `<div class="group relative"><img src="${esc(u)}" class="aspect-square w-full rounded bg-sand object-cover" alt=""><button type="button" class="absolute right-1 top-1 rounded bg-red-500/80 px-1.5 text-xs opacity-0 group-hover:opacity-100" data-hrm="${i}">✕</button></div>`).join('') || '<p class="col-span-4 text-xs text-stone">No custom images — default slideshow is used.</p>'; };
      draw();
      imgsEl.addEventListener('click', (e) => { const b = e.target.closest('[data-hrm]'); if (b) { heroImgs.splice(+b.dataset.hrm, 1); draw(); } });
      document.getElementById('hh-file').addEventListener('change', async (e) => {
        try { const r = await A.upload(e.target.files); heroImgs.push(...r.urls); heroImgs = heroImgs.slice(0, 8); draw(); } catch (err) { A.fail(err); }
      });
      document.getElementById('ct-home').addEventListener('submit', saveContent);
    }
    function drawAbout() {
      body.innerHTML = `<form id="ct-about" class="a-card max-w-3xl space-y-4 rounded-xl p-6">
        <h2 class="heading-display text-xl">About Us</h2>${field('Title', 'about[title]', c.about.title)}${field('Body', 'about[body]', c.about.body, 'ta')}
        <button class="a-btn">Save About Us</button></form>`;
      body.querySelector('textarea').rows = 10;
      document.getElementById('ct-about').addEventListener('submit', saveContent);
    }
    function drawContact() {
      body.innerHTML = `<form id="ct-contact" class="grid gap-6 lg:grid-cols-2">
        <section class="a-card space-y-4 rounded-xl p-6"><h2 class="heading-display text-xl">Contact information</h2>
          ${field('Support phone', 'contact[phone]', c.contact.phone)}${field('Contact email', 'contact[email]', c.contact.email)}
          ${field('Address', 'contact[address]', c.contact.address || '')}${field('Opening hours', 'contact[hours]', c.contact.hours || '')}</section>
        <section class="a-card space-y-4 rounded-xl p-6"><h2 class="heading-display text-xl">Social media</h2>
          ${['instagram', 'facebook', 'x', 'youtube', 'tiktok'].map((s) => field(s[0].toUpperCase() + s.slice(1), `socials[${s}]`, c.socials[s] || '')).join('')}
          <p class="text-xs text-stone">Full URLs (https://…). Leave blank to hide an icon.</p></section>
        <button class="a-btn lg:col-span-2 lg:w-56">Save contact & socials</button></form>`;
      document.getElementById('ct-contact').addEventListener('submit', saveContent);
    }
    async function saveContent(e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      const out = { hero: Object.assign({}, c.hero, { images: heroImgs }), promo: Object.assign({}, c.promo), about: Object.assign({}, c.about), contact: Object.assign({}, c.contact), socials: Object.assign({}, c.socials) };
      const nest = (obj, path, v) => { const [a, b] = path; obj[a][b] = v; };
      for (const [k, v] of fd.entries()) {
        const mm = k.match(/^(\w+)\[(\w+)\]$/);
        if (!mm) continue;
        const [, grp, key] = mm;
        if (grp === 'promo' && key === 'enabled') continue;
        if (grp === 'socials') nest(out, [grp, key], v || null); else nest(out, [grp, key], v);
      }
      out.promo.enabled = fd.has('promo[enabled]');
      try { await A.api('/content', { method: 'PUT', body: out }); A.toast('Website content saved'); }
      catch (err) { A.formErrors(e.target, err); }
    }
    function drawLists() {
      const flag = (key, label, hint) => `<section class="a-card rounded-xl p-6"><div class="mb-4 flex items-center justify-between"><h2 class="heading-display text-xl">${label}</h2>
          <input class="a-in !w-64" placeholder="Search to add…" data-flq="${key}"></div>
          <p class="mb-4 text-xs text-stone">${hint}</p>
          <div class="mb-4 flex flex-wrap gap-2" data-flchips="${key}">${c.lists[key].map((w) => `<span class="chip chip-confirmed">${esc(w.model)} <button type="button" class="ml-1" data-flrm="${key}|${w.id}">✕</button></span>`).join('') || '<p class="text-sm text-stone">None selected.</p>'}</div>
          <div class="max-h-40 space-y-1 overflow-y-auto" data-fllist="${key}"></div></section>`;
      body.innerHTML = `<div class="grid gap-6">${flag('isFeatured', 'Featured watches', 'Shown in “The Edit” on the homepage.')}${flag('isNew', 'New arrivals', 'Shown in “New Arrivals” on the homepage.')}${flag('isBestSeller', 'Best sellers', 'Flagged as best sellers across the catalogue.')}</div>`;
      body.addEventListener('input', A.debounce(async (e) => {
        const q = e.target.dataset.flq; if (q === undefined) return;
        const el = body.querySelector(`[data-fllist="${q}"]`);
        if (!e.target.value.trim()) { el.innerHTML = ''; return; }
        const r = await A.api('/products' + A.qs({ q: e.target.value, per: 6 }));
        el.innerHTML = r.data.map((w) => `<button type="button" class="flex w-full items-center gap-3 rounded p-2 text-left hover:bg-graphite" data-fladd="${q}|${w.id}" data-name="${esc(w.model)}"><img src="${esc(w.image || '')}" class="h-8 w-8 rounded bg-sand object-cover" alt=""><span class="truncate text-sm">${esc(w.model)}</span></button>`).join('') || '<p class="p-2 text-xs text-stone">No matches.</p>';
      }, 300));
      body.addEventListener('click', async (e) => {
        const add = e.target.closest('[data-fladd]'), rm = e.target.closest('[data-flrm]');
        try {
          if (add) { const [k, id] = add.dataset.fladd.split('|'); await A.api('/products/' + id, { method: 'PATCH', body: { [k]: true } }); c.lists[k].push({ id, model: add.dataset.name }); drawLists(); }
          if (rm) { const [k, id] = rm.dataset.flrm.split('|'); await A.api('/products/' + id, { method: 'PATCH', body: { [k]: false } }); c.lists[k] = c.lists[k].filter((w) => w.id !== id); drawLists(); }
          A.toast('List updated');
        } catch (err) { A.fail(err); }
      });
    }
    function drawFaq() {
      const rows = [...c.faqs];
      const row = (f, i) => `<div class="a-card flex items-start gap-3 rounded-xl p-4" data-fid="${f.id}">
        <div class="mt-1 flex flex-col gap-1"><button class="iconbtn" data-mv="${i}" data-d="-1" ${i === 0 ? 'disabled' : ''}>↑</button><button class="iconbtn" data-mv="${i}" data-d="1" ${i === rows.length - 1 ? 'disabled' : ''}>↓</button></div>
        <div class="min-w-0 flex-1"><p class="text-xs uppercase tracking-[0.15em] text-gold">${esc(f.category)}</p><p class="font-medium">${esc(f.question)}</p><p class="mt-1 text-sm text-ivory/70">${esc(f.answer)}</p></div>
        <div class="flex shrink-0 flex-col gap-1"><button class="iconbtn" data-edit="${i}">Edit</button><button class="iconbtn danger" data-del="${i}">Delete</button></div></div>`;
      body.innerHTML = `<div class="mb-4 flex justify-end"><button class="a-btn" id="fq-new">+ Add FAQ</button></div><div id="fq-list" class="space-y-3">${rows.map(row).join('') || A.empty('No FAQs yet.')}</div>`;
      const sync = async () => { await A.api('/faqs/reorder', { method: 'POST', body: { ids: rows.map((f) => f.id) } }); };
      const edit = (f, idx) => {
        const m = A.modal(`<h3 class="heading-display mb-5 text-2xl">${f ? 'Edit' : 'Add'} FAQ</h3><form class="space-y-4">
          <div><label class="a-lbl">Category</label><input class="a-in" name="category" value="${esc(f ? f.category : 'General')}" required></div>
          <div><label class="a-lbl">Question</label><input class="a-in" name="question" value="${esc(f ? f.question : '')}" required></div>
          <div><label class="a-lbl">Answer</label><textarea class="a-ta" name="answer" rows="4" required>${esc(f ? f.answer : '')}</textarea></div>
          <div class="flex justify-end gap-3"><button type="button" class="a-btn a-btn-o" data-close>Cancel</button><button class="a-btn">Save</button></div></form>`);
        m.el.querySelector('form').addEventListener('submit', async (e) => {
          e.preventDefault();
          try {
            const b = Object.fromEntries(new FormData(e.target));
            if (f) { await A.api('/faqs/' + f.id, { method: 'PATCH', body: b }); rows[idx] = Object.assign({}, f, b); }
            else { const nf = await A.api('/faqs', { method: 'POST', body: b }); rows.push(nf); }
            m.close(); A.toast('FAQ saved'); drawFaq();
          } catch (err) { A.formErrors(e.target, err); }
        });
      };
      const list = document.getElementById('fq-list');
      document.getElementById('fq-new').addEventListener('click', () => edit(null));
      list.addEventListener('click', async (e) => {
        const mv = e.target.closest('[data-mv]'), ed = e.target.closest('[data-edit]'), dl = e.target.closest('[data-del]');
        if (mv) { const i = +mv.dataset.mv, j = i + +mv.dataset.d; if (j >= 0 && j < rows.length) { [rows[i], rows[j]] = [rows[j], rows[i]]; await sync(); drawFaq(); } }
        if (ed) edit(rows[+ed.dataset.edit], +ed.dataset.edit);
        if (dl) { const i = +dl.dataset.del; if (await A.confirm('Delete FAQ?', `"${esc(rows[i].question)}" will be removed.`, { ok: 'Delete' })) { await A.api('/faqs/' + rows[i].id, { method: 'DELETE' }); rows.splice(i, 1); drawFaq(); } }
      });
    }
    showTab();
  };

  /* ===================== Admin users ===================== */
  A.pages.users = async (app) => {
    const d = await A.api('/users');
    const roleChip = { admin: 'chip-delivered', product_manager: 'chip-confirmed', order_manager: 'chip-shipped', chat_support: 'chip-processing' };
    app.innerHTML = A.header('Admin Users', 'Roles & access', `<button class="a-btn" id="u-new">+ Add Admin</button>`) + `
      <div class="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">${d.roles.map((r) => `<div class="a-card rounded-xl p-4"><p class="font-medium text-gold">${esc(r.label)}</p>
        <p class="mt-1 text-xs leading-relaxed text-stone">${r.key === 'admin' ? 'Full access to every section' : 'Access: ' + r.sections.join(', ')}</p></div>`).join('')}</div>
      <div class="a-card overflow-x-auto rounded-xl"><table class="a-table"><tr><th>Admin</th><th>Email</th><th>Role</th><th>Status</th><th>Last active</th><th class="text-right">Actions</th></tr>
      ${d.users.map((u) => `<tr class="a-row"><td><div class="flex items-center gap-3"><span class="relative">${A.avatar(u.name, u.avatar)}<span class="dot ${u.online ? 'dot-on' : 'dot-off'} absolute -bottom-0.5 -right-0.5 ring-2 ring-ink"></span></span>
        <span class="font-medium">${esc(u.name)}${u.id === A.user.id ? ' <span class="text-xs text-gold">(you)</span>' : ''}</span></div></td>
        <td class="text-xs">${esc(u.email)}</td><td><span class="chip ${roleChip[u.role] || ''}">${esc(u.roleLabel)}</span></td>
        <td>${chip(u.isActive ? 'active' : 'inactive', u.isActive ? 'Active' : 'Deactivated')}</td>
        <td class="whitespace-nowrap text-xs text-stone">${u.online ? '<b class="text-emerald-400">Online</b>' : A.ago(u.lastActiveAt)}</td>
        <td class="whitespace-nowrap text-right"><button class="iconbtn" data-edit="${u.id}">Edit</button><button class="iconbtn" data-pw="${u.id}">Reset password</button>
          ${u.id !== A.user.id ? `<button class="iconbtn" data-tog="${u.id}">${u.isActive ? 'Deactivate' : 'Activate'}</button><button class="iconbtn danger" data-del="${u.id}">Delete</button>` : ''}</td></tr>`).join('')}</table></div>`;
    const edit = (u) => {
      const m = A.modal(`<h3 class="heading-display mb-5 text-2xl">${u ? 'Edit admin' : 'Add admin user'}</h3><form class="space-y-4">
        <div><label class="a-lbl">Name *</label><input class="a-in" name="name" required value="${esc(u ? u.name : '')}"></div>
        <div><label class="a-lbl">Email *</label><input class="a-in" type="email" name="email" required value="${esc(u ? u.email : '')}"></div>
        <div><label class="a-lbl">Role *</label><select class="a-sel" name="role">${d.roles.map((r) => `<option value="${r.key}" ${u && u.role === r.key ? 'selected' : ''}>${r.label}</option>`).join('')}</select>
          <p class="mt-1 text-xs text-stone" id="u-rolehint">${esc(d.roles.find((r) => r.key === (u ? u.role : 'admin')).key === 'admin' ? 'Full access to every section' : 'Access: ' + d.roles.find((r) => r.key === (u ? u.role : 'admin')).sections.join(', '))}</p></div>
        ${u ? '' : `<div><label class="a-lbl">Temporary password *</label><input class="a-in" type="password" name="password" required minlength="8" placeholder="Min. 8 characters"></div>`}
        <div class="flex justify-end gap-3"><button type="button" class="a-btn a-btn-o" data-close>Cancel</button><button class="a-btn">${u ? 'Save' : 'Create admin'}</button></div></form>`);
      m.el.querySelector('[name=role]').addEventListener('change', (e) => {
        const r = d.roles.find((x) => x.key === e.target.value);
        m.el.querySelector('#u-rolehint').textContent = r.key === 'admin' ? 'Full access to every section' : 'Access: ' + r.sections.join(', ');
      });
      m.el.querySelector('form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = Object.fromEntries(new FormData(e.target));
        try {
          await A.api(u ? '/users/' + u.id : '/users', { method: u ? 'PATCH' : 'POST', body });
          m.close(); A.toast(u ? 'Admin updated' : 'Admin created'); A.render();
        } catch (err) { A.formErrors(e.target, err); }
      });
    };
    document.getElementById('u-new').addEventListener('click', () => edit(null));
    app.addEventListener('click', async (e) => {
      const users = d.users;
      const ed = e.target.closest('[data-edit]'), pw = e.target.closest('[data-pw]'), tg = e.target.closest('[data-tog]'), dl = e.target.closest('[data-del]');
      try {
        if (ed) edit(users.find((u) => u.id === ed.dataset.edit));
        if (pw) {
          const np = prompt(`New password for ${users.find((u) => u.id === pw.dataset.pw).name} (min 8 chars, shown once):`);
          if (np === null) return;
          if (np.length < 8) return A.toast('Password must be at least 8 characters', 'err');
          await A.api('/users/' + pw.dataset.pw, { method: 'PATCH', body: { password: np } });
          A.toast('Password reset — their sessions were signed out');
        }
        if (tg) {
          const u = users.find((x) => x.id === tg.dataset.tog);
          await A.api('/users/' + u.id, { method: 'PATCH', body: { isActive: !u.isActive } });
          A.toast(u.isActive ? 'Admin deactivated' : 'Admin activated'); A.render();
        }
        if (dl) {
          const u = users.find((x) => x.id === dl.dataset.del);
          if (!(await A.confirm('Delete admin?', `<b>${esc(u.name)}</b> will lose all admin access and be permanently removed.`, { ok: 'Delete' }))) return;
          await A.api('/users/' + u.id, { method: 'DELETE' }); A.toast('Admin deleted'); A.render();
        }
      } catch (err) { A.fail(err); }
    });
  };

  /* ===================== Settings ===================== */
  A.pages.settings = async (app) => {
    const s = await A.api('/settings');
    const prefLabels = [['order', 'New orders'], ['customer', 'New customers'], ['chat', 'New live-chat messages'], ['stock', 'Low / out of stock'], ['review', 'New reviews']];
    app.innerHTML = A.header('Settings', 'Account & store') + `
      <div class="grid gap-6 xl:grid-cols-2">
        <section class="a-card space-y-4 rounded-xl p-6"><h2 class="heading-display text-xl">Profile</h2>
          <form id="st-profile" class="space-y-4">
            <div class="flex items-center gap-4"><img id="st-av" src="${esc(s.profile.avatar || '')}" class="h-16 w-16 rounded-full border border-graphite bg-graphite object-cover ${s.profile.avatar ? '' : 'hidden'}" alt="">
              <div><input type="hidden" name="avatar" value="${esc(s.profile.avatar || '')}"><label class="a-btn a-btn-o cursor-pointer !py-1.5 !text-xs">Upload photo<input type="file" id="st-avf" accept="image/*" class="hidden"></label></div></div>
            <div><label class="a-lbl">Name</label><input class="a-in" name="name" value="${esc(s.profile.name)}" required></div>
            <div><label class="a-lbl">Email</label><input class="a-in" type="email" name="email" value="${esc(s.profile.email)}" required></div>
            <p class="text-xs text-stone">Signed in as <b class="text-gold">${esc(s.profile.role)}</b></p>
            <button class="a-btn">Save profile</button></form></section>
        <section class="a-card space-y-4 rounded-xl p-6"><h2 class="heading-display text-xl">Security</h2>
          <form id="st-pass" class="space-y-4">
            <div><label class="a-lbl">Current password</label><input class="a-in" type="password" name="current" required autocomplete="current-password"></div>
            <div><label class="a-lbl">New password</label><input class="a-in" type="password" name="password" required minlength="8" autocomplete="new-password"></div>
            <div><label class="a-lbl">Confirm new password</label><input class="a-in" type="password" name="password_confirmation" required minlength="8"></div>
            <p class="text-xs text-stone">Changing your password signs out all other sessions.</p>
            <button class="a-btn">Change password</button></form></section>
        <section class="a-card rounded-xl p-6"><div class="mb-4 flex items-center justify-between"><h2 class="heading-display text-xl">Active sessions</h2>
          <button class="a-btn a-btn-o !py-1.5 !text-xs" id="st-kill">Log out other sessions</button></div>
          <div class="space-y-2">${s.sessions.map((ss) => `<div class="flex items-center justify-between rounded-lg border border-graphite p-3 text-sm">
            <span>Started ${A.datetime(ss.createdAt)} · expires ${A.date(ss.expiresAt)} ${ss.remember ? '· remembered' : ''}</span>
            ${ss.current ? '<span class="chip chip-confirmed">This session</span>' : `<button class="iconbtn danger" data-sid="${ss.id}">Revoke</button>`}</div>`).join('') || A.empty('No active sessions.')}</div></section>
        <section class="a-card space-y-4 rounded-xl p-6"><h2 class="heading-display text-xl">Notifications</h2>
          <form id="st-notify" class="space-y-3">${prefLabels.map(([k, l]) => `<label class="flex items-center justify-between text-sm"><span>${l}</span><input type="checkbox" class="a-chk" name="${k}" ${s.notifications[k] ? 'checked' : ''}></label>`).join('')}
          <button class="a-btn mt-2">Save notification preferences</button></form></section>
        ${s.website ? `<section class="a-card space-y-4 rounded-xl p-6 xl:col-span-2"><h2 class="heading-display text-xl">Website settings</h2>
          <form id="st-web" class="grid gap-4 sm:grid-cols-2">
            <div><label class="a-lbl">Store name</label><input class="a-in" name="storeName" value="${esc(s.website.storeName)}"></div>
            <div><label class="a-lbl">Logo</label><div class="flex items-center gap-3"><img id="sw-logo" src="${esc(s.website.logo || '')}" class="h-10 w-10 rounded border border-graphite object-contain ${s.website.logo ? '' : 'hidden'}" alt=""><input type="hidden" name="logo" value="${esc(s.website.logo || '')}"><label class="a-btn a-btn-o cursor-pointer !py-1.5 !text-xs">Upload<input type="file" id="sw-logof" accept="image/*" class="hidden"></label></div></div>
            <div><label class="a-lbl">Contact email</label><input class="a-in" type="email" name="contactEmail" value="${esc(s.website.contactEmail)}"></div>
            <div><label class="a-lbl">Support phone</label><input class="a-in" name="supportPhone" value="${esc(s.website.supportPhone)}"></div>
            <div><label class="a-lbl">Address</label><input class="a-in" name="address" value="${esc(s.website.address)}"></div>
            <div><label class="a-lbl">Announcement banner</label><input class="a-in" name="announcement" value="${esc(s.website.announcement)}" placeholder="Shown atop the storefront — leave empty to hide"></div>
            <div><label class="a-lbl">Google Analytics measurement ID</label><input class="a-in" name="gaMeasurementId" value="${esc(s.website.gaMeasurementId || '')}" placeholder="G-XXXXXXXXXX"></div>
            <div><label class="a-lbl">Google Search Console verification code</label><input class="a-in" name="searchConsoleCode" value="${esc(s.website.searchConsoleCode || '')}" placeholder="content value of google-site-verification tag"></div>
            ${Object.keys(s.website.socials).map((k) => `<div><label class="a-lbl">${k[0].toUpperCase() + k.slice(1)}</label><input class="a-in" name="socials[${k}]" value="${esc(s.website.socials[k] || '')}" placeholder="https://…"></div>`).join('')}
            <div class="sm:col-span-2"><button class="a-btn">Save website settings</button></div></form></section>` : ''}
      </div>`;
    const bind = (fid, fn) => document.getElementById(fid).addEventListener('submit', async (e) => { e.preventDefault(); try { await fn(new FormData(e.target), e.target); } catch (err) { A.formErrors(e.target, err); } });
    bind('st-profile', async (fd) => { await A.api('/settings/profile', { method: 'PUT', body: { name: fd.get('name'), email: fd.get('email'), avatar: fd.get('avatar') || null } }); A.toast('Profile saved'); });
    bind('st-pass', async (fd) => { await A.api('/settings/password', { method: 'PUT', body: Object.fromEntries(fd) }); A.toast('Password changed — other sessions signed out'); document.getElementById('st-pass').reset(); });
    bind('st-notify', async (fd, f) => { await A.api('/settings/notifications', { method: 'PUT', body: Object.fromEntries(prefLabels.map(([k]) => [k, fd.has(k)])) }); A.toast('Preferences saved'); });
    const web = document.getElementById('st-web');
    if (web) bind('st-web', async (fd) => {
      const body = { storeName: fd.get('storeName'), logo: fd.get('logo') || null, contactEmail: fd.get('contactEmail'), supportPhone: fd.get('supportPhone'), address: fd.get('address'), announcement: fd.get('announcement'), gaMeasurementId: (fd.get('gaMeasurementId') || '').trim() || null, searchConsoleCode: (fd.get('searchConsoleCode') || '').trim() || null, socials: {} };
      Object.keys(s.website.socials).forEach((k) => { body.socials[k] = fd.get('socials[' + k + ']') || null; });
      await A.api('/settings/website', { method: 'PUT', body }); A.toast('Website settings saved');
    });
    document.getElementById('st-avf').addEventListener('change', async (e) => {
      try { const r = await A.upload(e.target.files); app.querySelector('[name=avatar]').value = r.url; const i = document.getElementById('st-av'); i.src = r.url; i.classList.remove('hidden'); } catch (err) { A.fail(err); }
    });
    const lf = document.getElementById('sw-logof');
    if (lf) lf.addEventListener('change', async (e) => {
      try { const r = await A.upload(e.target.files); app.querySelector('[name=logo]').value = r.url; const i = document.getElementById('sw-logo'); i.src = r.url; i.classList.remove('hidden'); } catch (err) { A.fail(err); }
    });
    document.getElementById('st-kill').addEventListener('click', async () => {
      if (!(await A.confirm('Log out other sessions?', 'Every session except this one will be signed out.', { ok: 'Log them out' }))) return;
      const r = await A.api('/settings/sessions/others', { method: 'DELETE' });
      A.toast(r.revoked + ' session(s) revoked'); A.render();
    });
    app.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-sid]');
      if (!b) return;
      try { await A.api('/settings/sessions/' + b.dataset.sid, { method: 'DELETE' }); A.toast('Session revoked'); A.render(); } catch (err) { A.fail(err); }
    });
  };

  /* ===================== Notifications ===================== */
  A.pages.notifications = async (app, _id, params) => {
    let unread = params.unread === '1';
    let page = +(params.page || 1);
    app.innerHTML = A.header('Notifications', 'Activity feed', `<button class="a-btn a-btn-o" id="nf-all">Mark all as read</button>`) + `
      <div class="mb-4 flex gap-2"><button class="pill ${!unread ? 'on' : ''}" data-u="0">All</button><button class="pill ${unread ? 'on' : ''}" data-u="1">Unread</button></div>
      <div id="nf-list">${A.skeleton()}</div>`;
    const load = async () => {
      A.setQuery({ unread: unread ? 1 : null, page });
      const r = await A.api('/notifications' + A.qs({ unread: unread ? 1 : null, page }));
      document.getElementById('nf-list').innerHTML = r.data.length ? `<div class="a-card divide-y divide-graphite rounded-xl">${r.data.map((n) => `
        <a href="${esc(n.link || '#')}" data-id="${n.id}" class="flex items-center gap-4 p-4 transition hover:bg-graphite ${n.read ? 'opacity-60' : ''}">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-graphite text-gold">${A.icon(A.notifIcon[n.type] || 'notifications', 18)}</span>
          <span class="min-w-0 flex-1"><span class="flex items-center gap-2"><b class="truncate text-sm">${esc(n.title)}</b>${!n.read ? '<span class="h-2 w-2 shrink-0 rounded-full bg-gold"></span>' : ''}</span>
          <span class="block truncate text-xs text-stone">${esc(n.body || '')}</span></span>
          <span class="shrink-0 text-[10px] text-stone">${A.ago(n.createdAt)}</span></a>`).join('')}</div>${A.pager(r, (p) => { page = p; load(); })}` : A.empty(unread ? 'No unread notifications.' : 'Nothing yet — new orders, chats and alerts appear here.');
    };
    document.getElementById('nf-list').addEventListener('click', (e) => {
      const a = e.target.closest('[data-id]');
      if (a) A.api('/notifications/' + a.dataset.id + '/read', { method: 'POST' }).then(() => A.refreshBadges());
    });
    document.getElementById('nf-all').addEventListener('click', async () => { await A.api('/notifications/read-all', { method: 'POST' }); A.toast('All notifications marked as read'); A.refreshBadges(); load(); });
    app.querySelectorAll('[data-u]').forEach((b) => b.addEventListener('click', () => { unread = b.dataset.u === '1'; page = 1; app.querySelectorAll('[data-u]').forEach((x) => x.classList.toggle('on', x === b)); load(); }));
    await load();
  };
})();
