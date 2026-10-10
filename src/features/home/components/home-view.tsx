import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { FIXTURES_PATH, FixtureCard } from '@/features/fixtures'
import { MEMBERSHIP_PATH } from '@/features/membership'
import { NEWS_PATH, NewsCard } from '@/features/news'
import { getPlayerPath, PLAYERS_PATH } from '@/features/players'
import { SPONSORS_PATH } from '@/features/sponsors'
import { ClubStandingCard, STANDINGS_PATH } from '@/features/standings'
import { Link } from '@/i18n/navigation'
import { Container } from '@/shared/ui/container'

import type { HomeData } from '../types'
import { CardRail } from './card-rail'
import { HomeSection } from './home-section'
import { InstagramFeed } from './instagram-feed'
import { JoinBand } from './join-band'
import { MatchdayHero } from './matchday-hero'
import { SeasonScoreboard } from './season-scoreboard'
import { ScrollStatement } from './scroll-statement'
import { SquadStory } from './squad-story'

export type HomeViewProps = {
  data: HomeData
}

/**
 * The home page as a scroll story, in persona order: the next match for players, the season and
 * tables for fans, the squad as a pinned scene, news and Instagram, then how to join and the
 * sponsors.
 */
export function HomeView({ data }: HomeViewProps) {
  const t = useTranslations('home')
  const { matchday } = data
  const hasUpcoming = matchday.upcoming.length > 0
  const matches = hasUpcoming ? matchday.upcoming : matchday.recentResults

  return (
    <>
      <MatchdayHero matchday={matchday} nextMatch={data.nextMatch} training={data.training} />

      {/* Slides up over the pinned hero, so it needs its own layer and background. */}
      <div className="relative z-10 bg-surface-default">
        <ScrollStatement
          headingId="statement-heading"
          heading={t('statement.heading')}
          text={t('statement.text')}
        />

        {matchday.season && matchday.record.played > 0 && (
          <SeasonScoreboard season={matchday.season} record={matchday.record} />
        )}

        {data.players.length > 0 && (
          <SquadStory
            headingId="squad-heading"
            heading={t('squad.heading')}
            text={t('squad.text', { count: data.squadSize, teams: data.clubTeams })}
            more={{ label: t('squad.all'), href: PLAYERS_PATH }}
            players={data.players.map((player) => ({
              id: player.id,
              name: player.name,
              href: getPlayerPath(player.slug),
              photo: player.photo,
            }))}
          />
        )}

        <Container className="space-y-16 py-14 sm:space-y-20 sm:py-20">
          {data.standings.length > 0 && (
            <HomeSection
              id="standings-heading"
              heading={t('standings.heading')}
              more={{ label: t('standings.all'), href: STANDINGS_PATH }}
            >
              <CardRail
                labelledBy="standings-heading"
                gridClassName="md:grid-cols-2 xl:grid-cols-4"
              >
                {data.standings.map(({ key, ...card }) => (
                  <ClubStandingCard key={key} {...card} />
                ))}
              </CardRail>
            </HomeSection>
          )}

          {matches.length > 0 && (
            <HomeSection
              id="matches-heading"
              heading={hasUpcoming ? t('comingUp.heading') : t('results.heading')}
              more={{
                label: hasUpcoming ? t('comingUp.all') : t('results.all'),
                href: FIXTURES_PATH,
              }}
            >
              <CardRail
                labelledBy="matches-heading"
                gridClassName="md:grid-cols-3"
                // Each card spans its four section rows, so sections line up across the grid.
                itemClassName="md:row-span-4 md:grid md:grid-rows-subgrid md:gap-y-0"
              >
                {matches.map((fixture) => (
                  <FixtureCard key={fixture.id} fixture={fixture} />
                ))}
              </CardRail>
            </HomeSection>
          )}

          {data.news.length > 0 && (
            <HomeSection
              id="news-heading"
              heading={t('news.heading')}
              more={{ label: t('news.all'), href: NEWS_PATH }}
            >
              <CardRail labelledBy="news-heading" gridClassName="md:grid-cols-3">
                {data.news.map((article) => (
                  <NewsCard key={article.slug} article={article} />
                ))}
              </CardRail>
            </HomeSection>
          )}

          {data.instagram && data.instagram.posts.length > 0 && (
            <InstagramFeed
              posts={data.instagram.posts}
              profileUrl={data.instagram.profileUrl}
              handle={data.instagram.handle}
            />
          )}

          <JoinBand joinHref={MEMBERSHIP_PATH} />

          {data.sponsors.length > 0 && (
            <HomeSection
              id="sponsors-heading"
              heading={t('sponsors.heading')}
              more={{ label: t('sponsors.all'), href: SPONSORS_PATH }}
              align="center"
            >
              <ul className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                {data.sponsors.map((sponsor) => (
                  <li key={sponsor.id}>
                    <Link
                      href={SPONSORS_PATH}
                      className="flex h-20 w-40 items-center justify-center rounded-2xl bg-surface-logo p-4 ring-1 ring-border-default transition-shadow duration-150 hover:shadow-md sm:h-24 sm:w-48"
                    >
                      {sponsor.logo ? (
                        <Image
                          src={sponsor.logo.url}
                          alt={sponsor.name}
                          width={sponsor.logo.width}
                          height={sponsor.logo.height}
                          sizes="192px"
                          className="max-h-14 w-auto object-contain"
                        />
                      ) : (
                        <span className="font-semibold text-media-overlay">{sponsor.name}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </HomeSection>
          )}
        </Container>
      </div>
    </>
  )
}
