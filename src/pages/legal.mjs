/** Privacy policy (template — have it reviewed for your jurisdiction) and 404 page. */
import { SITE } from '../config.mjs';
import { html } from '../lib/html.mjs';
import { breadcrumbSchema, webPageSchema } from '../lib/seo.mjs';
import { mailHref } from '../lib/format.mjs';
import { documentShell } from '../templates/layout.mjs';
import { pageHero } from '../templates/components.mjs';

const PRIVACY_SEO = Object.freeze({
  path: '/privacy/',
  title: 'Privacy Policy | Afterglow Spa',
  description: `How ${SITE.name} collects, uses and protects your personal information when you browse our website or request a booking.`,
});

const PRIVACY_SECTIONS = Object.freeze([
  {
    h: 'What we collect',
    p: 'When you request a booking we collect your name, email address, optional phone number, chosen treatment, preferred date and time, therapist preference and any notes you choose to share. We do not use advertising trackers or analytics cookies on this website.',
  },
  {
    h: 'Why we use it',
    p: 'Only to respond to your request, arrange and manage your appointment, and contact you about it. We never sell, rent or share guest details for marketing.',
  },
  {
    h: 'Discretion',
    p: 'We will only contact you using the details you provide and we never leave descriptive voicemails or messages unless you ask us to.',
  },
  {
    h: 'How long we keep it',
    p: 'Booking information is kept only as long as needed to provide our services and meet legal or accounting obligations, and is then deleted.',
  },
  {
    h: 'Storage on your device',
    p: 'This website stores a single item in your browser’s local storage to remember that you have confirmed your age. It contains no personal information and you can clear it at any time.',
  },
  {
    h: 'Your rights',
    p: 'You can ask to see, correct or delete the information we hold about you at any time. Depending on where you live, you may have additional rights under local data-protection law.',
  },
]);

export function privacyPage() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Privacy', path: PRIVACY_SEO.path }];
  const body = html`
    ${pageHero({ eyebrow: 'Legal', title: 'Privacy policy', lead: 'Discretion is at the heart of Afterglow — including online.', crumbs })}
    <section class="section section--tight">
      <div class="container container--narrow prose">
        ${PRIVACY_SECTIONS.map((s) => html`<h2>${s.h}</h2><p>${s.p}</p>`)}
        <h2>Contact</h2>
        <p>Questions about your data? Email <a href="${mailHref('Privacy request')}">${SITE.contact.email}</a>.</p>
      </div>
    </section>`;
  return {
    path: PRIVACY_SEO.path,
    content: documentShell({
      seo: PRIVACY_SEO,
      schema: [webPageSchema(PRIVACY_SEO), breadcrumbSchema(crumbs)],
      body,
    }),
  };
}

export function notFoundPage() {
  const seo = Object.freeze({
    path: '/404.html',
    title: 'Page not found | Afterglow Spa',
    description: 'This page has drifted off. Return to Afterglow Spa to explore our sensual treatments.',
    noindex: true,
  });
  const body = html`
    ${pageHero({ eyebrow: '404', title: 'This page has drifted off', lead: 'The page you were looking for doesn’t exist — but your afterglow still does.' })}
    <section class="section section--tight">
      <div class="container btn-row btn-row--center">
        <a class="btn btn--glow" href="/">Return home</a>
        <a class="btn btn--ghost" href="/treatments/">View treatments</a>
      </div>
    </section>`;
  return {
    path: seo.path,
    file: '404.html',
    content: documentShell({ seo, schema: [], body }),
  };
}
