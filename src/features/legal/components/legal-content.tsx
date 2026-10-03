import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { useTranslations } from 'next-intl'

export type LegalContentProps = {
  content: SerializedEditorState | null
}

/** Editor-maintained legal text, or a notice while the club has not provided it yet. */
export function LegalContent({ content }: LegalContentProps) {
  const t = useTranslations('legal')

  if (!content) {
    return (
      <p className="rounded-lg border border-dashed border-border-default p-4 text-text-muted">
        {t('pending')}
      </p>
    )
  }

  return <RichText data={content} className="rich-text" />
}
