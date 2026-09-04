document.addEventListener('DOMContentLoaded', () => {
  initPage({
    onRender: async () => {
      await renderNewsTicker('news-ticker', 6);
      await renderNewsList(null);
    },
  });
});
