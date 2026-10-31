(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* split headings into masked words (text nodes only, keeps links intact) */
  document.querySelectorAll('[data-split]').forEach((el) => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'w';
            const inner = document.createElement('span');
            inner.className = 'w__i';
            inner.style.setProperty('--i', i++);
            inner.textContent = part;
            w.appendChild(inner);
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE && !child.classList.contains('w')) {
          if (child.classList.contains('statement__tag')) {
            child.classList.add('w__i');
            child.style.setProperty('--i', i++);
            const w = document.createElement('span');
            w.className = 'w';
            child.replaceWith(w);
            w.appendChild(child);
          } else {
            walk(child);
          }
        }
      });
    };
    walk(el);
  });

  /* load-in */
  const heroImg = document.querySelector('.hero__media img');
  const ready = () => requestAnimationFrame(() => root.classList.add('is-loaded'));
  if (heroImg && !heroImg.complete) {
    heroImg.addEventListener('load', ready, { once: true });
    heroImg.addEventListener('error', ready, { once: true });
    setTimeout(ready, 2500);
  } else {
    ready();
  }

  /* scroll reveals */
  const revealables = document.querySelectorAll('[data-reveal], [data-split]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
    revealables.forEach((el) => {
      const siblings = el.parentElement ? [...el.parentElement.children].filter((c) => c.hasAttribute('data-reveal')) : [];
      const idx = siblings.indexOf(el);
      if (idx > 0) el.style.setProperty('--delay', `${Math.min(idx, 6) * 0.08}s`);
      io.observe(el);
    });
  } else {
    revealables.forEach((el) => el.classList.add('is-in'));
  }

  /* hero statement waits for the banner */
  const statement = document.querySelector('.statement');
  if (statement) statement.style.setProperty('--delay', '.35s');

  /* parallax + masthead, transforms only, one rAF per frame */
  const mast = document.querySelector('[data-mast]');
  const heroMedia = document.querySelector('[data-parallax]');
  const drift = document.querySelector('[data-drift]');
  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;

    if (!reduce.matches) {
      [[heroMedia, 5, ''], [drift, 6, ' scale(1.12)']].forEach(([el, amt, extra]) => {
        if (!el) return;
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.transform = `translate3d(0, ${(p * -amt).toFixed(2)}%, 0)${extra}`;
      });
    }

    if (mast) {
      const down = y > lastY;
      mast.classList.toggle('is-hidden', down && y > vh * 0.6);
    }
    lastY = y;
  };

  const onScroll = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  reduce.addEventListener?.('change', () => {
    if (heroMedia) heroMedia.style.transform = '';
    if (drift) drift.style.transform = '';
    onScroll();
  });
  update();

  /* fit footer wordmark to the column */
  const fitEl = document.querySelector('[data-fit]');
  const fit = () => {
    if (!fitEl) return;
    const box = fitEl.parentElement;
    const cs = getComputedStyle(box);
    const avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    box.style.fontSize = '';
    const size = parseFloat(getComputedStyle(box).fontSize);
    box.style.fontSize = `${(size * avail / fitEl.offsetWidth).toFixed(2)}px`;
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit); else fit();
  window.addEventListener('resize', fit, { passive: true });

  /* current section in nav */
  const links = [...document.querySelectorAll('.mast__nav a')];
  if ('IntersectionObserver' in window && links.length) {
    const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const link = map.get(e.target.id);
        if (!link) return;
        if (e.isIntersecting) {
          links.forEach((l) => l.removeAttribute('aria-current'));
          link.setAttribute('aria-current', 'true');
        } else if (link.getAttribute('aria-current')) {
          link.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }
})();
