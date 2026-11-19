# Afterglow Spa: website

A fast, SEO-first website for Afterglow Spa. It is generated as plain static HTML, so search engines get complete, crawlable pages with no client-side rendering. Only Node is needed to build it.

```bash
npm start        # build + preview at http://127.0.0.1:4321
npm test         # unit tests + SEO/security audit of every generated page
npm run build    # build only → dist/
npm run images   # re-render social image + icons (needs Chrome)
```

## Before you launch

1. **Edit `src/config.mjs`.** Set the domain, address, phone, email, opening hours, map coordinates and booking endpoint. `npm run build` warns about every placeholder that's still in there.
2. **Set your prices** in `src/content/treatments.mjs`.
3. **Review all copy and policies** (`src/content/copy.mjs`): the cancellation, ID and payment rules are sensible defaults, not facts about your business. Also have `/privacy/` reviewed for your jurisdiction.
4. **Booking form:** create a free form endpoint (e.g. Formspree) and paste its URL into `SITE.booking.endpoint`. Until you do, the form opens the guest's email app instead.
5. **Add real photography** if you have it: WebP, with descriptive `alt` text and explicit width/height.

## Deploying

- **Railway:** `npm start` builds the site and serves it. The server reads `PORT`, binds `0.0.0.0` and adds security headers, gzip, long-lived asset caching, clean-URL redirects and per-IP rate limiting.
- **Any static host** (Netlify, Cloudflare Pages, etc.): run `npm run build` and publish `dist/`. The generated `_headers` file carries the security and caching headers.

## SEO already built in

- A unique title, meta description, canonical URL, Open Graph and Twitter card on every page.
- One landing page per treatment, each targeting "<treatment> in <city>".
- schema.org JSON-LD: `DaySpa` (address, hours, geo, price range, offer catalog), `Service` + `Offer` per treatment, `BreadcrumbList`, `FAQPage`, `WebSite`.
- `sitemap.xml` and `robots.txt` generated from your domain; the 404 page is `noindex`.
- Semantic HTML with one `h1` per page, clean URLs, internal linking and accessible markup.
- Performance: self-hosted fonts (no third-party requests), deferred JS, a ~4 KB WebGL hero instead of a 3D library, and cache-busted assets.
- The 18+ age gate is an overlay. Page content stays in the HTML for crawlers, and Google exempts legally-required age checks from its interstitial penalty.
- `<meta name="rating" content="adult">` is set (`SITE.adultRating`) so SafeSearch classifies the site honestly. Turning it off won't hide the nature of the business from Google, and mislabelling adult content can hurt you.

`npm test` enforces most of this list on every build.

## After launch (where rankings actually come from)

1. Verify the domain in **Google Search Console** and **Bing Webmaster Tools**, then submit `/sitemap.xml`.
2. Claim a **Google Business Profile** if your category and jurisdiction allow it. It is the biggest driver of local "near me" traffic. Keep your name, address and phone **identical** everywhere.
3. List the spa in reputable local and adult-friendly directories, using the same name, address and phone.
4. Ask happy guests for genuine reviews. Never post fake ones.
5. Note that Google Ads and Meta generally don't allow erotic-massage advertising, so organic SEO and directories are your main channels.

## Structure

```
src/config.mjs           ← business settings (edit me)
src/content/             ← treatments, FAQs, etiquette, page copy
src/pages/               ← one module per page/template
src/templates/           ← layout (head, header, footer, age gate) + components
src/lib/                 ← escaping templater, SEO/JSON-LD, CSP, validation, rate limiter
public/                  ← CSS, JS, fonts, images (copied to dist/)
scripts/                 ← build, server, image renderer
tests/                   ← node:test suites
```
