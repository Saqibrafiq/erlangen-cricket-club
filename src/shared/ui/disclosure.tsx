'use client'

import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { type ReactNode, useId, useState } from 'react'

import { cn } from '@/shared/lib/cn'

import { COLLAPSE_VARIANTS, DROPDOWN_ITEM_VARIANTS, SPRING } from './motion-presets'

export type DisclosureChevronProps = {
  isOpen: boolean
  className?: string
}

/** The chevron of every dropdown and expander: it turns over as the content opens. */
export function DisclosureChevron({ isOpen, className }: DisclosureChevronProps) {
  return (
    <motion.span
      aria-hidden="true"
      animate={{ rotate: isOpen ? 180 : 0 }}
      transition={SPRING}
      className={cn('inline-flex shrink-0 text-text-muted', className)}
    >
      <ChevronDown className="size-[1em]" />
    </motion.span>
  )
}

export type CollapseProps = {
  isOpen: boolean
  id?: string
  className?: string
  /** Wrap items in `CollapseItem` so they follow one after another. */
  children: ReactNode
}

/** Content that opens and closes with the site's height animation. */
export function Collapse({ isOpen, id, className, children }: CollapseProps) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          id={id}
          variants={COLLAPSE_VARIANTS}
          initial="closed"
          animate="open"
          exit="exit"
          className="overflow-hidden"
        >
          <div className={className}>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** An item inside a `Collapse` (or a dropdown panel) that follows the ones before it. */
export function CollapseItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={DROPDOWN_ITEM_VARIANTS} className={className}>
      {children}
    </motion.div>
  )
}

export type DisclosureProps = {
  /** The always-visible button text. */
  summary: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  className?: string
  buttonClassName?: string
  panelClassName?: string
}

/**
 * A button that shows and hides content below it (instead of a native `<details>`, which cannot
 * animate): the chevron turns and the content grows into place.
 */
export function Disclosure({
  summary,
  children,
  defaultOpen = false,
  className,
  buttonClassName,
  panelClassName,
}: DisclosureProps) {
  const id = useId()
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const panelId = `${id}-panel`

  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        onClick={() => {
          setIsOpen((open) => !open)
        }}
        className={cn(
          'flex min-h-11 w-full items-center justify-between gap-3 rounded-lg text-left font-medium',
          buttonClassName,
        )}
      >
        <span>{summary}</span>
        <DisclosureChevron isOpen={isOpen} />
      </button>
      <Collapse isOpen={isOpen} id={panelId} className={panelClassName}>
        <CollapseItem>{children}</CollapseItem>
      </Collapse>
    </div>
  )
}
