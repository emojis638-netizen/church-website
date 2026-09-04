// Builds the header/nav (including dynamically-added pages) and footer on every
// public page, so there is one source of truth instead of copy-pasted markup.
const Layout = (() => {
  const CROSS_SVG = `
    <svg class="brand-mark" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="17" y="2" width="6" height="36" fill="#D9B65F"/>
      <rect x="2" y="17" width="36" height="6" fill="#D9B65F"/>
    </svg>`;

  const ORNAMENT_SVG = `
    <svg class="ornament" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="27" y="4" width="10" height="56" fill="#D9B65F"/>
      <rect x="4" y="27" width="56" height="10" fill="#D9B65F"/>
      <rect x="27" y="4" width="10" height="56" fill="none" stroke="#F3E6C8" stroke-width="1" opacity="0.5"/>
    </svg>`;

  async function injectHeader(siteName) {
    const mount = document.getElementById('site-header');
    if (!mount) return;

    let pages = [];
    try {
      pages = await API.pages();
    } catch (e) {
      pages = [];
    }
    const menuPages = pages.filter((p) => p.showInMenu);

    const pageLinks = menuPages
      .map((p) => `<a href="/page.html?slug=${encodeURIComponent(p.slug)}" data-page-link="${p.slug}">${escapeHtml(i18n.pick(p, 'title'))}</a>`)
      .join('');

    mount.innerHTML = `
      <div class="wrap">
        <a class="brand" href="/index.html" style="text-decoration:none;">
          ${CROSS_SVG}
          <div class="brand-text">
            <h1>${escapeHtml(siteName.am)}</h1>
            <p>${escapeHtml(siteName.en)}</p>
          </div>
        </a>
        <nav class="main-nav" aria-label="Main">
          <a href="/index.html" data-i18n="nav_home" data-page-link="home"></a>
          <a href="/news.html" data-i18n="nav_news" data-page-link="news"></a>
          ${pageLinks}
          <div class="lang-switch" role="group" aria-label="Language">
            <button data-lang-btn="am">አማ</button>
            <button data-lang-btn="en">EN</button>
          </div>
        </nav>
      </div>`;

    i18n.apply();
    highlightActive();

    // Re-label the dynamic page links whenever the language changes. Listening for
    // the shared `i18n:change` event (fired by i18n.setLang) means this works no
    // matter which button/element triggered the switch.
    document.addEventListener('i18n:change', () => {
      menuPages.forEach((p) => {
        const link = mount.querySelector(`[data-page-link="${p.slug}"]`);
        if (link) link.textContent = i18n.pick(p, 'title');
      });
    });
  }

  function highlightActive() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    let key = 'home';
    if (path === 'news.html' || path === 'news-detail.html') key = 'news';
    if (path === 'page.html') {
      const params = new URLSearchParams(window.location.search);
      key = params.get('slug') || '';
    }
    document.querySelectorAll('[data-page-link]').forEach((el) => {
      el.classList.toggle('active', el.getAttribute('data-page-link') === key);
    });
  }

  function injectFooter(siteName) {
    const mount = document.getElementById('site-footer');
    if (!mount) return;
    const year = new Date().getFullYear();
    mount.innerHTML = `
      <div class="wrap">
        <span>&copy; ${year} ${escapeHtml(siteName.am)} / ${escapeHtml(siteName.en)} — <span data-i18n="footer_rights"></span></span>
        <a href="/admin/login.html" data-i18n="admin_link"></a>
      </div>`;
    i18n.apply();
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  return { injectHeader, injectFooter, ORNAMENT_SVG, escapeHtml };
})();
