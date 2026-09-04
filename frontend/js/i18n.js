// Handles the Amharic <-> English toggle for interface chrome (nav labels, buttons,
// footer, admin dashboard, etc). Page content itself is bilingual per-record and
// picked in each page's own script using i18n.lang() / i18n.pick().
//
// Language buttons are wired with EVENT DELEGATION on `document`, so a [data-lang-btn]
// element works the instant it exists in the DOM -- even if it's injected later
// (e.g. the header/nav, which loads asynchronously after the page fetches its menu).
// No page needs to remember to attach its own click listener.
//
// Whenever the language changes, i18n dispatches a `i18n:change` CustomEvent on
// `document` (detail: { lang }). Any script that renders bilingual content
// (nav links, news lists, admin lists, etc.) should listen for this event and
// re-render, instead of relying on its own click handler on the lang buttons.
const i18n = (() => {
  const STRINGS = {
    am: {
      nav_home: 'መነሻ',
      nav_news: 'ዜናዎች',
      hero_eyebrow: 'እንኳን ወደ ድረ ገጻችን በደህና መጡ',
      hero_title: 'እንኳን ወደ ቤተ ክርስቲያናችን በደህና መጡ',
      site_tagline: 'ዜና፣ ታሪክ እና የቤተ ክርስቲያናችንን መረጃ በቀላሉ ይከታተሉ',
      hero_cta: 'ድረ ገጻችንን ይመልከቱ',
      hero_card_title: 'የድረ ገጻችን አገልግሎቶች',
      hero_card_item1: 'ወቅታዊ ዜናዎችን እና ማስታወቂያዎችን ይከታተሉ',
      hero_card_item2: 'ስለ ቤተ ክርስቲያናችን ታሪክ እና አገልግሎት ይወቁ',
      hero_card_item3: 'ከማንኛውም ቦታ በስልክ ወይም ኮምፒዩተር ይጎብኙ',
      latest_news: 'የቅርብ ጊዜ ዜናዎች',
      breaking: 'የቅርብ ጊዜ',
      view_all_news: 'ሁሉንም ዜናዎች ይመልከቱ',
      read_more: 'ተጨማሪ ያንብቡ',
      back: 'ተመለስ',
      back_to_news: 'ወደ ዜናዎች ተመለስ',
      published_on: 'የታተመው',
      by: 'በ',
      no_news: 'እስካሁን ምንም ዜና አልታተመም።',
      loading: 'በመጫን ላይ...',
      footer_rights: 'ሁሉም መብቶች የተጠበቁ ናቸው።',
      admin_link: 'የአስተዳዳሪ መግቢያ',

      // ---- Admin dashboard chrome ----
      adm_title: 'የቤተ ክርስቲያን ድረ ገጽ — አስተዳደር',
      adm_logout: 'ውጣ',
      adm_tab_news: 'ዜናዎች',
      adm_tab_pages: 'ገጾች',
      adm_tab_settings: 'ማስተካከያ',
      adm_back_to_site: '← ወደ ድረ ገጹ ተመለስ',
      adm_news_heading: 'ዜናዎች',
      adm_news_sub: 'ልጥፎች በዜና ገጹ እና በመነሻ ገጹ ላይ ይታያሉ፣ በቅርብ ጊዜ የታተመው መጀመሪያ።',
      adm_add_news: '+ ዜና ጨምር',
      adm_add_page: '+ ገጽ ጨምር',
      adm_pages_heading: 'ገጾች',
      adm_pages_sub: 'እንደ ታሪክ እና መዋቅር ያሉ ገጾች በምናሌው ውስጥ ይታያሉ። እንደ አስፈላጊነቱ ይጨምሩ።',
      adm_settings_heading: 'ማስተካከያ',
      adm_loading: 'በመጫን ላይ…',
      adm_no_news: 'እስካሁን ምንም ዜና አልተጨመረም።',
      adm_no_pages: 'እስካሁን ምንም ገጽ የለም።',
      adm_edit: 'አስተካክል',
      adm_delete: 'ሰርዝ',
      adm_published: 'ታትሟል',
      adm_draft: 'ረቂቅ',
      adm_in_menu: 'በምናሌ ውስጥ',
      adm_hidden_menu: 'ከምናሌ ተደብቋል',
      adm_core_page: '· ዋና ገጽ',
      adm_add_news_title: 'ዜና ጨምር',
      adm_edit_news_title: 'ዜና አስተካክል',
      adm_add_page_title: 'ገጽ ጨምር',
      adm_edit_page_title: 'ገጽ አስተካክል',
      adm_title_am: 'ርዕስ (አማርኛ)',
      adm_title_en: 'ርዕስ (እንግሊዝኛ)',
      adm_summary_am: 'ማጠቃለያ (አማርኛ)',
      adm_summary_en: 'ማጠቃለያ (እንግሊዝኛ)',
      adm_shown_in_list: 'በዝርዝሩ ውስጥ ይታያል',
      adm_body_am: 'ይዘት (አማርኛ)',
      adm_body_en: 'ይዘት (እንግሊዝኛ)',
      adm_content_am: 'ይዘት (አማርኛ)',
      adm_content_en: 'ይዘት (እንግሊዝኛ)',
      adm_cover_image: 'ሽፋን ምስል',
      adm_optional: 'አማራጭ',
      adm_uploading: 'በመስቀል ላይ…',
      adm_author: 'ደራሲ',
      adm_status: 'ሁኔታ',
      adm_published_visible: 'ታትሟል (በድረ ገጹ ላይ ይታያል)',
      adm_show_in_menu: 'በድረ ገጹ ምናሌ ውስጥ አሳይ',
      adm_save_post: 'ልጥፍ አስቀምጥ',
      adm_save_page: 'ገጽ አስቀምጥ',
      adm_cancel: 'ሰርዝ',
      adm_confirm_delete_news: 'ይህን ዜና ልጥፍ ልሰርዝ? ይህ ወደ ኋላ አይመለስም።',
      adm_confirm_delete_page: 'ይህን ገጽ ልሰርዝ? ይህ ወደ ኋላ አይመለስም።',
      adm_title_required: 'እባክዎ ቢያንስ በአንድ ቋንቋ ርዕስ ይስጡ።',
      adm_current_password: 'የአሁኑ የይለፍ ቃል',
      adm_new_password: 'አዲስ የይለፍ ቃል',
      adm_update_password: 'የይለፍ ቃል አዘምን',
      adm_password_updated: 'የይለፍ ቃል ተዘምኗል።',
      adm_login_title: 'የአስተዳዳሪ መግቢያ',
      adm_login_sub: 'ዜናዎችን እና ገጾችን ለማስተዳደር ይግቡ።',
      adm_setup_title: 'የአስተዳዳሪ መለያ ፍጠር',
      adm_setup_sub: 'እስካሁን የአስተዳዳሪ መለያ የለም። ለመጀመር አንዱን ይፍጠሩ።',
      adm_username: 'የተጠቃሚ ስም',
      adm_password: 'የይለፍ ቃል',
      adm_confirm_password: 'የይለፍ ቃል አረጋግጥ',
      adm_sign_in: 'ግባ',
      adm_create_account: 'መለያ ፍጠር',
      adm_no_server: 'አገልጋዩን ማግኘት አልተቻለም። አገልጋዩ እየሰራ ነው?',
      adm_password_mismatch: 'የይለፍ ቃሎቹ አይመሳሰሉም።',
    },
    en: {
      nav_home: 'Home',
      nav_news: 'News',
      hero_eyebrow: 'Welcome to our website',
      hero_title: 'Welcome to Our Church',
      site_tagline: 'Follow our news, history, and church information with ease',
      hero_cta: 'Explore our website',
      hero_card_title: 'What our website offers',
      hero_card_item1: 'Keep up with the latest news and announcements',
      hero_card_item2: 'Learn about our church history and services',
      hero_card_item3: 'Visit from anywhere, on phone or computer',
      latest_news: 'Latest News',
      breaking: 'Latest',
      view_all_news: 'View all news',
      read_more: 'Read more',
      back: 'Back',
      back_to_news: 'Back to news',
      published_on: 'Published on',
      by: 'By',
      no_news: 'No news has been published yet.',
      loading: 'Loading...',
      footer_rights: 'All rights reserved.',
      admin_link: 'Admin login',

      // ---- Admin dashboard chrome ----
      adm_title: 'Church Website — Admin',
      adm_logout: 'Log out',
      adm_tab_news: 'News',
      adm_tab_pages: 'Pages',
      adm_tab_settings: 'Settings',
      adm_back_to_site: '← Back to site',
      adm_news_heading: 'News',
      adm_news_sub: 'Posts appear on the News page and the homepage, most recent first.',
      adm_add_news: '+ Add news post',
      adm_add_page: '+ Add page',
      adm_pages_heading: 'Pages',
      adm_pages_sub: 'Pages like History and Hierarchy appear in the site menu. Add as many as you need.',
      adm_settings_heading: 'Settings',
      adm_loading: 'Loading…',
      adm_no_news: 'No news posts yet.',
      adm_no_pages: 'No pages yet.',
      adm_edit: 'Edit',
      adm_delete: 'Delete',
      adm_published: 'Published',
      adm_draft: 'Draft',
      adm_in_menu: 'In menu',
      adm_hidden_menu: 'Hidden from menu',
      adm_core_page: '· core page',
      adm_add_news_title: 'Add news post',
      adm_edit_news_title: 'Edit news post',
      adm_add_page_title: 'Add page',
      adm_edit_page_title: 'Edit page',
      adm_title_am: 'Title (Amharic)',
      adm_title_en: 'Title (English)',
      adm_summary_am: 'Summary (Amharic)',
      adm_summary_en: 'Summary (English)',
      adm_shown_in_list: 'shown in the list',
      adm_body_am: 'Body (Amharic)',
      adm_body_en: 'Body (English)',
      adm_content_am: 'Content (Amharic)',
      adm_content_en: 'Content (English)',
      adm_cover_image: 'Cover image',
      adm_optional: 'optional',
      adm_uploading: 'Uploading…',
      adm_author: 'Author',
      adm_status: 'Status',
      adm_published_visible: 'Published (visible on the site)',
      adm_show_in_menu: 'Show in site menu',
      adm_save_post: 'Save post',
      adm_save_page: 'Save page',
      adm_cancel: 'Cancel',
      adm_confirm_delete_news: 'Delete this news post? This cannot be undone.',
      adm_confirm_delete_page: 'Delete this page? This cannot be undone.',
      adm_title_required: 'Please give it a title in at least one language.',
      adm_current_password: 'Current password',
      adm_new_password: 'New password',
      adm_update_password: 'Update password',
      adm_password_updated: 'Password updated.',
      adm_login_title: 'Admin Login',
      adm_login_sub: 'Sign in to manage news and pages.',
      adm_setup_title: 'Create admin account',
      adm_setup_sub: 'No admin account exists yet. Create the first one to get started.',
      adm_username: 'Username',
      adm_password: 'Password',
      adm_confirm_password: 'Confirm password',
      adm_sign_in: 'Sign in',
      adm_create_account: 'Create account',
      adm_no_server: 'Could not reach the server. Is the backend running?',
      adm_password_mismatch: 'Passwords do not match.',
    },
  };

  function lang() {
    return localStorage.getItem('site_lang') || 'am';
  }

  function setLang(l) {
    if (l !== 'am' && l !== 'en') return;
    if (lang() === l) return;
    localStorage.setItem('site_lang', l);
    apply();
    document.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang: l } }));
  }

  function t(key) {
    return (STRINGS[lang()] && STRINGS[lang()][key]) || key;
  }

  // Pick the right field from a bilingual record, e.g. pick(item, 'title') reads
  // item.title_am or item.title_en, falling back to whichever exists.
  function pick(record, field) {
    const l = lang();
    const primary = record[`${field}_${l}`];
    const other = record[`${field}_${l === 'am' ? 'en' : 'am'}`];
    return primary && primary.trim() ? primary : other || '';
  }

  function apply() {
    const l = lang();
    document.documentElement.setAttribute('lang', l === 'am' ? 'am' : 'en');
    document.documentElement.setAttribute('data-lang', l);
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });
    document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-lang-btn') === l);
    });
  }

  // Event delegation: this single listener, attached once to `document`, handles
  // every [data-lang-btn] on the page -- including ones injected later (header/nav,
  // admin chrome, etc) -- so no page-specific script needs to wire the buttons itself.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lang-btn]');
    if (!btn) return;
    setLang(btn.getAttribute('data-lang-btn'));
  });

  document.addEventListener('DOMContentLoaded', apply);
  // In case this script runs after DOMContentLoaded already fired.
  if (document.readyState !== 'loading') apply();

  return { lang, setLang, t, pick, apply };
})();
