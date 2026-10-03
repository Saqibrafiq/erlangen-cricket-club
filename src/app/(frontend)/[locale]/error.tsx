'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@/shared/ui/button'
import { Container } from '@/shared/ui/container'

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

/** Route-level error boundary for all localised pages. Details are logged server-side, never shown. */
export default function ErrorPage({ reset }: ErrorPageProps) {
  const t = useTranslations('error')

  return (
    <Container asChild>
      <section role="alert" className="flex flex-col items-start gap-4 py-16">
        <h1 className="text-3xl font-bold tracking-tight">{t('heading')}</h1>
        <p className="text-text-muted">{t('description')}</p>
        <Button onClick={reset}>{t('retry')}</Button>
      </section>
    </Container>
  )
}
