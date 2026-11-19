/**
 * Treatment menu. Each entry becomes its own SEO landing page at /treatments/<slug>/.
 * Prices are placeholders — set your own (in SITE.currency).
 */
import { SITE } from '../config.mjs';
import { deepFreeze } from '../lib/html.mjs';

const CITY = SITE.address.city;

export const TREATMENTS = deepFreeze([
  {
    slug: 'sensual-massage',
    name: 'Sensual Massage',
    accent: 'ember',
    h1: `Sensual Massage in ${CITY}`,
    title: `Sensual Massage in ${CITY} | Afterglow Spa`,
    metaDescription: `Slow, full-body sensual massage with warm oil in a private candlelit suite in ${CITY}. Consent-led, discreet and strictly 18+. Book your session at Afterglow Spa.`,
    tagline: 'Warm oil, slow hands, nowhere to be.',
    summary:
      'A slow, flowing full-body massage with warm oil — designed to melt tension and reawaken every sense.',
    intro: [
      'Our signature treatment and the perfect introduction to Afterglow. Long, unhurried strokes and warm, lightly scented oil move across the whole body, easing deep muscular tension while gently heightening sensation.',
      'There is no script and no rush. Your therapist reads your breath and responds to it, building slowly from deep relaxation towards a softly charged, sensual stillness — and leaving plenty of time to drift back down.',
    ],
    steps: [
      { title: 'Private consultation', text: 'A few quiet minutes to talk through preferences, pressure and boundaries.' },
      { title: 'Rain shower & warm towels', text: 'Wash the day away in your suite’s rain shower before you settle onto a heated table.' },
      { title: 'Full-body ritual', text: 'Slow, flowing massage with warm oil, attentive to every response.' },
      { title: 'Linger', text: 'Time to rest, shower and rehydrate with tea before you step back outside.' },
    ],
    includes: ['Private suite with rain shower', 'Warm organic massage oil', 'Fresh robe, slippers and towels', 'Herbal tea in the lounge'],
    idealFor: ['First-time guests', 'Deep stress relief', 'Reconnecting with your body'],
    options: [
      { minutes: 60, price: 180 },
      { minutes: 90, price: 250 },
    ],
    faqs: [
      {
        q: 'Is a sensual massage right for a first visit?',
        a: 'Yes — it is our most popular first treatment. Everything is explained beforehand and you can pause, adjust or stop at any moment.',
      },
      {
        q: 'What should I wear?',
        a: 'We provide a robe, slippers and disposable underwear. Many guests prefer to be fully undressed under a towel; you choose what feels right.',
      },
    ],
    related: ['tantric-massage', 'four-hands-massage'],
  },
  {
    slug: 'tantric-massage',
    name: 'Tantric Ritual',
    accent: 'rose',
    h1: `Tantric Massage Ritual in ${CITY}`,
    title: `Tantric Massage in ${CITY} | Afterglow Spa`,
    metaDescription: `A breath-led tantric massage ritual in ${CITY}: meditative full-body touch, energy work and deep release in a private suite. Discreet, consent-led, 18+ only.`,
    tagline: 'Breath, presence and slow-rising energy.',
    summary:
      'A meditative, breath-led ritual inspired by tantric tradition — awareness, energy and deep, rolling release.',
    intro: [
      'Tantra is less about technique and more about presence. This ritual begins with guided breathing to bring you fully into your body, then moves into slow, meditative full-body touch that encourages energy to rise and spread rather than rush.',
      'Expect long pauses, soft music and a deep sense of being held. Many guests describe it as the most profound relaxation they have ever felt — and the glow lasts for days.',
    ],
    steps: [
      { title: 'Intention & boundaries', text: 'A calm conversation about what you hope to feel and anything you’d rather avoid.' },
      { title: 'Breath & grounding', text: 'Guided breathing to slow the mind and wake up awareness.' },
      { title: 'Tantric touch', text: 'Meditative, full-body massage that builds, circulates and settles energy.' },
      { title: 'Integration', text: 'Unhurried stillness, a warm shower and tea to bring you gently back.' },
    ],
    includes: ['Guided breathwork', 'Private suite with rain shower', 'Warm oil & heated table', 'Herbal tea in the lounge'],
    idealFor: ['Deep, meditative relaxation', 'Guests curious about tantra', 'Releasing stored tension'],
    options: [
      { minutes: 90, price: 260 },
      { minutes: 120, price: 330 },
    ],
    faqs: [
      {
        q: 'Do I need any experience with tantra?',
        a: 'None at all. Your therapist guides every step, including the breathing, and explains what to expect before you begin.',
      },
      {
        q: 'Why is the tantric ritual longer?',
        a: 'Tantric touch works through slowness. The extra time allows for grounding, a gradual build and a proper integration at the end.',
      },
    ],
    related: ['sensual-massage', 'couples-massage'],
  },
  {
    slug: 'couples-massage',
    name: 'Couples Afterglow',
    accent: 'gold',
    h1: `Couples Sensual Massage in ${CITY}`,
    title: `Couples Sensual Massage in ${CITY} | Afterglow Spa`,
    metaDescription: `Side-by-side sensual massage for two in ${CITY}'s most intimate couples suite, with a guided connection ritual and private shower. Book the Couples Afterglow.`,
    tagline: 'Two tables, one suite, a shared glow.',
    summary:
      'Side-by-side sensual massage for two in our largest suite, opening with a guided connection ritual.',
    intro: [
      'Share the experience with someone you love. The Couples Afterglow takes place in our largest suite, with two therapists working side by side so you can relax into the same rhythm together.',
      'It opens with a short connection ritual — breathing together, a moment of eye contact, a warm shared foot soak — and closes with private time in the suite to linger, shower and talk.',
    ],
    steps: [
      { title: 'Welcome for two', text: 'A shared consultation so each of you can set your own preferences and boundaries.' },
      { title: 'Connection ritual', text: 'Synchronised breathing and a warm foot soak to arrive together.' },
      { title: 'Side-by-side massage', text: 'Two therapists, two heated tables, one slow and sensual rhythm.' },
      { title: 'Private afterglow', text: 'Time alone in your suite with tea before you leave.' },
    ],
    includes: ['Our largest private suite', 'Two therapists', 'Shared foot ritual', 'Private time after the session'],
    idealFor: ['Anniversaries & date nights', 'Couples rediscovering touch', 'A memorable gift'],
    options: [
      { minutes: 90, price: 480 },
      { minutes: 120, price: 600 },
    ],
    faqs: [
      {
        q: 'Can we each choose different pressure or boundaries?',
        a: 'Absolutely. Each of you speaks with your own therapist, and your preferences are respected individually throughout.',
      },
      {
        q: 'Is the price per couple?',
        a: 'Yes — the price shown is for two guests sharing the suite.',
      },
    ],
    related: ['tantric-massage', 'sensual-massage'],
  },
  {
    slug: 'four-hands-massage',
    name: 'Four-Hands Massage',
    accent: 'wine',
    h1: `Four-Hands Sensual Massage in ${CITY}`,
    title: `Four-Hands Massage in ${CITY} | Afterglow Spa`,
    metaDescription: `Two therapists, perfectly in sync: an immersive four-hands sensual massage in ${CITY}. Private suite, warm oil, discreet and strictly 18+. Reserve at Afterglow Spa.`,
    tagline: 'Two therapists moving as one.',
    summary:
      'Two therapists moving in perfect sync — an enveloping, immersive wave of touch your mind can’t quite follow.',
    intro: [
      'With two therapists working in mirrored rhythm, your mind stops trying to track where the touch is — and simply lets go. The effect is immersive, enveloping and deeply sensual.',
      'Our four-hands therapists train together so every stroke is choreographed yet completely responsive to you. It is the most indulgent treatment on our menu.',
    ],
    steps: [
      { title: 'Consultation', text: 'Meet both therapists and agree preferences, pressure and boundaries.' },
      { title: 'Shower & settle', text: 'A rain shower and warm towels, then onto a heated table.' },
      { title: 'Four-hands ritual', text: 'Synchronised, flowing full-body massage with warm oil.' },
      { title: 'Rest', text: 'Stillness, a warm shower and tea in the lounge.' },
    ],
    includes: ['Two trained therapists', 'Private suite with rain shower', 'Warm organic massage oil', 'Herbal tea in the lounge'],
    idealFor: ['Total sensory immersion', 'Celebrations & treats', 'Returning guests'],
    options: [
      { minutes: 60, price: 340 },
      { minutes: 90, price: 460 },
    ],
    faqs: [
      {
        q: 'Can I choose the therapists for a four-hands massage?',
        a: 'You can request a preference when booking and we will do our best to match it based on availability.',
      },
      {
        q: 'Is four-hands too intense for a first visit?',
        a: 'Some guests love it as an introduction; others prefer to start with a Sensual Massage. Either way, you set the pace.',
      },
    ],
    related: ['sensual-massage', 'couples-massage'],
  },
]);

export function findTreatment(slug) {
  const match = TREATMENTS.find((t) => t.slug === slug);
  if (!match) throw new Error(`Unknown treatment slug: "${slug}"`);
  return match;
}

export function lowestPrice(treatment) {
  return Math.min(...treatment.options.map((o) => o.price));
}
