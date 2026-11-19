/**
 * Static server for /dist — local preview AND production (e.g. Railway).
 *   Local:      npm start            → http://127.0.0.1:4321
 *   Production: PORT is provided     → binds 0.0.0.0:$PORT
 * Adds security headers, long-lived asset caching, gzip, clean-URL redirects and rate limiting.
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { pipeline } from 'node:stream';
import { createGzip } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ASSET_CACHE_CONTROL, PAGE_CACHE_CONTROL, SHORT_ASSET_CACHE_CONTROL, securityHeaders } from '../src/lib/security.mjs';
import { createRateLimiter } from '../src/lib/rate-limit.mjs';

const DIST = path.resolve(fileURLToPath(new URL('../dist', import.meta.url)));
const DEFAULT_PORT = 4321;
const MAX_PORT = 65535;
const RATE_LIMIT = Object.freeze({ limit: 600, windowMs: 60_000 });
const TIMEOUTS = Object.freeze({ headersMs: 15_000, requestMs: 30_000, keepAliveMs: 5_000 });
const MAX_HEADERS = 100;
const MAX_HEADER_BYTES = 16_384;
const NOT_FOUND_FILE = '404.html';
const IS_HOSTED = Boolean(process.env.PORT);
const TRUST_PROXY = process.env.TRUST_PROXY === '1' || Boolean(process.env.RAILWAY_ENVIRONMENT_ID || process.env.RAILWAY_ENVIRONMENT);
const HOST = process.env.HOST || (IS_HOSTED ? '0.0.0.0' : '127.0.0.1');
// Local preview is plain http, so HSTS / upgrade-insecure-requests only apply when hosted.
const SECURITY_HEADERS = securityHeaders({ https: IS_HOSTED });

const TYPES = Object.freeze({
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
});
const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.json', '.webmanifest', '.xml', '.txt', '.svg']);

function parsePort(value) {
  const port = Number(value ?? DEFAULT_PORT);
  if (!Number.isInteger(port) || port < 1 || port > MAX_PORT) throw new Error(`Invalid port: ${value}`);
  return port;
}

/** Behind a trusted proxy the RIGHTMOST X-Forwarded-For entry is the one the proxy appended. */
function clientKey(req) {
  if (TRUST_PROXY) {
    const hops = String(req.headers['x-forwarded-for'] ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1];
  }
  return req.socket.remoteAddress || 'unknown';
}

/** Collapses duplicate slashes so redirects can never become protocol-relative (`//host`). */
function canonicalPath(decoded) {
  return path.posix.normalize(`/${decoded}`).replace(/\/{2,}/g, '/');
}

/** Maps a URL path to { file } | { redirect } | null. Never escapes DIST. */
function resolve(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  if (decoded.includes('\0')) return null;
  const clean = canonicalPath(decoded);
  const candidate = path.resolve(DIST, `.${clean}`);
  if (candidate !== DIST && !candidate.startsWith(DIST + path.sep)) return null;
  if (!existsSync(candidate)) return null;
  if (statSync(candidate).isDirectory()) {
    if (!clean.endsWith('/')) return { redirect: encodeURI(`${clean}/`) };
    const index = path.join(candidate, 'index.html');
    return existsSync(index) ? { file: index } : null;
  }
  if (path.basename(candidate) === 'index.html') return { redirect: encodeURI(clean.slice(0, -'index.html'.length)) };
  return { file: candidate };
}

/** Immutable caching only for URLs that change when content changes (?v=hash) and fonts. */
function cacheControlFor(url) {
  if (url.searchParams.has('v') || url.pathname.startsWith('/assets/fonts/')) return ASSET_CACHE_CONTROL;
  if (url.pathname.startsWith('/assets/')) return SHORT_ASSET_CACHE_CONTROL;
  return PAGE_CACHE_CONTROL;
}

function send(req, res, status, file, cacheControl) {
  const ext = path.extname(file);
  const stats = statSync(file);
  const etag = `W/"${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}"`;
  const gzip = COMPRESSIBLE.has(ext) && /\bgzip\b/.test(String(req.headers['accept-encoding'] ?? ''));
  const headers = { ...SECURITY_HEADERS, 'Cache-Control': cacheControl, ETag: etag, Vary: 'Accept-Encoding' };
  if (status === 200 && req.headers['if-none-match'] === etag) {
    res.writeHead(304, headers).end();
    return;
  }
  res.writeHead(status, {
    ...headers,
    'Content-Type': TYPES[ext] ?? 'application/octet-stream',
    ...(gzip ? { 'Content-Encoding': 'gzip' } : {}),
  });
  if (req.method === 'HEAD') return res.end();
  const streams = gzip ? [createReadStream(file), createGzip(), res] : [createReadStream(file), res];
  pipeline(...streams, (err) => {
    // pipeline destroys every stream on error/abort, so no file descriptors leak.
    if (err && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
      console.error(`Stream failed for ${path.relative(DIST, file)}: ${err.code ?? err.message}`);
    }
  });
}

function reply(res, status, extraHeaders = {}, body = '') {
  res.writeHead(status, { ...SECURITY_HEADERS, ...extraHeaders }).end(body);
}

function route(req, res, hit) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return reply(res, 405, { Allow: 'GET, HEAD' });
  const verdict = hit(clientKey(req));
  if (!verdict.allowed) return reply(res, 429, { 'Retry-After': String(verdict.retryAfterSeconds) }, 'Too many requests');
  let url;
  try {
    url = new URL(req.url ?? '/', 'http://localhost');
  } catch {
    return reply(res, 400, {}, 'Bad request');
  }
  const notFound = path.join(DIST, NOT_FOUND_FILE);
  const target = resolve(url.pathname);
  if (target?.redirect) return reply(res, 301, { Location: `${target.redirect}${url.search}` });
  if (target?.file && target.file !== notFound) return send(req, res, 200, target.file, cacheControlFor(url));
  if (existsSync(notFound)) return send(req, res, 404, notFound, PAGE_CACHE_CONTROL);
  return reply(res, 404, {}, 'Not found');
}

function createHandler() {
  const hit = createRateLimiter(RATE_LIMIT);
  return function handle(req, res) {
    try {
      route(req, res, hit);
    } catch (err) {
      console.error(`Request handling failed: ${err.code ?? err.message}`);
      if (!res.headersSent) reply(res, 500, {}, 'Internal server error');
      else res.destroy();
    }
  };
}

function main() {
  if (!existsSync(DIST)) {
    console.error('No dist/ folder yet — run `npm run build` first.');
    process.exitCode = 1;
    return;
  }
  let port;
  try {
    port = parsePort(process.env.PORT || process.argv[2]);
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
    return;
  }
  const server = createServer({ maxHeaderSize: MAX_HEADER_BYTES }, createHandler());
  server.on('error', (err) => {
    console.error(`Server error: ${err.code ?? err.message}`);
    process.exitCode = 1;
  });
  server.headersTimeout = TIMEOUTS.headersMs;
  server.requestTimeout = TIMEOUTS.requestMs;
  server.keepAliveTimeout = TIMEOUTS.keepAliveMs;
  server.maxHeadersCount = MAX_HEADERS;
  server.listen(port, HOST, () => console.log(`Afterglow Spa → http://${HOST}:${port}/`));
  const shutdown = () => server.close(() => process.exit(0));
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main();
