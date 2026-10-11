import { useEffect, useRef, useState } from 'react'

import { resizeImage } from '@/shared/lib/resize-image'

/** Cuts the player out of a photo (see cut-out-portrait.ts); injected so tests need no model. */
export type CutOut = (file: File) => Promise<File>

/** Loads the background removal only when a photo is chosen: it is large, and editors-only. */
export const cutOutWithModel: CutOut = async (file) => {
  const { cutOutPortrait } = await import('./cut-out-portrait')
  return cutOutPortrait(file)
}

export type PortraitStatus =
  /** No new photo chosen. */
  | 'none'
  /** Removing the background. */
  | 'processing'
  /** Cut out and framed like the other squad photos. */
  | 'cutOut'
  /** Background removal switched off: the photo is used as it is. */
  | 'asIs'
  /** Background removal failed: the photo is used as it is. */
  | 'failed'

type State = {
  status: PortraitStatus
  original: File | null
  cutOut: File | null
  /** Object URL of what the preview shows (the cut-out, else the original). */
  previewUrl: string | null
}

const NONE: State = { status: 'none', original: null, cutOut: null, previewUrl: null }

function toState(status: PortraitStatus, original: File, cutOut: File | null = null): State {
  return { status, original, cutOut, previewUrl: URL.createObjectURL(cutOut ?? original) }
}

/**
 * The photo chosen in the player form: removes its background automatically (unless switched
 * off), keeps a preview URL and hands the file to upload on save.
 */
export function usePortraitPhoto(cutOut: CutOut = cutOutWithModel) {
  const [state, setState] = useState<State>(NONE)
  const [shouldRemoveBackground, setShouldRemoveBackground] = useState(true)
  // Only the latest photo counts: an earlier one still processing is ignored when it finishes.
  const latest = useRef(0)

  // Release each preview's memory once it is replaced, and when the form closes.
  const { previewUrl } = state
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    },
    [previewUrl],
  )

  function process(file: File, removeBackground: boolean) {
    const request = ++latest.current
    if (!removeBackground) {
      setState(toState('asIs', file))
      return
    }
    setState(toState('processing', file))
    cutOut(file).then(
      (result) => {
        if (request === latest.current) {
          setState(toState('cutOut', file, result))
        }
      },
      () => {
        if (request === latest.current) {
          setState(toState('failed', file))
        }
      },
    )
  }

  return {
    status: state.status,
    previewUrl,
    shouldRemoveBackground,
    choose(file: File | null) {
      if (file) {
        process(file, shouldRemoveBackground)
      } else {
        latest.current++
        setState(NONE)
      }
    },
    setShouldRemoveBackground(removeBackground: boolean) {
      setShouldRemoveBackground(removeBackground)
      if (state.original) {
        process(state.original, removeBackground)
      }
    },
    /** The file to upload: the cut-out, or the photo shrunk as it is; `null` keeps the stored one. */
    async getUpload(): Promise<File | null> {
      if (state.cutOut) {
        return state.cutOut
      }
      return state.original ? resizeImage(state.original) : null
    },
  }
}
