/**
 * Integration tests for scripts/serve.mjs: boots the real server against a fresh build
 * and sends raw HTTP requests (including malformed ones a browser would never send).
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { connect } from 'node:net';
import { fileURLToPath } from 'node:url';
import { build } from '../scripts/build.mjs';

const SERVER = fileURLToPath(new URL('../scripts/serve.mjs', import.meta.url));
const PORT = 40000 + Math.floor(Math.random() * 10000);
const BOOT_TIMEOUT_MS = 10_000;
let server;

/** Sends a raw request line so we control the exact request-target. */
function rawRequest(target, extraHeaders = '') {
  return new Promise((resolve, reject) => {
    const socket = connect(PORT, '127.0.0.1', () => {
      socket.write(`GET ${target} HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n${extraHeaders}\r\n`);
    });
    let data = '';
    socket.on('data', (chunk) => { data += chunk; });
    socket.on('end', () => {
      const [head] = data.split('\r\n\r\n');
      const [statusLine, ...lines] = head.split('\r\n');
      const headers = Object.fromEntries(lines.map((l) => [l.slice(0, l.indexOf(':')).toLowerCase(), l.slice(l.indexOf(':') + 1).trim()]));
      resolve({ status: Number(statusLine.split(' ')[1]), headers });
    });
    socket.on('error', reject);
  });
}

before(async () => {
  build({ quiet: true });
  server = spawn(process.execPath, [SERVER, String(PORT)], { stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, PORT: '' } });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('server did not start')), BOOT_TIMEOUT_MS);
    server.stdout.on('data', (d) => { if (String(d).includes('http://')) { clearTimeout(timer); resolve(); } });
    server.on('exit', (code) => reject(new Error(`server exited early with ${code}`)));
  });
});

after(() => server?.kill());

test('malformed request-targets get 400 and do not crash the process', async () => {
  for (const target of ['//', '//host:99999']) {
    assert.equal((await rawRequest(target)).status, 400, target);
  }
  assert.equal((await rawRequest('/')).status, 200, 'server must still be alive');
});

test('redirects can never become protocol-relative and keep the query string', async () => {
  const dotSlash = await rawRequest('/.//treatments');
  assert.equal(dotSlash.status, 301);
  assert.equal(dotSlash.headers.location, '/treatments/');
  const withQuery = await rawRequest('/book?treatment=tantric-massage');
  assert.equal(withQuery.headers.location, '/book/?treatment=tantric-massage');
});

test('path traversal and the 404 page itself return 404', async () => {
  assert.equal((await rawRequest('/..%2f..%2fpackage.json')).status, 404);
  assert.equal((await rawRequest('/%2e%2e/%2e%2e/src/config.mjs')).status, 404);
  assert.equal((await rawRequest('/404.html')).status, 404);
});

test('security headers, cache policy and ETag revalidation', async () => {
  const page = await rawRequest('/');
  assert.match(page.headers['content-security-policy'], /default-src 'self'/);
  assert.equal(page.headers['x-content-type-options'], 'nosniff');
  assert.match(page.headers['cache-control'], /max-age=0/);
  assert.equal((await rawRequest('/', `If-None-Match: ${page.headers.etag}\r\n`)).status, 304);
  assert.match((await rawRequest('/assets/css/main.css?v=abc')).headers['cache-control'], /immutable/);
  assert.doesNotMatch((await rawRequest('/assets/img/og-image.png')).headers['cache-control'], /immutable/);
});
