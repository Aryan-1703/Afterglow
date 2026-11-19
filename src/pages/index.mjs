import { homePage } from './home.mjs';
import { treatmentPages } from './treatments.mjs';
import { etiquettePage, faqPage, spaPage } from './info.mjs';
import { bookPage } from './book.mjs';
import { notFoundPage, privacyPage } from './legal.mjs';

/** Sitemap priority per path prefix (most specific first). */
export const SITEMAP_PRIORITY = Object.freeze([
  ['/treatments/', 0.9],
  ['/book/', 0.8],
  ['/privacy/', 0.2],
]);

/** Every page in the site. Each item: { path, content, file? }. */
export function allPages() {
  return [
    homePage(),
    ...treatmentPages(),
    spaPage(),
    etiquettePage(),
    faqPage(),
    bookPage(),
    privacyPage(),
    notFoundPage(),
  ];
}
