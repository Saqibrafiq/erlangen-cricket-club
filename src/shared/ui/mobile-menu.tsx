'use client'

import { ChevronDown, Menu, X } from 'lucide-react'
import { AnimatePresence, motion, type Variants } from 'motion/react'
import { useTranslations } from 'next-intl'
import { Dialog } from 'radix-ui'
import { useId, useState } from 'react'

import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/shared/lib/cn'
import { scrollToTop } from '@/shared/lib/scroll-to-top'

import type { NavigationGroup, SiteNavigationItem } from './nav-menu'

const HOME_PATH = '/'

const SPRING = { type: 'spring', stiffness: 380, damping: 34 } as const
/** The panel drops in from the top; the links follow one after another. */
const PANEL_VARIANTS: Variants = {
  closed: { opacity: 0, y: -24 },
  open: {
    opacity: 1,
    y: 0,
    transition: { ...SPRING, staggerChildren: 0.045, delayChildren: 0.06 },
  },
  exit: { opacity: 0, y: -16, transition: { duration: 0.18, ease: 'easeIn' } },
}
const ITEM_VARIANTS: Variants = {
  closed: { opacity: 0, y: 14 },
  open: { opacity: 1, y: 0, transition: SPRING },
}

export type MobileMenuProps = {
  items: readonly SiteNavigationItem[]
}

function isInSection(pathname: string, href: string): boolean {
  return href !== HOME_PATH && (pathname === href || pathname.startsWith(`${href}/`))
}

type MenuLinkProps = {
  href: string
  label: string
  isNested?: boolean
  onNavigate: () => void
}

function MenuLink({ href, label, isNested = false, onNavigate }: MenuLinkProps) {
  const pathname = usePathname()
  const isPage = pathname === href
  // Top-level links also mark their section, e.g. "News" on a news article.
  const isCurrent = isPage || (!isNested && isInSection(pathname, href))

  return (
    <Link
      href={href}
      aria-current={isPage ? 'page' : isCurrent ? 'true' : undefined}
      onClick={() => {
        onNavigate()
        // Already here: back to the top instead of nothing happening.
        if (isPage) scrollToTop()
      }}
      className={cn(
        'flex min-h-12 items-center rounded-2xl px-4 transition-colors duration-150 hover:bg-surface-muted',
        isNested ? 'text-base' : 'font-display text-2xl font-bold tracking-tight uppercase',
        isCurrent && 'bg-surface-highlight text-brand-primary',
      )}
    >
      {label}
    </Link>
  )
}

function MenuSection({
  item,
  groups,
  onNavigate,
}: {
  item: SiteNavigationItem
  groups: readonly NavigationGroup[]
  onNavigate: () => void
}) {
  const pathname = usePathname()
  const id = useId()
  // Opens by itself on its own section, e.g. on a competition page.
  const [isOpen, setIsOpen] = useState(() => isInSection(pathname, item.href))
  const panelId = `${id}-panel`

  return (
    <div>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        onClick={() => {
          setIsOpen((open) => !open)
        }}
        className="flex min-h-12 w-full items-center justify-between rounded-2xl px-4 font-display text-2xl font-bold tracking-tight uppercase transition-colors duration-150 hover:bg-surface-muted"
      >
        {item.label}
        <motion.span
          aria-hidden="true"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={SPRING}
          className="inline-flex text-text-muted"
        >
          <ChevronDown className="size-6" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={SPRING}
            className="overflow-hidden"
          >
            <div className="mt-1 mb-2 ml-4 space-y-2 border-l-2 border-brand-primary/40 pl-2">
              {groups.map((group, index) => {
                const groupId = `${id}-${String(index)}`
                return (
                  <div key={group.label ?? index}>
                    {group.label && (
                      <p
                        id={groupId}
                        className="px-4 pt-2 pb-1 text-xs font-semibold tracking-wide text-text-muted uppercase"
                      >
                        {group.label}
                      </p>
                    )}
                    <ul aria-labelledby={group.label ? groupId : undefined}>
                      {group.links.map((link) => (
                        <li key={link.href}>
                          <MenuLink
                            href={link.href}
                            label={link.label}
                            isNested
                            onNavigate={onNavigate}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * The site navigation on phones and tablets: a full-screen glass panel with big links that slide
 * in one after another. Radix Dialog traps focus, closes on Escape, and returns focus to the
 * button; Motion animates opening and closing.
 */
export function MobileMenu({ items }: MobileMenuProps) {
  const t = useTranslations('navigation')
  const [isOpen, setIsOpen] = useState(false)
  const close = () => {
    setIsOpen(false)
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-sm font-medium transition-colors duration-150 hover:bg-surface-muted"
        >
          <Menu aria-hidden="true" className="size-5" />
          <span className="max-sm:sr-only">{t('menu')}</span>
        </button>
      </Dialog.Trigger>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay forceMount asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-media-overlay/40 backdrop-blur-md"
              />
            </Dialog.Overlay>
            <Dialog.Content forceMount asChild aria-describedby={undefined}>
              <motion.div
                variants={PANEL_VARIANTS}
                initial="closed"
                animate="open"
                exit="exit"
                className="fixed inset-x-3 top-3 bottom-3 z-50 flex flex-col overflow-hidden rounded-3xl border border-border-default bg-surface-default/90 shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:right-3 sm:w-96"
              >
                <div className="flex items-center justify-between py-3 pr-3 pl-7">
                  <Dialog.Title className="font-display text-xl font-bold tracking-tight text-text-muted uppercase">
                    {t('menu')}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      aria-label={t('closeMenu')}
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full transition-colors duration-150 hover:bg-surface-muted"
                    >
                      <X aria-hidden="true" className="size-5" />
                    </button>
                  </Dialog.Close>
                </div>
                <nav aria-label={t('label')} className="flex-1 overflow-y-auto px-3 pb-6">
                  <ul className="space-y-1">
                    {items.map((item) => (
                      <motion.li key={item.href} variants={ITEM_VARIANTS}>
                        {item.groups ? (
                          <MenuSection item={item} groups={item.groups} onNavigate={close} />
                        ) : (
                          <MenuLink href={item.href} label={item.label} onNavigate={close} />
                        )}
                      </motion.li>
                    ))}
                  </ul>
                </nav>
                {/* The kit's gradient closes the panel, like the stripe under the header. */}
                <div
                  aria-hidden="true"
                  className="h-1 bg-linear-to-r from-brand-primary via-brand-primary/60 to-led"
                />
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
