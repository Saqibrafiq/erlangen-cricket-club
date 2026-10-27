'use client'

import { ImageUp } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { type DragEvent, useState } from 'react'

import { IMAGE_UPLOAD_TYPES } from '@/shared/config/image-upload'
import { cn } from '@/shared/lib/cn'
import type { FormFieldControlProps } from '@/shared/ui/form-field'

export type LogoDropZoneProps = {
  control: FormFieldControlProps
  /** The chosen file's preview or the stored logo; `null` before one is chosen. */
  previewUrl: string | null
  chooseLabel: string
  changeLabel: string
  dropLabel: string
  onChoose: (file: File) => void
}

const SWAP_S = 0.2

/**
 * The logo on the same white panel as on the sponsor card, so editors see how it will look. Click
 * (or Enter/Space on the file input) to choose, or drop a file onto it.
 */
export function LogoDropZone({
  control,
  previewUrl,
  chooseLabel,
  changeLabel,
  dropLabel,
  onChoose,
}: LogoDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) {
      onChoose(file)
    }
  }

  return (
    // Dropping is a shortcut; the file input (via its label) stays the accessible way to choose.
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
        accept={IMAGE_UPLOAD_TYPES.join(',')}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onChoose(file)
        }}
        className="peer sr-only"
      />
      <label
        htmlFor={control.id}
        className={cn(
          'group relative flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed bg-surface-logo p-6 text-media-overlay transition-colors duration-150',
          'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus-ring',
          'peer-aria-invalid:border-status-danger-text',
          isDragging ? 'border-brand-primary' : 'border-border-default hover:border-brand-primary',
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {previewUrl && (
            <motion.img
              key={previewUrl}
              // A local preview (blob: URL) or the stored logo; not worth next/image here.
              src={previewUrl}
              alt=""
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: SWAP_S }}
              className="max-h-24 w-auto object-contain"
            />
          )}
        </AnimatePresence>
        <span className="inline-flex items-center gap-2 rounded-full bg-media-overlay/5 px-3 py-1.5 text-sm font-medium">
          <ImageUp aria-hidden="true" className="size-4" />
          {previewUrl ? changeLabel : chooseLabel}
        </span>
        {!previewUrl && <span className="text-sm opacity-70">{dropLabel}</span>}
      </label>
    </div>
  )
}
