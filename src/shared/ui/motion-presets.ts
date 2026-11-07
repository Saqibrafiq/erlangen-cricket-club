import type { Transition, Variants } from 'motion/react'

/**
 * The site's one set of movement for dropdowns, menus and expanders, so every one of them opens
 * and closes the same way. Use these instead of local variants. Under reduced motion,
 * MotionProvider turns all of them into instant changes.
 */

/** The spring for things that open, slide or rotate. */
export const SPRING: Transition = { type: 'spring', stiffness: 460, damping: 34 }

/** Closing is quicker than opening, and does not bounce. */
export const EXIT_TRANSITION: Transition = { duration: 0.14, ease: 'easeIn' }

/** Collapsing a height: eased at both ends, so content below glides back up without a final jump. */
export const COLLAPSE_EXIT_TRANSITION: Transition = { duration: 0.24, ease: 'easeInOut' }

/** A dropdown panel springs open and its items follow one after another. */
export const DROPDOWN_PANEL_VARIANTS: Variants = {
  closed: { opacity: 0, scale: 0.96, y: -6 },
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { ...SPRING, staggerChildren: 0.035, delayChildren: 0.02 },
  },
  exit: { opacity: 0, scale: 0.97, y: -4, transition: EXIT_TRANSITION },
}

/** An item in a dropdown, a menu or an opened section. */
export const DROPDOWN_ITEM_VARIANTS: Variants = {
  closed: { opacity: 0, y: -6 },
  open: { opacity: 1, y: 0, transition: SPRING },
}

/** An opening section: its height grows and its items follow one after another. */
export const COLLAPSE_VARIANTS: Variants = {
  closed: { height: 0, opacity: 0 },
  open: {
    height: 'auto',
    opacity: 1,
    transition: { ...SPRING, staggerChildren: 0.04, delayChildren: 0.03 },
  },
  exit: { height: 0, opacity: 0, transition: COLLAPSE_EXIT_TRANSITION },
}

/** How far each next table row waits when rows open one after another (seconds). */
export const ROW_STAGGER_S = 0.04

/** The dimmed backdrop behind a sheet or dialog. */
export const OVERLAY_VARIANTS: Variants = {
  closed: { opacity: 0 },
  open: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: EXIT_TRANSITION },
}

/** A side panel slides in from the right on the spring and slides back out. */
export const SHEET_VARIANTS: Variants = {
  closed: { x: '100%' },
  open: { x: 0, transition: SPRING },
  exit: { x: '100%', transition: { duration: 0.2, ease: 'easeIn' } },
}

/** A dialog rises and grows into place. */
export const DIALOG_VARIANTS: Variants = {
  closed: { opacity: 0, scale: 0.94, y: 12 },
  open: { opacity: 1, scale: 1, y: 0, transition: SPRING },
  exit: { opacity: 0, scale: 0.96, y: 8, transition: EXIT_TRANSITION },
}
