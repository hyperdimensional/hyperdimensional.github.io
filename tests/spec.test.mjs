// Standards checks on the built site, from https://specification.website/
// (the items that apply to a static site on GitHub Pages; see docs/spec.md).
// Copy and brand checks live in content.test.mjs; rendered-page checks in browser.test.mjs.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { read, exists, headOf, PAGES, ORIGIN } from './helpers.mjs';

describe('Foundations', () => {
  for (const page of PAGES) {
    const html = read(page);
    const head = headOf(html);

    test(`${page}: document basics`, () => {
      assert.match(html, /^<!doctype html>/, 'HTML5 doctype first');
      assert.match(html, /<html lang="en">/, 'BCP 47 language');
      const cs = html.indexOf('<meta charset="utf-8">');
      assert.ok(cs > -1 && cs < 1024, 'UTF-8 declared within the first 1024 bytes');
      assert.match(head, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
      assert.doesNotMatch(head, /user-scalable=no|maximum-scale/, 'zoom never disabled');
      assert.equal((head.match(/<title>[^<]+<\/title>/g) || []).length, 1, 'exactly one non-empty title');
    });

    test(`${page}: icons and colour scheme`, () => {
      assert.match(head, /<link rel="icon" href="\/favicon\.svg" type="image\/svg\+xml">/, 'SVG favicon');
      assert.match(head, /<link rel="icon" href="\/favicon\.ico" sizes="32x32">/, '.ico fallback');
      assert.match(head, /<link rel="apple-touch-icon" href="\/apple-touch-icon\.png">/);
      assert.match(head, /<meta name="color-scheme" content="light dark">/);
      assert.match(head, /<meta name="theme-color" content="#ffffff" media="\(prefers-color-scheme: light\)">/);
      assert.match(head, /<meta name="theme-color" content="#000000" media="\(prefers-color-scheme: dark\)">/);
    });
  }
});

describe('Security', () => {
  for (const page of PAGES) {
    const html = read(page);
    const head = headOf(html);

    test(`${page}: no executable scripts, restrictive CSP`, () => {
      assert.doesNotMatch(html, /<script(?![^>]*application\/ld\+json)/);
      assert.match(head, /http-equiv="Content-Security-Policy" content="[^"]*default-src 'none'[^"]*script-src 'none'/);
      assert.match(head, /base-uri 'none'/);
      assert.match(head, /form-action 'none'/);
    });

    test(`${page}: referrer policy`, () => {
      assert.match(head, /<meta name="referrer" content="strict-origin-when-cross-origin">/);
    });

    test(`${page}: every subresource is same-origin or HTTPS`, () => {
      for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g))
        assert.ok(/^(\/|#|https:\/\/|mailto:)/.test(url), `insecure or relative reference: ${url}`);
    });
  }
});

describe('Accessibility (structure)', () => {
  for (const page of PAGES) {
    const html = read(page);

    test(`${page}: landmarks and headings`, () => {
      for (const lm of ['header', 'main', 'footer']) assert.match(html, new RegExp(`<${lm}[\\s>]`), lm);
      assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, 'exactly one h1');
      const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => +m[1]);
      levels.forEach((l, i) => i && assert.ok(l <= levels[i - 1] + 1, `heading levels skip: ${levels}`));
    });

    test(`${page}: images have text alternatives`, () => {
      for (const img of html.match(/<img\b[^>]*>/g) || []) assert.match(img, /\balt=/, img);
      for (const svg of html.match(/<svg\b[^>]*>/g) || []) assert.match(svg, /aria-hidden="true"|role="img"/, svg);
    });
  }
});

describe('SEO and discovery', () => {
  const head = headOf(read('index.html'));

  test('home page: description, canonical, Open Graph', () => {
    assert.match(head, /<meta name="description" content="[^"]{20,160}">/);
    assert.match(head, new RegExp(`<link rel="canonical" href="${ORIGIN}/">`));
    for (const p of ['title', 'description', 'url', 'type', 'image', 'image:alt', 'image:width', 'image:height'])
      assert.match(head, new RegExp(`<meta property="og:${p}" content="[^"]+">`), `og:${p}`);
  });

  test('home page: JSON-LD parses as a schema.org Organization', () => {
    const ld = JSON.parse(head.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(ld['@context'], 'https://schema.org');
    assert.equal(ld['@type'], 'Organization');
    assert.equal(ld.url, `${ORIGIN}/`);
  });

  test('robots.txt allows crawling and points at the sitemap', () => {
    const robots = read('robots.txt');
    assert.match(robots, /^User-agent: \*$/m);
    assert.match(robots, new RegExp(`^Sitemap: ${ORIGIN}/sitemap\\.xml$`, 'm'));
  });

  test('sitemap.xml lists indexable pages only', () => {
    const xml = read('sitemap.xml');
    assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    assert.match(xml, new RegExp(`<loc>${ORIGIN}/</loc>`));
    assert.doesNotMatch(xml, /404/);
  });
});

describe('Privacy', () => {
  for (const page of PAGES)
    test(`${page}: links to the privacy notice from the footer`, () => {
      const html = read(page);
      assert.match(html.slice(html.indexOf('<footer'), html.indexOf('</footer>')), /<a href="\/privacy\/">Privacy<\/a>/);
    });

  test('privacy notice is indexable and in the sitemap', () => {
    assert.doesNotMatch(headOf(read('privacy/index.html')), /noindex/);
    assert.match(read('sitemap.xml'), new RegExp(`<loc>${ORIGIN}/privacy/</loc>`));
  });
});

describe('Resilience', () => {
  test('404 page is noindex and links home', () => {
    const html = read('404.html');
    assert.match(headOf(html), /<meta name="robots" content="noindex">/);
    assert.match(html, /<a href="\/">/);
  });

  test('SVG favicon stays visible on dark browser tabs', () => {
    const svg = read('favicon.svg').replace(/\s+/g, ' ');
    assert.doesNotMatch(svg, /currentColor/, 'currentColor resolves to black in a tab, invisible on dark');
    assert.match(svg, /@media \(prefers-color-scheme: ?dark\) ?\{[^}]*fill: ?#fff/);
  });

  test('published files exist at the root, CNAME matches SITE_URL', () => {
    for (const f of ['logo.svg', 'favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'og-image.png', 'robots.txt', 'sitemap.xml', 'CNAME'])
      assert.ok(exists(f), f);
    assert.equal(read('CNAME').trim(), new URL(ORIGIN).host);
  });

  test('pages carry the build revision, so a deploy can be verified', () => {
    for (const page of PAGES)
      assert.match(headOf(read(page)), /<meta name="revision" content="(?:[0-9a-f]{7,40}|local)">/, page);
  });
});
