import Image from 'next/image'
import { useTranslations } from 'next-intl'

import logo from '@/shared/assets/ecc-logo.png'

import type { SignInState } from '../sign-in-state'
import { SignInForm } from './sign-in-form'

// Intrinsic size of the crest asset (see SiteHeader).
const LOGO_WIDTH = 150
const LOGO_HEIGHT = 192

export type SignInViewProps = {
  action: (state: SignInState, formData: FormData) => Promise<SignInState>
  redirectTo: string
}

/** The club's sign-in page: one card on the brand background, for editors only. */
export function SignInView({ action, redirectTo }: SignInViewProps) {
  const t = useTranslations('auth.signIn')

  return (
    <section className="relative isolate flex min-h-hero items-center justify-center overflow-hidden bg-linear-to-br from-brand-surface to-media-overlay px-4 py-12">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-dots-on-media" />
      <div className="w-full max-w-md rounded-2xl bg-surface-default p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image
            src={logo}
            alt=""
            width={LOGO_WIDTH}
            height={LOGO_HEIGHT}
            className="h-16 w-auto"
          />
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight uppercase">
            {t('title')}
          </h1>
          <p className="mt-1 text-text-muted">{t('intro')}</p>
        </div>
        <SignInForm action={action} redirectTo={redirectTo} />
      </div>
    </section>
  )
}
