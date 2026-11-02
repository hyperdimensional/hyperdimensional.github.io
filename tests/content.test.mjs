// Copy, brand and legal checks: these pin agreed wording and assets, so a
// failure here means the content changed, not that a standard was broken.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { read, headOf, between, PAGES } from './helpers.mjs';

const YEAR = new Date().getUTCFullYear();

describe('Legal (UK company website disclosures)', () => {
  for (const page of PAGES) {
    test(`${page}: footer names the company and its registration`, () => {
      const footer = between(read(page), '<footer', '</footer>');
      assert.match(footer, new RegExp(`© 2007–${YEAR} Hyperdimensional Limited`));
      assert.match(footer, /Registered in England and Wales/);
      assert.match(footer, /Company number 06255378/);
      assert.match(footer, /<address[^>]*>Registered office: Kemp House, 152-160 City Road, London, EC1V 2NX<\/address>/);
    });

    test(`${page}: footer gives the general contact address`, () => {
      const footer = between(read(page), '<footer', '</footer>');
      assert.match(footer, /<a href="mailto:hello@hyperdimensional\.net">hello@hyperdimensional\.net<\/a>/);
    });
  }

  test('JSON-LD carries the legal entity', () => {
    const ld = JSON.parse(headOf(read('index.html')).match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(ld.legalName, 'Hyperdimensional Limited');
    assert.equal(ld.identifier, '06255378');
    assert.equal(ld.foundingDate, '2007-05-22', 'incorporation date at Companies House');
    assert.equal(ld.address?.postalCode, 'EC1V 2NX');
    assert.equal(ld.email, 'hello@hyperdimensional.net');
  });
});

describe('Home page copy', () => {
  const html = read('index.html');
  const main = between(html, '<main', '</main>');

  test('name and lede', () => {
    assert.match(html, /<h1 class="wordmark">hyperdimensional<\/h1>/);
    assert.match(main, /<p class="lede">We help organisations whose technology delivery has stalled\. We also make our own software\.<\/p>/);
  });

  test('section headings', () => {
    const h2 = [...main.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)].map((m) => m[1]);
    assert.deepEqual(h2, ['Consulting', 'Projects']);
  });

  test('projects, each linked, in the agreed order', () => {
    const projects = [
      ['A Partial Guide', 'https://apartialguide.com/'],
      ['Drift', 'https://drift.place/'],
      ['Huis Clos', 'https://huisclos.org/'],
      ['Padjam', 'https://padjam.app/'],
      ['Throughline Pocket VSM', 'https://throughline.fyi/'],
      ['Tidal Cycles MCP', 'https://github.com/Benedict/tidal-cycles-mcp-server'],
    ];
    for (const [name, href] of projects) assert.match(main, new RegExp(`<a href="${href}">${name}</a>`), name);
    const listed = [...main.matchAll(/<li class="work-item[^"]*"><a href="[^"]+">([^<]+)<\/a>/g)].map((m) => m[1]);
    assert.deepEqual(listed, projects.map(([name]) => name));
  });

  test('links to the writing at profound.fyi', () => {
    assert.match(main, /<a href="https:\/\/profound\.fyi\/">/);
  });

  test('retired copy stays retired', () => {
    for (const gone of [/established|993914803/i, /\b[MDCLXVI]{3,}\b/, /glitch|data-text=|@keyframes/,
      /same curiosity/i, /instruments for live|ways of seeing|unstick/i])
      assert.doesNotMatch(html, gone, String(gone));
  });
});

describe('Privacy notice', () => {
  const html = read('privacy/index.html');
  const main = between(html, '<main', '</main>');

  test('names the controller and how to reach it', () => {
    assert.match(main, /<a href="mailto:privacy@hyperdimensional\.net">privacy@hyperdimensional\.net<\/a>/);
    assert.match(main, /Hyperdimensional Limited/);
    assert.match(main, /06255378/);
    assert.match(main, /Kemp House, 152-160 City Road, London, EC1V 2NX/);
  });

  test('says what this site collects: nothing', () => {
    assert.match(main, /no cookies/i);
    assert.match(main, /no analytics/i);
  });

  test("states GitHub's IP logging, quoting GitHub, with a link to its privacy statement", () => {
    assert.match(main, /IP address is logged and stored for security purposes/);
    assert.match(main, /<a href="https:\/\/docs\.github\.com\/en\/site-policy\/privacy-policies\/github-general-privacy-statement">/);
  });

  test('explains rights and the right to complain to the ICO', () => {
    assert.match(main, /<h2 id="rights">Your rights<\/h2>/);
    assert.match(main, /You can ask what personal data we hold about you/);
    assert.match(main, /<a href="https:\/\/ico\.org\.uk\/make-a-complaint\/">/);
  });

  test('stays plain: no lede, no filler', () => {
    assert.doesNotMatch(main, /class="lede"/);
    assert.doesNotMatch(main, /We don't see who visits|If you're unhappy|have their own privacy notices/);
  });

  test('is dated', () => {
    assert.match(main, /<time datetime="\d{4}-\d{2}-\d{2}">/);
  });
});

describe('Brand', () => {
  test('the mark is a 216-unit disc (18 glyph modules) with the glyph centred', () => {
    const svg = read('logo.svg').replace(/\s+/g, ' ');
    assert.match(svg, /viewBox="0 0 216 216"/);
    assert.match(svg, /d=" ?M108 0A108 108 0 1 1 108 216A108 108 0 1 1 108 0Z/, 'disc outline');
    assert.match(svg, /M72 43H180V74H108V142H180V173H36V142H72Z/, 'glyph, shifted by (12, 19) to centre it');
  });
});
