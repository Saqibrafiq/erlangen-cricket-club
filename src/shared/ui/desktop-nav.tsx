'use client'

import { motion } from 'motion/react'
import { useRef, useState } from 'react'

import { usePathname } from '@/i18n/navigation'

import { NavLink } from './nav-link'
import { NavMenu, type SiteNavigationItem } from './nav-menu'

const HOME_PATH = '/'
const SPRING = { type: 'spring', stiffness: 500, damping: 40 } as const
// Appearing (from no hover) the highlight fades in where it is, instead of sliding in from the last item.
const APPEAR = { x: { duration: 0 }, width: { duration: 0 }, opacity: { duration: 0.15 } } as const
const FADE_OUT = { opacity: { duration: 0.15 } } as const

export type DesktopNavProps = {
  label: string
  items: readonly SiteNavigationItem[]
}

type Highlight = {
  x: number
  width: number
  isVisible: boolean
  isAppearing: boolean
}

function isCurrent(pathname: string, href: string): boolean {
  if (href === HOME_PATH) return pathname === HOME_PATH
  return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * The navigation row from xl. One soft highlight glides to whichever item the pointer or focus
 * is on; being a single element that only moves, nothing flickers between items. A small bar in
 * the brand colour marks the current section and slides to the next one on navigation (shared
 * Motion layout id). Links keep their aria-current marks; highlight and bar are decoration.
 */
export function DesktopNav({ label, items }: DesktopNavProps) {
  const pathname = usePathname()
  const trackRef = useRef<HTMLDivElement>(null)
  const [highlight, setHighlight] = useState<Highlight | null>(null)

  const moveTo = (item: HTMLElement) => {
    const track = trackRef.current
    if (!track) return
    const x = item.getBoundingClientRect().left - track.getBoundingClientRect().left
    const width = item.offsetWidth
    setHighlight((current) => ({
      x,
      width,
      isVisible: true,
      isAppearing: !current?.isVisible,
    }))
  }

  const hide = () => {
    setHighlight((current) => current && { ...current, isVisible: false })
  }

  return (
    <nav aria-label={label} className="ml-auto hidden xl:block">
      {/* A plain wrapper takes the pointer events (the list itself is not interactive); the
          highlight moves in it. */}
      <div
        ref={trackRef}
        role="presentation"
        onMouseLeave={hide}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) hide()
        }}
        className="relative"
      >
        <motion.span
          aria-hidden="true"
          data-visible={highlight?.isVisible ?? false}
          initial={false}
          animate={{
            x: highlight?.x ?? 0,
            width: highlight?.width ?? 0,
            opacity: highlight?.isVisible ? 1 : 0,
          }}
          transition={!highlight?.isVisible ? FADE_OUT : highlight.isAppearing ? APPEAR : SPRING}
          className="pointer-events-none absolute inset-y-1 left-0 rounded-full bg-surface-muted"
        />
        {/* Positioned, so the links paint above the highlight. */}
        <ul className="relative flex">
          {items.map((item) => {
            const isActive = isCurrent(pathname, item.href)
            return (
              <li key={item.href} className="relative">
                {isActive && (
                  <motion.span
                    layoutId="nav-current"
                    aria-hidden="true"
                    transition={SPRING}
                    className="absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-brand-primary"
                  />
                )}
                {/* The highlight follows the pointer and keyboard focus alike. */}
                <div
                  role="presentation"
                  onMouseEnter={(event) => {
                    moveTo(event.currentTarget)
                  }}
                  onFocus={(event) => {
                    moveTo(event.currentTarget)
                  }}
                >
                  {item.groups ? (
                    <NavMenu
                      label={item.label}
                      href={item.href}
                      groups={item.groups}
                      showCurrent={false}
                    />
                  ) : (
                    // Tighter between xl and 2xl so nine items with German labels fit one row at 1280 px.
                    <NavLink
                      href={item.href}
                      section
                      showCurrent={false}
                      className="px-1.5 whitespace-nowrap hover:bg-transparent 2xl:px-3"
                    >
                      {item.label}
                    </NavLink>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
