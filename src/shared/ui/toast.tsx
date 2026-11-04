'use client'

import { CircleCheck, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

export type ToastItem = {
  id: number
  message: string
}

/** Long enough to read a short sentence; the toast can also be closed right away. */
export const TOAST_DURATION_MS = 5000
/** Survives the full page reload after signing out, so the message still appears. */
const PENDING_KEY = 'ecc-toast'
/**
 * Toasts travel as a window event, not through a shared module variable: client components in
 * different chunks of a production build can get their own copy of this module, and a toast
 * added in one copy would never reach the Toaster rendered by another.
 */
const TOAST_EVENT = 'ecc:toast'

/** Shows a short confirmation, e.g. "Profile saved." */
export function toast(message: string) {
  window.dispatchEvent(new CustomEvent<string>(TOAST_EVENT, { detail: message }))
}

/** Shows `message` after the next page load (e.g. "You're signed out" across a reload). */
export function toastAfterReload(message: string) {
  try {
    sessionStorage.setItem(PENDING_KEY, message)
  } catch {
    // Storage blocked: the page still reloads, just without the message.
  }
}

function takePendingToast(): string | null {
  try {
    const message = sessionStorage.getItem(PENDING_KEY)
    sessionStorage.removeItem(PENDING_KEY)
    return message
  } catch {
    return null
  }
}

export type ToasterProps = {
  /** Accessible name of each toast's close button, e.g. "Close". */
  closeLabel: string
  /** How long a toast stays, in milliseconds. */
  duration?: number
}

/**
 * Where toasts appear: bottom centre on phones, bottom right from sm. A polite live region, so
 * screen readers announce each message without interrupting.
 */
export function Toaster({ closeLabel, duration = TOAST_DURATION_MS }: ToasterProps) {
  const [items, setItems] = useState<readonly ToastItem[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }, [])

  const show = useCallback(
    (message: string) => {
      const id = nextId.current++
      setItems((current) => [...current, { id, message }])
      setTimeout(() => {
        dismiss(id)
      }, duration)
    },
    [dismiss, duration],
  )

  useEffect(() => {
    const onToast = (event: Event) => {
      if (event instanceof CustomEvent && typeof event.detail === 'string') show(event.detail)
    }
    window.addEventListener(TOAST_EVENT, onToast)
    const pending = takePendingToast()
    if (pending) show(pending)
    return () => {
      window.removeEventListener(TOAST_EVENT, onToast)
    }
  }, [show])

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-60 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
    >
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="pointer-events-auto flex min-h-12 w-full max-w-sm items-center gap-3 rounded-xl bg-media-overlay py-2 pr-2 pl-4 text-sm font-medium text-text-on-media shadow-xl"
          >
            <CircleCheck aria-hidden="true" className="size-5 shrink-0 text-text-on-media" />
            <span className="flex-1">{item.message}</span>
            <button
              type="button"
              aria-label={closeLabel}
              onClick={() => {
                dismiss(item.id)
              }}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg opacity-70 transition-opacity duration-150 hover:opacity-100"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
