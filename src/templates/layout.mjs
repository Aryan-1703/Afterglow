import { SITE, NAV } from '../config.mjs';
import { html, raw } from '../lib/html.mjs';
import { metaTags, structuredData } from '../lib/seo.mjs';
import { HEAD_SCRIPT, cspDirectives } from '../lib/security.mjs';
import { asset } from '../lib/assets.mjs';
import { addressLine, hoursRows, mailHref, mapsHref, telHref } from '../lib/format.mjs';
import { TREATMENTS } from '../content/treatments.mjs';

const FONT_PRELOADS = Object.freeze([
  '/assets/fonts/cormorant-garamond-latin-400-italic.woff2',
  '/assets/fonts/jost-latin-wght-normal.woff2',
]);

function head({ seo, schema }) {
  return html`<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta http-equiv="Content-Security-Policy" content="${cspDirectives()}">
    ${metaTags(seo)}
    <meta name="theme-color" content="${SITE.themeColor}">
    <meta name="color-scheme" content="dark">
    <meta name="format-detection" content="telephone=no">
    ${FONT_PRELOADS.map((f) => html`<link rel="preload" href="${f}" as="font" type="font/woff2" crossorigin>`)}
    <link rel="stylesheet" href="${asset('/assets/css/main.css')}">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="icon" href="/favicon.ico" sizes="32x32">
    <link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">
    <script>${raw(HEAD_SCRIPT)}</script>
    ${structuredData(schema)}
  </head>`;
}

function wordmark() {
  return html`<a class="wordmark" href="/" aria-label="${SITE.name} — home">
    <span class="wordmark__main">Afterglow</span><span class="wordmark__sub">spa</span>
  </a>`;
}

function header(currentPath) {
  const link = (item) => html`<li><a href="${item.href}"${currentPath.startsWith(item.href) ? raw(' aria-current="page"') : ''}>${item.label}</a></li>`;
  return html`<header class="site-header" data-header>
    <div class="site-header__inner">
      ${wordmark()}
      <nav class="site-nav" id="site-nav" aria-label="Main">
        <ul>${NAV.map(link)}</ul>
        <a class="btn btn--glow btn--sm site-nav__cta" href="/book/">Book a ritual</a>
      </nav>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" data-nav-toggle>
        <span class="nav-toggle__bar"></span><span class="nav-toggle__bar"></span>
        <span class="visually-hidden">Menu</span>
      </button>
    </div>
  </header>`;
}

function footerColumns() {
  return html`<div class="footer-grid">
      <div>
        ${wordmark()}
        <p class="footer-tag">An erotic spa for slow, sensual touch in ${SITE.address.city}. Strictly ${SITE.booking.minimumAge}+.</p>
      </div>
      <div>
        <h2 class="footer-h">Visit</h2>
        <address>
          <a href="${mapsHref()}" rel="noopener" target="_blank">${addressLine()}</a><br>
          <a href="${telHref()}">${SITE.contact.phoneDisplay}</a><br>
          <a href="${mailHref()}">${SITE.contact.email}</a>
        </address>
      </div>
      <div>
        <h2 class="footer-h">Hours</h2>
        <dl class="hours">${hoursRows().map((r) => html`<div><dt>${r.days}</dt><dd>${r.time}</dd></div>`)}</dl>
      </div>
      <nav aria-label="Treatments">
        <h2 class="footer-h">Treatments</h2>
        <ul>${TREATMENTS.map((t) => html`<li><a href="/treatments/${t.slug}/">${t.name}</a></li>`)}</ul>
      </nav>
    </div>`;
}

function footer() {
  const year = new Date().getFullYear();
  return html`<footer class="site-footer">
    <div class="container">
      ${footerColumns()}
      <div class="footer-base">
        <p>© ${year} ${SITE.name}. All treatments are consent-led and exactly as described.</p>
        <ul>
          <li><a href="/etiquette/">House etiquette</a></li>
          <li><a href="/privacy/">Privacy</a></li>
          <li><a href="/book/">Contact</a></li>
        </ul>
      </div>
    </div>
  </footer>`;
}

function ageGate() {
  const age = SITE.booking.minimumAge;
  return html`<div class="age-gate" id="age-gate" role="dialog" aria-modal="true" aria-labelledby="age-title" aria-describedby="age-desc" data-age-gate data-nosnippet>
    <div class="age-gate__panel">
      <p class="eyebrow">${SITE.name}</p>
      <p class="age-gate__title" id="age-title">Are you ${age} or older?</p>
      <p id="age-desc">This website describes sensual services for adults only. Please confirm you are at least ${age} years old to continue.</p>
      <div class="age-gate__actions">
        <button type="button" class="btn btn--glow" data-age-confirm>I’m ${age}+ — enter</button>
        <a class="btn btn--ghost" href="https://www.google.com/" rel="nofollow noopener">Leave</a>
      </div>
    </div>
  </div>`;
}

function scripts(extra) {
  return html`
    <script src="${asset('/assets/vendor/gsap.min.js')}" defer></script>
    <script src="${asset('/assets/vendor/ScrollTrigger.min.js')}" defer></script>
    <script src="${asset('/assets/js/main.js')}" defer></script>
    ${extra.map((src) => html`<script src="${asset(src)}" defer></script>`)}`;
}

/**
 * Full HTML document.
 * @param {{seo: object, schema: object[], body: object, bodyClass?: string, scripts?: string[]}} page
 */
export function documentShell({ seo, schema, body, bodyClass = '', scripts: extra = [] }) {
  return html`<!doctype html>
<html lang="${SITE.lang}">
  ${head({ seo, schema })}
  <body class="${bodyClass}">
    <a class="skip-link" href="#main">Skip to content</a>
    ${header(seo.path)}
    <main id="main">${body}</main>
    ${footer()}
    ${ageGate()}
    ${scripts(extra)}
  </body>
</html>
`;
}
