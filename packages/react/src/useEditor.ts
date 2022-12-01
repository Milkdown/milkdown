/* Copyright 2021, Milkdown by Mirone. */
import type { DependencyList } from 'react'
import { useCallback, useContext, useLayoutEffect } from 'react'

import type { GetEditor, UseEditorReturn } from './types'
import { editorInfoContext } from './useGetEditor'

export const useEditor = (getEditor: GetEditor, deps: DependencyList = []): UseEditorReturn => {
  const editorInfo = useContext(editorInfoContext)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const factory = useCallback(getEditor, deps)

  useLayoutEffect(() => {
    editorInfo.setEditorFactory(() => factory)
  }, [editorInfo, factory])

  return {
    loading: editorInfo.loading,
    get: () => editorInfo.editor.current,
  }
}
