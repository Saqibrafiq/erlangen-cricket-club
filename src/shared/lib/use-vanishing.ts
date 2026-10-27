import { useCallback, useRef, useState } from 'react'

/** Longer than the effect itself: resolves even if the item was never on screen (e.g. filtered out). */
export const VANISH_TIMEOUT_MS = 2500

/**
 * Coordinates the delete effect in an editable list: `vanish(id)` starts the item's `Vanish`
 * animation and resolves once it has played (`finish`), so the list only refreshes afterwards
 * and the item doesn't just blink out of existence.
 */
export function useVanishing() {
  const [vanishingId, setVanishingId] = useState<number | null>(null)
  const resolveRef = useRef<(() => void) | null>(null)

  const vanish = useCallback(
    (id: number) =>
      new Promise<void>((resolve) => {
        resolveRef.current = resolve
        setVanishingId(id)
        setTimeout(resolve, VANISH_TIMEOUT_MS)
      }),
    [],
  )

  const finish = useCallback(() => {
    resolveRef.current?.()
    resolveRef.current = null
  }, [])

  return { vanishingId, vanish, finish }
}
