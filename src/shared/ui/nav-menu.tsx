'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useId, useRef, useState } from 'react'

import { usePathname } from '@/i18n/navigation'
import { cn } from '@/shared/lib/cn'

import { DisclosureChevron } from './disclosure'
import { DROPDOWN_ITEM_VARIANTS, DROPDOWN_PANEL_VARIANTS } from './motion-presets'

import { NavLink } from './nav-link'

export type NavigationLink = {
  href: string
  label: string
}

export type NavigationGroup = {
  /** Optional heading for the group, e.g. a team name. */
  label?: string
  links: readonly NavigationLink[]
}

export type SiteNavigationItem = NavigationLink & {
  /** When present, the item opens a dropdown with these groups instead of linking directly. */
  groups?: readonly NavigationGroup[]
}

export type NavMenuProps = {
  label: string
  /** Section root; the button is marked current on this path and below it. */
  href: string
  groups: readonly NavigationGroup[]
  /** Underline the button on its section; off where something else marks it. */
  showCurrent?: boolean
}

/**
 * Disclosure-pattern dropdown (button + list of links, not an ARIA menu): opens on click or tap,
 * closes on Escape, outside click, focus moving outside, or following a link.
 */
export function NavMenu({ label, href, groups, showCurrent = true }: NavMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const panelId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const isInSection = pathname === href || pathname.startsWith(`${href}/`)

  useEffect(() => {
    if (!isOpen) return

    // Pointer or keyboard focus landing outside the menu closes it.
    function closeIfOutside(event: Event) {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', closeIfOutside)
    document.addEventListener('focusin', closeIfOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', closeIfOutside)
      document.removeEventListener('focusin', closeIfOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={isOpen}
        // Only while the panel exists, so the reference never points at nothing.
        aria-controls={isOpen ? panelId : undefined}
        onClick={() => {
          setIsOpen((open) => !open)
        }}
        className={cn(
          // Tighter between xl and 2xl so nine items with German labels fit one row at 1280 px.
          'inline-flex min-h-11 items-center gap-1 rounded-md px-1.5 text-sm font-medium whitespace-nowrap text-text-muted transition-colors duration-150 hover:text-text-default 2xl:px-3',
          showCurrent && 'hover:bg-surface-muted',
          isInSection && 'text-text-default',
          isInSection &&
            showCurrent &&
            'underline decoration-brand-primary decoration-2 underline-offset-8',
        )}
      >
        {label}
        <DisclosureChevron isOpen={isOpen} className="text-base text-current" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={panelId}
            variants={DROPDOWN_PANEL_VARIANTS}
            initial="closed"
            animate="open"
            exit="exit"
            style={{ transformOrigin: 'top right' }}
            // Desktop only (phones use the menu panel): right-aligned under the button.
            className="absolute right-0 z-40 mt-2 w-72 rounded-2xl border border-border-default bg-surface-default/95 p-2 shadow-xl backdrop-blur-xl"
          >
            {groups.map((group, index) => {
              const groupId = `${panelId}-group-${index}`
              return (
                <div
                  key={group.label ?? index}
                  className={cn(index > 0 && 'mt-1 border-t border-border-default pt-1')}
                >
                  {group.label && (
                    <p
                      id={groupId}
                      className="px-3 pt-2 pb-1 text-xs font-semibold text-text-muted"
                    >
                      {group.label}
                    </p>
                  )}
                  <ul aria-labelledby={group.label ? groupId : undefined}>
                    {group.links.map((link) => (
                      <motion.li key={link.href} variants={DROPDOWN_ITEM_VARIANTS}>
                        <NavLink
                          href={link.href}
                          className="w-full"
                          onClick={() => {
                            setIsOpen(false)
                          }}
                        >
                          {link.label}
                        </NavLink>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
