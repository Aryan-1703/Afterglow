import { SITE } from '../config.mjs';
import { html, raw } from '../lib/html.mjs';
import { formatPrice, hoursRows, telHref } from '../lib/format.mjs';
import { TREATMENTS, lowestPrice } from '../content/treatments.mjs';

/** Line icons (24×24, stroked with currentColor). Trusted, static markup only. */
const ICON_PATHS = Object.freeze({
  heart: '<path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10z"/>',
  shield: '<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
});

export function icon(name) {
  const paths = ICON_PATHS[name];
  if (!paths) throw new Error(`Unknown icon: "${name}"`);
  return html`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${raw(paths)}</svg>`;
}

/** The setting-sun brand mark (matches the favicon). Decorative. */
export function sunMark(className = 'sun-mark') {
  return html`<svg class="${className}" viewBox="0 0 64 40" aria-hidden="true" focusable="false">
    <path d="M12 30a20 20 0 0 1 40 0z" fill="currentColor"/>
    <rect x="4" y="34" width="56" height="2" rx="1" fill="currentColor"/>
  </svg>`;
}

/** Four-point sparkle used as a list bullet and marquee separator. Decorative. */
export function sparkle(className = 'sparkle') {
  return html`<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" fill="currentColor"/></svg>`;
}

/** `title` may be a string or an html`` fragment (to allow <em> accents). */
export function sectionHead({ eyebrow, title, lead, id, align = 'start' }) {
  return html`<div class="section-head${align === 'center' ? ' section-head--center' : ''}" data-reveal>
    ${eyebrow ? html`<p class="eyebrow">${eyebrow}</p>` : ''}
    <h2 class="display-2"${id ? html` id="${id}"` : ''}>${title}</h2>
    ${lead ? html`<p class="lead">${lead}</p>` : ''}
  </div>`;
}

export function pageHero({ eyebrow, title, lead, accent = 'ember', crumbs }) {
  return html`<section class="page-hero page-hero--${accent}">
    <div class="page-hero__glow" aria-hidden="true"></div>
    <div class="page-hero__arch" aria-hidden="true"><span></span><span></span></div>
    <div class="container">
      ${crumbs ? breadcrumbs(crumbs) : ''}
      <p class="eyebrow" data-hero-item>${eyebrow}</p>
      <h1 class="display-1" data-hero-item>${title}</h1>
      ${lead ? html`<p class="lead page-hero__lead" data-hero-item>${lead}</p>` : ''}
    </div>
  </section>`;
}

export function breadcrumbs(crumbs) {
  const last = crumbs.length - 1;
  return html`<nav class="breadcrumbs" aria-label="Breadcrumb">
    <ol>${crumbs.map((c, i) =>
      i === last ? html`<li aria-current="page">${c.name}</li>` : html`<li><a href="${c.path}">${c.name}</a></li>`,
    )}</ol>
  </nav>`;
}

export function treatmentCard(t, headingLevel = 3) {
  const title = headingLevel === 2 ? html`<h2 class="card__title">${t.name}</h2>` : html`<h3 class="card__title">${t.name}</h3>`;
  const durations = t.options.map((o) => `${o.minutes}`).join(' / ');
  const number = String(TREATMENTS.indexOf(t) + 1).padStart(2, '0');
  return html`<article class="card card--${t.accent}" data-reveal data-spotlight>
    <div class="card__visual" aria-hidden="true">
      <span class="card__orb"></span><span class="card__horizon"></span>
      <span class="card__num">${number}</span>
    </div>
    <p class="card__meta">${durations} min · from ${formatPrice(lowestPrice(t))}</p>
    ${title}
    <p class="card__tagline">${t.tagline}</p>
    <p class="card__summary">${t.summary}</p>
    <a class="card__link" href="/treatments/${t.slug}/">Discover the ${t.name.toLowerCase()}<span class="card__arrow" aria-hidden="true">→</span></a>
  </article>`;
}

export function pillarGrid(pillars) {
  return html`<div class="pillars">
    ${pillars.map((p) => html`<div class="pillar" data-reveal data-spotlight>
      <span class="pillar__icon">${icon(p.icon)}</span>
      <h3>${p.title}</h3>
      <p>${p.text}</p>
    </div>`)}
  </div>`;
}

export function priceList(t) {
  return html`<ul class="price-list">
    ${t.options.map((o) => html`<li>
      <span class="price-list__time">${o.minutes} minutes</span>
      <span class="price-list__rule" aria-hidden="true"></span>
      <span class="price-list__price">${formatPrice(o.price)}</span>
    </li>`)}
  </ul>`;
}

export function faqList(faqs) {
  return html`<div class="faq-list">
    ${faqs.map((f) => html`<details class="faq" data-reveal>
      <summary><span>${f.q}</span><span class="faq__icon" aria-hidden="true"></span></summary>
      <div class="faq__answer"><p>${f.a}</p></div>
    </details>`)}
  </div>`;
}

export function hoursList() {
  return html`<dl class="hours hours--lg">
    ${hoursRows().map((r) => html`<div><dt>${r.days}</dt><dd>${r.time}</dd></div>`)}
  </dl>`;
}

export function ctaBand({ title = 'Your afterglow is waiting', text } = {}) {
  const copy = text ?? `Private suites, unhurried hands and total discretion in ${SITE.address.city}. Booking requests are confirmed personally.`;
  return html`<section class="cta-band" aria-labelledby="cta-title">
    <div class="cta-band__glow" aria-hidden="true"></div>
    <div class="cta-band__ring" aria-hidden="true"></div>
    <div class="cta-band__ring cta-band__ring--inner" aria-hidden="true"></div>
    <div class="container cta-band__inner" data-reveal>
      ${sunMark('sun-mark cta-band__mark')}
      <h2 class="display-2" id="cta-title">${title}</h2>
      <p class="lead">${copy}</p>
      <div class="btn-row btn-row--center">
        <a class="btn btn--glow" href="/book/">Request a booking</a>
        <a class="btn btn--ghost" href="${telHref()}">Call ${SITE.contact.phoneDisplay}</a>
      </div>
    </div>
  </section>`;
}

export function checkList(items, className = 'check-list') {
  return html`<ul class="${className}">${items.map((i) => html`<li>${sparkle('sparkle check-list__mark')}<span>${i}</span></li>`)}</ul>`;
}
