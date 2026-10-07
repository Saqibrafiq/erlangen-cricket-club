import { Download, MessageCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { Button } from '@/shared/ui/button'

import type { DownloadableDocument } from '../types'
import { SectionHeading } from '@/shared/ui/section-heading'

export const JOIN_SECTION_ID = 'join'

const STEPS = ['contact', 'apply', 'play'] as const

export type MembershipJoinProps = {
  applicationForm: DownloadableDocument | null
  contactHref: string
}

/** Three steps to membership, with the application form and the contact page as next actions. */
export function MembershipJoin({ applicationForm, contactHref }: MembershipJoinProps) {
  const t = useTranslations('membership.join')

  return (
    <section
      id={JOIN_SECTION_ID}
      aria-labelledby="join-heading"
      className="scroll-mt-24 space-y-10 rounded-3xl bg-surface-highlight px-6 py-12 sm:px-10"
    >
      <SectionHeading id="join-heading" eyebrow={t('eyebrow')} heading={t('heading')} />

      <ol className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step} className="relative text-center">
            {/* Connector to the next step on wide screens. */}
            {index < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute top-7 left-1/2 hidden h-0.5 w-full bg-brand-primary/30 md:block"
              />
            )}
            <span
              aria-hidden="true"
              className="relative mx-auto flex size-14 items-center justify-center rounded-full bg-brand-primary font-display text-2xl font-bold text-brand-on-primary shadow-md"
            >
              {index + 1}
            </span>
            <h3 className="mt-4 text-lg font-bold">{t(`steps.${step}.title`)}</h3>
            <p className="mx-auto mt-1 max-w-xs text-text-muted">{t(`steps.${step}.text`)}</p>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap justify-center gap-3">
        {applicationForm && (
          <Button asChild size="lg" className="max-w-full whitespace-normal">
            <a href={applicationForm.url} download>
              <Download aria-hidden="true" />
              {applicationForm.title}
            </a>
          </Button>
        )}
        <Button asChild size="lg" variant="secondary">
          <Link href={contactHref}>
            <MessageCircle aria-hidden="true" />
            {t('contact')}
          </Link>
        </Button>
      </div>
    </section>
  )
}
