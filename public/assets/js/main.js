/* Afterglow Spa — age gate, navigation and GSAP/ScrollTrigger choreography. */
(function () {
  'use strict';

  var AGE_KEY = 'afterglow-age-confirmed';
  var AGE_CONFIRMED_EVENT = 'afterglow:age-confirmed';
  var SCROLLED_OFFSET = 24;
  var DESKTOP_NAV_QUERY = '(min-width: 921px)';
  var REVEAL_START = 'top 88%';
  var STEP_LIT_START = 'top 62%';
  var WORD_DIM_OPACITY = 0.14;
  var MOTION = Object.freeze({
    introDelay: 0.15, lineDuration: 1.35, lineStagger: 0.11, itemsAt: 0.45,
    introDuration: 1.2, introStagger: 0.1, introOffsetY: 30,
    revealDuration: 1.1, revealStagger: 0.09, revealOffsetY: 36,
    wordStagger: 0.05, wordScrub: 0.6, lineScrub: 0.8,
    // Numeric scrub = eased catch-up; avoids stepping with each mouse-wheel notch.
    parallaxScrub: 1, parallaxPercent: 12, parallaxStagger: 0.04,
    heroScrub: 0.6, heroDriftPercent: -14, heroFadeTo: 0.2, heroVisualDriftPercent: 10,
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
      if (!root.classList.contains('age-ok')) {
        root.classList.add('age-ok'); // no gate on this page: nothing to wait for
        document.dispatchEvent(new CustomEvent(AGE_CONFIRMED_EVENT));
      }
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
      document.dispatchEvent(new CustomEvent(AGE_CONFIRMED_EVENT)); // glow.js waits for this
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
    var scrolled = null;
    var update = function () {
      var next = window.scrollY > SCROLLED_OFFSET;
      if (next === scrolled) return; // only touch the DOM when the state flips
      scrolled = next;
      header.classList.toggle('is-scrolled', next);
    };
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
    var lines = document.querySelectorAll('[data-hero-line]');
    var items = document.querySelectorAll('[data-hero-item]');
    var tl = gsap.timeline({ delay: MOTION.introDelay });
    if (lines.length) {
      tl.fromTo(lines, { yPercent: 105 }, {
        yPercent: 0, duration: MOTION.lineDuration, ease: 'power4.out', stagger: MOTION.lineStagger,
      }, 0);
    }
    if (items.length) {
      tl.fromTo(items, { opacity: 0, y: MOTION.introOffsetY }, {
        opacity: 1, y: 0, duration: MOTION.introDuration, ease: 'power3.out', stagger: MOTION.introStagger,
      }, lines.length ? MOTION.itemsAt : 0);
    }
  }

  function animateReveals(gsap, ScrollTrigger) {
    var els = gsap.utils.toArray('[data-reveal]');
    if (!els.length) return;
    gsap.set(els, { opacity: 0, y: MOTION.revealOffsetY });
    ScrollTrigger.batch(els, {
      start: REVEAL_START,
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, {
          opacity: 1, y: 0, duration: MOTION.revealDuration, ease: 'power3.out', stagger: MOTION.revealStagger,
          overwrite: true, clearProps: 'transform', // hand transform back to CSS hover states
        });
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

  function animateJourney(gsap, ScrollTrigger) {
    var fill = document.querySelector('[data-journey-fill]');
    if (fill) {
      gsap.fromTo(fill, { scaleY: 0 }, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: '[data-journey]', start: 'top 60%', end: 'bottom 70%', scrub: MOTION.lineScrub },
      });
    }
    gsap.utils.toArray('.journey__step').forEach(function (step) {
      ScrollTrigger.create({
        trigger: step,
        start: STEP_LIT_START,
        onEnter: function () { step.classList.add('is-lit'); },
        onLeaveBack: function () { step.classList.remove('is-lit'); },
      });
    });
  }

  function animateParallax(gsap) {
    gsap.utils.toArray('[data-parallax]').forEach(function (el) {
      gsap.fromTo(el.children, { yPercent: MOTION.parallaxPercent }, {
        yPercent: -MOTION.parallaxPercent,
        ease: 'none',
        stagger: MOTION.parallaxStagger,
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: MOTION.parallaxScrub },
      });
    });
  }

  function animateHeroDrift(gsap) {
    var heroScroll = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: MOTION.heroScrub };
    var content = document.querySelector('.hero__content');
    if (content) {
      gsap.to(content, { yPercent: MOTION.heroDriftPercent, opacity: MOTION.heroFadeTo, ease: 'none', scrollTrigger: heroScroll });
    }
    var visual = document.querySelector('[data-hero-visual]');
    if (visual) {
      gsap.to(visual, { yPercent: MOTION.heroVisualDriftPercent, ease: 'none', scrollTrigger: heroScroll });
    }
  }

  var ANIMATED_SELECTORS = '[data-hero-item], [data-hero-line], [data-reveal], .word, [data-journey-fill], .hero__content, [data-hero-visual]';

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
      var heroItems = document.querySelectorAll('[data-hero-item]');
      var heroLines = document.querySelectorAll('[data-hero-line]'); // home page only
      if (heroItems.length) gsap.set(heroItems, { opacity: 0 });
      if (heroLines.length) gsap.set(heroLines, { yPercent: 105 });
      animateReveals(gsap, ScrollTrigger);
      animateManifesto(gsap);
      animateJourney(gsap, ScrollTrigger);
      animateParallax(gsap);
      animateHeroDrift(gsap);
    } catch (err) {
      console.error('Afterglow: animation setup failed — showing content without motion.', err);
      ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
      gsap.set(ANIMATED_SELECTORS, { clearProps: 'all' });
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
