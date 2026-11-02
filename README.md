# hyperdimensional.net

Source for <https://www.hyperdimensional.net>, built with [Eleventy](https://www.11ty.dev/).

```sh
npm ci
npm start     # dev server with live reload at http://localhost:8080
npm test      # build, then static checks, HTML validation and browser checks
npm run test:live   # check the production site (needs LIVE_URL)
```

Browser checks need Chromium: `npx playwright install chromium` once.
`docs/spec.md` maps every specification.website item to the test that checks it.

## Layout

| Path | What it is |
| --- | --- |
| `src/_data/site.js` | Name, URL, description, and company details from Companies House. The only place to change site facts. |
| `src/_includes/layouts/base.njk` | The single page shell: head metadata, mark, footer. |
| `src/_includes/css/site.css` | Design tokens and layout, inlined into every page. |
| `src/assets/` | Published as-is at the site root (`/logo.svg`, `/favicon.ico`, …). `logo.svg` is also the source for the inline mark. |
| `src/*.njk` | Pages and site files (`index`, `privacy`, `404`, `sitemap.xml`, `robots.txt`, `CNAME`, `favicon.svg`). |
| `tests/` | `spec` (standards), `content` (copy and legal), `browser` (axe, keyboard, layout) and `live` (production) tests. |
| `docs/design.md` | Design rationale and specification. |
| `docs/spec.md` | specification.website coverage: what's tested, what isn't, and why. |

## Configuration

| Variable | Default | Used for |
| --- | --- | --- |
| `SITE_URL` | `https://www.hyperdimensional.net` | Canonical URLs, sitemap, Open Graph, `CNAME` |

## Deployment

Every push to `master` runs `.github/workflows/pages.yml`: install, build, test, deploy
`_site/` to GitHub Pages, then `verify`. The verify job waits until the live site serves this
commit, then runs `npm run test:live`. Pull requests build and test only.

One-time setup, both in **Settings → Pages**:
- **Source: GitHub Actions**
- **Enforce HTTPS** ticked
