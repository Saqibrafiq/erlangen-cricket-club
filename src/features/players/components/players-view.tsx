import { useTranslations } from 'next-intl'

import type { Player } from '../types'
import { SquadBrowser } from './squad-browser'

export type SquadFacts = {
  /** Latest season with fixtures, e.g. "2026". */
  season: string
  clubTeams: number
  competitions: number
}

export type PlayersViewProps = {
  players: readonly Player[]
  /** Where prospective players learn how to join, e.g. the membership page. */
  joinHref: string
  /** Club numbers next to the title; left out until the season has fixtures. */
  facts: SquadFacts | null
}

type FactProps = {
  label: string
  value: number
}

function Fact({ label, value }: FactProps) {
  return (
    // Label first in the markup (as a description list requires); the value is shown on top.
    <div className="flex min-w-24 flex-col rounded-2xl bg-surface-highlight px-4 py-3 sm:px-5 sm:py-4">
      <dt className="text-xs font-semibold tracking-widest text-text-muted uppercase">{label}</dt>
      <dd className="order-first font-display text-4xl leading-none font-bold text-brand-primary tabular-nums sm:text-5xl">
        {value}
      </dd>
    </div>
  )
}

/** The squad page: title with the club's numbers, then the searchable, filterable squad. */
export function PlayersView({ players, joinHref, facts }: PlayersViewProps) {
  const t = useTranslations('players')

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold tracking-widest text-brand-primary uppercase">
            {facts ? t('hero.eyebrowSeason', { season: facts.season }) : t('hero.eyebrow')}
          </p>
          <h1 className="font-display text-6xl leading-none font-bold tracking-tight uppercase sm:text-8xl">
            {t('hero.heading')}
          </h1>
        </div>
        <dl className="flex flex-wrap gap-3">
          <Fact label={t('facts.players')} value={players.length} />
          {facts && <Fact label={t('facts.teams')} value={facts.clubTeams} />}
          {facts && <Fact label={t('facts.competitions')} value={facts.competitions} />}
        </dl>
      </header>

      <SquadBrowser players={players} joinHref={joinHref} />
    </div>
  )
}
