// Site-wide data. Deploy-specific values come from the environment (12-factor);
// defaults describe production.
export default {
  name: 'hyperdimensional',
  url: (process.env.SITE_URL ?? 'https://www.hyperdimensional.net').replace(/\/$/, ''),
  lang: 'en',
  // Commit being built (set by GitHub Actions); lets the post-deploy check
  // confirm the live site is serving this build.
  revision: process.env.GITHUB_SHA ?? 'local',
  description: 'We help organisations whose technology delivery has stalled. We also make our own software.',
  // Legal entity, as registered at Companies House. Shown in every page footer
  // (UK Company, LLP and Business (Names and Trading Disclosures) Regulations 2015).
  // Published contact addresses.
  contact: {
    general: 'hello@hyperdimensional.net',
    privacy: 'privacy@hyperdimensional.net',
    security: 'security@hyperdimensional.net',
  },
  company: {
    legalName: 'Hyperdimensional Limited',
    number: '06255378',
    incorporated: '2007-05-22',
    jurisdiction: 'England and Wales',
    registeredOffice: {
      street: 'Kemp House, 152-160 City Road',
      locality: 'London',
      postalCode: 'EC1V 2NX',
      country: 'GB',
    },
  },
};
