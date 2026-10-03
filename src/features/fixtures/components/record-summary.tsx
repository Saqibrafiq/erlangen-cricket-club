import { useFormatter, useTranslations } from 'next-intl'

import { cn } from '@/shared/lib/cn'

import { calculateWinRate } from '../domain/summarise-outcomes'
import type { OutcomeSummary } from '../types'

export type RecordSummaryProps = {
  summary: OutcomeSummary
}

const COUNT_KEYS = ['played', 'won', 'lost', 'tied'] as const

/** The club's record for the fixtures currently shown: counts plus win rate. */
export function RecordSummary({ summary }: RecordSummaryProps) {
  const t = useTranslations('fixtures')
  const format = useFormatter()

  if (summary.played === 0) {
    return null
  }

  const winRate = calculateWinRate(summary)
  const tiles = [
    ...COUNT_KEYS.map((key) => ({
      key,
      label: t(`record.${key}`),
      value: format.number(summary[key]),
    })),
    {
      key: 'winRate',
      label: t('record.winRate'),
      value:
        winRate === null
          ? '–'
          : format.number(winRate, { style: 'percent', maximumFractionDigits: 0 }),
    },
  ]

  return (
    <dl aria-label={t('recordLabel')} className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {tiles.map((tile) => (
        <div
          key={tile.key}
          className="rounded-lg border border-border-default bg-surface-default px-4 py-3 shadow-sm"
        >
          <dt className="text-xs font-medium tracking-wide text-text-muted uppercase">
            {tile.label}
          </dt>
          <dd
            className={cn(
              'font-display text-3xl font-bold tabular-nums',
              tile.key === 'winRate' && 'text-brand-primary',
            )}
          >
            {tile.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
