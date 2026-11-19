/** The Spa (about), House Etiquette and FAQ pages. */
import { SITE } from '../config.mjs';
import { html } from '../lib/html.mjs';
import { breadcrumbSchema, businessSchema, faqSchema, webPageSchema } from '../lib/seo.mjs';
import { TREATMENTS } from '../content/treatments.mjs';
import { AMENITIES, ETIQUETTE, FAQS, PILLARS } from '../content/copy.mjs';
import { documentShell } from '../templates/layout.mjs';
import { checkList, ctaBand, faqList, pageHero, sectionHead } from '../templates/components.mjs';

const CITY = SITE.address.city;
const HOME_CRUMB = Object.freeze({ name: 'Home', path: '/' });

function crumbsFor(name, path) {
  return [HOME_CRUMB, { name, path }];
}

const SPA_SEO = Object.freeze({
  path: '/the-spa/',
  title: `The Spa: Private Sensual Suites in ${CITY} | Afterglow`,
  description: `Step inside Afterglow Spa in ${CITY}: private candlelit suites with rain showers, trained therapists, strict hygiene and a discreet entrance. Strictly 18+.`,
});

const SPA_STORY = Object.freeze([
  'Afterglow began with a simple idea: that sensual touch deserves the same care, craft and calm as the world’s best spas. No neon, no rush, no awkwardness — just a warm, beautiful space where adults can relax completely, on their own terms.',
  'Every detail is designed to help you let go. Light is low and amber. Rooms are warm. Music is slow. And every session begins with a conversation, because feeling safe is what makes it possible to feel everything else.',
]);

const THERAPIST_NOTES = Object.freeze([
  'Professionally trained in massage and bodywork',
  'Experienced in consent-led, boundary-aware practice',
  'Respected, fairly paid and free to decline any request',
  'Committed to absolute discretion',
]);

export function spaPage() {
  const crumbs = crumbsFor('The Spa', SPA_SEO.path);
  const body = html`
    ${pageHero({
      eyebrow: 'The spa',
      title: 'A sanctuary for slow, sensual touch',
      lead: `Afterglow is a private sensual massage spa in ${CITY} — built around warmth, discretion and the art of unhurried massage.`,
      accent: 'rose',
      crumbs,
    })}
    <section class="section" aria-labelledby="story-title">
      <div class="container split">
        <div class="prose" data-reveal>
          <h2 class="display-2" id="story-title">Our story</h2>
          ${SPA_STORY.map((p) => html`<p>${p}</p>`)}
        </div>
        <div class="space__visual space__visual--tall" aria-hidden="true" data-parallax>
          <div class="orb orb--rose"></div><div class="orb orb--ember"></div><div class="orb orb--gold"></div>
        </div>
      </div>
    </section>
    <section class="section" aria-labelledby="suites-title">
      <div class="container container--narrow">
        ${sectionHead({ eyebrow: 'The suites', title: 'Everything you need, nothing you don’t', id: 'suites-title', lead: 'Each private suite is prepared freshly for every guest.' })}
        <div data-reveal>${checkList(AMENITIES, 'check-list check-list--cols')}</div>
      </div>
    </section>
    <section class="section" aria-labelledby="team-title">
      <div class="container split">
        <div>
          ${sectionHead({ eyebrow: 'Our therapists', title: 'Skilled hands, kind presence', id: 'team-title' })}
          <p class="prose" data-reveal>Our therapists are the heart of Afterglow. They are chosen for their skill, their warmth and their deep respect for boundaries — yours and their own.</p>
        </div>
        <div data-reveal>${checkList(THERAPIST_NOTES)}</div>
      </div>
    </section>
    <section class="section" aria-labelledby="standards-title">
      <div class="container">
        ${sectionHead({ eyebrow: 'Our standards', title: 'Sensual, never careless', id: 'standards-title' })}
        <div class="pillars">${PILLARS.map((p) => html`<div class="pillar" data-reveal><h3>${p.title}</h3><p>${p.text}</p></div>`)}</div>
      </div>
    </section>
    ${ctaBand()}`;
  return {
    path: SPA_SEO.path,
    content: documentShell({
      seo: SPA_SEO,
      schema: [webPageSchema({ ...SPA_SEO, type: 'AboutPage' }), businessSchema(TREATMENTS), breadcrumbSchema(crumbs)],
      body,
    }),
  };
}

const ETIQUETTE_SEO = Object.freeze({
  path: '/etiquette/',
  title: 'House Etiquette & Consent Policy | Afterglow Spa',
  description: `How we keep Afterglow Spa safe, respectful and discreet: ${SITE.booking.minimumAge}+ only, consent and boundaries, hygiene, privacy and cancellation policy.`,
});

export function etiquettePage() {
  const crumbs = crumbsFor('Etiquette', ETIQUETTE_SEO.path);
  const body = html`
    ${pageHero({
      eyebrow: 'House etiquette',
      title: 'A few gentle rules',
      lead: 'They exist so every guest and every therapist can relax completely. Thank you for honouring them.',
      accent: 'gold',
      crumbs,
    })}
    <section class="section" aria-label="House rules">
      <div class="container">
        <ol class="rules">
          ${ETIQUETTE.map((r, i) => html`<li class="rule" data-reveal>
            <span class="rule__n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
            <h2>${r.title}</h2><p>${r.text}</p>
          </li>`)}
        </ol>
      </div>
    </section>
    ${ctaBand({ title: 'Ready when you are' })}`;
  return {
    path: ETIQUETTE_SEO.path,
    content: documentShell({
      seo: ETIQUETTE_SEO,
      schema: [webPageSchema(ETIQUETTE_SEO), breadcrumbSchema(crumbs)],
      body,
    }),
  };
}

const FAQ_SEO = Object.freeze({
  path: '/faq/',
  title: `Sensual Massage FAQ: First Visit, Etiquette & Booking | Afterglow`,
  description: `Answers about visiting Afterglow, a sensual massage spa in ${CITY}: what to expect, age policy, couples, discretion, what to bring and how to book.`,
});

export function faqPage() {
  const crumbs = crumbsFor('FAQ', FAQ_SEO.path);
  const body = html`
    ${pageHero({
      eyebrow: 'FAQ',
      title: 'Frequently asked questions',
      lead: 'Everything you might want to know before your first visit. Can’t find your answer? Just ask — we’re happy to help.',
      crumbs,
    })}
    <section class="section" aria-label="Questions and answers">
      <div class="container container--narrow">${faqList(FAQS)}</div>
    </section>
    ${ctaBand()}`;
  return {
    path: FAQ_SEO.path,
    content: documentShell({
      seo: FAQ_SEO,
      schema: [webPageSchema(FAQ_SEO), faqSchema(FAQS), breadcrumbSchema(crumbs)],
      body,
    }),
  };
}
