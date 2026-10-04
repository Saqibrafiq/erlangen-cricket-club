import { describe, expect, it } from 'vitest'

import { ECC_TEAM } from '../test-factories'
import { buildCompetitionMenu } from './build-competition-menu'

const OPTIONS = {
  overview: { href: '/standings', label: 'All standings' },
  competitionHref: (slug: string) => `/standings/${slug}`,
}

describe('buildCompetitionMenu', () => {
  it('starts with the overview, then one group per club team linking into the section', () => {
    expect(
      buildCompetitionMenu(
        {
          season: '2026',
          teams: [
            {
              team: ECC_TEAM,
              competitions: [
                {
                  id: 2,
                  slug: 'dcb-bl-2026',
                  name: 'DCB-Bundesliga Südost: Bayern',
                  season: '2026',
                },
              ],
            },
          ],
        },
        OPTIONS,
      ),
    ).toEqual([
      { links: [{ href: '/standings', label: 'All standings' }] },
      {
        label: 'Erlangen Cricket Club I',
        links: [{ href: '/standings/dcb-bl-2026', label: 'DCB-Bundesliga Südost: Bayern 2026' }],
      },
    ])
  })

  it('offers only the overview when there are no competitions', () => {
    expect(buildCompetitionMenu(null, OPTIONS)).toEqual([
      { links: [{ href: '/standings', label: 'All standings' }] },
    ])
  })
})
