// Rendered-page checks in a real browser (Chromium via Playwright), against
// _site/ served locally the way GitHub Pages serves it.
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import { serveSite } from './helpers.mjs';

const WIDTHS = [320, 375, 768, 1024, 1440, 1920];
const SCHEMES = ['light', 'dark'];
const PATHS = { home: '/', '404': '/no-such-page' };

let server, browser;
before(async () => {
  server = await serveSite();
  browser = await chromium.launch();
});
after(async () => {
  await browser?.close();
  await server?.close();
});

// Each page gets its own context (axe requires one); call close() when done.
async function open(path, options = {}, setup = () => {}) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  setup(page);
  const response = await page.goto(server.url + path);
  return { page, response, close: () => context.close() };
}

describe('Accessibility: axe, WCAG 2.2 A and AA', () => {
  for (const [name, path] of Object.entries(PATHS)) {
    for (const colorScheme of SCHEMES) {
      test(`${name}, ${colorScheme} mode: no violations`, async () => {
        const { page, close } = await open(path, { colorScheme });
        const { violations } = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
          .analyze();
        await close();
        assert.deepEqual(
          violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`),
          [],
        );
      });
    }
  }
});

describe('Accessibility: keyboard', () => {
  test('every link is reachable by Tab and shows a visible focus ring', async () => {
    const { page, close } = await open('/');
    const links = await page.locator('a[href]').count();
    const seen = [];
    for (let i = 0; i < links; i++) {
      await page.keyboard.press('Tab');
      seen.push(await page.evaluate(() => {
        const el = document.activeElement;
        const s = getComputedStyle(el);
        return { tag: el.tagName, href: el.getAttribute('href'), outline: s.outlineStyle, width: parseFloat(s.outlineWidth) };
      }));
    }
    await close();
    assert.equal(seen.filter((f) => f.tag === 'A').length, links, 'all links reached in order');
    for (const f of seen) assert.ok(f.outline !== 'none' && f.width >= 2, `no visible focus on ${f.href}`);
  });
});

describe('Layout', () => {
  for (const width of WIDTHS) {
    test(`${width}px: no horizontal scroll`, async () => {
      const { page, close } = await open('/', { viewport: { width, height: 800 } });
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      await close();
      assert.equal(scrollWidth, width);
    });
  }

  test('the name fits on one line at every width', async () => {
    for (const width of WIDTHS) {
      const { page, close } = await open('/', { viewport: { width, height: 800 } });
      const { height, lineHeight } = await page.locator('h1').evaluate((h) => ({
        height: h.getBoundingClientRect().height,
        lineHeight: parseFloat(getComputedStyle(h).lineHeight),
      }));
      await close();
      assert.ok(height <= lineHeight * 1.05, `h1 wraps at ${width}px`);
    }
  });
});

describe('Serving', () => {
  test('unknown paths get the 404 page with a 404 status', async () => {
    const { page, response, close } = await open(PATHS['404']);
    const h1 = await page.locator('h1').textContent();
    await close();
    assert.equal(response.status(), 404);
    assert.equal(h1, 'not found');
  });

  test('no console errors or CSP violations on load', async () => {
    const errors = [];
    const { close } = await open('/', {}, (page) => {
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      page.on('pageerror', (e) => errors.push(e.message));
    });
    await close();
    assert.deepEqual(errors, []);
  });
});
