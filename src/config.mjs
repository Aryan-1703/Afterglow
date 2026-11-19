/**
 * ─────────────────────────────────────────────────────────────
 *  AFTERGLOW SPA — BUSINESS SETTINGS
 *  This is the ONE file you need to edit before going live.
 *  Every page, the structured data (Google rich results), the
 *  sitemap and robots.txt are generated from these values.
 *  `npm run build` prints a warning for anything still a placeholder.
 * ─────────────────────────────────────────────────────────────
 */
import { deepFreeze } from './lib/html.mjs';

export const SITE = deepFreeze({
  name: 'Afterglow Spa',
  shortName: 'Afterglow',
  // Your live domain, no trailing slash. Canonical URLs + sitemap depend on it.
  url: 'https://www.example.com',
  lang: 'en',
  locale: 'en_CA',
  themeColor: '#120b0f',
  foundingYear: '2026',

  // Tells search engines this is an adult (18+) business so SafeSearch can classify
  // it correctly. Recommended for an 18+ spa; see README before changing.
  adultRating: true,

  contact: {
    phoneE164: '+10000000000', // used in tel: links + structured data, e.g. '+19055551234'
    phoneDisplay: '+1 (000) 000-0000',
    email: 'hello@example.com',
    whatsappE164: '', // e.g. '+15551234567' — leave empty to hide WhatsApp
  },

  address: {
    // Keep this EXACTLY the same as on Google Business Profile and every directory listing.
    street: '33 McMurchy Ave N',
    city: 'Brampton',
    region: 'ON',
    postalCode: 'L6X 1X4',
    country: 'CA', // ISO 3166-1 alpha-2
    neighbourhood: '', // optional, e.g. 'Old Town' — helps local SEO
    directions: 'Discreet street-level entrance; ring the bell marked “A”.',
  },

  // Exact coordinates of the entrance (from Google Maps → right-click → copy).
  // Leave null to omit them from structured data.
  geo: null, // { latitude: 40.7128, longitude: -74.006 }

  // 24h "HH:MM". Days use schema.org names.
  hours: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], opens: '12:00', closes: '22:00' },
    { days: ['Friday', 'Saturday'], opens: '12:00', closes: '23:59' },
    { days: ['Sunday'], opens: '14:00', closes: '21:00' },
  ],

  currency: 'CAD', // ISO 4217
  priceRange: '$$$',

  // Full profile URLs. Empty strings are ignored.
  social: {
    instagram: '',
    x: '',
    tiktok: '',
    googleBusiness: '',
  },

  booking: {
    // Form backend that accepts JSON POSTs (e.g. Formspree: https://formspree.io/f/xxxx).
    // Leave empty and the form falls back to opening the guest's email app.
    endpoint: '',
    minimumAge: 18,
    cancellationHours: 24,
  },
});

export const NAV = deepFreeze([
  { href: '/treatments/', label: 'Treatments' },
  { href: '/the-spa/', label: 'The Spa' },
  { href: '/etiquette/', label: 'Etiquette' },
  { href: '/faq/', label: 'FAQ' },
]);

export const AGE_STORAGE_KEY = 'afterglow-age-confirmed';
