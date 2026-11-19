import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml, html, jsonLd, raw, toString, deepFreeze } from '../src/lib/html.mjs';
import { validateConfig } from '../src/lib/validate.mjs';
import { createRateLimiter } from '../src/lib/rate-limit.mjs';
import { SITE } from '../src/config.mjs';

test('escapeHtml escapes every dangerous character', () => {
  assert.equal(escapeHtml(`<a href="x" onclick='y'>&\``), '&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&#96;');
});

test('html escapes interpolations but keeps nested html/raw', () => {
  const evil = '<img src=x onerror=alert(1)>';
  const out = toString(html`<p>${evil}${html`<b>${'ok'}</b>`}${raw('<i>t</i>')}</p>`);
  assert.equal(out, '<p>&lt;img src=x onerror=alert(1)&gt;<b>ok</b><i>t</i></p>');
});

test('html drops null/undefined/false and flattens arrays', () => {
  assert.equal(toString(html`${null}${undefined}${false}${['a', 'b']}${0}`), 'ab0');
});

test('jsonLd cannot break out of its script tag', () => {
  const out = toString(jsonLd({ name: '</script><script>alert(1)</script>' }));
  assert.equal(out.match(/<\/script>/g).length, 1);
  assert.ok(out.includes('\\u003c/script\\u003e'));
});

test('deepFreeze makes nested data immutable', () => {
  const data = deepFreeze({ a: { b: [1] } });
  assert.ok(Object.isFrozen(data.a.b));
});

test('validateConfig accepts the shipped config (placeholders are warnings only)', () => {
  const { errors, warnings } = validateConfig(SITE);
  assert.deepEqual(errors, []);
  assert.ok(warnings.length > 0);
});

test('validateConfig rejects bad values', () => {
  const bad = {
    ...SITE,
    url: 'http://insecure.test/',
    contact: { ...SITE.contact, phoneE164: '555-1234', email: 'nope' },
    currency: 'dollars',
    booking: { ...SITE.booking, endpoint: 'javascript:alert(1)', minimumAge: 16 },
    hours: [{ days: ['Funday'], opens: '9am', closes: '25:00' }],
  };
  const { errors } = validateConfig(bad);
  const joined = errors.join('\n');
  ['https://', 'end with a slash', 'E.164', 'email', 'ISO 4217', 'endpoint', 'at least 18', 'invalid day', 'HH:MM'].forEach((needle) =>
    assert.ok(joined.includes(needle), `expected an error mentioning "${needle}"`),
  );
});

test('rate limiter allows up to the limit then blocks until the window resets', () => {
  const hit = createRateLimiter({ limit: 2, windowMs: 1000 });
  assert.equal(hit('ip', 0).allowed, true);
  assert.equal(hit('ip', 10).allowed, true);
  const blocked = hit('ip', 20);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterSeconds, 1);
  assert.equal(hit('other', 30).allowed, true);
  assert.equal(hit('ip', 1000).allowed, true);
});

test('rate limiter rejects invalid options', () => {
  assert.throws(() => createRateLimiter({ limit: 0, windowMs: 1000 }));
  assert.throws(() => createRateLimiter({ limit: 1, windowMs: -1 }));
});
