'use client'

import { useFormatter, useTranslations } from 'next-intl'
import { AnimatePresence, motion } from 'motion/react'
import { type ReactNode, useState } from 'react'

import {
  type BattingCounts,
  type BattingTotals,
  type BowlingCounts,
  type BowlingTotals,
  calculateBattingAverage,
  calculateBowlingAverage,
  calculateBowlingStrikeRate,
  calculateEconomyRate,
  calculateStrikeRate,
  formatBowlingFigures,
  formatOvers,
  getDismissals,
  subtractBattingTotals,
  subtractBowlingTotals,
} from '@/domain/cricket'
import { useIsEditMode } from '@/shared/lib/edit-mode'
import { Button } from '@/shared/ui/button'
import { EditActions } from '@/shared/ui/edit-actions'
import { EXIT_TRANSITION, SPRING } from '@/shared/ui/motion-presets'
import { PillGroup } from '@/shared/ui/pill-group'
import { toast } from '@/shared/ui/toast'

import { type CareerFormat, summarizeCareer } from '../domain/career'
import type { PlayerEditing } from '../editor-types'
import type { PlayerSeasonRecord } from '../types'
import { SeasonEditor, type SeasonEditorIntent } from './editor/season-editor'
import {
  SeasonStatsTable,
  type StatsCell,
  type StatsColumn,
  type StatsDetails,
  type StatsRow,
} from './season-stats-table'
import { StatTile } from './stat-tile'

export type CareerStatsProps = {
  playerId: number
  playerName: string
  seasons: readonly PlayerSeasonRecord[]
  /** Editing actions; the controls show only in a signed-in editor's browser. */
  editing?: PlayerEditing
}

const BATTING_COLUMNS = [
  'matches',
  'innings',
  'notOuts',
  'runs',
  'balls',
  'average',
  'strikeRate',
  'highestScore',
  'hundreds',
  'fifties',
  'fours',
  'sixes',
] as const
const BOWLING_COLUMNS = [
  'matches',
  'innings',
  'overs',
  'maidens',
  'runsConceded',
  'wickets',
  'best',
  'average',
  'economy',
  'strikeRate',
  'fourWicketHauls',
  'fiveWicketHauls',
] as const

type Discipline = 'batting' | 'bowling'
type ColumnKey = 'season' | (typeof BATTING_COLUMNS)[number] | (typeof BOWLING_COLUMNS)[number]

function useColumns() {
  const t = useTranslations('players.profile.stats.columns')
  const column = (key: ColumnKey): StatsColumn => ({
    key,
    short: t(`${key}.short`),
    long: t(`${key}.long`),
  })
  return {
    season: column('season'),
    batting: BATTING_COLUMNS.map(column),
    bowling: BOWLING_COLUMNS.map(column),
  }
}

function useCells() {
  const format = useFormatter()
  const t = useTranslations('players.profile.stats')
  const count = (value: number): StatsCell => ({ text: format.number(value) })
  const rate = (value: number | null): StatsCell =>
    value === null
      ? { text: '–', label: t('notApplicable') }
      : { text: format.number(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

  const unknown: StatsCell = { text: '–', label: t('notApplicable') }

  const batting = (totals: BattingTotals | BattingCounts): StatsCell[] => [
    count(totals.matches),
    count(totals.innings),
    count(totals.notOuts),
    count(totals.runs),
    count(totals.balls),
    rate(calculateBattingAverage(totals.runs, getDismissals(totals))),
    rate(calculateStrikeRate(totals.runs, totals.balls)),
    !('highestScore' in totals)
      ? unknown
      : totals.isHighestScoreNotOut
        ? {
            text: `${format.number(totals.highestScore)}*`,
            label: `${format.number(totals.highestScore)} ${t('notOut')}`,
          }
        : count(totals.highestScore),
    count(totals.hundreds),
    count(totals.fifties),
    count(totals.fours),
    count(totals.sixes),
  ]

  const bowling = (totals: BowlingTotals | BowlingCounts): StatsCell[] => [
    count(totals.matches),
    count(totals.innings),
    { text: formatOvers(totals.balls) },
    count(totals.maidens),
    count(totals.runsConceded),
    count(totals.wickets),
    'bestFigures' in totals && totals.bestFigures
      ? { text: formatBowlingFigures(totals.bestFigures) }
      : unknown,
    rate(calculateBowlingAverage(totals.runsConceded, totals.wickets)),
    rate(calculateEconomyRate(totals.runsConceded, totals.balls)),
    rate(calculateBowlingStrikeRate(totals.balls, totals.wickets)),
    count(totals.fourWicketHauls),
    count(totals.fiveWicketHauls),
  ]

  return { batting, bowling }
}

type SeasonTableProps = {
  discipline: Discipline
  clubSeasons: readonly PlayerSeasonRecord[]
  /** Each team's league record per season; shown in the season's dropdown. */
  teamSeasons: readonly PlayerSeasonRecord[]
  districtSeasons: readonly PlayerSeasonRecord[]
  totals: BattingTotals | BowlingTotals | null
  renderActions?: (season: PlayerSeasonRecord) => ReactNode
}

/**
 * One discipline's table: a row per club season, each opening a dropdown with every team's own
 * figures (ECC I, II, III), the friendlies and other matches (the season less the teams' league
 * matches) and that year's district-team record; the career row adds up the club seasons only.
 */
function SeasonTable({
  discipline,
  clubSeasons,
  teamSeasons,
  districtSeasons,
  totals,
  renderActions,
}: SeasonTableProps) {
  const t = useTranslations('players.profile.stats')
  const tEditor = useTranslations('players.seasonEditor')
  const columns = useColumns()
  const cells = useCells()
  const headingId = `${discipline}-heading`
  const disciplineColumns = columns[discipline]

  const figures = (season: PlayerSeasonRecord): StatsCell[] | null => {
    if (discipline === 'batting') return season.batting ? cells.batting(season.batting) : null
    return season.bowling ? cells.bowling(season.bowling) : null
  }
  const totalsCells = (): StatsCell[] | null => {
    if (!totals) return null
    return 'notOuts' in totals ? cells.batting(totals) : cells.bowling(totals)
  }

  const districtRow = (season: PlayerSeasonRecord, heading: string): StatsRow[] => {
    const seasonCells = figures(season)
    if (!seasonCells) return []
    return [
      {
        key: `district-${String(season.id)}`,
        heading,
        headingLabel: t('district.label'),
        cells: seasonCells,
        actions: renderActions?.(season),
      },
    ]
  }

  /** The season less its teams' league matches: friendlies and series without team records. */
  const friendliesCells = (
    season: PlayerSeasonRecord,
    teams: readonly PlayerSeasonRecord[],
  ): StatsCell[] | null => {
    if (discipline === 'batting') {
      if (!season.batting) return null
      const rest = subtractBattingTotals(
        season.batting,
        teams.flatMap(({ batting }) => (batting ? [batting] : [])),
      )
      return rest ? cells.batting(rest) : null
    }
    if (!season.bowling) return null
    const rest = subtractBowlingTotals(
      season.bowling,
      teams.flatMap(({ bowling }) => (bowling ? [bowling] : [])),
    )
    return rest ? cells.bowling(rest) : null
  }

  const details = (season: PlayerSeasonRecord): StatsDetails | undefined => {
    const teams = teamSeasons.filter((record) => record.season === season.season)
    const district = districtSeasons.find((record) => record.season === season.season)
    const friendlies = teams.length > 0 ? friendliesCells(season, teams) : null
    const rows: StatsRow[] = [
      ...teams.flatMap((record): StatsRow[] => {
        const teamCells = figures(record)
        if (!teamCells || !record.team) return []
        return [
          {
            key: `team-${String(record.id)}`,
            heading: record.team.shortName.replace('-', ' '),
            headingLabel: record.team.name,
            cells: teamCells,
            actions: renderActions?.(record),
          },
        ]
      }),
      ...(friendlies ? [{ key: 'friendlies', heading: t('friendlies'), cells: friendlies }] : []),
      ...(district ? districtRow(district, t('district.row')) : []),
    ]
    if (rows.length === 0) return undefined
    return { toggleLabel: t('details.toggle'), rows }
  }

  const rows: StatsRow[] = clubSeasons.flatMap((season) => {
    const seasonCells = figures(season)
    if (!seasonCells) return []
    return [
      {
        key: String(season.id),
        heading: String(season.season),
        cells: seasonCells,
        actions: renderActions?.(season),
        details: details(season),
      },
    ]
  })
  // A district season without a club season that year still gets its own row.
  const loneDistrictRows = districtSeasons
    .filter((district) => !clubSeasons.some((season) => season.season === district.season))
    .flatMap((district) =>
      districtRow(district, `${String(district.season)} · ${t('district.row')}`),
    )
  const allRows = [...rows, ...loneDistrictRows]
  if (allRows.length === 0) return null

  const footerCells = totalsCells()
  return (
    <div className="space-y-3">
      <h3 id={headingId} className="font-display text-lg font-bold tracking-wide uppercase">
        {t(discipline)}
      </h3>
      <SeasonStatsTable
        labelledBy={headingId}
        rowHeading={columns.season}
        columns={disciplineColumns}
        rows={allRows}
        footer={
          footerCells ? { key: 'career', heading: t('career'), cells: footerCells } : undefined
        }
        actionsLabel={tEditor('add')}
      />
    </div>
  )
}

/**
 * The profile's career stats: headline figures, then batting and bowling season by season with
 * career totals for the club. Each season opens a dropdown with the teams it was played for and
 * the district-team record (not part of the club totals). Averages, strike rates and economy are
 * calculated from the stored counts (domain/cricket).
 */
export function CareerStats({ playerId, playerName, seasons, editing }: CareerStatsProps) {
  const t = useTranslations('players.profile.stats')
  const tEditor = useTranslations('players.seasonEditor')
  const format = useFormatter()
  const isEditMode = useIsEditMode() && editing !== undefined
  const [intent, setIntent] = useState<SeasonEditorIntent | null>(null)
  const [chosenFormat, setChosenFormat] = useState<CareerFormat>('all')
  const { formats } = summarizeCareer(seasons)
  // Falls back to all matches when the chosen format's last record was deleted.
  const seasonFormat = formats.includes(chosenFormat) ? chosenFormat : 'all'
  const summary = summarizeCareer(seasons, seasonFormat)
  const hasSeasons = seasons.length > 0
  const { batting, bowling } = summary

  const seasonLabel = (season: PlayerSeasonRecord) =>
    [
      String(season.season),
      tEditor(`competition.${season.competition}`),
      t(`formats.${season.format}`),
    ].join(' · ')
  const renderActions = isEditMode
    ? (season: PlayerSeasonRecord) => (
        <EditActions
          editLabel={tEditor('edit', { season: seasonLabel(season) })}
          deleteLabel={tEditor('delete', { season: seasonLabel(season) })}
          onEdit={() => {
            setIntent({ kind: 'edit', id: season.id })
          }}
          onDelete={() => {
            setIntent({ kind: 'delete', id: season.id, label: seasonLabel(season) })
          }}
          className="justify-end"
        />
      )
    : undefined
  const hasRecords = summary.clubSeasons.length > 0 || summary.districtSeasons.length > 0
  const formatCount = (value: number) => format.number(Math.round(value))

  return (
    <section
      aria-labelledby="career-stats-heading"
      className="space-y-6 rounded-3xl border border-border-default bg-surface-default p-6 shadow-sm sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 id="career-stats-heading" className="text-2xl font-bold">
            {t('heading')}
          </h2>
          {hasSeasons && <p className="text-sm text-text-muted">{t('source')}</p>}
        </div>
        {isEditMode && (
          <Button
            variant="secondary"
            onClick={() => {
              setIntent({ kind: 'add' })
            }}
          >
            {tEditor('add')}
          </Button>
        )}
      </div>

      {!hasSeasons && <p className="text-text-muted">{t('empty', { name: playerName })}</p>}

      {formats.length > 1 && (
        <div className="space-y-2">
          <PillGroup
            legend={t('formats.legend')}
            isLegendHidden
            options={formats.map((value) => ({ value, label: t(`formats.${value}`) }))}
            value={seasonFormat}
            onChange={setChosenFormat}
          />
          {seasonFormat === 'all' && (
            <p className="text-sm text-text-muted">{t('formats.allNote')}</p>
          )}
        </div>
      )}

      {/* Switching format crossfades the figures and tables. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={seasonFormat}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0, transition: SPRING }}
          exit={{ opacity: 0, y: -4, transition: EXIT_TRANSITION }}
          className="space-y-6"
        >
          {summary.clubSeasons.length > 0 && (
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile
                label={t('matches')}
                value={format.number(summary.matches)}
                countTo={summary.matches}
                format={formatCount}
              />
              <StatTile
                label={t('runs')}
                value={format.number(batting?.runs ?? 0)}
                countTo={batting?.runs ?? 0}
                format={formatCount}
              />
              <StatTile
                label={t('wickets')}
                value={format.number(bowling?.wickets ?? 0)}
                countTo={bowling?.wickets ?? 0}
                format={formatCount}
              />
              {batting ? (
                <StatTile
                  label={t('highestScore')}
                  value={`${format.number(batting.highestScore)}${batting.isHighestScoreNotOut ? '*' : ''}`}
                  srValue={
                    batting.isHighestScoreNotOut
                      ? `${format.number(batting.highestScore)} ${t('notOut')}`
                      : undefined
                  }
                />
              ) : (
                <StatTile label={t('highestScore')} value="–" srValue={t('notApplicable')} />
              )}
            </dl>
          )}

          {hasRecords && (
            <>
              <SeasonTable
                discipline="batting"
                clubSeasons={summary.clubSeasons}
                teamSeasons={summary.teamSeasons}
                districtSeasons={summary.districtSeasons}
                totals={batting}
                renderActions={renderActions}
              />
              <SeasonTable
                discipline="bowling"
                clubSeasons={summary.clubSeasons}
                teamSeasons={summary.teamSeasons}
                districtSeasons={summary.districtSeasons}
                totals={bowling}
                renderActions={renderActions}
              />
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {isEditMode && intent && (
        <SeasonEditor
          intent={intent}
          playerId={playerId}
          editing={editing}
          onClose={() => {
            setIntent(null)
          }}
          onDone={(message) => {
            setIntent(null)
            toast(message)
          }}
        />
      )}
    </section>
  )
}
