import {
  buildFixtureCalendar,
  getCompetitionPath,
  getFixture,
  getFixtureDay,
  getKickoff,
} from '@/features/fixtures'
import { TIME_ZONE } from '@/i18n/routing'
import { siteConfig } from '@/shared/config/site'

const FILE_PATTERN = /^fixture-(\d+)\.ics$/

/** "Add to calendar": a fixture as an .ics file, e.g. /calendar/fixture-42.ics. */
export async function GET(_request: Request, { params }: RouteContext<'/calendar/[file]'>) {
  const { file } = await params
  const id = FILE_PATTERN.exec(file)?.[1]
  const fixture = id ? await getFixture(Number(id)) : null

  if (!fixture) {
    return new Response('Not found', { status: 404 })
  }

  const calendar = buildFixtureCalendar(fixture, {
    kickoff: getKickoff(fixture.date, fixture.startTime, TIME_ZONE),
    day: getFixtureDay(fixture.date, TIME_ZONE),
    url: `${siteConfig.url}${getCompetitionPath(fixture.competition.slug)}`,
    host: new URL(siteConfig.url).hostname,
    now: new Date(),
  })

  return new Response(calendar, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${file}"`,
    },
  })
}
