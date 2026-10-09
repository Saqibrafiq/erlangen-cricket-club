'use client'

import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'

import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'
import { formControlClassName } from '@/shared/ui/form-field'
import { PillGroup } from '@/shared/ui/pill-group'

import {
  filterSquad,
  getRoleOptions,
  getTeamOptions,
  NO_SQUAD_FILTER,
  type SquadFilter,
} from '../domain/squad-filter'
import type { Player, PlayingRole } from '../types'
import { JoinSquadCard } from './join-squad-card'
import { PlayerCard } from './player-card'

export type SquadBrowserProps = {
  players: readonly Player[]
  joinHref: string
}

const ALL = 'all'

function isFiltered(filter: SquadFilter): boolean {
  return filter.query.trim() !== '' || filter.teamId !== null || filter.role !== null
}

/**
 * The squad grid with a name search and, once editors assign them, team and role filters. Ends with
 * an open spot to join while nothing is filtered.
 */
export function SquadBrowser({ players, joinHref }: SquadBrowserProps) {
  const t = useTranslations('players')
  const searchId = useId()
  const [filter, setFilter] = useState<SquadFilter>(NO_SQUAD_FILTER)
  const matches = filterSquad(players, filter)
  const hasFilter = isFiltered(filter)
  const teamOptions = getTeamOptions(players)
  const roleOptions = getRoleOptions(players)

  return (
    <section aria-labelledby="squad-heading" className="space-y-8">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-baseline gap-3">
            <h2 id="squad-heading" className="sr-only">
              {t('list.heading')}
            </h2>
            <p role="status" className="text-lg font-semibold">
              {hasFilter
                ? t('search.results', { shown: matches.length, total: players.length })
                : t('list.count', { count: players.length })}
            </p>
          </div>
          {players.length > 0 && (
            <div className="relative w-full sm:w-72">
              <label htmlFor={searchId} className="sr-only">
                {t('search.label')}
              </label>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-text-muted"
              />
              <input
                id={searchId}
                type="search"
                value={filter.query}
                onChange={(event) => {
                  setFilter({ ...filter, query: event.target.value })
                }}
                placeholder={t('search.placeholder')}
                autoComplete="off"
                className={cn(formControlClassName, 'rounded-full pl-10')}
              />
            </div>
          )}
        </div>

        {(teamOptions.length > 1 || roleOptions.length > 1) && (
          <div className="flex flex-col gap-4 lg:flex-row lg:gap-10">
            {teamOptions.length > 1 && (
              <PillGroup
                legend={t('filters.team')}
                value={filter.teamId === null ? ALL : String(filter.teamId)}
                onChange={(value) => {
                  setFilter({ ...filter, teamId: value === ALL ? null : Number(value) })
                }}
                options={[
                  { value: ALL, label: t('filters.all'), count: players.length },
                  ...teamOptions.map(({ team, count }) => ({
                    value: String(team.id),
                    label: team.name,
                    count,
                  })),
                ]}
              />
            )}
            {roleOptions.length > 1 && (
              <PillGroup<PlayingRole | typeof ALL>
                legend={t('filters.role')}
                value={filter.role ?? ALL}
                onChange={(value) => {
                  setFilter({ ...filter, role: value === ALL ? null : value })
                }}
                options={[
                  { value: ALL, label: t('filters.all'), count: players.length },
                  ...roleOptions.map(({ role, count }) => ({
                    value: role,
                    label: t(`filters.roles.${role}`),
                    count,
                  })),
                ]}
              />
            )}
          </div>
        )}
      </div>

      {players.length === 0 && <p className="text-text-muted">{t('list.empty')}</p>}

      {hasFilter && matches.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-border-default px-6 py-12 text-center">
          <p className="text-lg">{t('search.noMatch')}</p>
          <Button
            variant="secondary"
            onClick={() => {
              setFilter(NO_SQUAD_FILTER)
            }}
          >
            {t('search.clear')}
          </Button>
        </div>
      ) : (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
          {matches.map((player) => (
            <li key={player.id}>
              <PlayerCard player={player} />
            </li>
          ))}
          {!hasFilter && (
            <li>
              <JoinSquadCard href={joinHref} />
            </li>
          )}
        </ul>
      )}
    </section>
  )
}
