'use client'

import { CircleUserRound, LoaderCircle, LogOut, Settings, UserPen } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { DropdownMenu, Popover } from 'radix-ui'
import { useCallback, useEffect, useState, useTransition } from 'react'

import { cn } from '@/shared/lib/cn'
import { useIsEditMode } from '@/shared/lib/edit-mode'
import { FLOATING_PANEL_MOTION } from '@/shared/lib/floating-panel-motion'
import { toast, toastAfterReload } from '@/shared/ui/toast'

import { type Account, getGreetingName, getInitials } from '../domain/account'
import { ADMIN_PATH } from '../domain/sign-in'
import type { AccountActions, AccountResult, SignInState } from '../sign-in-state'
import { SignInForm } from './sign-in-form'
import { rememberWelcome, takeWelcome } from './welcome'

// The profile form loads only when an editor opens it.
const ProfileSheet = dynamic(
  () => import('./profile-sheet').then((module) => module.ProfileSheet),
  { ssr: false },
)

export type AccountMenuProps = {
  /** The full sign-in page, for a session that ends while editing (e.g. from the profile). */
  loginHref: string
  actions: AccountActions
}

const ICON_BUTTON_CLASS =
  'inline-flex size-11 items-center justify-center rounded-full transition-colors duration-150 hover:bg-surface-muted data-[state=open]:bg-surface-muted'
const PANEL_CLASS =
  'z-50 rounded-2xl border border-border-default bg-surface-default text-text-default shadow-xl'
const ITEM_CLASS =
  'flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm font-medium outline-none select-none transition-colors duration-150 data-highlighted:bg-surface-muted data-disabled:cursor-default data-disabled:opacity-60 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-text-muted'

/** The avatar pops in when the account loads; changed initials cross-fade. */
function Avatar({ account, size }: { account: Account | null; size: 'sm' | 'lg' }) {
  const initials = account ? getInitials(account) : ''

  return (
    <motion.span
      aria-hidden="true"
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 460, damping: 24 }}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-primary font-semibold tracking-wide text-brand-on-primary',
        size === 'sm' ? 'size-9 text-sm' : 'size-11 text-base',
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={initials}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {initials}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  )
}

/**
 * For visitors: the account icon opens a small sign-in panel right in the header. Signing in
 * reloads the current page, now in edit mode.
 */
function SignInPopover({ signIn }: { signIn: AccountActions['signIn'] }) {
  const t = useTranslations('auth.account')
  const [isOpen, setIsOpen] = useState(false)
  // Read when the panel opens, so the editor comes back to the page they are on.
  const [returnTo, setReturnTo] = useState('/')
  // Signing in refreshes the page in place: the header swaps this panel for the avatar at once,
  // so the welcome is noted here, as soon as the sign-in succeeds.
  const signInAndWelcome = useCallback(
    async (state: SignInState, formData: FormData) => {
      const result = await signIn(state, formData)
      if (result.status === 'success') rememberWelcome()
      return result
    },
    [signIn],
  )

  return (
    <Popover.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (open) setReturnTo(`${window.location.pathname}${window.location.search}`)
        setIsOpen(open)
      }}
    >
      <Popover.Trigger
        aria-label={t('signIn')}
        title={t('signIn')}
        className={cn(ICON_BUTTON_CLASS, 'text-text-muted hover:text-text-default')}
      >
        <CircleUserRound aria-hidden="true" className="size-5" />
      </Popover.Trigger>
      <AnimatePresence>
        {isOpen && (
          <Popover.Portal forceMount>
            <Popover.Content
              forceMount
              asChild
              align="end"
              sideOffset={8}
              collisionPadding={16}
              aria-labelledby="sign-in-panel-title"
            >
              <motion.div
                {...FLOATING_PANEL_MOTION}
                style={{ transformOrigin: 'var(--radix-popover-content-transform-origin)' }}
                className={cn(PANEL_CLASS, 'w-[min(22rem,calc(100vw-2rem))] p-5')}
              >
                <h2 id="sign-in-panel-title" className="font-display text-xl font-bold uppercase">
                  {t('signInTitle')}
                </h2>
                <p className="mt-1 mb-4 text-sm text-text-muted">{t('signInText')}</p>
                <SignInForm action={signInAndWelcome} redirectTo={returnTo} />
              </motion.div>
            </Popover.Content>
          </Popover.Portal>
        )}
      </AnimatePresence>
    </Popover.Root>
  )
}

function SignedInMenu({ loginHref, actions }: AccountMenuProps) {
  const t = useTranslations('auth.account')
  const [result, setResult] = useState<AccountResult | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSigningOut, startSignOut] = useTransition()
  const { getAccount } = actions

  useEffect(() => {
    let isCurrent = true
    void getAccount().then((loaded) => {
      if (!isCurrent) return
      setResult(loaded)
      // Greet right after signing in, when the avatar appears: by first name, else email.
      if (loaded.status === 'ok' && takeWelcome()) {
        toast(t('welcome', { name: getGreetingName(loaded.account) }))
      }
    })
    return () => {
      isCurrent = false
    }
  }, [getAccount, t])

  // The session ended (e.g. it expired): sign in again from the same icon.
  if (result?.status === 'unauthorized') {
    return <SignInPopover signIn={actions.signIn} />
  }
  const account = result?.status === 'ok' ? result.account : null
  const displayName = account?.name ?? account?.email ?? ''

  return (
    <>
      {/* Not modal: a small menu shouldn't hide the whole page from assistive technology. */}
      <DropdownMenu.Root modal={false} open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenu.Trigger
          aria-label={account ? t('open', { name: displayName }) : t('openLoading')}
          className={ICON_BUTTON_CLASS}
        >
          {account ? (
            <Avatar account={account} size="sm" />
          ) : (
            <span
              aria-hidden="true"
              className="size-9 animate-pulse rounded-full bg-surface-muted"
            />
          )}
        </DropdownMenu.Trigger>
        <AnimatePresence>
          {isOpen && (
            <DropdownMenu.Portal forceMount>
              <DropdownMenu.Content
                forceMount
                asChild
                align="end"
                sideOffset={8}
                collisionPadding={16}
              >
                <motion.div
                  {...FLOATING_PANEL_MOTION}
                  style={{
                    transformOrigin: 'var(--radix-dropdown-menu-content-transform-origin)',
                  }}
                  className={cn(PANEL_CLASS, 'w-72 p-2')}
                >
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <Avatar account={account} size="lg" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{account?.name ?? t('noName')}</p>
                      <p className="truncate text-sm text-text-muted">{account?.email}</p>
                    </div>
                  </div>
                  <DropdownMenu.Separator className="my-1 h-px bg-border-default" />
                  <DropdownMenu.Item
                    className={ITEM_CLASS}
                    disabled={!account}
                    onSelect={() => {
                      setIsProfileOpen(true)
                    }}
                  >
                    <UserPen aria-hidden="true" />
                    {t('profile')}
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild className={ITEM_CLASS}>
                    {/* A plain link: the admin is another app, so a full page load is right. */}
                    <a href={ADMIN_PATH}>
                      <Settings aria-hidden="true" />
                      {t('admin')}
                    </a>
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="my-1 h-px bg-border-default" />
                  <DropdownMenu.Item
                    className={ITEM_CLASS}
                    disabled={isSigningOut}
                    onSelect={(event) => {
                      event.preventDefault()
                      startSignOut(async () => {
                        await actions.signOut()
                        toastAfterReload(t('signedOut'))
                        // Reload as a visitor: the static page without editing controls.
                        window.location.reload()
                      })
                    }}
                  >
                    {isSigningOut ? (
                      <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />
                    ) : (
                      <LogOut aria-hidden="true" />
                    )}
                    {isSigningOut ? t('signingOut') : t('signOut')}
                  </DropdownMenu.Item>
                </motion.div>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          )}
        </AnimatePresence>
      </DropdownMenu.Root>
      {isProfileOpen && account && (
        <ProfileSheet
          account={account}
          loginHref={loginHref}
          save={actions.saveAccount}
          onClose={() => {
            setIsProfileOpen(false)
          }}
          onSaved={(saved) => {
            setResult({ status: 'ok', account: saved })
            setIsProfileOpen(false)
            toast(t('profileSaved'))
          }}
        />
      )}
    </>
  )
}

/**
 * The header's account control. Visitors get an icon that opens a sign-in panel; a signed-in
 * editor gets an avatar with their initials and a menu: who is signed in, edit profile, admin
 * panel, sign out.
 */
export function AccountMenu(props: AccountMenuProps) {
  const isEditMode = useIsEditMode()

  return isEditMode ? <SignedInMenu {...props} /> : <SignInPopover signIn={props.actions.signIn} />
}
