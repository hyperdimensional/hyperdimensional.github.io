// Site-wide data. Deploy-specific values come from the environment (12-factor);
// defaults describe production.
export default {
  name: 'hyperdimensional',
  url: (process.env.SITE_URL ?? 'https://www.hyperdimensional.net').replace(/\/$/, ''),
  lang: 'en',
  description: 'hyperdimensional, established 2001.',
  // Unix timestamp, shown as-is on the home page: 2001-06-30T15:26:43Z
  established: 993914803,
};
