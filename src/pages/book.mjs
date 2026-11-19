import { SITE } from '../config.mjs';
import { html } from '../lib/html.mjs';
import { breadcrumbSchema, businessSchema, webPageSchema } from '../lib/seo.mjs';
import { addressLine, formatPrice, mailHref, mapsHref, telHref, whatsappHref } from '../lib/format.mjs';
import { TREATMENTS } from '../content/treatments.mjs';
import { documentShell } from '../templates/layout.mjs';
import { hoursList, pageHero } from '../templates/components.mjs';

const CITY = SITE.address.city;

/** Field limits — mirrored by the client-side validator (public/assets/js/booking.js). */
export const FIELD_LIMITS = Object.freeze({ name: 80, email: 120, phone: 30, notes: 600 });

const TIME_SLOTS = Object.freeze(['Afternoon (12–4pm)', 'Early evening (4–7pm)', 'Evening (7–10pm)', 'Late (after 10pm)']);
const THERAPIST_PREFS = Object.freeze(['No preference', 'Female therapist', 'Male therapist']);

const SEO = Object.freeze({
  path: '/book/',
  title: `Book a Sensual Massage in ${CITY} | Afterglow Spa`,
  description: `Request a booking at Afterglow Spa in ${CITY}. Choose your treatment, date and time — every request is confirmed personally and discreetly. Strictly 18+.`,
});

function treatmentOptions() {
  return TREATMENTS.flatMap((t) =>
    t.options.map((o) => html`<option value="${t.slug}:${o.minutes}" data-slug="${t.slug}">${t.name} — ${o.minutes} min · ${formatPrice(o.price)}</option>`),
  );
}

function field({ id, label, hint, control }) {
  return html`<div class="field">
    <label for="${id}">${label}</label>
    ${control}
    ${hint ? html`<p class="field__hint" id="${id}-hint">${hint}</p>` : ''}
    <p class="field__error" id="${id}-error" aria-live="polite"></p>
  </div>`;
}

function contactFields() {
  return html`
    ${field({ id: 'bk-name', label: 'Name', control: html`<input id="bk-name" name="name" type="text" autocomplete="name" required maxlength="${FIELD_LIMITS.name}" aria-describedby="bk-name-error">` })}
    <div class="field-row">
      ${field({ id: 'bk-email', label: 'Email', control: html`<input id="bk-email" name="email" type="email" autocomplete="email" required maxlength="${FIELD_LIMITS.email}" aria-describedby="bk-email-error">` })}
      ${field({ id: 'bk-phone', label: 'Phone (optional)', control: html`<input id="bk-phone" name="phone" type="tel" autocomplete="tel" maxlength="${FIELD_LIMITS.phone}" aria-describedby="bk-phone-error">` })}
    </div>`;
}

function sessionFields() {
  return html`
    ${field({ id: 'bk-treatment', label: 'Treatment', control: html`<select id="bk-treatment" name="treatment" required aria-describedby="bk-treatment-error"><option value="">Choose a treatment…</option>${treatmentOptions()}</select>` })}
    <div class="field-row">
      ${field({ id: 'bk-date', label: 'Preferred date', control: html`<input id="bk-date" name="date" type="date" required aria-describedby="bk-date-error">` })}
      ${field({ id: 'bk-time', label: 'Preferred time', control: html`<select id="bk-time" name="time" required aria-describedby="bk-time-error"><option value="">Choose a time…</option>${TIME_SLOTS.map((s) => html`<option>${s}</option>`)}</select>` })}
    </div>
    ${field({ id: 'bk-therapist', label: 'Therapist preference', control: html`<select id="bk-therapist" name="therapist">${THERAPIST_PREFS.map((s) => html`<option>${s}</option>`)}</select>` })}
    ${field({ id: 'bk-notes', label: 'Anything we should know? (optional)', hint: 'First visit, injuries, pressure preferences, boundaries…', control: html`<textarea id="bk-notes" name="notes" rows="4" maxlength="${FIELD_LIMITS.notes}" aria-describedby="bk-notes-hint bk-notes-error"></textarea>` })}`;
}

function bookingForm() {
  const endpoint = SITE.booking.endpoint;
  const fallbackAction = mailHref('Booking request');
  return html`<form class="booking-form" method="post" action="${endpoint || fallbackAction}" ${endpoint ? '' : html`enctype="text/plain"`} novalidate
      data-booking-form data-endpoint="${endpoint}" data-email="${SITE.contact.email}"
      data-min-age="${SITE.booking.minimumAge}" data-limits="${JSON.stringify(FIELD_LIMITS)}">
    ${contactFields()}
    ${sessionFields()}
    <div class="field field--hp" aria-hidden="true">
      <label for="bk-company">Company</label>
      <input id="bk-company" name="company" type="text" tabindex="-1" autocomplete="off">
    </div>
    <div class="field field--check">
      <input id="bk-consent" name="consent" type="checkbox" required aria-describedby="bk-consent-error">
      <label for="bk-consent">I confirm I am ${SITE.booking.minimumAge} or older and have read the <a href="/etiquette/">house etiquette</a>.</label>
      <p class="field__error" id="bk-consent-error" aria-live="polite"></p>
    </div>
    <p class="form-note">We only use your details to arrange your visit. See our <a href="/privacy/">privacy policy</a>.</p>
    <button class="btn btn--glow btn--block" type="submit">Send booking request</button>
    <p class="form-status" role="status" aria-live="polite" data-form-status></p>
  </form>`;
}

function contactPanel() {
  const wa = whatsappHref();
  return html`<aside class="contact-panel" aria-labelledby="contact-title">
    <h2 class="detail-aside__title" id="contact-title">Prefer to talk?</h2>
    <ul class="contact-list">
      <li><span>Phone</span><a href="${telHref()}">${SITE.contact.phoneDisplay}</a></li>
      ${wa ? html`<li><span>WhatsApp</span><a href="${wa}" rel="noopener" target="_blank">Message us</a></li>` : ''}
      <li><span>Email</span><a href="${mailHref('Booking enquiry')}">${SITE.contact.email}</a></li>
      <li><span>Address</span><a href="${mapsHref()}" rel="noopener" target="_blank">${addressLine()}</a></li>
    </ul>
    <h3 class="detail-aside__sub">Opening hours</h3>
    ${hoursList()}
    <p class="form-note">${SITE.address.directions}</p>
  </aside>`;
}

export function bookPage() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Book', path: SEO.path }];
  const body = html`
    ${pageHero({
      eyebrow: 'Reservations',
      title: 'Request your ritual',
      lead: `Tell us what you’d love and when. We confirm every booking personally — usually within a few hours — by email or phone.`,
      crumbs,
    })}
    <section class="section section--tight">
      <div class="container split split--form">
        ${bookingForm()}
        ${contactPanel()}
      </div>
    </section>`;
  return {
    path: SEO.path,
    content: documentShell({
      seo: SEO,
      schema: [webPageSchema({ ...SEO, type: 'ContactPage' }), businessSchema(TREATMENTS), breadcrumbSchema(crumbs)],
      body,
      scripts: ['/assets/js/booking.js'],
    }),
  };
}
