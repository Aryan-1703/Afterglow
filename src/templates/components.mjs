import { SITE } from '../config.mjs';
import { html } from '../lib/html.mjs';
import { formatPrice, hoursRows, telHref } from '../lib/format.mjs';
import { lowestPrice } from '../content/treatments.mjs';

export function sectionHead({ eyebrow, title, lead, id }) {
  return html`<div class="section-head" data-reveal>
    ${eyebrow ? html`<p class="eyebrow">${eyebrow}</p>` : ''}
    <h2 class="display-2"${id ? html` id="${id}"` : ''}>${title}</h2>
    ${lead ? html`<p class="lead">${lead}</p>` : ''}
  </div>`;
}

export function pageHero({ eyebrow, title, lead, accent = 'ember', crumbs }) {
  return html`<section class="page-hero page-hero--${accent}">
    <div class="page-hero__glow" aria-hidden="true"></div>
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
  return html`<article class="card card--${t.accent}" data-reveal>
    <div class="card__glow" aria-hidden="true"></div>
    <p class="card__meta">${durations} min · from ${formatPrice(lowestPrice(t))}</p>
    ${title}
    <p class="card__tagline">${t.tagline}</p>
    <p>${t.summary}</p>
    <a class="card__link" href="/treatments/${t.slug}/">Discover the ${t.name.toLowerCase()}<span aria-hidden="true"> →</span></a>
  </article>`;
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
    <div class="container cta-band__inner" data-reveal>
      <h2 class="display-2" id="cta-title">${title}</h2>
      <p class="lead">${copy}</p>
      <div class="btn-row">
        <a class="btn btn--glow" href="/book/">Request a booking</a>
        <a class="btn btn--ghost" href="${telHref()}">Call ${SITE.contact.phoneDisplay}</a>
      </div>
    </div>
  </section>`;
}

export function checkList(items, className = 'check-list') {
  return html`<ul class="${className}">${items.map((i) => html`<li>${i}</li>`)}</ul>`;
}
