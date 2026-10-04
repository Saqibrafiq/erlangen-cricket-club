import { useTranslations } from 'next-intl'

import { STANDINGS_COLUMN_IDS } from './standings-table'

// Columns whose header is an abbreviation; "#" and "Team" need no explanation.
const ABBREVIATED_COLUMNS = STANDINGS_COLUMN_IDS.filter((id) => id !== 'position' && id !== 'team')

/** Explains the table's column abbreviations, for visitors new to cricket. */
export function StandingsLegend() {
  const t = useTranslations('standings')

  return (
    <dl
      aria-label={t('legendLabel')}
      className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted"
    >
      {ABBREVIATED_COLUMNS.map((id) => (
        <div key={id} className="flex gap-1">
          <dt className="font-semibold text-text-default uppercase">{t(`columns.${id}.short`)}</dt>
          <dd>{t(`columns.${id}.long`)}</dd>
        </div>
      ))}
    </dl>
  )
}
