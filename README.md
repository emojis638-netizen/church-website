# Church Website (Amharic + English, full stack)

A full-stack website for a church community:

- **Public site**: Home, News (list + article pages), and unlimited admin-created
  pages (History and Church Hierarchy are included as starter pages).
- **Amharic + English**: every page title/body is stored in both languages, and
  visitors can switch the whole interface with the አማ / EN toggle in the header.
- **Admin dashboard**: log in to publish news, and to add, edit, reorder, or
  remove pages ("categories") — the menu updates automatically.
- **No external database required**: content is stored in a JSON file on disk,
  so there's nothing extra to install or configure.

## Project structure

```
church-website/
├── backend/           Express API + JSON "database" + file uploads
│   ├── server.js
│   ├── routes/        auth, pages, news, upload
│   ├── data/db.json   your content lives here (safe to back up)
│   └── uploads/        uploaded images
└── frontend/          plain HTML/CSS/JS public site + admin dashboard
    ├── index.html, news.html, news-detail.html, page.html
    └── admin/         login.html, dashboard.html
```

## Running it

You'll need [Node.js](https://nodejs.org) 18+ installed.

```bash
cd backend
npm install
npm start
```

The server starts on **http://localhost:4000** and serves everything —
the public site, the API, and the admin dashboard — from that one address:

- Public site: http://localhost:4000
- Admin dashboard: http://localhost:4000/admin/login.html

(To use a different port: `PORT=5000 npm start`.)

## First-time setup

The first time you open `/admin/login.html`, no admin account exists yet, so
the form becomes an **"Create admin account"** form instead of a login form.
Pick a username and password (6+ characters) — this creates your one admin
account. After that, the same page becomes a normal login form.

## Using the admin dashboard

- **News tab** — add, edit, or delete news posts. Each post has a title,
  summary, and body in both Amharic and English, an optional cover image, an
  author name, and a Published/Draft toggle (drafts are never shown to
  visitors).
- **Pages tab** — this is the flexible "category" system: History and Church
  Hierarchy are already set up as examples, and you can add as many more
  pages as you like (e.g. "Sunday School", "Choir", "Donations",
  "Contact"). Each page has a bilingual title and rich-text content, and a
  "Show in site menu" toggle. History and Hierarchy are marked as core pages
  so they can be edited but not accidentally deleted.
- **Settings tab** — change the admin password.

Every page/news form has a small formatting toolbar (bold, italic, lists,
headings, links) built into the editor — no external tools needed.

## Customizing the site name

The church name shown in the header/footer is set in one place:
`frontend/js/main.js`, at the top:

```js
const SITE_NAME = { am: 'ቤተ ክርስቲያናችን', en: 'Our Church' };
```

Edit that line to your church's actual name in both languages.

## Notes for going live

- Set a strong, secret `JWT_SECRET` environment variable in production
  (`middleware/auth.js` falls back to a default value if it's not set —
  don't rely on that fallback outside of local testing).
- `backend/data/db.json` is your entire database — back it up regularly.
- `backend/uploads/` holds uploaded images — back this up too, and make sure
  your hosting platform doesn't wipe it on redeploy (use a persistent disk
  or move to object storage like S3 if you outgrow local storage).
- Put the app behind HTTPS (e.g. via a reverse proxy like Caddy or Nginx, or
  a platform like Render/Railway/a VPS) before using it publicly, since
  login credentials are sent to `/api/auth/login`.
