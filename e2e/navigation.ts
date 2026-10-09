import { expect, type Locator, type Page } from '@playwright/test'

// The header shows the navigation from Tailwind's xl breakpoint; below, it is in the menu panel.
const XL_BREAKPOINT = 1280

function hasHeaderNavigation(page: Page): boolean {
  return (page.viewportSize()?.width ?? 0) >= XL_BREAKPOINT
}

/** The main navigation as a visitor reaches it: in the header on desktop, in the menu on phones. */
export async function openMainNavigation(page: Page): Promise<Locator> {
  if (hasHeaderNavigation(page)) {
    return page.getByRole('banner').getByRole('navigation', { name: 'Main' })
  }

  const dialog = page.getByRole('dialog', { name: 'Menu' })
  // Retry until hydrated: before that, the menu button does nothing.
  await expect(async () => {
    await page.getByRole('button', { name: 'Menu', exact: true }).click()
    await expect(dialog).toBeVisible({ timeout: 1000 })
  }).toPass()
  return dialog.getByRole('navigation', { name: 'Main' })
}

/**
 * Opens a section with sub-pages (e.g. "Standings"): the header dropdown on desktop, the
 * expandable section of the menu on phones. Returns the navigation that contains its links.
 */
export async function openNavigationSection(page: Page, name: string): Promise<Locator> {
  const navigation = await openMainNavigation(page)

  if (hasHeaderNavigation(page)) {
    const button = navigation.getByRole('button', { name })
    await expect(async () => {
      await button.click()
      await expect(button).toHaveAttribute('aria-expanded', 'true', { timeout: 1000 })
    }).toPass()
  } else {
    await navigation.getByText(name, { exact: true }).click()
  }

  return navigation
}
