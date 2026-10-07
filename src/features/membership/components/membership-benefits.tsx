import { CalendarDays, Dumbbell, Trophy, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionHeading } from '@/shared/ui/section-heading'

const BENEFITS = [
  { key: 'league', Icon: Trophy },
  { key: 'training', Icon: CalendarDays },
  { key: 'social', Icon: Users },
  { key: 'ground', Icon: Dumbbell },
] as const

/** Why join: league cricket, training, friends and contacts, and our ground and equipment. */
export function MembershipBenefits() {
  const t = useTranslations('membership.benefits')

  return (
    <section aria-labelledby="benefits-heading" className="space-y-10">
      <SectionHeading id="benefits-heading" eyebrow={t('eyebrow')} heading={t('heading')} />
      <ul className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {BENEFITS.map(({ key, Icon }) => (
          <li
            key={key}
            className="group rounded-3xl border border-border-default bg-surface-default p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-surface-highlight text-brand-primary transition-colors duration-200 group-hover:bg-brand-primary group-hover:text-brand-on-primary">
              <Icon aria-hidden="true" className="size-6" />
            </span>
            <h3 className="mt-5 text-lg font-bold">{t(`${key}.title`)}</h3>
            <p className="mt-2 text-text-muted">{t(`${key}.text`)}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
