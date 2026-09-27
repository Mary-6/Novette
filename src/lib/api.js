const BASE = '/api';

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || res.statusText), { status: res.status });
  return data;
}

export const api = {
  me: () => request('/auth/me'),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  signup: (payload) => request('/auth/signup', { method: 'POST', body: payload }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (payload) => request('/auth/reset-password', { method: 'POST', body: payload }),
  verifyEmail: (token) => request('/auth/verify-email', { method: 'POST', body: { token } }),
  cart: () => request('/cart'),
  syncCart: (items) => request('/cart', { method: 'PUT', body: { items } }),
  wishlist: () => request('/wishlist'),
  syncWishlist: (watchIds) => request('/wishlist', { method: 'PUT', body: { watchIds } }),
  shippingRates: () => request('/shipping-rates'),
  createOrder: (order) => request('/orders', { method: 'POST', body: order }),
  orders: () => request('/orders'),
  order: (number, email) =>
    request(`/orders/${number}${email ? `?email=${encodeURIComponent(email)}` : ''}`),
  contact: (msg) => request('/contact', { method: 'POST', body: msg }),
  newsletter: (email) => request('/newsletter', { method: 'POST', body: { email } }),
  adminStats: () => request('/admin/stats'),
  adminWatches: () => request('/admin/watches'),
  adminUpdateWatch: (id, data) => request(`/admin/watches/${id}`, { method: 'PATCH', body: data }),
  adminOrders: () => request('/admin/orders'),
  adminUpdateOrder: (id, data) =>
    request(`/admin/orders/${id}`, { method: 'PATCH', body: data }),
  adminMessages: () => request('/admin/messages'),
  adminCreateWatch: (data) => request('/admin/watches', { method: 'POST', body: data }),
  adminDeleteWatch: (id) => request(`/admin/watches/${id}`, { method: 'DELETE' }),
  adminCustomers: () => request('/admin/customers'),
  adminTemplates: () => request('/admin/templates'),
  adminSaveTemplate: (key, data) =>
    request(`/admin/templates/${key}`, { method: 'PUT', body: data }),
  chatThread: () => request('/chat/thread'),
  chatSend: (body) => request('/chat/messages', { method: 'POST', body: { body } }),
  adminChats: () => request('/admin/chats'),
  adminChatThread: (userId) => request(`/admin/chats/${userId}`),
  adminChatReply: (userId, body) =>
    request(`/admin/chats/${userId}`, { method: 'POST', body: { body } }),
  adminUpload: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return fetch('/api/admin/upload', { method: 'POST', credentials: 'include', body: fd }).then(
      (r) => r.json()
    );
  },
};

export async function apiAvailable() {
  try {
    const res = await fetch('/api/health', { credentials: 'include' });
    return res.ok;
  } catch {
    return false;
  }
}
