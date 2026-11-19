import { SITE } from '../config.mjs';

const DAY_SHORT = Object.freeze({
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
});

const priceFormatter = new Intl.NumberFormat(SITE.locale.replace('_', '-'), {
  style: 'currency',
  currency: SITE.currency,
  maximumFractionDigits: 0,
});

export function formatPrice(amount) {
  return priceFormatter.format(amount);
}

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = '/') {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE.url}${clean}`;
}

export function formatTime(hhmm) {
  return hhmm === '23:59' ? 'late' : hhmm;
}

/** "Mon – Thu" / "Sun" */
export function formatDayRange(days) {
  const first = DAY_SHORT[days[0]];
  const last = DAY_SHORT[days[days.length - 1]];
  return days.length === 1 ? first : `${first} – ${last}`;
}

export function hoursRows() {
  return SITE.hours.map((h) => ({
    days: formatDayRange(h.days),
    time: `${formatTime(h.opens)} – ${formatTime(h.closes)}`,
  }));
}

export function telHref() {
  return `tel:${SITE.contact.phoneE164}`;
}

export function mailHref(subject) {
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  return `mailto:${SITE.contact.email}${query}`;
}

export function whatsappHref() {
  const digits = SITE.contact.whatsappE164.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : '';
}

export function addressLine() {
  const a = SITE.address;
  return [a.street, a.city, [a.region, a.postalCode].filter(Boolean).join(' ')].filter(Boolean).join(', ');
}

export function mapsHref() {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${SITE.name}, ${addressLine()}`)}`;
}

export function socialLinks() {
  return Object.values(SITE.social).filter((u) => typeof u === 'string' && u.length > 0);
}
