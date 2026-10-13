/* Novette Admin — Customers, Live Chat, Inventory, Reviews */
(() => {
  const { esc, money, chip } = A;

  /* ===================== Customers ===================== */
  A.pages.customers = async (app, id, params) => {
    if (id) return customerDetail(app, id);
    const st = Object.assign({ q: '', status: '', sort: 'newest', page: 1 }, params);
    const tabs = [['customers', 'Customers'], ['inbox', 'Contact Inbox'], ['subscribers', 'Newsletter Subscribers']];
    let view = params.view || 'customers';
    app.innerHTML = A.header('Customers', 'CRM') + `
      <div class="mb-5 flex flex-wrap gap-2" id="cu-tabs">${tabs.map(([k, l]) => `<button class="pill ${view === k ? 'on' : ''}" data-view="${k}">${l}</button>`).join('')}</div>
      <div id="cu-body">${A.skeleton()}</div>`;
    const body = document.getElementById('cu-body');
    document.getElementById('cu-tabs').addEventListener('click', (e) => {
      const b = e.target.closest('[data-view]');
      if (!b) return;
      view = b.dataset.view;
      document.querySelectorAll('#cu-tabs .pill').forEach((p) => p.classList.toggle('on', p === b));
      A.setQuery({ view });
      show();
    });
    const show = async () => {
      if (view === 'inbox') return inbox(body);
      if (view === 'subscribers') return subscribers(body);
      body.innerHTML = `<div class="a-card mb-5 flex flex-wrap gap-3 rounded-xl p-4">
          <input class="a-in max-w-xs" id="cu-q" placeholder="Search name, email, phone…" value="${esc(st.q)}">
          <select class="a-sel max-w-[180px]" id="cu-status"><option value="">Any status</option><option value="active" ${st.status === 'active' ? 'selected' : ''}>Active</option><option value="inactive" ${st.status === 'inactive' ? 'selected' : ''}>Deactivated</option></select>
          <select class="a-sel max-w-[180px]" id="cu-sort"><option value="newest">Newest first</option><option value="name" ${st.sort === 'name' ? 'selected' : ''}>Name A–Z</option></select></div><div id="cu-list">${A.skeleton()}</div>`;
      const load = async () => {
        A.setQuery(Object.assign({ view }, st));
        const r = await A.api('/customers' + A.qs(st));
        document.getElementById('cu-list').innerHTML = r.data.length ? `<div class="a-card overflow-x-auto rounded-xl"><table class="a-table"><tr><th>Customer</th><th>Email</th><th>Phone</th><th>Orders</th><th>Registered</th><th>Status</th><th>Last activity</th><th class="text-right">Actions</th></tr>
          ${r.data.map((c) => `<tr class="a-row"><td><div class="flex items-center gap-3"><span class="relative">${A.avatar(c.name, c.avatar)}<span class="dot ${c.online ? 'dot-on' : 'dot-off'} absolute -bottom-0.5 -right-0.5 ring-2 ring-ink"></span></span><span class="font-medium">${esc(c.name)}</span>${!c.verified ? '<span class="chip chip-pending !py-0">Unverified</span>' : ''}</div></td>
            <td>${esc(c.email)}</td><td class="text-xs">${esc(c.phone || '—')}</td><td>${c.orders}</td><td class="whitespace-nowrap text-xs text-stone">${A.date(c.createdAt)}</td>
            <td>${chip(c.isActive ? 'active' : 'inactive', c.isActive ? 'Active' : 'Deactivated')}</td>
            <td class="whitespace-nowrap text-xs text-stone">${c.online ? '<b class="text-emerald-400">Online now</b>' : A.ago(c.lastActiveAt)}</td>
            <td class="whitespace-nowrap text-right"><a href="/admin/customers/${c.id}" class="iconbtn">View</a>${A.can('chat') ? `<a href="/admin/chat/${c.id}" class="iconbtn">Chat</a>` : ''}</td></tr>`).join('')}
          </table></div>${A.pager(r, (p) => { st.page = p; load(); })}` : A.empty('No customers match.');
      };
      document.getElementById('cu-q').addEventListener('input', A.debounce((e) => { st.q = e.target.value; st.page = 1; load(); }, 350));
      ['status', 'sort'].forEach((k) => document.getElementById('cu-' + k).addEventListener('change', (e) => { st[k] = e.target.value; st.page = 1; load(); }));
      await load();
    };
    async function inbox(el) {
      const r = await A.api('/inbox' + A.qs({ page: st.page }));
      el.innerHTML = r.data.length ? `<div class="space-y-3">${r.data.map((m) => `<article class="a-card rounded-xl p-5 ${m.read ? 'opacity-70' : ''}">
          <div class="flex flex-wrap items-center justify-between gap-2"><p class="font-medium">${esc(m.name)} <span class="text-xs font-normal text-stone">&lt;${esc(m.email)}&gt;</span></p>
          <span class="text-xs text-stone">${A.datetime(m.createdAt)}</span></div><p class="mt-2 text-sm text-ivory/80">${esc(m.message)}</p>
          <div class="mt-3 flex gap-2"><a href="mailto:${esc(m.email)}" class="iconbtn">Reply by email</a><button class="iconbtn" data-read="${m.id}">${m.read ? 'Mark unread' : 'Mark read'}</button><button class="iconbtn danger" data-del="${m.id}">Delete</button></div></article>`).join('')}</div>${A.pager(r, (p) => { st.page = p; show(); })}` : A.empty('The contact inbox is empty.');
    }
    async function subscribers(el) {
      const r = await A.api('/subscribers' + A.qs({ page: st.page }));
      el.innerHTML = r.data.length ? `<div class="a-card overflow-x-auto rounded-xl"><table class="a-table"><tr><th>Email</th><th>Subscribed</th><th class="text-right"></th></tr>
        ${r.data.map((s) => `<tr class="a-row"><td>${esc(s.email)}</td><td class="text-xs text-stone">${A.datetime(s.createdAt)}</td><td class="text-right"><button class="iconbtn danger" data-sub="${s.id}">Remove</button></td></tr>`).join('')}</table></div>${A.pager(r, (p) => { st.page = p; show(); })}` : A.empty('No subscribers yet.');
    }
    body.addEventListener('click', async (e) => {
      const rd = e.target.closest('[data-read]'), dl = e.target.closest('[data-del]'), sb = e.target.closest('[data-sub]');
      try {
        if (rd) { await A.api('/inbox/' + rd.dataset.read, { method: 'PATCH', body: { read: rd.textContent.trim() === 'Mark read' } }); show(); }
        if (dl) { await A.api('/inbox/' + dl.dataset.del, { method: 'DELETE' }); A.toast('Message deleted'); show(); }
        if (sb) { await A.api('/subscribers/' + sb.dataset.sub, { method: 'DELETE' }); A.toast('Subscriber removed'); show(); }
      } catch (err) { A.fail(err); }
    });
    await show();
  };

  async function customerDetail(app, id) {
    const c = await A.api('/customers/' + id);
    const orderRow = (o) => `<tr class="a-row"><td class="font-medium">${esc(o.number)}</td><td class="max-w-[220px]"><p class="truncate text-xs">${o.items.map((i) => esc(i.model)).join(', ')}</p></td><td>${money(o.total)}</td><td class="text-xs text-stone">${A.date(o.createdAt)}</td><td>${chip(o.status)}</td><td><a href="/admin/orders/${o.id}" class="a-btn a-btn-o !px-3 !py-1">View</a></td></tr>`;
    app.innerHTML = A.header(c.name, 'Customer profile', `<a href="/admin/customers" class="a-btn a-btn-o">← Customers</a>${A.can('chat') ? `<a href="/admin/chat/${c.id}" class="a-btn a-btn-o">Open chat</a>` : ''}
      <button class="a-btn ${c.isActive ? 'a-btn-o' : ''}" id="cu-toggle">${c.isActive ? 'Deactivate account' : 'Reactivate account'}</button><button class="a-btn a-btn-d" id="cu-del">Delete</button>`) + `
      <div class="grid gap-6 xl:grid-cols-[340px_1fr]">
        <div class="space-y-6"><section class="a-card rounded-xl p-6 text-center">
          ${A.avatar(c.name, c.avatar, '!h-20 !w-20 mx-auto !text-2xl')}
          <p class="mt-3 heading-display text-2xl">${esc(c.name)}</p>
          <p class="mt-1 text-sm"><a href="mailto:${esc(c.email)}" class="hover:text-gold">${esc(c.email)}</a></p>
          ${c.phone ? `<p class="text-sm"><a href="tel:${esc(c.phone)}" class="hover:text-gold">${esc(c.phone)}</a></p>` : ''}
          <div class="mt-4 flex justify-center gap-2">${chip(c.isActive ? 'active' : 'inactive', c.isActive ? 'Active' : 'Deactivated')}${c.online ? chip('in', 'Online now') : ''}${c.verified ? chip('confirmed', 'Verified email') : chip('pending', 'Unverified')}</div></section>
          <section class="a-card rounded-xl p-6"><dl class="space-y-3 text-sm">
            ${[['Registered', A.datetime(c.createdAt)], ['Last activity', c.online ? 'Online now' : A.ago(c.lastActiveAt)], ['Total orders', c.currentOrders.length + c.previousOrders.length], ['Open orders', c.currentOrders.length], ['Wishlist items', c.wishlist]]
              .map(([k, v]) => `<div class="flex justify-between"><dt class="text-stone">${k}</dt><dd>${v}</dd></div>`).join('')}</dl></section></div>
        <div class="space-y-6">
          <section class="a-card rounded-xl p-6"><h2 class="heading-display mb-4 text-xl">Current orders</h2>
            ${c.currentOrders.length ? `<table class="a-table"><tr><th>Order</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th><th></th></tr>${c.currentOrders.map(orderRow).join('')}</table>` : A.empty('No open orders.')}</section>
          <section class="a-card rounded-xl p-6"><h2 class="heading-display mb-4 text-xl">Previous orders</h2>
            ${c.previousOrders.length ? `<table class="a-table"><tr><th>Order</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th><th></th></tr>${c.previousOrders.map(orderRow).join('')}</table>` : A.empty('No past orders.')}</section>
          <section class="a-card rounded-xl p-6"><h2 class="heading-display mb-4 text-xl">Live-chat history</h2>
            ${c.chat.length ? `<div class="max-h-96 space-y-2 overflow-y-auto">${c.chat.map((m) => `<div class="flex ${m.from === 'concierge' ? 'justify-end' : ''}"><div class="${m.from === 'concierge' ? 'bubble-out' : 'bubble-in'}"><p class="whitespace-pre-line">${esc(m.body)}</p><p class="bubble-meta">${A.datetime(m.createdAt)}</p></div></div>`).join('')}</div>` : A.empty('No conversations yet.')}</section>
        </div></div>`;
    document.getElementById('cu-toggle').addEventListener('click', async () => {
      if (c.isActive && !(await A.confirm('Deactivate account?', `${esc(c.name)} will be signed out immediately and cannot log in until reactivated.`))) return;
      try { await A.api('/customers/' + c.id, { method: 'PATCH', body: { isActive: !c.isActive } }); A.toast(c.isActive ? 'Account deactivated' : 'Account reactivated'); A.render(); } catch (e) { A.fail(e); }
    });
    document.getElementById('cu-del').addEventListener('click', async () => {
      if (!(await A.confirm('Delete customer?', `<b>${esc(c.name)}</b> and their sessions, cart, wishlist and chats will be permanently removed. Their order records are kept, detached from the account.`, { ok: 'Delete permanently' }))) return;
      try { await A.api('/customers/' + c.id, { method: 'DELETE' }); A.toast('Customer deleted'); A.go('/admin/customers'); } catch (e) { A.fail(e); }
    });
  }

  /* ===================== Live Chat ===================== */
  A.pages.chat = async (app, uid, params) => {
    const st = Object.assign({ q: '', status: 'open' }, params);
    app.innerHTML = `
      <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div><p class="eyebrow mb-1">Concierge desk</p><h1 class="heading-display text-3xl font-medium">Live Chat</h1>
        <p class="mt-2 text-xs text-stone">Live chat now runs on Smartsupp — this page shows past conversations only. <a href="${A.liveChatUrl || '#'}" target="_blank" rel="noopener" class="text-gold underline">Open Smartsupp dashboard</a></p></div>
        <div class="flex flex-wrap items-center gap-2">
          <input class="a-in !w-52" id="ch-q" placeholder="Search conversations…" value="${esc(st.q)}">
          <select class="a-sel !w-36" id="ch-status"><option value="open" ${st.status === 'open' ? 'selected' : ''}>Open</option><option value="closed" ${st.status === 'closed' ? 'selected' : ''}>Closed</option><option value="unread" ${st.status === 'unread' ? 'selected' : ''}>Unread</option><option value="" ${!st.status ? 'selected' : ''}>All</option></select>
        </div></div>
      <div class="chatwrap">
        <aside id="ch-list" class="${uid ? 'hidden lg:block' : ''}"></aside>
        <section id="ch-view" class="${uid ? '' : 'hidden lg:flex'}"></section>
      </div>`;
    let convos = [];
    const drawList = () => {
      const el = document.getElementById('ch-list');
      el.innerHTML = convos.length ? convos.map((c) => `<a href="/admin/chat/${c.userId}" class="flex items-center gap-3 border-b border-graphite p-3.5 transition hover:bg-graphite ${String(uid) === String(c.userId) ? 'bg-graphite/60' : ''}">
        <span class="relative shrink-0">${A.avatar(c.name, c.avatar)}<span class="dot ${c.online ? 'dot-on' : 'dot-off'} absolute bottom-0 right-0 ring-2 ring-ink"></span></span>
        <span class="min-w-0 flex-1"><span class="flex items-center justify-between gap-2"><b class="truncate text-sm font-medium">${esc(c.name)}</b><span class="shrink-0 text-[10px] text-stone">${A.ago(c.lastMessage && c.lastMessage.createdAt)}</span></span>
        <span class="flex items-center justify-between gap-2"><span class="truncate text-xs ${c.typing ? 'text-gold' : 'text-stone'}">${c.typing ? 'typing…' : c.status === 'closed' ? '<i class="text-stone">closed</i> · ' + esc(c.lastMessage ? c.lastMessage.body : '') : esc(c.lastMessage ? (c.lastMessage.from === 'concierge' ? 'You: ' : '') + c.lastMessage.body : 'No messages')}</span>
        ${c.unread ? `<span class="navbadge !ml-0">${c.unread}</span>` : ''}</span></span></a>`).join('')
        : '<p class="p-6 text-center text-sm text-stone">No conversations.</p>';
    };
    const loadList = async () => {
      try { convos = await A.api('/chats' + A.qs({ q: st.q, status: st.status })); drawList(); } catch (e) { /* keep old list */ }
    };
    document.getElementById('ch-q').addEventListener('input', A.debounce((e) => { st.q = e.target.value; A.setQuery(Object.assign({}, st, { page: null })); loadList(); }, 300));
    document.getElementById('ch-status').addEventListener('change', (e) => { st.status = e.target.value; A.setQuery(st); loadList(); });
    A.every(loadList, 5000);
    await loadList();
    if (!uid) {
      document.getElementById('ch-view').innerHTML = `<div class="m-auto p-10 text-center text-stone"><p class="heading-display text-2xl">Select a conversation</p><p class="mt-2 text-sm">Customer messages arrive in real time.</p></div>`;
      return;
    }

    /* ---- conversation ---- */
    const view = document.getElementById('ch-view');
    let convo = null, msgs = [], sig = '';
    const msgHtml = (m) => `<div class="flex ${m.from === 'concierge' ? 'justify-end' : ''}" data-mid="${m.id}">
      <div class="${m.from === 'concierge' ? 'bubble-out' : 'bubble-in'}">
        ${m.body.split(/\n+/).map((p) => {
          const mm = p.match(/^(.+)\s+—\s+(.+)$/);
          if (/^https?:\/\//.test(p.trim())) return `<a href="${esc(p.trim())}" class="text-xs text-gold underline" target="_blank">${esc(p.trim())}</a>`;
          if (/^⌚/.test(p.trim())) return `<a href="${esc((m.body.match(/\/watches\/[\w-]+/) || ['#'])[0])}" class="block rounded border border-gold/40 bg-ink p-2 text-xs text-ivory hover:bg-gold/10">${esc(p.trim().slice(1).trim())}</a>`;
          return `<p class="whitespace-pre-line">${esc(p)}</p>`;
        }).join('')}
        <p class="bubble-meta">${A.time(m.createdAt)}${m.from === 'concierge' ? ` · <span class="readstate">${m.readByUser ? 'Read' : 'Sent'}</span>` : ''}</p></div></div>`;
    const drawHeader = () => {
      const el = document.getElementById('ch-head');
      if (!el || !convo) return;
      el.innerHTML = `<div class="flex items-center gap-3"><a href="/admin/chat" class="iconbtn lg:hidden">←</a>
        <span class="relative">${A.avatar(convo.name, convo.avatar)}<span class="dot ${convo.online ? 'dot-on' : 'dot-off'} absolute bottom-0 right-0 ring-2 ring-ink"></span></span>
        <div class="min-w-0 flex-1"><p class="truncate font-medium">${esc(convo.name)}</p>
        <p class="text-xs ${convo.typing ? 'text-gold' : 'text-stone'}">${convo.typing ? 'typing…' : convo.online ? 'Online' : 'Last seen ' + A.ago(convo.lastActiveAt)}${convo.status === 'closed' ? ' · closed' : ''}</p></div>
        ${A.can('customers') ? `<a href="/admin/customers/${convo.userId}" class="iconbtn" title="Customer profile">Profile</a>` : ''}
        <button class="a-btn a-btn-o !py-1.5 !text-xs" id="ch-toggle">${convo.status === 'closed' ? 'Reopen' : 'Close conversation'}</button></div>`;
      const t = document.getElementById('ch-toggle');
      if (t) t.addEventListener('click', async () => {
        try { await A.api('/chats/' + convo.userId, { method: 'PATCH', body: { status: convo.status === 'closed' ? 'open' : 'closed' } }); loadThread(true); } catch (e) { A.fail(e); }
      });
    };
    const drawMsgs = () => {
      const el = document.getElementById('ch-msgs');
      const newSig = msgs.map((m) => m.id + (m.readByUser ? 'r' : '')).join(',') + '|' + convo.typing;
      if (newSig === sig) return;
      sig = newSig;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      el.innerHTML = msgs.map(msgHtml).join('') + (convo.typing ? `<div class="flex"><div class="bubble-in"><p class="typing"><span></span><span></span><span></span></p></div></div>` : '');
      if (atBottom) el.scrollTop = el.scrollHeight;
    };
    const loadThread = async (force) => {
      try {
        const r = await A.api('/chats/' + uid);
        convo = r.conversation; msgs = r.messages;
        drawHeader(); drawMsgs();
        if (force || r.conversation.unread === 0) A.refreshBadges();
      } catch (e) { if (!convo) view.innerHTML = A.empty(e.message); }
    };
    view.innerHTML = `<div class="flex h-full flex-col">
      <div id="ch-head" class="border-b border-graphite p-4"></div>
      <div id="ch-msgs" class="chat-msgs flex-1 space-y-2 overflow-y-auto p-4"></div>
      <div class="border-t border-graphite p-3">
        <div class="flex items-end gap-2">
          <button class="a-btn a-btn-o !px-3" id="ch-prod" title="Send a watch link">⌚</button>
          <textarea id="ch-input" class="a-ta !min-h-0 flex-1" rows="1" placeholder="Reply as concierge… (Enter to send)"></textarea>
          <button class="a-btn !px-4" id="ch-send">Send</button></div>
        <p class="mt-1 text-[10px] text-stone">Enter sends · Shift+Enter newline · ⌚ share a watch from the catalogue</p></div></div>`;
    const input = document.getElementById('ch-input');
    const send = async (watchId) => {
      const body = input.value.trim();
      if (!body && !watchId) return;
      input.value = ''; input.style.height = 'auto';
      try { await A.api('/chats/' + uid, { method: 'POST', body: { body: body || undefined, watchId } }); loadThread(true); document.getElementById('ch-msgs').scrollTop = 1e6; }
      catch (e) { A.fail(e); input.value = body; }
    };
    document.getElementById('ch-send').addEventListener('click', () => send());
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
    input.addEventListener('input', A.debounce(() => { A.api('/chats/' + uid + '/typing', { method: 'POST' }).catch(() => {}); }, 1200));
    input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(120, input.scrollHeight) + 'px'; });
    document.getElementById('ch-prod').addEventListener('click', () => {
      const m = A.modal(`<h3 class="heading-display mb-4 text-2xl">Share a watch</h3><input class="a-in mb-3" id="cp-q" placeholder="Search the catalogue…"><div id="cp-list" class="max-h-80 space-y-1 overflow-y-auto">${A.skeleton(3)}</div>`);
      const list = m.el.querySelector('#cp-list');
      const find = async (q) => {
        const items = await A.api('/chat-products?q=' + encodeURIComponent(q || ''));
        list.innerHTML = items.length ? items.map((w) => `<button class="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-graphite" data-wid="${w.id}">
          <img src="${esc(w.image || '')}" class="h-11 w-11 rounded bg-sand object-cover" alt=""><span class="min-w-0"><span class="block truncate text-sm">${esc(w.model)}</span><span class="text-xs text-stone">${esc(w.brandName || '')} · ${money(w.price)}</span></span></button>`).join('') : '<p class="p-4 text-center text-sm text-stone">No matches.</p>';
      };
      m.el.querySelector('#cp-q').addEventListener('input', A.debounce((e) => find(e.target.value).catch(() => {}), 300));
      list.addEventListener('click', (e) => { const b = e.target.closest('[data-wid]'); if (b) { m.close(); send(b.dataset.wid); } });
      find('');
    });
    A.every(() => { loadThread(); }, 3000);
    A.on('chat:new', () => { loadThread(); loadList(); });
    await loadThread(true);
  };

  /* ===================== Inventory ===================== */
  A.pages.inventory = async (app, _id, params) => {
    const st = Object.assign({ q: '', status: '', sort: 'stock', page: 1 }, params);
    app.innerHTML = A.header('Inventory', 'Stock management') + `
      <div id="inv-sum" class="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4"></div>
      <div class="a-card mb-5 flex flex-wrap gap-3 rounded-xl p-4">
        <input class="a-in max-w-xs" id="i-q" placeholder="Search model or SKU…" value="${esc(st.q)}">
        <select class="a-sel max-w-[170px]" id="i-status"><option value="">All stock</option><option value="in" ${st.status === 'in' ? 'selected' : ''}>In Stock</option><option value="low" ${st.status === 'low' ? 'selected' : ''}>Low Stock</option><option value="out" ${st.status === 'out' ? 'selected' : ''}>Out of Stock</option></select>
        <select class="a-sel max-w-[170px]" id="i-sort"><option value="stock">Lowest stock first</option><option value="name" ${st.sort === 'name' ? 'selected' : ''}>Name A–Z</option></select></div>
      <div id="i-list">${A.skeleton()}</div>`;
    const load = async () => {
      A.setQuery(st);
      const r = await A.api('/inventory' + A.qs(st));
      document.getElementById('inv-sum').innerHTML = [['in', 'In Stock', r.summary.in], ['low', 'Low Stock', r.summary.low], ['out', 'Out of Stock', r.summary.out], ['in', 'Units on Hand', r.summary.units]]
        .map(([k, l, n]) => `<button class="stat-card text-left" data-f="${k === 'in' && l === 'Units on Hand' ? '' : k}"><p class="eyebrow">${l}</p><p class="num">${n}</p></button>`).join('');
      document.getElementById('i-list').innerHTML = r.data.length ? `<div class="a-card overflow-x-auto rounded-xl"><table class="a-table"><tr><th>Product</th><th>SKU</th><th>Status</th><th>Stock</th><th>Alert at</th><th>Last updated</th><th class="text-right"></th></tr>
        ${r.data.map((w) => `<tr class="a-row" data-row="${w.id}"><td><div class="flex items-center gap-3"><img src="${esc(w.image || '')}" class="h-11 w-11 rounded bg-sand object-cover" alt=""><span class="max-w-[220px] truncate font-medium">${esc(w.model)}</span><span class="text-xs text-stone">${esc(w.brand)}</span></div></td>
          <td class="text-xs text-stone">${esc(w.sku || '—')}</td><td class="cell-status">${chip(w.status, A.stockLabel[w.status])}</td>
          <td><div class="inline-flex items-center gap-1"><button class="pg-btn !h-7 !w-7" data-adj="${w.id}" data-d="-1">−</button><input class="a-in !w-16 !py-1 text-center" type="number" min="0" value="${w.inventory}" data-qty="${w.id}"><button class="pg-btn !h-7 !w-7" data-adj="${w.id}" data-d="1">+</button></div></td>
          <td><input class="a-in !w-16 !py-1 text-center" type="number" min="0" value="${w.lowStockAt}" data-low="${w.id}"></td>
          <td class="cell-upd whitespace-nowrap text-xs text-stone">${A.date(w.updatedAt)}</td>
          <td class="text-right"><button class="a-btn a-btn-o !px-3 !py-1" data-save="${w.id}">Save</button></td></tr>`).join('')}</table></div>${A.pager(r, (p) => { st.page = p; load(); })}` : A.empty('No watches match these filters.');
    };
    document.getElementById('i-q').addEventListener('input', A.debounce((e) => { st.q = e.target.value; st.page = 1; load(); }, 350));
    ['status', 'sort'].forEach((k) => document.getElementById('i-' + k).addEventListener('change', (e) => { st[k] = e.target.value; st.page = 1; load(); }));
    document.getElementById('inv-sum').addEventListener('click', (e) => { const b = e.target.closest('[data-f]'); if (b) { st.status = b.dataset.f; st.page = 1; document.getElementById('i-status').value = st.status; load(); } });
    document.getElementById('i-list').addEventListener('click', async (e) => {
      const adj = e.target.closest('[data-adj]'), sv = e.target.closest('[data-save]');
      if (adj) { const inp = document.querySelector(`[data-qty="${adj.dataset.adj}"]`); inp.value = Math.max(0, (+inp.value || 0) + +adj.dataset.d); return; }
      if (sv) {
        const id = sv.dataset.save, inventory = +document.querySelector(`[data-qty="${id}"]`).value, lowStockAt = +document.querySelector(`[data-low="${id}"]`).value;
        if (isNaN(inventory) || inventory < 0) return A.toast('Stock cannot be negative', 'err');
        sv.disabled = true;
        try {
          const w = await A.api('/inventory/' + id, { method: 'PATCH', body: { inventory, lowStockAt } });
          const row = document.querySelector(`[data-row="${id}"]`);
          row.querySelector('.cell-status').innerHTML = chip(w.status, A.stockLabel[w.status]);
          row.querySelector('.cell-upd').textContent = A.date(w.updatedAt);
          A.toast('Stock updated'); A.refreshBadges();
        } catch (err) { A.fail(err); }
        sv.disabled = false;
      }
    });
    await load();
  };

  /* ===================== Reviews ===================== */
  A.pages.reviews = async (app, _id, params) => {
    const st = Object.assign({ q: '', status: '', rating: '', page: 1 }, params);
    app.innerHTML = A.header('Reviews & Ratings', 'Moderation') + `
      <div id="rv-sum" class="mb-5 grid gap-4 sm:grid-cols-3"></div>
      <div class="a-card mb-5 flex flex-wrap gap-3 rounded-xl p-4">
        <input class="a-in max-w-xs" id="r-q" placeholder="Search review, author, watch…" value="${esc(st.q)}">
        <select class="a-sel max-w-[160px]" id="r-status"><option value="">All statuses</option><option value="pending" ${st.status === 'pending' ? 'selected' : ''}>Pending</option><option value="approved" ${st.status === 'approved' ? 'selected' : ''}>Approved</option><option value="rejected" ${st.status === 'rejected' ? 'selected' : ''}>Rejected</option></select>
        <select class="a-sel max-w-[140px]" id="r-rating"><option value="">Any rating</option>${[5, 4, 3, 2, 1].map((n) => `<option ${st.rating === String(n) ? 'selected' : ''}>${n} ★</option>`).join('')}</select></div>
      <div class="grid gap-6 xl:grid-cols-[1fr_320px]"><div id="r-list">${A.skeleton()}</div><div id="r-avg"></div></div>`;
    const load = async () => {
      A.setQuery(st);
      const r = await A.api('/reviews' + A.qs(st));
      const n = r.counts || {};
      document.getElementById('rv-sum').innerHTML = [
        ['Pending review', n.pending || 0, 'pending'], ['Approved', n.approved || 0, 'approved'], ['Rejected', n.rejected || 0, 'rejected']]
        .map(([l, v, k]) => `<button class="stat-card text-left ${st.status === k ? '!border-gold' : ''}" data-sf="${k}"><p class="eyebrow">${l}</p><p class="num">${v}</p></button>`).join('')
        + `<div class="a-card flex items-center justify-between rounded-xl p-5 sm:col-span-3"><div><p class="eyebrow">Average rating across approved reviews</p><p class="heading-display text-3xl">${r.overall ? r.overall + ' ★' : 'No ratings yet'}</p></div></div>`;
      document.getElementById('r-avg').innerHTML = `<div class="a-card rounded-xl p-5"><p class="eyebrow mb-3">Top rated watches</p>${r.averages.length ? `<div class="space-y-3">${r.averages.map((w) => `<a href="/admin/products/${w.id}" class="block"><p class="truncate text-sm">${esc(w.model)}</p><p class="text-xs">${A.stars(w.avg)} <span class="text-stone">${w.avg} · ${w.n} review${w.n > 1 ? 's' : ''}</span></p></a>`).join('')}</div>` : '<p class="text-sm text-stone">No approved reviews yet.</p>'}</div>`;
      document.getElementById('r-list').innerHTML = r.data.length ? `<div class="space-y-3">${r.data.map((rv) => `<article class="a-card rounded-xl p-5">
        <div class="flex flex-wrap items-start justify-between gap-3"><div><p class="text-sm">${A.stars(rv.rating)} <span class="text-xs text-stone">${Number(rv.rating)}</span> <b class="ml-1">${esc(rv.author)}</b>${rv.userEmail ? ` <span class="text-xs text-stone">&lt;${esc(rv.userEmail)}&gt;</span>` : ''}</p>
          ${rv.watchId ? `<a href="/admin/products/${rv.watchId}" class="text-xs text-gold hover:underline">${esc(rv.watchModel || 'Deleted watch')}</a>` : `<span class="text-xs text-stone">Homepage testimonial${rv.title ? ' · ' + esc(rv.title) : ''}</span>`}</div>
          <div class="flex items-center gap-2">${chip(rv.status)}<span class="text-xs text-stone">${A.date(rv.createdAt)}</span></div></div>
        ${rv.body ? `<p class="mt-3 text-sm leading-relaxed text-ivory/80">${esc(rv.body)}</p>` : ''}
        <div class="mt-4 flex flex-wrap gap-2">${rv.status !== 'approved' ? `<button class="a-btn !py-1.5 !text-xs" data-st="${rv.id}|approved">Approve</button>` : ''}
          ${rv.status !== 'rejected' ? `<button class="a-btn a-btn-o !py-1.5 !text-xs" data-st="${rv.id}|rejected">Reject</button>` : ''}
          <label class="flex items-center gap-2 text-xs text-stone">Rating <select class="a-sel !w-24 !py-1 !text-xs" data-rrate="${rv.id}">${[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1].map((v) => `<option value="${v}" ${Number(rv.rating) === v ? 'selected' : ''}>${v} ★</option>`).join('')}</select></label>
          <button class="a-btn a-btn-o !py-1.5 !text-xs !border-red-500/40 !text-red-400" data-rdel="${rv.id}">Delete</button></div></article>`).join('')}</div>${A.pager(r, (p) => { st.page = p; load(); })}` : A.empty('No reviews match these filters.');
    };
    document.getElementById('r-q').addEventListener('input', A.debounce((e) => { st.q = e.target.value; st.page = 1; load(); }, 350));
    ['status', 'rating'].forEach((k) => document.getElementById('r-' + k).addEventListener('change', (e) => { st[k] = e.target.value; st.page = 1; load(); }));
    document.getElementById('rv-sum').addEventListener('click', (e) => { const b = e.target.closest('[data-sf]'); if (b) { st.status = st.status === b.dataset.sf ? '' : b.dataset.sf; st.page = 1; document.getElementById('r-status').value = st.status; load(); } });
    document.getElementById('r-list').addEventListener('change', async (e) => {
      const sel = e.target.closest('[data-rrate]');
      if (!sel) return;
      try { await A.api('/reviews/' + sel.dataset.rrate, { method: 'PATCH', body: { rating: Number(sel.value) } }); A.toast('Rating updated to ' + sel.value + ' ★'); load(); } catch (err) { A.fail(err); }
    });
    document.getElementById('r-list').addEventListener('click', async (e) => {
      const s = e.target.closest('[data-st]'), d = e.target.closest('[data-rdel]');
      try {
        if (s) { const [id, status] = s.dataset.st.split('|'); await A.api('/reviews/' + id, { method: 'PATCH', body: { status } }); A.toast('Review ' + status); load(); }
        if (d && await A.confirm('Delete review?', 'This review will be permanently removed.', { ok: 'Delete' })) { await A.api('/reviews/' + d.dataset.rdel, { method: 'DELETE' }); A.toast('Review deleted'); load(); }
      } catch (err) { A.fail(err); }
    });
    await load();
  };
})();
