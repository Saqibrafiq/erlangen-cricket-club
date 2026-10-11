import { useTranslations } from 'next-intl'

import type { SignInState } from '../sign-in-state'
import { AuthCard } from './auth-card'
import { SignInForm } from './sign-in-form'

export type SignInViewProps = {
  action: (state: SignInState, formData: FormData) => Promise<SignInState>
  redirectTo: string
}

/** The club's sign-in page: one card on the brand background, for editors only. */
export function SignInView({ action, redirectTo }: SignInViewProps) {
  const t = useTranslations('auth.signIn')

  return (
    <AuthCard title={t('title')} intro={t('intro')}>
      <SignInForm action={action} redirectTo={redirectTo} />
    </AuthCard>
  )
}
