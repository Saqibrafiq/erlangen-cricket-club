import { Dumbbell, Medal, Trophy } from 'lucide-react'
import Image from 'next/image'
import { useFormatter, useTranslations } from 'next-intl'

import { FIXTURES_PATH, type Matchday } from '@/features/fixtures'
import { MEMBERSHIP_PATH } from '@/features/membership'
import { Link } from '@/i18n/navigation'
import logo from '@/shared/assets/ecc-logo.png'
import { Button } from '@/shared/ui/button'
import { Container } from '@/shared/ui/container'

import { getNextSeason } from '../domain/countdown'
import type { NextMatchLinks, TrainingTime } from '../types'
import { HeroScroll } from './hero-scroll'
import { NextMatchWidget } from './next-match-widget'

// Intrinsic size of the crest asset (see SiteHeader).
const LOGO_WIDTH = 150
const LOGO_HEIGHT = 192

export type MatchdayHeroProps = {
  matchday: Matchday
  nextMatch: NextMatchLinks | null
  training: TrainingTime | null
}

const CHIP_CLASS =
  'flex items-center gap-2 rounded-full bg-text-on-media/10 px-3 py-1.5 ring-1 ring-text-on-media/15'

/**
 * The first screen: who we are, our titles and how to join on the left, the next match on the
 * right. It stays pinned while the page slides up over it (HeroScroll).
 */
export function MatchdayHero({ matchday, nextMatch, training }: MatchdayHeroProps) {
  const t = useTranslations('home')
  const format = useFormatter()
  const { next } = matchday

  return (
    <HeroScroll>
      <section
        aria-labelledby="home-heading"
        className="relative isolate overflow-hidden bg-linear-to-br from-brand-surface via-media-overlay to-media-overlay text-text-on-media"
      >
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-dots-on-media" />
        <div
          aria-hidden="true"
          className="absolute -top-40 -left-32 -z-10 size-144 rounded-full bg-brand-primary/40 blur-3xl"
        />

        <Container className="grid items-center gap-10 py-12 sm:py-16 lg:min-h-hero lg:grid-cols-content-aside lg:gap-16 2xl:gap-24 short:lg:py-8">
          <div className="space-y-7 motion-safe:animate-fade-in short:lg:space-y-5">
            <Image
              src={logo}
              alt=""
              width={LOGO_WIDTH}
              height={LOGO_HEIGHT}
              priority
              className="h-20 w-auto drop-shadow-lg sm:h-24 2xl:h-28 short:lg:h-16"
            />
            <div className="space-y-4">
              <h1
                id="home-heading"
                className="font-display text-5xl leading-none font-bold tracking-tight text-balance uppercase sm:text-7xl xl:text-8xl 2xl:text-9xl short:xl:text-7xl"
              >
                {t('heading')}
              </h1>
              <p className="max-w-xl text-lg text-pretty opacity-90 sm:text-xl 2xl:max-w-2xl 2xl:text-2xl">
                {t('intro')}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" variant="on-media">
                <Link href={MEMBERSHIP_PATH}>{t('join')}</Link>
              </Button>
              <Button asChild size="lg" variant="on-media-outline">
                <Link href={FIXTURES_PATH}>{t('fixtures')}</Link>
              </Button>
            </div>
            <ul className="flex flex-wrap gap-2 text-sm font-medium">
              <li className={CHIP_CLASS}>
                <Trophy aria-hidden="true" className="size-4" />
                {t('titles')}
              </li>
              <li className={CHIP_CLASS}>
                <Medal aria-hidden="true" className="size-4" />
                {t('runnersUp')}
              </li>
              {training && (
                <li className={CHIP_CLASS}>
                  <Dumbbell aria-hidden="true" className="size-4" />
                  {t('training', {
                    day: format.dateTime(training.weekdayDate, { weekday: 'long' }),
                    start: training.startTime,
                    end: training.endTime,
                  })}
                </li>
              )}
            </ul>
          </div>

          <div className="motion-safe:animate-fade-in">
            <NextMatchWidget
              fixture={next}
              links={next ? nextMatch : null}
              nextSeason={getNextSeason(matchday.season)}
            />
          </div>
        </Container>
      </section>
    </HeroScroll>
  )
}
