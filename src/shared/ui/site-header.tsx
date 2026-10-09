import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import logo from '@/shared/assets/ecc-logo.png'
import { siteConfig } from '@/shared/config/site'

import { Container } from './container'
import { LocaleSwitcher } from './locale-switcher'
import { MobileMenu } from './mobile-menu'
import { NavLink } from './nav-link'
import { NavMenu, type SiteNavigationItem } from './nav-menu'

export type { SiteNavigationItem } from './nav-menu'

// Intrinsic size of the crest asset, so tests and Storybook (where an image import is only a URL) get it too.
const LOGO_WIDTH = 150
const LOGO_HEIGHT = 192

export type SiteHeaderProps = {
  items: readonly SiteNavigationItem[]
}

/**
 * One slim sticky row: crest and club name (crest only on phones), navigation, languages. From xl the navigation sits in the row; below
 * that it moves into the menu panel, so the header never wraps (nine items, long German labels).
 */
export function SiteHeader({ items }: SiteHeaderProps) {
  const t = useTranslations('navigation')

  return (
    <header className="sticky top-0 z-30 border-b border-border-default bg-surface-default/85 backdrop-blur-md">
      <Container className="flex items-center justify-between gap-x-4 py-2 2xl:gap-x-6">
        <Link
          href="/"
          className="inline-flex min-h-11 shrink-0 items-center gap-3 rounded-md font-display text-xl font-bold tracking-tight whitespace-nowrap uppercase"
        >
          {/* Decorative: the club name next to it names the link (visually hidden on phones). */}
          <Image
            src={logo}
            alt=""
            width={LOGO_WIDTH}
            height={LOGO_HEIGHT}
            priority
            className="h-12 w-auto"
          />
          <span className="max-sm:sr-only">{siteConfig.name}</span>
        </Link>
        <nav aria-label={t('label')} className="ml-auto hidden xl:block">
          <ul className="flex">
            {items.map((item) => (
              <li key={item.href}>
                {item.groups ? (
                  <NavMenu label={item.label} href={item.href} groups={item.groups} />
                ) : (
                  // Tighter between xl and 2xl so nine items with German labels fit one row at 1280 px.
                  <NavLink href={item.href} section className="px-1.5 whitespace-nowrap 2xl:px-3">
                    {item.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1">
          <LocaleSwitcher />
          <div className="xl:hidden">
            <MobileMenu items={items} />
          </div>
        </div>
      </Container>
    </header>
  )
}
