'use client'

// A client component on purpose: not-found renders without route params, so server-side
// translations would read headers() — which fails when a statically generated route (e.g. an
// unknown competition slug) calls notFound(). Messages come from the layout's provider instead.
// Next adds `noindex` to 404 responses automatically.
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { siteConfig } from '@/shared/config/site'
import { Button } from '@/shared/ui/button'
import { Container } from '@/shared/ui/container'

export default function NotFoundPage() {
  const t = useTranslations('notFound')

  return (
    <Container asChild>
      <section className="flex flex-col items-start gap-4 py-16">
        <title>{`${t('title')} | ${siteConfig.name}`}</title>
        <h1 className="text-3xl font-bold tracking-tight">{t('heading')}</h1>
        <p className="text-text-muted">{t('description')}</p>
        <Button asChild>
          <Link href="/">{t('backHome')}</Link>
        </Button>
      </section>
    </Container>
  )
}
