import { ArrowRight, ExternalLink, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'

import type { Sponsor } from '../types'

export type SponsorCardProps = {
  sponsor: Sponsor
}

/** A sponsor with logo, level, year, description and links; the title sponsor stands out. */
export function SponsorCard({ sponsor }: SponsorCardProps) {
  const t = useTranslations('sponsors.card')
  const isTitle = sponsor.tier === 'title'

  return (
    <article
      className={cn(
        'relative grid overflow-hidden rounded-3xl bg-surface-default md:grid-cols-aside-content',
        isTitle
          ? 'border-2 border-brand-primary shadow-xl'
          : 'border border-border-default shadow-sm',
      )}
    >
      {/* Logos are designed for white, so the panel stays white in dark mode too. */}
      <div className="flex min-h-48 items-center justify-center bg-surface-logo p-8 sm:p-12">
        {sponsor.logo ? (
          <Image
            src={sponsor.logo.url}
            alt={sponsor.logo.alt}
            width={sponsor.logo.width}
            height={sponsor.logo.height}
            sizes="320px"
            className="max-h-28 w-auto object-contain"
          />
        ) : (
          <span className="font-display text-3xl font-bold text-media-overlay">{sponsor.name}</span>
        )}
      </div>

      <div className="flex flex-col gap-4 p-6 sm:p-10">
        <p className="flex flex-wrap items-center gap-2 text-sm">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-3 py-1 font-semibold',
              isTitle
                ? 'bg-brand-primary text-brand-on-primary'
                : 'bg-surface-highlight text-brand-primary',
            )}
          >
            {isTitle && <Sparkles aria-hidden="true" className="size-3.5" />}
            {t(`tier.${sponsor.tier}`)}
          </span>
          <span className="text-text-muted">{t('since', { year: sponsor.since })}</span>
        </p>
        <h3 className="font-display text-3xl font-bold">{sponsor.name}</h3>
        <p className="text-text-muted">{sponsor.description}</p>
        {(sponsor.website ?? sponsor.announcementHref) && (
          <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
            {sponsor.website && (
              <Button asChild variant={isTitle ? 'primary' : 'secondary'}>
                <a href={sponsor.website} target="_blank" rel="noopener noreferrer">
                  {t('website')}
                  <ExternalLink aria-hidden="true" />
                  <span className="sr-only">{t('websiteOf', { name: sponsor.name })}</span>
                </a>
              </Button>
            )}
            {sponsor.announcementHref && (
              <Link
                href={sponsor.announcementHref}
                className="inline-flex min-h-11 items-center gap-1 font-medium text-brand-primary underline-offset-4 hover:underline"
              >
                {t('announcement')}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
