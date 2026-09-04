async function renderPage() {
  const container = document.getElementById('page-body');
  const slug = new URLSearchParams(window.location.search).get('slug');
  if (!slug) {
    container.innerHTML = `<p class="empty-state" data-i18n="no_news"></p>`;
    i18n.apply();
    return;
  }
  try {
    const page = await API.page(slug);
    const title = i18n.pick(page, 'title');
    const content = i18n.pick(page, 'content');
    document.getElementById('page-title').textContent = title;
    // The Hierarchy page's content is a normal nested <ul>/<li> list (built in the
    // admin rich editor with the Indent/Outdent buttons); adding the `tree` class
    // renders it as a connected tree instead of plain bullets. See style.css.
    const isTree = slug === 'hierarchy';
    container.innerHTML = `
      <div class="page-content">
        <h1>${Layout.escapeHtml(title)}</h1>
        <div class="content-body${isTree ? ' tree' : ''}">${content}</div>
      </div>`;
  } catch (e) {
    container.innerHTML = `<p class="empty-state">${e.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initPage({ onRender: renderPage });
});
