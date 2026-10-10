'use client'

import { useFormatter, useTranslations } from 'next-intl'

import { Container } from '@/shared/ui/container'
import { CountUp } from '@/shared/ui/count-up'

import { ScoreboardDigits } from './scoreboard-digits'

export type SeasonRecord = {
  played: number
  won: number
  lost: number
  tied: number
}

export type SeasonScoreboardProps = {
  season: string
  record: SeasonRecord
}

type StatKey = 'played' | 'won' | 'lost' | 'winRate'

/** The season's record on the ground scoreboard: LED numbers that count up when they come into view. */
export function SeasonScoreboard({ season, record }: SeasonScoreboardProps) {
  const t = useTranslations('home.season')
  const format = useFormatter()
  const decided = record.won + record.lost + record.tied
  const stats: { key: StatKey; value: number }[] = [
    { key: 'played', value: record.played },
    { key: 'won', value: record.won },
    { key: 'lost', value: record.lost },
    // No win rate before a match has been decided.
    ...(decided > 0 ? [{ key: 'winRate' as const, value: record.won / decided }] : []),
  ]

  return (
    <section aria-labelledby="season-heading" className="bg-scoreboard text-text-on-media">
      <Container className="grid gap-8 py-12 sm:py-16 lg:grid-cols-hero lg:items-center lg:gap-16">
        <div className="space-y-2">
          <h2
            id="season-heading"
            className="font-display text-4xl leading-none font-bold uppercase sm:text-5xl"
          >
            {t('heading', { season })}
          </h2>
          <p className="max-w-sm opacity-75">{t('text')}</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
          {stats.map(({ key, value }) => (
            // Label first in the markup (as a description list requires); the digits are on top.
            <div key={key} className="flex flex-col items-start gap-2">
              <dt className="text-sm opacity-75">{t(key)}</dt>
              <dd className="order-first">
                <CountUp
                  value={value}
                  format={
                    key === 'winRate'
                      ? (current) => format.number(current, { style: 'percent' })
                      : undefined
                  }
                  render={(text) => <ScoreboardDigits value={text} size="lg" />}
                />
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  )
}
