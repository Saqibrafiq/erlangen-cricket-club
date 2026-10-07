import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { Button } from '@/shared/ui/button'

import type { MembershipInfo } from '../types'
import { MembershipBenefits } from './membership-benefits'
import { MembershipFees } from './membership-fees'
import { MembershipHero } from './membership-hero'
import { MembershipJoin } from './membership-join'
import { MembershipSchedule } from './membership-schedule'

export type MembershipViewProps = {
  info: MembershipInfo
  /** The contact page, for questions before signing up. */
  contactHref: string
  /** Where the ground's address and directions are, e.g. the contact page's ground section. */
  directionsHref: string
}

/** The membership page: why join, fees, the week's training and match days, and how to join. */
export function MembershipView({ info, contactHref, directionsHref }: MembershipViewProps) {
  const t = useTranslations('membership.questions')

  return (
    <div className="space-y-20 sm:space-y-28">
      <MembershipHero image={info.heroImage} contactHref={contactHref} />
      <MembershipBenefits />
      <MembershipFees fees={info.fees} note={info.feesNote} terms={info.terms} />
      <MembershipSchedule
        sessions={info.sessions}
        note={info.sessionsNote}
        directionsHref={directionsHref}
      />
      <MembershipJoin applicationForm={info.applicationForm} contactHref={contactHref} />

      <section
        aria-labelledby="questions-heading"
        className="flex flex-col items-start gap-6 rounded-3xl bg-media-overlay p-8 text-text-on-media sm:flex-row sm:items-center sm:justify-between sm:p-12"
      >
        <div>
          <h2 id="questions-heading" className="text-2xl font-bold sm:text-3xl">
            {t('heading')}
          </h2>
          <p className="mt-1 opacity-90">{t('text')}</p>
        </div>
        <Button asChild size="lg" variant="on-media">
          <Link href={contactHref}>{t('contact')}</Link>
        </Button>
      </section>
    </div>
  )
}
