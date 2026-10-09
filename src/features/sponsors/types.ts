export type SponsorTier = 'title' | 'sponsor'

export type SponsorLogo = {
  url: string
  alt: string
  width: number
  height: number
}

export type Sponsor = {
  id: number
  name: string
  logo: SponsorLogo | null
  tier: SponsorTier
  /** Year the sponsorship started. */
  since: number
  description: string
  website: string | null
  /** Site path of the news article announcing the sponsorship, if any. */
  announcementHref: string | null
}
