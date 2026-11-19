/**
 * Shared page copy. Policies here are sensible defaults —
 * review every line so it matches how your spa actually operates.
 */
import { SITE } from '../config.mjs';
import { deepFreeze } from '../lib/html.mjs';

const CITY = SITE.address.city;
const MIN_AGE = SITE.booking.minimumAge;
const CANCEL_HOURS = SITE.booking.cancellationHours;

export const MANIFESTO =
  'Most of us are touched in a hurry. At Afterglow, nothing is rushed. We slow the room, warm the oil and let your body remember what it feels like to simply receive — present, unhurried and completely at ease.';

export const JOURNEY = deepFreeze([
  { n: '01', title: 'Arrive', text: 'A discreet entrance, a warm welcome and herbal tea in our lounge. No audience, no rush.' },
  { n: '02', title: 'Talk', text: 'A short private consultation about your preferences and boundaries. You stay in control throughout.' },
  { n: '03', title: 'Ritual', text: 'A rain shower, low amber light and warm oil — then slow, attentive touch from a trained therapist.' },
  { n: '04', title: 'Afterglow', text: 'Time to linger, shower and rehydrate. You leave lighter than you arrived, and the glow stays.' },
]);

export const PILLARS = deepFreeze([
  { title: 'Consent first', text: 'Preferences and boundaries are agreed before every session and can change at any moment.' },
  { title: `Strictly ${MIN_AGE}+`, text: `Every guest must be ${MIN_AGE} or older. We may ask for photo ID at reception.` },
  { title: 'Total discretion', text: 'Private entrance, staggered appointments and guest details that are never shared.' },
  { title: 'Spotless hygiene', text: 'Fresh linens for every guest, sanitised suites and single-use amenities.' },
]);

export const AMENITIES = deepFreeze([
  'Private suites with rain showers',
  'Heated massage tables',
  'Warm organic oils',
  'Dimmable amber lighting',
  'Curated soundscapes',
  'Robes, slippers & fresh towels',
  'Herbal tea lounge',
  'Discreet street entrance',
]);

export const ETIQUETTE = deepFreeze([
  {
    title: `${MIN_AGE}+ only`,
    text: `All guests must be at least ${MIN_AGE} years old. Valid photo ID may be requested on arrival, and we will refuse service without it.`,
  },
  {
    title: 'Consent & boundaries',
    text: 'Before your session we agree what you would like and what you would rather avoid. You can pause or change your mind at any time, and so can your therapist.',
  },
  {
    title: 'Our menu is our menu',
    text: 'Treatments are exactly as described on this website. Please don’t request anything outside them — our therapists will politely decline, and repeated requests end the session without refund.',
  },
  {
    title: 'Respect, always',
    text: 'Our therapists are trained professionals. Any disrespectful, aggressive or unsafe behaviour ends the session immediately.',
  },
  {
    title: 'Arrive clear-headed',
    text: 'Please don’t arrive under the influence of alcohol or drugs. We are unable to treat guests who are intoxicated.',
  },
  {
    title: 'Shower first',
    text: 'Every suite has a private rain shower, and we ask every guest to use it before their treatment begins.',
  },
  {
    title: 'Phones away',
    text: 'Please silence your phone. Photos and recordings are not allowed anywhere in the spa — for everyone’s privacy.',
  },
  {
    title: 'Timing & cancellations',
    text: `Arrive 10 minutes early. Late arrivals may have a shorter session. Please give at least ${CANCEL_HOURS} hours’ notice to cancel or reschedule.`,
  },
]);

export const FAQS = deepFreeze([
  {
    q: 'What is a sensual massage?',
    a: `A sensual massage is a slow, full-body massage with warm oil that goes beyond ordinary relaxation to awaken the senses. At Afterglow in ${CITY}, every treatment is consent-led, delivered by trained therapists in a private suite, and exactly as described on our menu.`,
  },
  {
    q: 'I’ve never done this before. Is Afterglow right for me?',
    a: 'Many of our guests are first-timers. We explain everything in a private consultation, you set the boundaries, and you can pause or stop at any time. Our Sensual Massage is a lovely place to start.',
  },
  {
    q: 'What happens when I arrive?',
    a: 'You’ll be welcomed through our discreet entrance, offered tea and shown to your private suite. After a short consultation you take a rain shower, then your treatment begins.',
  },
  {
    q: 'Is there an age requirement?',
    a: `Yes. Afterglow is strictly for guests aged ${MIN_AGE} and over, and we may ask for photo ID on arrival.`,
  },
  {
    q: 'Can I choose my therapist?',
    a: 'You can share a preference when you book and we will do our best to match it, depending on availability.',
  },
  {
    q: 'Do you welcome couples?',
    a: 'Yes. Our Couples Afterglow is designed for two guests in our largest suite, with two therapists working side by side.',
  },
  {
    q: 'How discreet are you?',
    a: 'Very. We have a private street entrance, stagger appointments so guests rarely cross paths, and never share your details with anyone.',
  },
  {
    q: 'What should I bring?',
    a: 'Just yourself. We provide robes, slippers, towels, toiletries and disposable underwear.',
  },
  {
    q: 'What is your cancellation policy?',
    a: `Please give at least ${CANCEL_HOURS} hours’ notice to cancel or reschedule. Late cancellations and no-shows may be charged in full.`,
  },
  {
    q: 'How do I book?',
    a: `Send a booking request through our website, call us on ${SITE.contact.phoneDisplay} or email ${SITE.contact.email}. We confirm every booking personally.`,
  },
]);
