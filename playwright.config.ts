import { defineConfig, devices } from '@playwright/test'

const DEFAULT_PORT = 3000
const PORT = Number(process.env.E2E_PORT ?? DEFAULT_PORT)
const BASE_URL = `http://localhost:${PORT}`
const isCi = Boolean(process.env.CI)
const EDITING_SPECS = /-editing\.spec\.ts$/

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 1 : undefined,
  reporter: isCi ? [['github'], ['html', { open: 'never' }]] : 'html',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    // Primary persona: a player checking the site on a phone at the ground.
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testIgnore: EDITING_SPECS },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, testIgnore: EDITING_SPECS },
    // Specs that change content run once the read-only ones are done, so counts stay predictable.
    {
      name: 'editing',
      use: { ...devices['Desktop Chrome'] },
      testMatch: EDITING_SPECS,
      dependencies: ['mobile', 'desktop'],
    },
  ],
  webServer: {
    command: `${isCi ? 'pnpm start' : 'pnpm dev'} --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !isCi,
    timeout: 120_000,
  },
})
