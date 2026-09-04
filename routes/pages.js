const express = require('express');
const { load, save, nextId } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u1200-\u137F]+/g, '-') // keep latin, numbers, and Ethiopic block
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'page';
}

// Public: list all pages, ordered for the menu
router.get('/', (req, res) => {
  const data = load();
  const pages = [...data.pages].sort((a, b) => a.order - b.order);
  res.json(pages);
});

// Public: get one page by slug
router.get('/:slug', (req, res) => {
  const data = load();
  const page = data.pages.find((p) => p.slug === req.params.slug);
  if (!page) return res.status(404).json({ error: 'Page not found.' });
  res.json(page);
});

// Admin: create a new page/category
router.post('/', requireAuth, (req, res) => {
  const data = load();
  const { title_am, title_en, content_am, content_en, showInMenu } = req.body;
  if (!title_am && !title_en) {
    return res.status(400).json({ error: 'A title in Amharic or English is required.' });
  }
  let slug = slugify(title_en || title_am);
  let unique = slug;
  let i = 2;
  while (data.pages.some((p) => p.slug === unique)) {
    unique = `${slug}-${i++}`;
  }
  const maxOrder = data.pages.reduce((m, p) => Math.max(m, p.order || 0), 0);
  const page = {
    id: nextId(data, 'page'),
    slug: unique,
    title_am: title_am || '',
    title_en: title_en || '',
    content_am: content_am || '',
    content_en: content_en || '',
    order: maxOrder + 1,
    showInMenu: showInMenu !== false,
    isSystem: false,
  };
  data.pages.push(page);
  save(data);
  res.status(201).json(page);
});

// Admin: update a page/category
router.put('/:id', requireAuth, (req, res) => {
  const data = load();
  const page = data.pages.find((p) => p.id === Number(req.params.id));
  if (!page) return res.status(404).json({ error: 'Page not found.' });
  const { title_am, title_en, content_am, content_en, showInMenu, order } = req.body;
  if (title_am !== undefined) page.title_am = title_am;
  if (title_en !== undefined) page.title_en = title_en;
  if (content_am !== undefined) page.content_am = content_am;
  if (content_en !== undefined) page.content_en = content_en;
  if (showInMenu !== undefined) page.showInMenu = !!showInMenu;
  if (order !== undefined) page.order = Number(order);
  save(data);
  res.json(page);
});

// Admin: delete a page/category (system pages like History/Hierarchy are protected)
router.delete('/:id', requireAuth, (req, res) => {
  const data = load();
  const idx = data.pages.findIndex((p) => p.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Page not found.' });
  if (data.pages[idx].isSystem) {
    return res.status(400).json({ error: 'This page is a core page and cannot be deleted, only edited.' });
  }
  data.pages.splice(idx, 1);
  save(data);
  res.json({ ok: true });
});

module.exports = router;
