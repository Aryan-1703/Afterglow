/**
 * Fixed-window, per-key rate limiter (in-memory; fine for a single instance).
 * Returns a function `hit(key, now)` → { allowed, retryAfterSeconds }.
 * Memory is bounded: once `maxKeys` distinct keys exist in a window, every new
 * key shares one overflow bucket, so key-rotation floods can't grow the map.
 */
export const OVERFLOW_KEY = '\u0000overflow';
const DEFAULT_MAX_KEYS = 50_000;

export function createRateLimiter({ limit, windowMs, maxKeys = DEFAULT_MAX_KEYS }) {
  if (!(Number.isInteger(limit) && limit > 0)) throw new Error('limit must be a positive integer');
  if (!(Number.isInteger(windowMs) && windowMs > 0)) throw new Error('windowMs must be a positive integer');
  if (!(Number.isInteger(maxKeys) && maxKeys > 0)) throw new Error('maxKeys must be a positive integer');
  let windowStart = 0;
  let counts = new Map();

  return function hit(rawKey, now = Date.now()) {
    if (now - windowStart >= windowMs) {
      windowStart = now;
      counts = new Map(); // drop the old window wholesale
    }
    const key = counts.has(rawKey) || counts.size < maxKeys ? rawKey : OVERFLOW_KEY;
    const next = (counts.get(key) ?? 0) + 1;
    counts.set(key, next);
    const allowed = next <= limit;
    const retryAfterSeconds = allowed ? 0 : Math.ceil((windowStart + windowMs - now) / 1000);
    return Object.freeze({ allowed, retryAfterSeconds });
  };
}
