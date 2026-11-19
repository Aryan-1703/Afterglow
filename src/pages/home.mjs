import { SITE } from '../config.mjs';
import { html } from '../lib/html.mjs';
import { businessSchema, websiteSchema, webPageSchema } from '../lib/seo.mjs';
import { addressLine, mapsHref } from '../lib/format.mjs';
import { TREATMENTS } from '../content/treatments.mjs';
import { AMENITIES, FAQS, JOURNEY, MANIFESTO, PILLARS } from '../content/copy.mjs';
import { documentShell } from '../templates/layout.mjs';
import { checkList, ctaBand, faqList, hoursList, sectionHead, treatmentCard } from '../templates/components.mjs';

const CITY = SITE.address.city;
const HOME_FAQ_COUNT = 4;

const SEO = Object.freeze({
  path: '/',
  title: `Afterglow Spa | Erotic Spa & Sensual Massage in ${CITY}`,
  description: `Afterglow is a discreet erotic spa in ${CITY} for sensual, tantric and couples massage. Private candlelit suites, warm oil, consent-led rituals. Strictly 18+.`,
});

function hero() {
  return html`<section class="hero" aria-labelledby="hero-title">
    <canvas class="hero__canvas" data-glow aria-hidden="true"></canvas>
    <div class="hero__fallback" aria-hidden="true"></div>
    <div class="hero__grain" aria-hidden="true"></div>
    <div class="container hero__content">
      <p class="eyebrow" data-hero-item>Erotic spa · ${CITY}</p>
      <h1 class="display-hero" id="hero-title" data-hero-item>An erotic spa for <em>slow,</em> sensual touch</h1>
      <p class="lead hero__lead" data-hero-item>Private suites, warm oil and unhurried hands — sensual and tantric massage that leaves a soft glow long after you’ve gone home.</p>
      <div class="btn-row" data-hero-item>
        <a class="btn btn--glow" href="/book/">Reserve a ritual</a>
        <a class="btn btn--ghost" href="/treatments/">Explore treatments</a>
      </div>
      <ul class="hero__facts" data-hero-item>
        <li>Strictly ${SITE.booking.minimumAge}+</li><li>Discreet entrance</li><li>By appointment</li>
      </ul>
    </div>
    <a class="hero__scroll" href="#manifesto" aria-label="Scroll to learn more"><span></span></a>
  </section>`;
}

function manifesto() {
  return html`<section class="section manifesto" id="manifesto" aria-label="Our philosophy">
    <div class="container container--narrow">
      <p class="eyebrow" data-reveal>The Afterglow philosophy</p>
      <p class="manifesto__text" data-words>${MANIFESTO}</p>
    </div>
  </section>`;
}

function treatments() {
  return html`<section class="section" aria-labelledby="treatments-title">
    <div class="container">
      ${sectionHead({
        eyebrow: 'Signature treatments',
        title: 'Four ways to arrive in your body',
        lead: 'Every treatment takes place in a private suite with its own rain shower, heated table and warm amber light.',
        id: 'treatments-title',
      })}
      <div class="card-grid">${TREATMENTS.map((t) => treatmentCard(t))}</div>
      <p class="center-link" data-reveal><a class="text-link" href="/treatments/">See the full menu &amp; prices</a></p>
    </div>
  </section>`;
}

function journey() {
  return html`<section class="section journey" aria-labelledby="journey-title" data-journey>
    <div class="container journey__grid">
      <div class="journey__intro">
        ${sectionHead({
          eyebrow: 'Your visit',
          title: 'From the door to the glow',
          lead: 'Nothing is rushed and nothing is assumed. Here is how every visit unfolds.',
          id: 'journey-title',
        })}
      </div>
      <div class="journey__track">
        <span class="journey__line" aria-hidden="true"><span class="journey__line-fill" data-journey-fill></span></span>
        <ol class="journey__steps">
          ${JOURNEY.map((s) => html`<li class="journey__step" data-reveal>
            <span class="journey__n" aria-hidden="true">${s.n}</span>
            <h3>${s.title}</h3>
            <p>${s.text}</p>
          </li>`)}
        </ol>
      </div>
    </div>
  </section>`;
}

function space() {
  return html`<section class="section space" aria-labelledby="space-title">
    <div class="container space__grid">
      <div class="space__visual" aria-hidden="true" data-parallax>
        <div class="orb orb--ember"></div><div class="orb orb--rose"></div><div class="orb orb--gold"></div>
      </div>
      <div>
        ${sectionHead({
          eyebrow: 'The space',
          title: 'Low light, warm air, total privacy',
          lead: `Tucked behind a discreet entrance in ${CITY}, our suites are designed for one thing: letting you switch off completely.`,
          id: 'space-title',
        })}
        <div data-reveal>${checkList(AMENITIES, 'check-list check-list--cols')}</div>
        <p data-reveal><a class="text-link" href="/the-spa/">Step inside the spa</a></p>
      </div>
    </div>
  </section>`;
}

function promise() {
  return html`<section class="section" aria-labelledby="promise-title">
    <div class="container">
      ${sectionHead({ eyebrow: 'Our promise', title: 'Sensual, never careless', id: 'promise-title' })}
      <div class="pillars">
        ${PILLARS.map((p) => html`<div class="pillar" data-reveal><h3>${p.title}</h3><p>${p.text}</p></div>`)}
      </div>
      <p class="center-link" data-reveal><a class="text-link" href="/etiquette/">Read our house etiquette</a></p>
    </div>
  </section>`;
}

function faqPreview() {
  return html`<section class="section" aria-labelledby="faq-title">
    <div class="container container--narrow">
      ${sectionHead({ eyebrow: 'Questions', title: 'Before your first visit', id: 'faq-title' })}
      ${faqList(FAQS.slice(0, HOME_FAQ_COUNT))}
      <p class="center-link" data-reveal><a class="text-link" href="/faq/">All frequently asked questions</a></p>
    </div>
  </section>`;
}

function visit() {
  return html`<section class="section visit" aria-labelledby="visit-title">
    <div class="container visit__grid">
      <div data-reveal>
        <p class="eyebrow">Find us</p>
        <h2 class="display-2" id="visit-title">Afterglow Spa, ${CITY}</h2>
        <p class="lead"><a href="${mapsHref()}" rel="noopener" target="_blank">${addressLine()}</a></p>
        <p>${SITE.address.directions}</p>
      </div>
      <div data-reveal>${hoursList()}</div>
    </div>
  </section>`;
}

export function homePage() {
  const body = html`${hero()}${manifesto()}${treatments()}${journey()}${space()}${promise()}${faqPreview()}${visit()}${ctaBand()}`;
  return {
    path: SEO.path,
    content: documentShell({
      seo: SEO,
      schema: [businessSchema(TREATMENTS), websiteSchema(), webPageSchema(SEO)],
      body,
      bodyClass: 'page-home',
      scripts: ['/assets/js/glow.js'],
    }),
  };
}
