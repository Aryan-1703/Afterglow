/**
 * Content-Security-Policy + security headers.
 * The single inline <head> script is allowed by hash, so no 'unsafe-inline' is needed.
 */
import { createHash } from 'node:crypto';
import { SITE, AGE_STORAGE_KEY } from '../config.mjs';

/** Runs before first paint so the age gate shows without a flash of content. */
export const HEAD_SCRIPT = `(function(d){var c=d.documentElement.classList;c.add('js');try{if(localStorage.getItem('${AGE_STORAGE_KEY}')==='1'){c.add('age-ok');}}catch(e){console.warn('Afterglow: storage unavailable, age check will show on each page.');}})(document);`;

export function scriptHash(source) {
  return `'sha256-${createHash('sha256').update(source, 'utf8').digest('base64')}'`;
}

function endpointOrigin() {
  if (!SITE.booking.endpoint) return '';
  return new URL(SITE.booking.endpoint).origin;
}

/** CSP directives valid inside a <meta> tag (frame-ancestors is header-only). */
export function cspDirectives() {
  const form = endpointOrigin();
  return [
    "default-src 'self'",
    `script-src 'self' ${scriptHash(HEAD_SCRIPT)}`,
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src 'self'${form ? ` ${form}` : ''}`,
    `form-action 'self' mailto:${form ? ` ${form}` : ''}`,
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
  ].join('; ');
}

/** Response headers for every page — used by scripts/serve.mjs and the `_headers` file. */
export function securityHeaders({ https = true } = {}) {
  return Object.freeze({
    'Content-Security-Policy': `${cspDirectives()}; frame-ancestors 'none'${https ? '; upgrade-insecure-requests' : ''}`,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    // No includeSubDomains: other subdomains you may run aren't guaranteed to be HTTPS.
    ...(https ? { 'Strict-Transport-Security': 'max-age=31536000' } : {}),
  });
}

export const ASSET_CACHE_CONTROL = 'public, max-age=31536000, immutable';
export const SHORT_ASSET_CACHE_CONTROL = 'public, max-age=86400, must-revalidate';
export const PAGE_CACHE_CONTROL = 'public, max-age=0, must-revalidate';

/** `_headers` file understood by Netlify and Cloudflare Pages (if you host there instead). */
export function headersFile() {
  const pageHeaders = Object.entries(securityHeaders()).map(([k, v]) => `  ${k}: ${v}`);
  return [
    '/*', ...pageHeaders, '',
    '/assets/*', `  Cache-Control: ${SHORT_ASSET_CACHE_CONTROL}`, '',
    '/assets/fonts/*', `  Cache-Control: ${ASSET_CACHE_CONTROL}`, '',
  ].join('\n');
}
