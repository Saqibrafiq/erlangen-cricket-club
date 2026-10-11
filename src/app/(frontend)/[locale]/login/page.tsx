import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import {
  CREATE_FIRST_USER_PATH,
  enterEditModeAction,
  getSafeRedirectPath,
  getSignedInEmail,
  hasAdminAccount,
  REDIRECT_PARAM,
  SignedInView,
  signInAction,
  SignInView,
  signOutAction,
} from '@/features/auth'
import { resolveLocale } from '@/i18n/locale'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/login'>): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const t = await getTranslations({ locale, namespace: 'auth.signIn' })

  return {
    title: t('title'),
    // An editors' door, not content: keep it out of search results.
    robots: { index: false, follow: false },
  }
}

export default async function LoginPage({ params, searchParams }: PageProps<'/[locale]/login'>) {
  await resolveLocale(params)
  const redirectTo = getSafeRedirectPath((await searchParams)[REDIRECT_PARAM])

  // A fresh database has no account to sign in with: create the first one (Payload's page).
  if (!(await hasAdminAccount())) {
    redirect(CREATE_FIRST_USER_PATH)
  }
  // Already signed in: offer edit mode (the hint cookie may be missing) or signing out.
  const email = await getSignedInEmail()
  if (email) {
    return (
      <SignedInView
        email={email}
        redirectTo={redirectTo}
        enterEditMode={enterEditModeAction}
        signOut={signOutAction}
      />
    )
  }

  return <SignInView action={signInAction} redirectTo={redirectTo} />
}
