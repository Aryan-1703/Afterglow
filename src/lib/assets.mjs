/**
 * Cache-busting: appends a short content hash to asset URLs so long-lived
 * caching (see _headers) never serves stale CSS/JS after a deploy.
 */
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const PUBLIC_DIR = fileURLToPath(new URL('../../public/', import.meta.url));
const HASH_LENGTH = 10;
const cache = new Map();

export function asset(urlPath) {
  if (cache.has(urlPath)) return cache.get(urlPath);
  const file = path.join(PUBLIC_DIR, urlPath);
  if (!existsSync(file)) throw new Error(`Asset not found in /public: ${urlPath}`);
  const hash = createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, HASH_LENGTH);
  const versioned = `${urlPath}?v=${hash}`;
  cache.set(urlPath, versioned);
  return versioned;
}
