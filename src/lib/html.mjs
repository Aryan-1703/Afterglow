/**
 * Tiny, dependency-free HTML templating.
 * Every interpolated value is escaped unless it was produced by `html` or `raw`,
 * so content from config/data files can never inject markup.
 */

const RAW = Symbol('raw-html');

const ESCAPES = Object.freeze({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;',
});

export function escapeHtml(value) {
  return String(value).replace(/[&<>"'`]/g, (ch) => ESCAPES[ch]);
}

/** Marks a trusted string as already-safe HTML. Use sparingly. */
export function raw(value) {
  return Object.freeze({ [RAW]: true, value: String(value) });
}

export function isRaw(value) {
  return Boolean(value && value[RAW] === true);
}

function renderValue(value) {
  if (value === null || value === undefined || value === false) return '';
  if (Array.isArray(value)) return value.map(renderValue).join('');
  if (isRaw(value)) return value.value;
  return escapeHtml(value);
}

/** Tagged template: html`<p>${text}</p>` → safe RawHtml. */
export function html(strings, ...values) {
  const out = strings.reduce(
    (acc, str, i) => acc + str + (i < values.length ? renderValue(values[i]) : ''),
    '',
  );
  return raw(out);
}

/** Serialises structured data safely for a <script type="application/ld+json"> block. */
export function jsonLd(data) {
  const json = JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
  return raw(`<script type="application/ld+json">${json}</script>`);
}

export function toString(value) {
  return renderValue(value);
}

/** Recursively freezes plain objects/arrays so content data stays immutable. */
export function deepFreeze(obj) {
  if (obj && typeof obj === 'object' && !Object.isFrozen(obj)) {
    Object.values(obj).forEach(deepFreeze);
    Object.freeze(obj);
  }
  return obj;
}
