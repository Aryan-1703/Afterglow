/** robots.txt, sitemap.xml and the web app manifest — all derived from config. */
import { SITE } from '../config.mjs';
import { absoluteUrl } from './format.mjs';
import { escapeHtml } from './html.mjs';

/**
 * <lastmod> and <priority> are deliberately omitted: Google ignores priority, and
 * distrusts lastmod values that change on every build without a content change.
 */
export function sitemapXml(paths) {
  const urls = paths.map((p) => `  <url><loc>${escapeHtml(absoluteUrl(p))}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function robotsTxt() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`;
}

export function webManifest() {
  return JSON.stringify(
    {
      name: SITE.name,
      short_name: SITE.shortName,
      start_url: '/',
      display: 'standalone',
      background_color: SITE.themeColor,
      theme_color: SITE.themeColor,
      icons: [
        { src: '/assets/img/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/assets/img/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      ],
    },
    null,
    2,
  );
}
