'use client'

import type { ReactNode } from 'react'

import type { EditorLoadState } from '@/shared/lib/use-editor-load'

import { RetryAlert, SignInRequiredAlert } from './alert'

export type EditorLoadViewProps<T> = {
  state: EditorLoadState<T>
  /** Shaped like the form it stands in for, so nothing jumps when the form arrives. */
  skeleton: ReactNode
  /** What could not be loaded, e.g. "The player could not be loaded. Please try again." */
  loadError: string
  signInHref: string
  onRetry: () => void
  /** The form, once its data is there. */
  children: (data: T) => ReactNode
}

/** Every state of an editor that loads its data: loading, session ended, failed (retry), ready. */
export function EditorLoadView<T>({
  state,
  skeleton,
  loadError,
  signInHref,
  onRetry,
  children,
}: EditorLoadViewProps<T>) {
  switch (state.status) {
    case 'loading':
      return skeleton
    case 'unauthorized':
      return <SignInRequiredAlert signInHref={signInHref} />
    case 'error':
      return <RetryAlert message={loadError} onRetry={onRetry} />
    case 'ok':
      return children(state.data)
  }
}
