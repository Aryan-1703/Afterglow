/**
 * Local preview server for /dist (development only — deploy /dist to a static host).
 * Usage: node scripts/serve.mjs [port]
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.resolve(fileURLToPath(new URL('../dist', import.meta.url)));
const HOST = '127.0.0.1';
const DEFAULT_PORT = 4321;
const MIN_PORT = 1024;
const MAX_PORT = 65535;

const TYPES = Object.freeze({
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
});

function parsePort(arg) {
  const port = Number(arg ?? DEFAULT_PORT);
  if (!Number.isInteger(port) || port < MIN_PORT || port > MAX_PORT) {
    throw new Error(`Port must be an integer between ${MIN_PORT} and ${MAX_PORT}.`);
  }
  return port;
}

/** Maps a URL path to a file inside DIST, or null if it escapes DIST / doesn't exist. */
function resolveFile(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split('?')[0]);
  } catch {
    return null;
  }
  const candidate = path.resolve(DIST, `.${path.posix.normalize(decoded)}`);
  if (candidate !== DIST && !candidate.startsWith(DIST + path.sep)) return null;
  if (existsSync(candidate) && statSync(candidate).isDirectory()) {
    const index = path.join(candidate, 'index.html');
    return existsSync(index) ? index : null;
  }
  return existsSync(candidate) ? candidate : null;
}

function send(res, status, file) {
  res.writeHead(status, {
    'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
  });
  createReadStream(file).pipe(res);
}

function handle(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  const file = resolveFile(req.url ?? '/');
  if (file) return send(res, 200, file);
  const notFound = path.join(DIST, '404.html');
  if (existsSync(notFound)) return send(res, 404, notFound);
  res.writeHead(404).end('Not found');
}

if (!existsSync(DIST)) {
  console.error('No dist/ folder yet — run `npm run build` first.');
  process.exitCode = 1;
} else {
  const port = parsePort(process.argv[2]);
  createServer(handle).listen(port, HOST, () => console.log(`Afterglow preview → http://${HOST}:${port}/`));
}
