/**
 * Renders the social share image and app icons with headless Chrome,
 * then wraps the 32px PNG into /public/favicon.ico.
 * Usage: node scripts/render-images.mjs   (set CHROME_PATH if Chrome lives elsewhere)
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const IMG_DIR = path.join(ROOT, 'public', 'assets', 'img');
const TEMPLATES = path.join(ROOT, 'scripts', 'images');
const DEFAULT_CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FONT_WAIT_MS = '4000';
const CHROME_TIMEOUT_MS = 30_000;
const ICO_HEADER_BYTES = 6;
const ICO_ENTRY_BYTES = 16;

const RENDERS = Object.freeze([
  { template: 'og.html', out: 'og-image.png', width: 1200, height: 630 },
  { template: 'icon.html', out: 'icon-512.png', width: 512, height: 512 },
  { template: 'icon.html', out: 'icon-192.png', width: 192, height: 192 },
  { template: 'icon.html', out: 'apple-touch-icon.png', width: 180, height: 180 },
  { template: 'icon.html', out: 'favicon-32.png', width: 32, height: 32 },
]);

function chromePath() {
  const candidate = process.env.CHROME_PATH || DEFAULT_CHROME;
  if (!existsSync(candidate)) throw new Error(`Chrome not found at "${candidate}". Set CHROME_PATH.`);
  return candidate;
}

function render(chrome, { template, out, width, height }) {
  const target = path.join(IMG_DIR, out);
  execFileSync(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--allow-file-access-from-files',
    '--force-device-scale-factor=1',
    `--virtual-time-budget=${FONT_WAIT_MS}`,
    `--window-size=${width},${height}`,
    `--screenshot=${target}`,
    `${pathToFileURL(path.join(TEMPLATES, template)).href}?size=${width}`,
  ], { stdio: 'ignore', timeout: CHROME_TIMEOUT_MS });
  if (!existsSync(target)) throw new Error(`Chrome did not produce ${out}`);
  console.log(`  ✓  ${out} (${width}×${height})`);
}

/** An .ico file may embed a PNG directly — one 22-byte header, then the PNG. */
function pngToIco(pngPath, icoPath, size) {
  const png = readFileSync(pngPath);
  const header = Buffer.alloc(ICO_HEADER_BYTES + ICO_ENTRY_BYTES);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // image count
  header.writeUInt8(size, 6);
  header.writeUInt8(size, 7);
  header.writeUInt16LE(1, 10); // colour planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(ICO_HEADER_BYTES + ICO_ENTRY_BYTES, 18);
  writeFileSync(icoPath, Buffer.concat([header, png]));
  console.log('  ✓  favicon.ico');
}

try {
  mkdirSync(IMG_DIR, { recursive: true });
  const chrome = chromePath();
  RENDERS.forEach((r) => render(chrome, r));
  pngToIco(path.join(IMG_DIR, 'favicon-32.png'), path.join(ROOT, 'public', 'favicon.ico'), 32);
} catch (err) {
  console.error(`✗ Image render failed: ${err.message}`);
  process.exitCode = 1;
}
