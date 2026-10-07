import type en from '@/i18n/messages/en.json'

export type NavigationItem = {
  href: string
  labelKey: Exclude<
    keyof (typeof en)['navigation'],
    'label' | 'languageLabel' | 'fixturesOverview' | 'standingsOverview'
  >
}

export const MAIN_NAVIGATION: readonly NavigationItem[] = [
  { href: '/', labelKey: 'home' },
  { href: '/fixtures', labelKey: 'fixtures' },
  { href: '/standings', labelKey: 'standings' },
  { href: '/news', labelKey: 'news' },
  { href: '/membership', labelKey: 'membership' },
  { href: '/contact', labelKey: 'contact' },
]
