'use client'

import { Search } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'

import { cn } from '@/shared/lib/cn'
import { useIsEditMode } from '@/shared/lib/edit-mode'
import { useVanishing } from '@/shared/lib/use-vanishing'
import { Button } from '@/shared/ui/button'
import { formControlClassName } from '@/shared/ui/form-field'
import { PillGroup } from '@/shared/ui/pill-group'
import { Vanish } from '@/shared/ui/vanish'

import {
  filterSquad,
  getRoleOptions,
  getTeamOptions,
  NO_SQUAD_FILTER,
  type SquadFilter,
} from '../domain/squad-filter'
import type { PlayerEditing } from '../editor-types'
import type { Player, PlayingRole } from '../types'
import type { EditorIntent } from './editor/player-editor'
import { JoinSquadCard } from './join-squad-card'
import { PlayerCard } from './player-card'

// Editing code loads only in an editor's browser; visitors never download it.
const SquadToolbar = dynamic(
  () => import('./editor/squad-toolbar').then((module) => module.SquadToolbar),
  { ssr: false },
)
const CardEditActions = dynamic(
  () => import('./editor/card-edit-actions').then((module) => module.CardEditActions),
  { ssr: false },
)
const PlayerEditor = dynamic(
  () => import('./editor/player-editor').then((module) => module.PlayerEditor),
  { ssr: false },
)

export type SquadBrowserProps = {
  players: readonly Player[]
  joinHref: string
  /** Editing actions; the controls show only in a signed-in editor's browser. */
  editing?: PlayerEditing
}

const ALL = 'all'

function isFiltered(filter: SquadFilter): boolean {
  return filter.query.trim() !== '' || filter.teamId !== null || filter.role !== null
}

/**
 * The squad grid with a name search and, once editors assign them, team and role filters. Ends with
 * an open spot to join while nothing is filtered.
 */
export function SquadBrowser({ players, joinHref, editing }: SquadBrowserProps) {
  const t = useTranslations('players')
  const searchId = useId()
  const isEditMode = useIsEditMode()
  const [filter, setFilter] = useState<SquadFilter>(NO_SQUAD_FILTER)
  const [intent, setIntent] = useState<EditorIntent | null>(null)
  const [notice, setNotice] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const { vanishingId, vanish, finish: onVanished } = useVanishing()
  const canEdit = isEditMode && editing !== undefined

  // After a change (the editor has refreshed the page): close it and say what happened.
  const finishEditing = (message: string) => {
    setIntent(null)
    setNotice(message)
    setRefreshKey((key) => key + 1)
  }
  const matches = filterSquad(players, filter)
  const hasFilter = isFiltered(filter)
  const teamOptions = getTeamOptions(players)
  const roleOptions = getRoleOptions(players)

  return (
    <section aria-labelledby="squad-heading" className="space-y-8">
      {canEdit && (
        <div className="space-y-2">
          <SquadToolbar
            getHiddenPlayers={editing.actions.getHiddenPlayers}
            refreshKey={refreshKey}
            onAdd={() => {
              setIntent({ kind: 'add' })
            }}
            onEdit={(id) => {
              setIntent({ kind: 'edit', id })
            }}
          />
          <p role="status" className="text-sm font-medium text-brand-primary">
            {notice}
          </p>
        </div>
      )}
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
            <li key={player.id} className="relative">
              {canEdit ? (
                <Vanish isVanishing={vanishingId === player.id} onVanished={onVanished}>
                  <PlayerCard player={player} />
                </Vanish>
              ) : (
                <PlayerCard player={player} />
              )}
              {canEdit && vanishingId !== player.id && (
                <CardEditActions
                  name={player.name}
                  className="absolute top-1.5 left-1.5"
                  onEdit={() => {
                    setIntent({ kind: 'edit', id: player.id })
                  }}
                  onDelete={() => {
                    setIntent({ kind: 'delete', id: player.id, name: player.name })
                  }}
                />
              )}
            </li>
          ))}
          {!hasFilter && (
            <li>
              <JoinSquadCard href={joinHref} />
            </li>
          )}
        </ul>
      )}
      {canEdit && intent && (
        <PlayerEditor
          intent={intent}
          editing={editing}
          vanish={vanish}
          onClose={() => {
            setIntent(null)
          }}
          onSaved={(player, name) => {
            finishEditing(
              t(player.isPublic ? 'editor.notice.saved' : 'editor.notice.savedHidden', { name }),
            )
          }}
          onDeleted={(name) => {
            finishEditing(t('editor.notice.deleted', { name }))
          }}
        />
      )}
    </section>
  )
}
