(() => {
  if (window.location.protocol !== 'file:') return;

  const root = document.body;
  const storageKey = 'pirate-theme-v2';
  const isTheme = (value) => value === 'day' || value === 'night';
  const readSavedTheme = () => {
    try { return localStorage.getItem(storageKey); } catch { return null; }
  };
  const writeSavedTheme = (theme) => {
    try { localStorage.setItem(storageKey, theme); } catch {}
  };
  const syncLocalLinks = (theme) => {
    document.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      const target = new URL(href, window.location.href);
      if (target.protocol !== 'file:' || !target.pathname.endsWith('.html')) return;
      target.searchParams.set('theme', theme);
      link.href = target.href;
    });
  };
  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    document.querySelectorAll('[data-theme-view]').forEach((view) => {
      view.hidden = view.dataset.themeView !== theme;
    });
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.setAttribute('aria-label', theme === 'day' ? '当前日航，切换到夜航主题' : '当前夜航，切换到日航主题');
    });
    syncLocalLinks(theme);
  };

  const queryTheme = new URLSearchParams(window.location.search).get('theme');
  const savedTheme = readSavedTheme();
  const initialTheme = isTheme(queryTheme) ? queryTheme : (isTheme(savedTheme) ? savedTheme : (isTheme(root.dataset.theme) ? root.dataset.theme : 'day'));
  applyTheme(initialTheme);
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      root.dataset.themeMotion = 'switched';
      const nextTheme = root.dataset.theme === 'day' ? 'night' : 'day';
      writeSavedTheme(nextTheme);
      applyTheme(nextTheme);
    });
  });
})();
