import { EyeOff, type LucideIcon, PencilLine, Plus } from 'lucide-react'

import { Button } from './button'

export type EditorToolbarItem = {
  id: number
  label: string
}

export type EditorToolbarProps = {
  addLabel: string
  onAdd: () => void
  /** The main button's icon; a plus by default, e.g. an upload icon for imports. */
  addIcon?: LucideIcon
  /** Content visitors don't see (hidden players, draft articles), so editors can still reach it. */
  hidden?: {
    summary: string
    hint: string
    items: readonly EditorToolbarItem[]
    /** Accessible name of an item's edit button, e.g. "Edit Arun". */
    editLabel: (item: EditorToolbarItem) => string
    onEdit: (id: number) => void
  }
  /** Shown when the hidden content could not be loaded. */
  error?: string
}

/**
 * Editors' controls above a list: the add button in the right corner, and a native disclosure on
 * the left with the items visitors don't see, out of the way until needed.
 */
export function EditorToolbar({
  addLabel,
  onAdd,
  addIcon: AddIcon = Plus,
  hidden,
  error,
}: EditorToolbarProps) {
  return (
    // No card around it: one row, hidden items on the left, the add button in the right corner.
    <div className="flex flex-wrap items-start justify-end gap-3">
      {error && <p className="mr-auto text-sm text-status-danger-text">{error}</p>}
      {hidden && hidden.items.length > 0 && (
        <details className="mr-auto sm:max-w-sm">
          <summary className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md px-2 font-medium">
            <EyeOff aria-hidden="true" className="size-4" />
            {hidden.summary}
          </summary>
          <p className="mt-1 px-2 text-sm text-text-muted">{hidden.hint}</p>
          <ul className="mt-2">
            {hidden.items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    hidden.onEdit(item.id)
                  }}
                  className="inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-md px-2 text-left hover:bg-surface-muted"
                >
                  <span>{item.label}</span>
                  <PencilLine aria-hidden="true" className="size-4 shrink-0" />
                  <span className="sr-only">{hidden.editLabel(item)}</span>
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
      <Button onClick={onAdd}>
        <AddIcon aria-hidden="true" />
        {addLabel}
      </Button>
    </div>
  )
}
