/**
 * SEO helpers: <head> meta tags and schema.org JSON-LD builders.
 */
import { SITE } from '../config.mjs';
import { html, jsonLd } from './html.mjs';
import { absoluteUrl, addressLine, socialLinks } from './format.mjs';
import { lowestPrice } from '../content/treatments.mjs';

export const OG_IMAGE = Object.freeze({ path: '/assets/img/og-image.png', width: 1200, height: 630 });
const BUSINESS_ID = `${SITE.url}/#spa`;
const WEBSITE_ID = `${SITE.url}/#website`;

export function metaTags({ title, description, path, ogType = 'website', noindex = false }) {
  const url = absoluteUrl(path);
  const image = absoluteUrl(OG_IMAGE.path);
  const robots = noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1';
  return html`
    <title>${title}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${url}">
    <meta name="robots" content="${robots}">
    ${SITE.adultRating ? html`<meta name="rating" content="adult">` : ''}
    <meta property="og:type" content="${ogType}">
    <meta property="og:site_name" content="${SITE.name}">
    <meta property="og:locale" content="${SITE.locale}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${image}">
    <meta property="og:image:width" content="${OG_IMAGE.width}">
    <meta property="og:image:height" content="${OG_IMAGE.height}">
    <meta property="og:image:alt" content="${SITE.name} — warm amber glow">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${image}">`;
}

function postalAddress() {
  const a = SITE.address;
  return {
    '@type': 'PostalAddress',
    streetAddress: a.street,
    addressLocality: a.city,
    addressRegion: a.region,
    postalCode: a.postalCode,
    addressCountry: a.country,
  };
}

function openingHours() {
  return SITE.hours.map((h) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: h.days,
    opens: h.opens,
    closes: h.closes,
  }));
}

function treatmentOffer(treatment) {
  return {
    '@type': 'Offer',
    priceCurrency: SITE.currency,
    price: lowestPrice(treatment),
    url: absoluteUrl(`/treatments/${treatment.slug}/`),
    itemOffered: { '@type': 'Service', name: treatment.name, description: treatment.summary },
  };
}

export function businessSchema(treatments) {
  const sameAs = socialLinks();
  return {
    '@type': 'DaySpa',
    '@id': BUSINESS_ID,
    name: SITE.name,
    description: `Erotic spa in ${SITE.address.city} offering sensual, tantric, couples and four-hands massage in private suites. Strictly ${SITE.booking.minimumAge}+.`,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/assets/img/icon-512.png'),
    image: absoluteUrl(OG_IMAGE.path),
    telephone: SITE.contact.phoneE164,
    email: SITE.contact.email,
    address: postalAddress(),
    ...(SITE.geo ? { geo: { '@type': 'GeoCoordinates', ...SITE.geo } } : {}),
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine())}`,
    openingHoursSpecification: openingHours(),
    priceRange: SITE.priceRange,
    currenciesAccepted: SITE.currency,
    foundingDate: SITE.foundingYear,
    ...(sameAs.length ? { sameAs } : {}),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Treatments',
      itemListElement: treatments.map(treatmentOffer),
    },
  };
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: absoluteUrl('/'),
    name: SITE.name,
    inLanguage: SITE.lang,
    publisher: { '@id': BUSINESS_ID },
  };
}

export function webPageSchema({ title, description, path, type = 'WebPage' }) {
  return {
    '@type': type,
    '@id': `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name: title,
    description,
    inLanguage: SITE.lang,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': BUSINESS_ID },
  };
}

export function breadcrumbSchema(crumbs) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function serviceSchema(treatment) {
  return {
    '@type': 'Service',
    '@id': `${absoluteUrl(`/treatments/${treatment.slug}/`)}#service`,
    name: treatment.name,
    serviceType: treatment.name,
    description: treatment.summary,
    provider: { '@id': BUSINESS_ID },
    areaServed: { '@type': 'City', name: SITE.address.city },
    audience: { '@type': 'PeopleAudience', suggestedMinAge: SITE.booking.minimumAge },
    offers: treatment.options.map((o) => ({
      '@type': 'Offer',
      name: `${treatment.name} — ${o.minutes} minutes`,
      price: o.price,
      priceCurrency: SITE.currency,
      availability: 'https://schema.org/InStock',
    })),
  };
}

export function faqSchema(faqs) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

/** Wraps nodes in a single @graph block. */
export function structuredData(nodes) {
  return jsonLd({ '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) });
}
