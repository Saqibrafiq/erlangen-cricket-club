import type en from '@/i18n/messages/en.json'

export type NavigationItem = {
  href: string
  labelKey: Exclude<keyof (typeof en)['navigation'], 'label'>
}

export const MAIN_NAVIGATION: readonly NavigationItem[] = [
  { href: '/', labelKey: 'home' },
  { href: '/fixtures', labelKey: 'fixtures' },
]
