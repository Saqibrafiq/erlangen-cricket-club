import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ScrollRegion } from './scroll-region'

const COLUMNS = ['Mat', 'Inns', 'NO', 'Runs', 'HS', 'Ave', 'BF', 'SR', '100', '50', '4s', '6s']

const meta = {
  title: 'Shared/ScrollRegion',
  component: ScrollRegion,
  args: {
    label: 'Batting by season',
    className: 'max-w-sm rounded-2xl border border-border-default',
    children: (
      <table className="w-full text-sm tabular-nums">
        <thead className="bg-surface-muted">
          <tr>
            {COLUMNS.map((column) => (
              <th key={column} scope="col" className="px-3 py-2.5 text-right">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {COLUMNS.map((column, index) => (
              <td key={column} className="px-3 py-2.5 text-right">
                {index * 7}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    ),
  },
} satisfies Meta<typeof ScrollRegion>

export default meta

type Story = StoryObj<typeof meta>

/** Narrower than its table: scroll it sideways, or focus it and use the arrow keys. */
export const WideTable: Story = {}
