/**
 * Builds the site into a temp folder and audits every page for the SEO,
 * accessibility and security invariants this site depends on.
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { build } from '../scripts/build.mjs';
import { SITE } from '../src/config.mjs';
import { HEAD_SCRIPT } from '../src/lib/security.mjs';

const TITLE_MAX = 70;
const DESCRIPTION_RANGE = Object.freeze([70, 170]);
let outDir;
let pages;

const read = (file) => readFileSync(path.join(outDir, file), 'utf8');
const attr = (htmlStr, re) => (htmlStr.match(re) ?? [])[1];

before(() => {
  outDir = mkdtempSync(path.join(tmpdir(), 'afterglow-build-'));
  const result = build({ outDir, quiet: true });
  pages = result.pages.map((p) => ({ ...p, html: read(p.file) }));
});

after(() => rmSync(outDir, { recursive: true, force: true }));

test('every page has exactly one h1, a lang attribute and a title within limits', () => {
  pages.forEach(({ path: p, html }) => {
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, `${p}: needs exactly one <h1>`);
    assert.match(html, new RegExp(`<html lang="${SITE.lang}">`), `${p}: missing lang`);
    const title = attr(html, /<title>([^<]+)<\/title>/);
    assert.ok(title && title.length <= TITLE_MAX, `${p}: title "${title}" too long`);
  });
});

test('every page has a meta description of useful length', () => {
  pages.forEach(({ path: p, html }) => {
    const d = attr(html, /<meta name="description" content="([^"]+)"/);
    assert.ok(d, `${p}: missing description`);
    assert.ok(d.length >= DESCRIPTION_RANGE[0] && d.length <= DESCRIPTION_RANGE[1], `${p}: description length ${d.length}`);
  });
});

test('titles and descriptions are unique across pages', () => {
  const titles = pages.map((p) => attr(p.html, /<title>([^<]+)<\/title>/));
  const descs = pages.map((p) => attr(p.html, /<meta name="description" content="([^"]+)"/));
  assert.equal(new Set(titles).size, titles.length, 'duplicate <title>');
  assert.equal(new Set(descs).size, descs.length, 'duplicate meta description');
});

test('canonical, Open Graph and Twitter tags point at the configured domain', () => {
  pages.forEach(({ path: p, html }) => {
    assert.equal(attr(html, /<link rel="canonical" href="([^"]+)"/), `${SITE.url}${p}`, `${p}: canonical`);
    assert.equal(attr(html, /<meta property="og:url" content="([^"]+)"/), `${SITE.url}${p}`, `${p}: og:url`);
    assert.match(html, /<meta property="og:image" content="https:\/\/[^"]+og-image\.png"/, `${p}: og:image`);
    assert.match(html, /<meta name="twitter:card" content="summary_large_image">/, `${p}: twitter card`);
  });
});

test('all JSON-LD blocks are valid JSON using schema.org', () => {
  pages.forEach(({ path: p, html }) => {
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    if (p !== '/404.html') assert.ok(blocks.length > 0, `${p}: no structured data`);
    blocks.forEach(([, json]) => assert.equal(JSON.parse(json)['@context'], 'https://schema.org'));
  });
});

test('home page declares the DaySpa business with address and opening hours', () => {
  const home = pages.find((p) => p.path === '/').html;
  const graph = JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  const spa = graph.find((n) => n['@type'] === 'DaySpa');
  assert.ok(spa, 'DaySpa node missing');
  assert.equal(spa.address.addressLocality, SITE.address.city);
  assert.ok(spa.openingHoursSpecification.length > 0);
  assert.ok(spa.hasOfferCatalog.itemListElement.length >= 4);
});

test('every internal link resolves to a built file', () => {
  pages.forEach(({ path: p, html }) => {
    [...html.matchAll(/href="(\/[^"#?]*)/g)].forEach(([, href]) => {
      const file = href.endsWith('/') ? path.join(href, 'index.html') : href;
      assert.ok(existsSync(path.join(outDir, file)), `${p}: broken link ${href}`);
    });
  });
});

test('sitemap lists every indexable page and robots.txt points to it', () => {
  const sitemap = read('sitemap.xml');
  pages.filter((p) => p.path !== '/404.html').forEach((p) => assert.ok(sitemap.includes(`<loc>${SITE.url}${p.path}</loc>`), `sitemap missing ${p.path}`));
  assert.ok(!sitemap.includes('404'), '404 must not be in sitemap');
  assert.ok(read('robots.txt').includes(`Sitemap: ${SITE.url}/sitemap.xml`));
});

test('404 page is noindex; normal pages are indexable', () => {
  pages.forEach(({ path: p, html }) => {
    const robots = attr(html, /<meta name="robots" content="([^"]+)"/);
    assert.equal(robots.startsWith('noindex'), p === '/404.html', `${p}: robots="${robots}"`);
  });
});

test('CSP-safe markup: no inline style attributes or unexpected inline scripts', () => {
  pages.forEach(({ path: p, html }) => {
    assert.ok(!/\sstyle="/.test(html), `${p}: inline style attribute breaks CSP`);
    const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)];
    inline.forEach(([, attrs, body]) => {
      const ok = attrs.includes('application/ld+json') || body === HEAD_SCRIPT;
      assert.ok(ok, `${p}: unexpected inline script`);
    });
  });
});

test('age gate is present on every page and kept out of search snippets', () => {
  pages.forEach(({ path: p, html }) => {
    assert.match(html, /data-age-gate data-nosnippet/, `${p}: age gate`);
  });
  if (SITE.adultRating) pages.forEach(({ html }) => assert.match(html, /<meta name="rating" content="adult">/));
});
