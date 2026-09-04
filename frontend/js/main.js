const SITE_NAME = { am: 'ቤተ ክርስቲያናችን', en: 'Our Church' };

function formatDate(iso) {
  const d = new Date(iso);
  const locale = i18n.lang() === 'am' ? 'am-ET' : 'en-US';
  try {
    return d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (e) {
    return d.toLocaleDateString();
  }
}

function newsItemMarkup(item) {
  const title = i18n.pick(item, 'title');
  const summary = i18n.pick(item, 'summary');
  return `
    <li>
      <h3><a href="/news-detail.html?id=${item.id}">${Layout.escapeHtml(title)}</a></h3>
      <p class="meta">${i18n.t('published_on')} ${formatDate(item.date)} — ${i18n.t('by')} ${Layout.escapeHtml(item.author)}</p>
      ${summary ? `<p class="summary">${Layout.escapeHtml(summary)}</p>` : ''}
      <a class="read-more" href="/news-detail.html?id=${item.id}">${i18n.t('read_more')} &rsaquo;</a>
    </li>`;
}

async function renderNewsList(limit) {
  const list = document.getElementById('news-list');
  try {
    let items = await API.news();
    if (!items.length) {
      list.innerHTML = `<li class="empty-state" data-i18n="no_news"></li>`;
      i18n.apply();
      return;
    }
    if (limit) items = items.slice(0, limit);
    list.innerHTML = items.map(newsItemMarkup).join('');
  } catch (e) {
    list.innerHTML = `<li class="empty-state">${e.message}</li>`;
  }
}

// Auto-scrolling "latest news" ticker: newest posts first, scrolling themselves
// upward in a continuous loop. Pauses while the user hovers or touches it.
async function renderNewsTicker(containerId, limit) {
  const ticker = document.getElementById(containerId);
  if (!ticker) return;
  const track = ticker.querySelector('.news-ticker-track');
  const list = track.querySelector('.news-list') || track;

  let items;
  try {
    items = await API.news();
  } catch (e) {
    list.innerHTML = `<li class="empty-state">${Layout.escapeHtml(e.message)}</li>`;
    return;
  }

  if (!items.length) {
    list.innerHTML = `<li class="empty-state" data-i18n="no_news"></li>`;
    i18n.apply();
    return;
  }

  if (limit) items = items.slice(0, limit);
  // Duplicate the list once so the scroll can loop back to the top seamlessly.
  list.innerHTML = items.map(newsItemMarkup).join('') + items.map(newsItemMarkup).join('');

  startTickerAutoScroll(ticker, track);
}

function startTickerAutoScroll(viewport, track) {
  if (track._tickerRunning) return;
  track._tickerRunning = true;

  let offset = 0;
  let paused = false;
  const speed = 0.35; // pixels per animation frame, gentle and readable

  viewport.addEventListener('mouseenter', () => { paused = true; });
  viewport.addEventListener('mouseleave', () => { paused = false; });
  viewport.addEventListener('touchstart', () => { paused = true; }, { passive: true });
  viewport.addEventListener('touchend', () => { paused = false; });

  function step() {
    if (!paused) {
      offset += speed;
      const halfHeight = track.scrollHeight / 2;
      if (halfHeight > 0 && offset >= halfHeight) {
        offset = 0; // we duplicated the items, so this loop point is seamless
      }
      track.style.transform = `translateY(${-offset}px)`;
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

async function renderPageLinks() {
  const ul = document.getElementById('page-links');
  try {
    const pages = (await API.pages()).filter((p) => p.showInMenu);
    ul.innerHTML = pages
      .map((p) => `<li><a href="/page.html?slug=${encodeURIComponent(p.slug)}">${Layout.escapeHtml(i18n.pick(p, 'title'))}</a></li>`)
      .join('') || '';
  } catch (e) {
    ul.innerHTML = '';
  }
}

// Shared bootstrap used by every public page: injects header/footer and wires the
// language switch to re-render whatever page-specific content function is passed in.
async function initPage({ onRender } = {}) {
  await Layout.injectHeader(SITE_NAME);
  Layout.injectFooter(SITE_NAME);
  await renderPageLinks();
  if (onRender) await onRender();

  // The lang buttons themselves are wired by i18n.js (event delegation, so it
  // doesn't matter that the header was injected after this script loaded). We
  // just need to re-render whatever depends on the chosen language.
  document.addEventListener('i18n:change', async () => {
    await renderPageLinks();
    if (onRender) await onRender();
  });
}
