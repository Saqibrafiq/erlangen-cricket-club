import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { StorybookConfig } from '@storybook/nextjs-vite'

const dirname = path.dirname(fileURLToPath(import.meta.url))

type Alias = { find: string | RegExp; replacement: string }

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  viteFinal(viteConfig) {
    // Stories that compose several features (e.g. the home page) import their public APIs, which
    // also export server queries and actions; those must not reach the browser bundle.
    // Vite accepts aliases as an array or a record; normalise to an array to prepend ours.
    const existing: unknown = viteConfig.resolve?.alias ?? []
    const existingAliases: Alias[] = Array.isArray(existing)
      ? (existing as Alias[])
      : Object.entries(existing as Record<string, string>).map(([find, replacement]) => ({
          find,
          replacement,
        }))

    return {
      ...viteConfig,
      resolve: {
        ...viteConfig.resolve,
        alias: [
          {
            find: /^\.\/server\/(queries|actions)$/,
            replacement: path.join(dirname, 'server-stub.ts'),
          },
          ...existingAliases,
        ],
      },
    }
  },
}

export default config
