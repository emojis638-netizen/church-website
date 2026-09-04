const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { load, save } = require('../db');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Check whether an admin account already exists (used by the frontend to decide
// whether to show "create admin" or "login").
router.get('/status', (req, res) => {
  const data = load();
  res.json({ hasAdmin: !!data.admin });
});

// One-time setup: create the first admin account. Disabled once an admin exists.
router.post('/setup', (req, res) => {
  const data = load();
  if (data.admin) {
    return res.status(400).json({ error: 'An admin account already exists.' });
  }
  const { username, password } = req.body;
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ error: 'Username and a password of at least 6 characters are required.' });
  }
  data.admin = { username, passwordHash: bcrypt.hashSync(password, 10) };
  save(data);
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username });
});

router.post('/login', (req, res) => {
  const data = load();
  const { username, password } = req.body;
  if (!data.admin || data.admin.username !== username) {
    return res.status(401).json({ error: 'Incorrect username or password.' });
  }
  const ok = bcrypt.compareSync(password || '', data.admin.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Incorrect username or password.' });
  }
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ username: req.admin.username });
});

router.put('/password', requireAuth, (req, res) => {
  const data = load();
  const { currentPassword, newPassword } = req.body;
  const ok = bcrypt.compareSync(currentPassword || '', data.admin.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Current password is incorrect.' });
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }
  data.admin.passwordHash = bcrypt.hashSync(newPassword, 10);
  save(data);
  res.json({ ok: true });
});

module.exports = router;
