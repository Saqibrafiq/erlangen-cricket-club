export type StatTileProps = {
  label: string
  value: string
  /** Read instead of the value when the value alone would not say it (e.g. "140*"). */
  srValue?: string
}

/** One figure in a description list: the value large on top, its label below. */
export function StatTile({ label, value, srValue }: StatTileProps) {
  return (
    // Label first in the markup (as a description list requires); the value is shown on top.
    <div className="flex flex-col gap-1 rounded-2xl bg-surface-muted p-4 sm:p-5">
      <dt className="text-sm text-text-muted">{label}</dt>
      <dd className="order-first font-display text-2xl leading-tight font-bold tabular-nums sm:text-3xl">
        {srValue ? (
          <>
            <span aria-hidden="true">{value}</span>
            <span className="sr-only">{srValue}</span>
          </>
        ) : (
          value
        )}
      </dd>
    </div>
  )
}
