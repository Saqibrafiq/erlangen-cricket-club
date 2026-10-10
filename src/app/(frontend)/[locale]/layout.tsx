import type { Metadata } from 'next'
import { Barlow_Condensed, Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getFormatter, getTranslations } from 'next-intl/server'

import {
  buildCompetitionMenu,
  type CompetitionMenuOptions,
  FIXTURES_PATH,
  getCompetitionNavigation,
  getCompetitionPath,
} from '@/features/fixtures'
import { CONTACT_PATH, getContactInfo, GROUND_SECTION_ID } from '@/features/contact'
import { JOURNEY_PATH } from '@/features/journey'
import { LEGAL_PATHS } from '@/features/legal'
import { getMembershipInfo, getWeekdayDate, MEMBERSHIP_PATH } from '@/features/membership'
import { NEWS_PATH } from '@/features/news'
import { PLAYERS_PATH } from '@/features/players'
import { SPONSORS_PATH } from '@/features/sponsors'
import { getStandingsPath, STANDINGS_PATH } from '@/features/standings'
import { resolveLocale } from '@/i18n/locale'
import { routing } from '@/i18n/routing'
import { MAIN_NAVIGATION } from '@/shared/config/navigation'
import { siteConfig } from '@/shared/config/site'
import { buildSportsOrganizationJsonLd, TITLE_TEMPLATE } from '@/shared/lib/seo'
import { JsonLd } from '@/shared/ui/json-ld'
import { MotionProvider } from '@/shared/ui/motion-provider'
import {
  type FooterColumn,
  type FooterVisit,
  SiteFooter,
  type SocialLink,
} from '@/shared/ui/site-footer'
import { SiteHeader, type SiteNavigationItem } from '@/shared/ui/site-header'
import { MAIN_CONTENT_ID, SkipLink } from '@/shared/ui/skip-link'

import '../globals.css'

// next/font self-hosts the font files at build time — no request to Google at runtime (GDPR).
const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })
// Condensed display face for headings and scores: sporty, and fits large numbers in narrow cards.
const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
  variable: '--font-barlow-condensed',
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: siteConfig.name, template: TITLE_TEMPLATE },
    description: t('siteDescription'),
    applicationName: siteConfig.name,
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      locale,
    },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const locale = await resolveLocale(params)
  const [t, tNavigation, tFooter, format, competitionNavigation, contact, membership] =
    await Promise.all([
      getTranslations({ locale, namespace: 'common' }),
      getTranslations({ locale, namespace: 'navigation' }),
      getTranslations({ locale, namespace: 'footer' }),
      getFormatter({ locale }),
      getCompetitionNavigation(),
      getContactInfo(locale),
      getMembershipInfo(locale),
    ])
  // Sections organised by competition get a dropdown: overview first, then competitions per team.
  const competitionMenus: Partial<Record<string, CompetitionMenuOptions>> = {
    [FIXTURES_PATH]: {
      overview: { href: FIXTURES_PATH, label: tNavigation('fixturesOverview') },
      competitionHref: getCompetitionPath,
    },
    [STANDINGS_PATH]: {
      overview: { href: STANDINGS_PATH, label: tNavigation('standingsOverview') },
      competitionHref: getStandingsPath,
    },
  }
  const navigationItems: SiteNavigationItem[] = MAIN_NAVIGATION.map((item) => {
    const menu = competitionMenus[item.href]
    return {
      href: item.href,
      label: tNavigation(item.labelKey),
      groups: menu ? buildCompetitionMenu(competitionNavigation, menu) : undefined,
    }
  })

  const footerColumns: FooterColumn[] = [
    {
      label: tFooter('columns.club'),
      links: [
        { href: PLAYERS_PATH, label: tNavigation('players') },
        { href: NEWS_PATH, label: tNavigation('news') },
        { href: JOURNEY_PATH, label: tNavigation('journey') },
        { href: SPONSORS_PATH, label: tNavigation('sponsors') },
      ],
    },
    {
      label: tFooter('columns.matches'),
      links: [
        { href: FIXTURES_PATH, label: tNavigation('fixtures') },
        { href: STANDINGS_PATH, label: tNavigation('standings') },
      ],
    },
    {
      label: tFooter('columns.join'),
      links: [
        { href: MEMBERSHIP_PATH, label: tNavigation('membership') },
        { href: CONTACT_PATH, label: tNavigation('contact') },
      ],
    },
  ]
  // The first session in the admin is the weekly training (match days follow).
  const [training] = membership.sessions
  const [trainingDay] = training?.days ?? []
  const visit: FooterVisit = {
    training:
      training && trainingDay
        ? `${format.dateTime(getWeekdayDate(trainingDay), { weekday: 'long' })} ${training.startTime}–${training.endTime}`
        : null,
    ground: contact.ground && {
      name: contact.ground.name,
      address: `${contact.ground.street}, ${contact.ground.postalCode} ${contact.ground.city}`,
      href: `${CONTACT_PATH}#${GROUND_SECTION_ID}`,
    },
    email: contact.email,
  }

  const socialLinks: SocialLink[] = [
    ...(contact.instagramUrl
      ? [{ network: 'instagram' as const, href: contact.instagramUrl }]
      : []),
    ...(contact.facebookUrl ? [{ network: 'facebook' as const, href: contact.facebookUrl }] : []),
  ]

  return (
    <html lang={locale} className={`${inter.variable} ${barlowCondensed.variable}`}>
      <body className="flex min-h-svh flex-col">
        <SkipLink>{t('skipToContent')}</SkipLink>
        <NextIntlClientProvider>
          <MotionProvider>
            <SiteHeader items={navigationItems} />
            <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 focus:outline-none">
              {children}
            </main>
            <SiteFooter
              year={new Date().getFullYear()}
              socialLinks={socialLinks}
              columns={footerColumns}
              visit={visit}
              legalLinks={[
                { href: LEGAL_PATHS.impressum, label: tFooter('impressum') },
                { href: LEGAL_PATHS.privacy, label: tFooter('privacy') },
              ]}
            />
          </MotionProvider>
        </NextIntlClientProvider>
        <JsonLd data={buildSportsOrganizationJsonLd()} />
      </body>
    </html>
  )
}
