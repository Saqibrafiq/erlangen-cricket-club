'use client'

import { ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

import { usePathname } from '@/i18n/navigation'
import { cn } from '@/shared/lib/cn'

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

export type NavMenuProps = {
  label: string
  /** Section root; the button is marked current on this path and below it. */
  href: string
  groups: readonly NavigationGroup[]
}

/**
 * Disclosure-pattern dropdown (button + list of links, not an ARIA menu): opens on click or tap,
 * closes on Escape, outside click, focus moving outside, or following a link.
 */
export function NavMenu({ label, href, groups }: NavMenuProps) {
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
    <div ref={containerRef} className="sm:relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => {
          setIsOpen((open) => !open)
        }}
        className={cn(
          'inline-flex min-h-11 items-center gap-1 rounded-md px-3 text-sm font-medium text-text-muted transition-colors duration-150 hover:bg-surface-muted hover:text-text-default',
          isInSection &&
            'text-text-default underline decoration-brand-primary decoration-2 underline-offset-8',
        )}
      >
        {label}
        <ChevronDown
          aria-hidden="true"
          className={cn('size-4 transition-transform duration-150', isOpen && 'rotate-180')}
        />
      </button>

      <div
        id={panelId}
        hidden={!isOpen}
        // Phones: anchored to the full-width nav row (the nearest positioned ancestor), so it spans
        // the screen instead of overflowing it. From sm up: a fixed-width panel under the button,
        // left-aligned while the nav starts the row, right-aligned once it sits at the right (xl).
        className="absolute inset-x-0 z-40 mt-1 rounded-lg border border-border-default bg-surface-default p-2 shadow-lg sm:right-auto sm:w-72 xl:right-0 xl:left-auto"
      >
        {groups.map((group, index) => {
          const groupId = `${panelId}-group-${index}`
          return (
            <div
              key={group.label ?? index}
              className={cn(index > 0 && 'mt-1 border-t border-border-default pt-1')}
            >
              {group.label && (
                <p id={groupId} className="px-3 pt-2 pb-1 text-xs font-semibold text-text-muted">
                  {group.label}
                </p>
              )}
              <ul aria-labelledby={group.label ? groupId : undefined}>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <NavLink
                      href={link.href}
                      className="w-full"
                      onClick={() => {
                        setIsOpen(false)
                      }}
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
