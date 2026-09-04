const AdminAPI = {
  base: '/api',

  token() {
    return localStorage.getItem('admin_token');
  },

  setSession(token, username) {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_username', username);
  },

  clearSession() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
  },

  username() {
    return localStorage.getItem('admin_username') || '';
  },

  async request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    const t = this.token();
    if (t) headers.Authorization = `Bearer ${t}`;
    const res = await fetch(`${this.base}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401) {
      this.clearSession();
      window.location.href = '/admin/login.html';
      throw new Error('Session expired.');
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed.');
    return data;
  },

  status() { return this.request('GET', '/auth/status'); },
  setup(username, password) { return this.request('POST', '/auth/setup', { username, password }); },
  login(username, password) { return this.request('POST', '/auth/login', { username, password }); },
  changePassword(currentPassword, newPassword) {
    return this.request('PUT', '/auth/password', { currentPassword, newPassword });
  },

  pages() { return this.request('GET', '/pages'); },
  createPage(p) { return this.request('POST', '/pages', p); },
  updatePage(id, p) { return this.request('PUT', `/pages/${id}`, p); },
  deletePage(id) { return this.request('DELETE', `/pages/${id}`); },

  news() { return this.request('GET', '/news'); },
  newsItem(id) { return this.request('GET', `/news/${id}`); },
  createNews(n) { return this.request('POST', '/news', n); },
  updateNews(id, n) { return this.request('PUT', `/news/${id}`, n); },
  deleteNews(id) { return this.request('DELETE', `/news/${id}`); },

  async uploadImage(file) {
    const fd = new FormData();
    fd.append('image', file);
    const t = this.token();
    const res = await fetch(`${this.base}/upload`, {
      method: 'POST',
      headers: t ? { Authorization: `Bearer ${t}` } : {},
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Upload failed.');
    return data.url;
  },

  requireAuth() {
    if (!this.token()) window.location.href = '/admin/login.html';
  },
};
