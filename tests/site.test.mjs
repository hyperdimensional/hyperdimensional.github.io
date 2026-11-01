// Acceptance checks on the built site (_site/).
// Scope: the parts of https://specification.website/ that apply to a static
// site on GitHub Pages, plus the design contract in docs/design.md.
// Run: npm test   (builds first, then node --test)
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const out = fileURLToPath(new URL('../_site/', import.meta.url));
const read = (f) => readFileSync(join(out, f), 'utf8');
const ORIGIN = process.env.SITE_URL ?? 'https://www.hyperdimensional.net';
const headOf = (html) => html.slice(0, html.indexOf('</head>'));

describe('every page', () => {
  for (const page of ['index.html', '404.html']) {
    const html = read(page);
    const head = headOf(html);

    test(`${page}: document foundations`, () => {
      assert.match(html, /^<!doctype html>/);
      assert.match(html, /<html lang="en">/);
      const cs = html.indexOf('<meta charset="utf-8">');
      assert.ok(cs > -1 && cs < 1024, 'utf-8 declared within first 1024 bytes');
      assert.match(head, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
      assert.doesNotMatch(head, /user-scalable=no|maximum-scale/);
      assert.equal((head.match(/<title>[^<]+<\/title>/g) || []).length, 1);
      assert.match(head, /<meta name="color-scheme" content="light dark">/);
      assert.match(head, /<meta name="theme-color" content="#ffffff" media="\(prefers-color-scheme: light\)">/);
      assert.match(head, /<meta name="theme-color" content="#000000" media="\(prefers-color-scheme: dark\)">/);
      assert.match(head, /<link rel="icon" href="\/logo\.svg" type="image\/svg\+xml">/);
      assert.match(head, /<link rel="apple-touch-icon" href="\/apple-touch-icon\.png">/);
    });

    test(`${page}: no JavaScript, restrictive CSP`, () => {
      assert.doesNotMatch(html, /<script(?![^>]*application\/ld\+json)/);
      assert.match(head, /http-equiv="Content-Security-Policy" content="[^"]*default-src 'none'[^"]*script-src 'none'/);
    });

    test(`${page}: accessibility`, () => {
      assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, 'exactly one h1');
      for (const lm of ['header', 'main', 'footer']) assert.match(html, new RegExp(`<${lm}[\\s>]`), lm);
      assert.doesNotMatch(html, /glitch|data-text=|@keyframes/, 'no glitch effect');
      const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => +m[1]);
      levels.forEach((l, i) => i && assert.ok(l <= levels[i - 1] + 1, `heading levels skip: ${levels}`));
      assert.match(html, /<svg[^>]*aria-hidden="true"/, 'inline mark is decorative (name is in the h1)');
      for (const img of html.match(/<img\b[^>]*>/g) || []) assert.match(img, /\balt=/, img);
    });
  }
});

describe('home page', () => {
  const html = read('index.html');
  const head = headOf(html);

  test('discovery metadata', () => {
    assert.match(head, /<meta name="description" content="[^"]{20,160}">/);
    assert.match(head, new RegExp(`<link rel="canonical" href="${ORIGIN}/">`));
    for (const p of ['title', 'description', 'url', 'type', 'image', 'image:alt'])
      assert.match(head, new RegExp(`<meta property="og:${p}" content="[^"]+">`), `og:${p}`);
    const ld = JSON.parse(head.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(ld['@type'], 'Organization');
    assert.equal(ld.url, `${ORIGIN}/`);
    assert.equal(ld.foundingDate, '2001-06-30');
  });

  test('content: name, provenance, copyright', () => {
    assert.match(html, /<h1 class="wordmark">hyperdimensional<\/h1>/);
    assert.match(html, /<time datetime="2001-06-30T15:26:43Z">993914803<\/time>/, 'Unix timestamp as machine-readable date');
    const year = new Date().getUTCFullYear();
    assert.match(html, new RegExp(`<p>© 2001–${year}</p>`), 'copyright range in plain years, ending this year');
    assert.doesNotMatch(html, /\b[MDCLXVI]{3,}\b/, 'no Roman numerals');
  });
});

describe('home page copy', () => {
  const html = read('index.html');
  const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));

  test('describes both sides of the company', () => {
    assert.match(main, /<p class="lede">[^<]*delivery[^<]*<\/p>/i, 'lede names delivery');
    assert.match(main, /<p class="lede">[^<]*perform[^<]*<\/p>/i, 'lede names performance');
    const h2 = [...main.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)].map((m) => m[1]);
    assert.deepEqual(h2, ['Delivery', 'Creative technology']);
  });

  test('alludes to the work, with links', () => {
    for (const [name, href] of [
      ['Padjam', 'https://padjam.app/'],
      ['Tidal Cycles MCP', 'https://github.com/Benedict/tidal-cycles-mcp-server'],
      ['Drift', 'https://drift.place/'],
      ['A Partial Guide', 'https://apartialguide.com/'],
    ]) assert.match(main, new RegExp(`<a href="${href}">${name}</a>`), name);
  });

  test('links to the writing', () => {
    assert.match(html, /<a href="https:\/\/profound\.fyi\/">/);
  });
});

describe('404 page', () => {
  test('is noindex and links home', () => {
    const html = read('404.html');
    assert.match(html, /<meta name="robots" content="noindex">/);
    assert.match(html, /<a href="\/">/);
  });
});

describe('site files', () => {
  test('robots.txt points at the sitemap', () => {
    assert.match(read('robots.txt'), new RegExp(`^Sitemap: ${ORIGIN}/sitemap\\.xml$`, 'm'));
  });
  test('sitemap.xml lists the home page and not the 404', () => {
    const xml = read('sitemap.xml');
    assert.match(xml, new RegExp(`<loc>${ORIGIN}/</loc>`));
    assert.doesNotMatch(xml, /404/);
  });
  test('the mark is circular: a 216-unit disc (18 glyph modules) with the glyph centred', () => {
    const svg = read('logo.svg').replace(/\s+/g, ' ');
    assert.match(svg, /viewBox="0 0 216 216"/);
    assert.match(svg, /d=" ?M108 0A108 108 0 1 1 108 216A108 108 0 1 1 108 0Z/, 'disc outline');
    assert.match(svg, /M72 43H180V74H108V142H180V173H36V142H72Z/, 'glyph, shifted by (12, 19) to centre it');
  });
  test('static assets are published at the root', () => {
    for (const f of ['logo.svg', 'favicon.ico', 'apple-touch-icon.png', 'og-image.png', 'CNAME'])
      assert.ok(existsSync(join(out, f)), f);
    assert.equal(read('CNAME').trim(), new URL(ORIGIN).host);
  });
});
