'use client'

import { type DragEvent, type ReactNode, useState } from 'react'

import { cn } from '@/shared/lib/cn'

import type { FormFieldControlProps } from './form-field'

export type FileDropZoneProps = {
  /** From `FormField`, so the hidden file input is labelled and described. */
  control: FormFieldControlProps
  /** File types the picker offers, e.g. `".csv,text/csv"`. */
  accept: string
  onFile: (file: File) => void
  className?: string
  /** What the zone shows: a prompt, a preview of the chosen file. */
  children: ReactNode
}

/**
 * A large target to choose a file by click, keyboard (Enter/Space on the hidden input) or by
 * dropping one onto it. Dropping is a shortcut; the native file input stays the accessible way.
 */
export function FileDropZone({ control, accept, onFile, className, children }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) {
      onFile(file)
    }
  }

  return (
    <div
      role="presentation"
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => {
        setIsDragging(false)
      }}
      onDrop={handleDrop}
    >
      <input
        {...control}
        type="file"
        accept={accept}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onFile(file)
          // Choosing the same file again (after fixing it) must fire onChange again.
          event.target.value = ''
        }}
        className="peer sr-only"
      />
      <label
        htmlFor={control.id}
        className={cn(
          'relative flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed p-6 text-center transition-colors duration-150',
          'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus-ring',
          'peer-aria-invalid:border-status-danger-text',
          isDragging ? 'border-brand-primary' : 'border-border-default hover:border-brand-primary',
          className,
        )}
      >
        {children}
      </label>
    </div>
  )
}
