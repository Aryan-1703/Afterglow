/**
 * Static site build: validates config, renders every page to /dist,
 * copies /public and writes sitemap.xml, robots.txt, _headers and the manifest.
 * Usage: node scripts/build.mjs
 */
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from '../src/config.mjs';
import { validateConfig } from '../src/lib/validate.mjs';
import { PUBLIC_DIR } from '../src/lib/assets.mjs';
import { headersFile } from '../src/lib/security.mjs';
import { robotsTxt, sitemapXml, webManifest } from '../src/lib/static-files.mjs';
import { toString } from '../src/lib/html.mjs';
import { allPages } from '../src/pages/index.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const DEFAULT_OUT_DIR = path.join(ROOT, 'dist');
const NOT_FOUND_PATH = '/404.html';

function outputFileFor(page) {
  if (page.file) return page.file;
  const trimmed = page.path.replace(/^\/|\/$/g, '');
  return trimmed ? path.join(trimmed, 'index.html') : 'index.html';
}

function writeOut(outDir, relPath, content) {
  const target = path.join(outDir, relPath);
  const resolved = path.resolve(target);
  if (!resolved.startsWith(path.resolve(outDir) + path.sep)) {
    throw new Error(`Refusing to write outside the output directory: ${relPath}`);
  }
  mkdirSync(path.dirname(resolved), { recursive: true });
  writeFileSync(resolved, content, 'utf8');
}

function checkConfig(log) {
  const { errors, warnings } = validateConfig(SITE);
  warnings.forEach((w) => log(`  ⚠  ${w}`));
  if (errors.length > 0) {
    throw new Error(`Invalid configuration in src/config.mjs:\n  - ${errors.join('\n  - ')}`);
  }
  return warnings;
}

/** Builds the site. Returns a summary used by tests. */
export function build({ outDir = DEFAULT_OUT_DIR, quiet = false } = {}) {
  const log = quiet ? () => {} : (msg) => console.log(msg);
  const warnings = checkConfig(log);

  rmSync(outDir, { recursive: true, force: true });
  cpSync(PUBLIC_DIR, outDir, { recursive: true });

  const pages = allPages();
  pages.forEach((page) => writeOut(outDir, outputFileFor(page), toString(page.content)));

  const indexable = pages.map((p) => p.path).filter((p) => p !== NOT_FOUND_PATH);
  writeOut(outDir, 'sitemap.xml', sitemapXml(indexable));
  writeOut(outDir, 'robots.txt', robotsTxt());
  writeOut(outDir, '_headers', headersFile());
  writeOut(outDir, 'site.webmanifest', webManifest());

  log(`  ✓  Built ${pages.length} pages → ${path.relative(ROOT, outDir) || outDir}`);
  return Object.freeze({ outDir, pages: pages.map((p) => ({ path: p.path, file: outputFileFor(p) })), warnings });
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  try {
    build();
  } catch (err) {
    console.error(`\n✗ Build failed: ${err.message}`);
    process.exitCode = 1;
  }
}
