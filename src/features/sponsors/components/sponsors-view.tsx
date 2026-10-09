import { ArrowDown, Megaphone, Sprout, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { Button } from '@/shared/ui/button'
import { SectionHeading } from '@/shared/ui/section-heading'

import { BECOME_SPONSOR_ID } from '../paths'
import type { Sponsor } from '../types'
import { SponsorCard } from './sponsor-card'

export type SponsorsViewProps = {
  sponsors: readonly Sponsor[]
  /** Where interested companies get in touch, e.g. the contact page. */
  contactHref: string
}

const BENEFITS = [
  { key: 'visibility', Icon: Megaphone },
  { key: 'community', Icon: Users },
  { key: 'impact', Icon: Sprout },
] as const

/** Thanks to our sponsors, who they are, and how to become one. */
export function SponsorsView({ sponsors, contactHref }: SponsorsViewProps) {
  const t = useTranslations('sponsors')

  return (
    <div className="space-y-20 sm:space-y-28">
      <header className="rounded-3xl bg-media-overlay px-6 py-14 text-center text-text-on-media sm:px-12 sm:py-20">
        <div className="mx-auto max-w-3xl space-y-5">
          <p className="text-sm font-semibold tracking-wide uppercase opacity-80">
            {t('hero.eyebrow')}
          </p>
          <h1 className="text-4xl leading-tight font-bold tracking-tight text-balance sm:text-6xl">
            {t('hero.heading')}
          </h1>
          <p className="text-lg opacity-90 sm:text-xl">{t('hero.lead')}</p>
          <div className="pt-3">
            <Button asChild size="lg" variant="on-media">
              <a href={`#${BECOME_SPONSOR_ID}`}>
                {t('hero.become')}
                <ArrowDown aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      <section aria-labelledby="sponsors-heading" className="space-y-10">
        <SectionHeading
          id="sponsors-heading"
          eyebrow={t('list.eyebrow')}
          heading={t('list.heading')}
          intro={t('list.intro')}
        />
        {sponsors.length === 0 ? (
          <p className="text-center text-text-muted">{t('list.empty')}</p>
        ) : (
          <ul className="mx-auto max-w-5xl space-y-6">
            {sponsors.map((sponsor) => (
              <li key={sponsor.id}>
                <SponsorCard sponsor={sponsor} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        id={BECOME_SPONSOR_ID}
        aria-labelledby="benefits-heading"
        className="scroll-mt-24 space-y-10"
      >
        <SectionHeading
          id="benefits-heading"
          eyebrow={t('benefits.eyebrow')}
          heading={t('benefits.heading')}
          intro={t('benefits.intro')}
        />
        <ul className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {BENEFITS.map(({ key, Icon }) => (
            <li
              key={key}
              className="rounded-3xl border border-border-default bg-surface-default p-6 shadow-sm sm:p-8"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-surface-highlight text-brand-primary">
                <Icon aria-hidden="true" className="size-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold">{t(`benefits.${key}.title`)}</h3>
              <p className="mt-2 text-text-muted">{t(`benefits.${key}.text`)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="sponsor-cta-heading"
        className="flex flex-col items-start gap-6 rounded-3xl bg-media-overlay p-8 text-text-on-media sm:flex-row sm:items-center sm:justify-between sm:p-12"
      >
        <div>
          <h2 id="sponsor-cta-heading" className="text-2xl font-bold sm:text-3xl">
            {t('cta.heading')}
          </h2>
          <p className="mt-1 opacity-90">{t('cta.text')}</p>
        </div>
        <Button asChild size="lg" variant="on-media">
          <Link href={contactHref}>{t('cta.button')}</Link>
        </Button>
      </section>
    </div>
  )
}
