/* Novette Admin — Dashboard, Products, Categories, Brands, Orders */
(() => {
  const { esc, money, chip } = A;
  const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  /* ===================== Dashboard ===================== */
  A.pages.dashboard = async (app) => {
    const d = await A.api('/dashboard');
    const c = d.cards;
    const card = (k, label, icon, href) => c[k] === undefined ? '' : `<a href="${href}" class="stat-card block transition hover:border-gold">${A.icon(icon, 22)}<p class="eyebrow">${label}</p><p class="num">${c[k]}</p></a>`;
    const hour = new Date().getHours();
    app.innerHTML = A.header(`Good ${hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'}, ${A.user.name.split(' ')[0]}`, 'Overview') + `
      <div class="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        ${card('totalWatches', 'Total Watches', 'products', '/admin/products')}
        ${card('totalCustomers', 'Total Customers', 'customers', '/admin/customers')}
        ${card('newOrders', 'New Orders (7d)', 'orders', '/admin/orders')}
        ${card('pendingOrders', 'Pending Orders', 'orders', '/admin/orders?status=pending')}
        ${card('deliveredOrders', 'Delivered Orders', 'orders', '/admin/orders?status=delivered')}
        ${card('lowStock', 'Low Stock Products', 'inventory', '/admin/inventory?status=low')}
        ${card('outOfStock', 'Out of Stock', 'inventory', '/admin/inventory?status=out')}
        ${card('unreadChats', 'Unread Live Chats', 'chat', (A.liveChatUrl || '/admin/chat'))}
      </div>
      <div class="mt-8 grid gap-6 xl:grid-cols-3">
        ${d.recentOrders ? `<section class="a-card rounded-xl p-5 xl:col-span-2"><div class="mb-4 flex items-center justify-between"><h2 class="heading-display text-xl">Recent Orders</h2><a href="/admin/orders" class="text-xs text-gold hover:underline">View all</a></div>
          ${d.recentOrders.length ? `<div class="overflow-x-auto"><table class="a-table"><tr><th>Order</th><th>Customer</th><th>Product</th><th>Qty</th><th>Total</th><th>Date</th><th>Status</th><th></th></tr>
          ${d.recentOrders.map((o) => `<tr class="a-row"><td class="font-medium">${esc(o.number)}</td><td>${esc(o.customer)}</td><td class="max-w-[220px] truncate">${esc(o.product)}</td><td>${o.qty}</td><td>${money(o.total)}</td><td class="whitespace-nowrap text-xs text-stone">${A.date(o.createdAt)}</td><td>${chip(o.status)}</td><td><a href="/admin/orders/${o.id}" class="a-btn a-btn-o !px-3 !py-1">View</a></td></tr>`).join('')}</table></div>` : A.empty('No orders yet.')}</section>` : ''}
        ${d.recentChats ? `<section class="a-card rounded-xl p-5"><div class="mb-4 flex items-center justify-between"><h2 class="heading-display text-xl">Recent Live Chats</h2><a href="${A.liveChatUrl || '/admin/chat'}" target="_blank" rel="noopener" class="text-xs text-gold hover:underline">Open Smartsupp</a></div>
          ${d.recentChats.length ? `<div class="space-y-1">${d.recentChats.map((ch) => `<a href="/admin/chat/${ch.userId}" class="flex items-center gap-3 rounded-lg p-2.5 transition hover:bg-graphite">
            <span class="relative">${A.avatar(ch.name, ch.avatar)}<span class="dot ${ch.online ? 'dot-on' : 'dot-off'} absolute bottom-0 right-0 ring-2 ring-ink"></span></span>
            <span class="min-w-0 flex-1"><span class="flex justify-between text-sm"><b class="truncate font-medium">${esc(ch.name)}</b><span class="shrink-0 text-[10px] text-stone">${A.ago(ch.lastAt)}</span></span>
            <span class="flex items-center justify-between gap-2"><span class="truncate text-xs text-stone">${esc(ch.lastMessage)}</span>${ch.unread ? `<span class="navbadge !ml-0">${ch.unread}</span>` : ''}</span></span></a>`).join('')}</div>` : A.empty('No conversations yet.')}</section>` : ''}
        ${d.inventoryAlerts ? `<section class="a-card rounded-xl p-5 ${d.recentOrders ? 'xl:col-span-3' : ''}"><div class="mb-4 flex items-center justify-between"><h2 class="heading-display text-xl">Inventory Alerts</h2><a href="/admin/inventory" class="text-xs text-gold hover:underline">Manage inventory</a></div>
          ${d.inventoryAlerts.length ? `<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">${d.inventoryAlerts.map((w) => `<a href="/admin/inventory?q=${encodeURIComponent(w.model)}" class="flex items-center gap-3 rounded-lg border border-graphite p-3 transition hover:border-gold">
            <img src="${esc(w.image || '')}" class="h-12 w-12 rounded bg-sand object-cover" alt=""><span class="min-w-0 flex-1"><span class="block truncate text-sm">${esc(w.model)}</span><span class="text-xs text-stone">${w.inventory} left · ${esc(w.sku || '')}</span></span>${chip(w.status, A.stockLabel[w.status])}</a>`).join('')}</div>` : A.empty('All watches are well stocked.')}</section>` : ''}
      </div>`;
  };

  /* ===================== Products ===================== */
  let brandsCache = null, catsCache = null;
  const loadRefs = async () => {
    if (!brandsCache) brandsCache = await A.api('/brands');
    if (!catsCache) catsCache = await A.api('/categories').catch(() => []);
  };
  A.resetRefs = () => { brandsCache = null; catsCache = null; };

  A.pages.products = async (app, id, params) => {
    await loadRefs();
    if (id === 'new') return productForm(app, null);
    if (id && params.edit !== undefined) return productForm(app, await A.api('/products/' + id));
    if (id) return productView(app, await A.api('/products/' + id));
    const st = Object.assign({ q: '', brand: '', category: '', status: '', stock: '', sort: 'newest', page: 1 }, params);
    app.innerHTML = A.header('Products', 'Catalogue', `<a href="/admin/products/new" class="a-btn">+ Add Watch</a>`) + `
      <div class="a-card mb-5 grid gap-3 rounded-xl p-4 sm:grid-cols-2 lg:grid-cols-6">
        <input class="a-in lg:col-span-2" id="p-q" placeholder="Search name, SKU, reference…" value="${esc(st.q)}">
        <select class="a-sel" id="p-brand"><option value="">All brands</option>${brandsCache.map((b) => `<option value="${b.slug}" ${st.brand === b.slug ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}</select>
        <select class="a-sel" id="p-category"><option value="">All categories</option>${catsCache.map((c) => `<option value="${c.slug}" ${st.category === c.slug ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>
        <select class="a-sel" id="p-status"><option value="">Any status</option><option value="active" ${st.status === 'active' ? 'selected' : ''}>Active</option><option value="inactive" ${st.status === 'inactive' ? 'selected' : ''}>Inactive</option></select>
        <select class="a-sel" id="p-sort">${[['newest', 'Newest'], ['oldest', 'Oldest'], ['name', 'Name A–Z'], ['price-asc', 'Price ↑'], ['price-desc', 'Price ↓'], ['stock', 'Stock ↑']].map(([v, l]) => `<option value="${v}" ${st.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
      </div><div id="p-list">${A.skeleton()}</div>`;
    const load = async () => {
      A.setQuery(st);
      const list = document.getElementById('p-list');
      const r = await A.api('/products' + A.qs(st));
      list.innerHTML = r.data.length ? `<div class="a-card overflow-x-auto rounded-xl"><table class="a-table"><tr><th>Watch</th><th>Brand</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Added</th><th class="text-right">Actions</th></tr>
        ${r.data.map((w) => `<tr class="a-row"><td><div class="flex items-center gap-3"><img src="${esc(w.image || '')}" class="h-12 w-12 shrink-0 rounded bg-sand object-cover" alt=""><div class="min-w-0"><p class="truncate font-medium">${esc(w.model)}</p><p class="text-xs text-stone">${esc(w.sku || w.reference)}</p>
          <p class="mt-0.5 flex gap-1">${w.isFeatured ? '<span class="chip chip-confirmed !py-0">Featured</span>' : ''}${w.isNew ? '<span class="chip chip-processing !py-0">New</span>' : ''}${w.isBestSeller ? '<span class="chip chip-pending !py-0">Best seller</span>' : ''}</p></div></div></td>
          <td>${esc(w.brandName)}</td><td class="text-xs">${esc(w.categoryName || '—')}</td>
          <td class="whitespace-nowrap">${w.onSale ? `<span class="text-gold">${money(w.salePrice)}</span> <s class="text-xs text-stone">${money(w.price)}</s>` : money(w.price)}</td>
          <td>${w.inventory} ${chip(w.stockStatus, A.stockLabel[w.stockStatus])}</td><td>${chip(w.active ? 'active' : 'inactive', w.active ? 'Active' : 'Inactive')}</td>
          <td class="whitespace-nowrap text-xs text-stone">${A.date(w.addedAt)}</td>
          <td class="whitespace-nowrap text-right"><a class="iconbtn" href="/admin/products/${w.id}">View</a><a class="iconbtn" href="/admin/products/${w.id}?edit">Edit</a><button class="iconbtn danger" data-del="${w.id}" data-name="${esc(w.model)}">Delete</button></td></tr>`).join('')}
        </table></div>${A.pager(r, (p) => { st.page = p; load(); })}` : A.empty('No watches match these filters.', '<a href="/admin/products/new" class="a-btn">+ Add Watch</a>');
    };
    const bind = (id, key, ev = 'change') => document.getElementById(id).addEventListener(ev, A.debounce((e) => { st[key] = e.target.value; st.page = 1; load().catch(A.fail); }, ev === 'input' ? 350 : 0));
    bind('p-q', 'q', 'input'); bind('p-brand', 'brand'); bind('p-category', 'category'); bind('p-status', 'status'); bind('p-sort', 'sort');
    document.getElementById('p-list').addEventListener('click', async (e) => {
      const b = e.target.closest('[data-del]'); if (!b) return;
      if (!(await A.confirm('Delete watch?', `<b>${b.dataset.name}</b> will be permanently deleted along with its reviews, cart and wishlist entries. This cannot be undone.`, { ok: 'Delete permanently' }))) return;
      try { await A.api('/products/' + b.dataset.del, { method: 'DELETE' }); A.toast('Watch deleted'); load(); } catch (err) { A.fail(err); }
    });
    await load();
  };

  async function productView(app, w) {
    app.innerHTML = A.header(w.model, w.brandName, `<a href="/admin/products" class="a-btn a-btn-o">← All products</a><a href="/watches/${w.slug}" target="_blank" class="a-btn a-btn-o">View on site ↗</a><a href="/admin/products/${w.id}?edit" class="a-btn">Edit</a>`) + `
      <div class="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div class="a-card rounded-xl p-4"><img src="${esc(w.image || '')}" class="aspect-square w-full rounded-lg bg-sand object-cover" alt="">
          <div class="mt-3 grid grid-cols-5 gap-2">${(w.images || []).slice(0, 10).map((i) => `<img src="${esc(i)}" class="aspect-square w-full rounded bg-sand object-cover" alt="">`).join('')}</div></div>
        <div class="space-y-5">
          <div class="a-card rounded-xl p-5"><p class="heading-display text-3xl">${w.onSale ? `<span class="text-gold">${money(w.salePrice)}</span> <s class="text-lg text-stone">${money(w.price)}</s>` : money(w.price)}</p>
            <div class="mt-3 flex flex-wrap gap-2">${chip(w.active ? 'active' : 'inactive', w.active ? 'Active' : 'Inactive')}${chip(w.stockStatus, A.stockLabel[w.stockStatus] + ' · ' + w.inventory)}${w.isFeatured ? chip('confirmed', 'Featured') : ''}${w.isNew ? chip('processing', 'New arrival') : ''}${w.isBestSeller ? chip('pending', 'Best seller') : ''}</div>
            <dl class="mt-5 grid grid-cols-2 gap-4 text-sm">${[['SKU', w.sku], ['Reference', w.reference], ['Category', w.categoryName], ['Gender', w.gender], ['Year', w.year], ['Condition', w.condition], ['Material', w.material], ['Type', w.type], ['Units ordered', w.orders], ['Avg rating', w.rating ? w.rating + ' ★' : '—'], ['Added', A.date(w.addedAt)], ['Updated', A.date(w.updatedAt)]]
              .map(([k, v]) => `<div><dt class="a-lbl">${k}</dt><dd>${esc(v ?? '—')}</dd></div>`).join('')}</dl></div>
          <div class="a-card rounded-xl p-5"><p class="a-lbl">Description</p><p class="text-sm leading-relaxed text-ivory/80">${esc(w.description)}</p></div>
          ${w.specs && Object.keys(w.specs).length ? `<div class="a-card rounded-xl p-5"><p class="a-lbl">Specifications</p><dl class="grid grid-cols-2 gap-3 text-sm">${Object.entries(w.specs).map(([k, v]) => `<div><dt class="text-xs text-stone">${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>` : ''}
        </div></div>`;
  }

  async function productForm(app, w) {
    const v = (k, d = '') => esc(w ? (w[k] ?? d) : d);
    let images = w ? [...(w.images || [])] : [];
    let specs = w && w.specs ? Object.entries(w.specs) : [['caseSize', ''], ['movement', ''], ['waterResistance', '']];
    app.innerHTML = A.header(w ? 'Edit Watch' : 'Add Watch', w ? w.model : 'New product', `<a href="${w ? '/admin/products/' + w.id : '/admin/products'}" class="a-btn a-btn-o">Cancel</a>`) + `
      <form id="pf" class="grid gap-6 xl:grid-cols-[1fr_360px]" novalidate>
        <div class="space-y-6">
          <section class="a-card space-y-4 rounded-xl p-6"><h2 class="heading-display text-xl">Details</h2>
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="sm:col-span-2"><label class="a-lbl">Watch name *</label><input class="a-in" name="model" required value="${v('model')}" placeholder="e.g. Cosmograph Daytona"></div>
              <div><label class="a-lbl">Brand *</label><select class="a-sel" name="brandSlug" required><option value="">Select brand</option>${brandsCache.map((b) => `<option value="${b.slug}" ${w && w.brandSlug === b.slug ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}</select></div>
              <div><label class="a-lbl">Category</label><select class="a-sel" name="categorySlug"><option value="">Uncategorised</option>${catsCache.map((c) => `<option value="${c.slug}" ${w && w.categorySlug === c.slug ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
              <div><label class="a-lbl">SKU / product code *</label><input class="a-in" name="sku" required value="${v('sku')}" placeholder="NV-ROL-116500LN"></div>
              <div><label class="a-lbl">Reference</label><input class="a-in" name="reference" value="${v('reference')}"></div>
              <div><label class="a-lbl">Gender</label><select class="a-sel" name="gender">${['Men', 'Women', 'Unisex'].map((g) => `<option ${w && w.gender === g ? 'selected' : ''}>${g}</option>`).join('')}</select></div>
              <div><label class="a-lbl">Nickname</label><input class="a-in" name="nickname" value="${v('nickname')}" placeholder="e.g. Panda"></div>
              <div><label class="a-lbl">Year</label><input class="a-in" name="year" type="number" value="${v('year', new Date().getFullYear())}"></div>
              <div><label class="a-lbl">Condition</label><select class="a-sel" name="condition">${['New', 'Unworn', 'Pre-owned'].map((g) => `<option ${w && w.condition === g ? 'selected' : ''}>${g}</option>`).join('')}</select></div>
              <div><label class="a-lbl">Type</label><input class="a-in" name="type" value="${v('type')}" placeholder="Sport, Dress, Diver…"></div>
              <div><label class="a-lbl">Material</label><input class="a-in" name="material" value="${v('material')}" placeholder="Steel, Yellow Gold…"></div>
              <div class="sm:col-span-2"><label class="a-lbl">Description *</label><textarea class="a-ta" name="description" required rows="5">${v('description')}</textarea></div>
            </div></section>
          <section class="a-card rounded-xl p-6"><div class="mb-4 flex items-center justify-between"><h2 class="heading-display text-xl">Images</h2><label class="a-btn a-btn-o cursor-pointer">Upload images<input type="file" id="pf-files" accept="image/*" multiple class="hidden"></label></div>
            <div id="pf-imgs" class="grid grid-cols-3 gap-3 sm:grid-cols-5" data-field="images"></div><p class="mt-3 text-xs text-stone">First image is the main photo. Drag order by using ← →. JPEG/PNG/WebP up to 8 MB.</p></section>
          <section class="a-card rounded-xl p-6"><div class="mb-4 flex items-center justify-between"><h2 class="heading-display text-xl">Specifications</h2><button type="button" id="pf-addspec" class="a-btn a-btn-o">+ Add row</button></div><div id="pf-specs" class="space-y-2"></div></section>
        </div>
        <div class="space-y-6">
          <section class="a-card space-y-4 rounded-xl p-6"><h2 class="heading-display text-xl">Pricing & stock</h2>
            <div><label class="a-lbl">Price (USD) *</label><input class="a-in" name="price" type="number" min="1" required value="${v('price')}"></div>
            <div><label class="a-lbl">Discount price</label><input class="a-in" name="salePrice" type="number" min="1" value="${v('salePrice')}" placeholder="Optional — must be below price"></div>
            <div class="grid grid-cols-2 gap-3"><div><label class="a-lbl">Stock quantity *</label><input class="a-in" name="inventory" type="number" min="0" required value="${v('inventory', 1)}"></div>
            <div><label class="a-lbl">Low-stock alert at</label><input class="a-in" name="lowStockAt" type="number" min="0" value="${v('lowStockAt', 2)}"></div></div></section>
          <section class="a-card space-y-3 rounded-xl p-6"><h2 class="heading-display text-xl">Visibility</h2>
            ${[['active', 'Active (visible on store)', w ? w.active : true], ['isFeatured', 'Featured product', w && w.isFeatured], ['isNew', 'New arrival', w ? w.isNew : true], ['isBestSeller', 'Best seller', w && w.isBestSeller], ['boxPapers', 'Box & papers included', w ? w.boxPapers : true]]
              .map(([k, l, on]) => `<label class="flex items-center justify-between gap-3 text-sm"><span>${l}</span><input type="checkbox" class="a-chk" name="${k}" ${on ? 'checked' : ''}></label>`).join('')}</section>
          <button class="a-btn w-full !py-3" id="pf-save">${w ? 'Save changes' : 'Create watch'}</button>
        </div></form>`;
    const imgsEl = document.getElementById('pf-imgs'), specsEl = document.getElementById('pf-specs');
    const drawImgs = () => {
      imgsEl.innerHTML = images.length ? images.map((src, i) => `<div class="group relative"><img src="${esc(src)}" class="aspect-square w-full rounded-lg bg-sand object-cover ${i === 0 ? 'ring-2 ring-gold' : ''}" alt="">
        <div class="absolute inset-x-1 bottom-1 flex justify-between opacity-0 transition group-hover:opacity-100"><button type="button" class="rounded bg-ink/80 px-2 text-xs" data-mv="${i}" data-d="-1">←</button><button type="button" class="rounded bg-red-500/80 px-2 text-xs" data-rm="${i}">✕</button><button type="button" class="rounded bg-ink/80 px-2 text-xs" data-mv="${i}" data-d="1">→</button></div></div>`).join('')
        : '<p class="col-span-full text-sm text-stone">No images yet — upload at least one.</p>';
    };
    const drawSpecs = () => {
      specsEl.innerHTML = specs.map(([k, val], i) => `<div class="flex gap-2"><input class="a-in" placeholder="Name (e.g. caseSize)" value="${esc(k)}" data-sk="${i}"><input class="a-in" placeholder="Value (e.g. 40mm)" value="${esc(val)}" data-sv="${i}"><button type="button" class="iconbtn danger" data-srm="${i}">✕</button></div>`).join('');
    };
    drawImgs(); drawSpecs();
    imgsEl.addEventListener('click', (e) => {
      const rm = e.target.closest('[data-rm]'), mv = e.target.closest('[data-mv]');
      if (rm) images.splice(+rm.dataset.rm, 1);
      if (mv) { const i = +mv.dataset.mv, j = i + +mv.dataset.d; if (j >= 0 && j < images.length) [images[i], images[j]] = [images[j], images[i]]; }
      drawImgs();
    });
    document.getElementById('pf-files').addEventListener('change', async (e) => {
      if (!e.target.files.length) return;
      A.toast('Uploading…', 'info', 1500);
      try { const r = await A.upload(e.target.files); images.push(...r.urls); drawImgs(); A.toast(`${r.urls.length} image(s) uploaded`); } catch (err) { A.fail(err); }
      e.target.value = '';
    });
    specsEl.addEventListener('input', (e) => { if (e.target.dataset.sk) specs[e.target.dataset.sk][0] = e.target.value; if (e.target.dataset.sv) specs[e.target.dataset.sv][1] = e.target.value; });
    specsEl.addEventListener('click', (e) => { const b = e.target.closest('[data-srm]'); if (b) { specs.splice(+b.dataset.srm, 1); drawSpecs(); } });
    document.getElementById('pf-addspec').addEventListener('click', () => { specs.push(['', '']); drawSpecs(); });

    document.getElementById('pf').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = e.target, fd = new FormData(f), btn = document.getElementById('pf-save');
      const body = {};
      ['model', 'brandSlug', 'categorySlug', 'sku', 'reference', 'gender', 'nickname', 'condition', 'type', 'material', 'description'].forEach((k) => { body[k] = (fd.get(k) || '').trim() || null; });
      ['price', 'salePrice', 'inventory', 'lowStockAt', 'year'].forEach((k) => { const x = fd.get(k); body[k] = x === '' || x === null ? null : parseInt(x, 10); });
      ['active', 'isFeatured', 'isNew', 'isBestSeller', 'boxPapers'].forEach((k) => { body[k] = fd.has(k); });
      body.images = images;
      body.specs = Object.fromEntries(specs.filter(([k, val]) => k.trim() && String(val).trim()));
      const missing = [];
      if (!body.model) missing.push('model'); if (!body.brandSlug) missing.push('brandSlug'); if (!body.sku) missing.push('sku');
      if (!body.price) missing.push('price'); if (body.inventory === null || body.inventory < 0) missing.push('inventory');
      if (!body.description || body.description.length < 10) missing.push('description');
      if (missing.length) return A.formErrors(f, { errors: Object.fromEntries(missing.map((k) => [k, [k === 'description' ? 'Description must be at least 10 characters' : k === 'inventory' ? 'Stock cannot be negative' : 'This field is required']])) });
      if (!images.length) return A.toast('Upload at least one product image', 'err');
      A.busy(btn, true);
      try {
        const saved = await A.api(w ? '/products/' + w.id : '/products', { method: w ? 'PUT' : 'POST', body });
        A.toast(w ? 'Watch updated' : 'Watch created');
        A.go('/admin/products/' + saved.id);
      } catch (err) { A.formErrors(f, err); A.busy(btn, false); }
    });
  }

  /* ===================== Categories ===================== */
  A.pages.categories = async (app) => {
    const cats = await A.api('/categories');
    app.innerHTML = A.header('Categories', 'Catalogue', `<button class="a-btn" id="c-new">+ New Category</button>`) +
      (cats.length ? `<div class="a-card overflow-x-auto rounded-xl"><table class="a-table"><tr><th>Name</th><th>Slug</th><th>Description</th><th>Products</th><th class="text-right">Actions</th></tr>
      ${cats.map((c) => `<tr class="a-row"><td class="font-medium">${esc(c.name)}</td><td class="text-xs text-stone">${esc(c.slug)}</td><td class="max-w-sm text-xs text-ivory/70">${esc(c.description || '—')}</td>
        <td><a href="/admin/products?category=${c.slug}" class="text-gold hover:underline">${c.products}</a></td>
        <td class="whitespace-nowrap text-right"><button class="iconbtn" data-edit="${c.id}">Edit</button><button class="iconbtn danger" data-del="${c.id}">Delete</button></td></tr>`).join('')}</table></div>` : A.empty('No categories yet.'));
    const edit = (c) => {
      const m = A.modal(`<h3 class="heading-display mb-5 text-2xl">${c ? 'Edit' : 'New'} Category</h3><form class="space-y-4"><div><label class="a-lbl">Name *</label><input class="a-in" name="name" value="${esc(c ? c.name : '')}" required></div>
        <div><label class="a-lbl">Description</label><textarea class="a-ta" name="description">${esc(c ? c.description || '' : '')}</textarea></div>
        <div class="flex justify-end gap-3"><button type="button" class="a-btn a-btn-o" data-close>Cancel</button><button class="a-btn">Save</button></div></form>`);
      m.el.querySelector('form').addEventListener('submit', async (e) => {
        e.preventDefault(); const body = Object.fromEntries(new FormData(e.target));
        try { await A.api(c ? '/categories/' + c.id : '/categories', { method: c ? 'PATCH' : 'POST', body }); m.close(); A.resetRefs(); A.toast('Category saved'); A.render(); } catch (err) { A.formErrors(e.target, err); }
      });
    };
    document.getElementById('c-new').addEventListener('click', () => edit(null));
    app.addEventListener('click', async (e) => {
      const ed = e.target.closest('[data-edit]'), del = e.target.closest('[data-del]');
      if (ed) edit(cats.find((c) => c.id === ed.dataset.edit));
      if (del) {
        const c = cats.find((x) => x.id === del.dataset.del);
        if (!(await A.confirm('Delete category?', `<b>${esc(c.name)}</b> will be removed. ${c.products} product(s) will become uncategorised.`, { ok: 'Delete' }))) return;
        try { await A.api('/categories/' + c.id, { method: 'DELETE' }); A.resetRefs(); A.toast('Category deleted'); A.render(); } catch (err) { A.fail(err); }
      }
    });
  };

  /* ===================== Brands ===================== */
  A.pages.brands = async (app, id) => {
    if (id) {
      const b = await A.api('/brands/' + id);
      app.innerHTML = A.header(b.name, `${b.country || ''} · Est. ${b.founded || '—'}`, `<a href="/admin/brands" class="a-btn a-btn-o">← All brands</a><a href="/admin/products/new" class="a-btn">+ Add Watch</a>`) +
        `<p class="mb-6 max-w-3xl text-sm text-ivory/70">${esc(b.intro || b.tagline || '')}</p>` +
        (b.items.length ? `<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">${b.items.map((w) => `<a href="/admin/products/${w.id}" class="a-card group block overflow-hidden rounded-xl transition hover:border-gold"><img src="${esc(w.image || '')}" class="aspect-square w-full bg-sand object-cover" alt=""><div class="p-3"><p class="truncate text-sm">${esc(w.model)}</p><p class="text-xs text-stone">${money(w.price)} · ${w.inventory} in stock</p></div></a>`).join('')}</div>` : A.empty('No watches for this brand yet.'));
      return;
    }
    const brands = await A.api('/brands');
    app.innerHTML = A.header('Brands', 'Catalogue', `<button class="a-btn" id="b-new">+ Add Brand</button>`) + `<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      ${brands.map((b) => `<div class="a-card flex gap-4 rounded-xl p-5"><div class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-graphite bg-ink">${b.logo ? `<img src="${esc(b.logo)}" class="h-full w-full object-contain" alt="">` : `<span class="heading-display text-2xl text-gold">${esc(b.name[0])}</span>`}</div>
        <div class="min-w-0 flex-1"><p class="heading-display truncate text-xl">${esc(b.name)}</p><p class="text-xs text-stone">${esc(b.country || '')}${b.founded ? ' · Est. ' + esc(b.founded) : ''}</p>
        <p class="mt-1 line-clamp-2 text-xs text-ivory/60">${esc(b.tagline || '')}</p>
        <div class="mt-3 flex flex-wrap gap-1"><a href="/admin/brands/${b.id}" class="iconbtn !text-gold">${b.watches} watches →</a><button class="iconbtn" data-edit="${b.id}">Edit</button><button class="iconbtn danger" data-del="${b.id}">Delete</button></div></div></div>`).join('')}</div>`;
    const edit = (b) => {
      const m = A.modal(`<h3 class="heading-display mb-5 text-2xl">${b ? 'Edit' : 'Add'} Brand</h3><form class="grid gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2"><label class="a-lbl">Name *</label><input class="a-in" name="name" value="${esc(b ? b.name : '')}"></div>
        <div><label class="a-lbl">Country</label><input class="a-in" name="country" value="${esc(b ? b.country || '' : '')}"></div>
        <div><label class="a-lbl">Founded</label><input class="a-in" name="founded" value="${esc(b ? b.founded || '' : '')}"></div>
        <div class="sm:col-span-2"><label class="a-lbl">Tagline</label><input class="a-in" name="tagline" value="${esc(b ? b.tagline || '' : '')}"></div>
        <div class="sm:col-span-2"><label class="a-lbl">Introduction</label><textarea class="a-ta" name="intro">${esc(b ? b.intro || '' : '')}</textarea></div>
        <div class="sm:col-span-2"><label class="a-lbl">Logo</label><div class="flex items-center gap-3"><img id="bl-prev" src="${esc(b && b.logo ? b.logo : '')}" class="h-12 w-12 rounded border border-graphite bg-ink object-contain ${b && b.logo ? '' : 'hidden'}" alt=""><input type="hidden" name="logo" value="${esc(b ? b.logo || '' : '')}"><label class="a-btn a-btn-o cursor-pointer">Upload logo<input type="file" accept="image/*" class="hidden" id="bl-file"></label></div></div>
        <div class="flex justify-end gap-3 sm:col-span-2"><button type="button" class="a-btn a-btn-o" data-close>Cancel</button><button class="a-btn">Save</button></div></form>`, { size: 'lg' });
      m.el.querySelector('#bl-file').addEventListener('change', async (e) => {
        try { const r = await A.upload(e.target.files); m.el.querySelector('[name=logo]').value = r.url; const p = m.el.querySelector('#bl-prev'); p.src = r.url; p.classList.remove('hidden'); } catch (err) { A.fail(err); }
      });
      m.el.querySelector('form').addEventListener('submit', async (e) => {
        e.preventDefault(); const body = Object.fromEntries(new FormData(e.target));
        Object.keys(body).forEach((k) => { if (body[k] === '') body[k] = null; });
        try { await A.api(b ? '/brands/' + b.id : '/brands', { method: b ? 'PATCH' : 'POST', body }); m.close(); A.resetRefs(); A.toast('Brand saved'); A.render(); } catch (err) { A.formErrors(e.target, err); }
      });
    };
    document.getElementById('b-new').addEventListener('click', () => edit(null));
    app.addEventListener('click', async (e) => {
      const ed = e.target.closest('[data-edit]'), del = e.target.closest('[data-del]');
      if (ed) edit(brands.find((b) => b.id === ed.dataset.edit));
      if (del) {
        const b = brands.find((x) => x.id === del.dataset.del);
        if (!(await A.confirm('Delete brand?', `<b>${esc(b.name)}</b> will be permanently removed.`, { ok: 'Delete' }))) return;
        try { await A.api('/brands/' + b.id, { method: 'DELETE' }); A.resetRefs(); A.toast('Brand deleted'); A.render(); } catch (err) { A.fail(err); }
      }
    });
  };

  /* ===================== Orders ===================== */
  A.pages.orders = async (app, id, params) => {
    if (id) return orderDetail(app, id);
    const st = Object.assign({ q: '', status: '', from: '', to: '', sort: 'newest', page: 1 }, params);
    app.innerHTML = A.header('Orders', 'Order management') + `
      <div id="o-tabs" class="mb-4 flex flex-wrap gap-2"></div>
      <div class="a-card mb-5 grid gap-3 rounded-xl p-4 sm:grid-cols-2 lg:grid-cols-5">
        <input class="a-in lg:col-span-2" id="o-q" placeholder="Search order #, name, email, phone…" value="${esc(st.q)}">
        <input class="a-in" type="date" id="o-from" value="${esc(st.from)}" title="From"><input class="a-in" type="date" id="o-to" value="${esc(st.to)}" title="To">
        <select class="a-sel" id="o-sort"><option value="newest">Newest first</option><option value="oldest" ${st.sort === 'oldest' ? 'selected' : ''}>Oldest first</option><option value="total" ${st.sort === 'total' ? 'selected' : ''}>Highest total</option></select>
      </div><div id="o-list">${A.skeleton()}</div>`;
    const load = async () => {
      A.setQuery(st);
      const r = await A.api('/orders' + A.qs(st));
      const total = Object.values(r.counts).reduce((s, n) => s + n, 0);
      document.getElementById('o-tabs').innerHTML = [['', 'All', total], ...STATUSES.map((s) => [s, s[0].toUpperCase() + s.slice(1), r.counts[s] || 0])]
        .map(([k, l, n]) => `<button class="pill ${st.status === k ? 'on' : ''}" data-st="${k}">${l} <span class="opacity-70">${n}</span></button>`).join('');
      document.getElementById('o-list').innerHTML = r.data.length ? `<div class="a-card overflow-x-auto rounded-xl"><table class="a-table"><tr><th>Order</th><th>Customer</th><th>Products</th><th>Qty</th><th>Total</th><th>Delivery address</th><th>Date</th><th>Status</th><th></th></tr>
        ${r.data.map((o) => `<tr class="a-row"><td class="whitespace-nowrap font-medium">${esc(o.number)}</td><td><p>${esc(o.customerName)}</p><p class="text-xs text-stone">${esc(o.phone || o.email)}</p></td>
          <td class="max-w-[200px]"><p class="truncate text-xs">${o.items.map((i) => esc(i.model)).join(', ')}</p></td><td>${o.items.reduce((s, i) => s + i.qty, 0)}</td><td class="whitespace-nowrap">${money(o.total)}</td>
          <td class="max-w-[180px] text-xs text-stone"><p class="truncate">${esc([o.address.address, o.address.city, o.address.zip].filter(Boolean).join(', '))}</p></td>
          <td class="whitespace-nowrap text-xs text-stone">${A.date(o.createdAt)}</td>
          <td><select class="a-sel !w-[130px] !py-1 text-xs" data-status="${o.id}" ${o.status === 'cancelled' ? 'disabled' : ''}>${STATUSES.map((s) => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s[0].toUpperCase() + s.slice(1)}</option>`).join('')}</select></td>
          <td><a href="/admin/orders/${o.id}" class="a-btn a-btn-o !px-3 !py-1">View</a></td></tr>`).join('')}</table></div>${A.pager(r, (p) => { st.page = p; load(); })}` : A.empty('No orders match these filters.');
    };
    document.getElementById('o-tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-st]'); if (b) { st.status = b.dataset.st; st.page = 1; load(); } });
    document.getElementById('o-q').addEventListener('input', A.debounce((e) => { st.q = e.target.value; st.page = 1; load(); }, 350));
    ['from', 'to', 'sort'].forEach((k) => document.getElementById('o-' + k).addEventListener('change', (e) => { st[k] = e.target.value; st.page = 1; load(); }));
    document.getElementById('o-list').addEventListener('change', async (e) => {
      const s = e.target.closest('[data-status]'); if (!s) return;
      if (s.value === 'cancelled' && !(await A.confirm('Cancel order?', 'Stock for these items will be returned to inventory and the customer emailed. Cancelled orders cannot be reopened.', { ok: 'Cancel order' }))) return load();
      try { await A.api('/orders/' + s.dataset.status, { method: 'PATCH', body: { status: s.value } }); A.toast('Status updated — customer notified'); A.refreshBadges(); load(); } catch (err) { A.fail(err); load(); }
    });
    await load();
  };

  async function orderDetail(app, id) {
    const o = await A.api('/orders/' + id);
    const a = o.address || {};
    const next = { pending: ['confirmed', 'Confirm order'], confirmed: ['processing', 'Mark as processing'], processing: ['shipped', 'Mark as shipped'], shipped: ['delivered', 'Mark as delivered'] }[o.status];
    app.innerHTML = A.header('Order ' + o.number, 'Placed ' + A.datetime(o.createdAt), `<a href="/admin/orders" class="a-btn a-btn-o">← All orders</a>
      ${next ? `<button class="a-btn" data-to="${next[0]}">${next[1]}</button>` : ''}${!['cancelled', 'delivered'].includes(o.status) ? '<button class="a-btn a-btn-d" data-to="cancelled">Cancel order</button>' : ''}`) + `
      <div class="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div class="space-y-6">
          <section class="a-card rounded-xl p-6"><div class="mb-4 flex items-center justify-between"><h2 class="heading-display text-xl">Ordered watches</h2>${chip(o.status, o.status[0].toUpperCase() + o.status.slice(1))}</div>
            <div class="divide-y divide-graphite">${o.items.map((i) => `<div class="flex items-center gap-4 py-3"><img src="${esc(i.image || '')}" class="h-16 w-16 rounded-lg bg-sand object-cover" alt="">
              <div class="min-w-0 flex-1"><p class="font-medium">${esc(i.model)}</p><p class="text-xs text-stone">Ref. ${esc(i.reference)} · ${esc(i.brand)}</p></div>
              <p class="text-sm text-stone">${money(i.price)} × ${i.qty}</p><p class="w-28 text-right font-medium">${money(i.price * i.qty)}</p></div>`).join('')}</div>
            <div class="mt-4 space-y-1 border-t border-graphite pt-4 text-sm"><p class="flex justify-between"><span class="text-stone">Subtotal</span>${money(o.subtotal)}</p>
              ${o.discount ? `<p class="flex justify-between"><span class="text-stone">Discount${o.promoCode ? ' (' + esc(o.promoCode) + ')' : ''}</span>−${money(o.discount)}</p>` : ''}
              <p class="flex justify-between"><span class="text-stone">Shipping (${esc(o.shippingMethod)})</span>${o.shippingPrice ? money(o.shippingPrice) : 'Free'}</p>
              <p class="flex justify-between pt-2 text-lg"><b>Total</b><b class="text-gold">${money(o.total)}</b></p>
              <p class="pt-1 text-xs text-stone">No online payment — concierge confirms and completes this order manually.</p></div></section>
          <section class="a-card rounded-xl p-6"><h2 class="heading-display mb-4 text-xl">Status history</h2>
            <ol class="relative space-y-4 border-l border-graphite pl-6">${(o.events.length ? o.events : [{ status: 'pending', note: 'Order placed', createdAt: o.createdAt }]).map((ev) => `<li><span class="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-gold"></span>
              <p class="text-sm">${chip(ev.status)} <span class="ml-2 text-xs text-stone">${A.datetime(ev.createdAt)}</span></p>${ev.note ? `<p class="mt-1 text-xs text-ivory/70">${esc(ev.note)}</p>` : ''}</li>`).join('')}</ol>
            <form id="od-note" class="mt-5 flex gap-2"><input class="a-in" name="note" placeholder="Add an internal note to the history…"><button class="a-btn a-btn-o">Add note</button></form></section>
        </div>
        <div class="space-y-6">
          <section class="a-card rounded-xl p-6"><h2 class="heading-display mb-4 text-xl">Customer</h2>
            <div class="mb-4 flex items-center gap-3">${A.avatar(o.customerName, o.customer && o.customer.avatar)}<div><p class="font-medium">${esc(o.customerName)}</p>${o.customer ? `<a href="/admin/customers/${o.customer.id}" class="text-xs text-gold hover:underline">View customer →</a>` : '<p class="text-xs text-stone">Guest checkout</p>'}</div></div>
            <dl class="space-y-3 text-sm"><div><dt class="a-lbl">Email</dt><dd><a href="mailto:${esc(o.email)}" class="hover:text-gold">${esc(o.email)}</a></dd></div>
            <div><dt class="a-lbl">Phone</dt><dd>${o.phone ? `<a href="tel:${esc(o.phone)}" class="hover:text-gold">${esc(o.phone)}</a>` : '—'}</dd></div>
            <div><dt class="a-lbl">Delivery address</dt><dd class="leading-relaxed">${esc(a.address || '')}<br>${esc([a.city, a.zip].filter(Boolean).join(' '))}<br>${esc(a.country || '')}</dd></div></dl>
            <div class="mt-5 flex flex-wrap gap-2"><button class="a-btn a-btn-o" id="od-contact">Email customer</button>${o.customer && A.can('chat') ? `<a href="/admin/chat/${o.customer.id}" class="a-btn a-btn-o">Open chat</a>` : ''}${o.phone ? `<a href="tel:${esc(o.phone)}" class="a-btn a-btn-o">Call</a>` : ''}</div></section>
          <section class="a-card rounded-xl p-6"><h2 class="heading-display mb-4 text-xl">Shipping</h2>
            <form id="od-track" class="space-y-3"><label class="a-lbl">Tracking number</label><input class="a-in" name="trackingNumber" value="${esc(o.trackingNumber || '')}" placeholder="e.g. 1Z999AA10123456784"><button class="a-btn w-full">Save tracking</button></form></section>
        </div></div>`;
    const patch = async (body, msg) => { try { await A.api('/orders/' + o.id, { method: 'PATCH', body }); A.toast(msg); A.refreshBadges(); A.render(); } catch (err) { A.fail(err); } };
    app.querySelectorAll('[data-to]').forEach((b) => b.addEventListener('click', async () => {
      const to = b.dataset.to;
      if (to === 'cancelled' && !(await A.confirm('Cancel this order?', 'Items return to inventory and the customer is emailed. This cannot be undone.', { ok: 'Cancel order' }))) return;
      if (to === 'shipped' && !o.trackingNumber) {
        const tn = prompt('Tracking number (optional — included in the shipping email):', '');
        if (tn === null) return;
        return patch({ status: to, trackingNumber: tn || null }, 'Marked as shipped — customer emailed');
      }
      patch({ status: to }, 'Order ' + to + ' — customer emailed');
    }));
    document.getElementById('od-track').addEventListener('submit', (e) => { e.preventDefault(); patch({ trackingNumber: new FormData(e.target).get('trackingNumber') || null }, 'Tracking saved'); });
    document.getElementById('od-note').addEventListener('submit', (e) => { e.preventDefault(); const n = new FormData(e.target).get('note').trim(); if (n) patch({ note: n }, 'Note added'); });
    document.getElementById('od-contact').addEventListener('click', () => {
      const m = A.modal(`<h3 class="heading-display mb-5 text-2xl">Email ${esc(o.customerName)}</h3><form class="space-y-4"><div><label class="a-lbl">Subject</label><input class="a-in" name="subject" value="Your Novette order ${esc(o.number)}"></div>
        <div><label class="a-lbl">Message</label><textarea class="a-ta" name="message" rows="6">Hello ${esc(o.customerName.split(' ')[0])},\n\n</textarea></div><div class="flex justify-end gap-3"><button type="button" class="a-btn a-btn-o" data-close>Cancel</button><button class="a-btn">Send email</button></div></form>`);
      m.el.querySelector('form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try { await A.api('/orders/' + o.id + '/contact', { method: 'POST', body: Object.fromEntries(new FormData(e.target)) }); m.close(); A.toast('Email sent'); A.render(); } catch (err) { A.formErrors(e.target, err); }
      });
    });
  }
})();
