import { expect, type Page, test } from '@playwright/test'

import { expectNoAxeViolations } from './a11y'

// The seed creates this account only when both variables are set (CI does; see seed-e2e-user.ts).
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD
// Signing in loads the site in full; under `pnpm dev` the first load compiles for a while.
const PAGE_LOAD_TIMEOUT_MS = 60_000
const TITLE = 'E2E Season Opener'

async function signIn(page: Page): Promise<void> {
  await page.goto('/login')
  await page.getByLabel('Email').fill(ADMIN_EMAIL ?? '')
  await page.getByLabel('Password', { exact: true }).fill(ADMIN_PASSWORD ?? '')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByText('Edit mode: you can add, edit and delete content')).toBeVisible({
    timeout: PAGE_LOAD_TIMEOUT_MS,
  })
}

test.describe('editing news on the website', () => {
  // One test account: sign-ins one after another (see login.spec.ts).
  test.describe.configure({ mode: 'serial' })
  test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD.')

  test('visitors see no editing controls', async ({ page }) => {
    await page.goto('/news')

    await expect(page.getByRole('button', { name: 'Write article' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /^Edit “/ })).toHaveCount(0)
  })

  test('an editor writes, publishes, edits and deletes an article', async ({ page }) => {
    test.setTimeout(4 * PAGE_LOAD_TIMEOUT_MS)
    await signIn(page)
    await page.goto('/news')

    // Write: a heading, bold text and a list in the visual editor.
    await page.getByRole('button', { name: 'Write article' }).click()
    const sheet = page.getByRole('dialog', { name: 'Write article' })
    await sheet.getByLabel('Title').fill(TITLE)
    await sheet.getByLabel('Summary').fill('Our first match of the season is on Saturday.')
    await sheet.getByRole('textbox', { name: 'Text' }).click()
    await page.keyboard.type('Match day')
    await sheet.getByRole('combobox', { name: 'Text style' }).selectOption('h2')
    await page.keyboard.press('End')
    await page.keyboard.press('Enter')
    await page.keyboard.type('We play at ')
    await page.keyboard.press('Control+b')
    await page.keyboard.type('home')
    await page.keyboard.press('Control+b')
    await page.keyboard.press('Enter')
    await sheet.getByRole('button', { name: 'Bulleted list' }).click()
    await page.keyboard.type('Bring your kit')
    await expectNoAxeViolations(page)
    await sheet.getByRole('button', { name: 'Publish' }).click()

    await expect(
      page.getByRole('status').filter({ hasText: `“${TITLE}” is published.` }),
    ).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT_MS })

    // The article page shows the formatting.
    await page.getByRole('link', { name: TITLE }).click()
    const article = page.getByRole('article')
    await expect(article.getByRole('heading', { level: 1, name: TITLE })).toBeVisible({
      timeout: PAGE_LOAD_TIMEOUT_MS,
    })
    await expect(article.getByRole('heading', { level: 2, name: 'Match day' })).toBeVisible()
    await expect(article.locator('strong', { hasText: 'home' })).toBeVisible()
    await expect(article.getByRole('listitem').filter({ hasText: 'Bring your kit' })).toBeVisible()

    // Edit the title.
    await page.getByRole('button', { name: `Edit “${TITLE}”` }).click()
    const edit = page.getByRole('dialog', { name: 'Edit article' })
    await expect(edit.getByLabel('Title')).toHaveValue(TITLE)
    await edit.getByLabel('Title').fill(`${TITLE} Updated`)
    await edit.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(page.getByRole('heading', { level: 1, name: `${TITLE} Updated` })).toBeVisible({
      timeout: PAGE_LOAD_TIMEOUT_MS,
    })

    // Delete, after confirming: back to the list, without the article.
    await page.getByRole('button', { name: `Delete “${TITLE} Updated”` }).click()
    await page
      .getByRole('alertdialog', { name: `Delete “${TITLE} Updated”?` })
      .getByRole('button', { name: 'Delete' })
      .click()
    await expect(page).toHaveURL(/\/news$/, { timeout: PAGE_LOAD_TIMEOUT_MS })
    await expect(page.getByRole('link', { name: `${TITLE} Updated` })).toHaveCount(0)
  })

  test('a draft stays off the website until published', async ({ page }) => {
    test.setTimeout(3 * PAGE_LOAD_TIMEOUT_MS)
    await signIn(page)
    await page.goto('/news')

    await page.getByRole('button', { name: 'Write article' }).click()
    const sheet = page.getByRole('dialog', { name: 'Write article' })
    await sheet.getByLabel('Title').fill(`${TITLE} Draft`)
    await sheet.getByLabel('Summary').fill('Not ready yet.')
    await sheet.getByRole('textbox', { name: 'Text' }).click()
    await page.keyboard.type('Coming soon.')
    await sheet.getByRole('button', { name: 'Save as draft' }).click()

    await expect(page.getByRole('status').filter({ hasText: 'saved as a draft' })).toBeVisible({
      timeout: PAGE_LOAD_TIMEOUT_MS,
    })
    await expect(page.getByRole('link', { name: `${TITLE} Draft` })).toHaveCount(0)

    // Editors find it under drafts.
    await page.getByText(/\d+ drafts?/).click()
    await page.getByRole('button', { name: new RegExp(`Edit “${TITLE} Draft”`) }).click()
    const edit = page.getByRole('dialog', { name: 'Edit article' })
    await expect(edit.getByLabel('Title')).toHaveValue(`${TITLE} Draft`)

    // Publishing puts it on the website; deleting it afterwards keeps reruns clean.
    await edit.getByRole('button', { name: 'Publish' }).click()
    await expect(page.getByRole('link', { name: `${TITLE} Draft` })).toBeVisible({
      timeout: PAGE_LOAD_TIMEOUT_MS,
    })
    await page.getByRole('button', { name: `Delete “${TITLE} Draft”` }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click()
    await expect(page.getByRole('link', { name: `${TITLE} Draft` })).toHaveCount(0, {
      timeout: PAGE_LOAD_TIMEOUT_MS,
    })
  })
})
