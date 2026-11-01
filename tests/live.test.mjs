// Post-deploy checks against the live site. Run by CI after each deploy:
//   LIVE_URL=https://www.hyperdimensional.net EXPECTED_REVISION=<sha> npm run test:live
// Covers what only exists once deployed: HTTPS, redirects, status codes, content types.
import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';

const LIVE = (process.env.LIVE_URL ?? '').replace(/\/$/, '');
const EXPECTED = process.env.EXPECTED_REVISION;
const skip = LIVE ? false : 'set LIVE_URL to run';

const get = (path, init = {}) => fetch(LIVE + path, { redirect: 'manual', cache: 'no-store', ...init });

describe('Live site', { skip }, () => {
  before(async () => {
    // Pages takes a moment to roll out: wait (up to 3 min) for the deployed revision.
    if (!EXPECTED) return;
    for (let i = 0; i < 36; i++) {
      const html = await (await get(`/?revision-check=${Date.now()}`)).text();
      if (html.includes(`<meta name="revision" content="${EXPECTED}">`)) return;
      await new Promise((r) => setTimeout(r, 5000));
    }
    assert.fail(`revision ${EXPECTED} not live after 3 minutes`);
  });

  test('home page is served over HTTPS as HTML', async () => {
    assert.match(LIVE, /^https:\/\//);
    const res = await get('/');
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /^text\/html/);
  });

  test('plain HTTP redirects permanently to HTTPS', async () => {
    const res = await fetch(LIVE.replace(/^https:/, 'http:') + '/', { redirect: 'manual' });
    assert.ok([301, 308].includes(res.status), `HTTP status ${res.status}`);
    assert.match(res.headers.get('location') ?? '', /^https:\/\//);
  });

  test('unknown paths return 404 with the custom page', async () => {
    const res = await get('/no-such-page');
    assert.equal(res.status, 404);
    assert.match(await res.text(), /<h1 class="wordmark">not found<\/h1>/);
  });

  test('every outbound link on the home page resolves', async () => {
    const html = await (await get('/')).text();
    const links = [...new Set([...html.matchAll(/<a href="(https:\/\/[^"]+)"/g)].map((m) => m[1]))];
    assert.ok(links.length > 0, 'no outbound links found');
    const broken = [];
    for (const url of links) {
      let status = 0;
      for (let attempt = 0; attempt < 2 && !(status >= 200 && status < 400); attempt++) {
        status = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(15000) })
          .then((r) => r.status).catch(() => 0);
      }
      if (!(status >= 200 && status < 400)) broken.push(`${url} → ${status || 'no response'}`);
    }
    assert.deepEqual(broken, []);
  });

  for (const [path, type] of [
    ['/robots.txt', /^text\/plain/],
    ['/sitemap.xml', /xml/],
    ['/logo.svg', /^image\/svg\+xml/],
    ['/og-image.png', /^image\/png/],
    ['/apple-touch-icon.png', /^image\/png/],
    ['/favicon.ico', /icon/],
  ]) {
    test(`${path} is served with the right type`, async () => {
      const res = await get(path);
      assert.equal(res.status, 200);
      assert.match(res.headers.get('content-type') ?? '', type);
    });
  }
});
