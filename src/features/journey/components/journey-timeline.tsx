import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

import { groupByYear, yearAnchor } from '../domain/group-by-year'
import type { Milestone } from '../types'

export type JourneyTimelineProps = {
  milestones: readonly Milestone[]
}

const readMoreClassName =
  'inline-flex min-h-11 items-center gap-1 text-sm font-medium text-brand-primary underline-offset-4 hover:underline'

function ReadMore({ href }: { href: string }) {
  const t = useTranslations('journey.timeline')
  const content = (
    <>
      {t('readMore')}
      <ArrowRight aria-hidden="true" className="size-4" />
    </>
  )

  return href.startsWith('/') ? (
    <Link href={href} className={readMoreClassName}>
      {content}
    </Link>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer" className={readMoreClassName}>
      {content}
    </a>
  )
}

function MilestoneCard({ milestone }: { milestone: Milestone }) {
  return (
    <article className="flex gap-3 rounded-2xl border border-border-default bg-surface-default p-4 shadow-sm transition-shadow duration-150 hover:shadow-md sm:gap-5 sm:p-5">
      {milestone.image && (
        <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-surface-muted sm:size-24">
          <Image
            src={milestone.image.url}
            alt={milestone.image.alt}
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>
      )}
      <div className="min-w-0">
        <h4 className="font-bold">{milestone.title}</h4>
        <p className="mt-1 text-sm text-text-muted">{milestone.text}</p>
        {milestone.link && <ReadMore href={milestone.link} />}
      </div>
    </article>
  )
}

/** Years down a thin line, each with its milestones as compact cards. */
export function JourneyTimeline({ milestones }: JourneyTimelineProps) {
  return (
    <ol className="mx-auto max-w-3xl">
      {groupByYear(milestones).map(({ year, milestones: ofYear }) => (
        <li
          key={year}
          id={yearAnchor(year)}
          className="grid scroll-mt-24 grid-cols-timeline gap-x-4 sm:grid-cols-timeline-wide sm:gap-x-6"
        >
          <h3 className="pt-3 text-right font-display text-2xl font-bold text-brand-primary sm:text-3xl">
            <time dateTime={String(year)}>{year}</time>
          </h3>
          <div className="relative space-y-3 border-l-2 border-border-default pb-10 pl-6 sm:pl-8">
            <span
              aria-hidden="true"
              className="absolute top-5 -left-1.75 size-3 rounded-full bg-brand-primary ring-4 ring-surface-default"
            />
            {ofYear.map((milestone) => (
              <MilestoneCard key={milestone.title} milestone={milestone} />
            ))}
          </div>
        </li>
      ))}
    </ol>
  )
}
