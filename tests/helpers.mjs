// Shared helpers for tests that run against the built site in _site/.
import { readFileSync, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { join, extname, normalize } from 'node:path';

export const OUT = fileURLToPath(new URL('../_site/', import.meta.url));
export const ORIGIN = process.env.SITE_URL ?? 'https://www.hyperdimensional.net';
export const PAGES = ['index.html', 'privacy/index.html', '404.html'];

export const read = (f) => readFileSync(join(OUT, f), 'utf8');
export const exists = (f) => existsSync(join(OUT, f));
export const headOf = (html) => html.slice(0, html.indexOf('</head>'));
export const between = (html, open, close) => html.slice(html.indexOf(open), html.indexOf(close));

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain',
};

/**
 * Serve _site/ over HTTP the way GitHub Pages does: "/" → index.html,
 * unknown paths → 404.html with status 404. Returns { url, close }.
 */
export async function serveSite() {
  const server = createServer((req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
    let file = join(OUT, path.endsWith('/') ? `${path}index.html` : path);
    let status = 200;
    if (!file.startsWith(OUT) || !existsSync(file) || statSync(file).isDirectory()) {
      file = join(OUT, '404.html');
      status = 404;
    }
    res.writeHead(status, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
