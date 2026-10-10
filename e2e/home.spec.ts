import { expect, type APIRequestContext, test } from '@playwright/test'

import { expectNoAxeViolations } from './a11y'

// Runs against the seeded data: the 2026 season is complete, nothing is scheduled.
async function getCompletedClubFixtureId(request: APIRequestContext): Promise<number> {
  const response = await request.get(
    '/api/fixtures?where[status][equals]=completed&limit=1&depth=0',
  )
  const { docs } = (await response.json()) as { docs: { id: number }[] }
  const [fixture] = docs
  if (!fixture) throw new Error('Seed data has no completed fixture')
  return fixture.id
}

test.describe('home page', () => {
  test('shows the club name as the only h1 in English by default', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Erlangen Cricket Club')
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    await expect(page).toHaveTitle('Erlangen Cricket Club')
  })

  test('between seasons shows the next match card with TBD, then the latest results', async ({
    page,
  }) => {
    await page.goto('/')

    const card = page.getByRole('article', { name: 'Next match' })
    await expect(card).toContainText('2027 fixtures coming soon')
    await expect(card).toContainText('Opponent TBA')
    await expect(card.getByRole('link', { name: 'Last season’s results' })).toHaveAttribute(
      'href',
      '/fixtures',
    )
    await expect(page.getByRole('heading', { name: 'Latest results' })).toBeAttached()
    await expect(
      page.getByRole('region', { name: 'Season 2026' }).getByText('Played'),
    ).toBeAttached()
  })

  test('leads to joining and the squad, with Instagram and Facebook in the footer', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(page.getByRole('link', { name: 'Join the club' })).toHaveAttribute(
      'href',
      '/membership',
    )
    const squad = page.getByRole('region', { name: 'Meet the squad' })
    await expect(squad.getByRole('link', { name: 'Saqib Rafiq' })).toHaveAttribute(
      'href',
      '/players/saqib-rafiq',
    )
    // Editors pick the line-up: Parikshhit is not in it.
    await expect(squad.getByRole('link', { name: 'Parikshhit Kulkarni' })).toHaveCount(0)
    const social = page.getByRole('contentinfo').getByRole('list', { name: 'Social media' })
    await expect(
      social.getByRole('link', { name: /Erlangen Cricket Club on Instagram/ }),
    ).toHaveAttribute('href', 'https://www.instagram.com/er_cricketclub')
    await expect(social.getByRole('link', { name: /on Facebook/ })).toHaveAttribute(
      'href',
      'https://www.facebook.com/CricketClubErlangen',
    )
  })

  test('swipes card rails on phones without scrolling the page sideways', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'The rails are grids on larger screens.')
    await page.goto('/')

    const pageOverflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    )
    expect(pageOverflows).toBe(false)
    await expect(page.getByRole('group', { name: 'Latest news' })).toBeVisible()
  })

  test('serves German under /de with hreflang alternates', async ({ page }) => {
    await page.goto('/de')

    await expect(page.locator('html')).toHaveAttribute('lang', 'de')
    await expect(page.getByRole('article', { name: 'Nächstes Spiel' })).toContainText(
      'Spielplan 2027 folgt bald',
    )
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/de$/)
  })

  test('moves focus to the skip link first and jumps to main content', async ({ page }) => {
    await page.goto('/')

    await page.keyboard.press('Tab')
    const skipLink = page.getByRole('link', { name: 'Skip to main content' })
    await expect(skipLink).toBeFocused()

    await page.keyboard.press('Enter')
    await expect(page.locator('main')).toBeFocused()
  })

  test('has no accessibility violations in light and dark mode', async ({ page }) => {
    await page.goto('/')
    await expectNoAxeViolations(page)

    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/de')
    await expectNoAxeViolations(page)
  })
})

test.describe('fixture downloads', () => {
  test('offers a fixture as a calendar file', async ({ request }) => {
    const id = await getCompletedClubFixtureId(request)
    const response = await request.get(`/calendar/fixture-${String(id)}.ics`)

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('text/calendar')
    expect(await response.text()).toContain('BEGIN:VEVENT')
    expect((await request.get('/calendar/fixture-999999.ics')).status()).toBe(404)
  })

  test('renders Instagram graphics for results and players', async ({ request }) => {
    const id = await getCompletedClubFixtureId(request)

    for (const path of [
      `/instagram/de/result-${String(id)}.png`,
      '/instagram/en/player-saqib-rafiq.png',
    ]) {
      const response = await request.get(path)
      expect(response.status(), path).toBe(200)
      expect(response.headers()['content-type']).toBe('image/png')
    }
    expect((await request.get('/instagram/en/result-999999.png')).status()).toBe(404)
    expect((await request.get('/instagram/fr/player-saqib-rafiq.png')).status()).toBe(404)
  })
})

test('unknown routes return a localized 404 page', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist')

  expect(response?.status()).toBe(404)
  await expect(page.getByRole('link', { name: 'Back to the home page' })).toBeVisible()
  await expectNoAxeViolations(page)
})
