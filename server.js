const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const pagesRoutes = require('./routes/pages');
const newsRoutes = require('./routes/news');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/upload', uploadRoutes);

// Serve the public frontend and the admin dashboard as static sites
const frontendDir = path.join(__dirname, '..', 'frontend');
app.use('/', express.static(frontendDir));
app.use('/admin', express.static(path.join(frontendDir, 'admin')));

// Fallback 404 for unknown API routes
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

app.listen(PORT, () => {
  console.log(`\n  Church website server running at http://localhost:${PORT}`);
  console.log(`  Admin dashboard at http://localhost:${PORT}/admin\n`);
});
