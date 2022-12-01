/* Copyright 2021, Milkdown by Mirone. */
import type { Editor } from '@milkdown/core'
import { useCallback, useContext } from 'react'
import { editorInfoContext } from './useGetEditor'

export type Instance = [true, () => undefined] | [false, () => Editor]

export const useInstance = () => {
  const editorInfo = useContext(editorInfoContext)

  const getInstance = useCallback(() => {
    return editorInfo.editor.current
  }, [editorInfo.editor])

  return [editorInfo.loading, getInstance] as Instance
}
