import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { CONTACT_PATH } from '@/features/contact'
import { buildSponsorsJsonLd, getSponsors, SPONSORS_PATH, SponsorsView } from '@/features/sponsors'
import { resolveLocale } from '@/i18n/locale'
import { siteConfig } from '@/shared/config/site'
import { buildAlternates } from '@/shared/lib/seo'
import { Container } from '@/shared/ui/container'
import { JsonLd } from '@/shared/ui/json-ld'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/sponsors'>): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const t = await getTranslations({ locale, namespace: 'sponsors' })

  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: buildAlternates(SPONSORS_PATH, locale),
    openGraph: { title: t('title'), description: t('metaDescription') },
  }
}

export default async function SponsorsPage({ params }: PageProps<'/[locale]/sponsors'>) {
  const locale = await resolveLocale(params)
  const sponsors = await getSponsors(locale)

  return (
    <Container className="py-10">
      <SponsorsView sponsors={sponsors} contactHref={CONTACT_PATH} />
      <JsonLd
        data={buildSponsorsJsonLd(sponsors, { name: siteConfig.name, url: siteConfig.url })}
      />
    </Container>
  )
}
