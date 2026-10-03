import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const FULL_COVERAGE = { branches: 100, functions: 100, lines: 100, statements: 100 }

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.stories.tsx',
        'src/**/*.d.ts',
        'src/payload-types.ts',
        'src/app/(payload)/**',
      ],
      reporter: ['text', 'lcov'],
      thresholds: {
        // Stats math is where bugs hurt credibility (CLAUDE.md §11).
        'src/domain/**': FULL_COVERAGE,
      },
    },
  },
})
