import { describe, expect, it } from 'vitest'

import { ECC_TEAM } from '../test-factories'
import { buildFixturesMenu } from './build-fixtures-menu'

describe('buildFixturesMenu', () => {
  it('starts with the overview, then one group per club team', () => {
    expect(
      buildFixturesMenu(
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
        'All fixtures & results',
      ),
    ).toEqual([
      { links: [{ href: '/fixtures', label: 'All fixtures & results' }] },
      {
        label: 'Erlangen Cricket Club I',
        links: [{ href: '/fixtures/dcb-bl-2026', label: 'DCB-Bundesliga Südost: Bayern 2026' }],
      },
    ])
  })

  it('offers only the overview when there are no competitions', () => {
    expect(buildFixturesMenu(null, 'All fixtures & results')).toEqual([
      { links: [{ href: '/fixtures', label: 'All fixtures & results' }] },
    ])
  })
})
