/* Afterglow Spa — finishing touches: scroll progress, cursor light, magnetic buttons,
   card spotlights, hero portal parallax, scroll-reactive marquee and the footer wordmark.
   Everything is transform/opacity-only and batched to one write per frame. */
(function () {
  'use strict';

  var FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';
  var MAGNET_SELECTOR = '.btn--glow, .btn--ghost';
  var MAGNET_STRENGTH = 0.28;
  var MAGNET_EASE = Object.freeze({ duration: 0.5, ease: 'power3' });
  var GLOW_EASE = Object.freeze({ duration: 0.7, ease: 'power3' });
  var PORTAL_EASE = Object.freeze({ duration: 1.4, ease: 'power3' });
  var PORTAL_SHIFT_PX = 16;
  var PROGRESS_SCRUB = 0.3;
  var MARQUEE_VELOCITY_DIVISOR = 900; // px/s of scroll that adds +1× marquee speed
  var MARQUEE_MAX_BOOST = 4;
  var MARQUEE_SETTLE = 0.06;          // per-frame decay back to cruising speed
  var MARQUEE_RATE_STEP = 0.05;       // only re-time the animation when the rate moves this much
  var FOOTER_MARK_START = 'top 92%';
  var PORTAL_MEDIA_QUERY = '(min-width: 1101px)'; // matches the CSS breakpoint that shows the portal

  var root = document.documentElement;
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia(FINE_POINTER_QUERY).matches;

  /* ---------- Cached geometry ----------
     Rects are re-read lazily after a scroll/resize, never once per frame — reading layout
     inside rAF right after GSAP's scroll writes would force a synchronous reflow. */
  var layoutEpoch = 0;
  function trackLayoutChanges() {
    var bump = function () { layoutEpoch += 1; };
    window.addEventListener('scroll', bump, { passive: true });
    window.addEventListener('resize', bump, { passive: true });
  }
  function cachedRect(read) {
    var rect = null;
    var epoch = -1;
    return function () {
      if (!rect || epoch !== layoutEpoch) {
        rect = read();
        epoch = layoutEpoch;
      }
      return rect;
    };
  }

  /* ---------- Card spotlights: CSS custom properties, written once per frame ---------- */
  function initSpotlights() {
    document.querySelectorAll('[data-spotlight]').forEach(function (el) {
      var rect = cachedRect(function () { return el.getBoundingClientRect(); });
      var frame = 0;
      var mx = 0;
      var my = 0;
      function write() {
        frame = 0;
        el.style.setProperty('--mx', mx.toFixed(0) + 'px');
        el.style.setProperty('--my', my.toFixed(0) + 'px');
      }
      el.addEventListener('pointermove', function (e) {
        var r = rect();
        mx = e.clientX - r.left;
        my = e.clientY - r.top;
        if (!frame) frame = requestAnimationFrame(write);
      }, { passive: true });
    });
  }

  function initScrollProgress() {
    var bar = document.querySelector('[data-progress]');
    if (!bar) return;
    gsap.to(bar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: PROGRESS_SCRUB },
    });
  }

  function initCursorGlow() {
    var glow = document.querySelector('[data-cursor-glow]');
    if (!glow) return;
    var toX = gsap.quickTo(glow, 'x', GLOW_EASE);
    var toY = gsap.quickTo(glow, 'y', GLOW_EASE);
    window.addEventListener('pointermove', function (e) {
      if (!glow.classList.contains('is-active')) glow.classList.add('is-active');
      toX(e.clientX);
      toY(e.clientY);
    }, { passive: true });
    root.addEventListener('pointerleave', function () { glow.classList.remove('is-active'); });
  }

  function initMagnetic() {
    document.querySelectorAll(MAGNET_SELECTOR).forEach(function (btn) {
      var toX = gsap.quickTo(btn, 'x', MAGNET_EASE);
      var toY = gsap.quickTo(btn, 'y', MAGNET_EASE);
      // Resting centre: subtract the magnet's own current offset so re-entry isn't biased.
      var centre = cachedRect(function () {
        var r = btn.getBoundingClientRect();
        return { x: r.left + r.width / 2 - gsap.getProperty(btn, 'x'), y: r.top + r.height / 2 - gsap.getProperty(btn, 'y') };
      });
      btn.addEventListener('pointermove', function (e) {
        var c = centre();
        toX((e.clientX - c.x) * MAGNET_STRENGTH);
        toY((e.clientY - c.y) * MAGNET_STRENGTH);
      }, { passive: true });
      btn.addEventListener('pointerleave', function () {
        toX(0);
        toY(0);
      });
    });
  }

  /* Layers inside the hero portal drift with the pointer, deeper layers further. */
  function initPortalParallax() {
    var layers = Array.prototype.map.call(document.querySelectorAll('[data-depth]'), function (el) {
      return {
        depth: parseFloat(el.getAttribute('data-depth')) || 0,
        x: gsap.quickTo(el, 'x', PORTAL_EASE),
        y: gsap.quickTo(el, 'y', PORTAL_EASE),
      };
    });
    var hero = document.querySelector('.hero');
    if (!layers.length || !hero) return;
    var wide = window.matchMedia(PORTAL_MEDIA_QUERY);
    var heroVisible = true;
    new IntersectionObserver(function (entries) { heroVisible = entries[0].isIntersecting; }).observe(hero);
    window.addEventListener('pointermove', function (e) {
      if (!heroVisible || !wide.matches) return; // portal is off-screen or hidden at this width
      var nx = e.clientX / window.innerWidth - 0.5;
      var ny = e.clientY / window.innerHeight - 0.5;
      layers.forEach(function (layer) {
        layer.x(nx * PORTAL_SHIFT_PX * layer.depth);
        layer.y(ny * PORTAL_SHIFT_PX * layer.depth);
      });
    }, { passive: true });
  }

  /* The ticker is a CSS (compositor) animation. Scrolling briefly speeds it up; the gsap
     ticker only runs while it settles back, and the rate is only re-timed in coarse steps. */
  function initMarquee() {
    var track = document.querySelector('[data-marquee-track]');
    if (!track || typeof track.getAnimations !== 'function') return;
    var anim = track.getAnimations()[0];
    if (!anim) return;
    var boost = 0;
    var appliedRate = 1;
    var settling = false;
    function settle() {
      boost *= 1 - MARQUEE_SETTLE;
      var rate = boost < MARQUEE_RATE_STEP ? 1 : 1 + boost;
      if (rate === 1 || Math.abs(rate - appliedRate) >= MARQUEE_RATE_STEP) {
        appliedRate = rate;
        anim.updatePlaybackRate(rate);
      }
      if (rate === 1) {
        boost = 0;
        settling = false;
        gsap.ticker.remove(settle);
      }
    }
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: function (self) {
        var target = Math.min(MARQUEE_MAX_BOOST, Math.abs(self.getVelocity()) / MARQUEE_VELOCITY_DIVISOR);
        boost = Math.max(boost, target);
        if (!settling && boost >= MARQUEE_RATE_STEP) {
          settling = true;
          gsap.ticker.add(settle);
        }
      },
    });
  }

  /* One-off fill (a CSS transition), not a scrubbed repaint of very large text on every scroll. */
  function initFooterMark() {
    var mark = document.querySelector('[data-footer-mark]');
    if (!mark) return;
    if (mark.getBoundingClientRect().top < window.innerHeight) return; // short page: already in view, stay filled
    mark.classList.add('is-pending');
    ScrollTrigger.create({
      trigger: mark,
      start: FOOTER_MARK_START,
      once: true,
      onEnter: function () { mark.classList.add('is-lit'); },
    });
  }

  function boot() {
    trackLayoutChanges();
    initSpotlights();
    if (!gsap || !ScrollTrigger) {
      console.warn('Afterglow: GSAP unavailable — finishing effects disabled.');
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    initScrollProgress();
    if (reducedMotion) return;
    initMarquee();
    initFooterMark();
    if (!finePointer) return;
    initCursorGlow();
    initMagnetic();
    initPortalParallax();
  }

  try {
    boot();
  } catch (err) {
    console.error('Afterglow: finishing effects failed — the page works without them.', err);
  }
})();
