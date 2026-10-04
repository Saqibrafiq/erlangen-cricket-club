import { useTranslations } from 'next-intl'

import { ClubStandingCard, type ClubStandingCardProps } from './club-standing-card'

export type ClubStandingsProps = {
  entries: readonly (ClubStandingCardProps & { key: string })[]
}

/** "Our teams": one card per club team in the given tables. Renders nothing without one. */
export function ClubStandings({ entries }: ClubStandingsProps) {
  const t = useTranslations('standings.club')

  if (entries.length === 0) {
    return null
  }

  return (
    <section aria-labelledby="club-standings-heading" className="space-y-3">
      <h2
        id="club-standings-heading"
        className="text-xs font-semibold tracking-wide text-text-muted uppercase"
      >
        {t('heading')}
      </h2>
      <div className="grid grid-cols-cards-fit gap-4">
        {entries.map(({ key, ...card }) => (
          <ClubStandingCard key={key} {...card} />
        ))}
      </div>
    </section>
  )
}
