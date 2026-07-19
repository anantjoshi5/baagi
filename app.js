(() => {
  const body = document.body;
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.getElementById('primary-navigation');
  const themeToggle = document.querySelector('[data-theme-toggle]');

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isOpen));
      nav.classList.toggle('open', !isOpen);
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
    }));
  }

  const savedTheme = localStorage.getItem('baagi-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) body.classList.add('dark');

  const syncThemeButton = () => {
    if (!themeToggle) return;
    const dark = body.classList.contains('dark');
    themeToggle.setAttribute('aria-pressed', String(dark));
    themeToggle.setAttribute('title', dark ? 'Use light theme' : 'Use dark theme');
  };
  syncThemeButton();
  if (themeToggle) themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark');
    localStorage.setItem('baagi-theme', body.classList.contains('dark') ? 'dark' : 'light');
    syncThemeButton();
  });

  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    link.rel = 'noopener noreferrer';
  });

  const progress = document.querySelector('[data-reading-progress]');
  if (progress) {
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? Math.min(100, Math.max(0, (doc.scrollTop / max) * 100)) : 0;
      progress.style.width = `${pct}%`;
    };
    update();
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
  }
})();
