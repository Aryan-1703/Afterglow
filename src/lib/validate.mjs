/**
 * Validates business settings before anything is built.
 * Errors stop the build; warnings flag placeholders you still need to replace.
 */

const E164 = /^\+[1-9]\d{6,14}$/;
// Excludes characters that would inject extra parameters into mailto: links.
const EMAIL = /^[^\s@?&,;:<>"']+@[^\s@?&,;:<>"']+\.[^\s@?&,;:<>"']+$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DAYS = new Set(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
const LEGAL_MIN_AGE = 18;

const PLACEHOLDERS = Object.freeze([
  ['url', (s) => s.url.includes('example.com'), 'SITE.url is still example.com — set your real domain.'],
  ['city', (s) => s.address.city === 'Your City', 'SITE.address.city is a placeholder — this appears in every page title.'],
  ['street', (s) => s.address.street.includes('Placeholder'), 'SITE.address.street is a placeholder.'],
  ['postal', (s) => !s.address.postalCode, 'SITE.address.postalCode is empty — a full address helps local search.'],
  ['phone', (s) => s.contact.phoneE164 === '+10000000000', 'SITE.contact.phoneE164 is a placeholder.'],
  ['email', (s) => s.contact.email.endsWith('@example.com'), 'SITE.contact.email is a placeholder.'],
  ['geo', (s) => s.geo === null, 'SITE.geo is not set — exact coordinates help Google Maps / local results.'],
  ['endpoint', (s) => !s.booking.endpoint, 'SITE.booking.endpoint is empty — the booking form will fall back to email.'],
]);

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function checkHours(hours) {
  const errors = [];
  if (!Array.isArray(hours) || hours.length === 0) return ['SITE.hours must list at least one opening period.'];
  hours.forEach((h, i) => {
    if (!h.days?.length || !h.days.every((d) => DAYS.has(d))) errors.push(`SITE.hours[${i}].days has an invalid day name.`);
    if (!TIME.test(h.opens) || !TIME.test(h.closes)) errors.push(`SITE.hours[${i}] times must be "HH:MM" (24h).`);
  });
  return errors;
}

function checkCore(site) {
  const errors = [];
  if (!isHttpsUrl(site.url)) errors.push('SITE.url must be a full https:// URL.');
  if (site.url.endsWith('/')) errors.push('SITE.url must not end with a slash.');
  if (!E164.test(site.contact.phoneE164)) errors.push('SITE.contact.phoneE164 must be in E.164 format, e.g. +15551234567.');
  if (site.contact.whatsappE164 && !E164.test(site.contact.whatsappE164)) errors.push('SITE.contact.whatsappE164 must be E.164 or empty.');
  if (!EMAIL.test(site.contact.email)) errors.push('SITE.contact.email is not a valid email address.');
  if (!/^[A-Z]{3}$/.test(site.currency)) errors.push('SITE.currency must be a 3-letter ISO 4217 code.');
  if (!/^[A-Z]{2}$/.test(site.address.country)) errors.push('SITE.address.country must be a 2-letter ISO code.');
  if (site.booking.endpoint && !isHttpsUrl(site.booking.endpoint)) errors.push('SITE.booking.endpoint must be an https:// URL or empty.');
  if (!(site.booking.minimumAge >= LEGAL_MIN_AGE)) errors.push(`SITE.booking.minimumAge must be at least ${LEGAL_MIN_AGE}.`);
  if (site.geo && !(Number.isFinite(site.geo.latitude) && Number.isFinite(site.geo.longitude))) {
    errors.push('SITE.geo must be null or { latitude, longitude } numbers.');
  }
  return errors;
}

export function validateConfig(site) {
  const errors = [...checkCore(site), ...checkHours(site.hours)];
  const warnings = PLACEHOLDERS.filter(([, test]) => test(site)).map(([, , msg]) => msg);
  return Object.freeze({ errors, warnings });
}
