import { getContactInfo } from '@/features/contact'
import { getKickoff, getMatchday } from '@/features/fixtures'
import { getInstagramHandle, getInstagramPosts } from '@/features/instagram'
import { type ClubSession, getMembershipInfo, getWeekdayDate } from '@/features/membership'
import { getNewsList } from '@/features/news'
import { getPlayers } from '@/features/players'
import { getSponsors } from '@/features/sponsors'
import { getClubStandings, getStandingsOverview } from '@/features/standings'
import { TIME_ZONE, type Locale } from '@/i18n/routing'

import { pickFeaturedPlayers } from '../domain/home'
import { getFixtureCalendarPath } from '../paths'
import type { HomeData, TrainingTime } from '../types'

const LATEST_NEWS = 3

function getTraining(sessions: readonly ClubSession[]): TrainingTime | null {
  // The first session in the admin is the weekly training (match days follow).
  const [session] = sessions
  const [day] = session?.days ?? []
  if (!session || !day) {
    return null
  }

  return {
    weekdayDate: getWeekdayDate(day),
    startTime: session.startTime,
    endTime: session.endTime,
  }
}

/** Everything the home page shows, in `locale`, with matches relative to `now`. */
export async function getHomeData(locale: Locale, now: Date): Promise<HomeData> {
  const [matchday, standings, players, news, sponsors, contact, membership, posts] =
    await Promise.all([
      getMatchday(now, TIME_ZONE),
      getStandingsOverview(),
      getPlayers(locale),
      getNewsList(locale),
      getSponsors(locale),
      getContactInfo(locale),
      getMembershipInfo(locale),
      getInstagramPosts(now),
    ])
  const { next } = matchday
  const clubStandings = getClubStandings(standings, { withCompetition: true })

  return {
    matchday,
    nextMatch: next && {
      calendarHref: getFixtureCalendarPath(next.id),
      kickoff: getKickoff(next.date, next.startTime, TIME_ZONE)?.toISOString() ?? null,
    },
    standings: clubStandings,
    clubTeams: new Set(clubStandings.map((entry) => entry.row.team.id)).size,
    players: pickFeaturedPlayers(players),
    squadSize: players.length,
    news: news.slice(0, LATEST_NEWS),
    sponsors,
    instagram: contact.instagramUrl
      ? {
          profileUrl: contact.instagramUrl,
          handle: getInstagramHandle(contact.instagramUrl),
          posts,
        }
      : null,
    training: getTraining(membership.sessions),
  }
}
