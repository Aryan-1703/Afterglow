import { SITE } from '../config.mjs';
import { html } from '../lib/html.mjs';
import { breadcrumbSchema, faqSchema, serviceSchema, webPageSchema } from '../lib/seo.mjs';
import { TREATMENTS, findTreatment } from '../content/treatments.mjs';
import { documentShell } from '../templates/layout.mjs';
import { checkList, ctaBand, faqList, pageHero, priceList, sectionHead, treatmentCard } from '../templates/components.mjs';

const CITY = SITE.address.city;
const HOME_CRUMB = Object.freeze({ name: 'Home', path: '/' });
const MENU_CRUMB = Object.freeze({ name: 'Treatments', path: '/treatments/' });

const INDEX_SEO = Object.freeze({
  path: '/treatments/',
  title: `Treatments & Prices in ${CITY} | Afterglow Spa`,
  description: `The Afterglow menu: sensual massage, tantric ritual, couples and four-hands massage in ${CITY}. Durations, prices and what to expect. Strictly 18+.`,
});

function menuTable() {
  return html`<div class="menu-table" data-reveal>
    ${TREATMENTS.map((t) => html`<div class="menu-table__row">
      <h3><a href="/treatments/${t.slug}/">${t.name}</a></h3>
      ${priceList(t)}
    </div>`)}
  </div>`;
}

export function treatmentsIndexPage() {
  const crumbs = [HOME_CRUMB, MENU_CRUMB];
  const body = html`
    ${pageHero({
      eyebrow: 'The menu',
      title: `Sensual treatments in ${CITY}`,
      lead: 'Four rituals, each delivered in a private suite by trained therapists. Every session begins with a conversation about your preferences and boundaries.',
      crumbs,
    })}
    <section class="section" aria-label="Treatments">
      <div class="container"><div class="card-grid">${TREATMENTS.map((t) => treatmentCard(t, 2))}</div></div>
    </section>
    <section class="section" aria-labelledby="prices-title">
      <div class="container container--narrow">
        ${sectionHead({ eyebrow: 'Prices', title: 'Durations & prices', id: 'prices-title', lead: 'All prices include your private suite, shower, robe and tea. Couples prices are for two guests.' })}
        ${menuTable()}
      </div>
    </section>
    ${ctaBand()}`;
  return {
    path: INDEX_SEO.path,
    content: documentShell({
      seo: INDEX_SEO,
      schema: [webPageSchema({ ...INDEX_SEO, type: 'CollectionPage' }), breadcrumbSchema(crumbs)],
      body,
    }),
  };
}

function detailOverview(t) {
  return html`<section class="section" aria-labelledby="about-title">
    <div class="container split">
      <div class="prose" data-reveal>
        <h2 class="display-2" id="about-title">${t.tagline}</h2>
        ${t.intro.map((p) => html`<p>${p}</p>`)}
      </div>
      <aside class="detail-aside" data-reveal aria-label="Durations and prices">
        <h2 class="detail-aside__title">Durations &amp; prices</h2>
        ${priceList(t)}
        <a class="btn btn--glow btn--block" href="/book/?treatment=${t.slug}">Book the ${t.name.toLowerCase()}</a>
        <h3 class="detail-aside__sub">Included</h3>
        ${checkList(t.includes)}
        <h3 class="detail-aside__sub">Ideal for</h3>
        ${checkList(t.idealFor)}
      </aside>
    </div>
  </section>`;
}

function detailSteps(t) {
  return html`<section class="section" aria-labelledby="steps-title">
    <div class="container">
      ${sectionHead({ eyebrow: 'What to expect', title: `Your ${t.name.toLowerCase()}, step by step`, id: 'steps-title' })}
      <ol class="steps">
        ${t.steps.map((s, i) => html`<li class="step" data-reveal>
          <span class="step__n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
          <h3>${s.title}</h3><p>${s.text}</p>
        </li>`)}
      </ol>
    </div>
  </section>`;
}

function detailRelated(t) {
  const related = t.related.map(findTreatment);
  return html`<section class="section" aria-labelledby="related-title">
    <div class="container">
      ${sectionHead({ eyebrow: 'You may also love', title: 'Related treatments', id: 'related-title' })}
      <div class="card-grid card-grid--2">${related.map((r) => treatmentCard(r))}</div>
    </div>
  </section>`;
}

function detailFaq(t) {
  return html`<section class="section" aria-labelledby="tfaq-title">
    <div class="container container--narrow">
      ${sectionHead({ eyebrow: 'Questions', title: `About the ${t.name.toLowerCase()}`, id: 'tfaq-title' })}
      ${faqList(t.faqs)}
    </div>
  </section>`;
}

export function treatmentDetailPage(t) {
  const path = `/treatments/${t.slug}/`;
  const seo = Object.freeze({ path, title: t.title, description: t.metaDescription });
  const crumbs = [HOME_CRUMB, MENU_CRUMB, { name: t.name, path }];
  const body = html`
    ${pageHero({ eyebrow: `${t.name} · Afterglow Spa`, title: t.h1, lead: t.summary, accent: t.accent, crumbs })}
    ${detailOverview(t)}${detailSteps(t)}${detailFaq(t)}${detailRelated(t)}
    ${ctaBand({ title: `Book your ${t.name.toLowerCase()}` })}`;
  return {
    path,
    content: documentShell({
      seo,
      schema: [webPageSchema(seo), serviceSchema(t), breadcrumbSchema(crumbs), faqSchema(t.faqs)],
      body,
    }),
  };
}

export function treatmentPages() {
  return [treatmentsIndexPage(), ...TREATMENTS.map(treatmentDetailPage)];
}
