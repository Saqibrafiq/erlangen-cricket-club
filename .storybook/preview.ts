import type { Preview } from '@storybook/nextjs-vite'

import '../src/app/(frontend)/globals.css'

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    // Accessibility violations fail story tests, mirroring the axe gate in Playwright.
    a11y: { test: 'error' },
  },
}

export default preview
