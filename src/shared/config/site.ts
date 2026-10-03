import { z } from 'zod'

const DEFAULT_SITE_URL = 'http://localhost:3000'

// NEXT_PUBLIC_ variables are inlined at build time, so they must be read as literal property accesses.
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
const siteUrl = z
  .url()
  .default(DEFAULT_SITE_URL)
  .parse(rawSiteUrl === '' ? undefined : rawSiteUrl)

export const siteConfig = {
  name: 'Erlangen Cricket Club',
  shortName: 'ECC',
  url: siteUrl,
  address: {
    locality: 'Erlangen',
    region: 'Bavaria',
    countryCode: 'DE',
  },
} as const
