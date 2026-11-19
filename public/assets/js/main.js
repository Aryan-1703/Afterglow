/* Afterglow Spa — age gate, navigation and GSAP/ScrollTrigger choreography. */
(function () {
  'use strict';

  var AGE_KEY = 'afterglow-age-confirmed';
  var SCROLLED_OFFSET = 24;
  var DESKTOP_NAV_QUERY = '(min-width: 921px)';
  var REVEAL_START = 'top 86%';
  var WORD_DIM_OPACITY = 0.14;
  var MOTION = Object.freeze({
    introDuration: 1.3, introStagger: 0.12, introOffsetY: 34, introDelay: 0.1,
    revealDuration: 1.1, revealStagger: 0.1, revealOffsetY: 40,
    wordStagger: 0.05, wordScrub: 0.6, lineScrub: 0.8,
    parallaxPercent: 12, parallaxStagger: 0.04, heroDriftPercent: -14, heroFadeTo: 0.2,
  });
  var root = document.documentElement;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Storage (may be blocked in private modes) ---------- */
  function rememberAge() {
    try {
      window.localStorage.setItem(AGE_KEY, '1');
    } catch (err) {
      console.warn('Afterglow: could not persist age confirmation; you will be asked again.', err);
    }
  }

  /* ---------- Age gate ---------- */
  var BACKGROUND_SELECTORS = ['.skip-link', '.site-header', 'main', '.site-footer'];

  function setBackgroundInert(isInert) {
    BACKGROUND_SELECTORS.forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el) el.inert = isInert;
    });
  }

  function trapFocus(gate, event) {
    if (event.key !== 'Tab') return;
    var focusables = gate.querySelectorAll('button, a[href]');
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function initAgeGate(onConfirmed) {
    var gate = document.querySelector('[data-age-gate]');
    if (!gate || root.classList.contains('age-ok')) {
      onConfirmed();
      return;
    }
    setBackgroundInert(true);
    var confirmBtn = gate.querySelector('[data-age-confirm]');
    confirmBtn.focus();
    gate.addEventListener('keydown', function (e) { trapFocus(gate, e); });
    confirmBtn.addEventListener('click', function () {
      rememberAge();
      root.classList.add('age-ok');
      setBackgroundInert(false);
      var main = document.getElementById('main');
      if (main) {
        main.setAttribute('tabindex', '-1');
        main.focus({ preventScroll: true });
      }
      onConfirmed();
    });
  }

  /* ---------- Navigation ---------- */
  function initNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;
    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    }
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    window.matchMedia(DESKTOP_NAV_QUERY).addEventListener('change', function (e) {
      if (e.matches) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  function initHeader() {
    var header = document.querySelector('[data-header]');
    if (!header) return;
    var update = function () { header.classList.toggle('is-scrolled', window.scrollY > SCROLLED_OFFSET); };
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ---------- Animations ---------- */
  function splitWords(el) {
    var text = el.textContent.trim();
    var srCopy = document.createElement('span');
    srCopy.className = 'visually-hidden';
    srCopy.textContent = text;
    var visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    text.split(/\s+/).forEach(function (word, i, all) {
      var span = document.createElement('span');
      span.className = 'word';
      span.textContent = i < all.length - 1 ? word + ' ' : word;
      visual.appendChild(span);
    });
    el.textContent = '';
    el.appendChild(srCopy);
    el.appendChild(visual);
    return visual.querySelectorAll('.word');
  }

  function playIntro(gsap) {
    var items = document.querySelectorAll('[data-hero-item]');
    if (!items.length) return;
    gsap.fromTo(items, { opacity: 0, y: MOTION.introOffsetY }, {
      opacity: 1, y: 0, duration: MOTION.introDuration, ease: 'power3.out', stagger: MOTION.introStagger, delay: MOTION.introDelay,
    });
  }

  function animateReveals(gsap, ScrollTrigger) {
    var els = gsap.utils.toArray('[data-reveal]');
    if (!els.length) return;
    gsap.set(els, { opacity: 0, y: MOTION.revealOffsetY });
    ScrollTrigger.batch(els, {
      start: REVEAL_START,
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, { opacity: 1, y: 0, duration: MOTION.revealDuration, ease: 'power3.out', stagger: MOTION.revealStagger, overwrite: true });
      },
    });
  }

  function animateManifesto(gsap) {
    document.querySelectorAll('[data-words]').forEach(function (el) {
      var words = splitWords(el);
      gsap.fromTo(words, { opacity: WORD_DIM_OPACITY }, {
        opacity: 1,
        ease: 'none',
        stagger: MOTION.wordStagger,
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: MOTION.wordScrub },
      });
    });
  }

  function animateScrubbed(gsap) {
    var fill = document.querySelector('[data-journey-fill]');
    if (fill) {
      gsap.fromTo(fill, { scaleY: 0 }, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: '[data-journey]', start: 'top 60%', end: 'bottom 70%', scrub: MOTION.lineScrub },
      });
    }
    gsap.utils.toArray('[data-parallax]').forEach(function (el) {
      gsap.fromTo(el.children, { yPercent: MOTION.parallaxPercent }, {
        yPercent: -MOTION.parallaxPercent,
        ease: 'none',
        stagger: MOTION.parallaxStagger,
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
    var hero = document.querySelector('.hero__content');
    if (hero) {
      gsap.to(hero, {
        yPercent: MOTION.heroDriftPercent,
        opacity: MOTION.heroFadeTo,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    }
  }

  function initAnimations() {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    root.classList.add('anim-ready');
    if (reducedMotion || !gsap || !ScrollTrigger) {
      if (!reducedMotion) console.warn('Afterglow: GSAP unavailable — animations disabled.');
      return function () {};
    }
    try {
      gsap.registerPlugin(ScrollTrigger);
      gsap.set('[data-hero-item]', { opacity: 0 });
      animateReveals(gsap, ScrollTrigger);
      animateManifesto(gsap);
      animateScrubbed(gsap);
    } catch (err) {
      console.error('Afterglow: animation setup failed — showing content without motion.', err);
      ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
      gsap.set('[data-hero-item], [data-reveal], .word, [data-journey-fill], .hero__content', { clearProps: 'all' });
      return function () {};
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
    return function () {
      ScrollTrigger.refresh(); // the age gate's scroll lock may have shifted trigger positions
      playIntro(gsap);
    };
  }

  /* ---------- Boot ---------- */
  initNav();
  initHeader();
  var startIntro = initAnimations();
  initAgeGate(startIntro);
})();
