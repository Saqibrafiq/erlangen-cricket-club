'use client'

import { ChevronDown, Menu, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Dialog } from 'radix-ui'
import { useId, useState } from 'react'

import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/shared/lib/cn'

import type { NavigationGroup, SiteNavigationItem } from './nav-menu'

const HOME_PATH = '/'

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
      onClick={onNavigate}
      className={cn(
        'flex min-h-12 items-center rounded-xl px-4 transition-colors duration-150 hover:bg-surface-muted',
        isNested ? 'text-base' : 'text-lg font-semibold',
        isCurrent && 'bg-surface-highlight font-semibold text-brand-primary',
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

  return (
    // Opens by itself on its own section, e.g. on a competition page.
    <details open={isInSection(pathname, item.href)} className="group">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between rounded-xl px-4 text-lg font-semibold transition-colors duration-150 hover:bg-surface-muted [&::-webkit-details-marker]:hidden">
        {item.label}
        <ChevronDown
          aria-hidden="true"
          className="size-5 text-text-muted transition-transform duration-150 group-open:rotate-180"
        />
      </summary>
      <div className="mt-1 mb-2 ml-4 space-y-2 border-l-2 border-border-default pl-2">
        {groups.map((group, index) => {
          const groupId = `${id}-${index}`
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
    </details>
  )
}

/**
 * The site navigation on phones and tablets: a button that opens a panel from the right. Radix
 * Dialog traps focus, closes on Escape or a tap outside, and returns focus to the button.
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
          className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors duration-150 hover:bg-surface-muted"
        >
          <Menu aria-hidden="true" className="size-5" />
          <span className="max-sm:sr-only">{t('menu')}</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-media-overlay/60 backdrop-blur-sm motion-safe:animate-fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-surface-default shadow-xl motion-safe:animate-slide-in-right sm:max-w-sm sm:border-l sm:border-border-default"
        >
          <div className="flex items-center justify-between border-b border-border-default py-2 pr-4 pl-7">
            <Dialog.Title className="font-display text-xl font-bold tracking-tight uppercase">
              {t('menu')}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={t('closeMenu')}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md transition-colors duration-150 hover:bg-surface-muted"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </Dialog.Close>
          </div>
          <nav aria-label={t('label')} className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.href}>
                  {item.groups ? (
                    <MenuSection item={item} groups={item.groups} onNavigate={close} />
                  ) : (
                    <MenuLink href={item.href} label={item.label} onNavigate={close} />
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
