import { Check, Sparkles } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'

import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'

import type { MembershipFee } from '../types'
import { JOIN_SECTION_ID } from './membership-join'
import { SectionHeading } from './section-heading'

export type MembershipFeesProps = {
  fees: readonly MembershipFee[]
  note: string | null
  terms: string | null
}

/** Membership types side by side, like a pricing table; the league option stands out. */
export function MembershipFees({ fees, note, terms }: MembershipFeesProps) {
  const t = useTranslations('membership.fees')
  const format = useFormatter()
  const euros = (amount: number) =>
    format.number(amount, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

  return (
    <section id="fees" aria-labelledby="fees-heading" className="scroll-mt-24 space-y-10">
      <SectionHeading
        id="fees-heading"
        eyebrow={t('eyebrow')}
        heading={t('heading')}
        intro={t('intro')}
      />

      {fees.length === 0 ? (
        <p className="text-center text-text-muted">{t('empty')}</p>
      ) : (
        <ul className="mx-auto grid max-w-6xl items-stretch gap-6 lg:grid-cols-3">
          {fees.map((fee) => (
            <li
              key={fee.name}
              className={cn(
                'relative flex flex-col rounded-3xl bg-surface-default p-6 sm:p-8',
                fee.isHighlighted
                  ? 'border-2 border-brand-primary shadow-xl'
                  : 'border border-border-default shadow-sm',
              )}
            >
              {fee.isHighlighted && (
                <p className="absolute -top-3.5 left-6 inline-flex items-center gap-1 rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-brand-on-primary">
                  <Sparkles aria-hidden="true" className="size-3.5" />
                  {t('highlight')}
                </p>
              )}
              <h3 className="font-display text-2xl font-bold">{fee.name}</h3>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold tabular-nums">
                  {euros(fee.annualFee)}
                </span>
                <span className="text-text-muted">{t('perYear')}</span>
              </p>
              <div className="mt-2 min-h-12 space-y-1 text-sm">
                {fee.reducedFee !== null && (
                  <p className="text-text-muted">
                    {t('reduced', { amount: euros(fee.reducedFee) })}
                  </p>
                )}
                {fee.perMatchFee !== null && (
                  <p className="font-medium text-brand-primary">
                    {t('perMatch', { amount: euros(fee.perMatchFee) })}
                  </p>
                )}
              </div>
              <ul className="mt-6 flex-1 space-y-3 border-t border-border-default pt-6">
                {fee.includes.map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 size-5 shrink-0 text-brand-primary"
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={fee.isHighlighted ? 'primary' : 'secondary'}
                size="lg"
                className="mt-8 w-full"
              >
                <a href={`#${JOIN_SECTION_ID}`}>{t('choose', { membership: fee.name })}</a>
              </Button>
            </li>
          ))}
        </ul>
      )}

      {(note ?? terms) && (
        <div className="mx-auto max-w-3xl space-y-4 text-sm text-text-muted">
          {note && <p>{note}</p>}
          {terms && (
            <details className="rounded-2xl border border-border-default bg-surface-default p-4">
              <summary className="cursor-pointer font-medium text-text-default">
                {t('terms')}
              </summary>
              <p className="mt-2">{terms}</p>
            </details>
          )}
        </div>
      )}
    </section>
  )
}
