import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { getJourney, JOURNEY_PATH, JourneyView } from '@/features/journey'
import { MEMBERSHIP_PATH } from '@/features/membership'
import { resolveLocale } from '@/i18n/locale'
import { buildAlternates } from '@/shared/lib/seo'
import { Container } from '@/shared/ui/container'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/journey'>): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const t = await getTranslations({ locale, namespace: 'journey' })

  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: buildAlternates(JOURNEY_PATH, locale),
    openGraph: { title: t('title'), description: t('metaDescription') },
  }
}

export default async function JourneyPage({ params }: PageProps<'/[locale]/journey'>) {
  const locale = await resolveLocale(params)
  const info = await getJourney(locale)

  return (
    <Container className="py-10">
      <JourneyView info={info} membershipHref={MEMBERSHIP_PATH} />
    </Container>
  )
}
