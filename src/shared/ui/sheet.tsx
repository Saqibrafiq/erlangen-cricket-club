'use client'

import { X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

export type SheetProps = {
  open: boolean
  onOpenChange: (isOpen: boolean) => void
  title: string
  /** One line under the title, read out with it. */
  description?: string
  /** Accessible name of the close button, e.g. "Close". */
  closeLabel: string
  /** `wide` for writing, e.g. a news article; `default` for short forms. */
  size?: 'default' | 'wide'
  children: ReactNode
}

/**
 * A panel that slides in from the right (full screen on phones) for forms such as editing a
 * player. Radix Dialog traps focus, closes on Escape or a tap outside, and returns focus to
 * whatever opened it.
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  closeLabel,
  size = 'default',
  children,
}: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-media-overlay/60 backdrop-blur-sm motion-safe:animate-fade-in" />
        <Dialog.Content
          {...(description ? {} : { 'aria-describedby': undefined })}
          className={cn(
            'fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-surface-default shadow-xl motion-safe:animate-slide-in-right sm:border-l sm:border-border-default',
            size === 'wide' ? 'sm:max-w-3xl' : 'sm:max-w-lg',
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border-default py-3 pr-3 pl-6">
            <div className="py-1.5">
              <Dialog.Title className="font-display text-2xl leading-tight font-bold tracking-tight uppercase">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-0.5 text-sm text-text-muted">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={closeLabel}
                className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md transition-colors duration-150 hover:bg-surface-muted"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
