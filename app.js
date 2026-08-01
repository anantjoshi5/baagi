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

  const contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    const status = document.querySelector('[data-contact-status]');
    const submitButton = contactForm.querySelector('[data-contact-submit]');
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;

      const endpoint = contactForm.dataset.formEndpoint;
      if (!endpoint || !endpoint.startsWith('https://formspree.io/f/')) {
        if (status) status.textContent = 'Online submission is being activated. For urgent matters, please call +31 6 5398 6097.';
        return;
      }

      const data = new FormData(contactForm);
      const value = (key) => String(data.get(key) || '').trim();
      const subjectContext = value('organisation') || value('name');
      data.set('_subject', `Zwarte Peper enquiry · ${value('work')} · ${subjectContext}`);
      data.set('source', 'Zwarte Peper Consulting website');

      if (submitButton) submitButton.disabled = true;
      contactForm.setAttribute('aria-busy', 'true');
      if (status) status.textContent = 'Sending your enquiry securely…';

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw new Error('Submission failed');
        contactForm.reset();
        if (status) status.textContent = 'Thank you. Your enquiry has been sent successfully.';
      } catch (error) {
        if (status) status.textContent = 'The form could not be sent. Please try again or call +31 6 5398 6097.';
      } finally {
        contactForm.removeAttribute('aria-busy');
        if (submitButton) submitButton.disabled = false;
      }
    });
  }

  const secureExternalLinks = (root = document) => {
    root.querySelectorAll('a[target="_blank"]').forEach((link) => { link.rel = 'noopener noreferrer'; });
  };
  secureExternalLinks();

  const progress = document.querySelector('[data-reading-progress]');
  const updateProgress = () => {
    if (!progress) return;
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? Math.min(100, Math.max(0, (doc.scrollTop / max) * 100)) : 0;
    progress.style.width = `${pct}%`;
  };
  if (progress) {
    updateProgress();
    addEventListener('scroll', updateProgress, { passive: true });
    addEventListener('resize', updateProgress);
  }

  const report = document.querySelector('[data-report-parts]');
  if (report) {
    const parts = report.dataset.reportParts.split(',').map((part) => part.trim()).filter(Boolean);
    Promise.all(parts.map(async (part) => {
      const response = await fetch(part, { credentials: 'same-origin' });
      if (!response.ok) throw new Error(`Could not load ${part}`);
      return response.text();
    })).then((sections) => {
      report.innerHTML = sections.join('');
      secureExternalLinks(report);
      updateProgress();
      if (location.hash) requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView());
    }).catch(() => {
      report.innerHTML = '<div class="source-box"><h3>The report could not be assembled.</h3><p>Please refresh the page. If the problem persists, return to the Insights page and try again.</p></div>';
    });
  }
})();
