import config from '@payload-config'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { getPayload } from 'payload'

import type { Locale } from '@/i18n/routing'

import type { LegalPageKind } from '../types'

const GLOBAL_SLUG: Record<LegalPageKind, 'impressum' | 'privacy-policy'> = {
  impressum: 'impressum',
  privacy: 'privacy-policy',
}

/** The page's rich text in `locale` (falling back to English), or `null` if not written yet. */
export async function getLegalContent(
  kind: LegalPageKind,
  locale: Locale,
): Promise<SerializedEditorState | null> {
  const payload = await getPayload({ config })
  const page = await payload.findGlobal({ slug: GLOBAL_SLUG[kind], locale, depth: 0 })
  const content = page.content

  return content && content.root.children.length > 0 ? content : null
}
