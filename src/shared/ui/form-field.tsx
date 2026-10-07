import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

/** Shared look of inputs, selects and textareas; invalid controls get a danger border. */
export const formControlClassName = cn(
  'block w-full rounded-lg border border-border-default bg-surface-default px-3 py-2.5 text-base text-text-default',
  'transition-colors duration-150 placeholder:text-text-muted hover:border-text-muted',
  'aria-invalid:border-status-danger-text',
)

export type FormFieldControlProps = {
  id: string
  'aria-invalid': true | undefined
  'aria-describedby': string | undefined
}

export type FormFieldProps = {
  id: string
  label: string
  /** Marks the label as optional, e.g. "(optional)". */
  optionalLabel?: string
  hint?: string
  error?: string
  /** Renders the control, wired to the label, hint and error for assistive technology. */
  children: (control: FormFieldControlProps) => ReactNode
}

/** A labelled form control with an optional hint and an error message announced with it. */
export function FormField({ id, label, optionalLabel, hint, error, children }: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {optionalLabel && (
          <>
            {' '}
            <span className="font-normal text-text-muted">{optionalLabel}</span>
          </>
        )}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-text-muted">
          {hint}
        </p>
      )}
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {error && (
        <p id={errorId} className="text-sm font-medium text-status-danger-text">
          {error}
        </p>
      )}
    </div>
  )
}
