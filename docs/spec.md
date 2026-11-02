# specification.website coverage

How this site meets <https://specification.website/>: which items apply to a
one-page static site on GitHub Pages, and which test checks each one.

**Test layers:**

| Command | Runs | Where | What it covers |
| --- | --- | --- | --- |
| `npm run test:static` | `tests/spec.test.mjs` | Every PR and every deploy | Standards, read from the built HTML |
| `npm run test:static` | `tests/content.test.mjs` | Every PR and every deploy | Agreed copy, brand and legal text. A failure here means the content changed, not that a standard broke. |
| `npm run test:html` | html-validate (recommended rules) | Every PR and every deploy | HTML conformance |
| `npm run test:browser` | `tests/browser.test.mjs` in Chromium | Every PR and every deploy | axe-core WCAG 2.2 AA in light and dark mode, keyboard focus, layout at 320–1920px, 404 status, console and CSP errors |
| `npm run test:live` | `tests/live.test.mjs` | `verify` job after each deploy | The production site: HTTPS redirect, status codes, content types, outbound links |

**Status values** in the tables below:
- ✅ met and tested
- ⚠️ met but not tested automatically
- ❌ failing
- — not applicable, with the reason given

## Foundations

| Item | Status | Where |
| --- | --- | --- |
| `<!doctype html>` first | ✅ | spec: document basics; html-validate (lowercase) |
| `lang` (BCP 47) | ✅ | spec: document basics |
| UTF-8 within the first 1024 bytes | ✅ | spec: document basics |
| Viewport, zoom not disabled | ✅ | spec: document basics |
| One non-empty `<title>` | ✅ | spec: document basics |
| Meta description | ✅ | spec: SEO |
| Canonical URL | ✅ | spec: SEO |
| SVG favicon (adapts to dark tabs), `.ico` fallback, apple-touch-icon | ✅ | spec: icons; spec: favicon visible on dark tabs |
| Maskable PWA icon | — | Not an installable app, so no manifest |
| `theme-color` (light and dark), `color-scheme` | ✅ | spec: icons and colour scheme |
| Open Graph tags | ✅ | spec: SEO |
| Feed | — | No feed |

## SEO

| Item | Status | Where |
| --- | --- | --- |
| robots.txt | ✅ | spec: robots.txt; live: content type |
| XML sitemap, indexable pages only | ✅ | spec: sitemap.xml |
| Explicit indexing policy (404 is `noindex`) | ✅ | spec: resilience |
| Heading levels nested, never skipped | ✅ | spec: landmarks and headings; axe |
| JSON-LD (schema.org Organization) | ✅ | spec: JSON-LD; content: legal entity |
| Content rendered server-side | ✅ | Static HTML, no JavaScript |
| Breadcrumbs | — | Only one page |

## Accessibility

| Item | Status | Where |
| --- | --- | --- |
| Colour contrast | ✅ | axe `color-contrast`, light and dark |
| Text alternatives for images | ✅ | spec; axe |
| Keyboard operable, visible focus | ✅ | browser: keyboard (every link reached in order, outline ≥ 2px) |
| Landmarks (header, main, footer) | ✅ | spec; axe |
| Descriptive link text, accessible names | ✅ | axe `link-name` |
| Document language | ✅ | spec; axe `html-has-lang` |
| Target size (24×24) | ✅ | axe `target-size` (WCAG 2.2) |
| Reduced motion | — | No motion on the site |
| Forced colours | ⚠️ | The mark uses `currentColor`, and no colours are forced. Not tested automatically. |
| Skip link | — | Nothing to skip: no navigation before the main content |
| Forms, media, tables, drag | — | None on the site |

## Security

| Item | Status | Where |
| --- | --- | --- |
| HTTPS for every page | ✅ | live: home page over HTTPS |
| HTTP redirects to HTTPS | ✅ | live: HTTP redirect (301). Needs "Enforce HTTPS" in Settings → Pages, which is on. |
| HSTS | — | GitHub Pages doesn't send it, even with Enforce HTTPS on (checked 2026-11-01), and the site can't set response headers |
| Content Security Policy | ✅ | spec: CSP via `<meta>` (no scripts, `base-uri` and `form-action` `'none'`); browser: no CSP errors |
| All subresources same-origin or HTTPS | ✅ | spec: subresources |
| Referrer-Policy | ✅ | spec: `<meta name="referrer">` |
| `frame-ancestors`, Permissions-Policy, COOP/COEP/CORP, `nosniff` | — | Must be sent as HTTP headers, which GitHub Pages can't set. Would need a CDN or proxy in front. |
| `/.well-known/security.txt` | ⚠️ | Not published. It needs a public security contact; decide which address to use. |
| SRI for third-party assets | — | No third-party assets |

## Performance

| Item | Status | Where |
| --- | --- | --- |
| Inline critical CSS, no render-blocking resources | ✅ | All CSS inline, no scripts, no web fonts |
| Compression, HTTP/2, caching headers | — | Set by GitHub Pages' CDN |
| Core Web Vitals | ⚠️ | Not measured. Very likely fine: one HTML file and one inline SVG. |

## Privacy

| Item | Status | Where |
| --- | --- | --- |
| No non-essential cookies or storage | ✅ | The site sets none, and the CSP blocks scripts |
| No third-party scripts or analytics | ✅ | spec: no executable scripts |
| Privacy policy | ✅ | `/privacy/`, linked from every footer. Names the controller, says the site collects nothing, quotes GitHub's IP logging and links its statement, and gives the right to complain to the ICO. content: privacy notice; spec: privacy; axe on the page. |

## Resilience

| Item | Status | Where |
| --- | --- | --- |
| Custom 404 with a 404 status | ✅ | browser: 404 status (local); live: 404 status |
| Works without JavaScript | ✅ | There is no JavaScript |
| Deploy verified in production | ✅ | live: waits for `<meta name="revision">` to match the deployed commit |
| External uptime monitoring | — | Out of scope |

## Agent readiness and internationalisation

`llms.txt`, Markdown endpoints and multilingual items are not applicable: the site is
one short English page.
