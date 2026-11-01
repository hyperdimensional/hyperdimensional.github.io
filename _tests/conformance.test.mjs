// Conformance checks against the parts of https://specification.website/
// that apply to a single static page served by GitHub Pages.
// Run: node --test _tests/*.test.mjs   (no dependencies; Jekyll does not publish _-prefixed dirs)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (f) => readFileSync(join(root, f), 'utf8');
const ORIGIN = 'https://www.hyperdimensional.net';

for (const page of ['index.html', '404.html']) {
  const html = read(page);
  const head = html.slice(0, html.indexOf('</head>'));

  test(`${page}: foundations`, () => {
    assert.match(html, /^<!doctype html>/, 'starts with lowercase HTML5 doctype');
    assert.match(html, /<html lang="en">/, 'declares document language');
    assert.ok(html.indexOf('<meta charset="utf-8">') > -1 && html.indexOf('<meta charset="utf-8">') < 1024, 'utf-8 within first 1024 bytes');
    assert.match(head, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
    assert.doesNotMatch(head, /user-scalable=no|maximum-scale=1[^0-9.]/, 'never disables zoom');
    assert.equal((head.match(/<title>[^<]+<\/title>/g) || []).length, 1, 'exactly one non-empty title');
    assert.match(head, /<meta name="color-scheme" content="light">/);
    assert.match(head, /<meta name="theme-color" content="#ffffff">/);
    assert.match(head, /<link rel="icon" href="\/logo\.svg" type="image\/svg\+xml">/);
    assert.match(head, /<link rel="apple-touch-icon" href="\/apple-touch-icon\.png">/);
  });

  test(`${page}: no JavaScript and a restrictive CSP`, () => {
    assert.doesNotMatch(html, /<script(?![^>]*application\/ld\+json)/, 'no executable scripts');
    assert.match(head, /http-equiv="Content-Security-Policy" content="[^"]*script-src 'none'/);
  });

  test(`${page}: accessibility`, () => {
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, 'one h1');
    assert.match(html, /<main[\s>]/, 'main landmark');
    assert.match(html, /prefers-reduced-motion: ?reduce/, 'animation respects reduced motion');
    assert.match(html, /content:attr\(data-text\) ?\/ ?""/, 'glitch duplicates hidden from accessible name');
    assert.match(html, /\.glitch:before\{[^}]*white-space:nowrap/, 'glitch layers must not wrap (multi-word headings)');
    for (const img of html.match(/<img\b[^>]*>/g) || []) assert.match(img, /\balt=/, img);
  });
}

test('index.html: discovery metadata', () => {
  const head = read('index.html').split('</head>')[0];
  assert.match(head, /<meta name="description" content="[^"]{20,160}">/);
  assert.match(head, new RegExp(`<link rel="canonical" href="${ORIGIN}/">`));
  for (const p of ['title', 'description', 'url', 'type', 'image'])
    assert.match(head, new RegExp(`<meta property="og:${p}" content="[^"]+">`), `og:${p}`);
  const ld = JSON.parse(head.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(ld['@type'], 'Organization');
  assert.equal(ld.url, `${ORIGIN}/`);
});

test('index.html: established date is machine-readable', () => {
  // 993914803 is a Unix timestamp
  assert.match(read('index.html'), /<time datetime="2001-06-30T15:26:43Z">993914803<\/time>/);
});

test('404.html is noindex', () => {
  assert.match(read('404.html'), /<meta name="robots" content="noindex">/);
});

test('robots.txt and sitemap.xml', () => {
  assert.match(read('robots.txt'), new RegExp(`^Sitemap: ${ORIGIN}/sitemap\\.xml$`, 'm'));
  assert.match(read('sitemap.xml'), new RegExp(`<loc>${ORIGIN}/</loc>`));
});

test('referenced assets exist', () => {
  for (const f of ['logo.svg', 'favicon.ico', 'apple-touch-icon.png', 'og-image.png'])
    assert.ok(existsSync(join(root, f)), f);
});

test('no Gatsby build leftovers', () => {
  const left = readdirSync(root).filter((f) => /\.js(\.map)?$|^page-data$|^chunk-map\.json$|^webpack\.stats\.json$|^styles\..*\.css$/.test(f));
  assert.deepEqual(left, []);
});
