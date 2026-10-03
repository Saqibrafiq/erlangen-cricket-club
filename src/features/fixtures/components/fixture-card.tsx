import { useFormatter, useTranslations } from 'next-intl'

import { getWinnerTeamId, type TeamOutcome } from '@/domain/cricket'
import { cn } from '@/shared/lib/cn'
import { Badge, type BadgeProps } from '@/shared/ui/badge'
import { TeamMonogram } from '@/shared/ui/team-monogram'

import type { FixtureInnings, FixtureSummary, FixtureTeam } from '../types'
import { ResultLine } from './result-line'

const OUTCOME_BADGE: Record<TeamOutcome, BadgeProps['variant']> = {
  won: 'success',
  lost: 'danger',
  tied: 'neutral',
  'no-result': 'neutral',
}

type Emphasis = 'winner' | 'loser' | 'neutral'

type TeamRowProps = {
  team: FixtureTeam
  innings: FixtureInnings | undefined
  showScore: boolean
  emphasis: Emphasis
}

function TeamRow({ team, innings, showScore, emphasis }: TeamRowProps) {
  const t = useTranslations('fixtures')

  return (
    // Fixed minimum height: a row looks the same with a two-line score, "Did not bat" or no score.
    <li className="flex min-h-10 items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-2.5">
        <TeamMonogram shortName={team.shortName} tone={team.isClubTeam ? 'club' : 'opponent'} />
        <span
          className={cn(
            'min-w-0 truncate',
            emphasis === 'winner' && 'font-semibold text-text-default',
            emphasis === 'loser' && 'text-text-muted',
            emphasis === 'neutral' && 'font-medium',
          )}
        >
          {team.name}
        </span>
      </span>
      {showScore && (
        // Overs sit under the score so the team name keeps its width in narrow cards.
        <span className="flex shrink-0 flex-col items-end text-right leading-tight tabular-nums">
          {innings ? (
            <>
              <span
                className={cn(
                  'font-display text-xl font-bold',
                  emphasis === 'loser' && 'text-text-muted',
                )}
              >
                {innings.runs}/{innings.wickets}
              </span>
              <span className="text-xs text-text-muted" aria-hidden="true">
                {t('oversShort', { overs: innings.overs, maxOvers: innings.maxOvers })}
              </span>
              <span className="sr-only">
                {t('oversLong', { overs: innings.overs, maxOvers: innings.maxOvers })}
              </span>
            </>
          ) : (
            <span className="text-sm text-text-muted">{t('didNotBat')}</span>
          )}
        </span>
      )}
    </li>
  )
}

export type FixtureCardProps = {
  fixture: FixtureSummary
  /** Hide the competition line when the card already sits under a competition heading. */
  showCompetition?: boolean
}

export function FixtureCard({ fixture, showCompetition = true }: FixtureCardProps) {
  const t = useTranslations('fixtures')
  const format = useFormatter()
  const [team1, team2] = fixture.teams
  // Forfeits and walkovers have a result but no innings, so no scores are shown.
  const showScores = fixture.status === 'completed' && fixture.innings.length > 0
  const hasMeta = showCompetition || Boolean(fixture.venue)
  const winnerTeamId = fixture.result ? getWinnerTeamId(fixture.result) : null
  const inningsFor = (team: FixtureTeam) =>
    fixture.innings.find((innings) => innings.battingTeamId === team.id)
  const emphasisFor = (team: FixtureTeam): Emphasis => {
    if (winnerTeamId === null) return 'neutral'
    return team.id === winnerTeamId ? 'winner' : 'loser'
  }

  return (
    /*
     * Always exactly four children (header, teams, result, meta). As a subgrid they
     * share row tracks with the other cards in the same grid row, so sections line up across
     * cards whatever their content. Outside a grid list the card simply stacks its sections.
     */
    <article className="row-span-4 grid w-full grid-rows-subgrid gap-y-0 rounded-lg border border-border-default bg-surface-default p-4 shadow-sm">
      <div className="flex min-h-6 flex-wrap items-center justify-between gap-2 text-sm text-text-muted">
        <h3 className="sr-only">{t('matchTitle', { team1: team1.name, team2: team2.name })}</h3>
        <p>
          <time dateTime={fixture.date.slice(0, 10)}>
            {format.dateTime(new Date(fixture.date), {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </time>
          {fixture.startTime && <> · {t('startTime', { time: fixture.startTime })}</>}
        </p>
        <div className="flex gap-2">
          {fixture.stage !== 'league' && (
            <Badge variant="brand">{t(`stage.${fixture.stage}`)}</Badge>
          )}
        </div>
      </div>

      <ul className="mt-3 space-y-2">
        <TeamRow
          team={team1}
          innings={inningsFor(team1)}
          showScore={showScores}
          emphasis={emphasisFor(team1)}
        />
        <TeamRow
          team={team2}
          innings={inningsFor(team2)}
          showScore={showScores}
          emphasis={emphasisFor(team2)}
        />
      </ul>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border-default pt-3">
        {fixture.result ? (
          <ResultLine result={fixture.result} teams={fixture.teams} />
        ) : (
          // No result yet (scheduled) or none possible (abandoned): show the status instead.
          <p className="text-sm text-text-muted">{t(`status.${fixture.status}`)}</p>
        )}
        {fixture.clubOutcome && (
          <Badge variant={OUTCOME_BADGE[fixture.clubOutcome]}>
            {t(`outcome.${fixture.clubOutcome}`)}
          </Badge>
        )}
      </div>

      <p className={cn('text-xs text-text-muted', hasMeta && 'mt-2')}>
        {showCompetition && `${fixture.competition.name} ${fixture.competition.season}`}
        {showCompetition && fixture.venue && ' · '}
        {fixture.venue}
      </p>
    </article>
  )
}
