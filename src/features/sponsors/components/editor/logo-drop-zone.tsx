'use client'

import { ImageUp } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

import { IMAGE_UPLOAD_TYPES } from '@/shared/config/image-upload'
import { FileDropZone } from '@/shared/ui/file-drop-zone'
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

/** The logo on the same white panel as on the sponsor card, so editors see how it will look. */
export function LogoDropZone({
  control,
  previewUrl,
  chooseLabel,
  changeLabel,
  dropLabel,
  onChoose,
}: LogoDropZoneProps) {
  return (
    <FileDropZone
      control={control}
      accept={IMAGE_UPLOAD_TYPES.join(',')}
      onFile={onChoose}
      className="bg-surface-logo text-media-overlay"
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
    </FileDropZone>
  )
}
