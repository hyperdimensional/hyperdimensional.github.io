# hyperdimensional.net

Source for <https://www.hyperdimensional.net>, built with [Eleventy](https://www.11ty.dev/).

```sh
npm ci
npm start     # dev server with live reload at http://localhost:8080
npm test      # build to _site/ and run the acceptance tests
```

## Layout

| Path | What it is |
| --- | --- |
| `src/_data/site.js` | Name, URL, description, and company details from Companies House. The only place to change site facts. |
| `src/_includes/layouts/base.njk` | The single page shell: head metadata, mark, footer. |
| `src/_includes/css/site.css` | Design tokens and layout, inlined into every page. |
| `src/assets/` | Published as-is at the site root (`/logo.svg`, `/favicon.ico`, …). `logo.svg` is also the source for the inline mark. |
| `src/*.njk` | Pages and site files (`index`, `404`, `sitemap.xml`, `robots.txt`, `CNAME`). |
| `tests/` | Acceptance tests against the built `_site/`. |
| `docs/design.md` | Design rationale and specification. |

## Configuration

| Variable | Default | Used for |
| --- | --- | --- |
| `SITE_URL` | `https://www.hyperdimensional.net` | Canonical URLs, sitemap, Open Graph, `CNAME` |

## Deployment

Every push to `master` runs `.github/workflows/pages.yml`: install, build, test, then
deploy `_site/` to GitHub Pages. Pull requests build and test only.

One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
