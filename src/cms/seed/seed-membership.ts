import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Payload } from 'payload'

import type { RevalidateContext } from '../hooks/revalidate-pages'
import { SEED_CONTACT, SEED_MEMBERSHIP } from './data/membership'
import type { SeedContact, SeedMembership } from './types'

const SEED_CONTEXT: RevalidateContext = { disableRevalidate: true }
const ASSETS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'assets/membership')

type Locale = 'en' | 'de'
type RowIds = (string | null | undefined)[]

/** Uploads the application form once; later runs reuse it (matched by filename). */
async function upsertApplicationForm(
  payload: Payload,
  form: SeedMembership['applicationForm'],
): Promise<number> {
  const existing = await payload.find({
    collection: 'documents',
    where: { filename: { equals: form.file } },
    limit: 1,
    depth: 0,
  })
  const found = existing.docs[0]
  if (found) {
    return found.id
  }

  const created = await payload.create({
    collection: 'documents',
    locale: 'en',
    data: { title: form.title.en },
    filePath: path.join(ASSETS_DIR, form.file),
    context: SEED_CONTEXT,
  })
  await payload.update({
    collection: 'documents',
    id: created.id,
    locale: 'de',
    data: { title: form.title.de },
    context: SEED_CONTEXT,
  })

  return created.id
}

async function findMediaId(payload: Payload, filename: string): Promise<number | null> {
  const { docs } = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    depth: 0,
  })
  return docs[0]?.id ?? null
}

// Array rows carry the ids written in English, so German fills in the same rows instead of
// replacing them.
const withRowId = (ids: RowIds | undefined, index: number) =>
  ids?.[index] ? { id: ids[index] } : {}

function membershipData(
  seed: SeedMembership,
  locale: Locale,
  refs: { applicationForm: number; heroImage: number | null },
  rowIds?: { fees: RowIds; sessions: RowIds },
) {
  return {
    heroImage: refs.heroImage,
    applicationForm: refs.applicationForm,
    fees: seed.fees.map((fee, index) => ({
      ...withRowId(rowIds?.fees, index),
      name: fee.name[locale],
      includes: fee.includes[locale],
      annualFee: fee.annualFee,
      reducedFee: fee.reducedFee ?? null,
      perMatchFee: fee.perMatchFee ?? null,
      isHighlighted: fee.isHighlighted ?? false,
    })),
    feesNote: seed.feesNote[locale],
    terms: seed.terms[locale],
    sessions: seed.sessions.map((session, index) => ({
      ...withRowId(rowIds?.sessions, index),
      title: session.title[locale],
      days: session.days,
      startTime: session.startTime,
      endTime: session.endTime,
      venue: session.venue[locale],
    })),
    sessionsNote: seed.sessionsNote[locale],
  }
}

function contactData(seed: SeedContact, locale: Locale) {
  return {
    email: seed.email,
    facebookUrl: seed.facebookUrl,
    instagramUrl: seed.instagramUrl,
    ground: {
      name: seed.ground.name[locale],
      street: seed.ground.street,
      postalCode: seed.ground.postalCode,
      city: seed.ground.city,
      latitude: seed.ground.latitude,
      longitude: seed.ground.longitude,
      directions: seed.ground.directions[locale],
    },
  }
}

async function seedMembershipGlobal(payload: Payload): Promise<void> {
  const current = await payload.findGlobal({ slug: 'membership', depth: 0 })
  if ((current.fees ?? []).length > 0) {
    payload.logger.info('Membership: already filled in.')
    return
  }

  const refs = {
    applicationForm: await upsertApplicationForm(payload, SEED_MEMBERSHIP.applicationForm),
    heroImage: await findMediaId(payload, SEED_MEMBERSHIP.heroImage),
  }
  const english = await payload.updateGlobal({
    slug: 'membership',
    locale: 'en',
    data: membershipData(SEED_MEMBERSHIP, 'en', refs),
    context: SEED_CONTEXT,
  })
  await payload.updateGlobal({
    slug: 'membership',
    locale: 'de',
    data: membershipData(SEED_MEMBERSHIP, 'de', refs, {
      fees: (english.fees ?? []).map((row) => row.id),
      sessions: (english.sessions ?? []).map((row) => row.id),
    }),
    context: SEED_CONTEXT,
  })
  payload.logger.info('Membership: fees and sessions filled in (en, de).')
}

async function seedContactGlobal(payload: Payload): Promise<void> {
  const current = await payload.findGlobal({ slug: 'contact', depth: 0 })
  if (current.email) {
    payload.logger.info('Contact: already filled in.')
    return
  }

  for (const locale of ['en', 'de'] as const) {
    await payload.updateGlobal({
      slug: 'contact',
      locale,
      data: contactData(SEED_CONTACT, locale),
      context: SEED_CONTEXT,
    })
  }
  payload.logger.info('Contact: email, social links and ground filled in (en, de).')
}

/** Fills in the membership and contact pages once; edited pages are left untouched. */
export async function seedMembership(payload: Payload): Promise<void> {
  await seedMembershipGlobal(payload)
  await seedContactGlobal(payload)
}
