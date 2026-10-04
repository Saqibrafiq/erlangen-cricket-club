import { expect, test } from '@playwright/test'

import { expectNoAxeViolations } from './a11y'

// Runs against the seeded data: all four 2026 tables are seeded exactly as published on CricClubs.
const T20 = {
  path: '/standings/bcv-t20-regionalliga-bayern-2026',
  title: 'BCV T20 Regionalliga Bayern 2026',
}
const BUNDESLIGA = {
  path: '/standings/dcb-bundesliga-suedost-bayern-2026',
  title: 'DCB-Bundesliga Südost: Bayern 2026',
}
const REGIONALLIGA = {
  path: '/standings/bcv-regionalliga-bayern-2026',
  title: 'BCV Regionalliga Bayern 2026',
}
const VERBANDSLIGA = {
  path: '/standings/bcv-t20-1-verbandsliga-2026',
  title: 'BCV T20 1. Verbandsliga 2026',
}

/** [team code, MAT, WON, LOST, N/R, TIE, PTS, WIN %, NET RR, FOR, AGAINST] as published. */
type PublishedRow = readonly [string, ...string[]]

// The site shows the club's full team names; other teams by their league code.
const CLUB_TEAM_NAMES: Partial<Record<string, string>> = {
  'ECC-I': 'Erlangen Cricket Club I',
  'ECC-II': 'Erlangen Cricket Club II',
}

test.describe('standings navigation', () => {
  test('opens a competition table from the header dropdown', async ({ page }) => {
    await page.goto('/')

    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('button', { name: 'Standings' })
      .click()
    await page
      .getByRole('list', { name: 'Erlangen Cricket Club II' })
      .getByRole('link', { name: VERBANDSLIGA.title })
      .click()

    await expect(page).toHaveURL(new RegExp(`${VERBANDSLIGA.path}$`))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(VERBANDSLIGA.title)
  })

  test('links each competition table to its fixtures', async ({ page }) => {
    await page.goto(T20.path)

    await page.getByRole('link', { name: 'Fixtures & results' }).click()

    await expect(page).toHaveURL(/\/fixtures\/bcv-t20-regionalliga-bayern-2026$/)
  })
})

test.describe('standings pages', () => {
  test('lists the published table of every competition', async ({ page }) => {
    await page.goto('/standings')

    await expect(page).toHaveTitle('Standings | Erlangen Cricket Club')
    await expect(page.getByRole('table')).toHaveCount(4)
  })

  // Published CricClubs tables: TEAM, MAT, WON, LOST, N/R, TIE, PTS, WIN %, NET RR, FOR, AGAINST.
  // The page adds the position (Pl) before the team and otherwise keeps the published columns.
  const tables: { competition: typeof T20; rows: PublishedRow[] }[] = [
    {
      competition: T20,
      rows: [
        ['TSVGC', '14', '10', '4', '0', '0', '80', '71.43%', '1.4260', '2185/243.4', '2016/267.2'],
        ['ECC-I', '14', '9', '3', '0', '2', '80', '71.43%', '1.1694', '1954/243.4', '1596/233'],
        ['SDTCC-I', '14', '9', '4', '0', '1', '76', '67.86%', '0.2675', '1969/245.2', '1937/249.4'],
        ['NCC-I', '14', '9', '5', '0', '0', '72', '64.29%', '1.4985', '1803/206.5', '1469/203.3'],
        ['SVL-I', '14', '8', '5', '0', '1', '68', '60.71%', '-0.2636', '1607/248.1', '1778/263.5'],
        ['CCB-II', '14', '6', '8', '0', '0', '48', '42.86%', '-0.8875', '2062/256', '2164/242'],
        ['MCC-I', '14', '2', '12', '0', '0', '16', '14.29%', '-2.5452', '1340/224', '1714/201'],
        ['SKCC', '14', '1', '13', '0', '0', '8', '7.14%', '-4.0217', '1378/271', '1624/178.2'],
      ],
    },
    {
      competition: VERBANDSLIGA,
      rows: [
        ['BACC', '16', '12', '4', '0', '0', '96', '75.00%', '1.8558', '2702/296.2', '2284/314.3'],
        ['NCC-II', '16', '11', '5', '0', '0', '88', '68.75%', '0.4958', '2531/301.3', '2475/313.2'],
        ['AUXCC', '16', '10', '6', '0', '0', '80', '62.50%', '0.1100', '1987/284', '1942/282'],
        ['INCC-I', '16', '9', '7', '0', '0', '72', '56.25%', '0.6550', '2583/292', '2374/289.5'],
        ['WUC', '16', '8', '7', '0', '1', '68', '53.12%', '-0.2233', '2235/303.4', '2160/284.5'],
        [
          'BATCC-I',
          '16',
          '7',
          '8',
          '0',
          '1',
          '60',
          '46.88%',
          '-0.5159',
          '1953/292.5',
          '2231/310.3',
        ],
        ['ECC-II', '16', '7', '9', '0', '0', '56', '43.75%', '0.0733', '1703/256.1', '1739/264.3'],
        ['INRS', '16', '6', '10', '0', '0', '48', '37.50%', '-1.7695', '1972/267.4', '2269/248.2'],
        [
          'SDTCC-II',
          '16',
          '1',
          '15',
          '0',
          '0',
          '8',
          '6.25%',
          '-3.3579',
          '1439/289.3',
          '1631/195.5',
        ],
      ],
    },
    {
      competition: BUNDESLIGA,
      rows: [
        ['SVWB', '9', '9', '0', '0', '0', '72', '100.00%', '1.2977', '1654/293.5', '1451/335'],
        ['CCB-I', '9', '8', '1', '0', '0', '64', '88.89%', '2.0877', '2569/412.4', '1833/443'],
        ['DWCC', '9', '6', '3', '0', '0', '48', '66.67%', '0.4983', '1436/325.5', '1559/398.5'],
        ['ECC-I', '9', '5', '4', '0', '0', '40', '55.56%', '-0.1000', '1592/383.5', '1481/348.4'],
        ['NCC-I', '9', '5', '4', '0', '0', '40', '55.56%', '-0.4648', '1861/388.2', '2137/406.3'],
        ['SSC-I', '9', '4', '5', '0', '0', '32', '44.44%', '-0.3036', '2130/436', '1932/372.2'],
        ['INCC-I', '9', '4', '5', '0', '0', '32', '44.44%', '-0.5858', '2142/438.3', '2139/391'],
        ['SDTCC-I', '9', '2', '7', '0', '0', '16', '22.22%', '-0.3102', '1903/440.4', '1988/429.3'],
        ['SVL-I', '9', '2', '7', '0', '0', '16', '22.22%', '-0.4555', '1675/450', '1747/418.1'],
        ['MCC-I', '9', '0', '9', '0', '0', '0', '0.00%', '-3.4664', '1179/423', '1874/299.4'],
      ],
    },
    {
      competition: REGIONALLIGA,
      rows: [
        ['INRS', '8', '5', '3', '0', '0', '40', '62.50%', '1.6027', '1797/365.3', '1193/360'],
        ['BATCC-I', '8', '5', '3', '0', '0', '40', '62.50%', '1.0999', '1429/283.2', '1423/360.5'],
        ['SWCC', '8', '5', '3', '0', '0', '40', '62.50%', '1.0314', '1423/304', '1399/383.2'],
        ['SGMC', '8', '5', '3', '0', '0', '40', '62.50%', '0.3133', '1382/331.5', '1348/350'],
        ['ECC-II', '8', '5', '3', '0', '0', '40', '62.50%', '-0.0637', '1543/372', '1493/354.3'],
        ['SVL-II', '8', '4', '4', '0', '0', '32', '50.00%', '0.2578', '1437/356.4', '1291/342.2'],
        ['WUC', '8', '3', '5', '0', '0', '24', '37.50%', '-0.2979', '1527/367.4', '1592/357.4'],
        ['NCC-II', '8', '2', '6', '0', '0', '16', '25.00%', '-1.6168', '1650/374.5', '1929/320.3'],
        ['COCC', '8', '2', '6', '0', '0', '16', '25.00%', '-2.5384', '1058/362.3', '1578/289.1'],
      ],
    },
  ]

  for (const { competition, rows } of tables) {
    test(`shows the published ${competition.title} table row by row`, async ({ page }) => {
      await page.goto(competition.path)

      const bodyRows = page.locator('tbody tr')
      await expect(bodyRows).toHaveCount(rows.length)

      for (const [index, [team, ...cells]] of rows.entries()) {
        const row = bodyRows.nth(index)
        await expect(row.getByRole('rowheader')).toContainText(CLUB_TEAM_NAMES[team] ?? team)
        await expect(row.locator('td')).toHaveText([String(index + 1), ...cells])
      }
    })
  }

  test('keeps the official order without sort controls', async ({ page }) => {
    await page.goto(T20.path)

    await expect(page.getByRole('table').getByRole('button')).toHaveCount(0)
    await expect(page.getByRole('row').nth(1).getByRole('cell').first()).toHaveText('1')
  })

  test('scrolls the table inside its own container on phones, not the page', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'Only narrow screens overflow.')
    await page.goto(T20.path)

    const pageOverflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    )
    expect(pageOverflows).toBe(false)
  })

  test('returns 404 for an unknown competition', async ({ page }) => {
    const response = await page.goto('/standings/no-such-competition')

    expect(response?.status()).toBe(404)
  })

  test('is available in German', async ({ page }) => {
    await page.goto(`/de${T20.path}`)

    await expect(page.getByRole('columnheader', { name: 'Punkte' })).toBeVisible()
  })

  test('has no accessibility violations in light and dark mode', async ({ page }) => {
    await page.goto(T20.path)
    await expectNoAxeViolations(page)

    await page.emulateMedia({ colorScheme: 'dark' })
    await page.reload()
    await expectNoAxeViolations(page)
  })
})
