// Small fetch wrapper shared by every public page.
const API = {
  base: '/api',

  async get(path) {
    const res = await fetch(`${this.base}${path}`);
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Request failed.');
    return res.json();
  },

  async pages() {
    return this.get('/pages');
  },

  async page(slug) {
    return this.get(`/pages/${slug}`);
  },

  async news() {
    return this.get('/news');
  },

  async newsItem(id) {
    return this.get(`/news/${id}`);
  },
};
