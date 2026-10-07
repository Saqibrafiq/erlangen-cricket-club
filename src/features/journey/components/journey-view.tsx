import { HeartHandshake, Sprout, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { Button } from '@/shared/ui/button'
import { SectionHeading } from '@/shared/ui/section-heading'

import { groupByYear, yearAnchor } from '../domain/group-by-year'
import type { JourneyInfo } from '../types'
import { JourneyTimeline } from './journey-timeline'

export type JourneyViewProps = {
  info: JourneyInfo
  /** Where "Become a member" leads, e.g. the membership page. */
  membershipHref: string
}

const STATS = ['firstPlayers', 'founders', 'titles', 'teams'] as const
// One icon per chapter, in order: the start, the people, what we stand for.
const CHAPTER_ICONS = [Sprout, Users, HeartHandshake] as const

/** The club's story: a hero with key figures, the story in chapters, the timeline, an invitation. */
export function JourneyView({ info, membershipHref }: JourneyViewProps) {
  const t = useTranslations('journey')
  const years = groupByYear(info.milestones).map((group) => group.year)

  return (
    <div className="space-y-20 sm:space-y-28">
      <header className="rounded-3xl bg-media-overlay px-6 py-14 text-center text-text-on-media sm:px-12 sm:py-20">
        <div className="mx-auto max-w-3xl space-y-5">
          <p className="text-sm font-semibold tracking-wide uppercase opacity-80">{t('eyebrow')}</p>
          <h1 className="text-4xl leading-tight font-bold tracking-tight text-balance sm:text-6xl">
            {t('heading')}
          </h1>
          <p className="text-lg opacity-90 sm:text-xl">{t('lead')}</p>
        </div>
        <dl className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl bg-text-on-media/15 sm:grid-cols-4">
          {STATS.map((stat) => (
            // Label first in the markup (as a description list requires); the value is shown on top.
            <div key={stat} className="flex flex-col bg-media-overlay px-4 py-6">
              <dt className="text-sm opacity-80">{t(`stats.${stat}.label`)}</dt>
              <dd className="order-first font-display text-4xl font-bold tabular-nums sm:text-5xl">
                {t(`stats.${stat}.value`)}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      {info.chapters.length > 0 && (
        <section aria-labelledby="story-heading" className="space-y-10">
          <SectionHeading
            id="story-heading"
            eyebrow={t('story.eyebrow')}
            heading={t('story.heading')}
          />
          <ul className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
            {info.chapters.map((chapter, index) => {
              const Icon = CHAPTER_ICONS[index % CHAPTER_ICONS.length] ?? Sprout
              return (
                <li
                  key={chapter.title}
                  className="rounded-3xl border border-border-default bg-surface-default p-6 shadow-sm sm:p-8"
                >
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-surface-highlight text-brand-primary">
                    <Icon aria-hidden="true" className="size-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold">{chapter.title}</h3>
                  <p className="mt-2 text-text-muted">{chapter.text}</p>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {info.milestones.length > 0 && (
        <section aria-labelledby="timeline-heading" className="space-y-10">
          <SectionHeading
            id="timeline-heading"
            eyebrow={t('timeline.eyebrow')}
            heading={t('timeline.heading')}
            intro={t('timeline.intro')}
          />
          <nav aria-label={t('yearsLabel')}>
            <ul className="mx-auto flex max-w-3xl flex-wrap justify-center gap-2">
              {years.map((year) => (
                <li key={year}>
                  <a
                    href={`#${yearAnchor(year)}`}
                    className="inline-flex min-h-10 items-center rounded-full border border-border-default bg-surface-default px-4 font-display text-sm font-bold tabular-nums transition-colors duration-150 hover:border-brand-primary hover:bg-surface-highlight hover:text-brand-primary"
                  >
                    {year}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <JourneyTimeline milestones={info.milestones} />
        </section>
      )}

      <section
        aria-labelledby="next-chapter-heading"
        className="flex flex-col items-start gap-6 rounded-3xl bg-media-overlay p-8 text-text-on-media sm:flex-row sm:items-center sm:justify-between sm:p-12"
      >
        <div>
          <h2 id="next-chapter-heading" className="text-2xl font-bold sm:text-3xl">
            {t('cta.heading')}
          </h2>
          <p className="mt-1 opacity-90">{t('cta.text')}</p>
        </div>
        <Button asChild size="lg" variant="on-media">
          <Link href={membershipHref}>{t('cta.button')}</Link>
        </Button>
      </section>
    </div>
  )
}
