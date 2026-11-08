import { useCallback, useEffect, useState } from 'react'

/** What an editor's server action returns when it loads data for a form. */
export type EditorLoadResult<T> =
  { status: 'ok'; data: T } | { status: 'unauthorized' } | { status: 'error' }

export type EditorLoadState<T> = { status: 'loading' } | EditorLoadResult<T>

const LOADING = { status: 'loading' } as const

/**
 * Loads an editor's data when it opens, and again on `reload` (after a failure). A result that
 * arrives after the editor closed or `load` changed is dropped. Pass a stable `load`
 * (`useCallback`). `initialState` skips the skeleton when the data is known at once (e.g. adding).
 */
export function useEditorLoad<T>(
  load: () => Promise<EditorLoadResult<T>>,
  initialState: EditorLoadState<T> = LOADING,
) {
  const [state, setState] = useState<EditorLoadState<T>>(initialState)

  const reload = useCallback(() => {
    setState({ status: 'loading' })
    void load().then(setState)
  }, [load])

  useEffect(() => {
    let isCurrent = true
    void load().then((result) => {
      if (isCurrent) setState(result)
    })
    return () => {
      isCurrent = false
    }
  }, [load])

  return { state, reload }
}
