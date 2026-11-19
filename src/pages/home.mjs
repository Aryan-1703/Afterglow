import { SITE } from '../config.mjs';
import { html } from '../lib/html.mjs';
import { businessSchema, websiteSchema, webPageSchema } from '../lib/seo.mjs';
import { addressLine, mapsHref } from '../lib/format.mjs';
import { TREATMENTS } from '../content/treatments.mjs';
import { AMENITIES, FAQS, JOURNEY, MANIFESTO, PILLARS } from '../content/copy.mjs';
import { documentShell } from '../templates/layout.mjs';
import { checkList, ctaBand, faqList, hoursList, icon, pillarGrid, sectionHead, sparkle, sunMark, treatmentCard } from '../templates/components.mjs';

const CITY = SITE.address.city;
const HOME_FAQ_COUNT = 4;

const SEO = Object.freeze({
  path: '/',
  title: `Afterglow Spa | Sensual & Tantric Massage in ${CITY}`,
  description: `Afterglow is a discreet sensual massage spa in ${CITY} for tantric, couples and four-hands massage. Private candlelit suites, warm oil, consent-led. Strictly 18+.`,
});

const BADGE_TEXT = `Strictly ${SITE.booking.minimumAge}+ · By appointment · Discreet entrance · `.toUpperCase();
const BADGE_TEXT_LENGTH = 470; // ≈ circumference of the r=78 badge path, so the text closes the loop

function heroTitle() {
  return html`<h1 class="display-hero" id="hero-title">
    <span class="hero__line"><span data-hero-line>A massage spa</span></span>
    <span class="hero__line"><span data-hero-line>for <em>slow,</em></span></span>
    <span class="hero__line"><span data-hero-line>sensual touch</span></span>
  </h1>`;
}

function heroBadge() {
  return html`<div class="hero__badge">
    <svg class="hero__badge-ring" viewBox="0 0 200 200" focusable="false">
      <defs><path id="badge-path" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0"/></defs>
      <text><textPath href="#badge-path" xlink:href="#badge-path" textLength="${BADGE_TEXT_LENGTH}" lengthAdjust="spacing">${BADGE_TEXT}</textPath></text>
    </svg>
    ${sunMark('sun-mark hero__badge-mark')}
  </div>`;
}

function heroVisual() {
  return html`<div class="hero__visual" aria-hidden="true" data-hero-item data-hero-visual>
    <div class="portal">
      <span class="portal__stars"></span>
      <span class="portal__halo" data-depth="0.4"></span>
      <span class="portal__rings" data-depth="0.7"><span></span><span></span><span></span></span>
      <span class="portal__sun" data-depth="1"></span>
      <span class="portal__water"></span>
      <span class="portal__reflection" data-depth="0.6"></span>
      <span class="portal__caption">Est. ${SITE.foundingYear} · ${CITY}</span>
    </div>
    ${heroBadge()}
  </div>`;
}

function hero() {
  return html`<section class="hero" aria-labelledby="hero-title">
    <canvas class="hero__canvas" data-glow aria-hidden="true"></canvas>
    <div class="hero__fallback" aria-hidden="true"></div>
    <div class="container hero__grid">
      <div class="hero__content">
        <p class="eyebrow" data-hero-item>Sensual massage spa · ${CITY}</p>
        ${heroTitle()}
        <p class="lead hero__lead" data-hero-item>Private suites, warm oil and unhurried hands — sensual and tantric massage that leaves a soft glow long after you’ve gone home.</p>
        <div class="btn-row" data-hero-item>
          <a class="btn btn--glow" href="/book/">Reserve a ritual</a>
          <a class="btn btn--ghost" href="/treatments/">Explore treatments</a>
        </div>
        <ul class="hero__facts" data-hero-item>
          <li>Strictly ${SITE.booking.minimumAge}+</li><li>Discreet entrance</li><li>By appointment</li>
        </ul>
      </div>
      ${heroVisual()}
    </div>
    <a class="hero__scroll" href="#manifesto" aria-label="Scroll to learn more"><span></span></a>
  </section>`;
}

function marqueeGroup() {
  return html`<div class="marquee__group">
    ${TREATMENTS.map((t, i) => html`<span class="marquee__item${i % 2 ? ' marquee__item--outline' : ''}">${t.name}</span>${sparkle('sparkle marquee__sep')}`)}
  </div>`;
}

/** Decorative ticker of treatment names; the real links live in the cards below. */
function marquee() {
  return html`<div class="marquee" aria-hidden="true">
    <div class="marquee__track" data-marquee-track>${marqueeGroup()}${marqueeGroup()}</div>
  </div>`;
}

function manifesto() {
  return html`<section class="section manifesto" id="manifesto" aria-label="Our philosophy">
    <div class="manifesto__glow" aria-hidden="true"></div>
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
        title: html`Four ways to <em>arrive</em> in your body`,
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
          title: html`From the door to the <em>glow</em>`,
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
        <span class="space__caption">Private suites · ${CITY}</span>
      </div>
      <div>
        ${sectionHead({
          eyebrow: 'The space',
          title: html`Low light, warm air, <em>total privacy</em>`,
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
      ${sectionHead({ eyebrow: 'Our promise', title: html`Sensual, <em>never careless</em>`, id: 'promise-title' })}
      ${pillarGrid(PILLARS)}
      <p class="center-link" data-reveal><a class="text-link" href="/etiquette/">Read our house etiquette</a></p>
    </div>
  </section>`;
}

function faqPreview() {
  return html`<section class="section" aria-labelledby="faq-title">
    <div class="container container--narrow">
      ${sectionHead({ eyebrow: 'Questions', title: html`Before your <em>first visit</em>`, id: 'faq-title', align: 'center' })}
      ${faqList(FAQS.slice(0, HOME_FAQ_COUNT))}
      <p class="center-link" data-reveal><a class="text-link" href="/faq/">All frequently asked questions</a></p>
    </div>
  </section>`;
}

function visit() {
  return html`<section class="section visit" aria-labelledby="visit-title">
    <div class="container">
      <div class="visit__panel visit__grid">
      <div data-reveal>
        <span class="visit__icon">${icon('pin')}</span>
        <p class="eyebrow">Find us</p>
        <h2 class="display-2" id="visit-title">Afterglow Spa, ${CITY}</h2>
        <p class="lead"><a href="${mapsHref()}" rel="noopener" target="_blank">${addressLine()}</a></p>
        <p>${SITE.address.directions}</p>
      </div>
      <div data-reveal>${hoursList()}</div>
      </div>
    </div>
  </section>`;
}

export function homePage() {
  const body = html`${hero()}${marquee()}${manifesto()}${treatments()}${journey()}${space()}${promise()}${faqPreview()}${visit()}${ctaBand()}`;
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
