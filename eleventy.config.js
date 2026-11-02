import { readFileSync } from 'node:fs';

const LOGO_SOURCE = 'src/assets/logo.svg';

/**
 * Inline the logo from its single source file, as a decorative graphic.
 * The accessible name always comes from adjacent text (the h1 or a link label).
 */
export function logo(className = 'mark') {
  return readFileSync(LOGO_SOURCE, 'utf8')
    .replace(/<title[^>]*>.*?<\/title>\s*/s, '')
    .replace(/<!--.*?-->\s*/gs, '')
    .replace(/\s(role|aria-labelledby)="[^"]*"/g, '')
    .replace('<svg ', `<svg class="${className}" aria-hidden="true" focusable="false" `)
    .replace(/\n\s*/g, ' ')
    .trim();
}

/** The mark's path data, for other renderings of it (e.g. the favicon). */
export function logoPath() {
  const d = readFileSync(LOGO_SOURCE, 'utf8').match(/\sd="([^"]+)"/s);
  if (!d) throw new Error(`no path data in ${LOGO_SOURCE}`);
  return d[1].replace(/\s+/g, ' ').trim();
}

export default function (eleventyConfig) {
  // Files in src/assets are published at the site root (/logo.svg, /favicon.ico …)
  eleventyConfig.addPassthroughCopy({ 'src/assets': '/' });

  eleventyConfig.addFilter('host', (url) => new URL(url).host);
  // Front-matter dates arrive as Date objects (UTC midnight).
  eleventyConfig.addFilter('isoDate', (d) => new Date(d).toISOString().slice(0, 10));
  eleventyConfig.addFilter('longDate', (d) =>
    new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }));
  eleventyConfig.addShortcode('logo', logo);
  eleventyConfig.addShortcode('logoPath', logoPath);

  eleventyConfig.addGlobalData('build', { year: new Date().getUTCFullYear() });
}

export const config = {
  dir: { input: 'src', output: '_site' },
  templateFormats: ['njk'],
  htmlTemplateEngine: 'njk',
};
