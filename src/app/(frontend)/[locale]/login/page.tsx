import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import {
  CREATE_FIRST_USER_PATH,
  getSafeRedirectPath,
  hasAdminAccount,
  isSignedIn,
  REDIRECT_PARAM,
  signInAction,
  SignInView,
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
  // Already signed in: the admin icon is a shortcut straight to the admin.
  if (await isSignedIn()) {
    redirect(redirectTo)
  }

  return <SignInView action={signInAction} redirectTo={redirectTo} />
}
