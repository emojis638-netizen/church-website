function articleMarkup(item) {
  const title = i18n.pick(item, 'title');
  const body = i18n.pick(item, 'body');
  document.getElementById('page-title').textContent = title;
  return `
    <a class="back-link" href="/news.html">&lsaquo; <span data-i18n="back_to_news"></span></a>
    ${item.image ? `<img class="cover-image" src="${item.image}" alt="">` : ''}
    <header class="article-header">
      <h1>${Layout.escapeHtml(title)}</h1>
      <p class="meta">${i18n.t('published_on')} ${formatDate(item.date)} — ${i18n.t('by')} ${Layout.escapeHtml(item.author)}</p>
    </header>
    <div class="content-body">${body}</div>`;
}

async function renderArticle() {
  const container = document.getElementById('article');
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) {
    container.innerHTML = `<p class="empty-state" data-i18n="no_news"></p>`;
    i18n.apply();
    return;
  }
  try {
    const item = await API.newsItem(id);
    container.innerHTML = articleMarkup(item);
    i18n.apply();
  } catch (e) {
    container.innerHTML = `<p class="empty-state">${e.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initPage({ onRender: renderArticle });
});
