import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { Button } from '@/shared/ui/button'

import type { MembershipImage } from '../types'
import { JOIN_SECTION_ID } from './membership-join'

const STATS = ['since', 'teams', 'levels'] as const

export type MembershipHeroProps = {
  image: MembershipImage | null
  contactHref: string
}

/** Full-width photo with the page's promise, the two ways in, and a few quick facts. */
export function MembershipHero({ image, contactHref }: MembershipHeroProps) {
  const t = useTranslations('membership.hero')

  return (
    <header className="relative isolate overflow-hidden rounded-3xl bg-media-overlay text-text-on-media">
      {image && (
        <Image
          src={image.url}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
      )}
      {/* Darkens the photo where the text sits, so it stays readable on any image. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-media-overlay via-media-overlay/75 to-media-overlay/20 lg:bg-linear-to-r lg:via-media-overlay/60 lg:to-transparent"
      />

      <div className="flex min-h-112 flex-col justify-end gap-8 p-6 sm:p-10 lg:p-14">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm font-semibold tracking-wide uppercase opacity-90">{t('eyebrow')}</p>
          <h1 className="text-4xl leading-tight font-bold tracking-tight text-balance sm:text-6xl">
            {t('heading')}
          </h1>
          <p className="text-lg opacity-90 sm:text-xl">{t('lead')}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg" variant="on-media">
              <a href={`#${JOIN_SECTION_ID}`}>
                {t('join')}
                <ArrowRight aria-hidden="true" />
              </a>
            </Button>
            <Button asChild size="lg" variant="on-media-outline">
              <Link href={contactHref}>{t('contact')}</Link>
            </Button>
          </div>
        </div>

        <dl className="grid max-w-2xl grid-cols-3 gap-4 border-t border-text-on-media/25 pt-6">
          {STATS.map((stat) => (
            <div key={stat}>
              <dt className="text-sm opacity-80">{t(`stats.${stat}.label`)}</dt>
              <dd className="font-display text-3xl font-bold sm:text-4xl">
                {t(`stats.${stat}.value`)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  )
}
