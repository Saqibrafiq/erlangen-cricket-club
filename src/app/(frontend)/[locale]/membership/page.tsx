import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { CONTACT_PATH, GROUND_SECTION_ID } from '@/features/contact'
import { getMembershipInfo, MEMBERSHIP_PATH, MembershipView } from '@/features/membership'
import { resolveLocale } from '@/i18n/locale'
import { buildAlternates } from '@/shared/lib/seo'
import { Container } from '@/shared/ui/container'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/membership'>): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const t = await getTranslations({ locale, namespace: 'membership' })

  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: buildAlternates(MEMBERSHIP_PATH, locale),
    openGraph: { title: t('title'), description: t('metaDescription') },
  }
}

export default async function MembershipPage({ params }: PageProps<'/[locale]/membership'>) {
  const locale = await resolveLocale(params)
  const info = await getMembershipInfo(locale)

  return (
    <Container className="py-6 sm:py-10">
      <MembershipView
        info={info}
        contactHref={CONTACT_PATH}
        directionsHref={`${CONTACT_PATH}#${GROUND_SECTION_ID}`}
      />
    </Container>
  )
}
