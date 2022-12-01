/* Copyright 2021, Milkdown by Mirone. */
import { useCallback, useContext } from 'react'
import { editorInfoContext } from './useGetEditor'

export const useInstance = () => {
  const editorInfo = useContext(editorInfoContext)

  const getInstance = useCallback(() => {
    return editorInfo.editor.current
  }, [editorInfo.editor])

  return [editorInfo.loading, getInstance] as const
}
