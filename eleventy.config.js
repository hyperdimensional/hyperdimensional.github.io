import { readFileSync } from 'node:fs';

const LOGO_SOURCE = 'src/assets/logo.svg';

/** 1..3999 → Roman numerals (the site's house style for years). */
export function roman(n) {
  const table = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  if (!Number.isInteger(n) || n < 1 || n > 3999) throw new RangeError(`roman: ${n}`);
  let out = '';
  for (const [value, glyph] of table) while (n >= value) { out += glyph; n -= value; }
  return out;
}

const fromUnix = (s) => new Date(s * 1000);

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

export default function (eleventyConfig) {
  // Files in src/assets are published at the site root (/logo.svg, /favicon.ico …)
  eleventyConfig.addPassthroughCopy({ 'src/assets': '/' });

  eleventyConfig.addFilter('roman', roman);
  eleventyConfig.addFilter('unixToIso', (s) => fromUnix(s).toISOString().replace('.000Z', 'Z'));
  eleventyConfig.addFilter('unixToDate', (s) => fromUnix(s).toISOString().slice(0, 10));
  eleventyConfig.addFilter('unixToYear', (s) => fromUnix(s).getUTCFullYear());
  eleventyConfig.addFilter('host', (url) => new URL(url).host);
  eleventyConfig.addShortcode('logo', logo);

  eleventyConfig.addGlobalData('build', { year: new Date().getUTCFullYear() });
}

export const config = {
  dir: { input: 'src', output: '_site' },
  templateFormats: ['njk'],
  htmlTemplateEngine: 'njk',
};
