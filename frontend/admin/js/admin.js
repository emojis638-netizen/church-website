AdminAPI.requireAuth();

document.getElementById('who').textContent = AdminAPI.username();
document.getElementById('logout-btn').addEventListener('click', () => {
  AdminAPI.clearSession();
  window.location.href = '/admin/login.html';
});

/* ---------------- Tabs ---------------- */
const tabs = ['news', 'pages', 'settings'];
document.querySelectorAll('.admin-tabs button').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-tabs button').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    tabs.forEach((t) => {
      document.getElementById(`tab-${t}`).style.display = t === btn.dataset.tab ? 'block' : 'none';
    });
  });
});

function showMsg(elId, text, kind) {
  const el = document.getElementById(elId);
  el.innerHTML = text ? `<div class="msg ${kind}">${text}</div>` : '';
}

function fmtDate(iso) {
  const locale = i18n.lang() === 'am' ? 'am-ET' : 'en-US';
  try {
    return new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return new Date(iso).toLocaleDateString();
  }
}

/* ================= NEWS ================= */
let newsBodyAm, newsBodyEn, editingNewsId = null;

async function loadNewsList() {
  const list = document.getElementById('news-list');
  list.innerHTML = `<p class="empty-state">${i18n.t('adm_loading')}</p>`;
  try {
    const items = await AdminAPI.news();
    if (!items.length) {
      list.innerHTML = `<p class="empty-state">${i18n.t('adm_no_news')}</p>`;
      return;
    }
    list.innerHTML = items.map((n) => `
      <div class="list-row">
        <div class="info">
          <strong>${n.title_am || n.title_en}</strong>
          <span>${fmtDate(n.date)} · ${n.published ? i18n.t('adm_published') : i18n.t('adm_draft')}</span>
        </div>
        <div class="row-actions">
          <button data-edit="${n.id}">${i18n.t('adm_edit')}</button>
          <button class="danger" data-delete="${n.id}">${i18n.t('adm_delete')}</button>
        </div>
      </div>`).join('');
    list.querySelectorAll('[data-edit]').forEach((b) =>
      b.addEventListener('click', () => openNewsForm(Number(b.dataset.edit))));
    list.querySelectorAll('[data-delete]').forEach((b) =>
      b.addEventListener('click', () => deleteNews(Number(b.dataset.delete))));
  } catch (e) {
    list.innerHTML = `<p class="empty-state">${e.message}</p>`;
  }
}

async function deleteNews(id) {
  if (!confirm(i18n.t('adm_confirm_delete_news'))) return;
  try {
    await AdminAPI.deleteNews(id);
    loadNewsList();
  } catch (e) {
    alert(e.message);
  }
}

function resetNewsForm() {
  document.getElementById('news-form').reset();
  document.getElementById('n-image-url').value = '';
  document.getElementById('n-image-preview').innerHTML = '';
  newsBodyAm.setHTML('');
  newsBodyEn.setHTML('');
  document.getElementById('n-published').checked = true;
  showMsg('news-msg', '', '');
  editingNewsId = null;
}

async function openNewsForm(id) {
  document.getElementById('news-list-view').style.display = 'none';
  document.getElementById('news-form-view').style.display = 'block';
  resetNewsForm();

  if (id) {
    editingNewsId = id;
    document.getElementById('news-form-title').textContent = i18n.t('adm_edit_news_title');
    try {
      const n = await AdminAPI.newsItem(id);
      document.getElementById('n-title-am').value = n.title_am || '';
      document.getElementById('n-title-en').value = n.title_en || '';
      document.getElementById('n-summary-am').value = n.summary_am || '';
      document.getElementById('n-summary-en').value = n.summary_en || '';
      newsBodyAm.setHTML(n.body_am || '');
      newsBodyEn.setHTML(n.body_en || '');
      document.getElementById('n-author').value = n.author || 'Admin';
      document.getElementById('n-published').checked = !!n.published;
      if (n.image) {
        document.getElementById('n-image-url').value = n.image;
        document.getElementById('n-image-preview').innerHTML = `<img src="${n.image}" style="max-width:220px;border-radius:4px;">`;
      }
    } catch (e) {
      showMsg('news-msg', e.message, 'error');
    }
  } else {
    document.getElementById('news-form-title').textContent = i18n.t('adm_add_news_title');
  }
}

function closeNewsForm() {
  document.getElementById('news-form-view').style.display = 'none';
  document.getElementById('news-list-view').style.display = 'block';
  loadNewsList();
}

document.getElementById('add-news-btn').addEventListener('click', () => openNewsForm(null));
document.getElementById('news-cancel-btn').addEventListener('click', closeNewsForm);

document.getElementById('n-image-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const preview = document.getElementById('n-image-preview');
  preview.innerHTML = `<span class="empty-state">${i18n.t('adm_uploading')}</span>`;
  try {
    const url = await AdminAPI.uploadImage(file);
    document.getElementById('n-image-url').value = url;
    preview.innerHTML = `<img src="${url}" style="max-width:220px;border-radius:4px;">`;
  } catch (err) {
    preview.innerHTML = `<span class="empty-state">${err.message}</span>`;
  }
});

document.getElementById('news-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    title_am: document.getElementById('n-title-am').value.trim(),
    title_en: document.getElementById('n-title-en').value.trim(),
    summary_am: document.getElementById('n-summary-am').value.trim(),
    summary_en: document.getElementById('n-summary-en').value.trim(),
    body_am: newsBodyAm.getHTML(),
    body_en: newsBodyEn.getHTML(),
    image: document.getElementById('n-image-url').value || null,
    author: document.getElementById('n-author').value.trim() || 'Admin',
    published: document.getElementById('n-published').checked,
  };
  if (!payload.title_am && !payload.title_en) {
    showMsg('news-msg', i18n.t('adm_title_required'), 'error');
    return;
  }
  try {
    if (editingNewsId) await AdminAPI.updateNews(editingNewsId, payload);
    else await AdminAPI.createNews(payload);
    closeNewsForm();
  } catch (e) {
    showMsg('news-msg', e.message, 'error');
  }
});

/* ================= PAGES ================= */
let pageContentAm, pageContentEn, editingPageId = null;

async function loadPagesList() {
  const list = document.getElementById('pages-list');
  list.innerHTML = `<p class="empty-state">${i18n.t('adm_loading')}</p>`;
  try {
    const pages = (await AdminAPI.pages()).sort((a, b) => a.order - b.order);
    if (!pages.length) {
      list.innerHTML = `<p class="empty-state">${i18n.t('adm_no_pages')}</p>`;
      return;
    }
    list.innerHTML = pages.map((p) => `
      <div class="list-row">
        <div class="info">
          <strong>${p.title_am || p.title_en} ${p.isSystem ? `· <span class="hint">${i18n.t('adm_core_page').replace(/^·\s*/, '')}</span>` : ''}</strong>
          <span>/${p.slug} · ${p.showInMenu ? i18n.t('adm_in_menu') : i18n.t('adm_hidden_menu')}</span>
        </div>
        <div class="row-actions">
          <button data-edit="${p.id}">${i18n.t('adm_edit')}</button>
          ${p.isSystem ? '' : `<button class="danger" data-delete="${p.id}">${i18n.t('adm_delete')}</button>`}
        </div>
      </div>`).join('');
    list.querySelectorAll('[data-edit]').forEach((b) =>
      b.addEventListener('click', () => openPageForm(Number(b.dataset.edit))));
    list.querySelectorAll('[data-delete]').forEach((b) =>
      b.addEventListener('click', () => deletePage(Number(b.dataset.delete))));
  } catch (e) {
    list.innerHTML = `<p class="empty-state">${e.message}</p>`;
  }
}

async function deletePage(id) {
  if (!confirm(i18n.t('adm_confirm_delete_page'))) return;
  try {
    await AdminAPI.deletePage(id);
    loadPagesList();
  } catch (e) {
    alert(e.message);
  }
}

function resetPageForm() {
  document.getElementById('page-form').reset();
  pageContentAm.setHTML('');
  pageContentEn.setHTML('');
  document.getElementById('p-show-menu').checked = true;
  showMsg('page-msg', '', '');
  editingPageId = null;
}

async function openPageForm(id) {
  document.getElementById('pages-list-view').style.display = 'none';
  document.getElementById('page-form-view').style.display = 'block';
  resetPageForm();

  if (id) {
    editingPageId = id;
    document.getElementById('page-form-title').textContent = i18n.t('adm_edit_page_title');
    try {
      const pages = await AdminAPI.pages();
      const p = pages.find((x) => x.id === id);
      document.getElementById('p-title-am').value = p.title_am || '';
      document.getElementById('p-title-en').value = p.title_en || '';
      pageContentAm.setHTML(p.content_am || '');
      pageContentEn.setHTML(p.content_en || '');
      document.getElementById('p-show-menu').checked = !!p.showInMenu;
    } catch (e) {
      showMsg('page-msg', e.message, 'error');
    }
  } else {
    document.getElementById('page-form-title').textContent = i18n.t('adm_add_page_title');
  }
}

function closePageForm() {
  document.getElementById('page-form-view').style.display = 'none';
  document.getElementById('pages-list-view').style.display = 'block';
  loadPagesList();
}

document.getElementById('add-page-btn').addEventListener('click', () => openPageForm(null));
document.getElementById('page-cancel-btn').addEventListener('click', closePageForm);

document.getElementById('page-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    title_am: document.getElementById('p-title-am').value.trim(),
    title_en: document.getElementById('p-title-en').value.trim(),
    content_am: pageContentAm.getHTML(),
    content_en: pageContentEn.getHTML(),
    showInMenu: document.getElementById('p-show-menu').checked,
  };
  if (!payload.title_am && !payload.title_en) {
    showMsg('page-msg', i18n.t('adm_title_required'), 'error');
    return;
  }
  try {
    if (editingPageId) await AdminAPI.updatePage(editingPageId, payload);
    else await AdminAPI.createPage(payload);
    closePageForm();
  } catch (e) {
    showMsg('page-msg', e.message, 'error');
  }
});

/* ================= SETTINGS ================= */
document.getElementById('settings-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const current = document.getElementById('s-current').value;
  const next = document.getElementById('s-new').value;
  try {
    await AdminAPI.changePassword(current, next);
    showMsg('settings-msg', i18n.t('adm_password_updated'), 'success');
    document.getElementById('settings-form').reset();
  } catch (e) {
    showMsg('settings-msg', e.message, 'error');
  }
});

/* ================= LANGUAGE ================= */
// The AM/EN buttons in the admin header are wired by i18n.js itself (event
// delegation + i18n:change event). Here we just refresh whichever list is
// currently visible so translated labels (Edit/Delete/Published/etc) update
// immediately instead of only on next reload.
document.addEventListener('i18n:change', () => {
  if (document.getElementById('news-list-view').style.display !== 'none') loadNewsList();
  if (document.getElementById('pages-list-view').style.display !== 'none') loadPagesList();
});

/* ================= INIT ================= */
(function init() {
  newsBodyAm = createRichEditor(document.getElementById('n-body-am-editor'), '');
  newsBodyEn = createRichEditor(document.getElementById('n-body-en-editor'), '');
  pageContentAm = createRichEditor(document.getElementById('p-content-am-editor'), '');
  pageContentEn = createRichEditor(document.getElementById('p-content-en-editor'), '');
  loadNewsList();
  loadPagesList();
})();
