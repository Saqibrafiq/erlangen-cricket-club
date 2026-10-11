import type { Payload } from 'payload'

import { buildImpressum, CLUB_REGISTER_NUMBER, SEED_PRIVACY_POLICY } from './data/legal'
import { SEED_CONTEXT } from './media'
import { type SeedBlock, toRichText } from './rich-text'

type LegalSlug = 'impressum' | 'privacy-policy'

/** Fills in a legal page once; a page an editor has written is left untouched. */
async function seedLegalPage(
  payload: Payload,
  slug: LegalSlug,
  text: Record<'en' | 'de', SeedBlock[]>,
): Promise<void> {
  const current = await payload.findGlobal({ slug, locale: 'en', depth: 0 })
  if ((current.content?.root.children ?? []).length > 0) {
    payload.logger.info(`${slug}: already written.`)
    return
  }

  for (const locale of ['en', 'de'] as const) {
    await payload.updateGlobal({
      slug,
      locale,
      context: SEED_CONTEXT,
      data: { content: toRichText(text[locale]) },
    })
  }
  payload.logger.info(`${slug}: filled in (en, de).`)
}

/** The privacy policy, and the Impressum once the club's register number is known. */
export async function seedLegal(payload: Payload): Promise<void> {
  await seedLegalPage(payload, 'privacy-policy', SEED_PRIVACY_POLICY)

  if (CLUB_REGISTER_NUMBER === null) {
    payload.logger.warn('impressum: skipped until CLUB_REGISTER_NUMBER is set (launch blocker).')
    return
  }
  await seedLegalPage(payload, 'impressum', buildImpressum(CLUB_REGISTER_NUMBER))
}
