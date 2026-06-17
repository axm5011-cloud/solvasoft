(function () {
  'use strict';

  const header = document.getElementById('header');
  const nav = document.getElementById('nav');
  const menuToggle = document.getElementById('menuToggle');
  const toTop = document.getElementById('toTop');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const sections = navLinks
    .map(l => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);

  /* ---- Header shrink + back-to-top on scroll ---- */
  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 30);
    toTop.classList.toggle('show', y > 500);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  menuToggle.addEventListener('click', function () {
    const open = nav.classList.toggle('open');
    menuToggle.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.classList.contains('nav-link')) {
      nav.classList.remove('open');
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---- Back to top ---- */
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---- Scroll reveal ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---- Active nav link via scroll spy ---- */
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === id));
        }
      });
    }, { threshold: 0.5 });
    sections.forEach(s => spy.observe(s));
  }

  /* ---- Card spotlight follow cursor ---- */
  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ============================================================
     Language toggle (AR <-> EN) — real, full-page translation
     ============================================================ */
  const i18nEls = Array.from(document.querySelectorAll('[data-en]'));
  // Cache the original Arabic markup for each element.
  i18nEls.forEach(el => { el.dataset.ar = el.innerHTML.trim(); });

  const langBtn = document.getElementById('langBtn');
  const htmlEl = document.documentElement;

  function setLang(lang) {
    const en = lang === 'en';
    i18nEls.forEach(el => {
      el.innerHTML = en ? el.dataset.en : el.dataset.ar;
    });
    htmlEl.lang = en ? 'en' : 'ar';
    htmlEl.dir = en ? 'ltr' : 'rtl';
    htmlEl.classList.toggle('lang-en', en);
    if (langBtn) {
      langBtn.textContent = en ? 'ع' : 'EN';
      langBtn.setAttribute('aria-label', en ? 'التبديل للعربية' : 'Switch to English');
    }
    try { localStorage.setItem('solva-lang', lang); } catch (e) {}
  }

  if (langBtn) {
    langBtn.addEventListener('click', function () {
      setLang(htmlEl.dir === 'rtl' ? 'en' : 'ar');
    });
  }
  // Restore saved language preference.
  try {
    if (localStorage.getItem('solva-lang') === 'en') setLang('en');
  } catch (e) {}

  /* ============================================================
     Custom cursor (desktop / fine-pointer devices only)
     ============================================================ */
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (finePointer) {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (dot && ring) {
      document.body.classList.add('has-custom-cursor');
      let mx = window.innerWidth / 2, my = window.innerHeight / 2;
      let rx = mx, ry = my;
      let visible = false;
      let running = false;

      // Ring trails the dot with easing — only animates while catching up,
      // then idles (so the page can settle / screenshots can capture).
      function loop() {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
        if (Math.abs(mx - rx) > 0.3 || Math.abs(my - ry) > 0.3) {
          requestAnimationFrame(loop);
        } else {
          running = false;
        }
      }
      function startLoop() {
        if (!running) { running = true; requestAnimationFrame(loop); }
      }

      window.addEventListener('mousemove', function (e) {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
        if (!visible) {
          visible = true;
          dot.classList.add('on');
          ring.classList.add('on');
        }
        startLoop();
      }, { passive: true });

      window.addEventListener('mouseout', function (e) {
        if (!e.relatedTarget) {
          visible = false;
          dot.classList.remove('on');
          ring.classList.remove('on');
        }
      });

      // Grow over interactive elements.
      const interactive = 'a, button, .card, .nav-link, .lang-btn, [role="button"]';
      document.addEventListener('mouseover', function (e) {
        if (e.target.closest(interactive)) ring.classList.add('hover');
      });
      document.addEventListener('mouseout', function (e) {
        if (e.target.closest(interactive)) ring.classList.remove('hover');
      });
      document.addEventListener('mousedown', () => ring.classList.add('down'));
      document.addEventListener('mouseup', () => ring.classList.remove('down'));
    }
  }
})();
