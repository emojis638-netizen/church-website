const express = require('express');
const { load, save, nextId } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Public: list news, most recent first. Only published items unless authenticated.
router.get('/', (req, res) => {
  const data = load();
  const isAdmin = !!req.headers.authorization; // rough check, admin dashboard sends token
  let items = [...data.news];
  if (!isAdmin) items = items.filter((n) => n.published);
  items.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(items);
});

router.get('/:id', (req, res) => {
  const data = load();
  const item = data.news.find((n) => n.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'News post not found.' });
  res.json(item);
});

router.post('/', requireAuth, (req, res) => {
  const data = load();
  const { title_am, title_en, summary_am, summary_en, body_am, body_en, image, author, published } = req.body;
  if (!title_am && !title_en) {
    return res.status(400).json({ error: 'A title in Amharic or English is required.' });
  }
  const item = {
    id: nextId(data, 'news'),
    title_am: title_am || '',
    title_en: title_en || '',
    summary_am: summary_am || '',
    summary_en: summary_en || '',
    body_am: body_am || '',
    body_en: body_en || '',
    image: image || null,
    author: author || 'Admin',
    date: new Date().toISOString(),
    published: published !== false,
  };
  data.news.push(item);
  save(data);
  res.status(201).json(item);
});

router.put('/:id', requireAuth, (req, res) => {
  const data = load();
  const item = data.news.find((n) => n.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'News post not found.' });
  const fields = ['title_am', 'title_en', 'summary_am', 'summary_en', 'body_am', 'body_en', 'image', 'author', 'published'];
  for (const f of fields) {
    if (req.body[f] !== undefined) item[f] = req.body[f];
  }
  save(data);
  res.json(item);
});

router.delete('/:id', requireAuth, (req, res) => {
  const data = load();
  const idx = data.news.findIndex((n) => n.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'News post not found.' });
  data.news.splice(idx, 1);
  save(data);
  res.json({ ok: true });
});

module.exports = router;
