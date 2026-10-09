import type { Payload } from 'payload'

import { SEED_SPONSORS } from './data/sponsors'
import { findMediaId, SEED_CONTEXT, upsertImage } from './media'
import type { SeedSponsor } from './types'

const SPONSOR_ASSETS = 'sponsors'

/** New sponsor logos are uploaded; logos from the news are reused from the media library. */
async function resolveLogo(payload: Payload, logo: SeedSponsor['logo']): Promise<number | null> {
  return 'alt' in logo
    ? upsertImage(payload, SPONSOR_ASSETS, logo)
    : findMediaId(payload, logo.file)
}

async function findNewsId(payload: Payload, slug: string | undefined): Promise<number | null> {
  if (!slug) {
    return null
  }
  const { docs } = await payload.find({
    collection: 'news',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  return docs[0]?.id ?? null
}

async function createSponsorIfMissing(payload: Payload, sponsor: SeedSponsor): Promise<boolean> {
  const existing = await payload.count({
    collection: 'sponsors',
    where: { name: { equals: sponsor.name } },
  })
  if (existing.totalDocs > 0) {
    return false
  }

  const logo = await resolveLogo(payload, sponsor.logo)
  if (logo === null) {
    throw new Error(
      `Seed sponsor "${sponsor.name}" needs the logo ${sponsor.logo.file} (seed the news first)`,
    )
  }

  const created = await payload.create({
    collection: 'sponsors',
    locale: 'en',
    context: SEED_CONTEXT,
    data: {
      name: sponsor.name,
      logo,
      tier: sponsor.tier,
      since: sponsor.since,
      website: sponsor.website,
      announcement: await findNewsId(payload, sponsor.announcement),
      description: sponsor.description.en,
      isActive: true,
    },
  })
  await payload.update({
    collection: 'sponsors',
    id: created.id,
    locale: 'de',
    context: SEED_CONTEXT,
    data: { description: sponsor.description.de },
  })

  return true
}

/** Imports the sponsors from the old website; existing sponsors (matched by name) stay as edited. */
export async function seedSponsors(payload: Payload): Promise<void> {
  let created = 0
  for (const sponsor of SEED_SPONSORS) {
    if (await createSponsorIfMissing(payload, sponsor)) {
      created += 1
    }
  }

  payload.logger.info(
    `Sponsors: ${created} created, ${SEED_SPONSORS.length - created} already present.`,
  )
}
