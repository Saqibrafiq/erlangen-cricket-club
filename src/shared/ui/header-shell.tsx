'use client'

import { motion } from 'motion/react'
import { type ReactNode, useEffect, useState } from 'react'

import { usePathname } from '@/i18n/navigation'
import { cn } from '@/shared/lib/cn'
import { isHeaderFloating } from '@/shared/lib/header-scroll'

const SPRING = { type: 'spring', stiffness: 380, damping: 34 } as const

export type HeaderShellProps = {
  children: ReactNode
  /** A page whose first screen is a video or photo: at the top the header sits on it, in light text. */
  mediaHeroPath?: string
}

/**
 * The header's moving parts. At the top of the page a wide glass pill; once scrolled, it shrinks
 * into a compact floating pill (Motion layout animation) that stays in view while the page
 * scrolls. On the media hero page the wide pill lies on the media: `data-over-media` switches its
 * tokens to light-on-dark (globals.css). Under reduced motion the change happens without movement
 * (MotionProvider).
 */
export function HeaderShell({ children, mediaHeroPath }: HeaderShellProps) {
  const pathname = usePathname()
  const [isFloating, setIsFloating] = useState(false)
  const isOverMedia = pathname === mediaHeroPath && !isFloating

  useEffect(() => {
    const onScroll = () => {
      setIsFloating(isHeaderFloating(window.scrollY))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <header
      data-floating={isFloating}
      data-over-media={isOverMedia}
      className="group/header sticky top-0 z-30 text-text-default"
    >
      <motion.div
        layout
        transition={SPRING}
        // Radius as a style, so Motion keeps the corners round while the box resizes.
        style={{ borderRadius: 9999 }}
        className={cn(
          'mx-auto border border-border-default bg-surface-default/75 backdrop-blur-xl transition-colors duration-200',
          isFloating ? 'mt-3 w-floating-header shadow-lg' : 'mt-4 w-header shadow-md',
        )}
      >
        {children}
      </motion.div>
    </header>
  )
}
