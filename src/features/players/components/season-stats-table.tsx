'use client'

import { AnimatePresence, motion, type Variants } from 'motion/react'
import { Fragment, type ReactNode, useId, useState } from 'react'

import { cn } from '@/shared/lib/cn'
import { DisclosureChevron } from '@/shared/ui/disclosure'
import { COLLAPSE_EXIT_TRANSITION, ROW_STAGGER_S, SPRING } from '@/shared/ui/motion-presets'

export type StatsColumn = {
  key: string
  /** The header as shown, e.g. "SR". */
  short: string
  /** What the header means, read by screen readers, e.g. "Strike rate". */
  long: string
}

export type StatsCell = {
  text: string
  /** Read instead of the text when the text alone would not say it, e.g. "140 not out" for "140*". */
  label?: string
}

/** Rows that open under a row, e.g. the teams a season was played for. */
export type StatsDetails = {
  /** Read after the row's heading on its toggle, e.g. "teams". */
  toggleLabel: string
  rows: readonly StatsRow[]
  /** A line under the rows, e.g. what the figures do and do not cover. */
  note?: string
}

export type StatsRow = {
  key: string
  /** The row's header cell, e.g. the season. */
  heading: string
  /** Read instead of the heading when it is abbreviated, e.g. "Erlangen Cricket Club I". */
  headingLabel?: string
  cells: readonly StatsCell[]
  /** Controls for editors, at the end of the row. */
  actions?: ReactNode
  details?: StatsDetails
}

export type SeasonStatsTableProps = {
  /** The id(s) of the heading(s) that name the table's scroll region, space-separated. */
  labelledBy: string
  /** Header of the first column, e.g. "Season". */
  rowHeading: StatsColumn
  columns: readonly StatsColumn[]
  rows: readonly StatsRow[]
  /** A totals row under the seasons, e.g. the career. */
  footer?: StatsRow
  /** Header of the actions column; the column shows only when a row has actions. */
  actionsLabel?: string
}

/**
 * A table row cannot animate its own height, so each cell's content grows from nothing to its
 * full height (and back): the rows below, and the page, move down smoothly instead of jumping.
 * Rows follow one after another (`custom` is the row's index).
 */
const GROW_VARIANTS: Variants = {
  closed: { height: 0, opacity: 0 },
  open: (index: number) => ({
    height: 'auto',
    opacity: 1,
    transition: { ...SPRING, delay: index * ROW_STAGGER_S },
  }),
  // Collapsing a height reads smoothest eased at both ends (an ease-in ends with a big step).
  exit: { height: 0, opacity: 0, transition: COLLAPSE_EXIT_TRANSITION },
}

type GrowProps = { index: number; className?: string; children: ReactNode }

/** A detail cell's content, growing into place with its row (see GROW_VARIANTS). */
function Grow({ index, className, children }: GrowProps) {
  return (
    <motion.div custom={index} variants={GROW_VARIANTS} className="overflow-hidden">
      <div className={className}>{children}</div>
    </motion.div>
  )
}

const STICKY_FIRST = 'sticky left-0 z-10 text-left'

function Abbreviated({ short, long }: Pick<StatsColumn, 'short' | 'long'>): ReactNode {
  if (short === long) return short
  return (
    <>
      <span aria-hidden="true">{short}</span>
      <span className="sr-only">{long}</span>
    </>
  )
}

function Labelled({ text, label }: { text: string; label?: string }): ReactNode {
  if (!label) return text
  return (
    <>
      <span aria-hidden="true">{text}</span>
      <span className="sr-only">{label}</span>
    </>
  )
}

function Cells({
  cells,
  columns,
}: {
  cells: readonly StatsCell[]
  columns: readonly StatsColumn[]
}) {
  return cells.map((cell, index) => (
    <td key={columns[index]?.key ?? index} className="px-3 py-2.5 text-right whitespace-nowrap">
      <Labelled text={cell.text} label={cell.label} />
    </td>
  ))
}

type SeasonRowProps = {
  row: StatsRow
  columns: readonly StatsColumn[]
  hasActions: boolean
}

/** A season row; with details, its heading is a toggle that opens the detail rows beneath it. */
function SeasonRow({ row, columns, hasActions }: SeasonRowProps) {
  const id = useId()
  const [isOpen, setIsOpen] = useState(false)
  const { details } = row
  const columnCount = columns.length + 1 + (hasActions ? 1 : 0)
  const detailIds = details?.rows.map((_, index) => `${id}-${String(index)}`) ?? []

  return (
    <>
      <tr className={cn(isOpen && 'bg-surface-muted/60')}>
        <th
          scope="row"
          className={cn(
            STICKY_FIRST,
            'px-3 font-semibold',
            isOpen ? 'bg-surface-muted' : 'bg-surface-default',
            details ? 'py-0' : 'py-2.5',
          )}
        >
          {details ? (
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={isOpen ? detailIds.join(' ') : undefined}
              onClick={() => {
                setIsOpen((open) => !open)
              }}
              className="-mx-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 font-semibold whitespace-nowrap transition-colors duration-150 hover:bg-surface-muted"
            >
              {row.heading}
              <span className="sr-only">: {details.toggleLabel}</span>
              <DisclosureChevron isOpen={isOpen} />
            </button>
          ) : (
            <Labelled text={row.heading} label={row.headingLabel} />
          )}
        </th>
        <Cells cells={row.cells} columns={columns} />
        {hasActions && <td className="px-3 py-1 text-right">{row.actions}</td>}
      </tr>
      <AnimatePresence initial={false}>
        {isOpen &&
          details?.rows.map((detail, index) => (
            <motion.tr
              key={detail.key}
              id={detailIds[index]}
              initial="closed"
              animate="open"
              exit="exit"
              className="bg-surface-muted/60 text-text-muted"
            >
              <th scope="row" className={cn(STICKY_FIRST, 'bg-surface-muted p-0 font-medium')}>
                <Grow index={index} className="py-2 pr-3 pl-8 whitespace-nowrap">
                  <Labelled text={detail.heading} label={detail.headingLabel} />
                </Grow>
              </th>
              {detail.cells.map((cell, cellIndex) => (
                <td key={columns[cellIndex]?.key ?? cellIndex} className="p-0 text-right">
                  <Grow index={index} className="px-3 py-2 whitespace-nowrap">
                    <Labelled text={cell.text} label={cell.label} />
                  </Grow>
                </td>
              ))}
              {hasActions && (
                <td className="p-0 text-right">
                  <Grow index={index} className="px-3 py-1">
                    {detail.actions}
                  </Grow>
                </td>
              )}
            </motion.tr>
          ))}
        {isOpen && details?.note && (
          <motion.tr
            key="note"
            initial="closed"
            animate="open"
            exit="exit"
            className="bg-surface-muted/60"
          >
            <td colSpan={columnCount} className="p-0">
              <Grow index={details.rows.length} className="py-2 pr-3 pl-8 text-xs text-text-muted">
                {details.note}
              </Grow>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  )
}

/**
 * A season-by-season stats table: right-aligned tabular figures, the first column fixed while the
 * rest scrolls sideways inside its own (keyboard-scrollable) region on small screens. A season
 * with details opens them as rows beneath it.
 */
export function SeasonStatsTable({
  labelledBy,
  rowHeading,
  columns,
  rows,
  footer,
  actionsLabel,
}: SeasonStatsTableProps) {
  const hasActions = rows.some((row) => row.actions !== undefined)

  return (
    // Scrolls sideways inside its own region on narrow screens; the page never does.
    <div
      role="region"
      aria-labelledby={labelledBy}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- scrollable region must be keyboard-reachable (WCAG 2.1.1)
      tabIndex={0}
      className="overflow-x-auto rounded-2xl border border-border-default"
    >
      <table className="w-full text-sm tabular-nums">
        <thead className="bg-surface-muted text-xs font-semibold tracking-wide text-text-muted uppercase">
          <tr>
            <th scope="col" className={cn(STICKY_FIRST, 'bg-surface-muted px-3 py-2.5')}>
              <Abbreviated {...rowHeading} />
            </th>
            {columns.map((column) => (
              <th key={column.key} scope="col" className="px-3 py-2.5 text-right whitespace-nowrap">
                <Abbreviated {...column} />
              </th>
            ))}
            {hasActions && (
              <th scope="col" className="px-3 py-2.5 text-right">
                <span className="sr-only">{actionsLabel}</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-default">
          {rows.map((row) => (
            <Fragment key={row.key}>
              <SeasonRow row={row} columns={columns} hasActions={hasActions} />
            </Fragment>
          ))}
        </tbody>
        {footer && (
          <tfoot className="border-t-2 border-border-default font-bold">
            <tr>
              <th scope="row" className={cn(STICKY_FIRST, 'bg-surface-default px-3 py-2.5')}>
                {footer.heading}
              </th>
              <Cells cells={footer.cells} columns={columns} />
              {hasActions && <td />}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
