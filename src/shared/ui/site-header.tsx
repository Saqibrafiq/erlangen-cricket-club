import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'

import logo from '@/shared/assets/ecc-logo.png'
import { siteConfig } from '@/shared/config/site'

import { Container } from './container'
import { HomeLink } from './home-link'
import { LocaleSwitcher } from './locale-switcher'
import { MobileMenu } from './mobile-menu'
import { DesktopNav } from './desktop-nav'
import { HeaderShell } from './header-shell'
import type { SiteNavigationItem } from './nav-menu'
import { ThemeSwitcher } from './theme-switcher'

export type { SiteNavigationItem } from './nav-menu'

// Intrinsic size of the crest asset, so tests and Storybook (where an image import is only a URL) get it too.
const LOGO_WIDTH = 150
const LOGO_HEIGHT = 192

export type SiteHeaderProps = {
  items: readonly SiteNavigationItem[]
  /** The account control next to the language switch: a sign-in icon, or the signed-in menu. */
  account?: ReactNode
  /** The page whose first screen is a video: the header lies on it at the top (HeaderShell). */
  mediaHeroPath?: string
}

/**
 * One slim sticky row: crest and club name (crest only on phones), navigation, languages; once
 * scrolled it floats as a glass pill (HeaderShell). From xl the navigation sits in the row; below
 * that it moves into the menu panel, so the header never wraps (nine items, long German labels).
 */
export function SiteHeader({ items, account, mediaHeroPath }: SiteHeaderProps) {
  const t = useTranslations('navigation')

  return (
    <HeaderShell mediaHeroPath={mediaHeroPath}>
      <Container className="flex items-center justify-between gap-x-4 py-2 transition-[padding] duration-200 group-data-[floating=true]/header:py-1 2xl:gap-x-6">
        <HomeLink className="inline-flex min-h-11 shrink-0 items-center gap-3 rounded-md font-display text-xl font-bold tracking-tight whitespace-nowrap uppercase">
          {/* Decorative: the club name next to it names the link (visually hidden on phones). */}
          <Image
            src={logo}
            alt=""
            width={LOGO_WIDTH}
            height={LOGO_HEIGHT}
            priority
            className="h-12 w-auto transition-[height] duration-200 group-data-[floating=true]/header:h-9"
          />
          {/* Folds away in the floating pill (visually only: it still names the link). */}
          <span className="group-data-[floating=true]/header:sr-only max-sm:sr-only">
            {siteConfig.name}
          </span>
        </HomeLink>
        <DesktopNav label={t('label')} items={items} />
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          {/* Icon buttons together, apart from the language pill. */}
          <div className="flex items-center">
            <ThemeSwitcher />
            {account}
          </div>
          <div className="xl:hidden">
            <MobileMenu items={items} />
          </div>
        </div>
      </Container>
    </HeaderShell>
  )
}
