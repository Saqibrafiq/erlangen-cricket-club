import { z } from 'zod'

const DEFAULT_SITE_URL = 'http://localhost:3000'

export type SiteUrlSource = {
  /** NEXT_PUBLIC_SITE_URL: the canonical origin, set explicitly. */
  siteUrl: string | undefined
  /** Set by Vercel: the production domain (custom domain if assigned, else *.vercel.app), no scheme. */
  vercelProductionHost: string | undefined
}

function blankToUndefined(value: string | undefined): string | undefined {
  return value === '' ? undefined : value
}

/**
 * The canonical origin for metadata, sitemap and hreflang. An explicit URL wins; on Vercel the
 * production domain follows automatically, so canonicals never point at localhost in production.
 */
export function resolveSiteUrl({ siteUrl, vercelProductionHost }: SiteUrlSource): string {
  const host = blankToUndefined(vercelProductionHost)
  const fallback = host === undefined ? DEFAULT_SITE_URL : `https://${host}`

  return z.url().default(fallback).parse(blankToUndefined(siteUrl))
}

// NEXT_PUBLIC_ variables are inlined at build time, so they must be read as literal property accesses.
const siteUrl = resolveSiteUrl({
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  vercelProductionHost: process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
})

export const siteConfig = {
  name: 'Erlangen Cricket Club',
  shortName: 'ECC',
  url: siteUrl,
  address: {
    locality: 'Erlangen',
    region: 'Bavaria',
    countryCode: 'DE',
  },
  /** Fallback until the contact page is filled in the admin. */
  email: 'erlangencricketclub@gmail.com',
  /** Designed and built the website; owns its code and design (see LICENSE). */
  author: {
    name: 'Saqib Rafiq',
    url: 'https://github.com/Saqibrafiq',
  },
} as const
