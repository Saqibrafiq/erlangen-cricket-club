import type { Sponsor, SponsorTier } from '../types'

const TIER_ORDER: Record<SponsorTier, number> = { title: 0, sponsor: 1 }

/** Title sponsors first, then the longest-standing sponsors, then by name. */
export function sortSponsors(sponsors: readonly Sponsor[]): Sponsor[] {
  return sponsors.toSorted(
    (a, b) =>
      TIER_ORDER[a.tier] - TIER_ORDER[b.tier] || a.since - b.since || a.name.localeCompare(b.name),
  )
}

export type SponsorsJsonLdClub = {
  name: string
  url: string
}

function toAbsoluteUrl(url: string, siteUrl: string): string {
  return url.startsWith('http') ? url : `${siteUrl}${url}`
}

/** schema.org `SportsOrganization` naming its sponsors, for the sponsors page. */
export function buildSponsorsJsonLd(sponsors: readonly Sponsor[], club: SponsorsJsonLdClub) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: club.name,
    url: club.url,
    sponsor: sponsors.map((sponsor) => ({
      '@type': 'Organization',
      name: sponsor.name,
      ...(sponsor.website ? { url: sponsor.website } : {}),
      ...(sponsor.logo ? { logo: toAbsoluteUrl(sponsor.logo.url, club.url) } : {}),
    })),
  }
}
