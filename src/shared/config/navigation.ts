import type en from '@/i18n/messages/en.json'

export type NavigationItem = {
  href: string
  labelKey: Exclude<
    keyof (typeof en)['navigation'],
    'label' | 'languageLabel' | 'fixturesOverview' | 'standingsOverview' | 'menu' | 'closeMenu'
  >
}

export const MAIN_NAVIGATION: readonly NavigationItem[] = [
  { href: '/', labelKey: 'home' },
  { href: '/fixtures', labelKey: 'fixtures' },
  { href: '/standings', labelKey: 'standings' },
  { href: '/players', labelKey: 'players' },
  { href: '/news', labelKey: 'news' },
  { href: '/journey', labelKey: 'journey' },
  { href: '/sponsors', labelKey: 'sponsors' },
  { href: '/membership', labelKey: 'membership' },
  { href: '/contact', labelKey: 'contact' },
]
