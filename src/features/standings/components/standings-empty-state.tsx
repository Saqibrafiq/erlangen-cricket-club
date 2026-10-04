import { useTranslations } from 'next-intl'

/** Shown for a competition whose table has not been entered yet. */
export function StandingsEmptyState() {
  const t = useTranslations('standings')

  return (
    <p className="rounded-xl border border-dashed border-border-default p-4 text-text-muted">
      {t('empty')}
    </p>
  )
}
